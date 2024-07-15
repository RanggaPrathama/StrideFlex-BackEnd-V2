const express = require('express');
const { addWishList, removeWishList, getWishList } = require('../controller/wishListController.js');

const routerWishList = express.Router();

routerWishList.post('/addWishlist', addWishList);
routerWishList.delete('/deleteWishlist/:id_user/:idDetail_sepatu', removeWishList);
routerWishList.get('/wishList/:id_user', getWishList);

module.exports = routerWishList;
