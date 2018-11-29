function WaypointPropWnd (parent, waypoint, callbacks)
{
    this.waypoint  = waypoint;
    this.callbacks = Cary.tools.isNothing (callbacks) ? {} : callbacks;
    
    Cary.ui.Window.apply (this, [{ position: { hcenter: true, vcenter: true, width: 250, height: 150, absolute: true }, title: stringTable.waypointEdit, parent: parent, visible: true }]);
}

WaypointPropWnd.prototype = Object.create (Cary.ui.Window.prototype);

WaypointPropWnd.prototype.onInitialize = function ()
{
    var buttonBlock   = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, anchor: Cary.ui.anchor.BOTTOM });
    var nameBlock     = new Cary.ui.ControlBlock ({ text: stringTable.name, parent: this.client, visible: true },
                                                  { height: 20, 'line-height': 22, 'text-align': 'left', padding: 10 });
    var stopTimeBlock = new Cary.ui.ControlBlock ({ text: stringTable.stopTime, parent: this.client, visible: true, top: 40 },
                                                  { height: 20, 'line-height': 22, 'text-align': 'left', padding: 10 });
    var buttonStyle = { width: 'fit-content', padding: 10, height: 30, float: 'right' };
    var instance    = this;
    var nameCtl     = new Cary.ui.EditBox ({ parent: nameBlock.htmlObject, visible: true, text: this.waypoint.name ? this.waypoint.name : '' },
                                           { float: 'right', height: 18, width: 170, 'margin-right': 20 });
    var stopTimeCtl = new Cary.ui.EditBox ({ parent: stopTimeBlock.htmlObject, visible: true, numeric: true, float: true,
                                             value: this.waypoint.stopTime ? this.waypoint.stopTime : 0, min: 0, step: 0.5 },
                                           { float: 'right', height: 18, width: 60, 'margin-right': 20 });
        
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
        instance.waypoint.name     = nameCtl.getValue ();
        instance.waypoint.stopTime = parseFloat (stopTimeCtl.getValue ());
        
        instance.close ();
        
        if (instance.callbacks.onOk)
            instance.callbacks.onOk ();
    }
};

