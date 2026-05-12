const express = require('express');

const router = express.Router();

const {
  authMiddleware,
  requireRole,
} = require('../middleware/authMiddleware');

const {
  createInventory,
  getInventory,
  getInventoryById,
  updateInventory,
  deleteInventory,
} = require('../controllers/inventoryController');

router.post(
  '/',
  authMiddleware,
  requireRole('admin'),
  createInventory
);

router.get(
  '/',
  getInventory
);

router.get(
  '/:id',
  getInventoryById
);

router.put(
  '/:id',
  authMiddleware,
  requireRole('admin'),
  updateInventory
);

router.delete(
  '/:id',
  authMiddleware,
  requireRole('admin'),
  deleteInventory
);

module.exports = router;