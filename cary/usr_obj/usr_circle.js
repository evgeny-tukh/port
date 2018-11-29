Cary.userObjects.UserCircle = function (name, position, radius, properties)
{
    Cary.userObjects.UserIcon.apply (this, arguments);

    this.radius = radius;
    this.type   = Cary.userObjects.objectTypes.CIRCLE;
    
    Cary.userObjects.GenericUserObject.prototype.checkProperty.apply (this, ['color', Cary.userObjects.UserPolyline.DEFAULT_COLOR]);
    Cary.userObjects.GenericUserObject.prototype.checkProperty.apply (this, ['lineWidth', 3]);
};

Cary.userObjects.UserCircle.prototype = Object.create (Cary.userObjects.UserIcon.prototype);

Cary.userObjects.objectTypes.CIRCLE = 5;

Cary.userObjects.UserCircle.prototype.createDrawer = function ()
{
    return new Cary.drawers.CircleDrawer (this);
};

Cary.userObjects.UserCircle.drawCircle = function (map, center, radius, options)
{
    if (Cary.tools.isNothing (options))
        options = {};
    
    var color  = 'color' in options ? options.color : Cary.userObjects.UserPolyline.DEFAULT_COLOR;
    var object = new Cary.userObjects.UserCircle ('temp', center, radius, { color: color, style: style });
    var drawer = object.createDrawer ();
    
    return drawer.draw (map);
};

Cary.userObjects.UserCircle.prototype.getTypeName = function ()
{
    var result;
    
    if (this.type === Cary.userObjects.objectTypes.CICRLE)
        result = 'Circle';
    else
        result = Cary.userObjects.GenericUserObject.prototype.getTypeName.apply (this);
    
    return result;
};

Cary.userObjects.UserCircle.prototype.getInfo = function ()
{
    var info = Cary.userObjects.GenericUserObject.prototype.getInfo.apply (this);
    
    info ['Radius']     = this.radius.toFixed (3);
    info ['Position']   = Cary.tools.formatLat (this.position.lat) + ' ' + Cary.tools.formatLon (this.position.lon);
    info ['Fill color'] = this.properties ['fillColor'];
    info ['Opacity']    = this.properties ['opacity'].toFixed (1);
    
    return info;
};

Cary.userObjects.UserCircle.prototype.getPropertyStringValue = function (propName, propValue)
{
    return Cary.userObjects.UserPolygon.prototype.getPropertyStringValue.apply (this, arguments);
};

Cary.userObjects.UserCircle.prototype.serialize = function ()
{
    var result = Cary.userObjects.GenericUserObject.prototype.serialize.apply (this, arguments);
    
    result.properties.lat    = this.position ? this.position.lat : null;
    result.properties.lon    = this.position ? this.position.lon : null;
    result.properties.radius = this.radius ? this.radius : null;
    
    return result;
};

Cary.userObjects.UserCircle.prototype.deserialize = function (source)
{
    Cary.userObjects.GenericUserObject.prototype.deserialize.apply (this, arguments);
    
    if ('lat' in source.properties && 'lon' in source.properties)
    {
        this.position = { lat: parseFloat (source.properties.lat), lon: parseFloat (source.properties.lon) };
        this.radius   = parseFloat (source.properties.radius);
    }
    else
    {
        this.position = null;
        this.radius   = null;
    }
};
