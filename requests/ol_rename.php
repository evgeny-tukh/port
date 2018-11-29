<?php

    $data  = json_decode (file_get_contents ("php://input"), true);
    $name  = $data ['name'];
    $id    = $data ['id'];
    $file  = "../layers/$id.ol";
    $data  = file_get_contents ($file);
    $layer = (array) json_decode ($data);

    $layer ['name']           = $name;
    $layer ['object']['name'] = $name;

    $data = json_encode ($layer);

    file_put_contents ($file, $data);

    echo $data;
