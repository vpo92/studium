import { api } from './api'

export const userService = {
  findAll() {
    return api.get('/user')
  },
  create(data) {
    return api.post('/user', data)
  },
  initPwd(userId, newPwd) {
    return api.post(`/user/init-pwd/${userId}`, { newPwd })
  },
  remove(userId) {
    return api.delete(`/user/${userId}`)
  },
}
