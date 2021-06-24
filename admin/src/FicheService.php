<?php
/**
 * Created by PhpStorm.
 * User: vincent
 * Date: 2019-05-29
 * Time: 09:58
 */


class FicheService
{

    public function searchByIndex($letter)
    {
        //$headers = array('Accept' => 'application/json');
        $response = callAPI('GET', "/prosopography/index/$letter");
        $res = json_decode($response["data"]);
        return isset($res->message)?[]:$res;
    }

    public function searchByReference($reference)
    {
        //$headers = array('Accept' => 'application/json');
        $response = callAPI('GET', "/prosopography/$reference");
        $res = json_decode($response["data"]);
        return isset($res->message)?[]:$res;
    }

    public function searchByKeyWord($keyword,$page,$rows){
        $url = "/prosopography/search/$keyword";
        if($page){
            $url.="?page=$page";
            if($rows){
                $url.="&rows=$rows";
            }else{
                $url.="&rows=20";
            }
        }

        $response = callAPI('GET', $url);
        $res = json_decode($response["data"]);
        if(isset($response["headers"]["X-Total-Count"])){
            $totalRows = $response["headers"]["X-Total-Count"][0];
        }
        return isset($res->message)?[]:(array("data"=>$res,"totalCount"=>$totalRows));
    }

    public function saveFicheFromText($reference,$prosopography)
    {
        $res = null;
        $data = array("prosopography" => $prosopography);
        if($reference){
            //update
            $data["reference"] = $reference;
            $res = postJSON("/prosopography/from-text", json_encode($data), getSessionToken());
        }else{
            $res = postJSON("/prosopography/create-from-text", json_encode($data), getSessionToken());
        }

        $response = json_decode($res);
        return $response;
    }

    public function removeFicheByReference($reference)
    {
        if($reference){
            $res = deleteAPI("/prosopography/".$reference, getSessionToken());
        }else{
            //FIXME error
        }
    }

    public function getFicheUrl($fiche){
        $viewLink =  getApplicationUrl().$fiche->link;
        return $viewLink;
    }

    public function getFicheTitle($fiche){
        return $fiche->title;
    }

}