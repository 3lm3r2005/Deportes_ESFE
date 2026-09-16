require('dotenv').config();
const mongoose = require('mongoose');
const Usuario = require('./src/models/Usuario');

const crearAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
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