function UserIconsWnd (parent, callbacks)
{
    this.callbacks = Cary.tools.isNothing (callbacks) ? {} : callbacks;
    this.changed   = false;
    
    if (Cary.tools.isNothing (parent))
        parent = document.getElementsByTagName ('body') [0];
    
    Cary.ui.Window.apply (this, 
                          [{ position: { hcenter: true, vcenter: true, width: 300, height: 300, absolute: true }, 
                             title: stringTable.userIcnLib, parent: parent, visible: true }]);
}

UserIconsWnd.prototype = Object.create (Cary.ui.Window.prototype);

UserIconsWnd.prototype.onInitialize = function ()
{
    var columns  = [{ title: stringTable.icon, width: 60 }, { title: stringTable.name, width: 230 }];
    var icons    = new Cary.ui.ListView ({ parent: this.wnd, columns: columns, visible: true, headerLineHeight: 23 },
                                         { position: 'absolute', right: 2, top: 28, left: 0, height: parseInt (this.wnd.style.height) - 60 });
    var butBlock = new Cary.ui.ControlBlock ({ parent: this.wnd, visible: true, anchor: Cary.ui.anchor.BOTTOM }, { width: '95%' });
    var butStyle = { width: 70, height: 30, float: 'right' };
    
    new Cary.ui.Button ({ text: stringTable.add, parent: butBlock.htmlObject, visible: true, onClick: onAddIcon }, butStyle);
    new Cary.ui.Button ({ text: stringTable.delete, parent: butBlock.htmlObject, visible: true, onClick: onDeleteIcon }, butStyle);
    new Cary.ui.Button ({ text: stringTable.rename, parent: butBlock.htmlObject, visible: true, onClick: onRenameIcon }, butStyle);

    loadIconList (onIconListLoaded);
    //Cary.tools.sendRequest ({ url: 'requests/icn_get_list.php', mathod: 'get', content: Cary.tools.contentTypes.plainText, onLoad: onIconListLoaded, resType: Cary.tools.resTypes.json });
    
    function onIconListLoaded (iconList)
    {
        iconList.forEach (addIcon);
    }
        
    function addIcon (iconData)
    {
        var item = icons.insertItem (['', iconData.name], iconData);

        icons.setItemImage (item, 0, iconData.url, 22, 22);
    }
    
    function onAddIcon ()
    {
        new IconImportWnd (null, { onOk: doImport });
        
        function doImport (data)
        {
            uploadIconToServer (data, onLoad);
            //Cary.tools.sendRequest ({ method: Cary.tools.methods.post, content: Cary.tools.contentTypes.json, url: 'requests/icn_import.php', param: data, onLoad: onLoad,
            //                          resType: Cary.tools.resTypes.json });
        }
        
        function onLoad (data)
        {
            addIcon (data);
            
            alert ('Icon "' + data.name + '" has been imported');
        }
    }
    
    function onDeleteIcon ()
    {
        var selection = icons.getSelectedItem ();
        
        if (selection >= 0)
        {
            var data = icons.getItemData (selection);
            
            if (confirm (stringTable.iconDelConf + ' "' + data.name + '"?'))
            {
                removeIconFromServer (data, onDone);
                //Cary.tools.sendRequest ({ method: Cary.tools.methods.post, content: Cary.tools.contentTypes.json, url: 'requests/icn_del.php', param: data, onLoad: onDone,
                //                          resType: Cary.tools.resTypes.plain, param: data});

                function onDone ()
                {
                    icons.removeItem (selection);
                }
            }
        }
    }
    
    function onRenameIcon ()
    {
        var selection = icons.getSelectedItem ();
        
        if (selection >= 0)
        {
            var data = icons.getItemData (selection);
            
            new Cary.ui.InputBox ({ title: stringTable.iconRename, text: stringTable.nameEnter, value: data.name, editWidth: 100 }, { onOk: doRename });
            
            function doRename (newName)
            {
                data.name = newName;
                
                icons.setItemText (selection, 1, newName);

                renameIconOnServer (data, onLoad);
            }
            
            function onLoad (newData)
            {
                icons.setItemData (selection, newData);
            }
        }
    }
};
