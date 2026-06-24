import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '../services/auth'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token'))
  const user = ref(null)

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  async function login(email, password) {
    const res = await authService.login(email, password)
    token.value = res.token
    localStorage.setItem('token', res.token)
    try {
      user.value = await authService.getProfile()
    } catch {
      const payload = JSON.parse(atob(res.token.split('.')[1]))
      user.value = { email: payload.email, role: payload.role }
    }
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }

  async function loadProfile() {
    if (!token.value) return
    try {
      user.value = await authService.getProfile()
    } catch {
      const payload = JSON.parse(atob(token.value.split('.')[1]))
      user.value = { email: payload.email, role: payload.role }
    }
  }

  return { token, user, isAuthenticated, isAdmin, login, logout, loadProfile }
})
