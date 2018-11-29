function UserObjectLoadWnd (parent, callbacks)
{
    this.callbacks   = Cary.tools.isNothing (callbacks) ? {} : callbacks;
    this.fileBrowser = null;
    
    if (parent === null)
        parent = document.getElementsByTagName ('body') [0];
    
    Cary.ui.Window.apply (this, [{ position: { hcenter: true, vcenter: true, width: 300, height: 200, absolute: true }, 
                                 title: stringTable.userObjLoad, parent: parent, visible: true }]);
}

UserObjectLoadWnd.prototype = Object.create (Cary.ui.Window.prototype);

UserObjectLoadWnd.prototype.onInitialize = function ()
{
    var buttonBlock = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, anchor: Cary.ui.anchor.BOTTOM });
    var buttonStyle = { width: 70, height: 30, float: 'right' };
    var instance    = this;
    var fileBrowser = new Cary.tools.FileBroswer (this.client, { onSelect: onFileSelected });
    var infoList    = new Cary.ui.ListView ({ parent: this.client, columns: [{title: 'Parameter', width: 100 }, { title: 'Value', width: 200 }], visible: true },
                                            { right: 2, top: 0, left: 0, height: parseInt (this.wnd.style.height) - 70 });
        
    new Cary.ui.Button ({ text: 'Cancel', parent: buttonBlock.htmlObject, visible: true, onClick: forceClose }, buttonStyle);
    new Cary.ui.Button ({ text: 'Load', parent: buttonBlock.htmlObject, visible: true, onClick: doLoad }, buttonStyle);
    new Cary.ui.Button ({ text: 'Select', parent: buttonBlock.htmlObject, visible: true, onClick: doSelect }, buttonStyle);
    
    this.object = null;

    function onFileSelected (text)
    {
        var object = Cary.userObjects.createFromJSON (text, instance.callbacks.createUserObject);
        var info   =  object.getInfo ();
        var key;
        
        instance.object = object;
        
        infoList.removeAllItems ();
        
        for (key in info)
            infoList.addItem ([key, info [key]]);
        
        //infoList.show ();
    }
    
    function forceClose ()
    {
        instance.close ();
        
        if ('onClose' in instance.callbacks)
            instance.callbacks.onClose ();
    }
    
    function doSelect ()
    {
        fileBrowser.execute ();
    }
    
    function doLoad ()
    {
        if (instance.object === null)
        {
            alert ('Please select the object first!');
        }
        else
        {
            instance.close (true);

            if ('onLoad' in instance.callbacks)
                instance.callbacks.onLoad (instance.object);
        }
    }
};

