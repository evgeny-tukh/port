<?php

    require_once ('../../db/database.php');

    set_time_limit (0);

    $db  = new Database ();
    $ids = [];

    $cb = function ($row) use (&$ids)
          {
              array_push ($ids, intval ($row ['id']));
          };

    $db->enumResult ("select id from objects where layer in (37,100)", $cb);

    $count = 1;

    foreach ($ids as $id)
    {
        $query = "insert into object_user_props(object,name,value) values($id,'areaDepth','30'),($id,'deviceID','55FF27600598843561413278'),".
                 "($id,'id','nc$count'),($id,'limitationType','1')";
//echo "$query<br/><br/>";
        $db->execute ($query);

        $count ++;
    }

    $db->close ();

    echo "Done.";
