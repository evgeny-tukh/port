userObj.WaterLevelMarker = function (name, position, properties)
{
    Cary.userObjects.UserIcon.apply (this, arguments);

    this.userType           = userObj.types.WL_MARKER;
    this.level              = 0.0;
    this.userProps.deviceID = null;
};

userObj.types.WL_MARKER = 8;

userObj.WaterLevelMarker.prototype = Object.create (Cary.userObjects.UserIcon.prototype);

userObj.WaterLevelMarker.prototype.getUserTypeName = function ()
{
    return 'Уровнемер';
};

userObj.WaterLevelMarker.prototype.createDrawer = function ()
{
    return new userObj.drawers.WaterLevelMarkerDrawer (this);
};

