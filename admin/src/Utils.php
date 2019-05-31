<?php

function getAPIUrl(){
    return isset($_ENV["API_URL"] )?$_ENV["API_URL"]:"http://localhost:3000";
}
function getApplicationUrl(){
    return isset($_ENV["APPLICATION_URL"] )?$_ENV["APPLICATION_URL"]:"/admin";
}

function getResourcesWebDirectory(){
    return getApplicationUrl()."/resources";
}


function getFieldFromForm($name, $default = null){
    return isset($_POST[$name])?$_POST[$name]:(isset($_GET[$name])?$_GET[$name]:$default);
}

function getArrayFieldFromForm($name, $default = null){
    return isset($_POST[$name])?$_POST[$name]:(isset($_GET[$name."[]"])?$_GET[$name."[]"]:$default);
}

function isAuthenticated(){
    return isset($_SESSION["connected"]) && $_SESSION["connected"];
}

function getSessionUserName(){
    return $_SESSION["username"];
}

function getSessionToken(){
    return $_SESSION["token"];
}

function formatErrorMsgReqired($error){
    $error_msg = "Les champs suivants sont obligatoires :";
    foreach ($error as $f){
        $error_msg.=" $f,";
    }
    return $error_msg;
}

function getPropertieValue($prop){
    if(isset($prop)){
        if(is_object($prop)){
            return $prop->value;
        }else{
            return ($prop[0]->value)."...";
        }
    }else{
        return "";
    }
}

function callAPI($method, $url, $headers = false, $data = false)
{
    $curl = curl_init();
    $url = getAPIUrl()."".$url;

    switch ($method) {
        case "POST":
            curl_setopt($curl, CURLOPT_POST, 1);

            if ($data)
                curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
            break;
        case "PUT":
            curl_setopt($curl, CURLOPT_PUT, 1);
            break;
        default:
            if ($data)
                $url = sprintf("%s?%s", $url, http_build_query($data));
    }

    // Optional Authentication:
    //curl_setopt($curl, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
    //curl_setopt($curl, CURLOPT_USERPWD, "username:password");

    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);

    $result = curl_exec($curl);

    curl_close($curl);

    return $result;
}

/**
 * @param $url
 * @param $jsonString string object
 * @param $token
 */
function postJSON($url,$jsonString,$token = false){
    $url = getAPIUrl()."".$url;

    $curl = curl_init($url);
    curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "POST");
    curl_setopt($curl, CURLOPT_POSTFIELDS, $jsonString);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

    $headers = array(
        'Content-Type: application/json',
        'Content-Length: ' . strlen($jsonString));
    if($token){
        $headers[] = "Authorization: bearer $token";
    }

    curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);

    $result = curl_exec($curl);

    curl_close($curl);

    return $result;
}