<?php

    require '../db/database.php';

    $data   = json_decode ('php://input', TRUE);
    $result = 0;

    if (array_key_exists ('name', $data) && array_key_exists ('value', $data))
    {
        $name  = $data ['name'];
        $value = $data ['value'];

        $database = new Database ();

        if ($database)
        {
            $database->execute ("insert into settings(name,value) values ('$name','$value') on duplicate key update value='$value'", $callback);

            $result = $database->insertID ();

            $database->close ();
        }
    }

    echo $result;
