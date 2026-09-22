require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');
const Usuario = require('./src/models/Usuario');

try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

const crearAdmin = async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) {
      console.error('Error: No se encontró la variable MONGODB_URI ni MONGO_URI');
      process.exit(1);
    }
    await mongoose.connect(uri);
    console.log('Conectado a MongoDB');

    const existe = await Usuario.findOne({ email: 'admin@esfe.edu.sv' });
    if (existe) {
      console.log('Ya existe un usuario con ese email. No se creó nada.');
      process.exit(0);
    }

    const nuevoAdmin = new Usuario({
      nombre: 'Admin',
      apellido: 'ESFE',
      email: 'admin@esfe.edu.sv',
      password: 'clave123',
      rol: 'admin',
      estado: 'activo',
    });

    await nuevoAdmin.save();
    console.log('Admin creado correctamente:');
    console.log('  Email: admin@esfe.edu.sv');
    console.log('  Password: clave123');
    process.exit(0);
  } catch (error) {
    console.error('Error al crear el admin:', error.message);
    process.exit(1);
  }
};

crearAdmin();