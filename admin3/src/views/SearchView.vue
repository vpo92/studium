<template>
  <div>
    <div class="card" style="margin-bottom:20px">
      <div class="card-body">
        <form @submit.prevent="doSearch" class="input-group">
          <input v-model="keyword" class="input" placeholder="Rechercher par mot-clé…" />
          <button type="submit" class="btn btn-primary" :disabled="!keyword.trim()">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            Chercher
          </button>
        </form>
      </div>
    </div>

    <div v-if="loading" class="loading"><div class="spinner"></div></div>

    <template v-if="results.length > 0">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div class="result-count">{{ totalCount }} résultat(s) pour « {{ keyword }} »</div>
        <div class="row-per-page">
          <span>Lignes :</span>
          <select v-model.number="rows" @change="doSearch" class="select" style="width:auto">
            <option :value="5">5</option>
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
        </div>
      </div>

      <div class="card">
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Réf.</th>
                <th>Nom</th>
                <th>Statut</th>
                <th>Description</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in results" :key="r.reference">
                <td><span class="badge badge-primary">{{ r.reference }}</span></td>
                <td><router-link :to="`/individus/${r.reference}`">{{ r.title || r.identity?.name?.[0]?.value || r.reference }}</router-link></td>
                <td>{{ r.identity?.status?.[0]?.value || '—' }}</td>
                <td style="color:var(--gray-600);font-size:12px">{{ r.extras?.shortDescription || '—' }}</td>
                <td>
                  <router-link :to="`/individus/${r.reference}`" class="btn btn-ghost btn-sm">Voir</router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="pagination">
        <button :disabled="page <= 1" @click="page = page - 1; doSearch()">←</button>
        <button v-for="p in pageRange" :key="p" :class="{ active: p === page }" @click="page = p; doSearch()">{{ p }}</button>
        <button :disabled="page >= totalPages" @click="page = page + 1; doSearch()">→</button>
      </div>
    </template>

    <div v-else-if="searched && !loading" class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <p>Aucun résultat pour « {{ keyword }} »</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ficheService } from '../services/fiche'

const keyword = ref('')
const results = ref([])
const totalCount = ref(0)
const page = ref(1)
const rows = ref(20)
const loading = ref(false)
const searched = ref(false)

const totalPages = computed(() => Math.ceil(totalCount.value / Math.max(rows.value, 1)) || 1)
const pageRange = computed(() => {
  const max = Math.min(totalPages.value, 10)
  const start = Math.max(1, page.value - 5)
  const end = Math.min(totalPages.value, start + 9)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

async function doSearch() {
  if (!keyword.value.trim()) return
  loading.value = true
  searched.value = true
  try {
    const res = await ficheService.searchByKeyword(keyword.value, page.value, rows.value)
    if (Array.isArray(res)) {
      results.value = res
      totalCount.value = res.length
    } else if (res.data) {
      results.value = res.data
      totalCount.value = res.totalCount || res.data.length
    }
  } catch {
    results.value = []
    totalCount.value = 0
  } finally {
    loading.value = false
  }
}
</script>
