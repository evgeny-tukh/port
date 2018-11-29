userObj.BridgeContourPropsWnd = function (parent, object, callbacks)
{
    userObj.WaterLevelContourPropsWnd.apply (this, arguments);
};

userObj.BridgeContourPropsWnd.prototype = Object.create (userObj.WaterLevelContourPropsWnd.prototype);

userObj.BridgeContourPropsWnd.prototype.onInitialize = function ()
{
    var passLevelBlock = new Cary.ui.ControlBlock ({ parent: null, visible: true, text: stringTable.passLevel }, this.ctlBlkStyle);
    var passLevelCtl   = new Cary.ui.EditBox ({ parent: passLevelBlock.htmlObject, text: this.object.userProps.passLevel, visible: true, numeric: true, float: true, min: 0.5, max: 100, step: 0.1 },
                                              { display: 'inline', float: 'right', width: 50, height: 22, 'margin-right': 20, padding: 0, 'font-size': 17 });
    
    userObj.WaterLevelContourPropsWnd.prototype.onInitialize.apply (this);
 
    passLevelBlock.htmlObject.style.position = 'absolute';
    passLevelBlock.htmlObject.style.top      = '230px';
    
    this.client.insertBefore (passLevelBlock.htmlObject, document.getElementById ('scaleBlock'));
    
    this.setTitle (stringTable.bridgeProp);
    this.setHeight (550);
    
    this.levelList.htmlObject.style.top = '270px';
    this.addButton.htmlObject.style.top = '270px';
    this.delButton.htmlObject.style.top = '310px';
    
    var instance        = this;
    var parentOkHandler = this.okButton.htmlObject.onclick;
    
    this.okButton.htmlObject.onclick = onOk;
    
    function onOk ()
    {
        instance.object.userProps.passLevel = parseFloat (passLevelCtl.getValue ());
        
        parentOkHandler ();
    }
};

