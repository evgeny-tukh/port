<?php

    function mysqlTime ($time, $useQuote = TRUE, $useUTC = TRUE)
    {
        $time = doubleval ($time);

        if ($time > 3000000000)
            $time = intval ($time * 0.001);
        else
            $time = intval ($time);

        $quote = $useQuote ? "'" : '';

        if (!$time)
            $result = "null";
        else if ($useUTC)
            $result = $quote.gmstrftime ('%Y-%m-%d %H:%M:%S', $time).$quote;
        else
            $result = $quote.strftime ('%Y-%m-%d %H:%M:%S', $time).$quote;

        return $result;
    }

    function mysqlDate ($time, $useQuote = TRUE)
    {
        $time = doubleval ($time);

        if ($time > 3000000000)
            $time = intval ($time * 0.001);
        else
            $time = intval ($time);

        $quote = $useQuote ? "'" : '';

        return $time ? $quote.gmstrftime ('%Y-%m-%d', $time).$quote : "null";
    }

    function getArrayValue ($array, $key, $default = 'null')
    {
        return array_key_exists ($key, $array) ? $array [$key] : $default;
    }

    function getTimestamp ($dateTimeStr)
    {
        if ($dateTimeStr)
        {
            $dateTime = new DateTime ($dateTimeStr, new DateTimeZone ('UTC'));

            $timestamp = $dateTime->getTimestamp ();

            $result = $timestamp ? $timestamp : NULL;
        }
        else
        {
            $result = NULL;
        }

        return $result;
    }

    function getTimestamp2 ($dateTime)
    {
        return $dateTime ? strtotime ($dateTime.".0Z") : NULL;
    }

    function reportAndExit ($result, $error, $data = [], $exit = TRUE)
    {
        echo json_encode (['result' => $result, 'error' => $error, 'data' => $data]);

        if ($exit)
            exit (0);
    }

