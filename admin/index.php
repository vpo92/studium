<?php
//ini_set('error_reporting', E_ALL);

session_start();
require_once "src/LoggerService.php";
require_once "src/Utils.php";
require_once "src/UserService.php";
require_once "src/FicheService.php";
require_once "src/ManuscritService.php";
require_once "src/MessageUtils.php";

$loggerService = new LoggerService();
$userService = new UserService();
$ficheService = new FicheService();
$manuscritService = new ManuscritService();


$mock = false;
if($mock){
  require_once "src/FicheServiceMock.php";
  $ficheService = new FicheServiceMock();
}

//Global variable for pages
$fiche = null;
$liste = null;
$reference = null;
$error_msg = null;
$info_msg = null;
$pageCSS = "";
$pageScripts = "";


try{

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

    //Si mode dev
    $route = str_replace("/admin","",$requestURI);

    $loggerService->log("requestURI : ".$requestURI);
    $loggerService->log("route : ".$route);
    $matches = null;
    if(preg_match('/individus\/(.+)/', $route, $matches)){
        $action = "view";
        $reference = explode("-",$matches[1])[0];
        $_GET["reference"] = $reference;
    }elseif($route === "/contact"){
        $page = "contact";
    }elseif($route === "/aide"){
        $page = "aide";
    }elseif($route === "/home"){
        $page = "home";
    }


    $loggerService->log("action : $action");
    switch ($action){
        case "prepare-login":
            $page = "common/login";
            break;
        case "login":

            $pseudo = getFieldFromForm("pseudo");
            $password = getFieldFromForm("password");
            $token  = $userService->authenticate($pseudo,$password);
            if($token){
                //decode token
                $tokenParts = explode(".", $token);
                $tokenHeader = base64_decode($tokenParts[0]);
                $tokenPayload = base64_decode($tokenParts[1]);
                $jwtHeader = json_decode($tokenHeader);
                $jwtPayload = json_decode($tokenPayload);

                //Stockage des infos en session
                $_SESSION["connected"] = true;
                $_SESSION["token"] = $token;
                $_SESSION["username"] = $pseudo;
                $_SESSION["role"] = $jwtPayload->role;

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
            $loggerService->log("reference : ".$reference);
            $mode = getFieldFromForm("mode");
            $keyword = getFieldFromForm("keyword");
            $fiche = $ficheService->searchByReference($reference);
            if(isset($fiche) && isset($fiche->reference)){
                $page = "view";
            }else{
                $page = "nontrouve";
            }

            break;

        case "view-draft" :
            $reference = getFieldFromForm("reference");
            $loggerService->log("reference : ".$reference);
            $mode = getFieldFromForm("mode");
            $keyword = getFieldFromForm("keyword");
            $fiche = $ficheService->getDraftByReference($reference);
            if(isset($fiche) && isset($fiche->reference)){
                $page = "view";
            }else{
                $page = "nontrouve";
            }

            break;
        case "prepare-edit" :
            $reference = getFieldFromForm("reference");
            $fiche = $ficheService->getDraftByReference($reference);
            if(!$fiche){
                $fiche = $ficheService->searchByReference($reference);
            }
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
                $mode = getFieldFromForm("mode");
            }else{
                $loggerService->log("$result : ".$result);
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
            $currentPage = getFieldFromForm("currentPage",1);
            $rows = getFieldFromForm("rows",20);
            $return = $ficheService->searchByKeyWord($keyword,$currentPage,$rows);
            $loggerService->log("search currentPage:$currentPage");
            $loggerService->log("search rows:$rows");
            $result = [];
            $totalCount = 0;
            if(isset($return["data"])){
                $result = $return["data"];
            }
            if(isset($return["totalCount"])){
                $totalCount = $return["totalCount"];
            }

            $page = "recherche";
            break;

        case "prepare-delete":
            $reference = getFieldFromForm("reference");
            $mode = getFieldFromForm("mode");
            $letter = getFieldFromForm("letter");
            $keyword = getFieldFromForm("keyword");
            $page = "delete";
            break;
        case "delete":
            $reference = getFieldFromForm("reference");
            $mode = getFieldFromForm("mode");
            $letter = getFieldFromForm("letter");
            $keyword = getFieldFromForm("keyword");

            $res = $ficheService->removeFicheByReference($reference);
            $page = "_redirect";

            $redirect = getApplicationUrl()."?action=index&letter=$letter";
            if(isset($mode) && $mode == "SEARCH") {
                $redirect = getApplicationUrl()."?action=search&keyword=$keyword";
            }

            break;

    }


}catch (Exception $e){
    $error_msg = "Une erreur est survenue";
    $loggerService->log($e);
}


if($page == "_redirect"){
    header("Location: $redirect");
}else{

    include "pages/common/header.php";
    include "pages/$page.php";
    include "pages/common/footer.php";

}
