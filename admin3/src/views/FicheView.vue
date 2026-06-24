<template>
  <div v-if="loading" class="loading"><div class="spinner"></div></div>
  <div v-else-if="error" class="alert alert-error">{{ error }}</div>
  <template v-else-if="fiche">
    <div class="card" style="margin-bottom:20px">
      <div class="card-body">
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
          <span class="badge badge-primary">#{{ fiche.reference }}</span>
          <span style="font-size:16px;font-weight:500;flex:1">{{ fiche.title || fiche.identity?.name?.[0]?.value || `Fiche ${fiche.reference}` }}</span>
          <a :href="`${API_BASE}/prosopography/${fiche.reference}?format=raw`" class="btn btn-ghost btn-sm" target="_blank">JSON</a>
          <template v-if="auth.isAuthenticated">
            <router-link :to="`/edit/${fiche.reference}`" class="btn btn-secondary btn-sm">Modifier</router-link>
            <button v-if="hasDraft" class="btn btn-secondary btn-sm" @click="showDraft = !showDraft">{{ showDraft ? 'Voir la fiche' : 'Voir le brouillon' }}</button>
            <router-link v-if="auth.isAdmin" :to="`/delete/${fiche.reference}`" class="btn btn-danger btn-sm">Supprimer</router-link>
          </template>
        </div>
      </div>
    </div>

    <div class="tabs">
      <button class="tab" :class="{ active: tab === 'fiche' }" @click="tab = 'fiche'">Fiche</button>
      <button class="tab" :class="{ active: tab === 'raw' }" @click="tab = 'raw'">Format brut</button>
    </div>

    <div v-if="tab === 'fiche'">
      <div class="grid-2" style="align-items:start">
        <div class="card">
          <div class="card-body">
            <FicheProperties :fiche="activeFiche" />
          </div>
        </div>
        <div>
          <div class="card" style="margin-bottom:16px">
            <div class="card-header">
              <span>Visualisation géographique</span>
            </div>
            <div class="card-body" style="padding:0">
              <MapView :manuscrits="allManuscrits" full />
            </div>
          </div>
          <div v-if="allManuscrits.length > 0" class="card">
            <div class="card-header">Manuscrits</div>
            <div class="card-body">
              <div v-for="(ms, i) in allManuscrits" :key="i" class="ms-item" style="margin:2px">{{ ms.label || ms.Ville + ', ' + ms.Bibliotheque + ', ' + ms.Cote }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="tab === 'raw'" class="card">
      <div class="card-body">
        <pre style="font-family:monospace;font-size:12px;line-height:1.6;white-space:pre-wrap;max-height:600px;overflow-y:auto;background:var(--gray-50);padding:16px;border-radius:8px">{{ rawText }}</pre>
      </div>
    </div>
  </template>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ficheService } from '../services/fiche'
import { manuscritService } from '../services/manuscrit'
import { useAuthStore } from '../stores/auth'
import { API_BASE } from '../config.js'
import FicheProperties from '../components/FicheProperties.vue'
import MapView from '../components/MapView.vue'

const route = useRoute()
const auth = useAuthStore()

const fiche = ref(null)
const draft = ref(null)
const showDraft = ref(false)
const loading = ref(true)
const error = ref('')
const tab = ref('fiche')

const hasDraft = computed(() => !!draft.value)
const activeFiche = computed(() => showDraft.value && draft.value ? draft.value : fiche.value)
const rawText = computed(() => {
  const f = activeFiche.value
  return f?.raw ? (Array.isArray(f.raw) ? f.raw.join('\n') : f.raw) : ''
})

const allManuscrits = ref([])
const globalOpusList = ref([])

function collectManuscrits(obj, results) {
  if (!obj || typeof obj !== 'object') return
  if (Array.isArray(obj)) {
    obj.forEach(item => collectManuscrits(item, results))
    return
  }
  if (obj.manuscrits) {
    const msArray = Array.isArray(obj.manuscrits) ? obj.manuscrits : [obj.manuscrits]
    msArray.forEach(ms => {
      const val = ms.value || ms
      if (val) results.push(val)
    })
  }
  if (obj.opus) {
    const opusArray = Array.isArray(obj.opus) ? obj.opus : [obj.opus]
    opusArray.forEach(opus => {
      if (opus.manuscrits) {
        const msArray = Array.isArray(opus.manuscrits) ? opus.manuscrits : [opus.manuscrits]
        msArray.forEach(ms => {
          const val = ms.value || ms
          if (val) results.push(val)
        })
      }
      if (opus.versions) {
        const versions = Array.isArray(opus.versions) ? opus.versions : [opus.versions]
        versions.forEach(v => {
          if (v.manuscrits) {
            const msArray = Array.isArray(v.manuscrits) ? v.manuscrits : [v.manuscrits]
            msArray.forEach(ms => {
              const val = ms.value || ms
              if (val) results.push(val)
            })
          }
        })
      }
    })
  }
  for (const val of Object.values(obj)) {
    collectManuscrits(val, results)
  }
}

async function loadManuscritCoords(msLabels) {
  const results = []
  for (const label of msLabels) {
    try {
      const ms = await manuscritService.findById(label)
      if (ms) {
        results.push({
          label,
          Ville: ms.Ville,
          Bibliotheque: ms.Bibliotheque,
          Cote: ms.Cote,
          lat: ms.lat,
          lng: ms.lng,
        })
      }
    } catch {}
  }
  return results
}

async function loadData(ref) {
  loading.value = true
  error.value = ''
  try {
    fiche.value = await ficheService.searchByReference(ref)
    if (auth.isAuthenticated) {
      try {
        draft.value = await ficheService.getDraftByReference(ref)
      } catch {}
    }
    const msLabels = []
    collectManuscrits(fiche.value, msLabels)
    if (draft.value) collectManuscrits(draft.value, msLabels)
    const uniqueLabels = [...new Set(msLabels)]
    allManuscrits.value = await loadManuscritCoords(uniqueLabels)
  } catch (e) {
    error.value = 'Fiche introuvable'
  } finally {
    loading.value = false
  }
}

watch(() => route.params.reference, (ref) => {
  if (ref) loadData(ref)
}, { immediate: true })

onMounted(() => {
  if (route.params.reference) loadData(route.params.reference)
})
</script>
