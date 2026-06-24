import { api } from './api'

export const mongoService = {
  executeQuery(collection, find, projection, skip = 0, limit = 50) {
    return api.post('/mongo/executeQuery', { collection, find, projection, skip, limit })
  },
}
