Cary.drawers.PolygonDrawer = function (userObject)
{
    Cary.drawers.PolylineDrawer.apply (this, arguments);
    
    this.object.flashTimer = null;
};

Cary.drawers.PolygonDrawer.prototype = Object.create (Cary.drawers.PolylineDrawer.prototype);

Cary.drawers.PolygonDrawer.prototype.undraw = function ()
{
    if (this.object.flashTimer !== null)
        this.stopFlash ();
    
    Cary.drawers.PolylineDrawer.prototype.undraw.apply (this, arguments);
};

Cary.drawers.PolygonDrawer.prototype.draw = function (map, options)
{
    var polygon;
    var options;
    var drawMode;

    if (Cary.tools.isNothing (options))
        options = {};
    
    if ('drawMode' in options)
        drawMode = options.drawMode;
    else
        drawMode = null;
    
    // Prevent from drawing
    options.createObject = false;

    Cary.drawers.PolylineDrawer.prototype.draw.apply (this, [map, options]);
    
    this.plOptions.paths       = [this.plOptions.path];
    this.plOptions.fillColor   = this.object.getFillColor (drawMode);
    this.plOptions.strokeColor = this.object.getEdgeColor (drawMode);
    this.plOptions.fillOpacity = this.object.properties ['opacity'];
    
    polygon = new google.maps.Polygon (this.plOptions);
    
    google.maps.event.addListener (polygon, 'mouseover', this.onMouseOver);
    google.maps.event.addListener (polygon, 'mouseout', this.onMouseOut);
        
    this.object.drawObjects.push (polygon);
    
    if (this.editable)
        this.object.points.forEach (this.setUpVertex);
};

Cary.drawers.PolygonDrawer.prototype.startFlash = function (period)
{
    var instance = this;
    
    if (Cary.tools.isNothing (period))
        period = 1000;
    
    this.object.flashTimer = setInterval (switchFlashState, period);
    
    function switchFlashState ()
    {
        var polygon = instance.object.drawObjects [0];
        
        polygon.setVisible (!polygon.getVisible ());
    }
};

Cary.drawers.PolygonDrawer.prototype.stopFlash = function (period)
{
    if (this.object.flashTimer !== null)
    {
        clearInterval (this.object.flashTimer);
        
        this.object.flashTimer = null;
    }
};
    
/*
Cary.drawers.PolylineDrawer.drawGeoPolygon = function (map, points, options)
{
    if (Cary.tools.isNothing (options))
        options = {};
    
    var color     = 'color' in options ? options.color : Cary.userObjects.UserPolyline.DEFAULT_COLOR;
    var fillColor = 'color' in options ? options.fillColor : Cary.userObjects.UserPolygon.DEFAULT_FILL_COLOR;
    var style     = 'style' in options ? options.style : Cary.userObjects.lineStyles.SOLID;
    var opacity   = 'opacity' in options ? options.opacity : Cary.userObjects.UserPolygon.DEFAULT_OPACITY;
    var lineWidth = 'lineWidth' in options ? options.lineWidth : 2;
    var editable  = 'editMode' in options && options.editMode;
    var clickable = 'onClick' in options && options.onClick !== null;
    var geodesic  = 'greatCircle' in options && options.greatCircle;
    var dashed    = (style & Cary.userObjects.lineStyles.DASH) !== 0;
    var dotted    = (style & Cary.userObjects.lineStyles.DOT) !== 0;
    var arrowed   = (style & Cary.userObjects.lineStyles.ARROW) !== 0;
    var plOptions = { clickable: clickable, draggable: editable, editable: editable, geodesic: geodesic, map: map, strokeColor: color,
                      strokeWeight: lineWidth, visible: true, path: points };
                  
    if (dashed || dotted || arrowed)
    {
        var path;
        var repeat;
        var lineSymbol;
        var iconOptions;

        if (arrowed)
        {
            lineSymbol = { path: 'M0 0 L 0 -10 L -2 -6 L 2 -6 L 0 -10', scale: 1, strokeOpacity: 1 };
            repeat     = '10px';
        }
        else if (dashed)
        {
            lineSymbol  = { path: 'M 0,-2 0,0', strokeOpacity: 1, scale: 4 };
            repeat      = '20px';
        }
        else
        {
            lineSymbol  = { path: 'M 0,-2 0,0', strokeOpacity: 1, scale: 4 };
            repeat      = '50px';
        }

        iconOptions = { icon: lineSymbol, offset: '0', repeat: repeat };

        plOptions.icons = [iconOptions];

        if (dashed || dotted)
            plOptions.strokeWeight = 0;
    }

    return new google.maps.Polyline (plOptions);
};
*/