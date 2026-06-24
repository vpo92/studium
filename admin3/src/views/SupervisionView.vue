<template>
  <div>
    <div class="card" style="margin-bottom:20px">
      <div class="card-body" style="display:flex;gap:8px;justify-content:flex-end">
        <button class="btn btn-secondary" @click="load">Actualiser</button>
        <button class="btn btn-danger" @click="clearLogs">Effacer les logs</button>
      </div>
    </div>

    <div v-if="loading" class="loading"><div class="spinner"></div></div>
    <div v-else-if="logs.length === 0" class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
      <p>Aucun log</p>
    </div>
    <template v-else>
      <div class="card">
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Niveau</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(l, i) in logs" :key="i">
                <td>{{ i + 1 }}</td>
                <td style="font-size:12px;color:var(--gray-500)">{{ l.timestamp ? new Date(l.timestamp).toLocaleString() : '—' }}</td>
                <td>
                  <span class="badge" :class="levelClass(l.level)">{{ l.level }}</span>
                </td>
                <td style="font-size:12px;font-family:monospace">{{ l.message }}</td>
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
import { adminService } from '../services/admin'

const logs = ref([])
const loading = ref(true)

function levelClass(level) {
  if (level === 'error') return 'badge-danger'
  if (level === 'warn') return 'badge-warning'
  return 'badge-primary'
}

async function load() {
  loading.value = true
  try {
    const res = await adminService.getLogs()
    logs.value = Array.isArray(res) ? res : []
  } catch {
    logs.value = []
  } finally {
    loading.value = false
  }
}

async function clearLogs() {
  try {
    await adminService.clearLogs()
    await load()
  } catch {}
}

onMounted(load)
</script>
