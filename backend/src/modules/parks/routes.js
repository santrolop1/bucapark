const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middleware/auth');
const parksController = require('./controller');

router.get('/', parksController.getAllParks);
router.get('/:id', parksController.getParkById);

router.post('/', authMiddleware, parksController.createPark);
router.put('/:id', authMiddleware, parksController.updatePark);
router.delete('/:id', authMiddleware, parksController.deletePark);

module.exports = router;
