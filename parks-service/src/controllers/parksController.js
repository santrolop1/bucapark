const Park = require("../models/Park");

exports.getAllParks = async (req, res) => {
  try {
    const parks = await Park.find();

    res.json({
      success: true,
      data: parks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.getParkById = async (req, res) => {
  try {
    const park = await Park.findById(req.params.id);

    if (!park) {
      return res.status(404).json({
        success: false,
        error: "Parque no encontrado",
      });
    }

    res.json({
      success: true,
      data: park,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.createPark = async (req, res) => {
  try {
    const park = await Park.create(req.body);

    res.status(201).json({
      success: true,
      message: "Parque creado correctamente",
      data: park,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.updatePark = async (req, res) => {
  try {
    const park = await Park.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!park) {
      return res.status(404).json({
        success: false,
        error: "Parque no encontrado",
      });
    }

    res.json({
      success: true,
      message: "Parque actualizado",
      data: park,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.deletePark = async (req, res) => {
  try {
    const park = await Park.findByIdAndDelete(
      req.params.id
    );

    if (!park) {
      return res.status(404).json({
        success: false,
        error: "Parque no encontrado",
      });
    }

    res.json({
      success: true,
      message: "Parque eliminado",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};