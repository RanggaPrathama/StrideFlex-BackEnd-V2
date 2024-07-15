const db = require('../database.js');
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { MulterError } = multer;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images/shoes')
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName)
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/svg+xml') {
            cb(null, true)
        } else {
            cb(null, false)
            return cb(new Error('Invalid mimetype  '))
        }
    }
}).array('files', 5);


const indexShoes = async (req, res) => {
    try {
        const connection = await db.connect()
        const [shoes] = await connection.query(`
            SELECT sv.id_sepatu, ds.idDetail_sepatu, sv.nama_sepatu, ds.warna, ds.harga_sepatu, sv.deskripsi_sepatu, sg.gambar_sepatu, sg.url_gambar
            FROM sepatu_version sv
            JOIN detail_sepatu ds ON ds.sepatu_id_sepatu = sv.id_sepatu
            JOIN sepatu_gambar sg ON sg.detail_sepatu_idDetail_sepatu = ds.idDetail_sepatu
            GROUP BY sv.id_sepatu
            LIMIT 8;
        `);
        connection.end();
        res.status(200).json({ data: shoes, message: "Shoes Berhasil DiLoad !" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const shoesDetailByID = async (req, res) => {
    try {
        const idSepatuVersion = req.query.id_sepatu;
        const id_detail = req.query.id_detail;
        const connection = await db.connect()
        const [Shoes] = await connection.query(`
            SELECT ds.sepatu_id_sepatu AS id_sepatu, ds.harga_sepatu, ds.idDetail_sepatu, sv.nama_sepatu, sv.deskripsi_sepatu, ds.warna, sg.gambar_sepatu
            FROM detail_sepatu ds
            JOIN sepatu_version sv ON sv.id_sepatu = ds.sepatu_id_sepatu
            JOIN sepatu_gambar sg ON sg.detail_sepatu_idDetail_sepatu = ds.idDetail_sepatu
            WHERE ds.sepatu_id_sepatu = ? AND ds.idDetail_sepatu = ?;
        `, [idSepatuVersion, id_detail]);
        connection.end()
        res.status(200).json({ data: Shoes, message: "Shoes Berhasil DiLoad !" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const shoesDetailByIdVersion = async (req, res) => {
    try {
        const idSepatuVersion = req.params.id_sepatu;
        const connection = await db.connect()
        const [Shoes] = await connection.query(`
            SELECT sv.id_sepatu, sv.nama_sepatu, ds.idDetail_sepatu, ds.warna, ds.harga_sepatu, sg.gambar_sepatu
            FROM sepatu_version sv
            JOIN detail_sepatu ds ON ds.sepatu_id_sepatu = sv.id_sepatu
            JOIN sepatu_gambar sg ON sg.detail_sepatu_idDetail_sepatu = ds.idDetail_sepatu
            WHERE ds.sepatu_id_sepatu = ?
            GROUP BY ds.idDetail_sepatu, ds.warna;
        `, [parseInt(idSepatuVersion)]);
        connection.end()
        res.status(200).json({ data: Shoes, message: "Shoes Berhasil DiLoad !" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createShoesVersion = async (req, res) => {
    try {
        const connection = await db.connect()
        const [shoesVersion] = await connection.query(`
            INSERT INTO sepatu_version (nama_sepatu, brand_id_brand, kategori_id_kategori, jenis_kelamin, deskripsi_sepatu)
            VALUES (?, ?, ?, ?, ?);
        `, [req.body.nama_sepatu, parseInt(req.body.id_brand), parseInt(req.body.id_kategori), parseInt(req.body.jenis_kelamin), req.body.deskripsi_sepatu]);
        connection.end()
        res.status(201).json({ data: shoesVersion, status: "Success Created" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/* ============== TAB BAR ================*/
const getShoesByGender = async (req, res) => {
    try {
        const idBrand = req.params.idBrand;
        const jenisKelamin = req.params.jenisKelamin;
        const connection = await db.connect()
        const [shoes] = await  connection.query(`
            SELECT sv.id_sepatu,sv.nama_sepatu, ds.idDetail_sepatu, ds.harga_sepatu, sg.gambar_sepatu
            FROM sepatu_version sv
            JOIN detail_sepatu ds ON ds.sepatu_id_sepatu = sv.id_sepatu
            JOIN sepatu_gambar sg ON sg.detail_sepatu_idDetail_sepatu = ds.idDetail_sepatu
            WHERE sv.brand_id_brand = ? AND sv.jenis_kelamin = ?
            GROUP BY sv.id_sepatu;
        `, [parseInt(idBrand),parseInt( jenisKelamin)]);
        connection.end()
        res.status(200).json({ data: shoes, message: "Shoes with Gender Berhasil DiLoad !" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createShoes = async (req, res) => {
    try {
        upload(req, res, async (error) => {
            if (error instanceof MulterError) {
                return res.status(400).json({ error: error.message });
            } else if (error) {
                return res.status(400).json({ error: error.message });
            }

            const connection = await db.connect();
            const [newShoesResult] = await connection.query(`
                INSERT INTO detail_sepatu (sepatu_id_sepatu, harga_sepatu, warna)
                VALUES (?, ?, ?);
            `, [parseInt(req.body.sepatu_id_sepatu), parseInt(req.body.harga_sepatu), req.body.warna]);

            const id_detail = newShoesResult.insertId;

            for (const file of req.files) {
                const urlGambar = `${req.protocol}://${req.get("host")}/images/shoes/${file.filename}`;
                const [gambar] = await connection.query(`
                    INSERT INTO sepatu_gambar (detail_sepatu_idDetail_sepatu, gambar_sepatu, url_gambar)
                    VALUES (?, ?, ?);
                `, [id_detail, file.filename, urlGambar]);
                console.log(gambar);
            }

            connection.close();
            res.status(201).json({ data: { id_detail }, status: "success" });
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const createStockDetail = async (req, res) => {
    try {
        const connection = await db.connect()
        const [stock] = await connection.query(`
            INSERT INTO stok (detail_sepatu_idDetail_sepatu, stock, ukuran_id_ukuran)
            VALUES (?, ?, ?);
        `, [parseInt(req.body.idDetail_sepatu), parseInt(req.body.stock), parseInt(req.body.id_ukuran)]);
        connection.end()
        res.status(201).json({ data: stock, status: "Success Created" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getShoesByIdBrand = async (req, res) => {
    try {
        const id_brand = req.params.id_brand;
        const connection = await db.connect()
        const [shoes] = await  connection .query(`
            SELECT sv.id_sepatu, sv.nama_sepatu, ds.idDetail_sepatu, ds.harga_sepatu, sg.gambar_sepatu, ds.warna
            FROM sepatu_version sv
            JOIN detail_sepatu ds ON ds.sepatu_id_sepatu = sv.id_sepatu
            JOIN sepatu_gambar sg ON sg.detail_sepatu_idDetail_sepatu = ds.idDetail_sepatu
            WHERE sv.brand_id_brand = ?
            GROUP BY sv.id_sepatu;
        `, [parseInt(id_brand)]);
        connection.end()
        res.status(200).json({ data: shoes, message: "Berhasil !" });
    } catch (error) {
        res.status(400).json({ error: error.message, errorstatus: error.status });
    }
};

const getShoesByQuerynama = async (req, res) => {
    try {
        const nama_sepatu = req.query.nama_sepatu;
        const connection = await db.connect()
        const [Shoes] = await connection.query(`
            SELECT sv.id_sepatu, ds.idDetail_sepatu, ds.warna, sv.nama_sepatu 
            FROM sepatu_version sv
            JOIN detail_sepatu ds ON ds.sepatu_id_sepatu = sv.id_sepatu
            WHERE UPPER(sv.nama_sepatu) LIKE UPPER(CONCAT('%', ?, '%')) OR UPPER(ds.warna) LIKE UPPER(CONCAT('%', ?, '%'));
        `, [nama_sepatu, nama_sepatu]);
        connection.close()
        res.status(200).json({ data: Shoes, message: "Shoes Berhasil di Load !" });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: error.message, error: "Internal Server Error" });
    }
};

module.exports = {
    indexShoes,
    shoesDetailByID,
    shoesDetailByIdVersion,
    createShoesVersion,
    getShoesByGender,
    createShoes,
    createStockDetail,
    getShoesByIdBrand,
    getShoesByQuerynama 
}