userObj.WaterLevelMarkerPropsWnd = function (parent, object, url, callbacks)
{
    this.callbacks   = Cary.tools.isNothing (callbacks) ? {} : callbacks;
    this.object      = Cary.tools.isNothing (object) ? null : object;
    this.url         = Cary.tools.isNothing (url) ? null : url;
    this.ctlBlkStyle = { padding: 0, 'padding-left': 10, 'margin-bottom': 8, 'margin-top': 8, height: 25, 'text-align': 'left', 'line-height': 25, 'font-size': 17 };
    
    if (parent === null)
        parent = document.getElementsByTagName ('body') [0];
    
    Cary.ui.Window.apply (this, [{ position: { hcenter: true, vcenter: true, width: 280, height: 150, absolute: true }, title: stringTable.wlMarkerProps, parent: parent, visible: true }]);
};

userObj.WaterLevelMarkerPropsWnd.prototype = Object.create (Cary.ui.Window.prototype);

userObj.WaterLevelMarkerPropsWnd.prototype.onInitialize = function ()
{
    Cary.ui.Window.prototype.onInitialize.apply (this);
    
    var buttonBlock = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, anchor: Cary.ui.anchor.BOTTOM });
    var nameBlock   = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: stringTable.name },
                                                { padding: 0, 'padding-left': 10, 'margin-bottom': 8, 'margin-top': 8, height: 25, 'text-align': 'left', 'line-height': 25, 'font-size': 17 });
    var idBlock     = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: stringTable.wmID },
                                                { padding: 0, 'padding-left': 10, 'margin-bottom': 8, 'margin-top': 8, height: 25, 'text-align': 'left', 'line-height': 25, 'font-size': 17 });
    var buttonStyle = { width: 'fit-content', height: 30, float: 'right' };
    var instance    = this;
    var nameCtl     = new Cary.ui.EditBox ({ parent: nameBlock.htmlObject, text: this.object ? this.object.name : '', visible: true },
                                           { display: 'inline', float: 'right', width: 200, height: 22, 'margin-right': 20, padding: 0, 'font-size': 17 });
    var idCtl       = new Cary.ui.EditBox ({ parent: nameBlock.htmlObject, text: (this.object && this.object.userProps.deviceID) ? this.object.userProps.deviceID : '', visible: true },
                                           { display: 'inline', float: 'right', width: 200, height: 22, 'margin-right': 20, padding: 0, 'font-size': 17 });
    
    new Cary.ui.Button ({ text: stringTable.cancel, parent: buttonBlock.htmlObject, visible: true, onClick: forceClose }, buttonStyle);
    new Cary.ui.Button ({ text: stringTable.plotOnMap, parent: buttonBlock.htmlObject, visible: true, onClick: plotOnMap }, buttonStyle);
    new Cary.ui.Button ({ text: stringTable.setPos, parent: buttonBlock.htmlObject, visible: true, onClick: setAtPos }, buttonStyle);
    
    function forceClose ()
    {
        instance.close ();
        
        if ('onClose' in instance.callbacks)
            instance.callbacks.onClose ();
    }

    function getIconData ()
    {
        return { name: nameCtl.getValue (), deviceID: idCtl.getValue (), url: instance.url };
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
                    var data = getIconData ();
                    
                    data.position = position;
                    
                    instance.callbacks.onSetAtPos (data);
            
                    forceClose ();
                }
            }
        }
    }
    
    function plotOnMap ()
    {
        if ('onPlotOnMap' in instance.callbacks)
            instance.callbacks.onPlotOnMap (getIconData ());

        forceClose ();
    }
};
