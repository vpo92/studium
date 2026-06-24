<template>
  <div>
    <div class="card" style="margin-bottom:24px">
      <div class="card-body" style="text-align:center;padding:48px 32px">
        <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="var(--primary)" stroke-width="1.5" style="margin-bottom:16px">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
        <h1 style="font-size:28px;font-weight:400;margin-bottom:8px">Studium Parisiense</h1>
        <p style="color:var(--gray-600);max-width:500px;margin:0 auto 24px;line-height:1.7">
          Base de données prosopographique dédiée aux membres des écoles et de l'Université de Paris entre le XII<sup>e</sup> et le XVI<sup>e</sup> siècle.
        </p>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
          <router-link to="/index" class="btn btn-primary">Parcourir l'index</router-link>
          <router-link to="/search" class="btn btn-secondary">Rechercher</router-link>
          <router-link to="/search/advanced" class="btn btn-secondary">Recherche avancée</router-link>
        </div>
      </div>
    </div>

    <div class="grid-3">
      <div class="card">
        <div class="card-body" style="text-align:center">
          <div style="font-size:36px;font-weight:300;color:var(--primary)">~15 000</div>
          <div style="font-size:13px;color:var(--gray-600);margin-top:4px">Fiches prosopographiques</div>
        </div>
      </div>
      <div class="card">
        <div class="card-body" style="text-align:center">
          <div style="font-size:36px;font-weight:300;color:var(--primary)">XII<sup>e</sup>–XVI<sup>e</sup></div>
          <div style="font-size:13px;color:var(--gray-600);margin-top:4px">Siècles couverts</div>
        </div>
      </div>
      <div class="card">
        <div class="card-body" style="text-align:center">
          <div style="font-size:36px;font-weight:300;color:var(--primary)">ERC</div>
          <div style="font-size:13px;color:var(--gray-600);margin-top:4px">Programme européen</div>
        </div>
      </div>
    </div>

    <div class="card" style="margin-top:24px">
      <div class="card-body" style="padding:24px">
        <p style="color:var(--gray-600);font-size:13px;margin-bottom:16px">
          <strong>Studium Parisiense</strong> fait partie du programme de recherche européen <em>Signs and States</em> dirigé par Jean-Philippe Genet (ERC). L'application contient des données sur les professeurs, étudiants et membres de l'Université de Paris.
        </p>
        <div style="display:flex;gap:24px;align-items:center;flex-wrap:wrap;opacity:0.7">
          <span style="font-size:12px;color:var(--gray-500)">Partenaires :</span>
          <span style="font-weight:500;color:var(--gray-600)">Université Paris 1</span>
          <span style="font-weight:500;color:var(--gray-600)">Lamop</span>
          <span style="font-weight:500;color:var(--gray-600)">CNRS</span>
          <span style="font-weight:500;color:var(--gray-600)">ERC</span>
          <span style="font-weight:500;color:var(--gray-600)">Hastec</span>
        </div>
      </div>
    </div>
  </div>
</template>
