Cary.ui.CoordEditWnd = function (parent, data, callbacks)
{
    this.callbacks   = Cary.tools.isNothing (callbacks) ? {} : callbacks;
    this.data        = Cary.tools.isNothing (data) ? {} : data;
    this.mode        = 'mode' in data ? data.mode : CoordEditWnd.modes.LAT;
    this.value       = 'value' in data ? data.value : '';
    
    if (parent === null)
        parent = document.getElementsByTagName ('body') [0];
    
    Cary.ui.Window.apply (this, [{ position: { hcenter: true, vcenter: true, width: 195, height: 110, absolute: true }, 
                                 title: 'Enter the ' + (this.mode === Cary.ui.CoordEditWnd.modes.LAT ? 'latitude' : 'longitude'), parent: parent, visible: true }]);
};

Cary.ui.CoordEditWnd.modes = { LAT: 1, LON: 2 };

Cary.ui.CoordEditWnd.prototype = Object.create (Cary.ui.Window.prototype);

Cary.ui.CoordEditWnd.prototype.onInitialize = function ()
{
    var buttonBlock = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, anchor: Cary.ui.anchor.BOTTOM });
    var editBlock   = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, anchor: Cary.ui.anchor.TOP }, { padding: 10 });
    var buttonStyle = { width: 70, height: 30, float: 'right' };
    var instance    = this;
    var maxValue    = this.mode === Cary.ui.CoordEditWnd.modes.LAT ? 90 : 180;
    var absValue    = Math.abs (this.value);
    var deg         = Math.floor (absValue);
    var min         = Cary.tools.round ((absValue - deg) * 60, 3);
    var items       = this.mode === Cary.ui.CoordEditWnd.modes.LAT ? [{ text: 'N' }, { text: 'S' }] : [{ text: 'E' }, { text: 'W' }];
    var degCtl      = new Cary.ui.EditBox ({ parent: editBlock.htmlObject, numeric: true, min: 0, max: maxValue, visible: true, value: deg }, { display: 'inline', float: 'left', 'margin-right': 10, width: 50 });
    var minCtl      = new Cary.ui.EditBox ({ parent: editBlock.htmlObject, numeric: true, float: true, min: 0, max: 59.999, visible: true, value: min, step: 1 }, { display: 'inline', float: 'left', 'margin-right': 10, width: 80 });
    var sideCtl     = new Cary.ui.ListBox ({ parent: editBlock.htmlObject, comboBox: true, visible: true, items: items }, { display: 'inline', float: 'left', width: 40 });
    
    if (this.value < 0)
        sideCtl.setCurSel (1);
    
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
        var value = degCtl.getValue () + parseFloat (minCtl.getValue () / 60);
        
        if (sideCtl.getCurSel () > 0)
            value = - value;
        
        instance.close (true);
        
        if ('onOk' in instance.callbacks)
            instance.callbacks.onOk (value);
    }
};

