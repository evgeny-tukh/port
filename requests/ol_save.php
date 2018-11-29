<?php

    require '../db/database.php';
    require '../custom_obj/obj.php';

    $database = new Database ();

    $data  = json_decode (file_get_contents ("php://input"), true);
    $layer = new ObjectLayer ();

    $layer->getFromSource ($data);

    $layer->saveToDatabase ($database);

    $database->close ();

    echo json_encode ($layer->toJSON ());
