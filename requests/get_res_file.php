<?php

    $file = array_key_exists ('fn', $_REQUEST) ? $_REQUEST ['fn'] : NULL;

    echo $file ? mb_convert_encoding (file_get_contents ("../res/$file"), 'UTF-8', 'Windows-1251') : 'Fail';
