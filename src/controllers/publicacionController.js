const Publicacion = require('../models/Publicacion');
const Usuario = require('../models/Usuario');

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

const agregarComentario = async (req, res) => {
  try {
    const { mensaje } = req.body;

    const publicacion = await Publicacion.findById(req.params.id);
    if (!publicacion) {
      return res.status(404).json({ error: 'Publicación no encontrada' });
    }

    const usuario = await Usuario.findById(req.usuario.id).select('nombre apellido foto_url');

    publicacion.comentarios.push({
      autor_id: req.usuario.id,
      autor_nombre: `${usuario.nombre} ${usuario.apellido}`,
      autor_foto: usuario.foto_url,
      mensaje,
    });

    await publicacion.save();
    res.status(201).json(publicacion);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
const editarComentario = async (req, res) => {
  try {
    const { mensaje } = req.body;

    const publicacion = await Publicacion.findById(req.params.id);
    if (!publicacion) {
      return res.status(404).json({ error: 'Publicación no encontrada' });
    }

    const comentario = publicacion.comentarios.id(req.params.comentarioId);
    if (!comentario) {
      return res.status(404).json({ error: 'Comentario no encontrado' });
    }

    if (comentario.autor_id.toString() !== req.usuario.id) {
      return res.status(403).json({ error: 'Solo puedes editar tus propios comentarios' });
    }

    comentario.mensaje = mensaje;
    await publicacion.save();
    res.status(200).json(publicacion);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const eliminarComentario = async (req, res) => {
  try {
    const publicacion = await Publicacion.findById(req.params.id);
    if (!publicacion) {
      return res.status(404).json({ error: 'Publicación no encontrada' });
    }

    const comentario = publicacion.comentarios.id(req.params.comentarioId);
    if (!comentario) {
      return res.status(404).json({ error: 'Comentario no encontrado' });
    }

    if (comentario.autor_id.toString() !== req.usuario.id && req.usuario.rol !== 'admin') {
      return res.status(403).json({ error: 'No puedes eliminar este comentario' });
    }

    comentario.deleteOne();
    await publicacion.save();
    res.status(200).json(publicacion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  crearPublicacion,
  listarPublicaciones,
  actualizarPublicacion,
  eliminarPublicacion,
  agregarComentario,
  editarComentario,
  eliminarComentario
};