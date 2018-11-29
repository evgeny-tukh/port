<?php

    $data = json_decode (file_get_contents ("php://input"), true);
    $name = $data ['name'];
    $id   = $data ['id'];

    unlink ("../icons/$id.icn");
    unlink ("../icons/$id.png");

    echo 'ok';
