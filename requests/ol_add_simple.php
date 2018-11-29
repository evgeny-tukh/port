<?php

    require '../db/database.php';

    $name   = $_REQUEST ['n'];
    $result = 0;

    if ($name)
    {
        $database = new Database ();

        $database->execute ("insert into layers(name) values('$name')");

        $result = $database->insertID ();

        $database->close ();
    }

    echo $result;
