Cary.userObjects.UserIcon = function (name, position, properties)
{
    Cary.userObjects.GenericUserObject.apply (this, arguments);

    this.type       = Cary.userObjects.objectTypes.ICON;
    this.position   = position;
    this.properties = properties ? properties : {};
};

Cary.userObjects.UserIcon.prototype = Object.create (Cary.userObjects.GenericUserObject.prototype);

Cary.userObjects.objectTypes.ICON = 4;

Cary.userObjects.UserIcon.prototype.createDrawer = function ()
{
    return new Cary.drawers.IconDrawer (this);
};

Cary.userObjects.UserIcon.drawIcon = function (map, position, path, options)
{
    if (Cary.tools.isNothing (options))
        options = {};
    
    var object = new Cary.userObjects.UserIcon ('temp', position, options);
    var drawer = object.createDrawer ();
    
    if (!Cary.tools.isNothing (path))
        object.properties ['path'] = path;
    
    return drawer.draw (map);
};

Cary.userObjects.UserIcon.prototype.getTypeName = function ()
{
    var result;
    
    if (this.type === Cary.userObjects.objectTypes.ICON)
        result = 'Icon';
    else
        result = Cary.userObjects.GenericUserObject.prototype.getTypeName.apply (this);
    
    return result;
};

Cary.userObjects.UserIcon.prototype.getInfo = function ()
{
    var info = Cary.userObjects.GenericUserObject.prototype.getInfo.apply (this);
    
    info ['Icon path'] = 'path' in this.properties ? this.properties ['path'] : 'Default';
    info ['Position']  = Cary.tools.formatLat (this.position.lat) + ' ' + Cary.tools.formatLon (this.position.lon);
    
    return info;
};

Cary.userObjects.UserIcon.prototype.serialize = function ()
{
    var result = Cary.userObjects.GenericUserObject.prototype.serialize.apply (this, arguments);
    
    result.properties.lat = this.position ? this.position.lat : null;
    result.properties.lon = this.position ? this.position.lon : null;
    
    return result;
};

Cary.userObjects.UserIcon.prototype.deserialize = function (source)
{
    Cary.userObjects.GenericUserObject.prototype.deserialize.apply (this, arguments);
    
    if ('lat' in source.properties && 'lon' in source.properties)
        this.position = { lat: parseFloat (source.properties.lat), lon: parseFloat (source.properties.lon) };
    else
        this.position = null;
};

