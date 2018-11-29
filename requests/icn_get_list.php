<?php

    $files  = scandir ('../icons');
    $result = array ();

    foreach ($files as $file)
    {
        $path = '../icons/'.$file;

        if (is_file ($path))
        {
            $extPos = strpos ($file, '.icn');

            if ($extPos !== FALSE)
            {
                $data = json_decode (file_get_contents ($path));

                array_push ($result, $data);
            }
        }
    }

    echo json_encode ($result);
