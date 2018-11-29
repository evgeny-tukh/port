<?php

    require '../db/database.php';
    require '../custom_obj/obj.php';

    $id = array_key_exists ('id', $_REQUEST) ? $_REQUEST ['id'] : NULL;

    if ($id)
    {
        $database = new Database ();

        $array = new InfoArray ();

        $array->getFromDatabase ($database, $id);

        $result = $array->toJSON ();

        $database->close ();
    }
    else
    {
        $result = [];
    }

    echo json_encode ($result);
