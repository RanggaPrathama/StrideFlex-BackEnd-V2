const db = require('../database.js');

const getUkuranByIdDetail = async (req, res) => {
    try {
        const id_detail = req.params.id_detail;
        const connection = await db.connect();
        const [ukuran] = await connection.query(`
            SELECT s.id_stok, s.stock, ds.sepatu_id_sepatu as id_sepatu, s.ukuran_id_ukuran as id_ukuran, s.detail_sepatu_idDetail_sepatu as id_detail, u.nomor_ukuran
            FROM stok s
            JOIN ukuran u ON u.id_ukuran = s.ukuran_id_ukuran
            JOIN detail_sepatu ds ON ds.idDetail_sepatu = s.detail_sepatu_idDetail_sepatu
            WHERE ds.idDetail_sepatu = ?;
        `, [id_detail]);
        connection.close();
        res.status(200).json({ data: ukuran, message: 'Ukuran Berhasil diload ' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const createUkuran = async (req, res) => {
    try {
        const { nomor_ukuran } = req.body;
        const connection = await db.connect();
        const [ukuran] = await connection.query('INSERT INTO ukuran (nomor_ukuran) VALUES (?)', [parseInt(nomor_ukuran)]);
        connection.close();
        res.status(201).json({ data: ukuran, message: 'Ukuran Berhasil dibuat ' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getUkuranByIdDetail,
    createUkuran
};
