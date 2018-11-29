Cary.drawers.IconGroupDrawer = function (userObject)
{
    Cary.drawers.GenericDrawer.apply (this, arguments);
};

Cary.drawers.IconGroupDrawer.prototype = Object.create (Cary.drawers.GenericDrawer.prototype);

Cary.drawers.IconGroupDrawer.prototype.draw = function (map, options)
{
    var instance = this;
    
    if (Cary.tools.isNothing (options))
        options = {};
    
    var mapObject = Cary.checkMap (map);
    var editable  = 'editMode' in options && options.editMode;
    var clickable = 'onClick' in options && options.onClick !== null;
    var markerOpt = { clickable: clickable, draggable: editable, map: mapObject, zIndex: 100, visible: true, title: this.object.name, position: {}, icon: {} };
                  
    if ('path' in this.object.properties)
        markerOpt.icon.url = this.object.properties.path;

    this.object.drawObjects = [];
    
    this.object.positions.forEach (function (position)
                                   {
                                       markerOpt.position.lat = position.lat;
                                       markerOpt.position.lng = position.lon;
                                       
                                       instance.object.drawObjects.push (new google.maps.Marker (markerOpt));
                                   });
    
    return this.object.drawObjects;
};
