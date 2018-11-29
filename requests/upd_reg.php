<?php

    require '../db/database.php';
    require 'global_func.php';

    $database = new Database ();
    $updates  = json_decode (file_get_contents ("php://input"), true);

    foreach ($updates as $index => $update)
    {
        $time     = mysqlTime ($update ['timestamp'], FALSE);
        $action   = $update ['action'];
        $id	  = $update ['subject'];
        $oldValue = $update ['oldValue'];
        $newValue = $update ['newValue'];
        $query    = "insert into update_log(timestamp,update_type,update_subject,old_value,new_value) values('$time',$action,$id,'$oldValue','$newValue')";

        $database->execute ($query);

        $updates [$index]['id'] = $database->insertID ();
    }

    $database->close ();

    echo json_encode ($updates);
