<template>
  <div>
    <div class="card" style="margin-bottom:20px">
      <div class="card-header">Critères de recherche</div>
      <div class="card-body">
        <div class="grid-2" style="margin-bottom:16px">
          <div class="form-group">
            <label>Nom</label>
            <input v-model="criteria.name" class="input" placeholder="Nom de l'individu" />
          </div>
          <div class="form-group">
            <label>Activité médiane</label>
            <div class="input-group">
              <input v-model.number="criteria.activityFrom" class="input" type="number" placeholder="De" />
              <input v-model.number="criteria.activityTo" class="input" type="number" placeholder="À" />
            </div>
          </div>
        </div>

        <div class="grid-3" style="margin-bottom:16px">
          <div class="form-group">
            <label>Statut</label>
            <div class="checkbox-group">
              <label v-for="s in statuses" :key="s" class="checkbox-label" :class="{ checked: criteria.status.includes(s) }">
                <input type="checkbox" :value="s" v-model="criteria.status" style="display:none" />
                {{ s }}
              </label>
            </div>
          </div>
          <div class="form-group">
            <label>Sexe</label>
            <div class="checkbox-group">
              <label v-for="s in genders" :key="s" class="checkbox-label" :class="{ checked: criteria.gender.includes(s) }">
                <input type="checkbox" :value="s" v-model="criteria.gender" style="display:none" />
                {{ s === 'M' ? 'Homme' : 'Femme' }}
              </label>
            </div>
          </div>
          <div class="form-group">
            <label>Grade</label>
            <select v-model="criteria.grade" class="select">
              <option value="">Tous</option>
              <option v-for="g in grades" :key="g" :value="g">{{ g }}</option>
            </select>
          </div>
        </div>

        <div class="form-group" style="margin-bottom:16px">
          <label>Discipline</label>
          <select v-model="criteria.discipline" class="select">
            <option value="">Toutes</option>
            <option v-for="d in disciplines" :key="d" :value="d">{{ t(d) }}</option>
          </select>
        </div>

        <div style="margin-bottom:12px">
          <label style="display:block;font-size:13px;font-weight:500;color:var(--gray-700);margin-bottom:8px">Critères prosopographiques avancés</label>
          <div v-for="(c, i) in criteria.custom" :key="i" class="advanced-criteria">
            <div class="criteria-row">
              <select v-model="c.section" class="select">
                <option value="">Section</option>
                <option v-for="s in sections" :key="s" :value="s">{{ t(s) }}</option>
              </select>
              <select v-model="c.subsection" class="select">
                <option value="">Sous-section</option>
                <option v-for="ss in subsections" :key="ss" :value="ss">{{ t(ss) }}</option>
              </select>
              <select v-model="c.operator" class="select">
                <option value="AND">AND</option>
                <option value="OR">OR</option>
                <option value="OR NOT">OR NOT</option>
                <option value="AND NOT">AND NOT</option>
              </select>
              <select v-model="c.matchType" class="select">
                <option value="CONTAINS">Contient</option>
                <option value="EQUALS">Égal à</option>
                <option value="STARTS">Commence par</option>
                <option value="END">Finit par</option>
              </select>
              <div class="input-group">
                <input v-model="c.value" class="input" placeholder="Valeur" />
                <button class="btn btn-ghost btn-sm" @click="criteria.custom.splice(i, 1)">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
          </div>
          <button class="btn btn-secondary btn-sm" @click="addCriteria">+ Ajouter un critère</button>
        </div>

        <div class="form-actions">
          <button class="btn btn-secondary" @click="showRequest = !showRequest">Voir la requête</button>
          <button class="btn btn-primary" @click="doAdvancedSearch">Rechercher</button>
        </div>
      </div>
    </div>

    <div v-if="showRequest" class="card" style="margin-bottom:20px">
      <div class="card-header">Requête JSON</div>
      <div class="card-body">
        <pre style="background:var(--gray-50);padding:12px;border-radius:8px;font-size:12px;overflow-x:auto">{{ JSON.stringify(buildRequest(), null, 2) }}</pre>
      </div>
    </div>

    <div v-if="loading" class="loading"><div class="spinner"></div></div>

    <template v-if="results.length > 0">
      <div class="result-count">{{ totalCount }} résultat(s)</div>
      <div class="card">
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Réf.</th>
                <th>Nom</th>
                <th>Statut</th>
                <th>Activité</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in results" :key="r.reference">
                <td><span class="badge badge-primary">{{ r.reference }}</span></td>
                <td><router-link :to="`/individus/${r.reference}`">{{ r.title || r.identity?.name?.[0]?.value }}</router-link></td>
                <td>{{ r.identity?.status?.[0]?.value || '—' }}</td>
                <td>{{ r.extras?.activityMediane || '—' }}</td>
                <td><router-link :to="`/individus/${r.reference}`" class="btn btn-ghost btn-sm">Voir</router-link></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ficheService } from '../services/fiche'
import { t } from '../services/messages'

const statuses = ['MA', 'GRAD', 'TUD', 'SUP', 'EXT', 'INC', 'NR']
const genders = ['M', 'F']
const grades = ['MAGIS', 'DOC', 'MAITRE', 'LIC', 'BAC', 'TUD', 'AUCUN']
const disciplines = ['ART', 'DECINE', 'DROIT', 'THEOLOGIE', 'DECRET', 'LOI']

const sections = ['identity', 'origin', 'curriculum', 'textualProduction', 'relationalInsertion', 'ecclesiasticalCareer', 'professionalCareer', 'politicalCareer']
const subsections = ['name', 'status', 'gender', 'birthPlace', 'diocese', 'grades', 'institution', 'title', 'manuscrits']

const criteria = reactive({
  name: '',
  activityFrom: null,
  activityTo: null,
  status: [],
  gender: [],
  grade: '',
  discipline: '',
  custom: [],
})

const results = ref([])
const totalCount = ref(0)
const loading = ref(false)
const showRequest = ref(false)

function addCriteria() {
  criteria.custom.push({ section: '', subsection: '', operator: 'AND', matchType: 'CONTAINS', value: '' })
}

function buildRequest() {
  const req = {}
  if (criteria.name) req.name = criteria.name
  if (criteria.activityFrom || criteria.activityTo) {
    req.activityMediane = {}
    if (criteria.activityFrom) req.activityMediane.from = criteria.activityFrom
    if (criteria.activityTo) req.activityMediane.to = criteria.activityTo
  }
  if (criteria.status.length) req.status = criteria.status
  if (criteria.gender.length) req.gender = criteria.gender
  if (criteria.grade) req.grade = criteria.grade
  if (criteria.discipline) req.discipline = criteria.discipline
  if (criteria.custom.length) {
    req.prosopography = criteria.custom.filter(c => c.section && c.value)
  }
  return req
}

async function doAdvancedSearch() {
  loading.value = true
  try {
    const req = buildRequest()
    const res = await ficheService.advancedSearch(req, 1, 200)
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
