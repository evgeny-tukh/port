Cary.drawers.CircleDrawer = function (userObject)
{
    Cary.drawers.GenericDrawer.apply (this, arguments);
};

Cary.drawers.CircleDrawer.prototype = Object.create (Cary.drawers.GenericDrawer.prototype);

Cary.drawers.CircleDrawer.prototype.undraw = function ()
{
    Cary.drawers.GenericDrawer.prototype.undraw.apply (this, arguments);
};

Cary.drawers.CircleDrawer.prototype.draw = function (map, options)
{
    if (Cary.tools.isNothing (options))
        options = {};
    
    var instance   = this;
    var mapObject  = Cary.checkMap (map);
    var noBalloon  = 'noBalloon' in options && options.noBalloon;
    var editable   = 'editMode' in options && options.editMode;
    var clickable  = ('onClick' in options && options.onClick !== null) /*|| editable*/;
    var crcOptions = { clickable: clickable, draggable: false, editable: false, map: mapObject, strokeColor: this.object.properties ['color'], radius: this.object.radius,
                       center: { lat: this.object.position.lat, lng: this.object.position.lon }, strokeWeight: this.object.properties ['lineWidth'], visible: true,
                       fillColor: this.object.properties ['fillColor'], fillOpacity: this.object.properties ['opacity'] };
    var circle     = new google.maps.Circle (crcOptions);

    google.maps.event.addListener (circle, 'mouseover', onMouseOver);
    google.maps.event.addListener (circle, 'mouseout', onMouseOut);
    
    this.object.drawObjects = circle === null ? [] : [circle];
    this.object.balloon     = null;
    this.crcOptions         = crcOptions;
    this.onMouseOver        = onMouseOver;
    this.onMouseOut         = onMouseOut;
    this.editable           = editable;
    this.clickable          = clickable;
    
    return this.object.drawObjects;
    
    function onMouseOver (event)
    {
        if (!noBalloon && instance.object.balloon === null && !editable)
        {
            instance.object.balloon = new Cary.controls.MFBalloon (mapObject, event.latLng, { text: Cary.tools.unicode2char (instance.object.name) });
            
            instance.object.balloon.show ();
        }
        
        if (options.onMouseOver)
            options.onMouseOver (event);
    }
    
    function onMouseOut (event)
    {
        if (instance.object.balloon)
        {
            instance.object.balloon.show (false);
            
            instance.object.balloon = null;
        }
        
        if (options.onMouseOut)
            options.onMouseOut (event);
    }
};

