function UserLayerEditor (parent, callbacks, layer)
{
    this.changed = false;
    
    if (Cary.tools.isNothing (layer))
        layer = new Cary.userObjects.ObjectCollection;
    
    this.layer = layer;
    
    SidePane.apply (this, [callbacks, { parent: parent, noCloseIcon: false, title: stringTable.layerEditor }]);
}

UserLayerEditor.prototype = Object.create (SidePane.prototype);

UserLayerEditor.prototype.close = function (quiet)
{
    map.showUserObjectCollection (this.layer, false);
        
    SidePane.prototype.close.apply (this, arguments);
};

UserLayerEditor.prototype.onInitialize = function ()
{
    var buttonBlock = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, anchor: Cary.ui.anchor.BOTTOM });
    var nameBlock   = new Cary.ui.ControlBlock ({ text: 'Name', parent: this.client, visible: true, anchor: Cary.ui.anchor.TOP },
                                                { height: 20, 'line-height': 22, 'text-align': 'left', padding: 10 });
    var buttonStyle = { width: 'fit-content', height: 30, float: 'right', padding: 5 };
    var instance    = this;
    var columns     = [{title: stringTable.objName, width: 150 }, { title: stringTable.type, width: 120 }];
    var addMenu     = [{ text: stringTable.icon, action: addUserIcon },
                       { text: stringTable.iconGrp, action: addIconGroup },
                       { text: stringTable.polyline, action: addPolyline },
                       { text: stringTable.polygon, action: addPolygon },
                       { text: stringTable.depthArea, action: addDepthArea },
                       { text: stringTable.bridge, action: addBridge },
                       { text: stringTable.navArea, action: addNavContour },
                       { text: stringTable.wlArea, action: addWaterLevelContour },
                       { text: stringTable.wlMarker, action: addWaterLevelMarker }];
    var editMenu    = [{ text: stringTable.properties, action: editObjectProperties },
                       { text: stringTable.shape, action: reshapeObject },
                       { text: stringTable.iconLibrary, action: editIconLibrary }];
    var nameSaveBtn = new Cary.ui.Button ({ text: stringTable.save, parent: nameBlock.htmlObject, visible: true, onClick: onSaveName },
                                          { float: 'right', height: 22, width: 'fit-content', 'margin-right': '20px' });
    var nameCtl     = new Cary.ui.EditBox ({ parent: nameBlock.htmlObject, text: this.layer.name, visible: true, onChange: markAsChanged },
                                           { float: 'right', height: 18, width: 170, 'margin-right': 10 });

    
    new Cary.ui.Button ({ text: stringTable.close, parent: buttonBlock.htmlObject, visible: true, onClick: onClose }, buttonStyle);
    //new Cary.ui.Button ({ text: stringTable.cancel, parent: buttonBlock.htmlObject, visible: true, onClick: doCancel }, buttonStyle);
    //new Cary.ui.Button ({ text: stringTable.save, parent: buttonBlock.htmlObject, visible: true, onClick: doSave }, buttonStyle);
    new Cary.ui.Button ({ text: stringTable.delete, parent: buttonBlock.htmlObject, visible: true, onClick: deleteObject }, buttonStyle);
    new Cary.ui.PopUpButton ({ text: stringTable.new, parent: buttonBlock.htmlObject, visible: true, popupMenu: addMenu, menuWidth: 170, anchorType: (Cary.ui.anchor.BOTTOM | Cary.ui.anchor.LEFT) },
                               { width: 55, height: 30, float: 'right', padding: 5, 'padding-top': 0, 'padding-bottom': 0 });
    new Cary.ui.PopUpButton ({ text: stringTable.edit, parent: buttonBlock.htmlObject, visible: true, popupMenu: editMenu, menuWidth: 120, anchorType: (Cary.ui.anchor.BOTTOM | Cary.ui.anchor.LEFT) },
                               { width: 75, height: 30, float: 'right', padding: 5, 'padding-top': 0, 'padding-bottom': 0 });
    //new Cary.ui.Button ({ text: stringTable.edit, parent: buttonBlock.htmlObject, visible: true, onClick: editObject }, buttonStyle);

    this.objectList = new Cary.ui.ListView ({ parent: this.client, columns: columns, visible: true },
                                            { right: 2, top: 40, left: 0, height: parseInt (this.wnd.style.height) - 110, position: 'absolute' });
    
    if (!this.layer.drawn)
        map.showUserObjectCollection (this.layer, true);
    
    setTimeout (function () 
                {
                    instance.layer.objects.forEach (function (object)
                                                    {
                                                        var index = instance.objectList.getItemCount ();
                                                        
                                                        instance.objectList.addItem ([object.name, getObjectTypeName (object)], object);
                                                        
                                                        if (object.drawer)
                                                            object.drawer.setCallback ('mouseover', function () { instance.objectList.selectItem (index); });
                                                    });
                },
                500);
                
    function markAsChanged ()
    {
        instance.changed = true;
    }
    
    function onSaveName ()
    {
        uploadSerializableToServer ('ol_set_name.php', { name: nameCtl.getValue (), id: instance.layer.id },
                                    function (newName)
                                    {
                                        nameCtl.setValue (newName);
                                        
                                        if ('onRename' in instance.callbacks)
                                            instance.callbacks.onRename (newName);
                                        
                                        instance.changed = false;
                                    },
                                    Cary.tools.resTypes.plain);
        
    }
    
    function onClose ()
    {
        if (instance.changed && 'onChanged' in instance.callbacks)
            this.callbacks.onChanged ();
        
        instance.close (true);
    }

    function addUserIcon ()
    {
        var callbacks = { onObjectAdded: /*onObjectAdded*/addObjectToLayer };

        new IconSelectWnd (null, { onPlotOnMap: function (iconData) { globalInterface.waitForUserIcon (iconData, callbacks); },
                                   onSetAtPos: function (iconData) { globalInterface.addUserIcon (iconData, callbacks); } });
                               
        function onObjectAdded (icon)
        {
            instance.layer.objects.push (icon);
            instance.objectList.addItem ([icon.name, stringTable.icon], icon);
        }
    }
    
    function addIconGroup ()
    {
    }

    function addUserObject (plottingAction, objectToProcess)
    {
        instance.changed = true;

        globalInterface.addNewObject = addObjectToLayer;
        
        if (objectToProcess)
            globalInterface.waitForMouseMove (start);
        else
            globalInterface.waitForUserClick (start);
        
        function start (event)
        {
            globalInterface.activateRegularContextMenu (event, plottingAction, objectToProcess);
        }
    }
    
    function addPolyline (objectToProcess)
    {
        addUserObject (plottingActions.NEW_POLYLINE, objectToProcess)
    }

    function addRoute (objectToProcess)
    {
        addUserObject (plottingActions.NEW_ROUTE, objectToProcess)
    }

    function addObjectToLayer (object)
    {
        var data  = object.serialize ();
        var isNew = !object.id;

        globalInterface.addNewObject = null;
        globalInterface.onSave       = null;

        data.layerID = instance.layer.id;

        uploadSerializableToServer ('uo_save.php', data,
                                    function (savedObject)
                                    {
                                        var obj = Cary.userObjects.createFromArray (savedObject, userObj.createVirginUserObject);
                                        var selectedItem;

                                        instance.layer.objects.push (obj);

                                        if (isNew)
                                        {
                                            instance.objectList.addItem ([savedObject.name, getObjectTypeName (obj)], savedObject);
                                            instance.objectList.selectItem ( instance.objectList.getItemCount () - 1);
                                        }
                                        else
                                        {
                                            instance.objectList.setItemText (instance.objectList.getSelectedItem (), 0, savedObject.name);
                                        
                                            map.drawUserObject (object, false);
                                        }
                                        
                                        map.drawUserObject (object, true);
                                        
                                        selectedItem = instance.objectList.getSelectedItem ();
                                        
                                        object.drawObjects.forEach (function (drawObject)
                                                                    {
                                                                        drawObject.setOptions ({ clickable: true });
                                                                        
                                                                        google.maps.event.addListener (drawObject, 'mouseover',
                                                                                                       function ()
                                                                                                       {
                                                                                                           instance.objectList.selectItem (selectedItem);
                                                                                                       });
                                                                    });
                                    });
    }
    
    function addPolygon (objectToProcess)
    {
        addUserObject (plottingActions.NEW_POLYGON, objectToProcess)
    }

    function getObjectTypeName (object)
    {
        var userTypeName = object ? object.getUserTypeName () : null;
        
        return userTypeName === null ? object.getTypeName () : userTypeName;
    }
    
    function addDepthArea (objectToProcess)
    {
        addUserObject (plottingActions.NEW_DEPTH_CONTOUR, objectToProcess);
    }

    function addBridge (objectToProcess)
    {
        addUserObject (plottingActions.NEW_BRIDGE_CONTOUR, objectToProcess);
    }
    
    function addWaterLevelContour (objectToProcess)
    {
        addUserObject (plottingActions.NEW_WATERLEVEL_CONTOUR, objectToProcess);
    }
    
    function addNavContour (objectToProcess)
    {
        addUserObject (plottingActions.NEW_NAV_CONTOUR, objectToProcess);
    }
    
    function addWaterLevelMarker (objectToProcess)
    {
        var callbacks = { onObjectAdded: /*onObjectAdded*/addObjectToLayer, onClick: objectFactory };
        
        new userObj.WaterLevelMarkerPropsWnd (null, null, 'res/watermeter26.png',
                                              { onPlotOnMap: function (iconData) { globalInterface.waitForUserIcon (iconData, callbacks); },
                                                onSetAtPos: function (iconData) { globalInterface.addUserIcon (iconData, callbacks); } });

        function objectFactory (name, lat, lon, props, data)
        {
            var object = new userObj.WaterLevelMarker (name, { lat: lat, lon: lon }, props);
            
            object.userProps.deviceID = data.deviceID;
            
            return object;
        }
       
        function onObjectAdded (icon)
        {
            instance.layer.objects.push (icon);
            instance.objectList.addItem ([icon.name, stringTable.icon], icon);
        }
    }
    
    function editObject (index, column, item)
    {
        instance.changed = true;
    }
    
    function doCancel ()
    {
        instance.close (true);
        
        if ('onCancel' in instance.callbacks)
            instance.callbacks.onCancel (instance.layer);
    }
    
    function doSave ()
    {
        instance.layer.name = nameCtl.getValue ();
        
        uploadLayerToServer (instance.layer.serialize (), onLayerSaved);
        
        function onLayerSaved (newLayer)
        {
            if ('onSave' in instance.callbacks)
                instance.callbacks.onSave (newLayer);
            
            instance.close (true);
        }
    }
    
    function deleteObject ()
    {
        var selection = instance.objectList.getSelectedItem ();
        
        if (selection >= 0)
        {
            var object = instance.objectList.getItemData (selection);
            
            Cary.tools.sendRequest ({ url: 'requests/uo_delete.php?o=' + object.id, mathod: Cary.tools.methods.post, content: Cary.tools.contentTypes.plainText, onLoad: onDeleted,
                                      resType: Cary.tools.resTypes.plain });
            
            function onDeleted ()
            {
                instance.changed = true;

                map.drawUserObject (object, false);

                instance.objectList.removeItem (selection);

                instance.layer.objects.splice (selection, 1);
            }
        }
    }
    
    function addObject ()
    {
    }

    function editIconLibrary ()
    {
        new UserIconsWnd ();
    }

    function reshapeObject ()
    {
        var selection = instance.objectList.getSelectedItem ();
        
        if (selection >= 0)
        {
            var object = instance.objectList.getItemData (selection);

            //if (!instance.layer.drawn)
            //    map.showUserObjectCollection (instance.layer, false);
            if (object.drawer)
                object.drawer.undraw ();
    
            if (object.userType)
            {
                switch (object.userType)
                {
                    case userObj.types.DEPTH_CONTOUR:
                        addDepthArea (object); break;
                        
                    case userObj.types.NAV_CONTOUR:
                        addNavContour (object); break;
                        
                    case userObj.types.BRIDGE_CONTOUR:
                        addBridge (object); break;
                        
                    case userObj.types.WATERLEVEL_CONTOUR:
                        addWaterLevelContour (object); break;
                        
                    case userObj.types.ROUTE:
                        addRoute (object); break;
                        
                    case userObj.types.WL_MARKER:
                        addWaterLevelMarker (object); break;
                }
            }
            else
            {
                switch (object.type)
                {
                    case Cary.userObjects.objectTypes.POLYLINE:
                        addPolyline (object); break;

                    case Cary.userObjects.objectTypes.POLYGON:
                        addPolygon (object); break;
                }
            }
        }
    }
    
    function editObjectProperties ()
    {
        var selection = instance.objectList.getSelectedItem ();
        
        if (selection >= 0)
        {
            var object = instance.objectList.getItemData (selection);
            
            switch (object.userType)
            {
                case userObj.types.DEPTH_CONTOUR:
                {
                    new userObj.DepthCntPropsWnd (null, object, { visible: true, onOk: onOk }); break;
                }
                
                case userObj.types.NAV_CONTOUR:
                {
                    new userObj.NavContourPropsWnd (null, object, { visible: true, onOk: onOk }); break;
                }
                
                case userObj.types.WATERLEVEL_CONTOUR:
                {
                    new userObj.WaterLevelContourPropsWnd (null, object, { visible: true, onOk: onOk }); break;
                }
                
                case userObj.types.ROUTE:
                {
                    new userObj.RoutePropsWnd (null, object, { visible: true, onOk: onOk }); break;
                }
                
                case userObj.types.BRIDGE_CONTOUR:
                {
                    new userObj.BridgeContourPropsWnd (null, object, { visible: true, onOk: onOk }); break;
                }
                
                default:
                {
                    switch (object.type)
                    {
                        case Cary.userObjects.objectTypes.POLYLINE:
                            new Cary.ui.UserPolylinePropsWnd (null, object, { visible: true, onOk: onOk }); break;

                        case Cary.userObjects.objectTypes.POLYGON:
                            new Cary.ui.UserPolygonPropsWnd (null, object, { visible: true, onOk: onOk }); break;
                    }
                }
            }
            
            function onOk ()
            {
                var data = object.serialize ();
                
                data.layerID = instance.layer.id;
                
                uploadSerializableToServer ('uo_save.php', data,
                                            function (savedObject)
                                            {
                                                instance.objectList.setItemText (selection, 0, /*savedObject*/object.name);
                                                instance.objectList.setItemData (selection, /*savedObject*/object);
                                                
                                                map.drawUserObject (object, false);
                                                map.drawUserObject (object, true);
                                            });
            }
        }
    }
};

UserLayerEditor.prototype.queryClose = function ()
{
    return confirm (stringTable.changesLoose);
};

