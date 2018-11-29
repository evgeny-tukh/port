Cary.userObjects.UserPolyline = function (name, points, properties)
{
    Cary.userObjects.MultiPointUserObject.apply (this, arguments);

    this.type = Cary.userObjects.objectTypes.POLYLINE;
    
    Cary.userObjects.MultiPointUserObject.prototype.checkProperty.apply (this, ['color', Cary.userObjects.UserPolyline.DEFAULT_COLOR]);
    Cary.userObjects.MultiPointUserObject.prototype.checkProperty.apply (this, ['lineWidth', 3]);
    Cary.userObjects.MultiPointUserObject.prototype.checkProperty.apply (this, ['lineStyle', Cary.userObjects.lineStyles.SOLID]);
};

Cary.userObjects.UserPolyline.prototype = Object.create (Cary.userObjects.MultiPointUserObject.prototype);

Cary.userObjects.UserPolyline.DEFAULT_COLOR = 'blue';

Cary.userObjects.objectTypes.POLYLINE = 2;

Cary.userObjects.UserPolyline.prototype.createDrawer = function ()
{
    return new Cary.drawers.PolylineDrawer (this);
};

Cary.userObjects.UserPolyline.drawPolyline = function (map, points, options)
{
    if (Cary.tools.isNothing (options))
        options = {};
    
    var color  = 'color' in options ? options.color : Cary.userObjects.UserPolyline.DEFAULT_COLOR;
    var style  = 'style' in options ? options.style : Cary.userObjects.lineStyles.SOLID;
    var object = new Cary.userObjects.UserPolyline ('temp', points, { color: color, style: style });
    var drawer = object.createDrawer ();
    
    return drawer.draw (map);
};

Cary.userObjects.UserPolyline.prototype.getLastPoint = function ()
{
    return this.points.length > 0 ? this.points [this.points.length-1] : null;
};

Cary.userObjects.UserPolyline.prototype.getTypeName = function ()
{
    var result;
    
    if (this.type === Cary.userObjects.objectTypes.POLYLINE)
        result = 'Polyline';
    else
        result = Cary.userObjects.GenericUserObject.prototype.getTypeName.apply (this);
    
    return result;
};

Cary.userObjects.UserPolyline.prototype.getInfo = function ()
{
    var info = Cary.userObjects.GenericUserObject.prototype.getInfo.apply (this);
    
    info ['Num of points'] = this.points.length.toString ();
    
    return info;
};

Cary.userObjects.UserPolyline.prototype.getPropertyStringValue = function (propName, propValue)
{
    var value;
    
    if (propName === 'lineStyle')
    {
        value = '';
        
        if (propValue & Cary.userObjects.lineStyles.ARROW)
            value += 'arrowed ';
        
        if (propValue & Cary.userObjects.lineStyles.DASH)
            value += 'dashed ';
        
        if (propValue & Cary.userObjects.lineStyles.DOT)
            value += 'dotted ';
        
        if (propValue & Cary.userObjects.lineStyles.SOLID)
            value += 'solid ';
        
        if (value === '')
            value = 'Not defined';
    }
    else
    {
        value = propValue;
    }
    
    return value;
};

