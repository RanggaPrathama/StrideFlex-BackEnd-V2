const express = require('express');
const { getUkuranByIdDetail, createUkuran } = require('../controller/ukuranController.js');

const routerUkuran = express.Router();

routerUkuran.get('/detail/:id_detail', getUkuranByIdDetail);
routerUkuran.post('/create', createUkuran);

module.exports = routerUkuran;
