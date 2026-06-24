import { api } from './api'

export const draftService = {
  findAll(page = 1, rows = 50) {
    return api.get(`/draft?page=${page}&rows=${rows}`)
  },
  findByReference(ref) {
    return api.get(`/draft/${ref}`)
  },
  publish(ref) {
    return api.post(`/draft/publish/${ref}`)
  },
  remove(ref) {
    return api.delete(`/draft/${ref}`)
  },
}
