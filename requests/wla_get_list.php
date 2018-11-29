<?php

    require_once '../db/database.php';

    $db = new Database ();

    $result = array ();

    $callback = function ($row, $db, &$result)
                {
                    $item = array ('id' => intval ($row ['id']), 'name' => $row ['name'], 'device' => $row ['device']);

                    $item ['baseValue'] = $row ['base_value'] ? doubleval ($row ['base_value']) : NULL;
                    $item ['baseLevel'] = $row ['base_level'] ? doubleval ($row ['base_level']) : NULL;

                    array_push ($result, $item);
                };

    $db->enumResult ('select * from waterlevel_areas order by name', $callback, $result);

    echo json_encode ($result);
