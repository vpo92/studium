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

    public function saveFicheFromText($reference,$prosopography)
    {
        $data = array("prosopography" => $prosopography);
        if($reference){
            //update
            $data["reference"] = $reference;
        }

        $res = postJSON("/prosopography/from-text", json_encode($data), getSessionToken());
        $response = json_decode($res);
        return $response;
    }


}