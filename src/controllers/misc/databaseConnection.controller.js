const mongoose = require("mongoose");

mongoose.set("strictQuery", true);
mongoose.set('bufferCommands', false);

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_CONNECTION_URL, {
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000,
    });
    console.log('✅ Conectado ao MongoDB');
  } catch (err) {
    console.error('❌ Erro ao conectar ao MongoDB:', err.message);
  }
}

module.exports = connectDB;