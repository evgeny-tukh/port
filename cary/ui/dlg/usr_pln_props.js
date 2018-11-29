Cary.ui.UserPolylinePropsWnd = function (parent, object, callbacks)
{
    this.callbacks   = Cary.tools.isNothing (callbacks) ? {} : callbacks;
    this.object      = object;
    this.ctlBlkStyle = { padding: 0, 'padding-left': 10, 'margin-bottom': 8, 'margin-top': 8, height: 25, 'text-align': 'left', 'line-height': 25, 'font-size': 17 };
    
    if (parent === null)
        parent = document.getElementsByTagName ('body') [0];
    
    Cary.ui.Window.apply (this, [{ position: { hcenter: true, vcenter: true, width: 280, height: 220, absolute: true }, title: stringTable.polylineProps, parent: parent, visible: true }]);
};

Cary.ui.UserPolylinePropsWnd.prototype = Object.create (Cary.ui.Window.prototype);

Cary.ui.UserPolylinePropsWnd.prototype.onInitialize = function ()
{
    var styleItems  = [{ text: stringTable.solid, data: Cary.userObjects.lineStyles.SOLID }, { text: stringTable.dash, data: Cary.userObjects.lineStyles.DASH }, { text: stringTable.dot, data: Cary.userObjects.lineStyles.DOT } ];
    var buttonBlock = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, anchor: Cary.ui.anchor.BOTTOM });
    var nameBlock   = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: stringTable.name }, this.ctlBlkStyle);
    var styleBlock  = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: stringTable.style }, this.ctlBlkStyle);
    var widthBlock  = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: stringTable.lineWidth }, this.ctlBlkStyle);
    var colorBlock  = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: stringTable.color }, this.ctlBlkStyle);
    var buttonStyle = { width: 70, height: 30, float: 'right' };
    var instance    = this;
    var nameCtl     = new Cary.ui.EditBox ({ parent: nameBlock.htmlObject, text: this.object.name, visible: true }, { display: 'inline', float: 'right', width: 200, height: 22, 'margin-right': 20, padding: 0, 'font-size': 17 });
    var widthCtl    = new Cary.ui.EditBox ({ parent: widthBlock.htmlObject, numeric: true, value: this.object.properties ['lineWidth'], visible: true }, { display: 'inline', float: 'right', width: 50, height: 22, 'margin-right': 20, padding: 0, 'font-size': 17 });
    var styleCtl    = new Cary.ui.ListBox ({ parent: styleBlock.htmlObject, comboBox: true, items: styleItems, visible: true }, { display: 'inline', float: 'right', width: 120, height: 25, 'margin-right': 20, padding: 0, 'font-size': 17 });
    var colorCtl    = new Cary.ui.EditBox ({ parent: colorBlock.htmlObject, text: this.object.properties ['color'], visible: true }, { display: 'inline', float: 'right', width: 100, height: 22, 'margin-right': 20, padding: 0, 'font-size': 17 });
    
    styleCtl.selectByData (this.object.properties ['lineStyle']);
    
    this.cancelButton = new Cary.ui.Button ({ text: stringTable.cancel, parent: buttonBlock.htmlObject, visible: true, onClick: forceClose }, buttonStyle);
    this.okButton     = new Cary.ui.Button ({ text: stringTable.ok, parent: buttonBlock.htmlObject, visible: true, onClick: onOk }, buttonStyle);
    this.buttonBlock  = buttonBlock;
    
    function forceClose ()
    {
        instance.close ();
        
        if ('onClose' in instance.callbacks)
            instance.callbacks.onClose ();
    }
    
    function onOk ()
    {
        instance.object.name                     = nameCtl.getValue ();
        instance.object.properties ['lineStyle'] = styleCtl.getSelectedData ();
        instance.object.properties ['lineWidth'] = widthCtl.getValue ();
        instance.object.properties ['color']     = colorCtl.getValue ();
        
        instance.close (true);
        
        if ('onOk' in instance.callbacks)
            instance.callbacks.onOk (instance.object);
    }
};

