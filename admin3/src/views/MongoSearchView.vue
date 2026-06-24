<template>
  <div>
    <div class="card" style="margin-bottom:20px">
      <div class="card-header">Requête MongoDB</div>
      <div class="card-body">
        <div class="form-group">
          <label>Collection</label>
          <select v-model="collection" class="select">
            <option value="prosopography">prosopography</option>
            <option value="draft">draft</option>
            <option value="users">users</option>
            <option value="manus">manus</option>
            <option value="logs">logs</option>
          </select>
        </div>
        <div class="form-group">
          <label>Requête <code>find</code> (JSON)</label>
          <textarea v-model="findQuery" class="textarea" rows="3" placeholder='{ "identity.name.value": "Gerson" }'></textarea>
        </div>
        <div class="form-group">
          <label>Projection (JSON, optionnel)</label>
          <textarea v-model="projection" class="textarea" rows="2" placeholder='{ "identity": 1, "reference": 1 }'></textarea>
        </div>
        <div class="form-actions">
          <button class="btn btn-primary" @click="execute">Exécuter</button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading"><div class="spinner"></div></div>

    <template v-if="results.length > 0">
      <div class="result-count">{{ results.length }} résultat(s)</div>
      <div class="card">
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Référence</th>
                <th>Contenu (preview)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, i) in results" :key="i">
                <td>{{ i + 1 }}</td>
                <td>{{ r.reference || r._id || '—' }}</td>
                <td style="font-size:12px;color:var(--gray-600);max-width:400px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ JSON.stringify(r).slice(0, 200) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <div v-else-if="executed && !loading" class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <p>Aucun résultat</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { mongoService } from '../services/mongo'

const collection = ref('prosopography')
const findQuery = ref('{}')
const projection = ref('{}')
const results = ref([])
const loading = ref(false)
const executed = ref(false)

async function execute() {
  loading.value = true
  executed.value = true
  try {
    const find = JSON.parse(findQuery.value || '{}')
    const proj = JSON.parse(projection.value || '{}')
    results.value = await mongoService.executeQuery(collection.value, find, proj)
  } catch {
    results.value = []
  } finally {
    loading.value = false
  }
}
</script>
