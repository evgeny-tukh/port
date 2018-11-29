Cary.geo = {};

Cary.geo.EARTH_SPEHERICAL_RAD  = 6366707.0194937074958298109629434;
Cary.geo.EARTH_POLAR_RAD_WGS84 = 6356752.3142451793;
Cary.geo.EARTH_EQUAT_RAD_WGS84 = 6378137.0;
Cary.geo.FLATTENING_WGS84      = 3.35281066474751169502944198282e-3;

Number.prototype.inRange = function (val1, val2)
{
    return this >= val1 && this <= val2 || this >= val2 && this <= val1;
};

Number.prototype.toRad = function ()
{
    return this * Math.PI / 180;
};

Number.prototype.toDeg = function ()
{
    return this / Math.PI * 180;
};

Number.prototype.toNM = function ()
{
    return this / 1852;
};

Number.prototype.toMeters = function (miles)
{
    return miles * 1852;
};

Cary.geo.calcSphericalPosition = function (begin, course, dist, useMeters)
{
    var begLat    = begin.lat.toRad (),
        begLon    = begin.lon.toRad (),
        course    = course.toRad (),
        endLat,
        endLon,
        angleDist;

    if (!useMeters)
        dist *= 1852;
    
    angleDist = dist / Cary.geo.EARTH_SPEHERICAL_RAD;
    endLat    = Math.asin (Math.sin (begLat) * Math.cos (angleDist) + Math.cos (begLat) * Math.sin (angleDist) * Math.cos (course));
    endLon    = begLon + Math.asin (Math.sin (course) * Math.sin (angleDist) / Math.cos (endLat));
    
    return { lat: endLat.toDeg (), lon: endLon.toDeg () };
};

Cary.geo.calcSphericalRange = function (begin, end, useMeters)
{
    var begLat    = begin.lat.toRad (),
        begLon    = begin.lon.toRad (),
        endLat    = end.lat.toRad (),
        endLon    = end.lon.toRad ();
    var angleDist = Math.acos (Math.sin (begLat) * Math.sin (endLat) + Math.cos (begLat) * Math.cos (endLat) * Math.cos (begLon - endLon));
    var range     = Cary.geo.EARTH_SPEHERICAL_RAD * angleDist;
    
    if (!useMeters)
        range = range.toNM ();
    
    return range;
};

Cary.geo.calcSphericalCourse = function (begin, end)
{
    var begLat    = begin.lat.toRad (),
        begLon    = begin.lon.toRad (),
        endLat    = end.lat.toRad (),
        endLon    = end.lon.toRad (),
        deltaLonW = fmod (begLon - endLon, Math.PI * 2),
        deltaLonE = fmod (endLon - begLon, Math.PI * 2),
        tanRatio  = Math.tan (endLat * 0.5 + Math.PI * 0.25) / Math.tan (begLat * 0.5 + Math.PI * 0.25),
        deltaLat  = Math.log (tanRatio),
        course;

    if (deltaLonW < deltaLonE)
        course = fmod (Math.atan2 (- deltaLonW, deltaLat), Math.PI * 2);
    else
        course = fmod (Math.atan2 (deltaLonE, deltaLat), Math.PI * 2);
    
    return course.toDeg ();
    //var ctgCourse = Math.tan (endLat) * Math.cos (begLat) / Math.sin (deltaLon) - Math.sin (begLat) / Math.tan (deltaLon);
    
    //return Math.atan (1 / ctgCourse).toDeg ();
    
    function fmod (value, divider)
    {
        return value - Math.floor (value / divider) * divider;
    }
};

Cary.geo.legCrossesLeg = function (begin1, end1, begin2, end2)
{
    var x11 = begin1.lon,
        x12 = end1.lon,
        x21 = begin2.lon,
        x22 = end2.lon,
        y11 = begin1.lat,
        y12 = end1.lat,
        y21 = begin2.lat,
        y22 = end2.lat,
        k1  = x12 !== x11 ? (y12 - y11) / (x12 - x11) : null,
        k2  = x22 !== x21 ? (y22 - y21) / (x22 - x21) : null,
        x,
        y,
        cross,
        result;

    if (x12 === x11)
    {
        x = x12;
        
        if (y11 === y12)
        {
            cross = y2 (x12) === y12 && x11.inRange (x21, x22) && y11.inRange (y21, y22);
            
            if (cross)
                y = y11;
        }
        else if (x.inRange (x21, x22))
        {
            y = y2 (x);
            
            cross = y.inRange (y21, y22) && y.inRange (y11, y12);
        }
        else
        {
            cross = false;
        }
    }
    else if (x22 === x21)
    {
        x = x22;
        
        if (x.inRange (x11, x12))
        {
            y = y1 (x);
            
            cross = y.inRange (y11, y12);
        }
        else
        {
            cross = false;
        }
    }
    else
    {
        x = (y21 - y11 + k1 * x11 - k2 * x21) / (k1 - k2);
        y = y1 (x);
        cross = x.inRange (x11, x12) && x.inRange (x21, x22) && y.inRange (y11, y12) && y.inRange (y21, y22);
    }
    
    result = { cross: cross };
    
    if (cross)
    {
        result.x = x;
        result.y = y;
    }
    
    return result;
    
    function y1 (x)
    {
        return y11 + k1 * (x - x11);
    }
    
    function y2 (x)
    {
        return y21 + k2 * (x - x21);
    }
};

Cary.geo.getPolygonVertices = function (polygon)
{
    var result = [];
    
    if (polygon)
        polygon.getPaths ().getAt (0).forEach (addVertex);
    
    return result;
    
    function addVertex (vertex)
    {
        addVertexToContour (result, vertex);
    }
};

Cary.geo.getPolylineVertices = function (polyline)
{
    var result = [];
    
    if (polyline)
        polyline.getPath ().forEach (addVertex);
    
    return result;
    
    function addVertex (vertex)
    {
        addVertexToContour (result, vertex);
    }
};

Cary.geo.addVertexToContour = function (contour, vertex)
{
    contour.push ({ lat: vertex.lat (), lon: vertex.lng () });
};

Cary.geo.intersectContourByLeg = function (contour, leg)
{
    var crossPoints   = [];
    var intersections = [];
    
    for (var i = 1; i < contour.length; ++ i)
        checkCross (contour [i-1], contour [i]);

    checkCross (contour [contour.length-1], contour [0]);

    function checkCross (begin, end)
    {
        var result = Cary.geo.legCrossesLeg (begin, end, leg [0], leg [1]);

        if (result.cross)
        {
            var range = Cary.geo.calcSphericalRange (leg [0], { lat: result.y, lon: result.x }, true);
            var text  = (range * 0.001).toFixed(3) + 'км';

            crossPoints.push ({ lat: result.y, lon: result.x });
        }
    }
    
    for (var i = 0; i < crossPoints.length; i += 2)
    {
        var intersection = { begin: crossPoints [i] };
        
        if ((i + 1) < crossPoints.length)
            intersection.end = crossPoints [i+1];
        else
            intersection.end = leg [1];
        
        intersections.push (intersection);
    }
    
    return intersections;
};

