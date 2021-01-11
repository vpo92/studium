<?php
/**
 * Created by PhpStorm.
 * User: vincent
 * Date: 2019-05-29
 * Time: 09:58
 */


class ManuscritService
{

    public function findById($id)
    {
        $response = callAPI('GET', "/manuscrit/$id");
        return json_decode($response);
    }

}