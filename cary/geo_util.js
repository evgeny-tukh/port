function fmod (a, b)
{
    return a % b;
}

function calcDeltaPhi (eccentricity, begLat, endLat)
{
    var ESinBegLat = eccentricity * Math.sin (begLat);
    var ESinEndLat = eccentricity * Math.sin (endLat);

    return Math.log (Math.tan (Math.PI * 0.25 + endLat * 0.5) /
                     Math.tan (Math.PI * 0.25 + begLat * 0.5) *
                     Math.pow (((1.0 - ESinEndLat) * (1.0 + ESinBegLat)) /
                               ((1.0 + ESinEndLat) * (1.0 - ESinBegLat)),
                     eccentricity * 0.5));
}

function square (value)
{
    return value * value;
}

function meridionalPart (lat, eccentricity)
{
    var meridPart, part;

    part      = eccentricity * Math.sin (lat);
    meridPart = Math.log (Math.tan (Math.PI * 0.25 + lat * 0.5)) -
                0.5 * eccentricity * Math.log ((1.0 + part) / (1.0 - part));
    
    return meridPart;
}

function calcMeridionalDist (lat, eccentricity, equRadius)
{
    var md, e2, e4, e6, v1, v2, v3, v4;

    e2 = eccentricity * eccentricity;
    e4 = e2 * e2;
    e6 = e4 * e2;
    v1 = Math.PI / 180.0 * (1.0 - e2 / 4.0 - 3.0 * e4 / 64.0 - 0.01953125 /*5.0 / 256.0*/ * e6);
    v2 = 0.375 /*3.0 / 8.0*/ * (e2 - e4 / 4.0 + 0.1171875 /*15.0 / 128.0*/ * e6);
    v3 = 0.05859375 /*15.0 / 256.0*/ * (e4 + 0.75 /*3.0 / 4.0*/ * e6);
    v4 = meters2miles (equRadius);
    md = v4 * (v1 * lat - v2 * Math.sin (lat * 2) + v3 * Math.sin (lat * 4));

    return md;
}

function meters2miles (meters)
{
    return meters / 1852.0;
}

function hypoLen (cat1, cat2)
{
    return Math.sqrt (cat1 * cat1 + cat2 * cat2);
}

function miles2radian (miles)
{
    return miles * 2.90888208665721596153703703703e-4;
}
    
function radian2miles (rad)
{
    return rad * 3437.7467707849392526107818606515;
}
    
function miles2degree (miles)
{
    return miles * 1.66666666666666666666666666666e-2;
}

function degree2miles (deg)
{
    return deg * 60.0;
}
    
function deg2rad (value)
{
    return Math.PI * value / 180.0;
}

function rad2deg (value)
{
    return 180.0 / Math.PI * value;
}

function isValidRange (range)
{
    return range >= 0.0 && range < 6378137.0 * (Math.PI + Math.PI);
}

function normalizeLat (lat)
{
    while (lat < - Math.PI * 0.5)
        lat = - Math.PI - lat;
    
    while (lat > Math.PI * 0.5)
        lat = Math.PI - lat;
    
    return lat;
}

function normalizeLon (lon)
{
    while (lon < - Math.PI)
        lon += (Math.PI + Math.PI);
    
    while (lon > Math.PI)
        lon -= (Math.PI + Math.PI);
    
    return lon;
}

function isInvalidGeoValue (value)
{
    return Cary.tools.isNothing (value) || isNaN (value);
}

function checkSegmentRag (begLat, begLon, endLat, endLon, assumeRadians, enablePole)
{
    if (checkGeoPointRange (begLat, begLon, assumeRadians, enablePole))
        return checkGeoPointRange (endLat, endLon, assumeRadians, enablePole);
    else
        return false;
}

function checkBegPointCourseDist (begLat, begLon, bearing, range, assumeRadians, enablePole)
{
    if (!checkGeoPointRange (begLat, begLon, assumeRadians, enablePole))
        return false;

    if (assumeRadians)
    {
        if (wrongBearing (bearing))
            return false;
    }
    else
    {
        if (wrongBearingDeg (bearing))
            return false;
    }

    return !wrongRange (range);
}

function isZero (value)
{
    return Math.abs (value) < 1.0E-7;
}
    
function isPole (lat, assumeRadians)
{
    return (lat > 0.0 ? 
            isZero (lat - (assumeRadians ? Math.PI * 0.5 : 90.0)) :
            isZero (lat - (assumeRadians ? - Math.PI * 0.5 : - 90.0)));
}

function wrongLat (val)
{
    return isInvalidGeoValue (val) || val < - Math.PI * 0.5 || val > Math.PI * 0.5;
}

function wrongLon (val)
{
    return isInvalidGeoValue (val) || val < - Math.PI || val > Math.PI;
}

function wrongLatDeg (val)
{
    return isInvalidGeoValue (val) || val < - 90.0 || val > 90.0;
}

function wrongLonDeg (val)
{
    return isInvalidGeoValue (val) || val < - 180.0 || val > 180.0;
}

function wrongBearing (val)
{
    return val < 0.0 || val >= (Math.PI + Math.PI);
}

function wrongBearingDeg (val)
{
    return val < 0.0 || val >= 360.0;
}

function wrongRange (range)
{
    return isInvalidGeoValue (range) || range < 0.0;
}

function checkGeoPointRange (lat, lon, assumeRadians, enablePole)
{
    if (!enablePole && isPole (lat, assumeRadians))
        return false;

    if (assumeRadians)
    {
        if (wrongLat (lat))
            return false;

        if (wrongLon (lon))
            return false;
    }
    else
    {
        if (wrongLatDeg (lat))
            return false;

        if (wrongLonDeg (lon))
            return false;
    }

    return true;
}

function isEqual (val1, val2)
{
    return Math.abs (val1 - val2) < 1.0E-7;
}

function checkBearing (bearing)
{
    while (bearing < 0.0)
        bearing += (Math.PI + Math.PI);
    
    return bearing;
}

function turnBearing (bearing)
{
    bearing = (bearing > Math.PI) ? bearing - Math.PI : bearing + Math.PI;
    
    return normalizeBearing (bearing);
}

function normalizeBearing (bearing)
{
    while (bearing < 0.0)
        bearing += (Math.PI + Math.PI);
    
    while (bearing >= (Math.PI + Math.PI))
        bearing -= (Math.PI + Math.PI);
    
    return bearing;
}

Cary.geo.calcGCRangeAndBearing = function (begLat, begLon, endLat, endLon, datum)
{
    var range      = 0.0;
    var begBearing = 0.0;
    var endBearing = 0.0;
    
    begLat = deg2rad (begLat);
    begLon = deg2rad (begLon);
    endLat = deg2rad (endLat);
    endLon = deg2rad (endLon);
    
    if (Cary.tools.isNothing (datum))
        datum = 1;

    if (isInvalidGeoValue (begLat) || isInvalidGeoValue (begLon) || isInvalidGeoValue (endLat) || isInvalidGeoValue (endLon) ||
        Math.abs (begLat) > 10000.0 || Math.abs (begLon) > 10000.0 || Math.abs (endLat) > 10000.0 || Math.abs (endLon) > 10000.)
        return null;
    
    begLat = normalizeLat (begLat);
    endLat = normalizeLat (endLat);
    begLon = normalizeLon (begLon);
    endLon = normalizeLon (endLon);

    if (!checkSegmentRag (begLat, begLon, endLat, endLon, true, false))
        return null;

    // If both points are the same we cannot calculate as soon begin course as end one. In this case we return zero 
    // distance and zero course
    if (isEqual (begLat, endLat) && isEqual (begLon, endLon))
        return { range: 0.0, bearing: 0.0, endBearing: 0.0 };

    // Calculation block
    // This is a translation of the Fortran routine INVER1 found in the
    // INVERS3D program at:
    // ftp://ftp.ngs.noaa.gov/pub/pcsoft/for_inv.3d/source/invers3d.for
    // The ton most of variables used... (exclude args and global definitions)
    var flattening;
    var c           = 0.0;
    var c_value_1   = 0.0;
    var c_value_2   = 0.0;
    var c2a         = 0.0;
    var cosine_of_x = 0.0;
    var cy          = 0.0;
    var cz          = 0.0;
    var d           = 0.0;
    var e           = 0.0;
    var r_value     = 0.0;
    var s           = 0.0;
    var s_value_1   = 0.0;
    var sa          = 0.0;
    var sine_of_x   = 0.0;
    var sy          = 0.0;
    var tangent_1   = 0.0;
    var tangent_2   = 0.0;
    var x           = 0.0;
    var y           = 0.0;
    var prev_d      = 1.0E300;

    flattening = 3.35281066474751169502944198282e-3; // WGS84

    r_value = 1.0 - flattening;
    tangent_1 = r_value * Math.tan( begLat ); //( r_value * Math.sin( begLat ) ) / Math.cos( begLat );
    tangent_2 = r_value * Math.tan( endLat ); //( r_value * Math.sin( endLat ) ) / Math.cos( endLat );
    c_value_1 = 1.0 / Math.sqrt( ( tangent_1 * tangent_1 ) + 1.0 );
    s_value_1 = c_value_1 * tangent_1;
    c_value_2 = 1.0 / Math.sqrt( ( tangent_2 * tangent_2 ) + 1.0 );
    s = c_value_1 * c_value_2;

    endBearing = s * tangent_2; // backward_azimuth
    begBearing = endBearing * tangent_1;

    x = endLon - begLon;

    do
    {
       sine_of_x   = Math.sin( x );
       cosine_of_x = Math.cos( x );
       tangent_1 = c_value_2 * sine_of_x;
       tangent_2 = endBearing - ( s_value_1 * c_value_2 * cosine_of_x );
       sy = Math.sqrt( ( tangent_1 * tangent_1 ) + ( tangent_2 * tangent_2 ) );
       cy = ( s * cosine_of_x ) + begBearing;
       y = Math.atan2( sy, cy );
       sa = ( s * sine_of_x ) / sy;
       c2a = ( (-sa) * sa ) + 1.0;
       cz = begBearing + begBearing;

       if ( c2a > 0.0 )
       {
          cz = ( (-cz) / c2a ) + cy;
       }

       e = ( cz * cz * 2.0 ) - 1.0;
       c = ( ( ( ( ( -3.0 * c2a ) + 4.0 ) * flattening ) + 4.0 ) * c2a * flattening ) / 16.0;

       prev_d = d;

       d = x;
       x = ( ( ( ( e * cy * c ) + cz ) * sy * c ) + y ) * sa;
       x = ( ( 1.0 - c ) * x * flattening ) + endLon - begLon;
    }
    while (!isEqual (prev_d, x) && !isEqual (d, x));

     // First condition is required to eliminate the recycling

    begBearing = Math.atan2( tangent_1, tangent_2 );
    endBearing = Math.atan2( c_value_1 * sine_of_x, ( (endBearing * cosine_of_x ) - ( s_value_1 * c_value_2 ) ) ) + Math.PI;

    x = Math.sqrt( ( ( ( 1.0 / ( r_value * r_value ) ) - 1 ) * c2a ) + 1.0 ) + 1.0;
    x = ( x - 2.0 ) / x;
    c = 1.0 - x;
    c = ( ( ( x * x ) * 0.25 ) + 1.0 ) / c;
    d = ( ( 0.375 * ( x * x ) ) - 1.0 ) * x;
    x = x * cy;

    s = ( 1.0 - e ) - e;

    var ter1 = 0.0;
    var ter2 = 0.0;
    var ter3 = 0.0;
    var ter4 = 0.0;
    var ter5 = 0.0;

    ter1 = ( sy * sy * 4.0 ) - 3.0;
    ter2 = ( ( s * cz * d ) / 6.0 ) - x;
    ter3 = ter1 * ter2;
    ter4 = ( ( ter3 * d ) * 0.25 ) + cz;
    ter5 = ( ter4 * sy * d ) + y;

    range = ter5 * c * 6378137.0 /* WGS84 equ rad */ * r_value / 1852.0;

    // Check&Turn over to ECDIS
    begBearing = checkBearing (begBearing);
    endBearing = checkBearing (endBearing);
    endBearing = turnBearing (endBearing);

    return { range: range, bearing: rad2deg (begBearing), endBearing: rad2deg (endBearing) };
};

Cary.geo.calcPos = function (begLat, begLon, range, bearing)
{
    var position = google.maps.geometry.spherical.computeOffset (new google.maps.LatLng (begLat, begLon), range * 1852, bearing);
    
    return { endBearing: bearing, lat: position.lat (), lon: position.lng () };
};

Cary.geo.calcGCPos = function (begLat, begLon, range, begBearing, datum)
{
    var endLat     = 0.0;
    var endLon     = 0.0;
    var endBearing = 0.0;
    var flattening;
    var equatorialRadius;

    
    begLat     = deg2rad (begLat);
    begLon     = deg2rad (begLon);
    begBearing = deg2rad (begBearing);
    
    if (Cary.tools.isNothing (datum))
        datum = 1;
    
    if (isInvalidGeoValue (begLat) || isInvalidGeoValue (begLon) || isInvalidGeoValue (range) || isInvalidGeoValue (begBearing))
        return null;

    begLon     = normalizeLon (begLon);
    begBearing = normalizeBearing (begBearing);

    if (!checkBegPointCourseDist (begLat, begLon, begBearing, range, true, false))
        return null;

    // Convert input miles to radians
    //CvMiles2Radian (range);

    // Calculation block
	// Best coincidence with 7Cs Great Circle methods

    // This is a translation of the Fortran routine DIRCT1 found in the
    // FORWRD3D program at:
    // ftp://ftp.ngs.noaa.gov/pub/pcsoft/for_inv.3d/source/forwrd3d.for
    flattening       = 3.35281066474751169502944198282e-3; // WGS84
    equatorialRadius = meters2miles (6378137.0); // WGS84


    var c                                          = 0.0;
    var c2a                                        = 0.0;
    var cosine_of_direction                        = 0.0;
    var cosine_of_y                                = 0.0;
    var cu                                         = 0.0;
    var cz                                         = 0.0;
    var d                                          = 0.0;
    var e                                          = 0.0;
    var direction_in_radians                       = 0.0;
    var r                                          = 0.0;
    var sa                                         = 0.0;
    var sine_of_direction                          = 0.0;
    var sine_of_y                                  = 0.0;
    var su                                         = 0.0;
    var tangent_u                                  = 0.0;
    var term_1                                     = 0.0;
    var term_2                                     = 0.0;
    var term_3                                     = 0.0;
    var x                                          = 0.0;
    var y                                          = 0.0;
    var x_square;

    if (!isValidRange (range))
    {
         return null;
    }
    else if (range < 1.0e-7)
    {
        return { endBearing: rad2deg (begBearing), lat: rad2deg (begLat), lon: rad2deg (begLon) };
    }

    direction_in_radians = begBearing;

    r = 1.0 - flattening;

    tangent_u = r * Math.tan( begLat ); // ( r * Math.sin( begLat ) ) / Math.cos( begLat );

    sine_of_direction = Math.sin( direction_in_radians );

    cosine_of_direction = Math.cos( direction_in_radians );

    if ( cosine_of_direction !== 0.0 )
       endBearing = Math.atan2( tangent_u, cosine_of_direction ) * 2.0;

    cu = 1.0 / Math.sqrt( ( tangent_u * tangent_u ) + 1.0 );
    su = tangent_u * cu;
    sa = cu * sine_of_direction;
    c2a = 1.0 - sa * sa; 
    x = Math.sqrt( ( ( ( 1.0 / (r * r) ) - 1.0 ) * c2a ) + 1.0 ) + 1.0;
    x = ( x - 2.0 ) / x;
    c = 1.0 - x;
    x_square = x * x;
    c = ( ( x_square * 0.25 ) + 1.0 ) / c;
    d = ( ( 0.375 * x_square ) - 1.0 ) * x;

    tangent_u = range * 1852.0 / (r * equatorialRadius * c);

    y = tangent_u;

    do
    {
       sine_of_y = Math.sin( y );
       cosine_of_y = Math.cos( y );
       cz = Math.cos( endBearing + y );
       e = ( cz * cz * 2.0 ) - 1.0;
       c = y;
       x = e * cosine_of_y;
       y = ( e + e ) - 1.0;

       term_1 = ( sine_of_y * sine_of_y * 4.0 ) - 3.0;
       term_2 = ( ( term_1 * y * cz * d ) / 6 ) + x;
       term_3 = ( ( term_2 * d ) * 0.25 ) - cz;
       y = ( term_3 * sine_of_y * d ) + tangent_u;
    }
    while (!isEqual (y, c));

    endBearing = ( cu * cosine_of_y * cosine_of_direction ) - ( su * sine_of_y );

    c = r * hypoLen (sa, endBearing);
    d = ( su * cosine_of_y ) + ( cu * sine_of_y * cosine_of_direction );

    endLat = Math.atan2( d, c );

    c = ( cu * cosine_of_y ) - ( su * sine_of_y * cosine_of_direction );
    x = Math.atan2( sine_of_y * sine_of_direction, c );
    c = ( ( ( ( ( -3.0 * c2a ) + 4.0 ) * flattening ) + 4.0 ) * c2a * flattening ) / 16;
    d = ( ( ( ( e * cosine_of_y * c ) + cz ) * sine_of_y * c ) + y ) * sa;

    endLon = ( begLon + x ) - ( ( 1.0 - c ) * d * flattening );

    endBearing = Math.atan2( sa, endBearing ) + Math.PI;

    endBearing = turnBearing (endBearing);
    //endLon     = checkLongitude (endLon);

    return { endBearing: rad2deg (endBearing), lat: rad2deg (endLat), lon: rad2deg (endLon) };
};

function calcLatEquationRoot (eccentricity, begLat, dNorhing, scaledEquRadius, precision)
{
    var step = 0.001;
    var begPhi;
    var endPhi;
    var midPhi;
    var begValue;
    var midValue;
    var endValue;
    var value = dNorhing / scaledEquRadius;

    // Search for interval range
    begPhi   = begLat - step;
    begValue = calcDeltaPhi (eccentricity, begLat, begPhi);
    endPhi   = begLat + step;
    endValue = calcDeltaPhi (eccentricity, begLat, endPhi);

    if (endValue >= value && begValue <= value)
    {
        // Range is found - no some actions needed
    }
    else if (endValue <= value && begValue >= value)
    {
        // Range is found but must be exachanged
        var gvTemp = begPhi;

        begPhi = endPhi;
        endPhi = gvTemp;
    }
    else if (endValue > begValue && endValue > value)
    {
        // Shift begPhi down until this is great than value
        do
        {
            endPhi   = begPhi;
            begPhi  -= step; 
            endValue = begValue;
            begValue = calcDeltaPhi (eccentricity, begLat, begPhi);
            step    += step;
        }
        while (begValue > value);
    }
    else
    {
        // Shift endPhi upper until this is less than value
        do
        {
            begPhi   = endPhi;
            endPhi  += step; 
            begValue = endValue;
            endValue = calcDeltaPhi (eccentricity, begLat, endPhi);
            step    += step;
        }
        while (endValue < value);
    }

    // Range are found - start linear interpolating...
    do
    {
        midPhi   = begPhi + 
                     (endPhi - begPhi) * (value - begValue) / (endValue - begValue);
        midValue = calcDeltaPhi (eccentricity, begLat, midPhi);

        // Change range...
        if (midValue >= value)
        {
            endPhi   = midPhi;
            endValue = midValue;
        }
        else
        {
            begPhi   = midPhi;
            begValue = midValue;
        }
    }
    while (Math.abs (midValue - value) > precision);

    return midPhi;
}

function internalCalcRLPos (eccentricity, equatorialRadius, begLat, begLon, range, bearing, precision)                                               
{
    var endLat;
    var endLon;
    var scaleCoef       = Math.cos (begLat) / Math.sqrt (1.0 - square (eccentricity * Math.sin (begLat)));
    var scaledEquRadius = scaleCoef * equatorialRadius;
    var dNorthing       = range * Math.cos (bearing);
    var dEasting        = range * Math.sin (bearing);

    endLat = calcLatEquationRoot (eccentricity, begLat, dNorthing, scaledEquRadius, precision);
    endLon = begLon + dEasting / scaledEquRadius;

    // Recalculate scale coefficient for new latitude and repeat...
    scaleCoef       = Math.cos ((begLat + endLat) * 0.5) /
                      Math.sqrt (1.0 - square (eccentricity * Math.sin ((begLat + endLat) * 0.5)));
    scaledEquRadius = scaleCoef * equatorialRadius;
    endLat          = calcLatEquationRoot (eccentricity, begLat, dNorthing, scaledEquRadius, precision);
    endLon          = begLon + dEasting / scaledEquRadius;
    
    return { lat: endLat, lon: endLon };
}

function internalCalcRLRngAndBrg (eccentricity, equatorialRadius, begLat, endLat, westLongDiff, eastLongDiff)
{
    var range;
    var bearing;
    var twoPi           = Math.PI * 2;
    var westLongDiffPos = westLongDiff < 0.0 ? westLongDiff + twoPi : westLongDiff;
    var eastLongDiffPos = eastLongDiff < 0.0 ? eastLongDiff + twoPi : eastLongDiff;
    var middleLat       = (begLat + endLat) * 0.5;
    var scaleCoef       = Math.cos (middleLat) / Math.sqrt (1.0 - square (eccentricity * Math.sin (middleLat)));
    var scaledEquRadius = scaleCoef * equatorialRadius;
    var deltaPhi        = calcDeltaPhi (eccentricity, begLat, endLat);
    var dEasting        = scaledEquRadius * (westLongDiffPos < eastLongDiffPos ? westLongDiffPos : eastLongDiffPos);
    var dNorthing       = scaledEquRadius * deltaPhi;

    return { range: hypoLen (dEasting, dNorthing),
             bearing: fmod (Math.atan2 (westLongDiffPos < eastLongDiffPos ? westLongDiffPos : -eastLongDiffPos, deltaPhi), 
                            Math.PI * 2) };
}

function internalCalcRLRng (eccentricity, equatorialRadius, begLat, endLat, westLongDiff, eastLongDiff)
{
    var middleLat       = (begLat + endLat) * 0.5;
    var scaleCoef       = Math.cos (middleLat) / Math.sqrt (1.0 - square (eccentricity * Math.sin (middleLat)));
    var scaledEquRadius = scaleCoef * equatorialRadius;
    var dEasting        = scaledEquRadius * (westLongDiff < eastLongDiff ? westLongDiff : eastLongDiff);
    var dNorthing       = scaledEquRadius * calcDeltaPhi (eccentricity, begLat, endLat);
             
    return hypoLen (dEasting, dNorthing);
}

Cary.geo.calcRLRangeAndBearing2 = function (begLat, begLon, endLat, endLon, geoid)
{
    var range;
    var bearing;
    
    if (Cary.tools.isNothing (geoid))
        geoid = 1;
    
    begLat = deg2rad (begLat);
    endLat = deg2rad (endLat);
    begLon = deg2rad (begLon);
    endLon = deg2rad (endLon);
    
    if (isInvalidGeoValue (begLat) || isInvalidGeoValue (begLon) || isInvalidGeoValue (endLat) || isInvalidGeoValue (endLon))
        return null;

    if (geoid === 0)
    {
        // Spherical algorythm based on inversed sign for West-East (West positive, East negative)
        begLon = - begLon;
        endLon = - endLon;
    }

    begLon = normalizeLon (begLon);
    endLon = normalizeLon (endLon);

    if (!checkSegmentRag (begLat, begLon, endLat, endLon, true, false))
        return null;

    // Calculation block
    var twoPi        = Math.PI * 2;
    var latDiff      = endLat - begLat;
    var westLongDiff = fmod (endLon - begLon, twoPi);
    var eastLongDiff = fmod (begLon - endLon, twoPi);
    var tangentRate  = Math.tan (endLat * 0.5 + Math.PI * 0.25) / 
                       Math.tan (begLat * 0.5 + Math.PI * 0.25);
    var dirCosine;
    var deltaPhi;

    if (westLongDiff < 0.0)
        westLongDiff += twoPi;
    
    if (eastLongDiff < 0.0)
        eastLongDiff += twoPi;
    
    if (tangentRate <= 0.0)    
        // Attempt to get log of negative or zero
        return null;

    if (geoid === 0)
    {
        // Spherical case
        if (isZero (latDiff))
        {
            // Rhumb line lays on the equator
            dirCosine = Math.cos (begLat); 
            deltaPhi  = 0.0;
        }
        else
        {
            deltaPhi  = Math.log (tangentRate);
            dirCosine = latDiff / deltaPhi;
        }

        // Search the shortest rhumb line
        if (westLongDiff < eastLongDiff)        
        {
            // Westerly rhumb line is the shortest
            bearing = fmod (Math.atan2 (-westLongDiff, deltaPhi), Math.PI * 2);
            range   = radian2miles (hypoLen (dirCosine * westLongDiff, latDiff));
        }
        else
        {
            // Easterly rhumb line is the shortest
            bearing = fmod (atan2 (eastLongDiff, deltaPhi), Math.PI * 2);
            range   = radian2miles (hypoLen (dirCosine * eastLongDiff, latDiff));
        }
    }
    else
    {
        // Use known ellipsoid
        var spitDistanceLeft;
        var stepDistance     = 10.0;
        var precision        = 1.0E-10;
        var flattening       = 3.35281066474751169502944198282e-3; // WGS84
        var equatorialRadius = meters2miles (6378137.0); // WGS84
        var eccentricity     = Math.sqrt (flattening * 2 - square (flattening));
        var rangeUltimate    = 0.0;
        var bearingUltimate;
        var result           = internalCalcRLRngAndBrg (eccentricity, equatorialRadius, begLat, endLat, westLongDiff, eastLongDiff);

        if (result === null)
            return null;

        bearing = result.bearing;
        range   = result.range;

        bearingUltimate  = bearing;
        spitDistanceLeft = range > stepDistance;

        while (spitDistanceLeft)
        {
            // Distance too big - must be splitted...
            var midLat;
            var midLon;
            var midBearing;
            var ratio;
            var result;

            // One step by elementary step distance...
            result = internalCalcRLPos (eccentricity, equatorialRadius, begLat,  begLon, stepDistance, bearingUltimate, precision);
            
            if (result === null)
                return null;
            
            midLat = result.lat;
            midLon = result.lon;

            // Calc distance for rest of distance (this may be splitted too...)
            result = internalCalcRLRngAndBrg (eccentricity, equatorialRadius, midLat, endLat, 
                                              fmod (endLon - midLon, Math.PI * 2), 
                                              fmod (midLon - endLon, Math.PI * 2));

            if (result === null)
                return null;

            midBearing = result.bearing;
            range      = result.range;

            begLat           = midLat;
            begLon           = midLon;
            rangeUltimate   += stepDistance;
            ratio	     = (rangeUltimate === 0.0) ? 1.0 : range / rangeUltimate;
            bearingUltimate  = bearing * (1.0 - ratio) + midBearing * ratio;
            spitDistanceLeft = range > stepDistance;

            if (!spitDistanceLeft)
            {
                range  += rangeUltimate;
                bearing = bearingUltimate;
            }
        }
    }

    while (bearing < 0.0)
        bearing += Math.PI * 2;
    
    return { bearing: rad2deg (bearing), range: range };
};

Cary.geo.calcRLRangeAndBearing = function (begLat, begLon, endLat, endLon, geoid)
{
    var bearing = 0.0;
    var range   = 0.0;
    var latDiff;
    var lonDiff;
    var eccentricity;
    var meridionalDiff;
    var meridionalRangeDiff;
    var flattening       = 3.35281066474751169502944198282e-3; // WGS84
    var equatorialRadius = 6378137.0;                          // WGS84, meters
    
    if (Cary.tools.isNothing (geoid))
        geoid = 1;
    
    if (isInvalidGeoValue (begLat) || isInvalidGeoValue (begLon) || isInvalidGeoValue (endLat) || isInvalidGeoValue (endLon) ||
        Math.abs (begLat) > 10000.0 || Math.abs (begLon) > 10000.0 || Math.abs (endLat) > 10000.0 || Math.abs (endLon) > 10000.0)
        return null;
    
    begLat = normalizeLat (deg2rad (begLat));
    begLon = normalizeLon (deg2rad (begLon));
    endLat = normalizeLat (deg2rad (endLat));
    endLon = normalizeLon (deg2rad (endLon));

    // Calculate difference in latitude and longitude. Beware wrap round in longitude
    lonDiff = endLon - begLon;

    if (lonDiff <= - Math.PI)
        lonDiff += Math.PI * 2;
    else if (lonDiff > Math.PI)
        lonDiff -= Math.PI * 2;

    latDiff = endLat - begLat;

    eccentricity = Math.sqrt (flattening + flattening - flattening * flattening);

    // Test special case of same meridian
    if (Math.abs (latDiff) < 1.0E-10)
    {
        var gvPartial = eccentricity * Math.sin (endLat);
		
        bearing = lonDiff > 0.0 ? 90.0 : 270.0;
	range   = Math.abs (meters2miles (equatorialRadius) * lonDiff * 
                             Math.cos (endLat) / Math.sqrt (1.0 - gvPartial * gvPartial));

        return { bearing: rad2deg (bearing), range: range };
    }

    // Special case of parallel sailings
    if (Math.abs (lonDiff) < 1.0E-10)
    {
        var meridionalDist = calcMeridionalDist (endLat, eccentricity, equatorialRadius) -
                             calcMeridionalDist (begLat, eccentricity, equatorialRadius);
		
        range   = Math.abs (meridionalDist);
	bearing = latDiff > 0.0 ? 0.0 : Math.PI;

        return { bearing: rad2deg (bearing), range: range };
    }	

    // General case
    meridionalDiff      = meridionalPart (endLat, eccentricity) - meridionalPart (begLat, eccentricity);
    meridionalRangeDiff = calcMeridionalDist (endLat, eccentricity, equatorialRadius) -
                          calcMeridionalDist (begLat, eccentricity, equatorialRadius);
    bearing             = normalizeBearing (Math.atan2 (lonDiff, meridionalDiff));
    range               = rad2deg (meridionalRangeDiff) / Math.cos (bearing);

    return { bearing: rad2deg (bearing), range: range };
};

Cary.geo.calcRoughRange = function (lat1, lon1, lat2, lon2)
{
    var coef     = Math.PI / 180.0;
    var northing = Math.abs (lat1 - lat2);
    var easting  = Math.abs (lon1 - lon2) * Math.cos (Math.abs (lat1 + lat2) * coef * 0.5);

    return Math.sqrt (northing * northing + easting * easting) * 60.0;
};

function calcBrgDifference (brg1, brg2)
{
    var difference = Math.abs (brg1 - brg2);
    
    while (difference > 360)
        difference -= 360;
    
    while (difference < 0)
        difference += 360;
    
    if (difference > 180)
        difference = 360 - difference;
    
    return difference;
}

function isBearingBetween (brg, brg1, brg2)
{
    var brgMin, brgMax, result, brgDif;
    
    brgDif = Math.abs (brg2 - brg1);
    
    if (brg2 > brg1)
    {
        if (brgDif <= 180)
        {
            brgMin = brg1;
            brgMax = brg2;
        }
        else
        {
            brgMin = brg2 - 360;
            brgMax = brg1;
        }
    }
    else
    {
        if (brgDif <= 180)
        {
            brgMin = brg2;
            brgMax = brg1;
        }
        else
        {
            brgMin = brg1 - 360;
            brgMax = brg2;
        }
    }
    
    if (brg.inRange (brgMin, brgMax))
        result = true;
    else if (brgMin < 0)
        result = (brg - 360).inRange (brgMin, brgMax);
    
    return result;
}

function legCrossesLegFast (begin1, end1, begin2, end2)
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
        
        if (x.inRange (x21, x22))
        {
            y = y2 (x);
            
            cross = y.inRange (y21, y22);
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
        cross = x.inrange (x11, x12) && x.inrange (x21, x22) && y.inrange (y11, y12) && y.inrange (y21, y22);
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
        return y21 + k1 * (x - x21);
    }
}

function legCrossesLeg (begin1, end1, begin2, end2)
{
    var result;
    
    begin1 = new google.maps.LatLng (begin1.lat, begin1.lon);
    begin2 = new google.maps.LatLng (begin2.lat, begin2.lon);
    end1   = new google.maps.LatLng (end1.lat, end1.lon);
    end2   = new google.maps.LatLng (end2.lat, end2.lon);
    
    var brgBegin1Begin2 = google.maps.geometry.computeHeading (begin1, begin2);
    var brgBegin1End2   = google.maps.geometry.computeHeading (begin1, end2);
    var brgBegin1End1   = google.maps.geometry.computeHeading (begin1, end1);
    
    var brgEnd1Begin2 = google.maps.geometry.computeHeading (end1, begin2);
    var brgEnd1End2   = google.maps.geometry.computeHeading (end1, end2);
    var brgEnd1Begin1 = google.maps.geometry.computeHeading (end1, begin1);
    
    result = isBearingBetween (brgBegin1End1, brgBegin1Begin2, brgBegin1End2) && isBearingBetween (brgEnd1Begin1, brgEnd1Begin2, brgEnd1End2);
}