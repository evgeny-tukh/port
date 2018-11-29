<?php

    require '../db/database.php';

    $id = 0;

    $database = new Database ();

    if ($database)
    {
        $id    = $_POST ['id'];
        $data  = $_POST ['data'];
        $null  = NULL;
        $query = $id ? "update binaries set data=? where id=$id" : 'insert into binaries(data) values(?)';

        $statement = $database->connection->stmt_init ();

        $statement->prepare ($query);
        $statement->bind_param ('b', $null);

        for ($i = 0, $len = strlen ($data); $i < $len; $i += 8192)
            $statement->send_long_data (0, substr ($data, $i, 8192));
        
        if ($statement->execute ())
            $id = $statement->insert_id;

        $statement->close ();

        $database->close ();
    }

    echo $id;
