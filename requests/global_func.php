<?php

    function getTimestamp ($dateTimeStr)
    {
        $dateTime = new DateTime ($dateTimeStr, new DateTimeZone ('UTC'));

        $timestamp = $dateTime->getTimestamp ();

        return $timestamp ? $timestamp : NULL;
    }

    function getTimestamp2 ($dateTime)
    {
        return strtotime ($dateTime.".0Z");
    }

    function mysqlTime ($time, $useQuote = TRUE)
    {
        $time = doubleval ($time);

        if ($time > 3000000000)
            $time = intval ($time * 0.001);
        else
            $time = intval ($time);

        $quote = $useQuote ? "'" : '';

        return $time ? $quote.gmstrftime ('%Y-%m-%d %H:%M:%S', $time).$quote : "null";
    }

    function formatLat ($lat, $degree = ' ')
    {
        if ($lat === NULL)
        {
            $result = "N/A";
        }
        else
        {
            $absValue = abs ($lat);
            $deg      = intval ($absValue);
            $min      = ($absValue - $deg) * 60.0;
            $result   = sprintf ("%02d%s%06.3f%s", $deg, $degree, $min, $lat >= 0.0 ? "N" : "S");
        }
        
        return $result;
    }
    
    function formatLon ($lon, $degree = ' ')
    {
        if ($lon === NULL)
        {
            $result = "N/A";
        }
        else
        {
            $absValue = abs ($lon);
            $deg      = intval ($absValue);
            $min      = ($absValue - $deg) * 60.0;
            $result   = sprintf ("%03d%s%06.3f%s", $deg, $degree, $min, $lon >= 0.0 ? "E" : "W");
        }
        
        return $result;
    }
    
    function dateHourToStr ($time)
    {
        return $time ? gmstrftime ('%Y-%m-%d %I%p', intval ($time)) : "";
    }

    function getKeyValue ($array, $key, $default = NULL)
    {
        return array_key_exists ($key, $array) ? $array [$key] : $default;
    }
