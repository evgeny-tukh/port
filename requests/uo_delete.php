<?php

    require_once '../db/database.php';

    if (array_key_exists ('o', $_REQUEST))
    {
        $objectID = $_REQUEST ['o'];

        $db = new Database ();

        $db->execute ("delete from objects where id=$objectID");
        $db->execute ("delete from object_points where object=$objectID");
        $db->execute ("delete from object_props where object=$objectID");
        $db->execute ("delete from object_user_props where object=$objectID");
        $db->execute ("delete from object_attachments where object=$objectID");
        $db->close ();
    }

    echo 'OK';
