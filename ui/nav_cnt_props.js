userObj.NavContourPropsWnd = function (parent, object, callbacks)
{
    Cary.ui.UserPolylinePropsWnd.apply (this, arguments);
};

userObj.NavContourPropsWnd.prototype = Object.create (Cary.ui.UserPolylinePropsWnd.prototype);

userObj.NavContourPropsWnd.prototype.onInitialize = function ()
{
    Cary.ui.UserPolylinePropsWnd.prototype.onInitialize.apply (this);
    
    this.setTitle (stringTable.navCntProp);
    this.setHeight (350);
    this.setWidth (300);
    
    var areaDepthBlock  = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: stringTable.areaDepth }, this.ctlBlkStyle);
    var idBlock         = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: stringTable.id }, this.ctlBlkStyle);
    var deviceBlock     = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: stringTable.wlMarker }, this.ctlBlkStyle);
    var limitationBlock = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: stringTable.limitationType }, this.ctlBlkStyle);
    var areaDepthCtl    = new Cary.ui.EditBox ({ parent: areaDepthBlock.htmlObject, numeric: true, float: true, min: 0.5, max: 70.0, step: 0.1, value: this.object.userProps.areaDepth, visible: true }, { display: 'inline', float: 'right', width: 100, height: 22, 'margin-right': 20, padding: 0, 'font-size': 17 });
    var idCtl           = new Cary.ui.EditBox ({ parent: idBlock.htmlObject, text: this.object.userProps.id ? this.object.userProps.id : '', visible: true }, { display: 'inline', float: 'right', width: 50, height: 22, 'margin-right': 20, padding: 0, 'font-size': 17 });
    var deviceCtl       = new Cary.ui.ListBox ({ parent: deviceBlock.htmlObject, comboBox: true, visible: true }, { display: 'inline', float: 'right', width: 170, height: 22, 'margin-right': 20, padding: 0, 'font-size': 17 });
    var limitationCtl   = new Cary.ui.ListBox ({ parent: limitationBlock.htmlObject, comboBox: true, visible: true }, { display: 'inline', float: 'right', width: 170, height: 22, 'margin-right': 20, padding: 0, 'font-size': 17 });
    var instance        = this;
    var parentOkHandler = this.okButton.htmlObject.onclick;
    var limitationType  = parseInt (this.object.userProps.limitationType);
    
    deviceCtl.addItem (stringTable.notLinked, null, true);
    
    waterLevelAreas.enumerate (function (area)
                               {
                                  deviceCtl.addItem (area.name, area, area.userProps.deviceID === instance.object.userProps.deviceID);
                               });
    
    limitationCtl.addItem (stringTable.limitedBelow, userObj.NavContour.limitationType.LIMITED_BELOW, limitationType === userObj.NavContour.limitationType.LIMITED_BELOW);
    limitationCtl.addItem (stringTable.limitedAbove, userObj.NavContour.limitationType.LIMITED_ABOVE, limitationType === userObj.NavContour.limitationType.LIMITED_ABOVE);
    limitationCtl.addItem (stringTable.limitedAbove, userObj.NavContour.limitationType.LIMITED_DRAFT, limitationType === userObj.NavContour.limitationType.LIMITED_DRAFT);
    
    this.okButton.htmlObject.onclick = onOk;
    
    function onOk ()
    {
        if (!idCtl.getValue ())
        {
            alert (stringTable.idNotSpecified);
            
            idCtl.setFocus (); return;
        }
        
        if (parseFloat (areaDepthCtl.getValue ()) < 0.5)
        {
            alert (stringTable.invalidAreaDepth);
            
            areaDepthCtl.setFocus (); return;
        }
        
        if (deviceCtl.getCurSel () === 0)
        {
            alert (stringTable.deviceNotSpecified);
            
            deviceCtl.setFocus (); return;
        }
            
        instance.object.userProps.areaDepth      = areaDepthCtl.getValue ();
        instance.object.userProps.id             = idCtl.getValue ();
        instance.object.userProps.deviceID       = deviceCtl.getCurSel () > 0 ? deviceCtl.getSelectedData ().userProps.deviceID : null;
        instance.object.userProps.limitationType = limitationCtl.getCurSel () >= 0 ? limitationCtl.getSelectedData () : null;
        
        parentOkHandler ();
    }
};
