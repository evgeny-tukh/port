Cary.drawers.IconDrawer = function (userObject)
{
    Cary.drawers.GenericDrawer.apply (this, arguments);
};

Cary.drawers.IconDrawer.prototype = Object.create (Cary.drawers.GenericDrawer.prototype);

Cary.drawers.IconDrawer.prototype.draw = function (map, options)
{
    if (Cary.tools.isNothing (options))
        options = {};
    
    var mapObject = Cary.checkMap (map);
    var editable  = 'editMode' in options && options.editMode;
    //var clickable = 'onClick' in options && options.onClick !== null;
    var markerOpt = { clickable: true/*clickable*/, draggable: editable, map: mapObject, zIndex: 100, visible: true, title: this.object.name, 
                      position: { lat: this.object.position.lat, lng: this.object.position.lon }, icon: {} };
                  
    if ('path' in this.object.properties)
        markerOpt.icon.url = this.object.properties.path;

    this.object.drawObjects = [new google.maps.Marker (markerOpt)];
    
    return this.object.drawObjects;
};
