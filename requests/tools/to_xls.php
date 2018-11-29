<?php

    require_once ('../../phpexcel/PHPExcel.php');

    $temp      = '../../../temp';
    $data      = '';//json_decode (file_get_contents ("php://input"), true);
    $separator = ';';//array_key_exists ('separator', $data) ? $data ['separator'] : ',';
    $title     = '־עקוע!';//array_key_exists ('title', $data) ? $data ['title'] : '־עקוע';
    $encoding  = 'utf8';//array_key_exists ('encoding', $data) ? $data ['encoding'] : 'utf-8';
    $lines     = [['ֲנולÿ','׃נמגוםü'],['1111','222'],['3333','444']];//array_key_exists ('lines', $data) ? $data ['lines'] : array ();
    $fileName  = 'my.xls'; //array_key_exists ('fileName', $data) ? $data ['fileName'] : array ();
//echo "sep: $separator; enc: $encoding; fn: $fileName; lines: ".count($lines)."<br/>";
    //header ('Content-Description: File Transfer');
    //header ('Content-Type: application/x-force-download; name="'.$fileName.'"');
    //header ('Content-Disposition: attachment; filename='.$fileName);
    //header ('Content-Type: application/x-force-download; name="report.csv"');
    //header ('Content-Disposition: attachment; filename=report.csv');
    //header ('Expires: 0');
    //header ('Cache-Control: must-revalidate');
    //header ('Pragma: public');

    $document = new PHPExcel ();

    $document->getProperties()->setCreator ("Intecs Marine");
    $document->getProperties()->setLastModifiedBy ("Script-generated");
    $document->getProperties()->setTitle ($title);

    $page = $document->setActiveSheetIndex (0);
    $row  = 1;

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
 
    $writer->save ('php://output');
