<?php

    require '../db/database.php';
    require 'global_func.php';
    require 'upd_def.php';

    $database = new Database ();
    $result   = array ();
    $query    = "select l.id lid,`timestamp` ts,update_type typ,update_subject sbj,old_value ov,new_value nv,o.name onm,lrs.name lnm ".
                "from update_log l left join objects o on l.update_subject=o.id left join layers lrs on l.update_subject=lrs.id ".
                "order by `timestamp`";

    $callback = function ($row) use (&$result)
                {
                    switch (intval ($row ['typ']))
                    {
                        case UPDATE_NEW_LAYER:
                        case UPDATE_DEL_LAYER:
                            $subjectName = $row ['lnm']; break;

                        default:
                            $subjectName = $row ['onm'];
                    }

                    array_push ($result, array ('id' => intval ($row ['lid']),
                                                'timestamp' => getTimestamp ($row ['ts']),
                                                'action' => intval ($row ['typ']),
                                                'subject' => intval ($row ['sbj']),
                                                'oldValue' => $row ['ov'],
                                                'newValue' => $row ['nv'],
                                                'subjectName' => $subjectName));
                };

    $database->enumResult ($query, $callback);
    $database->close ();

    echo json_encode ($result);
