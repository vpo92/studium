import { api } from './api'

export const authService = {
  login(email, password) {
    return api.post('/auth/login', { email, password })
  },
  getProfile() {
    return api.get('/user/me')
  },
}
