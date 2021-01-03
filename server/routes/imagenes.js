const express = require('express');
const fs = require('fs');
const path = require('path');
const { verificaTokenImagen } = require('../middlewares/autenticacion')

let app = express();

module.exports = app;

app.get('/imagen/:tipo/:img', verificaTokenImagen, (req, res) => {
  let tipo = req.params.tipo;
  let img = req.params.img;

  let pathImg = `../../uploads/${tipo}/${img}`;

  let pathImgExists = path.resolve(__dirname, pathImg);
  if (fs.existsSync(pathImgExists)) {
    res.sendFile(pathImgExists);
  } else {
    let noImagePath = path.resolve(__dirname, '../assets/no-image.jpg')
    res.sendFile(noImagePath);
  }

});