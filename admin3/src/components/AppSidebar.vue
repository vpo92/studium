<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <router-link to="/" class="sidebar-logo">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
        Studium
      </router-link>
      <div class="sidebar-subtitle">Parisiense — Administration</div>
    </div>

    <nav class="sidebar-nav">
      <div class="nav-section">Général</div>
      <router-link to="/" class="nav-item" active-class="active" exact>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        Accueil
      </router-link>

      <template v-if="auth.isAuthenticated">
        <router-link to="/edit" class="nav-item" active-class="active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Créer une fiche
        </router-link>
      </template>

      <template v-if="features.features.indexSearch">
        <div class="nav-section">Recherche</div>
        <router-link to="/index" class="nav-item" active-class="active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="14" y2="18"/></svg>
          Index A–Z
        </router-link>
      </template>

      <template v-if="features.features.textSearch">
        <router-link to="/search" class="nav-item" active-class="active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          Recherche
        </router-link>
      </template>

      <template v-if="features.features.advancedSearch">
        <router-link to="/search/advanced" class="nav-item" active-class="active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
          Recherche avancée
        </router-link>
      </template>

      <template v-if="auth.isAdmin && features.features.mongoSearch">
        <router-link to="/search/mongo" class="nav-item" active-class="active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
          MongoDB
        </router-link>
      </template>

      <template v-if="auth.isAdmin">
        <div class="nav-section">Administration</div>
        <router-link to="/users" class="nav-item" active-class="active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Utilisateurs
        </router-link>
        <router-link to="/drafts" class="nav-item" active-class="active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          Brouillons
        </router-link>
        <router-link to="/supervision" class="nav-item" active-class="active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
          Supervision
        </router-link>
        <template v-if="features.features.mongoDump">
          <router-link to="/dumps" class="nav-item" active-class="active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 10.95 12 15.05 20.73 10.95"/></svg>
            Sauvegardes
          </router-link>
        </template>
      </template>

      <div class="nav-section">Informations</div>
      <router-link to="/contact" class="nav-item" active-class="active">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
        Contact
      </router-link>
      <router-link to="/help" class="nav-item" active-class="active">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        Aide
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <template v-if="auth.isAuthenticated">
        <div style="font-size:12px;color:var(--gray-500);margin-bottom:4px">{{ auth.user?.name || auth.user?.email }}</div>
        <button class="btn btn-ghost btn-sm" style="color:rgba(255,255,255,0.6)" @click="auth.logout()">
          Déconnexion
        </button>
      </template>
      <template v-else>
        <router-link to="/login" class="btn btn-primary btn-sm" style="display:flex;justify-content:center">
          Connexion
        </router-link>
      </template>
    </div>
  </aside>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'
import { useFeaturesStore } from '../stores/features'

const auth = useAuthStore()
const features = useFeaturesStore()
</script>
