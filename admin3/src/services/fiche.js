import { api } from './api'

export const ficheService = {
  searchByIndex(letter) {
    return api.get(`/prosopography/index/${letter}`)
  },
  searchByReference(reference) {
    return api.get(`/prosopography/${reference}`)
  },
  searchByKeyword(keyword, page = 1, rows = 20) {
    return api.get(`/prosopography/search/${encodeURIComponent(keyword)}?page=${page}&rows=${rows}`)
  },
  advancedSearch(criteria, page = 1, rows = 20) {
    return api.post('/prosopography/search/advanced', criteria, {
      body: criteria,
      headers: { 'Content-Type': 'application/json' },
    })
  },
  getDraftByReference(reference) {
    return api.get(`/draft/${reference}`)
  },
  saveFicheFromText(reference, prosopography) {
    return api.post('/draft/from-text', { reference, prosopography })
  },
  createFicheFromText(prosopography) {
    return api.post('/draft/create-from-text', { prosopography })
  },
  publishDraft(reference) {
    return api.post(`/draft/publish/${reference}`)
  },
  removeFicheByReference(reference) {
    return api.delete(`/prosopography/${reference}`)
  },
  deleteDraft(reference) {
    return api.delete(`/draft/${reference}`)
  },
  parseText(text) {
    return api.post('/prosopography/parse-text', { text })
  },
  initGraph() {
    return api.post('/prosopography/initGraph', {})
  },
}
