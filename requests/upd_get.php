<?php

    require '../db/database.php';
    require 'global_func.php';
    require 'upd_def.php';

    $database = new Database ();
    $subject  = $_REQUEST ['s'];
    $target   = $_REQUEST ['t'];

    switch (intval ($target))
    {
        case TARGET_LAYER:
            $actions = implode (',', array (UPDATE_NEW_LAYER, UPDATE_DEL_LAYER)); break;

        case TARGET_OBJECT:
            $actions = implode (',', 
                                array (UPDATE_NEW_OBJECT, UPDATE_DEL_OBJECT, UPDATE_NEW_ATTACHMENT, UPDATE_DEL_ATTACHMENT, UPDATE_UI_CHANGED, 
                                       UPDATE_UPL_ATTACHMENT, UPDATE_DRAFT_CHANGED)); 

            break;

        default:
            die;
    }

    $query    = "select timestamp,update_type,old_value,new_value from update_log where update_type in ($actions) and update_subject=$subject";
    $result   = array ();
    $callback = function ($row) use (&$result)
                {
                    array_push ($result,
                                array ('timestamp' => getTimestamp ($row ['timestamp']), 'action' => intval ($row ['update_type']),
                                       'oldValue' => $row ['old_value'], 'newValue' => $row ['new_value']));
                };

    $database->enumResult ($query, $callback);
    $database->close ();

    echo json_encode ($result);
