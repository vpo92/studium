<template>
  <div>
    <div class="card" style="margin-bottom:20px">
      <div class="card-header">
        <span>Nouvel utilisateur</span>
      </div>
      <div class="card-body">
        <div v-if="formError" class="alert alert-error">{{ formError }}</div>
        <div v-if="formSuccess" class="alert alert-success">{{ formSuccess }}</div>
        <form @submit.prevent="createUser" class="grid-3">
          <div class="form-group">
            <label>Nom</label>
            <input v-model="form.name" class="input" required />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input v-model="form.email" type="email" class="input" required />
          </div>
          <div class="form-group">
            <label>Mot de passe</label>
            <input v-model="form.password" type="password" class="input" required />
          </div>
          <div class="form-group">
            <label>Rôle</label>
            <select v-model="form.role" class="select">
              <option value="user">Utilisateur</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>
          <div class="form-actions" style="align-self:end">
            <button type="submit" class="btn btn-primary">Créer</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="loading" class="loading"><div class="spinner"></div></div>
    <template v-else>
      <div class="result-count">{{ users.length }} utilisateur(s)</div>
      <div class="card">
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in users" :key="u._id || u.email">
                <td>{{ u.name }}</td>
                <td>{{ u.email }}</td>
                <td><span class="badge" :class="u.role === 'admin' ? 'badge-primary' : 'badge-success'">{{ u.role }}</span></td>
                <td>
                  <div style="display:flex;gap:4px">
                    <button class="btn btn-secondary btn-sm" @click="resetPwd(u)">Réinit. mot de passe</button>
                    <button class="btn btn-danger btn-sm" @click="removeUser(u)">Supprimer</button>
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
import { ref, reactive, onMounted } from 'vue'
import { userService } from '../services/user'

const users = ref([])
const loading = ref(true)
const formError = ref('')
const formSuccess = ref('')
const form = reactive({ name: '', email: '', password: '', role: 'user' })

async function load() {
  loading.value = true
  try {
    users.value = await userService.findAll()
  } catch {
    users.value = []
  } finally {
    loading.value = false
  }
}

async function createUser() {
  formError.value = ''
  formSuccess.value = ''
  try {
    await userService.create({ ...form })
    formSuccess.value = 'Utilisateur créé'
    form.name = ''; form.email = ''; form.password = ''; form.role = 'user'
    await load()
  } catch {
    formError.value = 'Erreur lors de la création'
  }
}

async function resetPwd(u) {
  const pwd = prompt('Nouveau mot de passe pour ' + u.email)
  if (!pwd) return
  try {
    await userService.initPwd(u._id, pwd)
    alert('Mot de passe réinitialisé')
  } catch {
    alert('Erreur')
  }
}

async function removeUser(u) {
  if (!confirm(`Supprimer ${u.email} ?`)) return
  try {
    await userService.remove(u._id)
    await load()
  } catch {
    alert('Erreur')
  }
}

onMounted(load)
</script>
