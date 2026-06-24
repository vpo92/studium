import { api } from './api'
import { API_BASE } from '../config.js'

export const adminService = {
  getLogs() {
    return api.get('/admin/logs')
  },
  clearLogs() {
    return api.post('/admin/logs/clear', {})
  },
  listDumps() {
    return api.get('/admin/dump')
  },
  createDump() {
    return api.post('/admin/dump', {})
  },
  getDumpUrl(name) {
    return `${API_BASE}/admin/dump/${name}`
  },
}
