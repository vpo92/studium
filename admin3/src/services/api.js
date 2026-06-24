import { API_BASE } from '../config.js'

function getToken() {
  return localStorage.getItem('token')
}

async function request(method, path, options = {}) {
  const token = getToken()
  const headers = { ...options.headers }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (!res.ok) {
    const err = new Error(res.statusText)
    err.status = res.status
    try {
      err.data = await res.json()
    } catch {}
    throw err
  }

  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    const totalCount = res.headers.get('X-Total-Count')
    const data = await res.json()
    if (totalCount !== null) {
      return { data, totalCount: parseInt(totalCount, 10) }
    }
    return data
  }

  return res.text()
}

export const api = {
  get: (path, opts) => request('GET', path, opts),
  post: (path, body, opts) => request('POST', path, { ...opts, body }),
  put: (path, body, opts) => request('PUT', path, { ...opts, body }),
  delete: (path, opts) => request('DELETE', path, opts),
}
