const express = require("express");
const { updateProfile, getUserProfile, createAddress, getAddressAktif, getAddressNonAktif, updateAddressAktif, deleteAddress, updateAddress,getAddress } = require("../controller/UserController.js");

const routeUser = express.Router();

routeUser.patch('/profile/update/:idUser', updateProfile);
routeUser.get('/profile/:idUser', getUserProfile);
routeUser.post('/user/address/:idUser', createAddress);
routeUser.get('/user/address/active/:idUser', getAddressAktif);
routeUser.get('/user/address/nonactive/:idUser', getAddressNonAktif);
routeUser.put('/user/address/update/:idUser/:idAlamat', updateAddressAktif);
routeUser.delete('/user/address/delete/:idAlamat', deleteAddress);
routeUser.put('/user/addressName/update/:id_alamat',  updateAddress);
routeUser.get('/user/address/:idAlamat',getAddress)
module.exports = routeUser;

