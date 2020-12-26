const express = require('express');
const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

const app = express();

let Categoria = require('../models/categoria');

// Todos requieren los tokens

// ============================
// Mostrar todas las categorias
// ============================
app.get('/categorias', verificaToken, (req, res) => {
  Categoria.find({})
    .sort('descripcion')
    .populate('usuario', 'nombre email')
    .exec((err, categorias) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err
        });
      }

      res.json({
        ok: true,
        categorias,
        total: categorias.length
      });
    });
});

// ============================
// Mostrar una categoria con ID
// ============================
app.get('/categoria/:id', (req, res) => {
  const id = req.params.id;
  Categoria.findById(id)
    .exec((err, categoria) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err
        });
      }

      if (!categoria) {
        return res.status(400).json({
          ok: false,
          err: {
            message: 'No existe dicha categoria'
          }
        });
      }

      res.json({
        ok: true,
        categoria
      });
    });
});

// ============================
// Crear nueva categoria
// ============================
app.post('/categoria', verificaToken ,(req, res) => {
  let body = req.body;
  let usuario = req.usuario.__id; // decoded.usuario
  let categoria = new Categoria({
    descripcion: body.descripcion,
    usuario
  })

  // console.log('bananas', body, usuario);
  categoria.save((err, categoriaDb) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err
      });
    }

    if (!categoriaDb) {
      return res.status(400).json({
        ok: false,
        err
      });
    }

    res.json({
      ok: true,
      categoria: categoriaDb
    });
  });
});

// ============================
// Editar Categoria
// ============================
app.put('/categoria/:id', verificaToken ,(req, res) => {
  const id = req.params.id;
  let usuario = req.usuario.__id; // decoded.usuario
  const body = {
    descripcion: req.body.descripcion,
    usuario
  };

  Categoria.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, categoriaUpdt) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err
      });
    }

    if (categoriaUpdt === null) {
      return res.status(400).json({
        ok: false,
        err: {
          message: 'Categoria no encontrada'
        }
      });
    }

    categoriaUpdt.descripcion = body.descripcion;
    categoriaUpdt.usuario = usuario

    res.json({
      ok: true,
      categoria: categoriaUpdt
    });
  });

  // regresa la nueva categoria
});

// ============================
// Eliminar Categoria
// ============================
app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {

  // solo un admin puede hacer esto y la eliminara no desactivara
  const id = req.params.id;
  let usuario = req.usuario.__id; // decoded.usuario
  const body = {
    descripcion: req.body.descripcion,
    usuario
  };

  Categoria.findByIdAndRemove(id, (err, categoriaUpdt) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err
      });
    }

    res.json({
      ok: true,
      message: 'Categoria eliminada'
    });
  });
});

module.exports = app;