const express = require("express");

const router = express.Router();

const parksController = require(
  "../controllers/parksController"
);

router.get("/", parksController.getAllParks);

router.get("/:id", parksController.getParkById);

router.post("/", parksController.createPark);

router.put("/:id", parksController.updatePark);

router.delete("/:id", parksController.deletePark);

module.exports = router;