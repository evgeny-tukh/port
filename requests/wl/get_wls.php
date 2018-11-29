<?php

    require_once 'wl_config.php';
    require_once '../../util/util.php';

    $devIDs       = array_key_exists ('ids', $_REQUEST) ? explode (';', $_REQUEST ['ids']) : NULL;
    $lastOnly     = array_key_exists ('l', $_REQUEST) ? intval ($_REQUEST ['l']) : FALSE;
    $end          = array_key_exists ('e', $_REQUEST) ? $_REQUEST ['e'] : time ();
    $begin        = array_key_exists ('b', $_REQUEST) ? $_REQUEST ['b'] : $end - 24 * 3600 * 3;
    $beginStr     = mysqlTime ($begin, FALSE, FALSE);//.' 00:00:00';
    $endStr       = mysqlTime ($end + 3600, FALSE, FALSE);//.' 23:59:59';
    $json         = [];
    $wlConnection = pg_connect ("host=$wlHost port=$wlPort dbname=$wlDbName user=$wlUser password=$wlPass");

    foreach ($devIDs as $devID)
    {
        $query = "select * from inform.wlsource where sm_device_id='$devID' ".
                 ($lastOnly ? '' : "and sm_datetime between '$beginStr' and '$endStr'").
                 " order by sm_datetime desc".($lastOnly ? " limit 1" : '');
        $data  = [];

        if ($devID === 'AZOV_PS' || $devID === 'ROSTOV_NA_DONU')
        {
            $fakeData1 = json_decode (file_get_contents ('fakes/rostov/1.json'), true);
            $fakeData2 = json_decode (file_get_contents ('fakes/rostov/2.json'), true);
            $fakeData3 = json_decode (file_get_contents ('fakes/rostov/3.json'), true);
            $fakeData4 = json_decode (file_get_contents ('fakes/rostov/4.json'), true);
            $fakeData  = array_merge_recursive ($fakeData1, $fakeData2, $fakeData3, $fakeData4);
            $begin     = intval ($begin);
            $end       = intval ($end);

            foreach ($fakeData as $item)
            {
                if ($item ['ts'] >= $begin && $item ['device'] === $devID)
                {
                    if ($item ['ts'] <= $end)
                        array_push ($data, $item);
                    else
                        break;
                }
            }

            $data = array_reverse ($data);
        }
        else
        {
            $result = pg_query ($wlConnection, $query);

            while ($row = pg_fetch_assoc ($result)) 
            {
                $levelStr = $row ['sm_level'];
                $levels   = explode (';', $levelStr);
                $level    = 0.0;
                $time     = $row ['sm_datetime'];
                $postID   = doubleval ($row ['sm_post_id']);
                $battery  = doubleval ($row ['sm_battery']) * 1.5;

                for ($i = 1, $cnt = 0; $i < count ($levels) - 1; ++ $i, ++ $cnt)
                    $level += doubleval ($levels [$i]);

                if ($cnt > 0)
                {
                    $level /= $cnt;

                    array_push ($data, ['time' => $time, 'postID' => $postID, 'battery' => $battery, 'level' => $level, 'ts' => strtotime ($time)]);
                }
            }

            pg_free_result ($result);
        }

        $json [$devID] = $data;
    }

    pg_close ($wlConnection);

    echo json_encode ($json);
