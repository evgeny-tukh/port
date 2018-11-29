<?php

    require_once '../db/database.php';

    if (array_key_exists ('l', $_REQUEST))
    {
        $layerID   = $_REQUEST ['l'];
        $objectIDs = array ();

        $db = new Database ();

        $callback = function ($row, $db, &$objectIDs)
                    {
                        array_push ($objectIDs, intval ($row ['id']));
                    };

        $db->enumResult ("select id from objects where layer=$layerID", $callback, $objectIDs);

        foreach ($objectIDs as $objectID)
        {
            $db->execute ("delete from objects where id=$objectID");
            $db->execute ("delete from object_points where object=$objectID");
            $db->execute ("delete from object_props where object=$objectID");
            $db->execute ("delete from object_user_props where object=$objectID");
            $db->execute ("delete from object_attachments where object=$objectID");
        }

        $db->execute ("delete from layers where id=$layerID");

        $db->close ();
    }

    echo 'OK';
