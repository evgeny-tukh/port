Cary.ui.PositionEditWnd = function (parent, data, callbacks)
{
    this.callbacks   = Cary.tools.isNothing (callbacks) ? {} : callbacks;
    this.data        = Cary.tools.isNothing (data) ? { lat: null, lon: null } : data;
    this.lat         = this.data.lat;
    this.lon         = this.data.lon;
    
    if (parent === null)
        parent = document.getElementsByTagName ('body') [0];
    
    Cary.ui.Window.apply (this, [{ position: { hcenter: true, vcenter: true, width: 195, height: 140, absolute: true }, title: 'Enter the position', parent: parent, visible: true }]);
};

Cary.ui.PositionEditWnd.prototype = Object.create (Cary.ui.Window.prototype);

Cary.ui.PositionEditWnd.prototype.onInitialize = function ()
{
    var buttonBlock = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, anchor: Cary.ui.anchor.BOTTOM });
    var latBlock    = new Cary.ui.ControlBlock ({ parent: this.client, visible: true }, { padding: 10, 'margin-bottom': 15 });
    var lonBlock    = new Cary.ui.ControlBlock ({ parent: this.client, visible: true }, { padding: 10, 'margin-bottom': 15 });
    var buttonStyle = { width: 70, height: 30, float: 'right' };
    var instance    = this;
    var absLat      = Math.abs (this.lat);
    var absLon      = Math.abs (this.lon);
    var latDeg      = Math.floor (absLat);
    var lonDeg      = Math.floor (absLon);
    var latMin      = Cary.tools.round ((absLat - latDeg) * 60, 3);
    var lonMin      = Cary.tools.round ((absLon - lonDeg) * 60, 3);
    var latItems    = [{ text: 'N' }, { text: 'S' }];
    var lonItems    = [{ text: 'E' }, { text: 'W' }];
    var latDegCtl   = new Cary.ui.EditBox ({ parent: latBlock.htmlObject, numeric: true, min: 0, max: 90, visible: true, value: latDeg }, { display: 'inline', float: 'left', 'margin-right': 10, width: 50 });
    var lonDegCtl   = new Cary.ui.EditBox ({ parent: lonBlock.htmlObject, numeric: true, min: 0, max: 90, visible: true, value: lonDeg }, { display: 'inline', float: 'left', 'margin-right': 10, width: 50 });
    var latMinCtl   = new Cary.ui.EditBox ({ parent: latBlock.htmlObject, numeric: true, float: true, min: 0, max: 59.999, visible: true, value: latMin, step: 1 }, { display: 'inline', float: 'left', 'margin-right': 10, width: 80 });
    var lonMinCtl   = new Cary.ui.EditBox ({ parent: lonBlock.htmlObject, numeric: true, float: true, min: 0, max: 59.999, visible: true, value: lonMin, step: 1 }, { display: 'inline', float: 'left', 'margin-right': 10, width: 80 });
    var latSideCtl  = new Cary.ui.ListBox ({ parent: latBlock.htmlObject, comboBox: true, visible: true, items: latItems }, { display: 'inline', float: 'left', width: 40 });
    var lonSideCtl  = new Cary.ui.ListBox ({ parent: lonBlock.htmlObject, comboBox: true, visible: true, items: lonItems }, { display: 'inline', float: 'left', width: 40 });
    
    if (Cary.tools.isNothing (this.lat) || Cary.tools.isNothing (this.lon))
    {
        latDegCtl.setValue (null);
        latMinCtl.setValue (null);
        lonDegCtl.setValue (null);
        lonMinCtl.setValue (null);
    }
    
    if (this.lat < 0)
        latSideCtl.setCurSel (1);
    
    if (this.lon < 0)
        lonSideCtl.setCurSel (1);
    
    new Cary.ui.Button ({ text: 'Cancel', parent: buttonBlock.htmlObject, visible: true, onClick: forceClose }, buttonStyle);
    new Cary.ui.Button ({ text: 'OK', parent: buttonBlock.htmlObject, visible: true, onClick: onOk }, buttonStyle);
    
    function forceClose ()
    {
        instance.close ();
        
        if ('onClose' in instance.callbacks)
            instance.callbacks.onClose ();
    }
    
    function onOk ()
    {
        var lat = latDegCtl.getValue () + parseFloat (latMinCtl.getValue () / 60);
        var lon = lonDegCtl.getValue () + parseFloat (lonMinCtl.getValue () / 60);
        
        if (latSideCtl.getCurSel () > 0)
            lat = - lat;
        
        if (lonSideCtl.getCurSel () > 0)
            lon = - lon;
        
        instance.close (true);
        
        if ('onOk' in instance.callbacks)
            instance.callbacks.onOk ({ lat: lat, lon: lon });
    }
};

