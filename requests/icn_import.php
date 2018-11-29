<?php

    const MAX_DIM = 32;
    
    $data    = json_decode (file_get_contents ("php://input"), true);
    $name    = $data ['name'];
    $url     = $data ['url'];
    $time    = time ();
    $imgFile = "../icons/$time.png";
    $icnFile = "../icons/$time.icn";
    $link    = "icons/$time.png";

    if (substr ($url, 0, 5) === 'data:')
        saveRawImgAsPng ($url, $imgFile);
    else
        saveRemoteImgAsPng ($url, $imgFile);

    $icn = json_encode (array ('name' => $name, 'url' => $link, 'id' => $time));

    file_put_contents ($icnFile, $icn);
    
    echo $icn;

    function saveRemoteImgAsPng ($source, $filePath)
    {
        $content = file_get_contents ($source);

        list ($width, $height) = getimagesizefromstring ($content);
        
        if ($width <= MAX_DIM && $height <= MAX_DIM)
        {
            file_put_contents ($filePath, $content);
        }
        else
        {
            $image = checkResizeImage (imagecreatefromstring ($content), MAX_DIM, MAX_DIM);

            imagepng ($image, $filePath);
            imagedestroy ($image);
        }
    }

    function saveRawImgAsPng ($source, $filePath)
    {
        $colonPos     = strpos ($source, ':');
        $semicolonPos = strpos ($source, ';', $colonPos + 1);
        $commaPos     = strpos ($source, ',', $semicolonPos + 1);
        $imgType      = substr ($source, $colonPos + 1, $semicolonPos - $colonPos - 1);
        $encodeType   = substr ($source, $semicolonPos + 1, $commaPos - $semicolonPos - 1);
        $data         = substr ($source, $commaPos + 1);

        if ($encodeType === 'base64')
            $data = base64_decode ($data);

        list ($width, $height) = getimagesizefromstring ($data);
        
        if ($width <= MAX_DIM && $height <= MAX_DIM)
        {
            file_put_contents ($filePath, $data);
        }
        else
        {
            $image = checkResizeImage (imagecreatefromstring ($data), MAX_DIM, MAX_DIM);

            imagepng ($image, $filePath);
            imagedestroy ($image);
        }
    }

    function checkResizeImage ($image, $maxWidth, $maxHeight)
    {
        $width  = imagesx ($image);
        $height = imagesy ($image);

        $ratioX    = $maxWidth / $width;
        $ratioY    = $maxHeight / $height;
        $ratio     = min ($ratioX, $ratioY);
        $newWidth  = $width * $ratio;
        $newHeight = $height * $ratio;
        $newImage  = imagecreatetruecolor ($newWidth, $newHeight);
        $transpInd = imagecolortransparent ($image);

        if ($transpInd >= 0)
            $transpCol = imagecolorsforindex ($image, $transpInd);
        else
            $transpCol = imagecolorallocate (254, 254, 254);

        if ($width > $maxWidth || $height > $maxHeight)
            imagecopyresized ($newImage, $image, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
        else
            imagecopy ($newImage, $image, 0, 0, 0, 0, $width, $height);
        
        imagedestroy ($image);

        $transpInd = imagecolorallocate ($newImage, $transpCol ['red'], $transpCol ['green'], $transpCol ['blue']);

        imagefill ($newImage, 0, 0, $transpInd);
        imagecolortransparent ($newImage, $transpInd);

        return $newImage;
    }
