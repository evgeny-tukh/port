userObj.RouteObject = function (name, points, properties)
{
    Cary.userObjects.UserPolyline.apply (this, arguments);
    
    Cary.userObjects.MultiPointUserObject.prototype.checkProperty.apply (this, ['color', userObj.RouteObject.DEFAULT_COLOR]);
    Cary.userObjects.MultiPointUserObject.prototype.checkProperty.apply (this, ['lineWidth', 2]);
    Cary.userObjects.MultiPointUserObject.prototype.checkProperty.apply (this, ['lineStyle', Cary.userObjects.lineStyles.DASHED]);

    this.userType    = userObj.types.ROUTE;
    this.activePoint = null;
};

userObj.RouteObject.DEFAULT_COLOR = 'red';

userObj.RouteObject.prototype = Object.create (Cary.userObjects.UserPolyline.prototype);

userObj.types.ROUTE = 10;

userObj.RouteObject.prototype.createDrawer = function ()
{
    return new userObj.drawers.RouteDrawer (this);
};

userObj.RouteObject.prototype.getTypeName = function ()
{
    return stringTable.route;
};

userObj.RouteObject.prototype.getEdgeColor = function ()
{
    return 'red';
};

userObj.RouteObject.STOP_TIME = 'stopTime_';
userObj.RouteObject.NAME      = 'name_';

userObj.RouteObject.prototype.deserialize = function (source)
{
    Cary.userObjects.UserPolyline.prototype.deserialize.apply (this, arguments);
    
    for (var i = 0; i < source.points.length; ++ i)
    {
        var point       = this.points [i];
        var stopTimeKey = userObj.RouteObject.STOP_TIME + i.toString ();
        var nameKey     = userObj.RouteObject.NAME + i.toString ();
        
        if (stopTimeKey in source.userProps)
            point.stopTime = parseFloat (source.userProps [stopTimeKey]);
        
        if (nameKey in source.userProps)
            point.name = source.userProps [nameKey];
    }
};

userObj.RouteObject.prototype.serialize = function ()
{
    var result = Cary.userObjects.UserPolyline.prototype.serialize.apply (this, arguments);

    for (var i = 0; i < this.points.length; ++ i)
    {
        var point = this.points [i];
        
        if ('stopTime' in point)
            result.userProps [userObj.RouteObject.STOP_TIME + i.toString ()] = point.stopTime.toFixed (1);
        
        if ('name' in point)
            result.userProps [userObj.RouteObject.NAME + i.toString ()] = point.name;
    }

    return result;
};

userObj.RouteObject.prototype.getLegs = function (sog)
{
    var legs = [];
    
    for (var i = 1, beginTime = 0; i < this.points.length; i ++)
    {
        var leg = [this.points [i-1], this.points [i]];
        
        leg.distance = Cary.geo.calcSphericalRange (leg [0], leg [1]);
        
        if (sog)
        {
            leg.stopTime        = this.points [i-1].stopTime ? (this.points [i-1].stopTime * 3600000) : 0;
            leg.passTime        = leg.distance / sog;
            leg.beginTimeOffset = beginTime;
            leg.passTime       *= 3600000;
            leg.passTime       += leg.stopTime;
            leg.endTimeOffset   = beginTime + leg.passTime;
            beginTime           = leg.endTimeOffset;
        }
        
        legs.push (leg);
    }
    
    return legs;
};

userObj.RouteObject.prototype.getPositionOfPassage = function (sog, passageTime)
{
    var result = null;
    var lastPassedLeg;
    
    for (var i = 1, lastPassedLeg = -1; i < this.points.length; ++ i)
    {
        var begin    = this.points [i-1];
        var end      = this.points [i];
        var distance = Cary.geo.calcSphericalRange (begin, end);
        var time     = distance / sog;
        var stopTime = begin.stopTime ? begin.stopTime : 0;
        var fullTime = time + stopTime;
        var course;
        
        if (passageTime > fullTime)
        {
            lastPassedLeg = i;
            passageTime  -= fullTime;
        }
        else if (passageTime > stopTime)
        {
            passageTime -= stopTime;
            distance     = passageTime * sog;
            result       = {};
            
            result.course   = Cary.geo.calcSphericalCourse (begin, end);
            result.position = Cary.geo.calcSphericalPosition (begin, result.course, distance);
            result.legRange = distance;
            result.stopped  = false;
            result.finished = false;
            
            break;
        }
        else
        {
            result = { position: begin, course: Cary.geo.calcSphericalCourse (begin, end), stopped: true, finished: false, legRange: 0 }; break;
        }
    }
    
    if (lastPassedLeg >= (this.points.length - 2))
        result.finished = true;
    
    return result;
};
