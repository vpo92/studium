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
        return json_decode($response);
    }

    public function searchByReference($reference)
    {
        //$headers = array('Accept' => 'application/json');
        $response = callAPI('GET', "/prosopography/$reference");
        return json_decode($response);
    }

    public function searchByKeyWord($keyword){
        $response = callAPI('GET', "/prosopography/search/$keyword");
        $res = json_decode($response);
        return isset($res->message)?[]:$res;
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