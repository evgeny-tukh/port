<?php

    $data   = json_decode (file_get_contents ("php://input"), true);
    $name   = $data ['name'];
    $id     = array_key_exists ('id', $data) ? $data ['id'] : time ();
    $olFile = "../layers/$id.ol";

    $data ['id'] = $id;

    $layer = json_encode ($data);

    file_put_contents ($olFile, $layer);
    
    echo $layer;
