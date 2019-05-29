<div class="card" style="width: 80%;margin: auto">
    <div class="card-body">
        <h5 class="card-title">Connexion</h5>
        <form method="post" action="index.php">
            <input type="hidden" name="action" value="login">
            <div class="form-group">
                <label class="bmd-label-floating">Pseudo : </label>
                <input type="text" name="pseudo" class="form-control">
            </div>
            <div class="form-group">

                <label class="bmd-label-floating">Password : </label>
                <input type="password" name="password" class="form-control">
            </div>
            <div class="form-group">
                <a href="index.php" class="btn btn-danger">Annuler</a>
                <input type="submit" value="Valider" class="btn btn-primary">
            </div>
        </form>
    </div>
</div>