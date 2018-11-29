Cary.userObjects.UserIconGroup = function (name, positions, properties)
{
    Cary.userObjects.GenericUserObject.apply (this, arguments);

    this.type      = Cary.userObjects.objectTypes.ICON_GROUP;
    this.positions = positions;
};

Cary.userObjects.UserIconGroup.prototype = Object.create (Cary.userObjects.GenericUserObject.prototype);

Cary.userObjects.objectTypes.ICON_GROUP = 4;

Cary.userObjects.UserIconGroup.prototype.createDrawer = function ()
{
    return new Cary.drawers.IconGroupDrawer (this);
};

Cary.userObjects.UserIconGroup.drawIcons = function (map, positions, path, options)
{
    if (Cary.tools.isNothing (options))
        options = {};
    
    var object = new Cary.userObjects.UserIconGroup ('temp', positions, options);
    var drawer = object.createDrawer ();
    
    if (!Cary.tools.isNothing (path))
        object.properties ['path'] = path;
    
    return drawer.draw (map);
};

Cary.userObjects.UserIconGroup.prototype.getTypeName = function ()
{
    var result;
    
    if (this.type === Cary.userObjects.objectTypes.ICON_GROUP)
        result = 'Icon group';
    else
        result = Cary.userObjects.GenericUserObject.prototype.getTypeName.apply (this);
    
    return result;
};

Cary.userObjects.UserIconGroup.prototype.getInfo = function ()
{
    var info = Cary.userObjects.GenericUserObject.prototype.getInfo.apply (this);
    
    info ['Icon path']    = 'path' in this.properties ? this.properties ['path'] : 'Default';
    info ['Num of icons'] = this.positions.length;
    
    return info;
};

Cary.userObjects.UserIconGroup.prototype.serialize = function ()
{
    var result = Cary.userObjects.GenericUserObject.prototype.serialize.apply (this, arguments);
    
    result.positions = this.positions;
    
    return result;
};

Cary.userObjects.UserIconGroup.prototype.deserialize = function (source)
{
    Cary.userObjects.GenericUserObject.prototype.deserialize.apply (this, arguments);
    
    this.positions = source.positions;
};

