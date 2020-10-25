const express = require('express');
const Usuario = require('../models/usuario');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

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

// Configuraciones de google
async function verify(token) {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();
  console.log(payload.name, payload.email, payload.picture);

  return {
    nombre: payload.name,
    email: payload.email,
    img: payload.picture,
    google: true
  }
}
// verify().catch(console.error);

app.post('/google', async (req, res) => {
  let token = req.body.idtoken;
  // console.log(res.json(
  //   {
  //     token
  //   }
  // ));

  let googleUser = await verify(token)
    .catch(e => {
      return res.status(403).json({
        ok: false,
        err: e
      })
    });
  
  Usuario.findOne({email:googleUser.email}, (err, usuarioDb) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err
      });
    }

    if (usuarioDb) {
      if (usuarioDb.google === false) {
        return res.status(400).json({
          ok: false,
          err: {
            message: 'Debe usar auth regular'
          }
        });
      } else {
        let token = jwt.sign({
          usuario: usuarioDb
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

        return res.json({
          ok: true,
          usuario: usuarioDb,
          token
        });
      }
    } else {
      // si el usuario no existe en nuestra DB
      let usuario = new Usuario();
      usuario.nombre = googleUser.nombre;
      usuario.email = googleUser.email;
      usuario.img = googleUser.img;
      usuario.password = ':)';

      usuario.save ( (err, usuarioDb) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            err
          });
        }
    
        if (usuarioDb) {
          if (usuarioDb.google === false) {
            return res.status(400).json({
              ok: false,
              err: {
                message: 'Debe usar auth regular'
              }
            });
          } else {
            let token = jwt.sign({
              usuario: usuarioDb
            }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });
    
            return res.json({
              ok: true,
              usuario: usuarioDb,
              token
            });
          }
        }
      });
    }

  });
});
module.exports = app;