userObj.Berth = function (name, point1, point2, length, depth)
{
    var properties = { color: 'blue', lineWidth: 5, lineStyle: Cary.userObjects.lineStyles.SOLID };
        
    userObj.UserPolyline.apply (this, [name, [point1, point2], properties]);
    
    this.userProps ['length'] = Cary.tools.isNothing (length) ? null : length;
    this.userProps ['depth']  = Cary.tools.isNothing (depth) ? null : depth;
};

userObj.Berth.prototype = Object.create (userObj.UserPolyline.prototype);

userObj.types.BERTH = 2;

userObj.Berth.prototype.getUserTypeName = function ()
{
    var result;
    
    if (this.userType === userObj.types.BERTH)
        result = 'Berth';
    else
        result = userObj.UserPolyline.prototype.getUserTypeName.apply (this);
    
    return result;
};
