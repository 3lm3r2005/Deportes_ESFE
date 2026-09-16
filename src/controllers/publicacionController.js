const Publicacion = require('../models/Publicacion');

const crearPublicacion = async (req, res) => {
  try {
    const nuevaPublicacion = new Publicacion({
      titulo: req.body.titulo,
      mensaje: req.body.mensaje,
      imagen_url: req.body.imagen_url,
      autor_id: req.usuario.id,
    });
    await nuevaPublicacion.save();
    res.status(201).json(nuevaPublicacion);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
const listarPublicaciones = async (req, res) => {
  try {
    const publicaciones = await Publicacion.find().sort({ fecha_publicacion: -1 });
    res.status(200).json(publicaciones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const actualizarPublicacion = async (req, res) => {
  try {
    const publicacion = await Publicacion.findByIdAndUpdate(
      req.params.id,
      { titulo: req.body.titulo, mensaje: req.body.mensaje, imagen_url: req.body.imagen_url },
      { new: true, runValidators: true }
    );
    if (!publicacion) {
      return res.status(404).json({ error: 'Publicación no encontrada' });
    }
    res.status(200).json(publicacion);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const eliminarPublicacion = async (req, res) => {
  try {
    const publicacion = await Publicacion.findByIdAndDelete(req.params.id);
    if (!publicacion) {
      return res.status(404).json({ error: 'Publicación no encontrada' });
    }
    res.status(200).json({ mensaje: 'Publicación eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  crearPublicacion,
  listarPublicaciones,
  actualizarPublicacion,
  eliminarPublicacion
};