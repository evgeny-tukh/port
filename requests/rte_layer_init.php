<?php

    require '../db/database.php';
    require '../custom_obj/obj.php';

    $database = new Database ();
    $id       = 0;

    $callback = function ($row) use (&$id)
                {
                    $id = intval ($row ['id']);
                };

    $database->processResult ("select id from layers where name='routes'", $callback);

    $routes = new ObjectLayer ();

    if ($id)
    {
        $routes->getFromDatabase ($database, $id);
    }
    else
    {
        $database->execute ("insert into layers(name) values('routes')");

        $routes->id   = $database->insertID ();
        $routes->name = 'routes';
    }

    $database->close ();

    echo json_encode ($routes->toJSON ());
