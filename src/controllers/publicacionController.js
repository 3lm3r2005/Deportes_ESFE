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
    const publicaciones = await Publicacion.find()
      .populate('autor_id', 'nombre apellido foto_url')
      .populate('comentarios.autor_id', 'nombre apellido foto_url')
      .sort({ fecha_publicacion: -1 });

    const publicacionesFormateadas = publicaciones.map((pub) => {
      const p = pub.toObject();
      if (p.comentarios && Array.isArray(p.comentarios)) {
        p.comentarios = p.comentarios.map((c) => {
          if (c.autor_id && typeof c.autor_id === 'object') {
            c.autor_foto = c.autor_id.foto_url || c.autor_foto;
            c.autor_nombre = `${c.autor_id.nombre || ''} ${c.autor_id.apellido || ''}`.trim() || c.autor_nombre;
            c.autor_id = c.autor_id._id;
          }
          return c;
        });
      }
      return p;
    });

    res.status(200).json(publicacionesFormateadas);
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

const formatearPublicacion = (publicacionDoc) => {
  const p = publicacionDoc.toObject ? publicacionDoc.toObject() : publicacionDoc;
  if (p.comentarios && Array.isArray(p.comentarios)) {
    p.comentarios = p.comentarios.map((c) => {
      if (c.autor_id && typeof c.autor_id === 'object') {
        c.autor_foto = c.autor_id.foto_url || c.autor_foto;
        c.autor_nombre = `${c.autor_id.nombre || ''} ${c.autor_id.apellido || ''}`.trim() || c.autor_nombre;
        c.autor_id = c.autor_id._id;
      }
      return c;
    });
  }
  return p;
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

    const publicacionActualizada = await Publicacion.findById(req.params.id)
      .populate('autor_id', 'nombre apellido foto_url')
      .populate('comentarios.autor_id', 'nombre apellido foto_url');

    res.status(201).json(formatearPublicacion(publicacionActualizada));
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

    const publicacionActualizada = await Publicacion.findById(req.params.id)
      .populate('autor_id', 'nombre apellido foto_url')
      .populate('comentarios.autor_id', 'nombre apellido foto_url');

    res.status(200).json(formatearPublicacion(publicacionActualizada));
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

    const publicacionActualizada = await Publicacion.findById(req.params.id)
      .populate('autor_id', 'nombre apellido foto_url')
      .populate('comentarios.autor_id', 'nombre apellido foto_url');

    res.status(200).json(formatearPublicacion(publicacionActualizada));
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