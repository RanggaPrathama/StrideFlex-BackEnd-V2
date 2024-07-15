const mysql = require('mysql2/promise');
const multer = require('multer');
const { MulterError } = multer;
const path = require('path');
const fs = require('fs');
const db = require('../database.js');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images/brand');
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/svg+xml') {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Invalid mimetype'));
        }
    }
}).single('file');

const indexBrand = async (req, res) => {
    let connection;
    try {
        // const connection = await getConnection();
        connection = await db.connect()
        const [rows] = await connection.query(`
            SELECT b.id_brand, b.nama_brand, b.gambar_brand, CAST(COUNT(ds.sepatu_id_sepatu) AS CHAR) AS total_sepatu
            FROM brand b
            LEFT JOIN sepatu_version sv ON b.id_brand = sv.brand_id_brand
            LEFT JOIN detail_sepatu ds ON sv.id_sepatu = ds.sepatu_id_sepatu
            GROUP BY b.id_brand, b.nama_brand
        `);
        connection.close();
        res.status(200).json({ data: rows, message: 'Brand berhasil diload' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const storeBrand = async (req, res) => {
    let connection
    try {
        upload(req, res, async (error) => {
            if (error instanceof MulterError) {
                return res.status(400).json({ message: error.message, status: error.status });
            }else if (error){
                return res.status(500).json({ message: error.message, status: error.status });
            }

           connection = await db.connect()
            try {
                const [cekNamebrand] = await connection.query('SELECT * FROM brand WHERE nama_brand = ?', [req.body.nama_brand]);
                if (cekNamebrand.length > 0) {
                    return res.status(400).json({ message: 'Nama Brand sudah terdaftar' });
                }

                const url = `${req.protocol}://${req.get('host')}/images/brand/${req.file.filename}`;
                const brand = await connection.query('INSERT INTO brand (nama_brand, gambar_brand, url_gambar) VALUES (?, ?, ?)', [req.body.nama_brand, req.file.filename, url]);
                connection.close();
                res.status(201).json({ brand, message: 'Brand berhasil dibuat' });
            } catch (error) {
                connection.close();
                return res.status(500).json({ message: error.message });
            }
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

module.exports = {
    indexBrand,
    storeBrand
};
