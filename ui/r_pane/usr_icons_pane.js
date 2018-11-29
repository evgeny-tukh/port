function UserIconsPane (parent, callbacks, options)
{
    this.options   = Cary.tools.isNothing (options) ? {} : options;
    this.callbacks = Cary.tools.isNothing (callbacks) ? {} : callbacks;
    
    Cary.ui.Window.apply (this, 
                         [{ position: { bottom: 5, left: 5, right: 5, height: 200, absolute: true }, 
                          parent: parent, paneMode: true, title: stringTable.userIcnLib, visible: true }]);
}

UserIconsPane.prototype = Object.create (Cary.ui.Window.prototype);

UserIconsPane.prototype.onInitialize = function ()
{
    var columns  = [{ title: stringTable.icon, width: 35 }, { title: stringTable.name, width: 210 }];
    var icons    = new Cary.ui.ListView ({ parent: this.wnd, columns: columns, visible: true },
                                         { position: 'absolute', right: 2, top: 25, left: 0, height: parseInt (this.wnd.style.height) - 60 });
    var butBlock = new Cary.ui.ControlBlock ({ parent: this.wnd, visible: true, anchor: Cary.ui.anchor.BOTTOM });
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
