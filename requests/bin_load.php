<?php

    require '../db/database.php';

    $id     = array_key_exists ('id', $_REQUEST) ? $_REQUEST ['id'] : 0;
    $result = '';

    if ($id)
    {
        $database = new Database ();

        if ($database)
        {
            $callback = function ($row) use (&$result)
                        {
                            $result = $row ['data'];
                        };

            $database->processResult ("select data from binaries where id=$id", $callback);
            $database->close ();
        }
    }

    echo $result;
