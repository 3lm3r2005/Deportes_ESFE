const mongoose = require('mongoose');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  // Ignorar si el entorno no permite modificar servidores DNS
}

const conectarDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!uri) {
    console.error('Error: No se encontró la variable de entorno MONGODB_URI ni MONGO_URI.');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('MongoDB conectado correctamente');
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = conectarDB;