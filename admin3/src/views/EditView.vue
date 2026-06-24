<template>
  <div>
    <div class="card" style="margin-bottom:20px">
      <div class="card-header">
        <span>{{ reference ? `Édition de la fiche #${reference}` : 'Création d\'une nouvelle fiche' }}</span>
        <div v-if="reference" class="badge badge-primary">Mode édition</div>
        <div v-else class="badge badge-success">Mode création</div>
      </div>
      <div class="card-body">
        <div v-if="error" class="alert alert-error">{{ error }}</div>
        <div v-if="success" class="alert alert-success">{{ success }}</div>

        <div class="form-group">
          <label>Texte brut de la fiche</label>
          <p v-if="!reference" style="font-size:12px;color:var(--gray-500);margin-bottom:8px">
            La balise <code>&lt;1a&gt;</code> et la référence seront générées automatiquement.
          </p>
          <textarea v-model="rawText" class="textarea" rows="20" placeholder="Saisissez le texte de la fiche au format JPG…"></textarea>
        </div>

        <div class="form-actions">
          <router-link :to="reference ? `/individus/${reference}` : '/'" class="btn btn-secondary">Annuler</router-link>
          <button class="btn btn-primary" @click="save" :disabled="!rawText.trim() || saving">
            <span v-if="saving" class="spinner" style="width:16px;height:16px;border-width:2px"></span>
            <span v-else>{{ reference ? 'Enregistrer le brouillon' : 'Créer la fiche' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ficheService } from '../services/fiche'

const route = useRoute()
const router = useRouter()

const reference = ref(route.params.reference || null)
const rawText = ref('')
const error = ref('')
const success = ref('')
const saving = ref(false)

async function loadExisting() {
  if (!reference.value) return
  try {
    const fiche = await ficheService.searchByReference(reference.value)
    if (fiche?.raw) {
      rawText.value = Array.isArray(fiche.raw) ? fiche.raw.join('\n') : fiche.raw
    }
  } catch {
    error.value = 'Impossible de charger la fiche'
  }
}

async function save() {
  error.value = ''
  success.value = ''
  saving.value = true
  try {
    if (reference.value) {
      await ficheService.saveFicheFromText(reference.value, rawText.value)
      success.value = 'Brouillon enregistré avec succès'
      setTimeout(() => router.push(`/individus/${reference.value}`), 1000)
    } else {
      await ficheService.createFicheFromText(rawText.value)
      success.value = 'Fiche créée avec succès'
      setTimeout(() => router.push('/drafts'), 1000)
    }
  } catch (e) {
    error.value = e.data?.error || 'Erreur lors de l\'enregistrement'
  } finally {
    saving.value = false
  }
}

onMounted(loadExisting)
</script>
