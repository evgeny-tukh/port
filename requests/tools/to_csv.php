<?php
    $temp      = '../../../temp';
    $data      = json_decode (file_get_contents ("php://input"), true);
    $separator = array_key_exists ('separator', $data) ? $data ['separator'] : ',';
    $encoding  = array_key_exists ('encoding', $data) ? $data ['encoding'] : 'utf-8';
    $lines     = array_key_exists ('lines', $data) ? $data ['lines'] : array ();
    $fileName  = array_key_exists ('fileName', $data) ? $data ['fileName'] : array ();
//echo "sep: $separator; enc: $encoding; fn: $fileName; lines: ".count($lines)."<br/>";
    //header ('Content-Description: File Transfer');
    //header ('Content-Type: application/x-force-download; name="'.$fileName.'"');
    //header ('Content-Disposition: attachment; filename='.$fileName);
    //header ('Content-Type: application/x-force-download; name="report.csv"');
    //header ('Content-Disposition: attachment; filename=report.csv');
    //header ('Expires: 0');
    //header ('Cache-Control: must-revalidate');
    //header ('Pragma: public');

    $resLines = array ();

    foreach ($lines as $line)
        array_push ($resLines, join ($separator, $line));
        //echo join ($separator, $line)."\r\n";

    $content = join ("\r\n", $resLines);
    $tmpFile = $temp.'/___'.time ().'.csv';

    file_put_contents ($tmpFile, $content);
    //readfile ($tmpFile);

    echo $tmpFile;
