<?php
$request = $_SERVER['REQUEST_URI'];

//si le fichier existe, on le sert
if(file_exists(dirname(__FILE__).$request) && is_file(dirname(__FILE__).$request) && $request != "/index.php"){
    $ext = substr($request, strripos($request, '.')+1);
    switch($ext){
      case 'css':
        header('Content-Type:text/css');
        break;
      case 'js':
        header('Content-Type:application/javascript');
        break;
      case 'jpg':
        header('Content-Type:image/jpeg');
        break;
      case 'png':
        header('Content-Type:image/png');
        break;
        break;
    }


    readfile(dirname(__FILE__).$request);
    exit;
}else{
  include "index.php";
}

?>
