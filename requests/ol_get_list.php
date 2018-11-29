<?php

    $files  = scandir ('../layers');
    $result = array ();

    foreach ($files as $file)
    {
        $path = '../layers/'.$file;

        if (is_file ($path))
        {
            $extPos = strpos ($file, '.ol');

            if ($extPos !== FALSE)
            {
                $data    = json_decode (file_get_contents ($path), TRUE);
                $objects = $data ['objects'];
                $objArr  = array ();

var_dump($objects);echo "<br/>***</br>";
                foreach ((array) $objects as $key => $obj)
                {
                    if (array_key_exists ('userInfoFile', $obj))
                    {
                        $userInfoFile = $obj ['userInfoFile'];
                        $userInfoStr  = mb_convert_encoding (file_get_contents ("../usr_info/$userInfoFile"), 'UTF-8', 'Windows-1251');
                        $userInfo     = json_decode ($userInfoStr, TRUE);

                        $uiArray = array ();

                        foreach ($userInfo ['data'] as $key => $value)
                            array_push ($uiArray, array ('name' => $key, 'value' => $value));

                        $obj ['userInfo'] = $uiArray;

                        array_push ($objArr, $obj);
                    }
                }

                $data ['objects'] = $objArr;

                array_push ($result, $data);
            }
        }
    }

    echo mb_convert_encoding (json_encode ($result), 'UTF-8', 'Windows-1251');
