const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/welcome', (req, res) => {
  res.json({ message: 'Studium API', version: '0.3.0', endpoints: ['/api/prosopography', '/api/prosopography/search', '/api/prosopography/index', '/api/prosopography/allIds', '/api/prosopography/:id', '/api/manuscripts', '/api/drafts', '/api/admin', '/api/auth', '/api/users'] });
});

router.get('/prosopography', (req, res) => {
  const result = db.findAll({ page: parseInt(req.query.page) || 1, rows: parseInt(req.query.rows) || 20 });
  res.json(result.data);
});

router.get('/prosopography/allIds', (req, res) => {
  res.json(db.getAllIds());
});

router.get('/prosopography/search/:text', (req, res) => {
  const result = db.textSearch(req.params.text, { page: parseInt(req.query.page) || 1, rows: parseInt(req.query.rows) || 20 });
  res.json(result.data);
});

router.get('/prosopography/index/:letter', (req, res) => {
  res.json(db.indexSearch(req.params.letter));
});

router.get('/prosopography/:id', (req, res) => {
  const person = db.findByReference(parseInt(req.params.id));
  if (!person) return res.status(404).json({ error: 'Not found' });
  res.json(person);
});

router.get('/manuscripts', (req, res) => {
  res.json({ message: 'Manuscripts endpoint', items: [], total: 0 });
});

router.get('/manuscripts/:id', (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

router.get('/drafts', (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

router.get('/drafts/:id', (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

router.get('/admin', (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

router.post('/admin/import', (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

router.post('/admin/reindex', (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

router.get('/auth/status', (req, res) => {
  res.json({ authenticated: false });
});

router.post('/auth/login', (req, res) => {
  res.status(401).json({ error: 'Not implemented' });
});

router.post('/auth/logout', (req, res) => {
  res.json({ message: 'Logged out' });
});

router.post('/auth/refresh', (req, res) => {
  res.status(401).json({ error: 'Not implemented' });
});

router.get('/users', (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

router.get('/users/:id', (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

router.post('/users/:id/role', (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

router.post('/users/:id/ban', (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

router.get('/config', (req, res) => {
  res.json({ appName: 'Studium', version: '0.3.0' });
});

router.get('/endpoints', (req, res) => {
  res.json(Object.keys(router.stack.filter(r => r.route).reduce((acc, r) => { acc[r.route.path] = true; return acc; }, {})));
});

module.exports = router;
