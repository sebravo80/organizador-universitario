// backend/test-db.js
const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI no está definido en las variables de entorno');
      process.exit(1);
    }
    
    console.log('Intentando conectar a MongoDB...');
    console.log('URI:', process.env.MONGO_URI.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, 'mongodb+srv://****:****@'));
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB conectado: ${conn.connection.host}`);
    
    // Crear un modelo de prueba
    const TestSchema = new mongoose.Schema({
      name: String,
      date: { type: Date, default: Date.now }
    });
    
    const Test = mongoose.model('test', TestSchema);
    
    // Crear un documento de prueba
    const testDoc = new Test({ name: 'Test Connection' });
    await testDoc.save();
    
    console.log('Documento de prueba creado correctamente');
    
    // Buscar el documento
    const foundDoc = await Test.findOne({ name: 'Test Connection' });
    console.log('Documento encontrado:', foundDoc);
    
    // Eliminar el documento
    await Test.deleteOne({ _id: foundDoc._id });
    console.log('Documento eliminado correctamente');
    
    // Cerrar conexión
    await mongoose.connection.close();
    console.log('Conexión cerrada');
    
    process.exit(0);
  } catch (err) {
    console.error('Error en la prueba de conexión:', err);
    process.exit(1);
  }
};

testConnection();