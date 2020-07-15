<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">

    <title>Studium</title>
    <!-- Bootstrap CSS CDN -->
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
    <!-- Our Custom CSS -->
    <link rel="stylesheet" href="<?php echo getResourcesWebDirectory()?>/css/style.css">

    <!-- Scrollbar Custom CSS -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/malihu-custom-scrollbar-plugin/3.1.5/jquery.mCustomScrollbar.min.css">

    <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/v/dt/dt-1.10.21/datatables.min.css"/>
<!--    <link rel="stylesheet" href="https://cdn.datatables.net/1.10.19/css/jquery.dataTables.min.css">-->

    <!-- Font Awesome JS -->
    <script defer src="https://use.fontawesome.com/releases/v5.0.13/js/solid.js" integrity="sha384-tzzSw1/Vo+0N5UhStP3bvwWPq+uvzCMfrN1fEFe+xBmv1C/AtVX5K0uZtmcHitFZ" crossorigin="anonymous"></script>
    <script defer src="https://use.fontawesome.com/releases/v5.0.13/js/fontawesome.js" integrity="sha384-6OIrr52G08NpOFSZdxxz1xdNSndlD4vdcf/q2myIUVO0VsqaGHJsB0RaBE01VTOY" crossorigin="anonymous"></script>
</head>

<body>

<div class="wrapper">
    <!-- Sidebar -->
    <nav id="sidebar">

        <div id="dismiss">
            <i class="fas fa-arrow-left"></i>
        </div>

        <div class="sidebar-header">
            <h3>Studium</h3>
        </div>

        <ul class="list-unstyled components">
            <img src="<?php echo getResourcesWebDirectory()?>/img/logo_par.png" alt="Paris 1" height="180px" class="img-fluid">
            <li class="active">
                <a href="<?php echo getApplicationUrl()?>/home">Accueil</a>
            </li>
            <li>
                <a href="<?php echo getApplicationUrl()?>?action=index">Index</a>
            </li>
            <li>
                <a href="<?php echo getApplicationUrl()?>?page=recherche">Recherche</a>
            </li>
            <li>
                <a href="<?php echo getApplicationUrl()?>/contact">Contact</a>
            </li>
            <li>
                <a href="<?php echo getApplicationUrl()?>/aide">Aide</a>
            </li>
            <!--
            <li>
                <a href="#pageSubmenu" data-toggle="collapse" aria-expanded="false">Admin</a>
                <ul class="collapse list-unstyled" id="pageSubmenu">
                    <li>
                        <a href="#">Page 1</a>
                    </li>
                    <li>
                        <a href="#">Page 2</a>
                    </li>
                    <li>
                        <a href="#">Page 3</a>
                    </li>
                </ul>
            </li>
            -->
        </ul>
    </nav>

    <!-- Page Content -->
    <div id="content">
        <nav class="navbar navbar-expand-lg">
            <button type="button" id="sidebarCollapse" class="btn btn-primary">
                <i class="fas fa-align-left"></i>
            </button>
            <span class="mr-auto">
                <a class="navbar-brand" href="#">&nbsp;&nbsp;Studium</a>
            </span>
            <span class="navbar-text">
                <?php if(isAuthenticated()){
                    echo getSessionUserName();?>
                    <a href="<?php echo getApplicationUrl()?>?action=logout"> - Se déconnecter</a>
                <?php }else{ ?>
                    <a href="<?php echo getApplicationUrl()?>?action=prepare-login">Se connecter</a>
                <?php } ?>
            </span>
        </nav>

        <div class="app-page">
        <?php
        if(isset($error_msg)){?>
        <div class="alert alert-danger" role="alert">
            <strong>Erreur : </strong><?php echo $error_msg?>
        </div>
        <?php
        }else if(isset($info_msg)){?>
        <div class="alert alert-info" role="alert">
            <strong>Info : </strong><?php echo $info_msg?>
        </div>
        <?php
        }
        ?>
