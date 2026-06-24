<template>
  <div>
    <div v-if="loading" class="loading"><div class="spinner"></div></div>
    <div v-else-if="drafts.length === 0" class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
      <p>Aucun brouillon</p>
    </div>
    <template v-else>
      <div class="result-count">{{ drafts.length }} brouillon(s)</div>
      <div class="card">
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Référence</th>
                <th>Titre</th>
                <th>Créé le</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="d in drafts" :key="d.reference">
                <td><span class="badge badge-warning">{{ d.reference }}</span></td>
                <td>{{ d.title || d.identity?.name?.[0]?.value || `Brouillon #${d.reference}` }}</td>
                <td style="font-size:12px;color:var(--gray-500)">{{ d.createdAt ? new Date(d.createdAt).toLocaleDateString() : '—' }}</td>
                <td>
                  <div style="display:flex;gap:4px">
                    <router-link :to="`/individus/${d.reference}`" class="btn btn-ghost btn-sm">Voir</router-link>
                    <button class="btn btn-primary btn-sm" @click="publish(d.reference)">Publier</button>
                    <button class="btn btn-danger btn-sm" @click="remove(d.reference)">Supprimer</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { draftService } from '../services/draft'

const drafts = ref([])
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    const res = await draftService.findAll(1, 200)
    drafts.value = Array.isArray(res) ? res : (res.data || [])
  } catch {
    drafts.value = []
  } finally {
    loading.value = false
  }
}

async function publish(ref) {
  try {
    await draftService.publish(ref)
    await load()
  } catch {}
}

async function remove(ref) {
  try {
    await draftService.remove(ref)
    await load()
  } catch {}
}

onMounted(load)
</script>
