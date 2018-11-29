<?php

    $data   = json_decode (file_get_contents ("php://input"), true);
    $name   = $data ['name'];
    $id     = (array_key_exists ('id', $data) && $data ['id']) ? $data ['id'] : time ();
    $dgFile = "../dg/$id.dg";

    $data ['id'] = $id;

    $docGroup = json_encode ($data);

    file_put_contents ($dgFile, $docGroup);
    
    echo $docGroup;
