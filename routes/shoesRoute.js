const express = require('express');
const { createShoes, indexShoes,  getShoesByIdBrand, createShoesVersion, createStockDetail, shoesDetailByID, shoesDetailByIdVersion, getShoesByQuerynama, getShoesByGender } = require('../controller/shoesController.js');

const routerShoes = express.Router();

routerShoes.get('/', async (req, res) => {
    if (Object.keys(req.query).length == 0) {
        indexShoes(req, res);
    } else if (Object.keys(req.query).length == 2) {
        shoesDetailByID(req, res);
    } else {
        getShoesByQuerynama(req, res);
    }
});

routerShoes.get('/version/:id_shoes', shoesDetailByIdVersion);
routerShoes.post('/create', createShoes);
routerShoes.get('/brand/:id_brand', getShoesByIdBrand);
// routerShoes.get('/api/shoes', tesApi);
routerShoes.get('/gender/:idBrand/:jenisKelamin', getShoesByGender);

// REVISI 
routerShoes.post('/shoesVersion/create', createShoesVersion);
routerShoes.post('/stock', createStockDetail);

module.exports = routerShoes;
