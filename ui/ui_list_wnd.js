function UserInfoListWnd (parent, callbacks)
{
    this.callbacks = Cary.tools.isNothing (callbacks) ? {} : callbacks;
    this.changed   = false;
    
    if (Cary.tools.isNothing (parent))
        parent = document.getElementsByTagName ('body') [0];
    
    Cary.ui.Window.apply (this, [{ position: { hcenter: true, vcenter: true, width: 400, height: 300, absolute: true }, 
                                 title: stringTable.userInfoList, parent: parent, visible: true }]);
}

UserInfoListWnd.prototype = Object.create (Cary.ui.Window.prototype);

UserInfoListWnd.prototype.onInitialize = function ()
{
    var instance    = this;
    var buttonStyle = { width: 70, height: 30, float: 'right' };
    var buttonBlock = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, anchor: Cary.ui.anchor.BOTTOM });
    var userInfoCtl = new Cary.ui.ListBox ({ parent: this.client, comboBox: false, visible: true },
                                           { width: '100%', height: 230, margin: 0, padding: 0, 'font-size': 17 });
                                           
    new Cary.ui.Button ({ text: stringTable.close, parent: buttonBlock.htmlObject, visible: true, onClick: onClose }, buttonStyle);
    new Cary.ui.Button ({ text: stringTable.add, parent: buttonBlock.htmlObject, visible: true, onClick: onAdd }, buttonStyle);
    new Cary.ui.Button ({ text: stringTable.delete, parent: buttonBlock.htmlObject, visible: true, onClick: onDelete }, buttonStyle);
    new Cary.ui.Button ({ text: stringTable.edit, parent: buttonBlock.htmlObject, visible: true, onClick: onEdit }, buttonStyle);
    
    loadInfoArrayList (onUserInfoListLoaded);

    function onClose ()
    {
        if (instance.changed && 'onChanged' in instance.callbacks)
            instance.callbacks.onChanged ();
        
        forceClose ();
    }
    
    function onAdd ()
    {
        editItem ();
    }
    
    function onDelete ()
    {
        var selection = userInfoCtl.getCurSel ();
        
        if (selection >= 0 && confirm (stringTable.deleteUserInfo))
            userInfoCtl.deleteItem (selection);
    }

    function editItem (userInfo, selection)
    {
        var newInfo = Cary.tools.isNothing (selection) || selection < 0;
        
        new UserInfoEditWnd (null, userInfo, 
                            { onOk: function (info)
                                    {
                                        if (newInfo)
                                            selection = userInfoCtl.addItem (info.name, info.id);
                                        else
                                            userInfoCtl.setItemText (selection, info.name); 
                                    } });
    }
    
    function onEdit ()
    {
        var selection = userInfoCtl.getCurSel ();
        
        if (selection >= 0)
        {
            var id = userInfoCtl.getItemData (selection);
            
            loadUserArray (id.toString (),
                           function (userInfo)
                           {
                                editItem (userInfo, selection);
                           });
        }
    }
    
    function onUserInfoListLoaded (userInfoList)
    {
        userInfoList.forEach (function (item)
                              {
                                  userInfoCtl.addItem (item.name, item.id);
                              });
    }
    
    function forceClose ()
    {
        instance.close ();
        
        if ('onClose' in instance.callbacks)
            instance.callbacks.onClose ();
    }
};

function UserInfoEditWnd (parent, info, callbacks)
{
    this.info      = Cary.tools.isNothing (info) ? { name: '', id: 0, items: [] } : info;
    this.callbacks = Cary.tools.isNothing (callbacks) ? {} : callbacks;
    
    if (Cary.tools.isNothing (parent))
        parent = document.getElementsByTagName ('body') [0];
    
    Cary.ui.Window.apply (this, [{ position: { hcenter: true, vcenter: true, width: 800, height: 500, absolute: true }, 
                                 title: stringTable.userInfoEdit, parent: parent, visible: true }]);
}

UserInfoEditWnd.prototype = Object.create (Cary.ui.Window.prototype);

UserInfoEditWnd.prototype.onInitialize = function ()
{
    var ctlStyles   = { 'text-align': 'left', margin: 0, 'margin-top': 10, padding: 0, 'padding-left': 5, height: 26, 'line-height': 26 };
    var buttonBlock = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, anchor: Cary.ui.anchor.BOTTOM });
    var nameBlock   = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: stringTable.name }, ctlStyles);
    var buttonStyle = { width: 70, height: 30, float: 'right' };
    var instance    = this;
    var columns     = [{title: stringTable.param, width: 400, onItemClick: onChangeText }, {title: stringTable.value, width: 390, onItemClick: onChangeText }];
    var nameCtl     = new Cary.ui.EditBox ({ parent: nameBlock.htmlObject, visible: true, text: this.info.name }, { float: 'right', width: 400, 'margin-right': 10 });
    var itemsCtl    = new Cary.ui.ListView ({ parent: this.wnd, columns: columns, visible: true },
                                            { position: 'absolute', right: 2, top: 70, left: 0, width: '100%', height: 400 });
                                            
    new Cary.ui.Button ({ text: stringTable.import, parent: buttonBlock.htmlObject, visible: true, onClick: onImport }, buttonStyle);
    new Cary.ui.Button ({ text: stringTable.delete, parent: buttonBlock.htmlObject, visible: true, onClick: onDelete }, buttonStyle);
    new Cary.ui.Button ({ text: stringTable.add, parent: buttonBlock.htmlObject, visible: true, onClick: onAdd }, buttonStyle);
    new Cary.ui.Button ({ text: stringTable.cancel, parent: buttonBlock.htmlObject, visible: true, onClick: forceClose }, buttonStyle);
    new Cary.ui.Button ({ text: stringTable.ok, parent: buttonBlock.htmlObject, visible: true, onClick: onOk }, buttonStyle);

    setTimeout (function ()
                {
                    if (instance.info)
                        instance.info.items.forEach (function (item) { itemsCtl.addItem ([item.name, item.value]); });
                },
                500);
    
    function onImport ()
    {
        var fileBrowser = new Cary.tools.FileBroswer (instance.client, { onSelect: onFileSelected }, Cary.tools.FileBroswer.readAsBuffer/*readAsText*/);
        
        fileBrowser.execute ();
        
        function onFileSelected (result)
        {
            var string = new TextDecoder ('cp1251').decode (new Uint8Array (result));
            var lines  = string.split ('\r\n');
        
            itemsCtl.removeAllItems ();
            
            lines.forEach (function (line)
                           {
                               var parts = line.split (':');
                               
                               if (parts.length > 1)
                                   itemsCtl.addItem (parts);
                           });
        }
    }
    
    function onDelete ()
    {
        var selection = itemsCtl.getSelectedItem ();
        
        if (selection >= 0)
            itemsCtl.deleteItem (selection);
    }
    
    function onAdd ()
    {
        itemsCtl.addItem ([stringTable.param, stringTable.value]);
    }
    
    function onChangeText (row, column, item)
    {
        new Cary.ui.InputBox ({ width: 500, editWidth: 390, title: stringTable.infoItemEdit, prompt: stringTable.newValue, value: itemsCtl.getItemText (row, column) },
                              { onOk: function (value) { itemsCtl.setItemText (row, column, value); } });
    }
    
    function onOk ()
    {
        var i, count;
        
        instance.info.name  = nameCtl.getValue ();
        instance.info.items = [];
        
        for (i = 0, count = itemsCtl.getItemCount(); i < count; ++ i)
            instance.info.items.push ({ name: itemsCtl.getItemText (i, 0), value: itemsCtl.getItemText (i, 1) });
        
        saveUserArray (instance.info,
                       function (info)
                       {
                            if ('onOk' in instance.callbacks)
                                instance.callbacks.onOk (info);
                       
                            forceClose ();
                       });
    }
    
    function forceClose ()
    {
        instance.close ();
        
        if ('onClose' in instance.callbacks)
            instance.callbacks.onClose ();
    }
};

