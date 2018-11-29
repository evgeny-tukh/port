Cary.ui.UserPolygonPropsWnd = function (parent, object, callbacks)
{
    Cary.ui.UserPolylinePropsWnd.apply (this, arguments);
};

Cary.ui.UserPolygonPropsWnd.prototype = Object.create (Cary.ui.UserPolylinePropsWnd.prototype);

Cary.ui.UserPolygonPropsWnd.FILL_COLOR_ID = 'fillClr';

Cary.ui.UserPolygonPropsWnd.prototype.onInitialize = function ()
{
    this.setTitle (stringTable.polygonProps);
    this.setHeight (300);
    
    Cary.ui.UserPolylinePropsWnd.prototype.onInitialize.apply (this);
    
    var fillColorBlock  = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: stringTable.fillColor, id: Cary.ui.UserPolygonPropsWnd.FILL_COLOR_ID }, this.ctlBlkStyle);
    var opacityBlock    = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: stringTable.opacity }, this.ctlBlkStyle);
    var opacityCtl      = new Cary.ui.EditBox ({ parent: opacityBlock.htmlObject, numeric: true, float: true, min: 0, max: 1, step: 0.1, value: this.object.properties ['opacity'], visible: true }, { display: 'inline', float: 'right', width: 50, height: 22, 'margin-right': 20, padding: 0, 'font-size': 17 });
    var fillColorCtl    = new Cary.ui.EditBox ({ parent: fillColorBlock.htmlObject, text: this.object.properties ['fillColor'], visible: true }, { display: 'inline', float: 'right', width: 100, height: 22, 'margin-right': 20, padding: 0, 'font-size': 17 });
    var instance        = this;
    var parentOkHandler = this.okButton.htmlObject.onclick;
    
    this.okButton.htmlObject.onclick = onOk;
    
    function onOk ()
    {
        instance.object.properties ['opacity']   = opacityCtl.getValue ();
        instance.object.properties ['fillColor'] = fillColorCtl.getValue ();
        
        parentOkHandler ();
    }
};

