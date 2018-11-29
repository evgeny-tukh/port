<?php

    require '../db/database.php';
    require '../custom_obj/obj.php';

    $database = new Database ();

    $data  = json_decode (file_get_contents ("php://input"), true);
    $array = new InfoArray ();

    $array->getFromSource ($data);
    $array->saveToDatabase ($database);

    $database->close ();

    echo json_encode ($array->toJSON ());
