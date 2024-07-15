const routeAuth = require("./authRoute.js");
const routerBrand = require("./brandRoute.js");
const routerCart = require("./cartRoute.js");
const routerDetail = require("./detailRoute.js");
const routerKategori = require("./kategoriRoute.js");
const routerOngkir = require("./ongkirRoute.js");
const routePayment = require("./paymentRoute.js");
const routerPembayaran = require("./pembayaranRoute.js");
const routePemesanan = require("./pemesananRoute.js");
const routerShoes = require("./shoesRoute.js");
const routerUkuran = require("./ukuranRoute.js");
const routeUser = require("./userRoute.js");
const routerWishList = require("./wishListRoute.js");

const route = function(app){
    app.use("/brand", routerBrand);
    app.use("/kategori", routerKategori);
    app.use("/ukuran", routerUkuran);
    app.use("/shoes", routerShoes);
    app.use("/detail", routerDetail);
    app.use(routeAuth);
    app.use(routerCart);
    app.use(routerWishList);
    app.use(routePayment);
    app.use(routerOngkir);
    app.use(routeUser)
    app.use(routePemesanan)
    app.use(routerPembayaran)
}

module.exports = route;