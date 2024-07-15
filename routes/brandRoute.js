const express = require("express");
const { indexBrand, storeBrand } = require("../controller/brandController.js");
// const { verifyToken } = require("../middleware/verifyToken.js");

const routerBrand = express.Router();

routerBrand.get('/', indexBrand);
routerBrand.post('/create', storeBrand);


module.exports = routerBrand;
