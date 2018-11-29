<?php

    require_once 'wl_config.php';
    require_once '../../util/util.php';

    $numOfDevs    = array_key_exists ('n', $_REQUEST) ? $_REQUEST ['n'] : 3;
    $time         = array_key_exists ('t', $_REQUEST) ? intval ($_REQUEST ['t']) : time ();
    $timeStr      = mysqlTime ($time, FALSE, FALSE);//.' 00:00:00';
    $data         = [];
    $devices      = [];
    $wlConnection = pg_connect ("host=$wlHost port=$wlPort dbname=$wlDbName user=$wlUser password=$wlPass");

    // Obtain the full list of actual units
    $result = pg_query ($wlConnection, 'select distinct sm_device_id from inform.wlsource where length(sm_device_id)>20');

    while ($row = pg_fetch_row ($result)) 
        array_push ($devices, $row [0]);

    pg_free_result ($result);

    // Add fake devices
    array_push ($devices, 'AZOV_PS', 'ROSTOV_NA_DONU');

    $fakeData1 = json_decode (file_get_contents ('fakes/rostov/1.json'), true);
    $fakeData2 = json_decode (file_get_contents ('fakes/rostov/2.json'), true);
    $fakeData3 = json_decode (file_get_contents ('fakes/rostov/3.json'), true);
    $fakeData4 = json_decode (file_get_contents ('fakes/rostov/4.json'), true);
    $fakeData  = array_merge_recursive ($fakeData1, $fakeData2, $fakeData3, $fakeData4);

    // For each unit get the latest result before $time
    foreach ($devices as $device)
    {
        if ($device === 'AZOV_PS' || $device === 'ROSTOV_NA_DONU')
        {
            $latestData = NULL;

            foreach ($fakeData as $item)
            {
                if ($item ['ts'] <= $time)
                {
                    if ($item ['device'] === $device)
                        $latestData = $item;
                }
                else
                {
                    break;
                }
            }

            array_push ($data, $latestData);
        }
        else
        {
            $query  = "select * from inform.wlsource where sm_device_id='$device' and sm_datetime<='$timeStr' order by sm_datetime desc limit 1";
            $result = pg_query ($wlConnection, $query);
            $row    = pg_fetch_assoc ($result);

            $levelStr = $row ['sm_level'];
            $device   = $row ['sm_device_id'];
            $levels   = explode (';', $levelStr);
            $level    = 0.0;
            $curTime  = $row ['sm_datetime'];
            $postID   = doubleval ($row ['sm_post_id']);
            $battery  = doubleval ($row ['sm_battery']) * 1.5;

            for ($i = 1, $cnt = 0; $i < count ($levels) - 1; ++ $i, ++ $cnt)
                $level += doubleval ($levels [$i]);

            if ($cnt > 0)
            {
                $level /= $cnt;

                array_push ($data, ['time' => $curTime, 'device' => $device, 'postID' => $postID, 'battery' => $battery, 'level' => $level]);
            }

            pg_free_result ($result);
        }
    }

    pg_close ($wlConnection);

    echo json_encode ($data);
