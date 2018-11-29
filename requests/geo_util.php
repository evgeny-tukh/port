<?php

    define ('WGS84_EQUAT_RAD_M', 6378137.0);
    define ('WGS84_POLAR_RAD_M', 6356752.3142451793);
    define ('WGS84_FLATTENING', 3.35281066474751169502944198282e-3);
   
    function checkLongitude ($value)
    {
        return $value >= -180.0 && $value <= 180.0;
    }

    function checkLatitude ($value)
    {
        return $value > -90.0 && $value < 90.0;
    }

    function normalizeLongitude ($value)
    {
        while ($value < -180.0) $value += 360;
        while ($value > 180.0) $value -= 360;

        return $value;
    }

    function calcDeltaPhi ($eccentricity, $begLat, $endLat)
    {
        $ESinBegLat = $eccentricity * sin ($begLat);
        $ESinEndLat = $eccentricity * sin ($endLat);

        return log (tan (M_PI * 0.25 + $endLat * 0.5) / tan (M_PI * 0.25 + $begLat * 0.5) *
                    pow (((1.0 - $ESinEndLat) * (1.0 + $ESinBegLat)) / ((1.0 + $ESinEndLat) * (1.0 - $ESinBegLat)),
                    $eccentricity * 0.5));
    }

    function square ($value)
    {
        return $$value * $$value;
    }

    function meridionalPart ($lat, $eccentricity)
    {
        $part      = $eccentricity * sin ($lat);
        $meridPart = log (tan (M_PI * 0.25 + $lat * 0.5)) -
                     0.5 * $eccentricity * log ((1.0 + $part) / (1.0 - $part));

        return $meridPart;
    }

    function calcMeridionalDist ($lat, $eccentricity, $equRadius)
    {
        $e2 = $eccentricity * $eccentricity;
        $e4 = $e2 * $e2;
        $e6 = $e4 * $e2;
        $v1 = M_PI / 180.0 * (1.0 - $e2 / 4.0 - 3.0 * $e4 / 64.0 - 0.01953125 /*5.0 / 256.0*/ * $e6);
        $v2 = 0.375 /*3.0 / 8.0*/ * ($e2 - $e4 / 4.0 + 0.1171875 /*15.0 / 128.0*/ * $e6);
        $v3 = 0.05859375 /*15.0 / 256.0*/ * ($e4 + 0.75 /*3.0 / 4.0*/ * $e6);
        $v4 = meters2miles ($equRadius);
        $md = $v4 * ($v1 * $lat - $v2 * sin ($lat * 2) + $v3 * sin ($lat * 4));

        return $md;
    }

    function meters2miles ($meters)
    {
        return $meters / 1852.0;
    }

    function hypoLen ($cat1, $cat2)
    {
        return sqrt ($cat1 * $cat1 + $cat2 * $cat2);
    }

    function miles2radian ($miles)
    {
        return $miles * 2.90888208665721596153703703703e-4;
    }

    function radian2miles ($rad)
    {
        return $rad * 3437.7467707849392526107818606515;
    }

    function miles2degree ($miles)
    {
        return $miles * 1.66666666666666666666666666666e-2;
    }

    function degree2miles ($deg)
    {
        return $deg * 60.0;
    }

    function degToRad ($value)
    {
        return M_PI * $value / 180.0;
    }

    function radToDeg ($value)
    {
        return 180.0 / M_PI * $value;
    }

    function isValidRange ($range)
    {
        return $range >= 0.0 && $range < 6378137.0 * (M_PI + M_PI);
    }

    function normalizeLat ($lat)
    {
        while ($lat < - M_PI * 0.5)
            $lat = - M_PI - $lat;

        while ($lat > M_PI * 0.5)
            $lat = M_PI - $lat;

        return $lat;
    }

    function normalizeLon ($lon)
    {
        while ($lon < - M_PI)
            $lon += (M_PI + M_PI);

        while ($lon > M_PI)
            $lon -= (M_PI + M_PI);

        return $lon;
    }

    function isInvalidGeoValue ($value)
    {
        return $value === NULL || is_nan ($value);
    }

    function checkSegmentRag ($begLat, $begLon, $endLat, $endLon, $assumeRadians, $enablePole)
    {
        if (checkGeoPointRange ($begLat, $begLon, $assumeRadians, $enablePole))
            return checkGeoPointRange ($endLat, $endLon, $assumeRadians, $enablePole);
        else
            return false;
    }

    function checkBegPointCourseDist ($begLat, $begLon, $bearing, $range, $assumeRadians, $enablePole)
    {
        if (!checkGeoPointRange ($begLat, $begLon, $assumeRadians, $enablePole))
            return false;

        if ($assumeRadians)
        {
            if (wrongBearing ($bearing))
               return false;
        }
        else
        {
            if (wrongBearingDeg ($bearing))
                return false;
        }

        return !wrongRange ($range);
    }

    function isZero ($value)
    {
        return abs ($value) < 1.0E-7;
    }

    function isPole ($lat, $assumeRadians)
    {
        return ($lat > 0.0 ? 
                isZero ($lat - ($assumeRadians ? M_PI * 0.5 : 90.0)) :
                isZero ($lat - ($assumeRadians ? - M_PI * 0.5 : - 90.0)));
    }

    function wrongLat ($val)
    {
        return isInvalidGeoValue ($val) || $val < - M_PI * 0.5 || $val > M_PI * 0.5;
    }

    function wrongLon ($val)
    {
        return isInvalidGeoValue ($val) || $val < - M_PI || $val > M_PI;
    }

    function wrongLatDeg ($val)
    {
        return isInvalidGeoValue ($val) || $val < - 90.0 || $val > 90.0;
    }

    function wrongLonDeg ($val)
    {
        return isInvalidGeoValue ($val) || $val < - 180.0 || $val > 180.0;
    }

    function wrongBearing ($val)
    {
        return $val < 0.0 || $val >= (M_PI + M_PI);
    }

    function wrongBearingDeg ($val)
    {
        return $val < 0.0 || $val >= 360.0;
    }

    function wrongRange ($range)
    {
        return isInvalidGeoValue ($range) || $range < 0.0;
    }

    function checkGeoPointRange ($lat, $lon, $assumeRadians, $enablePole)
    {
        if (!$enablePole && isPole ($lat, $assumeRadians))
            return false;

        if ($assumeRadians)
        {
            if (wrongLat ($lat))
                return false;

            if (wrongLon ($lon))
                return false;
        }
        else
        {
            if (wrongLatDeg ($lat))
                return false;

            if (wrongLonDeg ($lon))
                return false;
        }

        return true;
    }

    function isEqual ($val1, $val2)
    {
        return abs ($val1 - $val2) < 1.0E-7;
    }

    function checkBearing ($bearing)
    {
        while ($bearing < 0.0)
            $bearing += (M_PI + M_PI);

        return $bearing;
    }

    function turnBearing ($bearing)
    {
        $bearing = ($bearing > M_PI) ? $bearing - M_PI : $bearing + M_PI;

        return normalizeBearing ($bearing);
    }

    function normalizeBearing ($bearing)
    {
        while ($bearing < 0.0)
            $bearing += (M_PI + M_PI);

        while ($bearing >= (M_PI + M_PI))
            $bearing -= (M_PI + M_PI);

        return $bearing;
    }

    function calcGCRangeAndBearing ($begLat, $begLon, $endLat, $endLon, $datum)
    {
        $range      = 0.0;
        $begBearing = 0.0;
        $endBearing = 0.0;

        $begLat = degToRad ($begLat);
        $begLon = degToRad ($begLon);
        $endLat = degToRad ($endLat);
        $endLon = degToRad ($endLon);

        if (!$datum)
            $datum = 1;

        if (isInvalidGeoValue ($begLat) || isInvalidGeoValue ($begLon) || isInvalidGeoValue ($endLat) || isInvalidGeoValue ($endLon) ||
            abs ($begLat) > 10000.0 || abs ($begLon) > 10000.0 || abs ($endLat) > 10000.0 || abs ($endLon) > 10000.)
            return null;

        $begLat = normalizeLat ($begLat);
        $endLat = normalizeLat ($endLat);
        $begLon = normalizeLon ($begLon);
        $endLon = normalizeLon ($endLon);

        if (!checkSegmentRag ($begLat, $begLon, $endLat, $endLon, true, false))
            return null;

        // If both points are the same we cannot calculate as soon begin course as end one. In this case we return zero 
        // distance and zero course
        if (isEqual ($begLat, $endLat) && isEqual ($begLon, $endLon))
            return array ("range" => 0.0, "bearing" => 0.0, "endBearing" => 0.0);

        // Calculation block
        // This is a translation of the Fortran routine INVER1 found in the
        // INVERS3D program at:
        // ftp://ftp.ngs.noaa.gov/pub/pcsoft/for_inv.3d/source/invers3d.for
        // The ton most of variables used... (exclude args and global definitions)
        $flattening  = 3.35281066474751169502944198282e-3; // WGS84
        $c           = 0.0;
        $c_value_1   = 0.0;
        $c_value_2   = 0.0;
        $c2a         = 0.0;
        $cosine_of_x = 0.0;
        $cy          = 0.0;
        $cz          = 0.0;
        $d           = 0.0;
        $e           = 0.0;
        $r_value     = 0.0;
        $s           = 0.0;
        $s_value_1   = 0.0;
        $sa          = 0.0;
        $sine_of_x   = 0.0;
        $sy          = 0.0;
        $tangent_1   = 0.0;
        $tangent_2   = 0.0;
        $x           = 0.0;
        $y           = 0.0;
        $prev_d      = 1.0E300;

        $r_value   = 1.0 - $flattening;
        $tangent_1 = $r_value * tan( $begLat ); //( $r_value * sin( $begLat ) ) / cos( $begLat );
        $tangent_2 = $r_value * tan( $endLat ); //( $r_value * sin( $endLat ) ) / cos( $endLat );
        $c_value_1 = 1.0 / sqrt( ( $tangent_1 * $tangent_1 ) + 1.0 );
        $s_value_1 = $c_value_1 * $tangent_1;
        $c_value_2 = 1.0 / sqrt( ( $tangent_2 * $tangent_2 ) + 1.0 );
        $s         = $c_value_1 * $c_value_2;

        $endBearing = $s * $tangent_2; // backward_azimuth
        $begBearing = $endBearing * $tangent_1;

        $x = $endLon - $begLon;

        do
        {
           $sine_of_x   = sin( $x );
           $cosine_of_x = cos( $x );
           $tangent_1   = $c_value_2 * $sine_of_x;
           $tangent_2   = $endBearing - ( $s_value_1 * $c_value_2 * $cosine_of_x );
           $sy          = sqrt( ( $tangent_1 * $tangent_1 ) + ( $tangent_2 * $tangent_2 ) );
           $cy          = ( $s * $cosine_of_x ) + $begBearing;
           $y           = atan2( $sy, $cy );
           $sa          = ( $s * $sine_of_x ) / $sy;
           $c2a         = ( (-$sa) * $sa ) + 1.0;
           $cz          = $begBearing + $begBearing;

           if ( $c2a > 0.0 )
           {
              $cz = ( (-$cz) / $c2a ) + $cy;
           }

           $e = ( $cz * $cz * 2.0 ) - 1.0;
           $c = ( ( ( ( ( -3.0 * $c2a ) + 4.0 ) * $flattening ) + 4.0 ) * $c2a * $flattening ) / 16.0;

           $prev_d = $d;

           $d = $x;
           $x = ( ( ( ( $e * $cy * $c ) + $cz ) * $sy * $c ) + $y ) * $sa;
           $x = ( ( 1.0 - $c ) * $x * $flattening ) + $endLon - $begLon;
        }
        while (!isEqual ($prev_d, $x) && !isEqual ($d, $x));

         // First condition is required to eliminate the recycling

        $begBearing = atan2( $tangent_1, $tangent_2 );
        $endBearing = atan2( $c_value_1 * $sine_of_x, ( ($endBearing * $cosine_of_x ) - ( $s_value_1 * $c_value_2 ) ) ) + M_PI;

        $x = sqrt( ( ( ( 1.0 / ( $r_value * $r_value ) ) - 1 ) * $c2a ) + 1.0 ) + 1.0;
        $x = ( $x - 2.0 ) / $x;
        $c = 1.0 - $x;
        $c = ( ( ( $x * $x ) * 0.25 ) + 1.0 ) / $c;
        $d = ( ( 0.375 * ( $x * $x ) ) - 1.0 ) * $x;
        $x = $x * $cy;

        $s = ( 1.0 - $e ) - $e;

        $ter1 = 0.0;
        $ter2 = 0.0;
        $ter3 = 0.0;
        $ter4 = 0.0;
        $ter5 = 0.0;

        $ter1 = ( $sy * $sy * 4.0 ) - 3.0;
        $ter2 = ( ( $s * $cz * $d ) / 6.0 ) - $x;
        $ter3 = $ter1 * $ter2;
        $ter4 = ( ( $ter3 * $d ) * 0.25 ) + $cz;
        $ter5 = ( $ter4 * $sy * $d ) + $y;

        $range = $ter5 * $c * 6378137.0 /* WGS84 equ $rad */ * $r_value / 1852.0;

        // Check&Turn over to ECDIS
        $begBearing = checkBearing ($begBearing);
        $endBearing = checkBearing ($endBearing);
        $endBearing = turnBearing ($endBearing);

        return array ("range" => $range, "bearing" => radToDeg ($begBearing), "endBearing" => radToDeg ($endBearing));
    }

    function calcGCPos ($begLat, $begLon, $range, $begBearing, $datum)
    {
        $begLat     = degToRad ($begLat);
        $begLon     = degToRad ($begLon);
        $begBearing = degToRad ($begBearing);
        $endLat     = 0.0;
        $endLon     = 0.0;
        $endBearing = 0.0;
        $flattening = NULL;

        if (!$datum)
            $datum = 1;

        if (isInvalidGeoValue ($begLat) || isInvalidGeoValue ($begLon) || isInvalidGeoValue ($range) || isInvalidGeoValue ($begBearing))
            return null;

        $begLon     = normalizeLon ($begLon);
        $begBearing = normalizeBearing ($begBearing);

        if (!checkBegPointCourseDist ($begLat, $begLon, $begBearing, $range, true, false))
            return null;

        // Convert input $miles to radians
        //CvMiles2Radian ($range);

        // Calculation block
            // Best coincidence with 7Cs Great Circle methods

        // This is a translation of the Fortran routine DIRCT1 found in the
        // FORWRD3D program at:
        // ftp://ftp.ngs.noaa.gov/pub/pcsoft/for_inv.3d/source/forwrd3d.for
        $flattening = 3.35281066474751169502944198282e-3; // WGS84

        $c                                          = 0.0;
        $c2a                                        = 0.0;
        $cosine_of_direction                        = 0.0;
        $cosine_of_y                                = 0.0;
        $cu                                         = 0.0;
        $cz                                         = 0.0;
        $d                                          = 0.0;
        $e                                          = 0.0;
        $direction_in_radians                       = 0.0;
        $r                                          = 0.0;
        $sa                                         = 0.0;
        $sine_of_direction                          = 0.0;
        $sine_of_y                                  = 0.0;
        $su                                         = 0.0;
        $tangent_u                                  = 0.0;
        $term_1                                     = 0.0;
        $term_2                                     = 0.0;
        $term_3                                     = 0.0;
        $x                                          = 0.0;
        $y                                          = 0.0;
        $x_square                                   = NULL;

        if (!isValidRange ($range))
        {
             return null;
        }
        else if ($range < 1.0e-7)
        {
            return array ("endBearing" => radToDeg ($begBearing), "lat" => radToDeg ($begLat), "lon" => radToDeg ($begLon));
        }

        $direction_in_radians = $begBearing;

        $r = 1.0 - $flattening;

        $tangent_u = $r * tan( $begLat ); // ( $r * sin( $begLat ) ) / cos( $begLat );

        $sine_of_direction = sin( $direction_in_radians );

        $cosine_of_direction = cos( $direction_in_radians );

        if ( $cosine_of_direction !== 0.0 )
           $endBearing = atan2( $tangent_u, $cosine_of_direction ) * 2.0;

        $cu = 1.0 / sqrt( ( $tangent_u * $tangent_u ) + 1.0 );
        $su = $tangent_u * $cu;
        $sa = $cu * $sine_of_direction;
        $c2a = 1.0 - $sa * $sa; 
        $x = sqrt( ( ( ( 1.0 / ($r * $r) ) - 1.0 ) * $c2a ) + 1.0 ) + 1.0;
        $x = ( $x - 2.0 ) / $x;
        $c = 1.0 - $x;
        $x_square = $x * $x;
        $c = ( ( $x_square * 0.25 ) + 1.0 ) / $c;
        $d = ( ( 0.375 * $x_square ) - 1.0 ) * $x;

        $tangent_u = $range * 1852.0 / ($r * WGS84_EQUAT_RAD_M * $c);

        $y = $tangent_u;

        do
        {
           $sine_of_y = sin( $y );
           $cosine_of_y = cos( $y );
           $cz = cos( $endBearing + $y );
           $e = ( $cz * $cz * 2.0 ) - 1.0;
           $c = $y;
           $x = $e * $cosine_of_y;
           $y = ( $e + $e ) - 1.0;

           $term_1 = ( $sine_of_y * $sine_of_y * 4.0 ) - 3.0;
           $term_2 = ( ( $term_1 * $y * $cz * $d ) / 6 ) + $x;
           $term_3 = ( ( $term_2 * $d ) * 0.25 ) - $cz;
           $y = ( $term_3 * $sine_of_y * $d ) + $tangent_u;
        }
        while (!isEqual ($y, $c));

        $endBearing = ( $cu * $cosine_of_y * $cosine_of_direction ) - ( $su * $sine_of_y );

        $c = $r * hypoLen ($sa, $endBearing);
        $d = ( $su * $cosine_of_y ) + ( $cu * $sine_of_y * $cosine_of_direction );

        $endLat = atan2( $d, $c );

        $c = ( $cu * $cosine_of_y ) - ( $su * $sine_of_y * $cosine_of_direction );
        $x = atan2( $sine_of_y * $sine_of_direction, $c );
        $c = ( ( ( ( ( -3.0 * $c2a ) + 4.0 ) * $flattening ) + 4.0 ) * $c2a * $flattening ) * 0.0625;
        $d = ( ( ( ( $e * $cosine_of_y * $c ) + $cz ) * $sine_of_y * $c ) + $y ) * $sa;

        $endLon = ( $begLon + $x ) - ( ( 1.0 - $c ) * $d * $flattening );

        $endBearing = atan2( $sa, $endBearing ) + M_PI;

        $endBearing = turnBearing ($endBearing);
        $endLon     = normalizeLongitude ($endLon);

        return Array ("endBearing" => radToDeg ($endBearing), "lat" => radToDeg ($endLat), "lon" => radToDeg ($endLon));
    }

    /////////
    function calcLatEquationRoot ($eccentricity, $begLat, $dNorhing, $scaledEquRadius, $precision)
    {
        $step     = 0.001;
        $begPhi   = NULL;
        $endPhi   = NULL;
        $midPhi   = NULL;
        $begValue = NULL;
        $midValue = NULL;
        $endValue = NULL;
        $value    = $dNorhing / $scaledEquRadius;

        // Search for interval $range
        $begPhi   = $begLat - $step;
        $begValue = calcDeltaPhi ($eccentricity, $begLat, $begPhi);
        $endPhi   = $begLat + $step;
        $endValue = calcDeltaPhi ($eccentricity, $begLat, $endPhi);

        if ($endValue >= $value && $begValue <= $value)
        {
            // Range is found - no some actions needed
        }
        else if ($endValue <= $value && $begValue >= $value)
        {
            // Range is found but must be exachanged
            $gvTemp = $begPhi;
            $begPhi = $endPhi;
            $endPhi = $gvTemp;
        }
        else if ($endValue > $begValue && $endValue > $value)
        {
            // Shift $begPhi down until this is great than $value
            do
            {
                $endPhi   = $begPhi;
                $begPhi  -= $step; 
                $endValue = $begValue;
                $begValue = calcDeltaPhi ($eccentricity, $begLat, $begPhi);
                $step    += $step;
            }
            while ($begValue > $value);
        }
        else
        {
            // Shift $endPhi upper until this is less than $value
            do
            {
                $begPhi   = $endPhi;
                $endPhi  += $step; 
                $begValue = $endValue;
                $endValue = calcDeltaPhi ($eccentricity, $begLat, $endPhi);
                $step    += $step;
            }
            while ($endValue < $value);
        }

        // Range are found - start linear interpolating...
        do
        {
            $midPhi   = $begPhi + ($endPhi - $begPhi) * ($value - $begValue) / ($endValue - $begValue);
            $midValue = calcDeltaPhi ($eccentricity, $begLat, $midPhi);

            // Change $range...
            if ($midValue >= $value)
            {
                $endPhi   = $midPhi;
                $endValue = $midValue;
            }
            else
            {
                $begPhi   = $midPhi;
                $begValue = $midValue;
            }
        }
        while (abs ($midValue - $value) > $precision);

        return $midPhi;
    }

    function internalCalcRLPos ($eccentricity, $equatorialRadius, $begLat, $begLon, $range, $bearing, $precision)                                               
    {
        $endLat          = NULL;
        $endLon          = NULL;
        $scaleCoef       = cos ($begLat) / sqrt (1.0 - square ($eccentricity * sin ($begLat)));
        $scaledEquRadius = $scaleCoef * $equatorialRadius;
        $dNorthing       = $range * cos ($bearing);
        $dEasting        = $range * sin ($bearing);

        $endLat = calcLatEquationRoot ($eccentricity, $begLat, $dNorthing, $scaledEquRadius, $precision);
        $endLon = $begLon + $dEasting / $scaledEquRadius;

        // Recalculate scale coefficient for new latitude and repeat...
        $scaleCoef       = cos (($begLat + $endLat) * 0.5) / sqrt (1.0 - square ($eccentricity * sin (($begLat + $endLat) * 0.5)));
        $scaledEquRadius = $scaleCoef * $equatorialRadius;
        $endLat          = calcLatEquationRoot ($eccentricity, $begLat, $dNorthing, $scaledEquRadius, $precision);
        $endLon          = $begLon + $dEasting / $scaledEquRadius;

        return array ("lat" => $endLat, "lon" => $endLon);
    }

    function internalCalcRLRngAndBrg ($eccentricity, $equatorialRadius, $begLat, $endLat, $westLongDiff, $eastLongDiff)
    {
        $range           = NULL;
        $bearing         = NULL;
        $middleLat       = ($begLat + $endLat) * 0.5;
        $scaleCoef       = cos ($middleLat) / sqrt (1.0 - square ($eccentricity * sin ($middleLat)));
        $scaledEquRadius = $scaleCoef * $equatorialRadius;
        $deltaPhi        = calcDeltaPhi ($eccentricity, $begLat, $endLat);
        $dEasting        = $scaledEquRadius * ($westLongDiff < $eastLongDiff ? $westLongDiff : $eastLongDiff);
        $dNorthing       = $scaledEquRadius * $deltaPhi;

        return array ("range" => hypoLen ($dEasting, $dNorthing),
                      "bearing" => fmod (atan2 ($westLongDiff < $eastLongDiff ? $westLongDiff : -$eastLongDiff, $deltaPhi), M_PI * 2));
    }

    function internalCalcRLRng ($eccentricity, $equatorialRadius, $begLat, $endLat, $westLongDiff, $eastLongDiff)
    {
        $middleLat       = ($begLat + $endLat) * 0.5;
        $scaleCoef       = cos ($middleLat) / sqrt (1.0 - square ($eccentricity * sin ($middleLat)));
        $scaledEquRadius = $scaleCoef * $equatorialRadius;
        $dEasting        = $scaledEquRadius * ($westLongDiff < $eastLongDiff ? $westLongDiff : $eastLongDiff);
        $dNorthing       = $scaledEquRadius * calcDeltaPhi ($eccentricity, $begLat, $endLat);

        return hypoLen ($dEasting, $dNorthing);
    }

    function calcRLRangeAndBearing2 ($begLat, $begLon, $endLat, $endLon, $geoid)
    {
        $range   = NULL;
        $bearing = NULL;

        if (isUndefinedOrNull ($geoid))
            $geoid = 1;

        $begLat = degToRad ($begLat);
        $endLat = degToRad ($endLat);
        $begLon = degToRad ($begLon);
        $endLon = degToRad ($endLon);

        if (isInvalidGeoValue ($begLat) || isInvalidGeoValue ($begLon) || isInvalidGeoValue ($endLat) || isInvalidGeoValue ($endLon))
            return null;

        if ($geoid === 0)
        {
            // Spherical algorythm based on inversed sign for West-East (West positive, East negative)
            $begLon = - $begLon;
            $endLon = - $endLon;
        }

        $begLon = normalizeLon ($begLon);
        $endLon = normalizeLon ($endLon);

        if (!checkSegmentRag ($begLat, $begLon, $endLat, $endLon, true, false))
            return null;

        // Calculation block
        $latDiff      = $endLat - $begLat;
        $westLongDiff = fmod ($endLon - $begLon, M_PI * 2);
        $eastLongDiff = fmod ($begLon - $endLon, M_PI * 2);
        $tangentRate  = tan ($endLat * 0.5 + M_PI * 0.25) / tan ($begLat * 0.5 + M_PI * 0.25);
        $dirCosine    = NULL;
        $deltaPhi     = NULL;

        if ($tangentRate <= 0.0)    
            // Attempt to get log of negative or zero
            return null;

        if ($geoid === 0)
        {
            // Spherical case
            if (isZero ($latDiff))
            {
                // Rhumb line lays on the equator
                $dirCosine = cos ($begLat); 
                $deltaPhi  = 0.0;
            }
            else
            {
                $deltaPhi  = log ($tangentRate);
                $dirCosine = $latDiff / $deltaPhi;
            }

            // Search the shortest rhumb line
            if ($westLongDiff < $eastLongDiff)        
            {
                // Westerly rhumb line is the shortest
                $bearing = fmod (atan2 (-$westLongDiff, $deltaPhi), M_PI * 2);
                $range   = radian2miles (hypoLen ($dirCosine * $westLongDiff, $latDiff));
            }
            else
            {
                // Easterly rhumb line is the shortest
                $bearing = fmod (atan2 ($eastLongDiff, $deltaPhi), M_PI * 2);
                $range   = radian2miles (hypoLen ($dirCosine * $eastLongDiff, $latDiff));
            }
        }
        else
        {
            // Use known ellipsoid
            $spitDistanceLeft = NULL;
            $stepDistance     = 10.0;
            $precision        = 1.0E-10;
            $flattening       = 3.35281066474751169502944198282e-3; // WGS84
            $equatorialRadius = meters2miles (6378137.0); // WGS84
            $eccentricity     = sqrt ($flattening * 2 - square ($flattening));
            $rangeUltimate    = 0.0;
            $bearingUltimate  = NULL;
            $result           = internalCalcRLRngAndBrg ($eccentricity, $equatorialRadius, $begLat, $endLat, $westLongDiff, $eastLongDiff);

            if ($result === null)
                return null;

            $bearing = $result.$bearing;
            $range   = $result.$range;

            $bearingUltimate  = $bearing;
            $spitDistanceLeft = $range > $stepDistance;

            while ($spitDistanceLeft)
            {
                // Distance too big - must be splitted...
                $midLat     = NULL;
                $midLon     = NULL;
                $midBearing = NULL;
                $ratio      = NULL;
                $result     = NULL;

                // One $step by elementary $step distance...
                $result = internalCalcRLPos ($eccentricity, $equatorialRadius, $begLat,  $begLon, $stepDistance, $bearingUltimate, $precision);

                if ($result === null)
                    return null;

                $midLat = $result.$lat;
                $midLon = $result.$lon;

                // Calc distance for rest of distance (this may be splitted too...)
                $result = internalCalcRLRngAndBrg ($eccentricity, $equatorialRadius, $midLat, $endLat, 
                                                   fmod ($endLon - $midLon, M_PI * 2), fmod ($midLon - $endLon, M_PI * 2));

                if ($result === null)
                    return null;

                $midBearing = $result.$bearing;
                $range      = $result.$range;

                $begLat           = $midLat;
                $begLon           = $midLon;
                $rangeUltimate   += $stepDistance;
                $ratio            = ($rangeUltimate === 0.0) ? 1.0 : $range / $rangeUltimate;
                $bearingUltimate  = $bearing * (1.0 - $ratio) + $midBearing * $ratio;
                $spitDistanceLeft = $range > $stepDistance;

                if (!$spitDistanceLeft)
                {
                    $range  += $rangeUltimate;
                    $bearing = $bearingUltimate;
                }
            }
        }

        return array ("bearing" => radToDeg ($bearing), "range" => $range);
    }

    /////////
    function calcRLRangeAndBearing ($begLat, $begLon, $endLat, $endLon, $geoid)
    {
        $bearing             = 0.0;
        $range               = 0.0;
        $latDiff             = NULL;
        $lonDiff             = NULL;
        $eccentricity        = NULL;
        $meridionalDiff      = NULL;
        $meridionalRangeDiff = NULL;
        $flattening          = 3.35281066474751169502944198282e-3; // WGS84
        $equatorialRadius    = 6378137.0;                          // WGS84, $meters

        if (isUndefinedOrNull ($geoid))
            $geoid = 1;

        if (isInvalidGeoValue ($begLat) || isInvalidGeoValue ($begLon) || isInvalidGeoValue ($endLat) || isInvalidGeoValue ($endLon) ||
            abs ($begLat) > 10000.0 || abs ($begLon) > 10000.0 || abs ($endLat) > 10000.0 || abs ($endLon) > 10000.0)
            return null;

        $begLat = normalizeLat (degToRad ($begLat));
        $begLon = normalizeLon (degToRad ($begLon));
        $endLat = normalizeLat (degToRad ($endLat));
        $endLon = normalizeLon (degToRad ($endLon));

        // Calculate difference in latitude and longitude. Beware wrap round in longitude
        $lonDiff = $endLon - $begLon;

        if ($lonDiff <= - M_PI)
            $lonDiff += M_PI * 2;
        else if ($lonDiff > M_PI)
            $lonDiff -= M_PI * 2;

        $latDiff = $endLat - $begLat;

        $eccentricity = sqrt ($flattening + $flattening - $flattening * $flattening);

        // Test special case of same meridian
        if (abs ($latDiff) < 1.0E-10)
        {
            $gvPartial = $eccentricity * sin ($endLat);
            $bearing   = $lonDiff > 0.0 ? 90.0 : 270.0;
            $range     = abs (meters2miles ($equatorialRadius) * $lonDiff * cos ($endLat) / sqrt (1.0 - $gvPartial * $gvPartial));

            return array ("bearing" => radToDeg ($bearing), "range" => $range);
        }

        // Special case of parallel sailings
        if (abs ($lonDiff) < 1.0E-10)
        {
            $meridionalDist = calcMeridionalDist ($endLat, $eccentricity, $equatorialRadius) -
                              calcMeridionalDist ($begLat, $eccentricity, $equatorialRadius);
            $range          = abs ($meridionalDist);
            $bearing        = $latDiff > 0.0 ? 0.0 : M_PI;

            return array ("bearing" => radToDeg ($bearing), "range" => $range);
        }	

        // General case
        $meridionalDiff      = meridionalPart ($endLat, $eccentricity) - meridionalPart ($begLat, $eccentricity);
        $meridionalRangeDiff = calcMeridionalDist ($endLat, $eccentricity, $equatorialRadius) -
                               calcMeridionalDist ($begLat, $eccentricity, $equatorialRadius);
        $bearing             = normalizeBearing (atan2 ($lonDiff, $meridionalDiff));
        $range               = radToDeg ($meridionalRangeDiff) / cos ($bearing);

        return array ("bearing" => radToDeg ($bearing), "range" => $range);
    }

    function calcRoughRange ($lat1, $lon1, $lat2, $lon2)
    {
        $northing = abs ($lat1 - $lat2);
        $easting  = abs ($lon1 - $lon2) * cos (abs ($lat1 + $lat2) * 0.5);
        
        return sqrt ($northing * $northing + $easting * $easting) * 60.0;
    }
    