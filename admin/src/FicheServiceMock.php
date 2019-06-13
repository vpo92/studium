<?php
/**
 * Created by PhpStorm.
 * User: vincent
 * Date: 2019-05-29
 * Time: 09:58
 */


class FicheServiceMock
{

    public function searchByIndex($letter)
    {
        //$headers = array('Accept' => 'application/json');
        $response = file_get_contents("./mock/indexa");
        return json_decode($response);
    }

    public function searchByReference($reference)
    {
        //$headers = array('Accept' => 'application/json');
      $response = file_get_contents("./mock/reference");
      return json_decode($response);
    }

    public function searchByKeyWord($keyword){
        $response = file_get_contents("./mock/search");
        $res = json_decode($response);
        return isset($res->message)?[]:$res;
    }

    public function saveFicheFromText($reference,$prosopography)
    {
        return $prosopography;
    }

    public function getFicheUrl($fiche){
        $viewLink =  getApplicationUrl().$fiche->link;
        return $viewLink;
    }

    public function getFicheTitle($fiche){
        return $fiche->title;
    }

}
