const express = require('express');
const { getPayment, createPayment, getPaymentId } = require('../controller/paymentController.js');

const routePayment = express.Router();

routePayment.get('/payment', getPayment);
routePayment.get('/payment/:idPayment', getPaymentId);
routePayment.post('/payment/create', createPayment);

module.exports = routePayment;
