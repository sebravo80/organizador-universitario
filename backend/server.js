const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
// Configurar CORS
app.use(cors());
// Función para registrar errores en un archivo
const logError = (error) => {
  const logDir = path.join(__dirname, 'logs');
  
  // Crear directorio de logs si no existe
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }
  
  const logFile = path.join(logDir, 'error.log');
  const timestamp = new Date().toISOString();
  const errorMessage = `[${timestamp}] ${error.stack || error}\n`;
  
  fs.appendFileSync(logFile, errorMessage);
  console.error(errorMessage);
};

// Conectar a la base de datos
try {
  connectDB();
} catch (err) {
  logError(err);
  process.exit(1);
}

// Configuración avanzada de CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-auth-token');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Manejo específico para solicitudes OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Middleware
app.use(express.json({ extended: false }));

// Middleware para registrar todas las solicitudes
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Ruta de prueba
app.get('/', (req, res) => res.send('API funcionando'));

// Definir rutas
try {
  app.use('/api/users', require('./routes/users'));
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/courses', require('./routes/courses'));
  app.use('/api/tasks', require('./routes/tasks'));
  app.use('/api/events', require('./routes/events'));
  // Añade esta línea para verificar que las rutas estén registradas
  console.log("Registrando rutas de pendientes");
  app.use('/api/pendings', require('./routes/pendings'));
} catch (err) {
  logError(err);
}

// Depuración de rutas de autenticación
app.use('/api/auth/*', (req, res, next) => {
  console.log(`[AUTH DEBUG] ${req.method} ${req.originalUrl}`);
  next();
});

// Middleware para manejar errores
app.use((err, req, res, next) => {
  logError(err);
  res.status(500).json({ 
    msg: 'Error del servidor', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno'
  });
});

// Servir archivos estáticos en producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/dist', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Servidor iniciado en puerto ${PORT}`));

// Manejo global de errores no capturados
process.on('unhandledRejection', (err) => {
  logError(err);
  console.log('Error no manejado. Cerrando servidor...');
  // server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  logError(err);
  console.log('Excepción no capturada. Cerrando servidor...');
  process.exit(1);
});