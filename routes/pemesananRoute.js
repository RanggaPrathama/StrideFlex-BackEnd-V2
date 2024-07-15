const express = require("express");
const { indexPemesanan, pemesananStore } = require("../controller/pemesananController.js");

const routePemesanan = express.Router();

routePemesanan.get('/pemesanan/:idPesan/:idUser', indexPemesanan);
routePemesanan.post('/pemesanan/store', pemesananStore);

module.exports = routePemesanan;
