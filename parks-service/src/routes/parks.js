const express = require("express");
const router = express.Router();

const parksController = require("../controllers/parksController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", parksController.getAllParks);
router.get("/:id", parksController.getParkById);

router.post("/", authMiddleware, parksController.createPark);
router.put("/:id", authMiddleware, parksController.updatePark);
router.delete("/:id", authMiddleware, parksController.deletePark);

module.exports = router;