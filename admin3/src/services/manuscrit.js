import { api } from './api'

export const manuscritService = {
  findById(num) {
    return api.get(`/manuscrit/${encodeURIComponent(num)}`)
  },
}
