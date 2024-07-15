const express = require('express');
const { indexCart, createCart, updateQuantity, deleteCart } = require('../controller/CartController.js');

const routerCart = express.Router();

routerCart.get('/cart/:id_user', indexCart);
routerCart.post('/createcart', createCart);
routerCart.put('/cart/update', updateQuantity);
routerCart.put('/cart/delete', deleteCart);

module.exports = routerCart;
