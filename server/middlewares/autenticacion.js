const jwt = require('jsonwebtoken');

/**
 * Verificar token
 */

let verificaToken = (req, res, next) => {
  let token = req.get('token');

  jwt.verify(token, process.env.SEED , (err, decoded) => {
    if (err) {
      return res.status(401).json({
        ok: false,
        err
      })
    }

    req.usuario = decoded.usuario;
    next();
  });
};

/**
 * Verificar adminRole
 */

let verificaAdmin_Role = (req, res, next) => {

  let currentRole = req.usuario.role;
  if (currentRole !== 'ADMIN_ROLE') {
    return res.status(401).json({
      ok: false,
      err: {
        message: 'Role inválido para realizar acción'
      }
    })
  }
  next();
};

/**
 * Verificar token
 */

let verificaTokenImagen = (req, res, next) => {
  let token = req.query.token;

  jwt.verify(token, process.env.SEED , (err, decoded) => {
    if (err) {
      return res.status(401).json({
        ok: false,
        err
      })
    }

    req.usuario = decoded.usuario;
    next();
  });
};

module.exports = {
  verificaToken,
  verificaAdmin_Role,
  verificaTokenImagen
};