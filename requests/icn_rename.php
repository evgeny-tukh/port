<?php

    $data = json_decode (file_get_contents ("php://input"), true);
    $name = $data ['name'];
    $id   = $data ['id'];
    $file = "../icons/$id.icn";
    $data = file_get_contents ($file);
    $icon = (array) json_decode ($data);

    $icon ['name'] = $name;

    $data = json_encode ($icon);

    file_put_contents ($file, $data);

    echo $data;
