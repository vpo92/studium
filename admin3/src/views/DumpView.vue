<template>
  <div>
    <div class="card" style="margin-bottom:20px">
      <div class="card-body" style="display:flex;gap:8px;justify-content:flex-end">
        <button class="btn btn-secondary" @click="load">Actualiser</button>
        <button class="btn btn-primary" @click="createDump" :disabled="creating">
          <span v-if="creating" class="spinner" style="width:16px;height:16px;border-width:2px"></span>
          <span v-else>Créer une sauvegarde</span>
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading"><div class="spinner"></div></div>
    <div v-else-if="dumps.length === 0" class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 10.95 12 15.05 20.73 10.95"/></svg>
      <p>Aucune sauvegarde</p>
    </div>
    <template v-else>
      <div class="card">
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Fichier</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="d in dumps" :key="d">
                <td>{{ d }}</td>
                <td>
                  <a :href="`${API_BASE}/admin/dump/${d}`" class="btn btn-primary btn-sm" download>Télécharger</a>
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
import { API_BASE } from '../config.js'
import { adminService } from '../services/admin'

const dumps = ref([])
const loading = ref(true)
const creating = ref(false)

async function load() {
  loading.value = true
  try {
    const res = await adminService.listDumps()
    dumps.value = Array.isArray(res) ? res : []
  } catch {
    dumps.value = []
  } finally {
    loading.value = false
  }
}

async function createDump() {
  creating.value = true
  try {
    await adminService.createDump()
    await load()
  } catch {}
  finally {
    creating.value = false
  }
}

onMounted(load)
</script>
