const mongoose = require("mongoose");

const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      autoIndex: true,
      serverSelectionTimeoutMS: 10000,
    });

    console.log("[OK] MongoDB conectado correctamente");
  } catch (error) {
    console.error("[ERROR] Error conectando a MongoDB:");
    console.error(error.message);

    throw error;
  }
};

module.exports = connectDatabase;
