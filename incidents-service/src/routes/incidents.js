const express = require('express');

const router = express.Router();

router.get('/test', (req, res) => {

  res.json({
    success: true,
    service: 'incidents-service',
  });
});

const {
  authMiddleware,
  requireRole,
} = require('../middleware/authMiddleware');

const {
  createIncident,
  getMyIncidents,
  getIncidents,
  updateIncidentStatus,
} = require('../controllers/incidentController');

router.post(
  '/',
  authMiddleware,
  createIncident
);

router.get(
  '/my',
  authMiddleware,
  getMyIncidents
);

router.get(
  '/',
  authMiddleware,
  requireRole(
    'admin',
    'operario'
  ),
  getIncidents
);

router.patch(
  '/:id/estado',
  authMiddleware,
  requireRole(
    'admin',
    'operario'
  ),
  updateIncidentStatus
);

module.exports = router;