<?php
    require '../db/database.php';
    require '../custom_obj/obj.php';

    $files  = scandir ('../usr_info');
    $arrays = array ();

    $database = new Database ();

    $database->execute ('delete from info_arrays');
    $database->execute ('delete from info_items');

    foreach ($files as $file)
    {
        $path = '../usr_info/'.$file;

        if (is_file ($path))
        {
            $extPos = strpos ($file, '.ui');

            if ($extPos !== FALSE)
            {
                $infoArray = new InfoArray ();

                $infoArray->getFromSource (json_decode (mb_convert_encoding (file_get_contents ($path), 'UTF-8', 'Windows-1251'), TRUE));
                $infoArray->saveToDatabase ($database);

                array_push ($arrays, $infoArray);
            }
        }
    }

    echo json_encode ($arrays);
    $database->close ();
