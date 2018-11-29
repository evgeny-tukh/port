<?php

    $data = json_decode (file_get_contents ("php://input"), true);
    $id   = $data ['id'];

    unlink ("../layers/$time.ol");

    echo 'ok';
