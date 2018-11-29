<?php

    $files  = scandir ('../dg');
    $id     = array_key_exists ('id', $_REQUEST) ? $_REQUEST ['id'] : NULL;
    $result = NULL;

    if ($id)
    {
        $path = "../dg/$id.dg";

        if (is_file ($path))
            $result = json_decode (file_get_contents ($path));
    }

    echo json_encode ($result);
