/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var Cary = { checkMap: checkMap, tools: {}, controls: {}, symbols: {}, settings: {}, userObjects: {}, drawers: {}, ui: {}, geo: {} };

Cary.symbols.cross         = '✖';
Cary.symbols.check         = '✔';
Cary.symbols.square        = '◻';
Cary.symbols.filledSquare  = '◼';
Cary.symbols.crossedSquare = '⊠';
Cary.symbols.radioOff      = '◎';
Cary.symbols.radioOn       = '◉';
Cary.symbols.circle        = '◯';
Cary.symbols.filledCircle  = '⚫';
Cary.symbols.unchecked     = '☐';
Cary.symbols.checked       = '☑';
Cary.symbols.crossed       = '☒';
Cary.symbols.heavyCheck    = '✅';
Cary.symbols.heavyCross    = '❎';
Cary.symbols.crossMark     = '❌';
Cary.symbols.raisedHand    = '✋';
Cary.symbols.raisedFist    = '✊';
Cary.symbols.toLeft2       = '«';
Cary.symbols.toLeft3       = '⋘';
Cary.symbols.toRight2      = '»';
Cary.symbols.toRight3      = '⋙';
Cary.symbols.degree        = '°';
Cary.symbols.rightArrow    = '►';
Cary.symbols.downArrow     = '▼';
Cary.symbols.magnifier1    = '🔍';
Cary.symbols.magnifier2    = '🔎';
Cary.symbols.pause         = '❚❚';
Cary.symbols.resume        = '❚►';
Cary.symbols.magnifier3    = '&#x1F50D;';
Cary.symbols.magnifier4    = '&#x1F50E;';
Cary.symbols.clip          = '📎'; // '&#128206;';

function checkMap (map)
{
    return (map !== null && 'map' in map) ? map.map : map;
}

Cary.Map = function ()
{
    this.map        = null;
    this.mapDiv     = null;
    this.locker     = null;
    this.globals    = {};
    this.mapOptions = { center: { lat: 59.921209, lng: 30.199651 },
                        clickableIcons: false,
                        disableDefaultUI: true,
                        keyboardShortcuts: false,
                        mapTypeControl: false,
                        panControl: false,
                        rotateControl: false,
                        scaleControl: false,
                        streetViewControl: false,
                        zoom: 10 };
};

Cary.Map.prototype.addEventListener = function (eventName, handler, once)
{
    var listener;
    
    if (Cary.tools.isNothing (once))
        once = false;
    
    if (this.map !== null)
    {
        if (once)
            listener = google.maps.event.addListenerOnce (this.map, eventName, handler);
        else
            listener = google.maps.event.addListener (this.map, eventName, handler);
    }
    else
    {
        listener = null;
    }
    
    return listener;
};

Cary.Map.prototype.addDomListener = function (eventName, handler)
{
    var listener;
    
    if (this.map !== null)
        listener = google.maps.event.addDomListener (this.map, eventName, handler);
    else
        listener = null;
    
    return listener;
};

Cary.Map.prototype.stopEventListener = function (listener)
{
    google.maps.event.removeListener (listener);
};

Cary.Map.prototype.attach = function (div)
{
    this.mapDiv = div;
};

Cary.Map.prototype.zoomIn = function ()
{
    if (this.map !== null)
        this.map.setZoom (this.map.getZoom () + 1);
};

Cary.Map.prototype.zoomOut = function ()
{
    if (this.map !== null)
    {
        var curZoom = this.map.getZoom ();
        
        if (curZoom > 0)
            this.map.setZoom (curZoom - 1);
    }
};

Cary.Map.prototype.createMap = function ()
{
    this.map = new google.maps.Map (this.mapDiv, this.mapOptions);
    
    //if (this.locker === null)
    //    this.locker = new Cary.controls.MapLocker (this.map, false);
};

Cary.Map.prototype.setupPredefinedBaseMaps = function (mask)
{
    if (Cary.tools.isNothing (mask))
        mask = Cary.maps.baseMaps.AllMaps;
    
    Cary.maps.baseMaps.addToMap (this.map, mask);
};

Cary.Map.prototype.enumPredefinedBaseMaps = function (callback)
{
    Cary.maps.baseMaps.predefinedMaps.forEach (callback);    
};

Cary.Map.prototype.enumPredefinedOverlayMaps = function (callback)
{
    Cary.maps.overlayMaps.predefinedMaps.forEach (callback);    
};

Cary.Map.prototype.selectBaseMap = function (index)
{
    Cary.maps.baseMaps.select (this.map, index);
};

Cary.Map.prototype.showOverlayLayer = function (index, show)
{
    Cary.maps.overlayMaps.showOverlayLayer (this.map, index, show);
};

Cary.Map.prototype.isOverlayLayerVisible = function (index)
{
    return Cary.maps.overlayMaps.isOverlayLayerVisible (this.map, index);
};

Cary.Map.prototype.createPosIndicator = function (location, options)
{
    return new Cary.controls.PosIndicator (this.map, location, options);
};

Cary.Map.prototype.createImgButton = function (location, imgSource, options)
{
    return new Cary.controls.ImgButton (this.map, location, imgSource, options);
};

Cary.Map.prototype.createMapMenu = function (position, items, options)
{
    return new Cary.controls.MapMenu (this.map, position, items, options);
};

Cary.Map.prototype.createGMPanel = function (location, options)
{
    return new Cary.controls.GMPanel (this.map, location, options);
};

Cary.Map.prototype.addCustomBaseMap = function (mapID, tileSource, flag)
{
    Cary.maps.baseMaps.predefinedMaps.push ( new Cary.maps.baseMaps.CustomMapType (mapID, tileSource, flag));
};

Cary.Map.prototype.getBaseMapIndex = function (flag)
{
    return Cary.maps.baseMaps.getBaseMapIndex (flag);
};

Cary.Map.prototype.getOverlayIndex = function (flag)
{
    return Cary.maps.overlayMaps.getOverlayIndex (flag);
};

Cary.Map.prototype.removeControl = function (control)
{
    control.remove (this.map);
};

Cary.Map.prototype.lock = function (onClick)
{
    if (Cary.tools.isNothing (onClick))
        onClick = null;
    
    if (this.locker === null)
        this.locker = new Cary.controls.MapLocker (this.map, true, onClick);
    
    this.locker.show (true);
};

Cary.Map.prototype.unlock = function ()
{
    if (this.locker !== null)
        this.locker.show (false);
};

Cary.Map.prototype.drawUserObject = function (object, show)
{
    if (Cary.tools.isNothing (object.drawer))
        object.drawer = object.createDrawer ();
    
    if (Cary.tools.isNothing (show))
        show = true;
    
    object.beforeShowHide (show);
    
    if (show)
        object.drawer.draw (this.map);
    else
        object.drawer.undraw ();
};

Cary.Map.prototype.insertIcon = function (name, lat, lon, options, factory, iconData)
{
    var props = {};
    var icon;
    
    if (Cary.tools.isNothing (options))
        options = {};
    
    if ('path' in options)
        props.path = options.path;

    if (Cary.tools.isNothing (factory))
        factory = function (name, lat, lom, props)
                  {
                      return new Cary.userObjects.UserIcon (name, { lat: lat, lon: lon }, props);
                  };

    icon = factory (name, lat, lon, props, iconData);
    
    if ('visible' in options && options.visible)
    {
        icon.drawer = icon.createDrawer ();
        
        icon.drawer.draw (this.map);
    }
    
    return icon;
};

Cary.Map.prototype.clientToMap = function (x, y)
{
    var point = this.clientToGeo (x, y);
    
    return { lat: point.lat (), lon: point.lng () };
};

Cary.Map.prototype.Interface = function (callbacks)
{
    if (Cary.tools.isNothing (callbacks))
        callbacks = {};
    
    for (var key in callbacks)
        this [key] = callbacks [key];
};

Cary.Map.prototype.getPolylineBounds = function (points)
{
    var result;
    
    if (points && points.length > 0)
    {
        var point  = { lat: points [0].lat, lng: points [0].lon };
        var bounds = new google.maps.LatLngBounds (point, point);
        var i;
        
        for (i = 1; i < points.length; ++ i)
            bounds.extend ({ lat: points [i].lat, lng: points [i].lon });
        
        result = bounds;
    }
    else
    {
        result = null;
    }
    
    return result;
};

Cary.Map.prototype.localizePolyline = function (points)
{
    if (points)
    {
        if (points.length === 1)
        {
            this.map.setCenter ({ lat: points [0].lat, lng: points [0].lon });
            this.map.setZoom (16);
        }
        else if (points.length > 0)
        {
            var point  = { lat: points [0].lat, lng: points [0].lon };
            var bounds = new google.maps.LatLngBounds (point, point);
            var i;
        
            for (i = 1; i < points.length; ++ i)
                bounds.extend ({ lat: points [i].lat, lng: points [i].lon });

            this.map.fitBounds (bounds);
        }
    }
};

Cary.Map.prototype.plotPolyline = function (startX, startY, callbacks, tempLegColor, initialObject, objectType, userType, createUserObject)
{
    var start     = this.clientToGeo (startX, startY);
    var points    = [{ lat: start.lat (), lon: start.lng () }];
    var object    = Cary.tools.isNothing (initialObject) ? this.createUserPolyline ('New object', points, null, objectType, userType, createUserObject) : initialObject;
    var drawer    = object.createDrawer ();
    var mouseMove = this.addEventListener ('mousemove', onMouseMove);
    var click     = this.addEventListener ('click', onClick);
    var tempLeg   = null;
    var instance  = this;
    var interface = new Cary.Map.prototype.Interface ({ stop: stop, save: save, changePoint: changePoint, newPoint: newPoint, deletePoint: deletePoint,
                                                        getObject: function () { return object; }, drawDraggable: drawDraggable });
    var balloon   = new Cary.controls.Balloon (this, { x: startX, y: startY, horOffset: 20, verOffset: 20, text: 'aaa' });
    
    object.drawer = drawer;
    
    //drawer.draw (instance.map);
    drawDraggable (callbacks);
    
    if ('onNewPoint' in callbacks)
        callbacks.onNewPoint (start.lat (), start.lng ());
        
    if (Cary.tools.isNothing (callbacks))
        callbacks = {};
    
    if (Cary.tools.isNothing (tempLegColor))
        tempLegColor = 'red';
    
    return interface;
    
    function changePoint (index, point)
    {
        drawer.undraw ();
        
        if (tempLeg !== null)
        {
            tempLeg.setMap (null);
        
            tempLeg = null;
        }
        
        object.points [index].lat = point.lat;
        object.points [index].lon = point.lon;
        
        drawer.draw (instance.map);
    }
    
    function newPoint (point)
    {
        drawer.undraw ();
        
        if (tempLeg !== null)
        {
            tempLeg.setMap (null);
        
            tempLeg = null;
        }
        
        object.points.push ({ lat: point.lat, lon: point.lon });

        //drawer.draw (instance.map);
        drawDraggable (callbacks);
    }
    
    function deletePoint (index)
    {
        drawer.undraw ();
        
        if (tempLeg !== null)
        {
            tempLeg.setMap (null);
        
            tempLeg = null;
        }
        
        object.points.splice (index, 1);

        //drawer.draw (instance.map);
        drawDraggable (callbacks);
    }
    
    function stop ()
    {
        instance.stopEventListener (mouseMove);
        instance.stopEventListener (click);

        // Mark handlers as invalid
        mouseMove = null;
        click     = null;
        
        if (drawer !== null)
            drawer.undraw ();
        
        if (tempLeg !== null)
        {
            tempLeg.setMap (null);

            tempLeg = null;
        }
        
        if (balloon !== null)
        {
            balloon.close ();
            
            balloon = null;
        }
    }

    function drawDraggable (callbacks)
    {
        var options = { editMode: true, draggable: true, noBalloon: true };
        
        for (var key in callbacks)
            options [key] = callbacks [key];
        
        drawer.undraw ();
        drawer.draw (instance.map, options);
    }
    
    function save ()
    {
        object.save ();
    }
    
    function onClick (event)
    {
        // Process only if the handler is not cancelled "on a fly:
        if (click !== null)
        {
            var lat = event.latLng.lat ();
            var lon = event.latLng.lng ();

            drawer.undraw ();

            if (tempLeg !== null)
            {
                tempLeg.setMap (null);

                tempLeg = null;
            }

            object.points.push ({ lat: lat, lon: lon });

            if ('onNewPoint' in callbacks)
                callbacks.onNewPoint (lat, lon);

            // The handler might be cancelled during onNewPoint so we check again
             if (click !== null)
                 drawDraggable (callbacks);
                 //drawer.draw (instance.map);
        }
    }
    
    function onMouseMove (event)
    {
        // Process only if the handler is not cancelled "on a fly:
        if (mouseMove !== null)
        {
            var lastPoint = object.getLastPoint ();
            var points    = [{ lat: lastPoint.lat, lng: lastPoint.lon }, event.latLng];
            var rangeBrg  = Cary.geo.calcRLRangeAndBearing2 (lastPoint.lat, lastPoint.lon, event.latLng.lat (), event.latLng.lng ());

            if (tempLeg !== null)
                tempLeg.setMap (null);

            tempLeg = Cary.drawers.PolylineDrawer.drawGeoPolyline (instance.map, points, { color: tempLegColor, lineWidth: 3, style: Cary.userObjects.lineStyles.DASH });

            balloon.setPosition (event.latLng.lat (), event.latLng.lng ());
            balloon.setText ((rangeBrg.range * 1.852).toFixed (3) + 'km\n' + Cary.tools.formatFloatWithLZ (rangeBrg.bearing, 5, 1) + Cary.symbols.degree);
        }
    }
};

Cary.tools.getTimestamp = function ()
{
    return new Date ().getTime ();
};
    
Cary.tools.dateAddDays = function (timestamp, numOfDays)
{
    return new Date (timestamp + numOfDays * 24 * 3600000).getTime ();
};
    
Cary.tools.formatDate = function (timestamp)
{
    var dateTime = new Date (timestamp);
    
    return Cary.tools.formatNumberWithLZ (dateTime.getDate (), 2) + '.' + 
           Cary.tools.formatNumberWithLZ (dateTime.getMonth () + 1, 2) + '.' + 
           Cary.tools.formatNumberWithLZ (dateTime.getFullYear (), 4);
};

Cary.tools.formatTime = function (timestamp, showSeconds)
{
    var dateTime = new Date (timestamp);
    var result;
    
    if (Cary.tools.isNothing (showSeconds))
        showSeconds = true;
    
    result = Cary.tools.formatNumberWithLZ (dateTime.getHours (), 2) + ':' +  Cary.tools.formatNumberWithLZ (dateTime.getMinutes (), 2);
    
    if (showSeconds)
        result += ':' + Cary.tools.formatNumberWithLZ (dateTime.getSeconds (), 2);
    
    return result;
};

Cary.tools.formatDateTime = function (timestamp)
{
    var dateTime = new Date (timestamp);
    
    return Cary.tools.formatNumberWithLZ (dateTime.getDate (), 2) + '.' + 
           Cary.tools.formatNumberWithLZ (dateTime.getMonth () + 1, 2) + '.' + 
           Cary.tools.formatNumberWithLZ (dateTime.getFullYear (), 4) + ' ' + 
           Cary.tools.formatNumberWithLZ (dateTime.getHours (), 2) + ':' + 
           Cary.tools.formatNumberWithLZ (dateTime.getMinutes (), 2) + ':' + 
           Cary.tools.formatNumberWithLZ (dateTime.getSeconds (), 2);
};

Cary.Map.prototype.plotIconGroup = function (startX, startY, callbacks, properties, initialObject)
{
    var start     = this.clientToGeo (startX, startY);
    var points    = [{ lat: start.lat (), lon: start.lng () }];
    var object    = Cary.tools.isNothing (initialObject) ? this.createIconGroup ('New icon group', points, properties) : initialObject;
    var drawer    = object.createDrawer ();
    var click     = this.addEventListener ('click', onClick);
    var instance  = this;
    var interface = { stop: stop, save: save, changePoint: changePoint, newPoint: newPoint, deletePoint: deletePoint, getObject: function () { return object; } };
    
    object.drawer = drawer;
    
    drawer.draw (instance.map);
    
    if ('onNewPoint' in callbacks)
        callbacks.onNewPoint (start.lat (), start.lng ());
        
    if (Cary.tools.isNothing (callbacks))
        callbacks = {};
    
    if (Cary.tools.isNothing (properties))
        properties = {};
    
    return interface;
    
    function changePoint (index, position)
    {
        drawer.undraw ();
        
        object.positions [index].lat = position.lat;
        object.positions [index].lon = position.lon;
        
        drawer.draw (instance.map);
    }
    
    function newPoint (position)
    {
        drawer.undraw ();
        
        object.positions.push ({ lat: position.lat, lon: position.lon });

        drawer.draw (instance.map);
    }
    
    function deletePoint (index)
    {
        drawer.undraw ();
        
        object.positions.splice (index, 1);

        drawer.draw (instance.map);
    }
    
    function stop ()
    {
        instance.stopEventListener (click);
        
        drawer.undraw ();
    }

    function save ()
    {
        object.save ();
    }
    
    function onClick (event)
    {
        var lat = event.latLng.lat ();
        var lon = event.latLng.lng ();
        
        drawer.undraw ();
        
        object.positions.push ({ lat: lat, lon: lon });
    
        if ('onNewPoint' in callbacks)
            callbacks.onNewPoint (lat, lon);
        
        drawer.draw (instance.map);
    }
};

Cary.Map.prototype.geoToClient = function (position)
{
    return Cary.maps.geoToClient (this.map, position);
    /*var projection  = this.map.getProjection ();
    var posPoint    = new google.maps.Point (0, 0),
        centerPoint = new google.maps.Point (0, 0);
    var center      = this.map.getCenter ();
    var tileSize    = (1 << this.map.getZoom ());
    var x,
        y;

    projection.fromLatLngToPoint (position, posPoint);
    projection.fromLatLngToPoint (center, centerPoint);

    x = Number (((posPoint.x - centerPoint.x) * tileSize).toFixed ()) + (this.mapDiv.clientWidth >> 1);
    y = Number (((posPoint.y - centerPoint.y) * tileSize).toFixed ()) + (this.mapDiv.clientHeight >> 1);

    return new google.maps.Point (x, y);*/
};

Cary.Map.prototype.clientToGeo = function (x, y)
{
    var projection  = this.map.getProjection ();
    var center      = this.map.getCenter ();
    var tileSize    = (1 << this.map.getZoom ());
    var centerPoint = new google.maps.Point (0, 0);
    var posPoint    = new google.maps.Point (0, 0);
    
    projection.fromLatLngToPoint (center, centerPoint);
    
    posPoint.x = centerPoint.x + (x - (this.mapDiv.clientWidth >> 1))/ tileSize;
    posPoint.y = centerPoint.y + (y - (this.mapDiv.clientHeight >> 1)) / tileSize;
    
    return projection.fromPointToLatLng (posPoint);
};

Cary.Map.prototype.createUserPolyline = function (name, points, properties, objectType, userType, createUserObject)
{
    var object;
    
    if (!Cary.tools.isNothing (userType))
    {
        if (Cary.tools.isNothing (createUserObject))
            object = null;
        else
            object = createUserObject.apply (this, arguments);
    }
    else
    {
        if (Cary.tools.isNothing (objectType))
            objectType = Cary.userObjects.objectTypes.POLYLINE;

        switch (objectType)
        {
            case Cary.userObjects.objectTypes.POLYLINE:
                object = new Cary.userObjects.UserPolyline (name, points, properties); break;

            case Cary.userObjects.objectTypes.POLYGON:
                object = new Cary.userObjects.UserPolygon (name, points, properties); break;

            default:
                object = null;
        }
    }
    
    return object;
};

Cary.Map.prototype.createIconGroup = function (name, points, properties)
{
    return new Cary.userObjects.UserIconGroup (name, points, properties);
};

Cary.Map.prototype.setCursor = function (cursorType)
{
    this.map.setOptions ({ draggableCursor: cursorType });
};

Cary.Map.prototype.setCenter = function (lat, lon)
{
    this.map.setCenter (new google.maps.LatLng (lat, lon));
};

Cary.Map.prototype.editCoordinate = function (parent, mode, initialValue, callbacks)
{
    new Cary.ui.CoordEditWnd (parent, { mode: mode, value: initialValue }, callbacks);
};

Cary.Map.prototype.showFromJSON = function (text)
{
    var object = Cary.userObjects.createFromJSON (text);
    
    if (object !== null)
    {
        var drawer = object.createDrawer ();
        
        drawer.draw (this.map);
    }
};

Cary.Map.prototype.createMFBalloon = function (position, options)
{
    return new Cary.controls.MFBalloon (this.map, position, options);
};

Cary.Map.prototype.showUserObjectCollection = function (collection, show, filter)
{
    var instance = this;
    
    if (Cary.tools.isNothing (show))
        show = true;

    collection.shown = show;

    if (!Cary.tools.isNothing (collection))
        collection.objects.forEach (function (object)
                                    {
                                        try
                                        {
                                            if (object && (!filter || filter (object)))
                                                instance.drawUserObject (object, show);
                                        }
                                        catch (err)
                                        {
                                            var errorText = err;
                                        }
                                    });
};

Cary.Map.prototype.setBounds = function (bounds, padding)
{
    this.map.fitBounds (bounds, padding);
}

Cary.Map.prototype.createMarker = function (lat, lon, options)
{
    var color;
    var markerOptions;
    
    if (Cary.tools.isNothing (options))
        options = {};
    
    color         = 'color' in options ? options.color : 'black';
    markerOptions = { map: this.map, position: { lat: lat, lng: lon }, visible: true };
    
    if ('title' in options)
        markerOptions.title = options.title;
    
    if ('clickable' in options)
        markerOptions.clickable = options.clickable;
    
    if ('visible' in options)
        markerOptions.visible = options.visible;
    
    if ('anchor' in options)
        markerOptions.anchor = new google.maps.Point (options.anchor.x, options.anchor.y);
    
    if ('shape' in options)
        markerOptions.icon = { fillColor: color, fillOpacity: 1, path: options.shape, strokeColor: color };
    
    if ('icon' in options)
        markerOptions.icon = { url: options.icon };
    
    if ('iconOrigin' in options && 'icon' in markerOptions)
        markerOptions.icon.origin = new google.maps.Point (options.iconOrigin.x, options.iconOrigin.y);
    
    if ('iconAnchor' in options && 'icon' in markerOptions)
        markerOptions.icon.anchor = new google.maps.Point (options.iconAnchor.x, options.iconAnchor.y);
    
    if ('scale' in options && 'icon' in markerOptions)
        markerOptions.icon.scale = options.scale;
    
    if ('size' in options && 'icon' in markerOptions)
    {
        markerOptions.icon.size       = new google.maps.Size (options.size.x, options.size.y);
        markerOptions.icon.scaledSize = new google.maps.Size (options.size.x, options.size.y);
    }
    
    return new google.maps.Marker (markerOptions);
};

Cary.Map.prototype.createPolyline = function (points, options)
{
    var plOptions;

    if (Cary.tools.isNothing (options))
        options = {};
    
    plOptions = { map: this.map, path: [] };
    
    if ('color' in options)
        plOptions.strokeColor = options.color;
    else
        plOptions.strokeColor = 'black';
    
    if ('rhumbline' in options)
        plOptions.geodesic = !options.rhumbline;
    
    if ('visible' in options)
        plOptions.visible = options.visible;
    
    points.forEach (function (point) { plOptions.path.push ({ lat: point.lat, lng: point.lon }); });
    
    return new google.maps.Polyline (plOptions);
};

Cary.Map.prototype.createPolylineEx = function (points, options)
{
    var paths;
    var path;
    var prevTime;
    var maxBreak;
    var i;
    
    if (Cary.tools.isNothing (options))
        options = {};
    
    maxBreak = 'maxBreak' in options ? options.maxBreak : 7200000;
    
    for (i = 0, path = [], paths = [], prevTime = 0; i < points.length; ++ i)
    {
        if (Math.abs (points [i].lat) < 0.001 && Math.abs (points [i].lon) < 0.001 || points [i].lat === null || points [i].lon === null)
            continue;
        
        if (prevTime > 0 && (points [i].time - prevTime) > maxBreak)
        {
            if (path.length > 1)
                paths.push (this.createPolyline (path, options));
            
            path = [points [i]];
        }
        else
        {
            path.push (points [i]);
        }
        
        prevTime = points [i].time;
    }
    
    if (path.length > 1)
        paths.push (this.createPolyline (path, options));
    
    return paths;
    /*var plOptions;

    if (Cary.tools.isNothing (options))
        options = {};
    
    plOptions = { map: this.map, path: [] };
    
    if ('color' in options)
        plOptions.strokeColor = options.color;
    else
        plOptions.strokeColor = 'black';
    
    if ('rhumbline' in options)
        plOptions.geodesic = !options.rhumbline;
    
    points.forEach (function (point) { plOptions.path.push ({ lat: point.lat, lng: point.lon }); });
    
    return new google.maps.Polyline (plOptions);*/
};

Cary.Map.prototype.waitForMap = function (callback)
{
    var timer    = setInterval (checkAndCall, 200);
    var instance = this;
    
    function checkAndCall ()
    {
        if (instance.map !== null)
        {
            clearInterval (timer);
            
            if (!Cary.tools.isNothing (callback))
                callback ();
        }
    }
};

Cary.StringTable = function (id, content)
{
    this.id      = id;
    this.strings = {};
    
    if (!Cary.tools.isNothing (content))
        this.loadFromCsv (content);
};

Cary.StringTable.prototype.loadFromCsv = function (content)
{
    var lines = content.split ('\r\n');
    var data  = {};
    
    lines.forEach (function (line)
                   {
                       var values = line.split (',');
                       
                       if (values.length > 1)
                           data [values [0]] = values [1];
                   });
                   
    this.strings = data;
};

Cary.StringTable.prototype.getString = function (id, defValue)
{
    if (Cary.tools.isNothing (defValue))
        defValue = '';
    
    return (id in this.strings) ? this.strings [id] : defValue;
};

Cary.Serializable = function (name)
{
    this.name = name;
    this.id   = 0;
    
    this.keys.forEach (function (key) { this [key] = null; }, this);
};

Cary.Serializable.prototype.keys = [];

Cary.Serializable.prototype.serialize = function ()
{
    var result = { id: this.id, name: this.name };
    
    this.keys.forEach (function (key) { result [key] = this [key]; }, this);

    return result;
};

Cary.Serializable.prototype.deserialize = function (source)
{
    this.name = 'name' in source ? Cary.tools.unicode2char (source.name) : null;
    
    if ('id' in source)
        this.id = source.id;

    this.keys.forEach (function (key)
                       {
                           if (key in source) 
                               this [key] = source [key]; 
                       }, this);
};

Cary.Serializable.prototype.toJSON = function ()
{
    return JSON.stringify (this.serialize ());
};

Cary.Serializable.prototype.fromJSON = function (source)
{
    this.deserialize (JSON.parse (source));
};

