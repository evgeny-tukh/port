<?php

     $source  = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAZdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuMjHxIGmVAAAB7UlEQVRYR8XVv0sDMRQH8NvqoJtOTrY4Vf8HBdHNtS0ITt31T7AIgj9x6ODiUHAoSKu4i9VNBJ1ERcVdRFSwDtZnXnopl/SbNLUHDh+8++a9ezEBDYjoX8HQ20niiGqJfbjmCYZean0vYjiF7mCNBxh64cGXk0RXAj+jGg8w9HLaT/S01MTPqMYDDL2cDYjhhSZ+RjUeYGi1li9K27kylSaIKotN/Lw5v9taR70WMLRazZMX1GsBQ6vCXJEWpsiJa1CvBQydMklyQj0OMHRCQ6NQjwMMXT5mhl7fpgfpa3b4mDIjO4yfOeM11OMCQ5eHsYCEOsjrvGbmncDQ5jEdFHiI+Hlgrt2PB4dyc+lA/GXS11xgaCMG3Lh+S7kBUYPWbGBoEw74RGtMrHV9DTBEXMev/OUaYIiIDzuPX5Eb6OIaYIiEH7Yev8I1XGvmNjA0qeMXqmg9iq9I1npeAwxN4oNex6+Em/W6Bhiawg92PH6Fa7nHzBEYRvFRhhuooHVE1Fbj20CXx69wD/eitSg9yKbK8D9cnKLzBO1FFGy1NcQtOk/QXiTUFCdjnvYioab4PJvztBcpk7w1mmKUKpnztJcW2NyzBprVFkiZ1LVq/MmOmh/y1shpvXtoVlugXKwvf0eae3K+sfKOZhBR8Avlwj7aq/TF6wAAAABJRU5ErkJggg==';
     $source2 = 'https://cdn2.iconfinder.com/data/icons/flat-icons-web/40/Broadcast-128.png';
     $source3 = 'https://previews.123rf.com/images/lynxtime/lynxtime1512/lynxtime151201676/49703314-sea-beacon-icon.jpg';

     saveRawImgAsPng ($source, '../icons/test.png');

     echo "Saved 1<br/>";

     saveRemoteImgAsPng ($source2, '../icons/test2.png');

     echo "Saved 2<br/>";

     saveRemoteImgAsPng ($source3, '../icons/test3.png');

     echo "Saved 3<br/>";

     function saveRemoteImgAsPng ($source, $filePath)
     {
         $content = file_get_contents ($source);

         $image = imagecreatefromstring ($content);
         $image = checkResizeImage ($image, 24, 24);

         imagepng ($image, $filePath);
         imagedestroy ($image);
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

         $image = imagecreatefromstring ($data);
         $image = checkResizeImage ($image, 24, 24);

         imagepng ($image, $filePath);
         imagedestroy ($image);
     }

     function checkResizeImage ($image, $maxWidth, $maxHeight)
     {
         $width  = imagesx ($image);
         $height = imagesy ($image);

         if ($width > $maxWidth || $height > $maxHeight)
         {
             $ratioX    = $maxWidth / $width;
             $ratioY    = $maxHeight / $height;
             $ratio     = min ($ratioX, $ratioY);
             $newWidth  = $width * $ratio;
             $newHeight = $height * $ratio;
             $newImage  = imagecreatetruecolor ($newWidth, $newHeight);

             imagecopyresampled ($newImage, $image, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
             imagedestroy ($image);

             $image = $newImage;
         }

         return $image;
     }
