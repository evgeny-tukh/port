function UserLayersPane (parent, callbacks, options)
{
    this.options   = Cary.tools.isNothing (options) ? {} : options;
    this.callbacks = Cary.tools.isNothing (callbacks) ? {} : callbacks;
    
    Cary.ui.Window.apply (this, 
                         [{ position: { top: 5, left: 5, right: 5, height: options.height, absolute: true }, 
                          parent: parent, paneMode: true, title: stringTable.userLayers, visible: true }]);
}

UserLayersPane.prototype = Object.create (Cary.ui.Window.prototype);

UserLayersPane.prototype.onInitialize = function ()
{
    var columns    = [{ title: stringTable.name, width: 210 }, { title: stringTable.visible, width: 55, onItemClick: onSwitchLayer, align: 'center' }];
    var layers     = new Cary.ui.ListView ({ parent: this.wnd, columns: columns,  visible: true },
                                           { position: 'absolute', right: 2, top: 25, left: 0, height: parseInt (this.wnd.style.height) - 50 });
    var butBlock   = new Cary.ui.ControlBlock ({ parent: this.wnd, visible: true, anchor: Cary.ui.anchor.BOTTOM });
    var butStyle   = { width: 'fit-content', height: 30, float: 'right', 'padding-left': 10, 'padding-right': 10 };
    var rgtPane    = document.getElementById ('rightPane');
    var savedLayer = null;
    
    new Cary.ui.Button ({ text: stringTable.propChange, parent: butBlock.htmlObject, visible: true, onClick: onChangeProperties }, butStyle);
    new Cary.ui.Button ({ text: stringTable.new, parent: butBlock.htmlObject, visible: true, onClick: onAddLayer }, butStyle);
    new Cary.ui.Button ({ text: stringTable.delete, parent: butBlock.htmlObject, visible: true, onClick: onDeleteLayer }, butStyle);
    new Cary.ui.Button ({ text: stringTable.edit, parent: butBlock.htmlObject, visible: true, onClick: onEditLayer }, butStyle);
    
    new Cary.tools.WaitForCondition (function () { return userLayerList.length > 0; }, 
                                     function ()
                                     {
                                        userLayerList.forEach (function (layer)
                                                               {
                                                                   layers.insertItem ([layer.name, Cary.symbols.unchecked], layer);
                                                               });
                                     });
        
    /*setTimeout (function ()
                {
                    userLayerList.forEach (function (layer)
                                           {
                                               layers.insertItem ([layer.name, Cary.symbols.unchecked], layer);
                                           });
                },
                500);*/
    
    function updateLayer (layerData)
    {
        var layer     = new Cary.userObjects.ObjectCollection;
        var selection = layers.getSelectedItem ();
        
        layer.deserialize (layerData, userObj.createVirginUserObject);
        
        if (selection >= 0)
        {
            layers.setItemText (selection, 0, layerData.name);
            layers.setItemData (selection, layer);
            
            if (layers.getItemText (selection, 1) === Cary.symbols.checked)
                map.showUserObjectCollection (layer, true);
        }
    }
    
    function cancelLayerEdit (layer)
    {
        if (layer.drawn)
            map.showUserObjectCollection (layer, true);
    }
    
    function onSwitchLayer (index, column, item)
    {
        var show = layers.getItemText (index, column) === Cary.symbols.checked;
        
        show = !show;
        
        layers.setItemText (index, column, show ? Cary.symbols.checked : Cary.symbols.unchecked);
        
        map.showUserObjectCollection (item.data, show);
        
        item.data.objects.forEach (function (object)
                                   {
                                       if (show)
                                       {
                                           shownObjectList.push (object);
                                       }
                                       else
                                       {
                                           var index = shownObjectList.indexOf (object);
                                           
                                           if (index >= 0)
                                               shownObjectList.splice (index, 1);
                                       }
                                   });
    }
    
    function onAddLayer ()
    {
        /*var callbacks = { onSave: addLayer };
        var layer     = null;
        
        new UserLayerEditor (rgtPane, callbacks, layer);*/
        
        new Cary.ui.InputBox ({ title: stringTable.addNewLayer, prompt: stringTable.name, value: stringTable.newLayer }, { onOk: addLayer });
        
        function addLayer (name)
        {
            Cary.tools.sendRequest ({ url: 'requests/ol_add_simple.php?n=' + name, mathod: Cary.tools.methods.get, content: Cary.tools.contentTypes.plainText, onLoad: onLayerAdded,
                                      resType: Cary.tools.resTypes.prototype });
                                  
            function onLayerAdded (layerID)
            {
                var layer = new Cary.userObjects.ObjectCollection;

                layer.name = name;
                layer.id   = parseInt (layerID);

                layers.addItem ([name, Cary.symbols.unchecked], layer);
                layers.selectItem (layers.getItemCount () - 1); 
                
                onEditLayer ();
            }
        }
    }
    
    function onDeleteLayer ()
    {
        var selection = layers.getSelectedItem ();
        
        if (selection >= 0 && confirm (stringTable.delLayerReq))
        {
            var layer = layers.getItemData (selection);
            
            if (layer)
            {
                map.showUserObjectCollection (layer, false);

                Cary.tools.sendRequest ({ url: 'requests/ol_delete.php?l=' + layer.id, mathod: Cary.tools.methods.get, content: Cary.tools.contentTypes.plainText, onLoad: onLayerRemoved,
                                          resType: Cary.tools.resTypes.prototype });

                function onLayerRemoved (response)
                {
                    if (response === 'OK')
                    {
                        layer = null;

                        layers.removeItem (selection);
                    }
                }
            }
        }
    }
    
    function onChangeProperties ()
    {
        new userObj.PropertyChangeWnd ();
    }
    
    function onEditLayer ()
    {
        var selection = layers.getSelectedItem ();
        
        if (selection >= 0)
        {
            var callbacks = { onSave: updateLayer, onCancel: cancelLayerEdit, onRename: onLayerRename };
            
            savedLayer = layers.getItemData (selection);
        
            savedLayer.drawn = layers.getItemText (selection, 1) === Cary.symbols.checked;
            
            new UserLayerEditor (rgtPane, callbacks, savedLayer);
            
            function onLayerRename (newName)
            {
                layers.setItemText (selection, 0, newName);
            }
        }
    }
};
