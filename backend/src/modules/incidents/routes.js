const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../../middleware/auth');
const { createIncident, getMyIncidents, getIncidents, updateIncidentStatus } = require('./controller');

router.get('/test', (_req, res) => res.json({ success: true, service: 'incidents' }));

router.post('/', authMiddleware, createIncident);
router.get('/my', authMiddleware, getMyIncidents);
router.get('/', authMiddleware, requireRole('admin', 'operario'), getIncidents);
router.patch('/:id/estado', authMiddleware, requireRole('admin', 'operario'), updateIncidentStatus);

module.exports = router;
