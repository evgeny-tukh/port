function AISTargetTable (param)
{
    this.targets       = {};
    this.reqParam      = 0;
    this.onTargetClick = null;
    
    Cary.Service.apply (this, [8000, param]);
}

AISTargetTable.prototype = Object.create (Cary.Service.prototype);

AISTargetTable.navStatuses = ['Under way using engine',
                              'At anchor',
                              'Not under command',
                              'Restricted manoeuvrability',
                              'Constrained by her draught',
                              'Moored',
                              'Aground',
                              'Engaged in Fishing',
                              'Under way sailing',
                              'Reserved for future amendment',
                              'Reserved for future amendment',
                              'Unknown',
                              'Unknown',
                              'Unknown',
                              'Unknown',
                              'Not defined'];

AISTargetTable.getTargetInfo = function (target)
{
    var result = [];
    
    result.push ({ name: 'MMSI', value: target.mmsi });
    result.push ({ name: stringTable.name, value: target.name ? target.name : null });
    result.push ({ name: stringTable.position, value: Cary.tools.formatLat (target.lat) + ' ' + Cary.tools.formatLon (target.lon)});
    result.push ({ name: 'COG', value: Cary.tools.formatFloatWithLZ (target.cog, 5, 1) });
    result.push ({ name: 'SOG', value: target.sog ? target.sog.toFixed (1) + 'kn' : 'N/A' });
    result.push ({ name: stringTable.navStatus, value: target.navStatus ? AISTargetTable.navStatuses [target.navStatus] : 'N/A' });
    
    return result;
};

AISTargetTable.prototype.worker = function (mapParam)
{
    var instance  = this;
    var mapObject = Cary.checkMap (mapParam);
    
    Cary.tools.sendRequest ({ url: 'http://en.aistracker.ru/map3/loadmarkers.aspx', mathod: Cary.tools.methods.get, content: Cary.tools.contentTypes.plainText, onLoad: onLoaded,
                              resType: Cary.tools.resTypes.plain, param: 'fmax=' + this.reqParam.toString () + '&sid=0&mmsi=null&stid=0&un=1' });
    
            
    function getValue (element, attrName, defValue)
    {
        var attr = element.attributes [attrName];

        if (Cary.tools.isNothing (defValue))
            defValue = null;

        return attr ? attr.value : defValue;
    }
            
    function onLoaded (data)
    {
        if (instance.started ())
        {
            var parser       = new DOMParser();
            var xml          = parser.parseFromString (data, 'text/xml');
            var data         = xml.getElementsByTagName ('r');
            var targets      = xml.getElementsByTagName ('m');
            var vesselShape  = Cary.tools.simpleVesselIconPath ();
            var diamondShape = Cary.tools.smallDiamondIconPath ();
            var bounds       = mapObject.getBounds ();
            var northEast    = bounds.getNorthEast ();
            var southWest    = bounds.getSouthWest ();
            var north        = northEast.lat ();
            var east         = northEast.lng ();
            var south        = southWest.lat ();
            var west         = southWest.lng ();
            var deltaLat     = north - south;
            var deltaLon     = east - west;
            var i;
            
            north += deltaLat / 2;
            south -= deltaLat / 2;
            east  += deltaLon / 2;
            west  -= deltaLon / 2;

            instance.reqParam = parseInt (getValue (data [0], 'fmax'));

            for (i = 0; i < targets.length && instance.started (); ++ i)
            {
                var element = targets [i];
                var pos     = getValue (element, 'l');
                var latLon  = pos.split (',');
                var lat     = parseFloat (latLon [0]);
                var lon     = parseFloat (latLon [1]);

                if (lat >= south && lat <= north && lon <= east && lon >= west)
                {
                    var mmsi      = parseInt (getValue (element, 'id'));
                    var cog       = getValue (element, 'COG');
                    var sog       = getValue (element, 'SOG');
                    var dim       = getValue (element, 'd');
                    var hdg       = getValue (element, 'h');
                    var name      = getValue (element, 'n');
                    var navStatus = getValue (element, 'v');
                    var latLonPos = { lat: lat, lng: lon };
                    var a, b, c, d;

                    if (dim)
                    {
                        var dims = dim.split (',');

                        a = parseFloat (dims [0]);
                        b = parseFloat (dims [1]);
                        c = parseFloat (dims [2]);
                        d = parseFloat (dims [3]);
                    }
                    else
                    {
                        a = null;
                        b = null;
                        c = null;
                        d = null;
                    }

                    if (navStatus)
                        navStatus = parseInt (navStatus);
                    
                    if (cog)
                        cog = parseInt (cog) * 0.1;
                    
                    if (sog)
                        sog = parseFloat (sog) * 0.1;

                    if (hdg)
                        hdg = parseFloat (hdg);
                    else
                        hdg = cog;
                    
                    if (hdg === 511)
                        hdg = cog;

                    if (mmsi in instance.targets)
                    {
                        var posChanged, hdgChaged;
                        
                        var target = instance.targets [mmsi];

                        posChanged = target.lat !== lat || target.lon !== lon;
                        hdgChanged = target.hdg !== hdg;
                        
                        target.lat       = lat;
                        target.lon       = lon;
                        target.sog       = sog;
                        target.cog       = cog;
                        target.hdg       = hdg;
                        target.navStatus = navStatus;

                        if (posChanged)
                            target.marker.setPosition (latLonPos);
                        
                        if (hdgChaged)
                            target.marker.setRotation (hdg);
                    }
                    else
                    {
                        var icon    = { path: cog ? vesselShape : diamondShape, scale: 1, rotation: hdg ? hdg : 0, fillColor: 'blue', fillOpacity: 1.0, strokeColor: 'blue', strokeWeight: 1 };
                        var options = { map: mapObject, position: latLonPos, title: name, draggable: false, visible: true, optimized: true, flat: true, icon: icon, clickable: true };
                        var marker  = new google.maps.Marker (options);
                        var target  = { mmsi: mmsi, name: name, lat: lat, lon: lon, sog: sog, cog: cog, hdg: hdg, a: a, b: b, c: c, d: d, navStatus: navStatus, marker: marker };

                        marker.target = target;
                        
                        marker.addListener ('click',
                                            function ()
                                            {
                                                if (instance.onTargetClick)
                                                    instance.onTargetClick (this.target);
                                            });
                        
                        instance.targets [mmsi] = target;
                    }
                }
            }
        }
    }
};

AISTargetTable.prototype.start = function ()
{
    this.targets  = {};
    this.reqParam = 0;

    Cary.Service.prototype.start.apply (this, arguments);
};

AISTargetTable.prototype.stop = function ()
{
    Cary.Service.prototype.stop.apply (this, arguments);
    
    for (var mmsi in this.targets)
    {
        var target = this.targets [mmsi];
        
        if ('marker' in target)
        {
            target.marker.setMap (null);
            
            target.marker = null;
        }
    }
    
    this.targets = {};
};

function AISTargetLayerUpdater (param)
{
    Cary.Service.apply (this, [10000, param]);
}

AISTargetLayerUpdater.prototype = Object.create (Cary.Service.prototype);

AISTargetLayerUpdater.prototype.worker = function (mapParam)
{
    var index = map.getOverlayIndex (Cary.maps.overlayMaps.Layers.AISTargetsMT);
    
    if (map.isOverlayLayerVisible (index))
    {
        Cary.maps.overlayMaps.aisTargetLayer.updateTiles ();
        //map.showOverlayLayer (index, false);
        //map.showOverlayLayer (index, true);
    }
};
