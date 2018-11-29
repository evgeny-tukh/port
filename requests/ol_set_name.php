<?php

    require '../db/database.php';
    require '../custom_obj/obj.php';

    $database = new Database ();

    $data  = json_decode (file_get_contents ("php://input"), true);
    $layer = new ObjectLayer ();

    $layer->id   = $data ['id'];
    $layer->name = $data ['name'];

    $layer->rename ($database);

    $database->close ();

    echo $layer->name;
