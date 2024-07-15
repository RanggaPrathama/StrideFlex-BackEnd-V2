const db = require('../database.js'); 

const indexPemesanan = async (req, res) => {
    const connection = await db.connect()
    try {
        const { idPesan, idUser } = req.params;
        const [pemesanan] = await connection.query(`
            SELECT dp.pemesanan_id_pemesanan, dp.idDetail_pemesanan, sg.gambar_sepatu, sv.nama_sepatu, ds.harga_sepatu, ds.warna, c.quantity, u.nomor_ukuran, dp.subtotal
            FROM detail_pemesanan dp 
            JOIN pemesanan p ON p.id_pemesanan = dp.pemesanan_id_pemesanan
            JOIN stok s ON s.id_stok = dp.stok_id_stok
            JOIN detail_sepatu ds ON ds.idDetail_sepatu = s.detail_sepatu_idDetail_sepatu
            JOIN sepatu_version sv ON sv.id_sepatu = ds.sepatu_id_sepatu
            JOIN ukuran u ON u.id_ukuran = s.ukuran_id_ukuran
            JOIN cart c ON c.stok_id_stok = s.id_stok
            JOIN sepatu_gambar sg ON sg.detail_sepatu_idDetail_sepatu = ds.idDetail_sepatu
            WHERE p.user_id_user = ? AND p.id_pemesanan = ?
            GROUP BY sv.id_sepatu
        `, [parseInt(idUser), parseInt(idPesan)]);

        res.status(200).json({ data: pemesanan, message: "Pemesanan successfully added" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }finally{
        connection.end()
    }
};
const pemesananStore = async (req, res) => {
    const connection = await db.connect();

    try {
        const { idUser, dataPemesanan, totalPesan } = req.body;

        if (!idUser || !dataPemesanan || !totalPesan) {
            connection.release();
            return res.status(400).json({ error: 'Invalid input data' });
        }

        await connection.beginTransaction();

        const [pemesananResult] = await connection.query(`
            INSERT INTO pemesanan (user_id_user, created_at, status, total_nilai)
            VALUES (?, ?, ?, ?)
        `, [
            parseInt(idUser),
            new Date(),
            1,
            parseInt(totalPesan)
        ]);

        const idPemesanan = pemesananResult.insertId;

        const insertPromises = dataPemesanan.map(item => {
            return connection.query(`
                INSERT INTO detail_pemesanan (pemesanan_id_pemesanan, stok_id_stok, quantity, harga_sepatu, subtotal)
                VALUES (?, ?, ?, ?, ?)
            `, [
                idPemesanan,
                parseInt(item.stok_id_stok),
                parseInt(item.quantity),
                parseInt(item.hargaSepatu),
                parseInt(item.quantity) * parseInt(item.hargaSepatu)
            ]);
        });

        await Promise.all(insertPromises);

        await connection.commit();

        res.status(201).json({ data: { id_pemesanan: idPemesanan }, message: "Pemesanan Added" });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: error.message });
    } finally {
        connection.end();
    }
};


module.exports = {
    indexPemesanan,
    pemesananStore
};
