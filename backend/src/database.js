const mongoose = require('mongoose');

const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('[DB] MongoDB conectado correctamente');
  } catch (error) {
    console.error('[DB] Error conectando a MongoDB:', error.message);
    throw error;
  }
};

module.exports = connectDatabase;
