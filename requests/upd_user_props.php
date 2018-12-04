<?php

    require '../db/database.php';
    require '../custom_obj/obj.php';

    $count = 0;

    $database = new Database ();

    $changes = json_decode (file_get_contents ("php://input"), true);

    foreach ($changes as $objCode => $objProps)
    {
        foreach ($objProps as $propName => $propValue)
        {
            $query = "insert into object_user_props(object,name,`value`) values($objCode,'$propName','$propValue') ".
                     "on duplicate key update `value`='$propValue'";

            $database->execute ($query);

            if ($database->affectedRows () > 0)
                ++ $count;
        }
    }

    $database->close ();

    echo $count;
