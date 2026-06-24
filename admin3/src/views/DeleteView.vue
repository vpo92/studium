<template>
  <div class="card" style="max-width:500px;margin:0 auto">
    <div class="card-body" style="text-align:center;padding:40px">
      <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="var(--danger)" stroke-width="1.5" style="margin-bottom:16px">
        <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
      </svg>
      <h2 style="font-size:18px;font-weight:500;margin-bottom:8px">Confirmer la suppression</h2>
      <p style="color:var(--gray-600);margin-bottom:24px">
        Êtes-vous sûr de vouloir supprimer la fiche <strong>#{{ reference }}</strong> ? Cette action est irréversible.
      </p>
      <div v-if="error" class="alert alert-error">{{ error }}</div>
      <div v-if="success" class="alert alert-success">{{ success }}</div>
      <div class="form-actions" style="justify-content:center">
        <router-link to="/" class="btn btn-secondary">Annuler</router-link>
        <button class="btn btn-danger" @click="confirmDelete" :disabled="deleting">
          <span v-if="deleting" class="spinner" style="width:16px;height:16px;border-width:2px;border-top-color:#fff"></span>
          <span v-else>Supprimer définitivement</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ficheService } from '../services/fiche'

const route = useRoute()
const router = useRouter()
const reference = route.params.reference

const error = ref('')
const success = ref('')
const deleting = ref(false)

async function confirmDelete() {
  error.value = ''
  success.value = ''
  deleting.value = true
  try {
    await ficheService.removeFicheByReference(reference.value)
    success.value = 'Fiche supprimée avec succès'
    setTimeout(() => router.push('/'), 1500)
  } catch {
    error.value = 'Erreur lors de la suppression'
  } finally {
    deleting.value = false
  }
}
</script>
