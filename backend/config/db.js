const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI no está definido en las variables de entorno');
    }
    
    console.log('Intentando conectar a MongoDB...');
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB conectado: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error(`Error al conectar a MongoDB: ${err.message}`);
    throw err;
  }
};

module.exports = connectDB;
