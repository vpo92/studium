<?php

function getAPIUrl(){
    return getenv("API_URL")!=""?getenv("API_URL"):"http://localhost:3000";
}

function getPublicAPIUrl(){
    return getenv("PUBLIC_API_URL")!=""?getenv("PUBLIC_API_URL"):getAPIUrl();
}

function getApplicationUrl(){
  return getenv("APPLICATION_URL")!=""?getenv("APPLICATION_URL"):"http://localhost/admin";
}

function getResourcesWebDirectory(){
    return getApplicationUrl()."/resources";
}

function getApplicationVersion(){
    $response = file_get_contents("./package.json");
    $conf = json_decode($response);
    return $conf->version;
}

function getFeatures(){
    $response = file_get_contents("./features.json");
    $features = json_decode($response);
    return $features;
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

function isAdmin(){
    if(isAuthenticated() && isset($_SESSION["role"])){
        foreach ($_SESSION["role"] as $i => $role){
            if($role == "admin"){
                return true;
            }
        }
    }
    return false;
}

function getSessionUserName(){
    return isset($_SESSION["username"])?$_SESSION["username"]:"";
}

function getSessionToken(){
    return isset($_SESSION["token"])?$_SESSION["token"]:"";
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
    //deal with headers
    $headers = [];

    curl_setopt($curl, CURLOPT_HEADERFUNCTION, function ($ch, $header) use (&$headers) {
        $matches = array();

        if ( preg_match('/^([^:]+)\s*:\s*([^\x0D\x0A]*)\x0D?\x0A?$/', $header, $matches) )
        {
            $headers[$matches[1]][] = $matches[2];
        }

        return strlen($header);
    });


    $result = curl_exec($curl);
    curl_close($curl);

    return array("data"=>$result, "headers"=>$headers);
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

function deleteAPI($url,$token = false){
    $url = getAPIUrl()."".$url;

    $curl = curl_init($url);
    curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "DELETE");
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

    $headers = array();
    if($token){
        $headers[] = "Authorization: bearer $token";
    }

    curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);

    $result = curl_exec($curl);

    curl_close($curl);

    return $result;
}
