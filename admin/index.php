<?php
//ini_set('error_reporting', E_ALL);

session_start();
require_once "src/Utils.php";
require_once "src/FicheService.php";
require_once "src/UserService.php";

//Global variable for pages
$fiche = null;
$liste = null;
$reference = null;
$error_msg = null;
$info_msg = null;
$applicationLog = "";


$ficheService = new FicheService();
$userService = new UserService();

//Recuperer les parametres
$page = getFieldFromForm("page");
if(!isset($page)){
    $page = "home";
}

//Gestion des actions
$action = getFieldFromForm("action");
if(!isset($action) && isAuthenticated()){
    $action = "list";
}

//Reecriture d url
$requestURI = $_SERVER['REQUEST_URI'];
if(null!==getApplicationPath()){
    $route = explode(getApplicationPath(),$requestURI)[1];
}else{
    $route = $requestURI;
}


$applicationLog = addLog($applicationLog,"requestURI : ".$requestURI);
$applicationLog = addLog($applicationLog,"route : ".$route);
$matches = null;
if(preg_match('/individus\/(.+)/', $route, $matches)){
    $action = "view";
    $reference = explode("-",$matches[1])[0];
    $_GET["reference"] = $reference;
}



switch ($action){
    case "prepare-login":
        $page = "common/login";
        break;
    case "login":

        $pseudo = getFieldFromForm("pseudo");
        $password = getFieldFromForm("password");
        $token  = $userService->authenticate($pseudo,$password);
        if($token){

            //Stockage des infos en session
            $_SESSION["connected"] = true;
            $_SESSION["token"] = $token;
            $_SESSION["username"] = $pseudo;

            $page = "home";
        }else{
            $error_msg = "pseudo/mot de passe invalides";
            $page = "common/login";
        }

        break;
    case "logout":
        $_SESSION["connected"] = false;
        $_SESSION["token"] = null;
        $_SESSION["username"] = null;
        session_destroy();
        $page = "home";
        break;


    case "index" :

        //Preparation affichage liste
        $letter = getFieldFromForm("letter","A");
        $liste = $ficheService->searchByIndex($letter);
        $page = "index";
        break;

    case "view" :
        $reference = getFieldFromForm("reference");
        $mode = getFieldFromForm("mode");
        $keyword = getFieldFromForm("keyword");
        $fiche = $ficheService->searchByReference($reference);
        $page = "view";
        break;

    case "prepare-edit" :
        $reference = getFieldFromForm("reference");
        $fiche = $ficheService->searchByReference($reference);
        $page = "edit";
        $mode = "EDIT";
        break;

    case "process-edit":
        $reference = getFieldFromForm("reference");
        $raw = getFieldFromForm("raw");
        $result = $ficheService->saveFicheFromText($reference,$raw);
        if($result->message == "OK"){
            $info_msg = "Enregistrement OK";
            $fiche = $ficheService->searchByReference($reference);
            $page = "view";
        }else{
            $error_msg = "Erreur lors de l'enregistrement : ".$result->error;
            $page = "edit";
            $mode = "EDIT";
        }
        break;

    case "prepare-create" :
        $fiche->reference = null;
        $fiche->raw = [];
        $page = "edit";
        $mode = "CREATE";
        break;

    case "process-create":
        $raw = getFieldFromForm("raw");
        $result = $ficheService->saveFicheFromText(null,$raw);
        if($result->message == "OK"){
            $info_msg = "Enregistrement OK";
            $page = "index";
        }else{
            $fiche->reference = null;
            $fiche->raw = explode("\n",$raw);
            $error_msg = "Erreur lors de l'enregistrement : ".$result->error;
            $page = "edit";
            $mode = "CREATE";
        }
        break;

    case "search":
        $keyword = getFieldFromForm("keyword");
        $result = $ficheService->searchByKeyWord($keyword);
        $page = "recherche";
        break;

}


include "pages/common/header.php";
include "pages/$page.php";
include "pages/common/footer.php";