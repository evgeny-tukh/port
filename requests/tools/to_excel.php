<?php

    require_once ('../../phpexcel/PHPExcel.php');

    $data     = json_decode (file_get_contents ("php://input"), true);
    $title    = array_key_exists ('title', $data) ? $data ['title'] : 'Отчет';
    $lines    = array_key_exists ('lines', $data) ? $data ['lines'] : array ();
    $fileName = array_key_exists ('fileName', $data) ? $data ['fileName'] : array ();
    $folder   = '../../../';
    $document = new PHPExcel ();

    $document->getProperties()->setCreator ("Intecs Marine");
    $document->getProperties()->setLastModifiedBy ("Script-generated");
    $document->getProperties()->setTitle ($title);

    $page = $document->setActiveSheetIndex (0);
    $row  = 1;

    $page->getColumnDimensionByColumn ('A')->setWidth ('50');
    $page->getColumnDimensionByColumn ('B')->setWidth ('20');

    foreach ($lines as $line)
    {
        for ($col = 0, $index = 'A'; $col < count ($line); ++ $col, ++ $index)
            $page->setCellValue ("$index$row", $line [$col]);

        ++ $row;
    }

    header ("Expires: Mon, 1 Apr 1974 05:00:00 GMT" );
    header ("Last-Modified: " . gmdate("D,d M YH:i:s") . " GMT" );
    header ("Cache-Control: no-cache, must-revalidate" );
    header ("Pragma: no-cache" );
    header ("Content-type: application/vnd.ms-excel" );
    header ("Content-Disposition: attachment; filename=$fileName" );

    $writer = new PHPExcel_Writer_Excel5 ($document);
 
    $writer->save ($folder.mb_convert_encoding ($fileName, 'Windows-1251', 'UTF-8'));

    echo $folder.$fileName;

