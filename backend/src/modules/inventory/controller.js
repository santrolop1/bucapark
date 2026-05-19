const Inventory = require('./model');

const createInventory = async (req, res) => {
  try {
    const inventory = await Inventory.create(req.body);
    res.status(201).json({ success: true, message: 'Implemento creado', data: inventory });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find();
    res.json({ success: true, data: inventory });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getInventoryById = async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) return res.status(404).json({ success: false, error: 'Implemento no encontrado' });
    res.json({ success: true, data: inventory });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!inventory) return res.status(404).json({ success: false, error: 'Implemento no encontrado' });
    res.json({ success: true, message: 'Implemento actualizado', data: inventory });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findByIdAndDelete(req.params.id);
    if (!inventory) return res.status(404).json({ success: false, error: 'Implemento no encontrado' });
    res.json({ success: true, message: 'Implemento eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { createInventory, getInventory, getInventoryById, updateInventory, deleteInventory };
