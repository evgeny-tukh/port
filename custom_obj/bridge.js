userObj.BridgeContour = function (name, points, scale, id, deviceID)
{
    userObj.WaterLevelContour.apply (this, arguments);

    this.userType  = userObj.types.BRIDGE_CONTOUR;
};

userObj.types.BRIDGE_CONTOUR = 6;

userObj.BridgeContour.prototype = Object.create (userObj.WaterLevelContour.prototype);

userObj.BridgeContour.prototype.getUserTypeName = function ()
{
    return 'Мост';
};

userObj.BridgeContour.prototype.createDrawer = function ()
{
    return new userObj.drawers.BridgeContourDrawer (this);
};

