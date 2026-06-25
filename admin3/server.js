import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 8000
const API_TARGET = process.env.API_TARGET || 'http://localhost:3000'
const DIST = path.join(__dirname, 'dist')

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

function sendFile(res, filePath) {
  const ext = path.extname(filePath)
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
  fs.createReadStream(filePath).pipe(res)
}

const server = http.createServer(async (req, res) => {
  let url = req.url

  // API proxy
  if (url.startsWith('/api/')) {
    const targetUrl = API_TARGET + url
    try {
      const apiRes = await fetch(targetUrl, {
        method: req.method,
        headers: req.headers,
        body: req.method !== 'GET' && req.method !== 'HEAD' ? req : undefined,
      })
      res.writeHead(apiRes.status, Object.fromEntries(apiRes.headers))
      apiRes.body.pipe(res)
    } catch {
      res.writeHead(502)
      res.end('Bad Gateway')
    }
    return
  }

  // Static files
  let filePath = path.join(DIST, url === '/' ? 'index.html' : url)
  if (!filePath.startsWith(DIST)) {
    res.writeHead(403)
    res.end('Forbidden')
    return
  }

  try {
    await fs.promises.access(filePath, fs.constants.R_OK)
    sendFile(res, filePath)
  } catch {
    // SPA fallback (for hash history this is mostly for the root)
    const fallback = path.join(DIST, 'index.html')
    try {
      await fs.promises.access(fallback, fs.constants.R_OK)
      sendFile(res, fallback)
    } catch {
      res.writeHead(404)
      res.end('Not Found')
    }
  }
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Production server running on http://0.0.0.0:${PORT}`)
  console.log(`Serving ${DIST}`)
  console.log(`API proxy → ${API_TARGET}`)
})
