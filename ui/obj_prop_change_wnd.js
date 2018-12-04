userObj.PropertyChangeWnd = function (parent, callbacks)
{
    var options = { position: { hcenter: true, vcenter: true, width: 800, height: 450, absolute: true }, title: stringTable.propChangeTitle, parent: parent, visible: true };
               
    this.options   = {};
    this.callbacks = Cary.tools.isNothing (callbacks) ? {} : callbacks;
    
    Cary.ui.Window.apply (this, [options]);
};

userObj.PropertyChangeWnd.SORT_BY_ID   = 0;
userObj.PropertyChangeWnd.SORT_BY_NAME = 1;

userObj.PropertyChangeWnd.prototype = Object.create (Cary.ui.Window.prototype);

userObj.PropertyChangeWnd.prototype.onInitialize = function ()
{
    var changes     = {};
    var buttonBlock = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, anchor: Cary.ui.anchor.BOTTOM });
    var blockProps  = { 'margin-top': 10, 'line-height': 20, 'text-align': 'left', 'padding-left': 10 };
    var layerBlock  = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: stringTable.layer }, blockProps);
    var propBlock   = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: stringTable.property }, blockProps);
    var sortBlock   = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: stringTable.sort }, blockProps);
    var buttonStyle = { width: 70, height: 30, float: 'right' };
    var instance    = this;
    var cbStyle     = { display: 'inline', float: 'right', width: 250, height: 22, 'margin-right': 20, padding: 0, 'font-size': 17 };
    var layerCtl    = new Cary.ui.ListBox ({ parent: layerBlock.htmlObject, comboBox: true, visible: true, onItemSelect: onLayerChanged }, cbStyle);
    var propertyCtl = new Cary.ui.ListBox ({ parent: propBlock.htmlObject, comboBox: true, visible: true, onItemSelect: onPropChanged }, cbStyle);
    var sortCtl     = new Cary.ui.ListBox ({ parent: sortBlock.htmlObject, comboBox: true, visible: true, onItemSelect: onSortChanged }, cbStyle);
    var columns     = [{ title: stringTable.objName, width: 450 }, { title: stringTable.type, width: 100 }, { title: stringTable.property, width: 220, onItemClick: onPropertyClick }];
    var objectsCtl  = new Cary.ui.ListView ({ parent: this.client, columns: columns, visible: true },
                                            { position: 'absolute', left: 10, top: 110, width: 805, height: 270 });

    new Cary.ui.Button ({ text: stringTable.close, parent: buttonBlock.htmlObject, visible: true, onClick: forceClose }, buttonStyle);
    new Cary.ui.Button ({ text: stringTable.save, parent: buttonBlock.htmlObject, visible: true, onClick: save }, buttonStyle);

    propertyCtl.addItem ('deviceID');
    propertyCtl.addItem ('maxDraft');
    propertyCtl.addItem ('areaDepth');
    propertyCtl.addItem ('limitationType');
    propertyCtl.setCurSel (0);
    
    sortCtl.addItem (stringTable.byID, userObj.PropertyChangeWnd.SORT_BY_ID);
    sortCtl.addItem (stringTable.byName, userObj.PropertyChangeWnd.SORT_BY_NAME);
    
    new Cary.tools.WaitForCondition (function () { return userLayerList.length > 0; }, 
                                     function ()
                                     {
                                        sortObjects (userObj.PropertyChangeWnd.SORT_BY_ID);
                                        
                                        userLayerList.forEach (function (layer)
                                                               {
                                                                   layerCtl.addItem (layer.name, layer);
                                                               });

                                        layerCtl.setCurSel (0);
                                        
                                        onLayerChanged ();
                                     });
    
    function sortObjects (sortOrder)
    {
        if (Cary.tools.isNothing (sortOrder))
            sortOrder = sortCtl.getSelectedData ();
        
        userLayerList.forEach (function (layer)
                               {
                                   layer.objects.sort (function (obj1, obj2)
                                                       {
                                                           var result;
                                                           
                                                           switch (sortOrder)
                                                           {
                                                               case userObj.PropertyChangeWnd.SORT_BY_ID:
                                                                   if (obj1.id > obj2.id)
                                                                       result = 1;
                                                                   else if (obj1.id < obj2.id)
                                                                       result = -1;
                                                                   else
                                                                       result = 0;
                                                                   
                                                                   break;
                                                                   
                                                               case userObj.PropertyChangeWnd.SORT_BY_NAME:
                                                                   if (obj1.name > obj2.name)
                                                                       result = 1;
                                                                   else if (obj1.name < obj2.name)
                                                                       result = -1;
                                                                   else
                                                                       result = 0;
                                                                   
                                                                   break;
                                                                   
                                                                default:
                                                                    result = 0;
                                                           }
                                                           
                                                           return result;
                                                       });
                               });
    }
    
    function onPropertyClick (item)
    {
        var object    = objectsCtl.getItemData (item);
        var propName  = propertyCtl.getValue ();
        var propValue = propName in object.userProps ? object.userProps [propName] : '';
        
        new Cary.ui.InputBox ({ title: stringTable.propChangeTitle, prompt: stringTable.value, value: propValue, width: 400 }, { onOk: onOk });
        
        function onOk (value)
        {
            objectsCtl.setItemText (item, 2, value);
            
            object.userProps [propName] = value;
            
            if (!(object.id in changes))
                changes [object.id] = {};
            
            changes [object.id][propName] = value;
        }
    }
    
    function onSortChanged ()
    {
        sortObjects ();
        onLayerChanged ();
    }
    
    function onPropChanged ()
    {
        var propName = propertyCtl.getValue ();
            
        objectsCtl.enumItems (function (item)
                              {
                                  item.itemColumns [2].innerText = propName in item.data.userProps ? item.data.userProps [propName] : '';
                              });
    }
    
    function onLayerChanged ()
    {
        var layer = layerCtl.getSelectedData ();
        
        if (layer)
        {
            var propName = propertyCtl.getValue ();
            
            objectsCtl.removeAllItems ();
            
            layer.objects.forEach (function (object)
                                   {
                                       objectsCtl.addItem ([object.name, getObjectTypeName (object), propName in object.userProps ? object.userProps [propName] : ''], object);
                                   });
        }
    }
    
    function getObjectTypeName (object)
    {
        var userTypeName = object ? object.getUserTypeName () : null;
        
        return userTypeName === null ? object.getTypeName () : userTypeName;
    }
    
    function save ()
    {
        Cary.tools.sendRequest ({ url: 'requests/upd_user_props.php', mathod: Cary.tools.methods.pos, content: Cary.tools.contentTypes.json, onLoad: onCompleted,
                                  resType: Cary.tools.resTypes.plain, param: changes });
                              
        function onCompleted (result)
        {
            new Cary.ui.MessageBox ({ title: stringTable.propChangeTitle, width: 400, text: result + ' ' + stringTable.propsChanged});
        }
    }
    
    function forceClose ()
    {
        instance.close ();
        
        if ('onClose' in instance.callbacks)
            instance.callbacks.onClose ();
    }    
};
