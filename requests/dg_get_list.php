<?php

    $files  = scandir ('../dg');
    $result = array ();

    foreach ($files as $file)
    {
        $path = '../dg/'.$file;

        if (is_file ($path))
        {
            $extPos = strpos ($file, '.dg');

            if ($extPos !== FALSE)
            {
                $data = json_decode (file_get_contents ($path));

                array_push ($result, $data);
            }
        }
    }

    echo json_encode ($result);
