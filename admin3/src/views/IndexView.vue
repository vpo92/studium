<template>
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <div class="result-count" v-if="fiches.length">{{ fiches.length }} résultat(s) pour la lettre {{ letter }}</div>
      <router-link v-if="auth.isAuthenticated" to="/edit" class="btn btn-primary">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nouvelle fiche
      </router-link>
    </div>

    <div class="card">
      <div class="card-body">
        <div class="letter-tabs">
          <button v-for="l in letters" :key="l" class="letter-tab" :class="{ active: letter === l }" @click="loadIndex(l)">{{ l }}</button>
        </div>

        <div v-if="loading" class="loading"><div class="spinner"></div></div>
        <div v-else-if="fiches.length === 0" class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <p>Aucune fiche pour cette lettre</p>
        </div>
        <div v-else>
          <div v-for="fiche in fiches" :key="fiche.reference" class="fiche-card">
            <span class="fiche-card-ref">{{ fiche.reference }}</span>
            <router-link :to="`/individus/${fiche.reference}`" class="fiche-card-name">
              {{ fiche.title || fiche.identity?.name?.[0]?.value || `Fiche ${fiche.reference}` }}
            </router-link>
            <div class="fiche-card-actions">
              <router-link :to="`/individus/${fiche.reference}`" class="btn btn-ghost btn-sm">Voir</router-link>
              <router-link v-if="auth.isAuthenticated" :to="`/edit/${fiche.reference}`" class="btn btn-ghost btn-sm">Éditer</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ficheService } from '../services/fiche'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const letter = ref('A')
const fiches = ref([])
const loading = ref(false)

async function loadIndex(l) {
  letter.value = l
  loading.value = true
  try {
    fiches.value = await ficheService.searchByIndex(l)
  } catch {
    fiches.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => loadIndex('A'))
</script>
