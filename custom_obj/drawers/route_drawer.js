userObj.drawers.RouteDrawer = function (userObject)
{
    Cary.drawers.PolylineDrawer.apply (this, arguments);
};

userObj.drawers.RouteDrawer.prototype = Object.create (Cary.drawers.PolygonDrawer.prototype);

userObj.drawers.RouteDrawer.prototype.draw = function (map, options)
{
    var tagVisible = false;
    var editMode   = options && options.editMode;
    var object     = this.object;
    
    if (!options)
        options = {};
    
    options.noBalloon  = true;
    options.clickable  = true;
    options.onVertexHover = function (point)
                            {
                                for (var i = 0; i < object.points.length; ++ i)
                                {
                                    if (object.points [i] === point)
                                    {
                                        globalInterface.pointsPane.selectPoint (i);
                                        
                                        object.activePoint = point; break;
                                    }
                                }
                            };
    options.getBgColor    = function (point)
                            {
                                return object.activePoint === point ? 'red' : 'yellow';
                            };
    
    object.properties.color     = 'red';
    object.properties.lineWidth = 2;
    
    Cary.drawers.PolylineDrawer.prototype.draw.apply (this, [map, options]); 

    if (!options.editMode)
        object.points.forEach (drawWaypoint);

    this.setOptions ('clickable', true);

    function drawWaypoint (waypoint)
    {
        var isActive      = object.activePoint === waypoint;
        var markerOptions = { position : { lat: waypoint.lat, lng: waypoint.lon },
                              map: map, title: waypoint.name ? waypoint.name : '', draggable: false, zIndex: 100,
                              icon: { path: google.maps.SymbolPath.CIRCLE, scale: 5, fillColor: isActive ? 'green' : 'yellow', fillOpacity: 1.0,
                                      strokeColor: object.properties.fillColor, strokeWeight: 2 }
                        };

        object.drawObjects.push (new google.maps.Marker (markerOptions));
    }
};

