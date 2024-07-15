const { getDetailBySepatu} = require("../controller/detailSepatuWarna.js");
const express = require("express");

const routerDetail = express.Router();

routerDetail.get('/shoes/:id_shoes', getDetailBySepatu);


module.exports = routerDetail;
