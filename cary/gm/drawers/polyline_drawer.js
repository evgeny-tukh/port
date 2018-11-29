Cary.drawers.PolylineDrawer = function (userObject)
{
    Cary.drawers.GenericDrawer.apply (this, arguments);
};

Cary.drawers.PolylineDrawer.prototype = Object.create (Cary.drawers.GenericDrawer.prototype);

Cary.drawers.PolylineDrawer.prototype.draw = function (map, options)
{
    if (Cary.tools.isNothing (options))
        options = {};
    
    var instance      = this;
    var mapObject     = Cary.checkMap (map);
    var style         = this.object.properties ['lineStyle'];
    var editable      = 'editMode' in options && options.editMode;
    var getBgColor    = options.getBgColor;
    var onVertexHover = options.onVertexHover;
    var clickable     = ('onClick' in options && options.onClick !== null) /*|| editable*/;
    var geodesic      = 'greatCircle' in options && options.greatCircle;
    var noBalloon     = 'noBalloon' in options && options.noBalloon;
    var dashed        = (style & Cary.userObjects.lineStyles.DASH) !== 0;
    var dotted        = (style & Cary.userObjects.lineStyles.DOT) !== 0;
    var arrowed       = (style & Cary.userObjects.lineStyles.ARROW) !== 0;
    var plOptions     = { clickable: clickable, draggable: false/*editable*/, editable: false/*editable*/, geodesic: geodesic, map: mapObject, strokeColor: this.object.properties.color,
                          strokeWeight: this.object.properties.lineWidth, visible: true, path: this.object.getGMPath () };
    var drawReally = !('createObject' in options) || options.createObject;
    var polyLine;
    
    if (dashed || dotted || arrowed)
    {
        var repeat;
        var lineSymbol;
        var iconOptions;

        if (arrowed)
        {
            lineSymbol = { path: 'M0 0 L 0 -10 L -2 -6 L 2 -6 L 0 -10', scale: 1, strokeOpacity: 1 };
            repeat     = '10px';
        }
        else if (dashed)
        {
            //lineSymbol  = { path: 'M 0,-2 0,0', strokeOpacity: 1, scale: 4 };
            lineSymbol  = { path: 'M 0,-1 0,0', strokeOpacity: 1, scale: 4 };
            repeat      = '10px';
        }
        else
        {
            lineSymbol  = { path: 'M 0,-1 0,0', strokeOpacity: 1, scale: 2 };
            repeat      = '10px';
        }

        iconOptions = { icon: lineSymbol, offset: '0', repeat: repeat };

        plOptions.icons = [iconOptions];

        if (dashed || dotted)
            plOptions.strokeWeight = 0;
    }

    if (drawReally)
    {
        polyLine = new google.maps.Polyline (plOptions);

        google.maps.event.addListener (polyLine, 'mouseover', onMouseOver);
        google.maps.event.addListener (polyLine, 'mouseout', onMouseOut);
    }
    else
    {
        polyLine = null;
    }
    
    this.object.drawObjects = polyLine === null ? [] : [polyLine];
    this.object.balloon     = null;
    this.plOptions          = plOptions;
    this.onMouseOver        = onMouseOver;
    this.onMouseOut         = onMouseOut;
    this.setUpVertex        = setUpVertex;
    this.editable           = editable;
    this.clickable          = clickable;
    
    if (drawReally && editable)
        instance.object.points.forEach (setUpVertex);
    
    return this.object.drawObjects;
    
    function setUpVertex (point)
    {
        var icon   = { path: google.maps.SymbolPath.CIRCLE, fillColor: getBgColor ? getBgColor (point) : 'yellow', strokeColor: plOptions.strokeColor, strokeWeight: 3, scale: 8 };
        var marker = new google.maps.Marker ({ draggable: true, icon: icon, map: map, position: { lat: point.lat, lng: point.lon } });

        marker.point = point;

        marker.addListener ('dragend', onDragEnd);
        marker.addListener ('drag', onDrag);

        if (onVertexHover)
            marker.addListener ('mouseover',
                                function (event)
                                {
                                    onVertexHover (point, event);
                                });
        
        instance.object.drawObjects.push (marker);

        function findPointIndexByMarker ()
        {
            var index;
            var i;

            for (i = 0, index = -1; i < instance.object.points.length; ++ i)
            {
                if (instance.object.points [i] === marker.point)
                {
                    index = i; break;
                }
            }

            return index;
        }

        function onDrag (event)
        {
            var index = findPointIndexByMarker ();

            if (index >= 0)
            {
                if ('onPointChanging' in options)
                    options.onPointChanging (index, { lat: event.latLng.lat (), lon: event.latLng.lng () });
            }
        }

        function onDragEnd (event)
        {
            var index = findPointIndexByMarker ();

            if (index >= 0)
            {
                var lat      = event.latLng.lat ();
                var lon      = event.latLng.lng ();
                var gmObject = instance.object.drawObjects [0];
                var path;
                
                switch (instance.object.type)
                {
                    case Cary.userObjects.objectTypes.POLYLINE:
                        path = gmObject.getPath (); break;
                        
                    case Cary.userObjects.objectTypes.POLYGON:
                        path = gmObject.getPaths ().getAt (0); break;

                    default:
                        return;
                }
                
                path.setAt (index, new google.maps.LatLng (lat, lon));

                switch (instance.object.type)
                {
                    case Cary.userObjects.objectTypes.POLYLINE:
                        gmObject.setPath (path); break;
                        
                    case Cary.userObjects.objectTypes.POLYGON:
                        gmObject.setPaths ([path]); break;
                }

                instance.object.points [index].lat = lat;
                instance.object.points [index].lon = lon;

                if ('onPointChanged' in options)
                    options.onPointChanged (index, instance.object.points [index]);
            }
        }
    }
    
    function onMouseOver (event)
    {
        if (!noBalloon && instance.object.balloon === null && !editable)
        {
            instance.object.balloon = new Cary.controls.MFBalloon (mapObject, event.latLng, { text: Cary.tools.unicode2char (instance.object.name) });
            
            instance.object.balloon.show ();
        }
    }
    
    function onMouseOut (event)
    {
        if (instance.object.balloon !== null)
        {
            instance.object.balloon.show (false);
            
            instance.object.balloon = null;
        }
    }
};

/*Cary.drawers.PolylineDrawer.prototype.undraw = function ()
{
    if (this.object.drawObjects.length > 0)
    {
        var i;
        
        for (i = 0; i < this.object.drawObjects.length; ++ i)
            this.object.drawObjects [i].setMap (null);
        
        this.object.drawObjects = [];
    }
};*/

Cary.drawers.PolylineDrawer.drawGeoPolyline = function (map, points, options)
{
    if (Cary.tools.isNothing (options))
        options = {};
    
    var color     = 'color' in options ? options.color : Cary.userObjects.UserPolyline.DEFAULT_COLOR;
    var style     = 'style' in options ? options.style : Cary.userObjects.lineStyles.SOLID;
    var lineWidth = 'lineWidth' in options ? options.lineWidth : 2;
    var editable  = 'editMode' in options && options.editMode;
    var clickable = 'onClick' in options && options.onClick !== null;
    var geodesic  = 'greatCircle' in options && options.greatCircle;
    var dashed    = (style & Cary.userObjects.lineStyles.DASH) !== 0;
    var dotted    = (style & Cary.userObjects.lineStyles.DOT) !== 0;
    var arrowed   = (style & Cary.userObjects.lineStyles.ARROW) !== 0;
    var plOptions = { clickable: clickable, draggable: editable, editable: editable, geodesic: geodesic, map: map, strokeColor: color,
                      strokeWeight: lineWidth, visible: true, path: points };
                  
    if (dashed || dotted || arrowed)
    {
        var path;
        var repeat;
        var lineSymbol;
        var iconOptions;

        if (arrowed)
        {
            lineSymbol = { path: 'M0 0 L 0 -10 L -2 -6 L 2 -6 L 0 -10', scale: 1, strokeOpacity: 1 };
            repeat     = '10px';
        }
        else if (dashed)
        {
            lineSymbol  = { path: 'M 0,-2 0,0', strokeOpacity: 1, scale: 4 };
            repeat      = '20px';
        }
        else
        {
            lineSymbol  = { path: 'M 0,-2 0,0', strokeOpacity: 1, scale: 4 };
            repeat      = '50px';
        }

        iconOptions = { icon: lineSymbol, offset: '0', repeat: repeat };

        plOptions.icons = [iconOptions];

        if (dashed || dotted)
            plOptions.strokeWeight = 0;
    }

    return new google.maps.Polyline (plOptions);
    /*return new google.maps.Polyline ({ clickable: clickable, draggable: editable, editable: editable, geodesic: geodesic, map: map, strokeColor: color,
                                       strokeWeight: 0, visible: true, path: points,
                                       icons: [{ icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 4 }, offset: '0', repeat: '20px' }] });*/
};
