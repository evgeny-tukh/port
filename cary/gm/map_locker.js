Cary.controls.MapLocker = function (map, initiallyActive, onClick)
{
    var options = { width: '100%', height: '100%', margin: 0, padding: 0, backgroundColor: 'lightgray', left: 0, top: 0, zIndex: 2, opacity: 0.5 };
    
    if (Cary.tools.isNothing (onClick))
        onClick = null;
    
    if (Cary.tools.isNothing (initiallyActive))
        initiallyActive = false;
    
    if (initiallyActive)
        options.visible = true;

    this.onClick = onClick;
    
    Cary.controls.GenericMapDomControl.apply (this, [map, google.maps.ControlPosition.TOP_RIGHT, options]);
};

Cary.controls.MapLocker.prototype = Object.create (Cary.controls.GenericMapDomControl.prototype);

Cary.controls.MapLocker.prototype.initialize = function ()
{
    Cary.controls.GenericMapDomControl.prototype.initialize.apply (this, arguments);
    
    if (this.onClick !== null)
        this.container.onclick = this.onClick;
};
