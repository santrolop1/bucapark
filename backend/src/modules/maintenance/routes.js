const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../../middleware/auth');
const { createMaintenance, getMaintenance, updateMaintenanceStatus } = require('./controller');

router.post('/', authMiddleware, requireRole('admin'), createMaintenance);
router.get('/', authMiddleware, requireRole('admin', 'operario'), getMaintenance);
router.patch('/:id/estado', authMiddleware, requireRole('admin', 'operario'), updateMaintenanceStatus);

module.exports = router;
