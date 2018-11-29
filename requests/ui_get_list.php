<?php

    $files  = scandir ('../usr_info');
    $result = array ();

    foreach ($files as $file)
    {
        $path = '../usr_info/'.$file;

        if (is_file ($path))
        {
            $extPos = strpos ($file, '.ui');

            if ($extPos !== FALSE)
            {
                $data = json_decode (mb_convert_encoding (file_get_contents ($path), 'UTF-8', 'Windows-1251'), TRUE);
                $info = array ('id' => substr ($file, 0, $extPos), 'data' => $data ['data'], 'name' => $data ['name']);
                array_push ($result, $info);
            }
        }
    }

    echo json_encode ($result);
