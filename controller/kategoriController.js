const db = require('../database.js');

const getKategori = async (req, res) => {
    try {
        const connection = await db.connect();
        const [kategori] = await connection.query('SELECT * FROM kategori_sepatu');
        connection.close();
        res.status(200).json({ data: kategori, message: 'Kategori Berhasil diload ' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createKategori = async (req, res) => {
    try {
        const connection = await db.connect();
        const [kategori] = await connection.query('INSERT INTO kategori_sepatu (nama_kategori) VALUES (?)', [req.body.nama_kategori]);
        connection.close();
        res.status(200).json({ data: kategori, message: 'Kategori Berhasil dibuat ' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getKategori,
    createKategori
};
