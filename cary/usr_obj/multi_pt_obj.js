Cary.userObjects.MultiPointUserObject = function (name, points, properties)
{
    var instance = this;

    if (Cary.tools.isNothing (name))
        name = '';
    
    Cary.userObjects.GenericUserObject.apply (this, [name]);
    
    if (Cary.tools.isNothing (points))
        points = [];
    
    if (Cary.tools.isNothing (properties))
        properties = {};
    
    this.points     = [];
    this.properties = {};
    
    points.forEach (function (point) { instance.points.push (point); });
    
    for (var key in properties)
        this.properties [key] = properties [key];
};

Cary.userObjects.MultiPointUserObject.prototype = Object.create (Cary.userObjects.GenericUserObject.prototype);

Cary.userObjects.MultiPointUserObject.prototype.serialize = function ()
{
    var result = Cary.userObjects.GenericUserObject.prototype.serialize.apply (this, arguments);
    
    result.points     = this.points;
    result.properties = this.properties;
    
    return result;
};

Cary.userObjects.MultiPointUserObject.prototype.deserialize = function (source)
{
    var instance = this;
    
    Cary.userObjects.GenericUserObject.prototype.deserialize.apply (this, arguments);
    
    this.points     = [];
    this.properties = {};
    
    source.points.forEach (function (point) { instance.points.push (point); });
    
    for (var key in source.properties)
        this.properties [key] = source.properties [key];
};

Cary.userObjects.MultiPointUserObject.prototype.containsPoint = function (lat, lon)
{
};

Cary.userObjects.MultiPointUserObject.prototype.containsLeg = function (begin, end)
{
    
};

Cary.userObjects.GenericUserObject.prototype.checkProperty = function (name, defValue)
{
    if (!(name in this.properties))
        this.properties [name] = defValue;
};

Cary.userObjects.GenericUserObject.prototype.getGMPath = function ()
{
    var result = [];
    
    this.points.forEach (function (point) { result.push ({ lat: point.lat, lng: point.lon }); });
    
    return result;
};

Cary.userObjects.GenericUserObject.prototype.setGMPath = function (path)
{
    var instance = this;
    
    this.points = [];
    
    path.forEach (function (vertex) { instance.points.push ({ lat: vertex.lat (), lon: vertex.lng () }); });
};
