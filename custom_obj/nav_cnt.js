userObj.NavContour = function (name, points, properties)
{
    Cary.userObjects.UserPolygon.apply (this, arguments);

    this.userType       = userObj.types.NAV_CONTOUR;
    this.vesselDraught  = null;
    this.offset         = null;
    this.tag            = null;
    this.tagFlasher     = null;
    
    Cary.userObjects.MultiPointUserObject.prototype.checkProperty.apply (this, ['areaDepth', 0.0]);
    Cary.userObjects.MultiPointUserObject.prototype.checkProperty.apply (this, ['maxDraft', 0.0]);
    Cary.userObjects.MultiPointUserObject.prototype.checkProperty.apply (this, ['opacity', Cary.userObjects.UserPolygon.DEFAULT_OPACITY]);
    Cary.userObjects.MultiPointUserObject.prototype.checkProperty.apply (this, ['limitationType', userObj.NavContour.limitationType.LIMITED_BELOW]);
};

userObj.NavContour.limitationType = { LIMITED_BELOW: 1, LIMITED_ABOVE: 2, LIMITED_DRAFT: 3 };
userObj.NavContour.hintModes      = { OFF: 0, FLASH: 1, ON_CLICK: 2 };
userObj.NavContour.hintMode       = userObj.NavContour.hintModes.OFF;

userObj.NavContour.prototype = Object.create (Cary.userObjects.UserPolygon.prototype);

userObj.NavContour.FORBIDDEN_COLOR = '#FF8800';
userObj.NavContour.ALLOWED_COLOR   = '#00FF00';
userObj.NavContour.NEUTRAL_COLOR   = '#AAAAAA';

userObj.types.NAV_CONTOUR = 7;

userObj.NavContour.prototype.createTag = function ()
{
    var averageLat = null,
        averageLon = null,
        bounds;

    if (this.points && this.points.length > 0)
    {
        averageLat = 0.0;
        averageLon = 0.0;
        
        this.points.forEach (function (point)
                             {
                                 averageLat += point.lat;
                                 averageLon += point.lon;
                             });

        averageLat /= this.points.length;
        averageLon /= this.points.length;
    }
    else if (this.type === Cary.userObjects.objectTypes.CIRCLE)
    {
        averageLat = parseFloat (this.properties.lat);
        averageLon = parseFloat (this.properties.lon);
    }

    if (averageLat !== null && averageLon !== null)
        this.tag = new Cary.controls.Tag (map.map, new google.maps.LatLng (averageLat, averageLon), this.getHintText (), 9, { 'text-align': 'left', width: 'fit-content', height: 'fit-content', padding: '5px', 'background-color': 'white' });
};

userObj.NavContour.prototype.getCurrentDepth = function ()
{
    var depth = parseFloat (this.userProps.areaDepth);
    
    if (this.offset)
        depth -= this.offset * 0.01;
    
    return depth;
};

userObj.NavContour.prototype.getCurrentMaxDraft = function ()
{
    var draft = 'maxDraft' in this.userProps ? parseFloat (this.userProps.maxDraft) : null;
    
    if (this.offset && draft && draft > 1.0)
        draft -= this.offset;
    
    return draft;
};

userObj.NavContour.prototype.getHintText = function ()
{
    var result;

    if (parseInt (this.userProps.limitationType) === userObj.NavContour.limitationType.LIMITED_DRAFT)
    {
        result = this.name + '\n' + stringTable.maxDraftDoc + ': ' + (Cary.tools.isNothing (this.userProps.maxDraft) ? stringTable.unknown : (this.userProps.maxDraft + stringTable.m));
        
        if (this.offset)
            result += '\n' + stringTable.maxDraftAct + ': ' + (parseFloat (this.userProps.maxDraft) - this.offset).toFixed (2) + stringTable.m + '\n' + stringTable.relChange + ': ' +
                      (- this.offset).toFixed (2) + stringTable.m;
    }
    else
    {
        result = this.name + '\n' + stringTable.areaDepthDoc + ': ' + this.userProps.areaDepth + stringTable.m;
        
        if (this.offset)
            result += '\n' + stringTable.areaDepthAct + ': ' + (parseFloat (this.userProps.areaDepth) - this.offset).toFixed (2) + stringTable.m + '\n' + stringTable.relChange + ': ' +
                      (- this.offset).toFixed (2) + stringTable.m;
    }

    return result;
};

userObj.NavContour.prototype.createDrawer = function ()
{
    if (this.type === Cary.userObjects.objectTypes.CIRCLE)
    {
        if (!this.position)
            this.position = { lat: parseFloat (this.properties.lat), lon: parseFloat (this.properties.lon) };
        
        if (!this.radius)
            this.radius = parseFloat (this.properties.radius);
    }

    return new userObj.drawers.NavContourDrawer (this);
};

userObj.NavContour.prototype.getTypeName = function ()
{
    return stringTable.navContour;
};

userObj.NavContour.prototype.getFillColor = function ()
{
    var result;
    
    if (this.vesselDraught && this.offset)
    {
        var actualDepth    = this.userProps.areaDepth ? parseFloat (this.userProps.areaDepth) - this.offset : 0;
        var actualMaxDraft = this.userProps.maxDraft? parseFloat (this.userProps.maxDraft) - this.offset : 0;
        
        switch (parseInt (this.userProps.limitationType))
        {
            case userObj.NavContour.limitationType.LIMITED_BELOW:
                result = actualDepth >= this.vesselDraught ? userObj.NavContour.ALLOWED_COLOR : userObj.NavContour.FORBIDDEN_COLOR; break;

            case userObj.NavContour.limitationType.LIMITED_ABOVE:
                result = actualDepth <= this.vesselDraught ? userObj.NavContour.ALLOWED_COLOR : userObj.NavContour.FORBIDDEN_COLOR; break;

            case userObj.NavContour.limitationType.LIMITED_DRAFT:
                result = actualMaxDraft >= this.vesselDraught ? userObj.NavContour.ALLOWED_COLOR : userObj.NavContour.FORBIDDEN_COLOR; break;

            default:
                result = userObj.NavContour.NEUTRAL_COLOR;
        }
    }
    else
    {
        result = userObj.NavContour.NEUTRAL_COLOR;
    }
if (result===userObj.NavContour.FORBIDDEN_COLOR)    
{
    var iii=0;
    ++iii;
}
    return result;
};

userObj.NavContour.prototype.getEdgeColor = function ()
{
    return 'black';
};
