<?php

    require '../db/database.php';
    require '../custom_obj/obj.php';

    $database = new Database ();

    $data    = json_decode (file_get_contents ("php://input"), true);
    $layerID = array_key_exists ('layerID', $data) ? $data ['layerID'] : 0;
    $object  = new UserObject ($layerID);

    $object->getFromSource ($data);
    $object->saveToDatabase ($database);

    $database->close ();

    echo json_encode ($object->toJSON ());
