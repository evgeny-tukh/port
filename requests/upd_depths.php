<?php

    require '../db/database.php';

    $database = new Database ();

    $data = json_decode (file_get_contents ("php://input"), true);

    foreach ($data as $contourData)
    {
        $query = "update objects o inner join object_user_props p on o.id=p.object set p.value='".$contourData ['depth'].
                 "' where o.name='".$contourData ['name']."' and p.name='maxDraught'";

        $database->execute ($query);
    }

    $database->close ();

    echo "Ok";