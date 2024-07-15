const db = require('../database.js');

const getDetailBySepatu = async (req, res) => {
    try {
        let id_shoes = req.params.id_shoes;
        let connection = await db.connect()
        const [rows] = await connection.query(`
            SELECT sv.id_sepatu, ds.idDetail_sepatu, ds.warna, sg.gambar_sepatu
            FROM sepatu_version sv
            JOIN detail_sepatu ds ON ds.sepatu_id_sepatu = sv.id_sepatu
            JOIN sepatu_gambar sg ON sg.detail_sepatu_idDetail_sepatu = ds.idDetail_sepatu
            WHERE ds.sepatu_id_sepatu = ?
            GROUP BY ds.idDetail_sepatu, ds.warna
        `, [parseInt(id_shoes)]);
        
        res.status(200).json({ data: rows, status: "Data Detail berhasil diload" });
    } catch (error) {
        res.status(500).json({ error: error.message, status: "Internal Server Error" });
    }
};

module.exports = {
    getDetailBySepatu,
    
};
