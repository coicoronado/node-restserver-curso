const express = require('express');
const Usuario = require('../models/usuario');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

app.post('/login', (req, res) => {
  let body = req.body;

  Usuario.findOne({email: body.email}, (err, usuarioDb) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err
      });
    }

    if (!usuarioDb) {
      return res.status(400).json({
        ok: false,
        err: {
          message: 'UsuarioX ó contraseña incorrectos'
        }
      });
    }

    if (!bcrypt.compareSync(body.password, usuarioDb.password)) {
      return res.status(400).json({
        ok: false,
        err: {
          message: 'Usuario ó contraseñaX incorrectos'
        }
      });
    }

    let token = jwt.sign({
      usuario: usuarioDb
    }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });
    //sec * min * hour * day 

    res.json({
      ok: true,
      usuario: usuarioDb,
      token
    });
  });
});

module.exports = app;