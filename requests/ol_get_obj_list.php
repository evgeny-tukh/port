<?php

    require '../db/database.php';
    require '../custom_obj/obj.php';

    $database = new Database ();

    $objType  = array_key_exists ('ot',$_REQUEST) ? intval ($_REQUEST ['ot']): NULL;
    $userType = array_key_exists ('ut',$_REQUEST) ? intval ($_REQUEST ['ut']): NULL;
    $result   = [];
    $objInfo  = [];

    $callback = function ($row) use (&$objInfo)
    {
        array_push ($objInfo, [ 'id' => intval ($row ['id']), 'layer' => intval ($row ['layer'])]);
    };

    $query = 'select id,layer from objects';

    if ($objType || $userType)
    {
        $clauses = [];

        if ($objType)
            array_push ($clauses, "type=$objType");

        if ($userType)
            array_push ($clauses, "userType=$userType");

        $query .= " where ".implode (' and ', $clauses);
    }

    $database->enumResult ($query, $callback);

    foreach ($objInfo as $item)
    {
        $object = new UserObject ($item ['layer']);

        $object->getFromDatabase ($database, $item ['id']);

        array_push ($result, $object->toJSON ());
    }

    $database->close ();

    echo json_encode ($result);
