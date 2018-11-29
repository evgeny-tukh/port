Cary.userObjects.UserPolygon = function (name, points, properties)
{
    Cary.userObjects.UserPolyline.apply (this, arguments);

    this.type = Cary.userObjects.objectTypes.POLYGON;
    
    Cary.userObjects.MultiPointUserObject.prototype.checkProperty.apply (this, ['fillColor', Cary.userObjects.UserPolygon.DEFAULT_FILL_COLOR]);
    Cary.userObjects.MultiPointUserObject.prototype.checkProperty.apply (this, ['opacity', Cary.userObjects.UserPolygon.DEFAULT_OPACITY]);
};

Cary.userObjects.UserPolygon.prototype = Object.create (Cary.userObjects.UserPolyline.prototype);

Cary.userObjects.UserPolygon.DEFAULT_FILL_COLOR = 'yellow';
Cary.userObjects.UserPolygon.DEFAULT_OPACITY    = 0.5;

Cary.userObjects.objectTypes.POLYGON = 3;

Cary.userObjects.UserPolygon.prototype.createDrawer = function ()
{
    return new Cary.drawers.PolygonDrawer (this);
};

Cary.userObjects.UserPolygon.drawPolygon = function (map, points, options)
{
    if (Cary.tools.isNothing (options))
        options = {};
    
    var color     = 'color' in options ? options.color : Cary.userObjects.UserPolyline.DEFAULT_COLOR;
    var fillColor = 'fillColor' in options ? options.fillColor : Cary.userObjects.UserPolygon.DEFAULT_FILL_COLOR;
    var style     = 'style' in options ? options.style : Cary.userObjects.lineStyles.SOLID;
    var opacity   = 'opacity' in options ? options.opacity : Cary.userObjects.UserPolygon.DEFAULT_OPACITY;
    var object    = new Cary.userObjects.UserPolygon ('temp', points, { color: color, style: style, fillColor: fillColor, opacity: opacity });
    var drawer    = object.createDrawer ();
    
    return drawer.draw (map);
};

Cary.userObjects.UserPolygon.prototype.getTypeName = function ()
{
    var result;
    
    if (this.type === Cary.userObjects.objectTypes.POLYGON)
        result = 'Polygon';
    else
        result = Cary.userObjects.GenericUserObject.prototype.getTypeName.apply (this);
    
    return result;
};

Cary.userObjects.UserPolygon.prototype.getInfo = function ()
{
    var info = Cary.userObjects.UserPolyline.prototype.getInfo.apply (this);
    
    info ['Fill color'] = this.properties ['fillColor'];
    info ['Opacity']    = this.properties ['opacity'].toFixed (1);
    
    return info;
};

Cary.userObjects.UserPolygon.prototype.getFillColor = function ()
{
    return this.properties ['fillColor'];
};

Cary.userObjects.UserPolygon.prototype.getEdgeColor = function ()
{
    return this.properties ['color'];
};