function IconSelectWnd (parent, callbacks)
{
    this.callbacks = Cary.tools.isNothing (callbacks) ? {} : callbacks;
    
    Cary.ui.Window.apply (this, [{ position: { hcenter: true, vcenter: true, width: 250, height: 300, absolute: true }, title: stringTable.selectIcon, parent: parent, visible: true }]);
}

IconSelectWnd.prototype = Object.create (Cary.ui.Window.prototype);

IconSelectWnd.prototype.onInitialize = function ()
{
    var buttonBlock = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, anchor: Cary.ui.anchor.BOTTOM });
    var nameBlock   = new Cary.ui.ControlBlock ({ text: 'Name', parent: this.client, visible: true, anchor: Cary.ui.anchor.TOP },
                                                { height: 20, 'line-height': 22, 'text-align': 'left', padding: 10 });
    var buttonStyle = { width: 'fit-content', padding: 10, height: 30, float: 'right' };
    var instance    = this;
    var nameCtl     = new Cary.ui.EditBox ({ parent: nameBlock.htmlObject, visible: true }, { float: 'right', height: 18, width: 170, 'margin-right': 20 });
    var columns     = [{ title: stringTable.icon, width: 35, onItemClick: onSelectIcon }, { title: stringTable.name, width: 210, onItemClick: onSelectIcon }];
    var icons       = new Cary.ui.ListView ({ parent: this.wnd, columns: columns, visible: true },
                                            { position: 'absolute', right: 2, top: 70, left: 0, height: parseInt (this.wnd.style.height) - 110 });
        
    new Cary.ui.Button ({ text: 'Cancel', parent: buttonBlock.htmlObject, visible: true, onClick: forceClose }, buttonStyle);
    new Cary.ui.Button ({ text: 'Plot on map', parent: buttonBlock.htmlObject, visible: true, onClick: plotOnMap }, buttonStyle);
    new Cary.ui.Button ({ text: 'Set at pos', parent: buttonBlock.htmlObject, visible: true, onClick: setAtPos }, buttonStyle);
    
    this.object = null;

    loadIconList (onIconListLoaded);
    
    function onSelectIcon (index, col, item)
    {
        if (nameCtl.getValue() === '')
            nameCtl.setValue (item.data.name);
    }
    
    function onIconListLoaded (iconList)
    {
        iconList.forEach (addIcon);
    }
        
    function addIcon (iconData)
    {
        var item = icons.insertItem (['', iconData.name], iconData);

        icons.setItemImage (item, 0, iconData.url, 22, 22);
    }
    
    function forceClose ()
    {
        instance.close ();
        
        if ('onClose' in instance.callbacks)
            instance.callbacks.onClose ();
    }
    
    function setAtPos ()
    {
        var selection = icons.getSelectedItem ();
        
        if (selection >= 0)
        {
            new Cary.ui.PositionEditWnd (null, null, { onOk: onPositionPresent });
            
            function onPositionPresent (position)
            {
                if ('onSetAtPos' in instance.callbacks)
                {
                    var data = icons.getItemData (selection);

                    data.name     = nameCtl.getValue ();
                    data.position = position;

                    instance.callbacks.onSetAtPos (data);
            
                    forceClose ();
                }
            }
        }
    }
    
    function plotOnMap ()
    {
        var selection = icons.getSelectedItem ();
        
        if (selection >= 0)
        {
            if ('onPlotOnMap' in instance.callbacks)
            {
                var data = icons.getItemData (selection);
                
                data.name = nameCtl.getValue ();
                
                instance.callbacks.onPlotOnMap (data);
            }
            
            forceClose ();
        }
    }
};

