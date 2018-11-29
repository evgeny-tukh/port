<?php

    require '../db/database.php';

    $settings = array ();
    $database = new Database ();

    if ($database)
    {
        $callback = function ($row) use (&$settings)
                    {
                        array_push ($settings, array ('id' => intval ($row ['id']), 'name' => $row ['name'], 'value' => $row ['value']));
                    };

        $database->enumResult ('select * from settings', $callback);
        $database->close ();
    }

    echo json_encode ($settings);
