Cary.controls.pixelProps = ['left', 'top', 'right', 'bottom', 'width', 'height', 'borderWidth', 'borderRadius', 'fontSize', 'padding', 'paddingLeft', 'paddingRight', 'paddingTop',
                            'paddingBottom', 'margin', 'marginLeft', 'marginRight', 'marginTop', 'marginBottom'];

Cary.controls.setStyles = function (htmlElement, styles)
{
    Cary.controls.pixelProps.forEach (function (property)
                                      {
                                        if (property in styles && typeof (styles [property]) === 'number')
                                            styles [property] = styles [property].toString () + 'px';
                                      });
    
    for (var key in styles)
    {
        if (styles [key] !== null && typeof (styles [key]) !== 'function')
            htmlElement.style [key] = styles [key];
    }
};

Cary.controls.GenericMapControl = function (map, position, options)
{
    this.map       = Cary.checkMap (map);
    this.options   = options;
    this.position  = position;
    this.container = null;
};

Cary.controls.GenericMapControl.prototype = new google.maps.OverlayView ();

Cary.controls.GenericMapControl.mouseEvents = ['click', 'dblclick', 'contextmenu', 'wheel', 'mousedown', 'touchstart', 'pointerdown'];

Cary.controls.GenericMapControl.prototype.stopEventPropagation = function ()
{
    var container = this.container;
    
    container.style.cursor = 'pointer';

    Cary.controls.GenericMapControl.mouseEvents.forEach (function(eventName)
                                                         {
                                                            container.addEventListener (eventName, function (event)
                                                                                                   {
                                                                                                       event.stopPropagation (); 
                                                                                                   });
                                                         });
};
  
Cary.controls.GenericMapControl.prototype.show = function (visible)
{
    if (Cary.tools.isNothing (visible))
        visible = true;
    
    this.setMap (visible ? this.map : null);
};

Cary.controls.GenericMapControl.prototype.delayedShow = function (interval)
{
    var instance = this;
    
    if (Cary.tools.isNothing (interval))
        interval = 200;
    
    setTimeout (function () { instance.show (instance.position); }, interval);
};

Cary.controls.GenericMapControl.prototype.getOption = function (name, defValue)
{
    var result;
    
    if (name in this.options)
        result = this.options [name];
    else
        result = defValue;
    
    return result;
};

Cary.controls.GenericMapControl.prototype.initialize = function ()
{
};

Cary.controls.GenericMapControl.prototype.onAdd = function ()
{
    var styles = 'styles' in this.options ? this.options.styles : {};
    
    this.container = document.createElement ('div');

    if ('onClick' in this.options)
        this.container.addEventListener ('click', this.options.onClick);
        
    for (var key in styles)
    {
        if (styles [key] !== null)
            this.container.style [key] = styles [key];
    }

    this.initialize ();
    
    //this.getPanes ().overlayLayer.appendChild (this.container);
    this.getPanes ().floatPane.appendChild (this.container);
};

Cary.controls.GenericMapControl.prototype.draw = function ()
{
    var projection = this.getProjection ();
    var bounds     = this.map.getBounds ();
    var basePoint  = projection.fromLatLngToDivPixel (this.position);
    var northEast  = projection.fromLatLngToDivPixel (bounds.getNorthEast ());
    var southWest  = projection.fromLatLngToDivPixel (bounds.getSouthWest ());

    if (basePoint.x < southWest.x)
        basePoint.x = southWest.x;
    
    if (basePoint.y < northEast.y)
        basePoint.y = northEast.y;
    
    if ((basePoint.x + this.container.clientWidth) > northEast.x)
        basePoint.x = northEast.x - this.container.clientWidth;
    
    if ((basePoint.y + this.container.clientHeight) > southWest.y)
        basePoint.y = southWest.y - this.container.clientHeight;
    
    this.container.style.position = 'absolute';
    this.container.style.left     = Cary.tools.int2pix (basePoint.x);
    this.container.style.top      = Cary.tools.int2pix (basePoint.y);
};

Cary.controls.GenericMapControl.prototype.onRemove = function ()
{
    this.container.parentNode.removeChild (this.container);

    this.container = null;
};

Cary.controls.GenericMapDomControl = function (map, location, options, className)
{
    if (Cary.tools.isNothing (options))
        options = {};
    
    if (Cary.tools.isNothing (className))
        className = null;
    
    this.map       = Cary.checkMap (map);
    this.options   = options;
    this.container = document.createElement ('div');
    this.location  = location;
    
    if (className !== null)
        this.container.className = className;
    
    this.setStyles (options);
    this.initialize ();
    
    this.container.control = this;
    
    this.ctlIndex = this.map.controls [location].push (this.container) - 1;

    this.show ('visible' in options && options.visible);
};

Cary.controls.GenericMapDomControl.prototype.remove = function (map)
{
    var i;

    for (i = 0; i < map.controls [this.location].length; ++ i)
    {
        if (map.controls [this.location].getAt (i) === this.container)
        {
            map.controls [this.location].removeAt (i); break;
        }
    }
};

Cary.controls.GenericMapDomControl.prototype.setStyles = function (styles)
{
    Cary.controls.setStyles (this.container, styles);
};

Cary.controls.GenericMapDomControl.prototype.initialize = function ()
{
};

Cary.controls.GenericMapDomControl.prototype.show = function (visible)
{
    if (Cary.tools.isNothing (visible))
        visible = true;
    
    this.container.style.display = visible ? null : 'none';
};

Cary.controls.GenericMapDomControl.prototype.isVisible = function ()
{
    return this.container.style.display !== 'none';
};
    
Cary.controls.GenericMapDomControl.prototype.setText = function (text)
{
    this.container.innerText = text;
};

Cary.controls.GenericDomControl = function (map, point)
{
    this.map       = Cary.checkMap (map);
    this.parent    = this.map.getDiv ();
    this.point     = point;
    this.container = document.createElement ('div');
    
    this.container.style.left   = Cary.tools.int2pix (point.x);
    this.container.style.top    = Cary.tools.int2pix (point.y);
    this.container.style.zIndex = 500;
    
    this.parent.appendChild (this.container);
};

Cary.controls.GenericDomControl.prototype.close = function ()
{
    if (this.parent.contains (this.container))
        this.parent.removeChild (this.container);
};

Cary.controls.GenericDomControl.prototype.show = function (visible)
{
    this.container.style.display = visible ? null : 'none';
};

Cary.controls.Tag = function (map, position, text, minZoom, styles, zoomToFontSize, zoomToPlacement)
{
    var options  = { onClick: onClick };
    var instance = this;
  
    if (Cary.tools.isNothing (zoomToFontSize))
        zoomToFontSize = null;
    
    this.text            = text;
    this.zoomWatchdog    = null;
    this.minZoom         = Cary.tools.isNothing (minZoom) ? 15 : minZoom;
    this.onZoomChanged   = null;
    this.zoomToFontSize  = zoomToFontSize;
    this.zoomToPlacement = zoomToPlacement;
    this.zIndex          = null;
    
    if (!Cary.tools.isNothing (styles))
        options.styles = styles;
    
    Cary.controls.GenericMapControl.apply (this, [map, position, options]);

    this.checkZoomWatchdog ();
    
    function onClick ()
    {
        if (instance.container)
        {
            instance.zIndex                 = Cary.controls.Tag.maxZIndex ++;
            instance.container.style.zIndex = instance.zIndex;
        }
    }
};

Cary.controls.Tag.prototype = Object.create (Cary.controls.GenericMapControl.prototype);

Cary.controls.Tag.maxZIndex = 1000;

Cary.controls.Tag.prototype.onAdd = function ()
{
    Cary.controls.GenericMapControl.prototype.onAdd.apply (this, arguments);
    
    if (!this.zIndex)
        this.zIndex = (Cary.controls.Tag.maxZIndex ++);

    this.container.style.zIndex = this.zIndex;
    this.container.style.cursor = 'pointer';
};

Cary.controls.Tag.prototype.checkZoomWatchdog = function ()
{
    var map      = this.getMap ();
    var instance = this;
    
    if (map !== null && this.zoomWatchdog === null)
    {
        this.zoomWatchdog  = google.maps.event.addListener (map, 'zoom_changed', onZoomChanged);
        this.onZoomChanged = onZoomChanged; // Startup call
    }
    
    function onZoomChanged ()
    {
        var zoom    = map.getZoom ();
        var visible = zoom >= instance.minZoom;
        
        instance.container.style.display = visible ? null : 'none';
        
        if (visible)
        {
            if (instance.zoomToFontSize)
                instance.container.style.fontSize = Cary.tools.int2pix (instance.zoomToFontSize (zoom));
            
            if (instance.zoomToPlacement)
            {
                var result = instance.zoomToPlacement (zoom);
                
                for (var key in result)
                    instance.container.style [key] = Cary.tools.int2pix (result [key]);
            }
        }
    }
};

Cary.controls.Tag.prototype.initialize = function ()
{
    this.container.innerText = this.text;
    this.container.className = 'tag';
    
    if (this.onZoomChanged !== null)
        this.onZoomChanged ();
};

Cary.controls.Tag.prototype.setText = function (text)
{
    this.text = text;

    if (this.container !== null)
        this.container.innerText = this.text;
};

Cary.controls.Tag.prototype.getMap = function ()
{
    var map = Cary.controls.GenericMapControl.prototype.getMap.apply (this, arguments);
    
    return Cary.tools.isNothing (map) ? null : map;
};

Cary.controls.Tag.prototype.setMap = function (map)
{
    Cary.controls.GenericMapControl.prototype.setMap.apply (this, arguments);
    
    if (map !== null)
    {
        this.checkZoomWatchdog ();
    }
    else if (this.zoomWatchdog !== null)
    {
        google.maps.event.removeListener (this.zoomWatchdog);
        
        this.zoomWatchdog = null;
    }
};
