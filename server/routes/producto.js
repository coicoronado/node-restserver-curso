const express = require('express');
const { verificaToken } = require('../middlewares/autenticacion');
const { findById } = require('../models/producto');

let app = express();
let Producto = require('../models/producto');

// Todos requieren los tokens

// ============================
// Mostrar todas los productos
// ============================
app.get('/productos', (req, res) => {
  let desde = Number(req.params.desde || 0);
  let limite = Number(req.params.limite || 5);
  Producto.find({disponible: true})
    .sort('nombre')
    .populate('usuario', 'nombre email')
    .populate('categoria', 'descripcion')
    .skip(desde)
    .limit(limite)
    .exec((err, productos) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err
        });
      }

      res.json({
        ok: true,
        productos,
        total: productos.length,

      });
    });
});

// ============================
// Mostrar producto por id
// ============================
app.get('/producto/:id', (req, res) => {
  // use populate: usuario categoria
  const id = req.params.id;
  Producto.findById(id)
    .populate('usuario', 'nombre email')
    .populate('categoria', 'descripcion')
    .exec((err, producto) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err
        });
      }

      if (!producto) {
        return res.status(400).json({
          ok: false,
          err: {
            message: 'No existe dicho producto'
          }
        });
      }

      res.json({
        ok: true,
        producto
      });
    });
});

app.get('/productos/buscar/:termino', verificaToken, (req, res) => {
  let termino = req.params.termino;
  let regxp = new RegExp(termino, 'i');
  Producto.find({descripcion: regxp})
    .populate('´categoria', 'descripcion')
    .exec((err, productos) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err
        });
      }

      if (!productos) {
        return res.status(400).json({
          ok: false,
          err: {
            message: 'No existen productos'
          }
        });
      }

      res.json({
        ok: true,
        productos
      });
    });
});

// ============================
// Crear producto
// ============================
app.post('/producto', verificaToken, (req, res) => {
  // grabar el usuario y la categoria de un listado
  let body = req.body;
  let usuario = req.usuario._id; // decoded.usuario
  let producto = new Producto({
    nombre: body.nombre,
    precioUni: body.precioUni,
    descripcion: body.descripcion,
    disponible: true,
    categoria: body.categoria,
    usuario
  });
  // console.log(req.usuario);
  producto.save((err, productoDb) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err
      });
    }

    if (!productoDb) {
      return res.status(400).json({
        ok: false,
        err
      });
    }

    res.json({
      ok: true,
      producto: productoDb
    });
  });
});

// ============================
// Editar un producto por id
// ============================
app.put('/producto/:id', verificaToken, (req, res) => {
  // grabar el usuario y la categoria de un listado
  const id = req.params.id;
  let body = req.body;
  let usuario = req.usuario._id; // decoded.usuario
  let producto = new Producto({
    nombre: body.nombre,
    precioUni: body.precioUni,
    descripcion: body.descripcion,
    disponible: true,
    categoria: body.categoria,
    usuario
  });

  Producto.findByIdAndUpdate(id, body, {new: true, runValidators: true}, (err, productoUpdt) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err
      });
    }

    if (productoUpdt === null) {
      return res.status(400).json({
        ok: false,
        err: {
          message: 'Prodcuto no encontrado'
        }
      });
    }

    productoUpdt.descripcion = body.descripcion;
    productoUpdt.usuario = usuario

    res.json({
      ok: true,
      producto: productoUpdt
    });
  });
});

// ============================
// Borrar producto
// ============================
app.delete('/producto/:id', verificaToken, (req, res) => {
  // grabar el usuario y la categoria de un listado
  // Solo cambiar el estado a falso no eliminar fisicamente
  const id = req.params.id;
  let usuario = req.usuario._id; // decoded.usuario
  let body = {
    disponible: false
  };
  console.log(body);
  
  Producto.findByIdAndUpdate(id, body, {new: true, runValidators: true}, (err, productoUpdt) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err
      });
    }

    if (productoUpdt === null) {
      return res.status(400).json({
        ok: false,
        err: {
          message: 'Producto no encontrado'
        }
      });
    }

    productoUpdt.disponible = false;
    productoUpdt.usuario = usuario

    res.json({
      ok: true,
      producto: productoUpdt
    });
  });
});

module.exports = app;