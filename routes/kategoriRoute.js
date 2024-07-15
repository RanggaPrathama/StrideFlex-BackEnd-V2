const { getKategori, createKategori } = require('../controller/kategoriController.js');
const express = require('express');

const routerKategori = express.Router();

routerKategori.get('/', getKategori);
routerKategori.post('/create', createKategori);

module.exports = routerKategori;
