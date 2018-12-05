function PassageSimulator ()
{
    var route                = null;
    var draft                = null;
    var startTime            = Cary.tools.getTimestamp();
    var pauseTime;
    var curTime              = startTime;
    var sog                  = 5;
    var contourIntersections = [];
    var crossedObjects       = [];
    var routeLegs            = [];
    var timer                = null;
    var timeQuant            = 300000;
    var accel                = 100;
    var fullTime             = null;
    var simStartAt           = null;
    var location             = null;
    var contours             = [];
    var waterLevelData       = [];
    var wlMeters             = {};
    var procCallback         = null;
    var stateCallback        = null;
    var paused               = false;

    this.setup                = setup;
    this.start                = start;
    this.stop                 = stop;
    this.proc                 = proc;
    this.setTime              = setTime;
    this.checkContours        = checkContours;
    this.setupTimeParams      = setupTimeParams;
    this.analyzePassage       = analyzePassage;
    this.setCallback          = function (cb) { procCallback = cb; };
    this.setStateCallback     = function (cb) { stateCallback = cb; };
    this.getFullTime          = function () { return fullTime; };
    this.getStartTime         = function () { return startTime; };
    this.getLocation          = function () { return location; };
    this.setAccel             = function (value) { accel = value; };
    this.setTimeQuant         = function (value) { timeQuant = value; };
    this.getLegs              = function () { return routeLegs; };
    this.getCrossedObjects    = function () { return crossedObjects; };
    this.enumIntersects       = enumIntersects;
    this.getIntersects        = function () { return contourIntersections; };
    this.getWaterLevelData    = function () { return waterLevelData; };
    this.setDraft             = function (value) { draft = value; };
    this.getDraft             = function () { return draft; };
    this.setSpeed             = function (speed) { sog = speed; };
    this.getSpeed             = function () { return sog; };
    this.setStartTime         = function (time) { startTime = time; };
    this.paused               = function () { return paused; };
    this.pause                = pause;
    this.resume               = resume;
    this.reset                = reset;
    this.setTime              = setTime;

    Cary.tools.sendRequest ({ url: 'requests/ol_get_obj_list.php?ut=' + userObj.types.NAV_CONTOUR.toString (), method: Cary.tools.methods.get,
                              content: Cary.tools.contentTypes.plainText, onLoad: function (data) { data.forEach (processContour); }, resType: Cary.tools.resTypes.json });
    Cary.tools.sendRequest ({ url: 'requests/wla_get_list.php', method: 'get', content: Cary.tools.contentTypes.plainText, onLoad: onLoadWaterLevelAreaList, 
                              resType: Cary.tools.resTypes.json });
    
    function pause ()
    {
        paused    = true;
        pauseTime = Cary.tools.getTimestamp ();
    }
    
    function resume ()
    {
        simStartAt += (Cary.tools.getTimestamp () - pauseTime);
        paused      = false;
    }
    
    function processContour (contour)
    {
        if (contour.type === Cary.userObjects.objectTypes.POLYGON)
        {
            var newObject = Cary.userObjects.createFromArray (contour, userObj.createVirginUserObject);

            newObject.offset = null;

            contours.push (newObject);
        }
    }
    
    function setupTimeParams (timeQnt, acceleration)
    {
        accel     = acceleration;
        timeQuant = timeQnt;
    }
    
    function enumIntersects (callback)
    {
        contourIntersections.forEach (callback);
    }
    
    function setup (settings)
    {
        route     = getSetting ('route');
        sog       = getSetting ('sog', 9);
        draft     = getSetting ('draft');
        startTime = getSetting ('startTime', Cary.tools.getTimestamp ());
        curTime   = startTime;
        routeLegs = route.getLegs (sog);
        fullTime  = routeLegs [routeLegs.length-1].endTimeOffset;
        timer     = null;
        timeQuant = getSetting ('timeQnt', 5) * 60000;
        accel     = getSetting ('accel');
        location  = route.getPositionOfPassage (sog, 0);
        
        //setTime (0);
        /*for (var i = 0, beginTime = 0; i < routeLegs.length; ++ i)
        {
            var distance = Cary.geo.calcSphericalRange (routeLegs [i][0], routeLegs [i][1]);
            var passTime = distance / sog;
            
            routeLegs [i].beginTimeOffset = beginTime;
            routeLegs [i].passTime        = passTime * 3600000;
            routeLegs [i].endTimeOffset   = beginTime + routeLegs [i].passTime;
            beginTime                     = routeLegs [i].endTimeOffset;
        }*/
        
        function getSetting (name, defValue)
        {
            if (Cary.tools.isNothing (defValue))
                defValue = null;
                
            return (name in settings) ? settings [name] : defValue;
        }
    }
    
    function checkContours ()
    {
        waterLevelData = [];
        crossedObjects = [];
        
        contours.forEach (findContourIntersections);
        contourIntersections.forEach (processIntersection);

        function processIntersection (intersection)
        {
            var i;
            var leg             = routeLegs [intersection.leg];
            //var legApproachTime = start + leg.beginTimeOffset;
            var beginRange      = Cary.geo.calcSphericalRange (leg [0], intersection.begin);
            var endRange        = Cary.geo.calcSphericalRange (leg [0], intersection.end);
            var crossEnterOffs  = (beginRange / sog) * 3600000;
            var crossExitOffs   = (endRange / sog) * 3600000;

            if (beginRange > endRange)
            {
                var temp = endRange;

                endRange   = beginRange;
                beginRange = temp;

                temp           = crossEnterOffs;
                crossEnterOffs = crossExitOffs;
                crossExitOffs  = temp;
            }

            intersection.begRange  = beginRange;
            intersection.endRange  = endRange;
            intersection.enterOffs = leg.beginTimeOffset + crossEnterOffs;
            intersection.exitOffs  = leg.beginTimeOffset + crossExitOffs;
            intersection.enterTime = startTime + intersection.enterOffs;
            intersection.exitTime  = startTime + intersection.exitOffs;

            waterLevelData [intersection.object.userProps.deviceID] = [];
        }
        
        function findContourIntersections (contour)
        {
            // Only contours with present max acceptable draft coould be used; skip other!
            if (contour.userProps.maxDraft && parseFloat (contour.userProps.maxDraft) > 1)
            {
                var intersected = false;

                for (var i = 0; i < routeLegs.length; ++ i)
                {
                    var parts = Cary.geo.intersectContourByLeg (contour.points, routeLegs [i]);

                    parts.forEach (function (part)
                                   {
                                       intersected = true;

                                       contourIntersections.push ({ leg: i, begin: part.begin, end: part.end, object: contour });
                                   });
                }

                if (intersected)
                    crossedObjects.push (contour);
            }
        }
    }

    function analyzePassage (onCompleted)
    {
        var url = 'wl/get_wls.php?b=' + Cary.tools.toPhpTime (startTime - 3600000) + '&e=' + Cary.tools.toPhpTime (startTime + routeLegs [routeLegs.length-1].endTimeOffset + 3600000) + 
                  '&ids=' + Cary.tools.keys (waterLevelData).join (';');

        loadSerializable (url, onDataLoaded);

        function onDataLoaded (data)
        {
            var objects = [];

            waterLevelData = data;

            contourIntersections.forEach (assignIntersectionData);

            objects.forEach (function (object)
                             {
                                 if (!object.drawer)
                                     object.drawer = object.createDrawer ();

                                 object.drawer.draw (map.map);
                             });

            if (onCompleted)
                onCompleted (objects);
            
            function assignIntersectionData (intersection)
            {
                var meter  = wlMeters [intersection.object.userProps.deviceID];
                var level  = getObjectDepthAt (intersection.object, intersection.enterTime);
                var offset = meter.baseLevel + meter.baseValue - level;
                var i, found;

                if (intersection.object.offset === null || offset > intersection.object.offset)
                    intersection.object.offset = offset * 0.01;

                intersection.object.vesselDraught = draft;

                if (objects.indexOf (intersection.object) < 0)
                    objects.push (intersection.object);
            }
        }
    }
    
    function start ()
    {
        paused     = false;
        timer      = setInterval (proc, 200/*simulation.timeQnt*/);
        simStartAt = Cary.tools.getTimestamp ();
        position   = { lat: route.points [0].lat, lon: route.points [0].lon };
    };

    function stop ()
    {
        if (timer)
        {
            clearInterval (timer);

            timer      = null;
            simStartAt = null;
        }
        
        setTime (0);
    };

    function setTime (actualTime)
    {
        if (actualTime >= fullTime)
        {
            actualTime = fullTime;

            stop ();
        }
        
        location = route.getPositionOfPassage (sog, actualTime / 3600000);
        
        if (procCallback)
            procCallback (actualTime, location);
        
        if (stateCallback)
        {
            var i, affectedObjects, activeLegIndex, activeLeg;
            
            for (i = 0, activeLegIndex = -1; i < routeLegs.length && activeLegIndex < 0; ++ i)
            {
                if (actualTime >= routeLegs [i].beginTimeOffset && actualTime <= routeLegs [i].endTimeOffset)
                {
                    activeLegIndex = i;
                    activeLeg      = routeLegs [i];
                }
            }

            if (activeLegIndex >= 0)
            {
                for (i = 0, affectedObjects = []; i < contourIntersections.length; ++ i)
                {
                    var intersection = contourIntersections [i];

                    if (intersection.leg === activeLegIndex)
                    {
                        if (location.legRange >= intersection.begRange && location.legRange <= intersection.endRange && affectedObjects.indexOf (intersection.object) < 0)
                            affectedObjects.push (intersection.object);
                    }
                }

                stateCallback ({ time: actualTime, location: location, allObjects: crossedObjects, affectedObjects: affectedObjects, activeLeg: activeLeg });
            }
        }
    };

    function proc ()
    {
        if (!paused)
        {
            var now     = Cary.tools.getTimestamp ();
            var simTime = now - simStartAt;

            setTime (simTime * accel);
        }
    };
        
    function onLoadWaterLevelAreaList (data)
    {
        data.forEach (function (deviceInfo)
                      {
                          wlMeters [deviceInfo.device] = deviceInfo;
                      });
    }    
    
    function getObjectDepthAt (object, time)
    {
        var data   = waterLevelData [object.userProps.deviceID];
        var result = null;

        for (var i = 0; i < data.length; ++ i)
        {
            if (data [i].ts * 1000 <= time)
            {
                result = data [i].level; break;
            }
        }

        return result;
    }
    
    function reset ()
    {
        contourIntersections = [];
    }
}