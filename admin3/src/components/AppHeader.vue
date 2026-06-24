<template>
  <header class="topbar">
    <div class="topbar-title">{{ pageTitle }}</div>
    <div class="topbar-actions">
      <slot />
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const titles = {
  home: 'Accueil',
  login: 'Connexion',
  index: 'Index alphabétique',
  fiche: 'Fiche prosopographique',
  search: 'Recherche',
  'advanced-search': 'Recherche avancée',
  'mongo-search': 'Requête MongoDB',
  edit: 'Édition d\'une fiche',
  delete: 'Suppression',
  drafts: 'Gestion des brouillons',
  users: 'Gestion des utilisateurs',
  dumps: 'Sauvegardes',
  supervision: 'Supervision',
  contact: 'Contact',
  help: 'Aide',
  'not-found': 'Page introuvable',
}

const pageTitle = computed(() => titles[route.name] || 'Studium Parisiense')
</script>
