DepthAreasPane.prototype = Object.create (ConfigurablePane.prototype);

function DepthAreasPane (parent, callbacks, options)
{
    this.options   = Cary.tools.isNothing (options) ? {} : options;
    this.callbacks = Cary.tools.isNothing (callbacks) ? {} : callbacks;
    
    ConfigurablePane.apply (this, [parent, stringTable.depthAreas, { bottom: 5, left: 5, right: 5, height: 200, absolute: true }, this.callbacks]);
}

DepthAreasPane.prototype.onInitialize = function ()
{
    var instance = this;
    var columns  = [{ title: stringTable.areaName, width: 160, onItemClick: showArea },
                    { title: stringTable.maxDrg, width: 70, onItemClick: showUpdates },
                    { htmlTitle: '<img src="res/clip16.png" />', width: 22, onItemClick: showAttachments }];
    var selArea  = null;
    var mapObj   = map.map;
    var areaList;
    var callbacks = { onMouseOver: activateArea/*, onMouseOut: deactivateArea*/ };
    
    this.callbacks = callbacks;
    
    userObj.realertAreas = function () { depthAreas.drawAllAlerted (callbacks); };
    
    ConfigurablePane.prototype.onInitialize.apply (this, arguments);
    
    new Cary.tools.WaitForCondition (function () { return depthAreas !== null && depthAreas.objects.length > 0; }, 
                                     function ()
                                     {
                                        areaList = new Cary.ui.ListView ({ parent: instance.wnd, columns: columns, visible: true },
                                                                         { position: 'absolute', right: 2, top: 25, left: 0, height: parseInt (instance.wnd.style.height) - 20 });

                                        depthAreas.drawAllAlerted (callbacks);
                                        depthAreas.enumerate (addArea);
                                     });
    /*setTimeout (function ()
                {
                    areaList = new Cary.ui.ListView ({ parent: instance.wnd, columns: columns, visible: true },
                                                     { position: 'absolute', right: 2, top: 25, left: 0, height: parseInt (instance.wnd.style.height) - 20 });

                    depthAreas.drawAllAlerted (callbacks);
                    depthAreas.enumerate (addArea);
                }, 500);*/
    
    this.callbacks.onEditSettings = showSettingsMenu;

    function showSettingsMenu (instance)
    {
        var items = [{ text: stringTable.applyUpdates, action: onApplyUpdates }, { text: stringTable.showTimeline, action: onTimelineShow }, { text: stringTable.cancel2, action: onCancelMenu }];
        var menu  = new Cary.ui.PopUpMenu ({ anchorElement: instance.settingsButton, anchorType: (Cary.ui.anchor.TOP | Cary.ui.anchor.LEFT), items: items  },
                                           { width: 'fit-content', 'padding-left': 10, 'padding-right': 10 });
        
        menu.show (true);
        
        function onTimelineShow ()
        {
            var timelinePane = new TimelinePane (document.getElementById ('rightPane'), {}, { visible: true });
            
            timelinePane.show ();
        }
        
        function onCancelMenu ()
        {
            menu.show (false);
        }
    }
    
    function onApplyUpdates ()
    {
        var fileBrowser = new Cary.tools.FileBroswer (instance.wnd, { onSelect: onFileSelected }, Cary.tools.FileBroswer.readAsBuffer/*readAsText*/);
        
        fileBrowser.execute ();
        
        function onFileSelected (result)
        {
            var string  = new TextDecoder ('cp1251').decode (new Uint8Array (result));
            var lines   = string.split ('\r\n');
            var updates = [];
            var updList = new log.UpdateList ();
            var i;
            
            lines.forEach (function (line)
                           {
                               var parts = line.split (',');
                               
                               if (parts.length > 1)
                                   updates.push ({ name: parts [0], depth: parseFloat (parts [1])});
                           });

            updates.forEach (function (update)
                             {
                                 var desc = { action: log.actions.DRAFT_CHANGED, subject: null, oldValue: null, newValue: update.depth };
                                 var count;
                                 var data;

                                 // Find an appropriate contour, get old value and id from the list
                                 for (i = 0, count = areaList.getItemCount (); i < count; ++ i)
                                 {
                                     data = areaList.getItemData (i);
                                     
                                     if (data.name === update.name)
                                     {
                                         desc.oldValue = areaList.getItemText (i, 1);
                                         desc.subject  = data.id;
                                         
                                         break;
                                     }
                                 }
                                 
                                 updList.add (desc);
                             });
            
            // Remove updates that could not be applied (with no actual subject found)
            for (i = updList.updates.length - 1; i >= 0; -- i)
            {
                if (!updList.updates [i].subject)
                    updList.updates.splice (i, 1);
            }
            
            Cary.tools.sendRequest ({ url: 'requests/upd_depths.php', mathod: Cary.tools.methods.get, content: Cary.tools.contentTypes.json, onLoad: onLoad,
                                      resType: Cary.tools.resTypes.plain, param: updates });
            Cary.tools.sendRequest ({ url: 'requests/upd_reg.php', mathod: Cary.tools.methods.post, content: Cary.tools.contentTypes.json, onLoad: onUpdateRegistered,
                                      resType: Cary.tools.resTypes.json, param: updList.serialize () });
            
            function onUpdateRegistered (result)
            {
            }
            
            function onLoad ()
            {
                updates.forEach (function (update)
                                 {
                                     var i, count;

                                     for (i = 0, count = areaList.getItemCount (); i < count; ++ i)
                                     {
                                         if (areaList.getItemText (i, 0) === update.name)
                                         {
                                             areaList.setItemText (i, 1, update.depth.toFixed (1)); break;
                                         }
                                     }
                                 });
            }
        }
    }
    
    function activateArea (object, event)
    {
        //map.showUserObjectCollection (depthAreas, false);
        
        if (settings.enableAreaActivation && selArea !== object)
        {
            var index = depthAreas.findIndex (object);

            if (index >= 0)
            {
                showArea (index);
                
                areaList.selectItem (index);
            }
        }
    }
    
    function deactivateArea (object, event)
    {
    }
    
    function addArea (area)
    {
        var maxDraught = area.userProps ['maxDraught'];
        var columnData;
        
        if (typeof (maxDraught) === 'number')
            maxDraught = maxDraught.toFixed (1);
        
        columnData = [area.name, maxDraught];
        
        if (area.attachments.length > 0)
            columnData.push (area.attachments.length.toString ());
        
        areaList.addItem (columnData, area);
    }
    
    function showAttachments (areaNo, col, item)
    {
        var area = areaList.getItemData (areaNo);
        
        switch (area.attachments.length)
        {
            case 0:
            {
                return;
            }
            
            case 1:
            {
                showAttachment (0); break;
            }
                
            default:
            {
                var items = [];
                var menu;
                var i;
                
                for (i = 0; i < area.attachments.length; ++ i)
                    items.push ({ text: area.attachments [i].name, param: i, action: function (param) { showAttachment (param); } });
        
                menu = new Cary.ui.PopUpMenu ({ anchorElement: item.itemDiv, anchorType: (Cary.ui.anchor.BOTTOM | Cary.ui.anchor.LEFT), items: items  }, { width: 170 });

                menu.show (true);
            }
        }
        
        function showAttachment (attachNo)
        {
            var attachment = area.attachments [attachNo];
            
            new Cary.ui.BrowserWnd (null, { link: attachment.data, width: 1000 });
        }
    }
    
    function showUpdates (areaNo)
    {
        var area = areaList.getItemData (areaNo);
        
        if (area)
        {
            new UpdateHistoryWnd (area);
        }
    }
    
    function showArea (areaNo)
    {
        var area = areaList.getItemData (areaNo);
        var bounds;
     
        if (selArea !== null)
            selArea.deselect ();
        
        selArea = area;
        
        selArea.selected = true;
        
        if (!Cary.tools.isNothing (area.userInfo))
            objectEditorPane.moreInfoPane.showInfo (true, area.userInfo);
        else
            objectEditorPane.moreInfoPane.showInfo (false);
            
        bounds = Cary.maps.getBounds (area.points);
        
        if (mapObj.getZoom () < 16)
            mapObj.setZoom (16);
        
        setTimeout (function ()
                    {
                        if (!mapObj.getBounds ().contains ({ lat: area.points [0].lat, lng: area.points [0].lon }))
                        {
                            mapObj.setCenter (bounds.getCenter ());
                            mapObj.panToBounds (bounds);
                            mapObj.panBy (1, 1);
                        }
                    }, 500);
                    
        setTimeout (function () { area.deselect (); }, 5000);
    }
};
