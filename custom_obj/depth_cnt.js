userObj.AlertableContour = function (name, points)
{
    var properties = { color: 'black', lineStyle: Cary.userObjects.lineStyles.SOLID, lineWidth: 3, fillColor: 'blue', opacity: 0.3 };
    
    Cary.userObjects.UserPolygon.apply (this, [name, points, properties]);

    this.userType = userObj.types.ALERTABLE_CONTOUR;
    this.drawMode = userObj.AlertableContour.drawModes.USUAL;
};

userObj.AlertableContour.prototype = Object.create (Cary.userObjects.UserPolygon.prototype);

userObj.types.ALERTABLE_CONTOUR = 2;
userObj.types.DEPTH_CONTOUR     = 3;

userObj.AlertableContour.drawModes = { USUAL: 0, ALERTED: 1 };

userObj.AlertableContour.prototype.createDrawer = function ()
{
    return new userObj.drawers.DepthContourDrawer (this);
};

userObj.AlertableContour.prototype.alert = function (mapObj, objectCallbacks)
{
    var instance = this;
    
    this.timer        = setInterval (checkDrawMode, 500);
    this.lastDrawMode = userObj.AlertableContour.drawModes.ALERTED;
    this.drawMode     = userObj.AlertableContour.drawModes.ALERTED;
    this.drawer       = this.createDrawer ();
    
    this.drawer.drawAlerted (mapObj, objectCallbacks);
    
    function checkDrawMode ()
    {
        if (instance.drawMode !== instance.lastDrawMode)
        {
            instance.drawer.undraw ();
            
            switch (instance.drawMode)
            {
                case userObj.AlertableContour.drawModes.USUAL:
                    instance.drawer.draw (mapObj); break;
                    
                case userObj.AlertableContour.drawModes.ALERTED:
                    instance.drawer.drawAlerted (mapObj); break;
            }
            
            instance.lastDrawMode = instance.drawMode;
        }
        else if (instance.selected)
        {
            instance.drawer.flash ();
        }
    }
};

userObj.DepthContour = function (name, points, maxDraught, id)
{
    var properties = { color: 'black', lineStyle: Cary.userObjects.lineStyles.SOLID, lineWidth: 3, fillColor: 'blue', opacity: 0.3 };
    
    userObj.AlertableContour.apply (this, [name, points, properties]);

    this.userType   = userObj.types.DEPTH_CONTOUR;
    this.wlmLevel   = 0.0;
    this.wlmAverage = 0.0;
    
    this.userProps.maxDraught = Cary.tools.isNothing (maxDraught) ? 10 : maxDraught;
    this.userProps.id         = Cary.tools.isNothing (id) ? 'dc' : id;
    
    this.getLevel ();
};

userObj.DepthContour.prototype = Object.create (userObj.AlertableContour.prototype);

userObj.DepthContour.prototype.getLevel = function (timestamp)
{
    var instance = this;
    
    if (Cary.tools.isNothing (timestamp))
        timestamp = Cary.tools.getTimestamp ();
    
    getWaterLevelMeterRelativeLevel (this.userProps.deviceID, timestamp,
                                     function (data)
                                     {
                                         for (var i = 0; i < waterLevelAreas.objects.length; ++ i)
                                         {
                                             var area = waterLevelAreas.objects [i];
                                             
                                             if (area.userProps.deviceID === instance.userProps.deviceID)
                                             {
                                                var offset = (area.baseLevel && area.baseValue) ? area.baseLevel + area.baseValue : 0;
                                                    
                                                instance.wlmAverage = parseFloat (area.userProps.average);
                                                instance.wlmLevel   = (offset ? (offset - data [0].level) : data [0].level);
                                                
                                                break;
                                             }
                                         }
                                     });
};

userObj.DepthContour.prototype.getInfo = function ()
{
    var info = Cary.userObjects.UserPolygon.prototype.getInfo.apply (this);
    
    info ['Max draught'] = this.userProps.maxDraught.toFixed (1);
    
    return info;
};

userObj.DepthContour.prototype.getUserTypeName = function ()
{
    return 'Контур глубины';
};

userObj.DepthContour.prototype.getEdgeColor = function ()
{
    var result;
    
    if ('maxDraught' in this.userProps)
    {
        if (this.userProps.maxDraught <= 9.4)
            result = 'red';
        else if (this.userProps.maxDraught <= 9.7)
            result = 'yellow';
        else
            result = 'green';
    }
    else
    {
        result = Cary.userObjects.UserPolygon.prototype.getFillColor.apply (this, arguments);
    }
    
    return result;
};

userObj.DepthContour.prototype.getFillColor = function ()
{
    /*var result;
    
    if ('maxDraught' in this.userProps)
    {
        if (this.userProps.maxDraught <= 9.4)
            result = 'red';
        else if (this.userProps.maxDraught <= 9.7)
            result = 'yellow';
        else
            result = 'green';
    }
    else
    {
        result = Cary.userObjects.UserPolygon.prototype.getFillColor.apply (this, arguments);
    }
    
    return result;*/
    return this.wlmLevel >= this.wlmAverage ? 'green' : 'red';
};

userObj.DepthContour.prototype.beforeShowHide = function (show)
{
    if (show && !Cary.tools.isNothing (this.drawer))
        this.drawer.undraw ();
};

userObj.DepthContour.prototype.deselect = function ()
{
    this.selected = false;
    
    this.drawer.stopFlashing ();    
};

userObj.DepthContour.prototype.deserialize = function (source)
{
    Cary.userObjects.MultiPointUserObject.prototype.deserialize.apply (this, arguments);
    
    if (typeof (this.userProps.maxDraught) === 'string')
        this.userProps.maxDraught = parseFloat (this.userProps.maxDraught);
    
    this.getLevel ();
};

userObj.RedrawableContour = function (name, points)
{
    var properties = { color: 'black', lineStyle: Cary.userObjects.lineStyles.SOLID, lineWidth: 3, fillColor: 'blue', opacity: 0.3 };
    
    Cary.userObjects.UserPolygon.apply (this, [name, points, properties]);

    this.userType = userObj.types.REDRAWABLE_CONTOUR;
};

userObj.RedrawableContour.prototype = Object.create (Cary.userObjects.UserPolygon.prototype);

userObj.types.REDRAWABLE_CONTOUR = 4;

userObj.RedrawableContour.prototype.createDrawer = function ()
{
    return new Cary.drawers.PolygonDrawer (this);
};

userObj.WaterLevelContour = function (name, points, scale, id, deviceID)
{
    var properties = { color: 'black', lineStyle: Cary.userObjects.lineStyles.SOLID, lineWidth: 2, fillColor: 'blue', opacity: 0.3 };
    
    userObj.RedrawableContour.apply (this, [name, points, properties]);

    this.userType = userObj.types.WATERLEVEL_CONTOUR;
    this.level    = 0.0;
    
    if (Cary.tools.isNothing (scale))
        scale = userObj.WaterLevelContour.DEF_SCALE;
    
    this.userProps.scale    = scale;
    this.userProps.id       = Cary.tools.isNothing (id) ? 'wl' : id;
    this.userProps.deviceID = Cary.tools.isNothing (deviceID) ? 'unknown' : deviceID;
};

userObj.WaterLevelContour.DEF_SCALE = [{ level: 1000, color: 'green' }];

userObj.types.WATERLEVEL_CONTOUR = 5;

userObj.WaterLevelContour.prototype = Object.create (userObj.RedrawableContour.prototype);

userObj.WaterLevelContour.prototype.getUserTypeName = function ()
{
    return 'Уровень воды';
};


userObj.WaterLevelContour.prototype.getFillColor = function ()
{
    var i;
    var result = 'green';
    
    for (i = 0; i < this.userProps.scale.length; ++ i)
    {
        if (this.level < this.userProps.scale [i].level)
        {
            result = this.userProps.scale [i].color; break;
        }
    }
    
    return result;
};

userObj.WaterLevelContour.prototype.deserialize = function (source)
{
    Cary.userObjects.MultiPointUserObject.prototype.deserialize.apply (this, arguments);

    this.userProps.scale = 'scale' in source.userProps ? JSON.parse (source.userProps.scale) : userObj.WaterLevelContour.DEF_SCALE;
};

userObj.WaterLevelContour.prototype.serialize = function (source)
{
    var serialized = Cary.userObjects.MultiPointUserObject.prototype.serialize.apply (this, arguments);
    var result     = {};

    for (var key in serialized)
    {
        if (key !== 'userProps')
        {
            result [key] = serialized [key];
        }
        else
        {
            result [key] = {};
            
            for (var propName in serialized [key])
            {
                if (propName !== 'scale')
                    result [key][propName] = serialized [key][propName];
                else
                    result [key][propName] = JSON.stringify (serialized [key][propName]);
            }
        }
    }
    
    return result;
};

