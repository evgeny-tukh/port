userObj.drawers.AlertableContourDrawer = function (userObject)
{
    this.lastDrawMode = null;
    this.timer        = null;
    this.selPhase     = true;
    this.drawMode     = null;
    this.mouseOver    = null;
    this.mouseOut     = null;
    
    Cary.drawers.PolygonDrawer.apply (this, arguments);
};

userObj.drawers.AlertableContourDrawer.prototype = Object.create (Cary.drawers.PolygonDrawer.prototype);

userObj.drawers.AlertableContourDrawer.prototype.draw = function (map, options)
{
    Cary.drawers.PolygonDrawer.prototype.draw.apply (this, arguments);
    
    this.object.lastDrawMode = userObj.AlertableContour.drawModes.USUAL;
    
    this.selPhase = true;
};

userObj.drawers.AlertableContourDrawer.prototype.stopFlashing = function ()
{
    this.selPhase = true; // Will be inverted in flash ()
    
    this.flash ();
};

userObj.drawers.AlertableContourDrawer.prototype.flash = function ()
{
    var edgeColor,
        fillColor;

    this.selPhase = !this.selPhase;
    
    if (this.selPhase)
    {
        if (this.object.drawMode === userObj.AlertableContour.drawModes.ALERTED)
        {
            edgeColor = 'black'; //this.object.getEdgeColor ();
            fillColor = this.object.getFillColor ();
        }
        else
        {
            edgeColor = 'black';
            fillColor = 'darkgray';
        }
    }
    else
    {
        if (this.object.drawMode === userObj.AlertableContour.drawModes.ALERTED)
        {
            edgeColor = 'transparent';
            fillColor = 'transparent';
        }
        else
        {
            edgeColor = this.object.getEdgeColor ();
            fillColor = this.object.getFillColor ();
        }
    }
    
    this.object.drawObjects [0].setOptions ({ strokeColor: edgeColor, fillColor: fillColor });
};

userObj.drawers.AlertableContourDrawer.prototype.drawAlerted = function (map, callbacks)
{
    var options = { path: this.object.getGMPath (), fillColor: /*this.object.getFillColor ()*/'transparent', strokeColor: /*this.object.getEdgeColor ()*/'transparent', fillOpacity: 0.8, map: map };
    var polygon = new google.maps.Polygon (options);
    var object  = this.object;
    
    if (Cary.tools.isNothing (callbacks))
        callbacks = {};
    
    this.object.drawObjects = [polygon];
    
    this.object.lastDrawMode = userObj.AlertableContour.drawModes.ALERTED;
    
    this.selPhase = true;
    
    if ('onMouseOver' in callbacks)
        this.mouseOver = google.maps.event.addListener (this.object.drawObjects [0], 'mouseover', function (event) { callbacks.onMouseOver (object, event); });
    else
        this.mouseOver = null;
    
    if ('onMouseOut' in callbacks)
        this.mouseOut = google.maps.event.addListener (this.object.drawObjects [0], 'mouseout', function (event) { callbacks.onMouseOver (object, event); });
    else
        this.mouseOut = null;
};

userObj.drawers.AlertableContourDrawer.prototype.undraw = function ()
{
    if (this.mouseOver !== null)
    {
        google.maps.event.removeListener (this.mouseOver);
        
        this.mouseOver = null;
    }
    
    if (this.mouseOut !== null)
    {
        google.maps.event.removeListener (this.mouseOut);
        
        this.mouseOut = null;
    }
    
    if (this.timer !== null)
    {
        clearInterval (this.timer);
        
        this.timer = null;
    }
    
    Cary.drawers.PolygonDrawer.prototype.undraw.apply (this, arguments);
    
    this.lastDrawMode = null;
};

/*
userObj.drawers.AlertableContourDrawer.prototype.drawAlerted = function (map, options)
{
    var drawOptions = {};
    var object      = this.object;
    var clickable;
    var onClick;
    var noBalloon;
    
    if (Cary.tools.isNothing (options))
        options = {};
    
    for (var key in options)
        drawOptions [key] = options [key];
    
    drawOptions.drawMode = userObj.DepthContour.drawModes.ALERTED;
    
    if ('onClick' in options)
        onClick = options.onClick;
    else
        onClick = null;
    
    if ('noBalloon' in options)
        noBalloon = options.noBalloon;
    else
        noBalloon = null;
    
    options.onClick = function (event)
                      {
                          if (onClick !== null)
                              onClick (event);
                      };
    
    drawOptions.noBalloon = true;
    
    if ('onMouseOver' in options || 'onMouseOut' in options)
        Cary.drawers.PolygonDrawer.prototype.draw.apply (this, [map, drawOptions]);
    
    if ('onMouseOver' in options)
        google.maps.event.addListener (this.object.drawObjects [0], 'mouseover', function (event) { options.onMouseOver (object, event); });
    
    if ('onMouseOut' in options)
        google.maps.event.addListener (this.object.drawObjects [0], 'mouseout', function (event) { options.onMouseOout (object, event); });
    
    options.onClick   = clickable;
    options.noBalloon = noBalloon;
};
*/