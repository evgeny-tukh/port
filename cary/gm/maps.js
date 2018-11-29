Cary.maps = { overlayMaps: {}, baseMaps: { predefinedTileProviders: {} } };

// Base map support

Cary.maps.baseMaps.StandardMapType = function (name, typeID, flag)
{
    this.name   = name;
    this.typeID = typeID;
    
    if (!flag)
        this.flag = null;
    else
        this.flag = flag;
};

Cary.maps.baseMaps.StandardMapType.prototype.getName = function ()
{
    return this.name;
};

Cary.maps.baseMaps.CustomMapType = function (name, getTileUrl, flag)
{
    this.options = { getTileUrl: getTileUrl, tileSize: new google.maps.Size (256, 256), maxZoom: 18, name: name };
    this.mapType = new google.maps.ImageMapType (this.options);
    this.typeID  = name;
    
    if (!flag)
        this.flag = null;
    else
        this.flag = flag;
};

Cary.maps.baseMaps.CustomMapType.prototype.getName = function ()
{
    return this.options.name;
};

Cary.maps.baseMaps.addToMap = function (map, mask)
{
    Cary.maps.baseMaps.predefinedMaps.forEach (function (baseMap)
                                               {
                                                   if (baseMap instanceof Cary.maps.baseMaps.CustomMapType && baseMap.flag !== null && (mask & baseMap.flag) !== 0)
                                                       baseMap.addToMap (Cary.checkMap (map));
                                               });
};

Cary.maps.baseMaps.CustomMapType.prototype.addToMap = function (map)
{
    Cary.checkMap (map).mapTypes.set (this.typeID, this.mapType);
};

Cary.maps.baseMaps.predefinedTileProviders.getNavionicsTile = function (coord, zoom)
{
    var X   = coord.x % (1 << zoom);  // wrap
    var url = //"http://tiles.openseamap.org/seamark/" + zoom + "/" + X + "/" + coord.y + ".png";
              //'http://navchannel.com/fm/NavionicsTests/getnavtile4.php?z=' + zoom.toString () + '&x=' + coord.x.toString () + '&y=' + coord.y.toString ();
              'http://navchannel.com/fm/temp/getnavtile2.php?z=' + zoom.toString () + '&x=' + coord.x.toString () + '&y=' + coord.y.toString ();

    return url;
};

Cary.maps.baseMaps.predefinedTileProviders.getOpenStreetTile = function (coord, zoom)
{
    var X   = coord.x % (1 << zoom);  // wrap
    var url = 'http://tile.osm.org/' + zoom.toString () + '/' + X.toString () + '/' + coord.y.toString () + '.png';

    return url;
};

Cary.maps.baseMaps.predefinedTileProviders.createSentinel2GTF = function ()
{
    return Cary.maps.baseMaps.predefinedTileProviders.createOpenWeatherTileUrlFunction ('s2');
};

Cary.maps.baseMaps.predefinedTileProviders.createLandsat8GTF = function ()
{
    return Cary.maps.baseMaps.predefinedTileProviders.createOpenWeatherTileUrlFunction ('l8');
};

Cary.maps.baseMaps.predefinedTileProviders.createOpenWeatherTileUrlFunction = function (prefix)
{
    return function (coord, zoom)
           {
               var X   = coord.x % (1 << zoom);  // wrap
               var url = 'http://sat.owm.io/sql/' + zoom.toString () + '/' + X.toString () + '/' + coord.y.toString () + '?order=last&from=' + prefix + 
                         '&APPID=1149c92adf9c8f93227ee161960005a9';
//alert(url);
               return url;
           };
};

Cary.maps.baseMaps.predefinedTileProviders.createScanExTileUrlFunction = function ()
{
    return function (coord, zoom)
           {
               var X   = coord.x % (1 << zoom);  // wrap
               var url = 'http://geomixer.scanex.ru/TileSender.ashx?ModeKey=tile&ftc=osm&x=' + X.toString () + '&y=' + coord.y.toString () + 
                         '&z=' + zoom.toString () + 
                         '&srs=3857&LayerName=RCAF64ECA6B32F437CB6AC72B5E6F85B97:132152&key=mm6UnkKa4BVxRa6YxDVxyYch5SeuT0VlGi82zJr9MhZ4XUGSOORqzgozbX5uByvl61AInDA4N0znBdLMEBmwF1ANUlUwG0XNyARpq0K9Wis%3D';

               return url;
           };
};

Cary.maps.baseMaps.RoadMap    = 1;
Cary.maps.baseMaps.Terrain    = 2;
Cary.maps.baseMaps.Satellite  = 4;
Cary.maps.baseMaps.Hybrid     = 8;
Cary.maps.baseMaps.OpenStreet = 16;
Cary.maps.baseMaps.Navionics  = 32;
Cary.maps.baseMaps.Sentinel2  = 64;
Cary.maps.baseMaps.Landsat8   = 128;
Cary.maps.baseMaps.CustomMap  = 256;
Cary.maps.baseMaps.ScanEx     = 512;

Cary.maps.baseMaps.AllMaps    = 0xFFFF;

Cary.maps.baseMaps.predefinedMaps = [new Cary.maps.baseMaps.StandardMapType ('Roadmap', google.maps.MapTypeId.ROADMAP, Cary.maps.baseMaps.RoadMap),
                                     new Cary.maps.baseMaps.StandardMapType ('Terrain', google.maps.MapTypeId.TERRAIN, Cary.maps.baseMaps.Terrain),
                                     new Cary.maps.baseMaps.StandardMapType ('Satellite', google.maps.MapTypeId.SATELLITE, Cary.maps.baseMaps.Satellite),
                                     new Cary.maps.baseMaps.StandardMapType ('Hybrid', google.maps.MapTypeId.HYBRID, Cary.maps.baseMaps.Hybrid),
                                     new Cary.maps.baseMaps.CustomMapType ('Navionics', Cary.maps.baseMaps.predefinedTileProviders.getNavionicsTile, Cary.maps.baseMaps.Navionics),
                                     new Cary.maps.baseMaps.CustomMapType ('OpenStreet', Cary.maps.baseMaps.predefinedTileProviders.getOpenStreetTile, Cary.maps.baseMaps.OpenStreet),
                                     new Cary.maps.baseMaps.CustomMapType ('Sentinel-2', Cary.maps.baseMaps.predefinedTileProviders.createSentinel2GTF (), Cary.maps.baseMaps.Sentinel2),
                                     new Cary.maps.baseMaps.CustomMapType ('Landsat 8', Cary.maps.baseMaps.predefinedTileProviders.createLandsat8GTF (), Cary.maps.baseMaps.Landsat8),
                                     new Cary.maps.baseMaps.CustomMapType ('ScanEx (demo)', Cary.maps.baseMaps.predefinedTileProviders.createScanExTileUrlFunction (), Cary.maps.baseMaps.ScanEx)];

Cary.maps.baseMaps.getBaseMapIndex = function (flag)
{
    var result = -1;
    var i;
    
    for (i = 0; i < Cary.maps.baseMaps.predefinedMaps.length; ++ i)
    {
        if (Cary.maps.baseMaps.predefinedMaps [i].flag === flag)
        {
            result = i; break;
        }
    }
    
    return result;
};

Cary.maps.baseMaps.select = function (map, index)
{
    Cary.checkMap (map).setMapTypeId (Cary.maps.baseMaps.predefinedMaps [index].typeID);
};

// Overlay maps support
Cary.maps.overlayMaps.CustomOverlayMapType = function (name, getTileUrl, layer, opacity)
{
    this.tileSize   = new google.maps.Size (256, 256);
    this.getTileUrl = getTileUrl;
    this.name       = name;
    this.layer      = layer ? layer : null;
    this.opacity    = Cary.tools.isNothing (opacity) ? null : opacity.toFixed (1);
};

Cary.maps.overlayMaps.CustomOverlayMapType.prototype.getTile = function (coord, zoom, ownerDocument)
{
    var img = ownerDocument.createElement('img');

    img.src          = this.getTileUrl (coord, zoom);
    img.style.width  = this.tileSize.width + 'px';
    img.style.height = this.tileSize.height + 'px';
    
    if (this.opacity)
        img.style.opacity = this.opacity;
    
    return img;
};

Cary.maps.overlayMaps.getOpenSeaTileUrl = function (coord, zoom)
{
    var X   = coord.x % (1 << zoom);  // wrap
    var url = "http://tiles.openseamap.org/seamark/" + zoom + "/" + X + "/" + coord.y + ".png";

    return url;
};

Cary.maps.overlayMaps.CustomUpdatableOverlayMapType = function (name, getTileUrl, layer)
{
    this.tiles = [];
    
    Cary.maps.overlayMaps.CustomOverlayMapType.apply (this, arguments);
};

Cary.maps.overlayMaps.CustomUpdatableOverlayMapType.prototype = Object.create (Cary.maps.overlayMaps.CustomOverlayMapType.prototype);

Cary.maps.overlayMaps.CustomUpdatableOverlayMapType.prototype.getTile = function (coord, zoom, ownerDocument)
{
    var img = Cary.maps.overlayMaps.CustomOverlayMapType.prototype.getTile.apply (this, arguments);

    this.tiles.push ({ img: img, coord: coord, zoom: zoom });
    
    return img;
};

Cary.maps.overlayMaps.CustomUpdatableOverlayMapType.prototype.releaseTile = function (node)
{
    var i;
    
    for (i = 0; i < this.tiles.length; ++ i)
    {
        if (this.tiles [i].img === node)
        {
            this.tiles.splice (i, 1); break;
        }
    }
};

Cary.maps.overlayMaps.CustomUpdatableOverlayMapType.prototype.updateTiles = function ()
{
    this.tiles.forEach (function (tile)
                        {
                            tile.img.src = this.getTileUrl (tile.coord, tile.zoom, document);
                        }, this);
};

Cary.maps.overlayMaps.Layers = {};

Cary.maps.overlayMaps.Layers.OpenSea                  = 1;
Cary.maps.overlayMaps.Layers.OpenWeatherTemp          = 2;
Cary.maps.overlayMaps.Layers.OpenWeatherPrecipitation = 4;
Cary.maps.overlayMaps.Layers.OpenWeatherWind          = 8;
Cary.maps.overlayMaps.Layers.OpenWeatherPressure      = 16;
Cary.maps.overlayMaps.Layers.OpenWeatherClouds        = 32;
Cary.maps.overlayMaps.Layers.AISTargetsMT             = 64;
Cary.maps.overlayMaps.Layers.ScanExSentinel           = 128;

Cary.maps.overlayMaps.createScanExSentinelTileUrlFunc = Cary.maps.baseMaps.predefinedTileProviders.createScanExTileUrlFunction ();

Cary.maps.overlayMaps.createOpenWeatherTileUrlFunc = function (prefix)
{
    return function (coord, zoom)
           {
               var X   = coord.x % (1 << zoom);  // wrap
               var url = 'http://tile.openweathermap.org/map/' + prefix + '_new/' + zoom.toString () + '/' + X.toString () + '/' + coord.y.toString () + '.png?appid=1149c92adf9c8f93227ee161960005a9';
               
               return url;
           };
};

Cary.maps.overlayMaps.getAISTargetMTTileUrl = function (coord, zoom)
{
    var X   = coord.x % (1 << zoom);  // wrap
    var url = 'https://tiles.marinetraffic.com/ais_helpers/shiptilesingle.aspx?output=png&sat=1&grouping=shiptype&tile_size=256&legends=1&zoom=' + zoom + '&X=' + X + '&Y=' + coord.y + '&tm=' +
              Cary.tools.time ();

    return url;
};

Cary.maps.overlayMaps.getOverlayIndex = function (flag)
{
    var result = -1;
    var i;
    
    for (i = 0; i < Cary.maps.overlayMaps.predefinedMaps.length; ++ i)
    {
        if (Cary.maps.overlayMaps.predefinedMaps [i].layer === flag)
        {
            result = i; break;
        }
    }
    
    return result;
};

Cary.maps.overlayMaps.aisTargetLayer = new Cary.maps.overlayMaps.CustomUpdatableOverlayMapType ('AIS targets (MarineTraffic)', Cary.maps.overlayMaps.getAISTargetMTTileUrl,
                                                                                                Cary.maps.overlayMaps.Layers.AISTargetsMT);
                                                                                                
Cary.maps.overlayMaps.predefinedMaps = [new Cary.maps.overlayMaps.CustomOverlayMapType ('OpenSea', Cary.maps.overlayMaps.getOpenSeaTileUrl, Cary.maps.overlayMaps.Layers.OpenSea),
                                        new Cary.maps.overlayMaps.CustomOverlayMapType ('OpenWeather/Temperature', Cary.maps.overlayMaps.createOpenWeatherTileUrlFunc ('temp'), 
                                                                                        Cary.maps.overlayMaps.Layers.OpenWeatherTemp),
                                        new Cary.maps.overlayMaps.CustomOverlayMapType ('OpenWeather/Precipitation',  Cary.maps.overlayMaps.createOpenWeatherTileUrlFunc ('precipitation'), 
                                                                                        Cary.maps.overlayMaps.Layers.OpenWeatherPrecipitation),
                                        new Cary.maps.overlayMaps.CustomOverlayMapType ('OpenWeather/Wind', Cary.maps.overlayMaps.createOpenWeatherTileUrlFunc ('wind'), 
                                                                                        Cary.maps.overlayMaps.Layers.OpenWeatherWind),
                                        new Cary.maps.overlayMaps.CustomOverlayMapType ('OpenWeather/Pressure', Cary.maps.overlayMaps.createOpenWeatherTileUrlFunc ('pressure'), 
                                                                                        Cary.maps.overlayMaps.Layers.OpenWeatherPressure),
                                        new Cary.maps.overlayMaps.CustomOverlayMapType ('OpenWeather/Clouds', Cary.maps.overlayMaps.createOpenWeatherTileUrlFunc ('clouds'), 
                                                                                        Cary.maps.overlayMaps.Layers.OpenWeatherClouds),
                                        new Cary.maps.overlayMaps.CustomOverlayMapType ('ScanEx/Sentinel', Cary.maps.overlayMaps.createScanExSentinelTileUrlFunc, 
                                                                                        Cary.maps.overlayMaps.Layers.ScanExSentinel, 0.6),
                                        Cary.maps.overlayMaps.aisTargetLayer];

Cary.maps.overlayMaps.isOverlayLayerVisible = function (map, index)
{
    var layer = Cary.maps.overlayMaps.predefinedMaps [index];
    var result;
    var mapType;
    var i, count;

    map = Cary.checkMap (map);
    
    for (i = 0, count = map.overlayMapTypes.getLength (), result = false; i < count; ++ i)
    {
        mapType = map.overlayMapTypes.getAt (i);

        if (mapType === layer)
        {
            result = true; break;
        }
    }
    
    return result;
};

Cary.maps.overlayMaps.showOverlayLayer = function (map, index, show)
{
    var layer = Cary.maps.overlayMaps.predefinedMaps [index];

    map = Cary.checkMap (map);
    
    if (typeof (show) === 'undefined')
        show = true;
    
    if (show)
    {
        map.overlayMapTypes.insertAt (0, layer);
    }
    else
    {
        var mapType;
        var i, count;

        for (i = 0, count = map.overlayMapTypes.getLength (); i < count; ++ i)
        {
            mapType = map.overlayMapTypes.getAt (i);

            if (mapType === layer)
            {
                map.overlayMapTypes.removeAt (i); break;
            }
        }
    }
};

Cary.maps.geoToClient = function (map, position)
{
    var projection  = map.getProjection ();
    var posPoint    = new google.maps.Point (0, 0),
        centerPoint = new google.maps.Point (0, 0);
    var center      = map.getCenter ();
    var tileSize    = (1 << map.getZoom ());
    var mapDiv      = map.getDiv ();
    var x,
        y;

    projection.fromLatLngToPoint (position, posPoint);
    projection.fromLatLngToPoint (center, centerPoint);

    x = Number (((posPoint.x - centerPoint.x) * tileSize).toFixed ()) + (mapDiv.clientWidth >> 1) /*- 128*/;
    y = Number (((posPoint.y - centerPoint.y) * tileSize).toFixed ()) + (mapDiv.clientHeight >> 1);

    return new google.maps.Point (x, y);
};

Cary.maps.getBounds = function (points)
{
    var bounds = null;
    
    if (!Cary.tools.isNothing (points) && points.length > 0)
    {
        var point1 = { lat: points [0].lat, lng: points [0].lon };
        var point2 = points.length > 1 ? { lat: points [1].lat, lng: points [1].lon } : point1;
        var i;
        
        bounds = new google.maps.LatLngBounds (point1, point1);
        
        for (i = 1; i < points.length; ++ i)
            bounds.extend ({ lat: points [i].lat, lng: points [i].lon });
    }
    
    return bounds;
};

