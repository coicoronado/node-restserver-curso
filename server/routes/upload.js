const express = require('express');
const fileUpload = require('express-fileupload');
const usuario = require('../models/usuario');
const app = express();
const Usuario = require('../models/usuario');
const Productos = require('../models/producto')
const fs =  require('fs');
const path = require('path');

// default options
app.use(fileUpload({ useTempFiles: true }));

app.put('/upload/:tipo/:id', function(req, res) {

  let tipo = req.params.tipo;
  let id = req.params.id;

  if (!req.files)
    return res.status(400)
              .json({
                ok:false,
                err: {
                  message: 'No se ha detectado ningun archivo'
                }
              });
  
  let miArchivo = req.files.archivo;

  // Validar tipos
  let tiposValidos = ['productos', 'usuarios'];
  if (tiposValidos.indexOf(tipo) < 0) 
    return res.status(400)
                .json({
                  ok: false,
                  err: {
                    message: `Los tipos Validos son ${tiposValidos.join(', ')}`
                  }

                })

  // extenciones permitidas
  let extencionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
  let nombreCortado = miArchivo.name.split('.');
  let extencion = nombreCortado[nombreCortado.length - 1];
  if (extencionesValidas.indexOf(extencion) < 0) {
    return res.status(400)
              .json({
                ok: false,
                err: {
                  message: `Las extenciones validas son ${extensionesValidas.join(', ')}`
                }

              });
  }

  // Cambiar nombre al archivo
  let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extencion}`

  miArchivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
    if (err)
      return res.status(400)
                .json({
                  ok:false,
                  err
                });

    // ya se cargo al server pero necesitamos ligarlo con el producto o usuario
    if (tipo === 'usuarios') 
      imagenUsuario(id, res, nombreArchivo);
    else if( tipo === 'productos')
      imagenProducto(id, res, nombreArchivo);

    // res.json({
    //   ok: true,
    //   message: 'archivo subido con exito'
    // })  
  });
});

function imagenUsuario(id, res, nombreArchivo) {
  Usuario.findById(id, (err, usuarioDB) => {
    if (err) {
      borraArchivo(nombreArchivo,'usuarios');
      return req.status(500).json({
        ok: false,
        err
      });
    }

    if (!usuarioDB) {
      borraArchivo(nombreArchivo,'usuarios');
      return req.status(400).json({
        ok: false,
        err: {
          message: 'El usuario no existe'
        }
      });
    }

    
    borraArchivo(usuarioDB.img, 'usuarios');
    usuarioDB.img = nombreArchivo;
    usuarioDB.save((err, usuarioUpd) => {
      res.json({
        ok: true,
        usuario: usuarioUpd,
        img: nombreArchivo
      })
    })
  })
}

function imagenProducto(id, res, nombreArchivo) {
  Productos.findById(id, (err, productoDB) => {
    if (err) {
      console.log('encuentra prod1');
      borraArchivo(nombreArchivo,'productos');
      return req.status(500).json({
        ok: false,
        err
      });
    }

    if (!productoDB) {
      borraArchivo(nombreArchivo,'productos');
      return req.status(400).json({
        ok: false,
        err: {
          message: 'El producto no existe'
        }
      });
    }

    
    borraArchivo(productoDB.img, 'productos');
    productoDB.img = nombreArchivo;
    productoDB.save((err, productoUpd) => {
      res.json({
        ok: true,
        producto: productoUpd,
        img: nombreArchivo
      })
    })
  })
}

function borraArchivo(nombreImgABorrar, tipo) {
  if (nombreImgABorrar) {
    let pathImg = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImgABorrar}`);
    if (fs.existsSync(pathImg)) {
      console.log(pathImg);
      fs.unlinkSync(pathImg);
    }
  }
  
}

module.exports = app;