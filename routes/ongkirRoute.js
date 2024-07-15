const express = require('express');
const { getOngkir, getOngkirByid, storeOngkir } = require('../controller/ongkirController.js');

const routerOngkir = express.Router();

routerOngkir.get('/ongkir', getOngkir);
routerOngkir.get('/ongkir/:idOngkir', getOngkirByid);
routerOngkir.post('/ongkir/post', storeOngkir);

module.exports = routerOngkir;
