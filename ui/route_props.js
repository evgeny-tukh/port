userObj.RoutePropsWnd = function (parent, object, callbacks)
{
    var options = { position: { hcenter: true, vcenter: true, width: 280, height: 100, absolute: true }, title: stringTable.routeProps, parent: parent, visible: true };
               
    this.object    = object;
    this.options   = {};
    this.callbacks = Cary.tools.isNothing (callbacks) ? {} : callbacks;
    
    Cary.ui.Window.apply (this, [options]);
};

userObj.RoutePropsWnd.prototype = Object.create (Cary.ui.Window.prototype);

userObj.RoutePropsWnd.prototype.onInitialize = function ()
{
    var buttonBlock = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, anchor: Cary.ui.anchor.BOTTOM });
    var nameBlock   = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: stringTable.name, anchor: Cary.ui.anchor.TOP }, { 'margin-top': 10, 'line-height': 20 });
    var buttonStyle = { width: 70, height: 30, float: 'right' };
    var instance    = this;
    var nameCtl     = new Cary.ui.EditBox ({ parent: nameBlock.htmlObject, text: this.object.name, visible: true }, { display: 'inline', float: 'right', width: 200, height: 22, 'margin-right': 20, padding: 0, 'font-size': 17 });

    new Cary.ui.Button ({ text: stringTable.cancel, parent: buttonBlock.htmlObject, visible: true, onClick: forceClose }, buttonStyle);
    new Cary.ui.Button ({ text: stringTable.ok, parent: buttonBlock.htmlObject, visible: true, onClick: onOk }, buttonStyle);
    
    function forceClose ()
    {
        instance.close ();
        
        if ('onClose' in instance.callbacks)
            instance.callbacks.onClose ();
    }
    
    function onOk ()
    {
        instance.object.name = nameCtl.getValue ();
        
        instance.close (true);
        
        if ('onOk' in instance.callbacks)
            instance.callbacks.onOk (instance.object);
    }
};
