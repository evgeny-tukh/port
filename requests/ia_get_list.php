<?php

    require '../db/database.php';
    require '../custom_obj/obj.php';

    $database = new Database ();

    $result = array ();

    $callback = function ($row) use (&$result)
    {
        array_push ($result, array ('id' => intval ($row ['id']), 'name' => $row ['name']));
    };

    $database->enumResult ("select id,name from info_arrays order by name", $callback);

    $database->close ();

    echo json_encode ($result);
