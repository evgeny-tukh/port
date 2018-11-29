userObj.drawers.WaterLevelMarkerDrawer = function (userObject)
{
    Cary.drawers.IconDrawer.apply (this, arguments);
};

userObj.drawers.WaterLevelMarkerDrawer.prototype = Object.create (Cary.drawers.IconDrawer.prototype);

userObj.drawers.WaterLevelMarkerDrawer.prototype.draw = function (map, options)
{
    var drawObjects = Cary.drawers.IconDrawer.prototype.draw.apply (this, arguments);
    var marker      = drawObjects [0];
    var icon        = marker.getIcon ();
    var text        = this.object.name;
    
    if (this.object.level)
        text += '(' + this.object.level.toFixed (1) + 'м)';
    
    icon.labelOrigin = new google.maps.Point (13, -8);
    
    marker.setLabel ({ text: text, color: 'blue', fontSize: '12px', fontWeight: 'bold' });
};
