<?php
/**
 * Created by PhpStorm.
 * User: vincent
 * Date: 2019-05-29
 * Time: 09:58
 */


class UserService
{

    public function authenticate($username,$password)
    {
        $data = array("email" => $username, "password" => $password);
        $res = postJSON("/auth/login", json_encode($data));
        $response = json_decode($res);
        if(isset($response->token)){
            return $response->token;
        }else{
            return false;
        }

        return $res;
    }

}