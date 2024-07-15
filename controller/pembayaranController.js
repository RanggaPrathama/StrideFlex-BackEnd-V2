const { body } = require('express-validator');
const db = require('../database.js'); 
const multer = require('multer');
const { MulterError } = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images/buktiBayar');
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

const pembayaranIndex = async (req, res) => {
    try {
        const { idPembayaran } = req.params;
        const connection = await db.connect()
        const [pembayaran] = await connection.query(`
            SELECT * FROM pembayaran WHERE id_pembayaran = ?
        `, [parseInt(idPembayaran)]);
        const responseData = {
            data: pembayaran[0],
            message: "Pembayaran berhasil diload"
        }
        res.status(200).json(responseData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const pembayaranStore = async (req, res) => {
    const connection = await db.connect()
    try {
        const { idPayment, idPemesanan, idOngkir, totalBayar } = req.body;
       
        const [createpembayaran] = await connection.query(`
            INSERT INTO pembayaran (pemesanan_id_pemesanan, payment_id_payment, ongkir_id_ongkir, total_pembayaran, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [parseInt(idPemesanan), parseInt(idPayment), parseInt(idOngkir), parseInt(totalBayar), 0, new Date()]);

        const pembayaranId = createpembayaran.insertId

        const  [pembayaran] = await connection.query(
            `SELECT * FROM pembayaran WHERE id_pembayaran = ?`, [parseInt(pembayaranId)]
        )
        const responseData = {
            data: pembayaran[0],
            message: "Pembayaran successfully" 
        }
        res.status(201).json(responseData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }finally{
        connection.end()
    }
};

const updatePembayaran = async (req, res) => {
    try {
        upload(req, res, async (error) => {
            if (error instanceof MulterError) {
                return res.status(400).json({ message: error.message, status: error.status });
            } else if (error) {
                return res.status(500).json({ message: error.message, status: error.status });
            }

            try {
                const { idPembayaran } = req.params;
                const now = new Date();
                const connection = await db.connect()
                const [pembayaran] = await connection.query(`
                    SELECT * FROM pembayaran WHERE id_pembayaran = ?
                `, [parseInt(idPembayaran)]);

                if (!pembayaran) {
                    return res.status(404).json({ error: "Pembayaran not found" });
                }

                const [updatePembayaran] = await connection.query(`
                    UPDATE pembayaran
                    SET bukti_pembayaran = ?, status = ?, updated_at = ?
                    WHERE id_pembayaran = ?
                `, [req.file.filename, 2, now, parseInt(idPembayaran)]);

                res.status(201).json({ data: updatePembayaran, message: "Pembayaran has been successfully updated" });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const pembayaranExpired = async (req, res) => {
    try {
        const { idPembayaran } = req.params;
        const connection = await db.connect()
        const [pembayaran] = await connection.query(`
            SELECT * FROM pembayaran WHERE id_pembayaran = ?
        `, [parseInt(idPembayaran)]);

        if (!pembayaran) {
            return res.status(404).json({ error: "Pembayaran not found" });
        }

        const [updatePembayaran] = await connection.query(`
            UPDATE pembayaran
            SET status = ?, updated_at = ?
            WHERE id_pembayaran = ?
        `, [3, new Date(), parseInt(idPembayaran)]);

        res.status(201).json({ data: updatePembayaran, message: "Pembayaran Expired" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const pembayaranVerified = async (req, res) => {
    try {
        const { idPembayaran } = req.params;
        const connection = await db.connect()
        const [pembayaran] = await connection.query(`
            SELECT * FROM pembayaran WHERE id_pembayaran = ?
        `, [parseInt(idPembayaran)]);

        if (!pembayaran) {
            return res.status(404).json({ error: "Pembayaran not found" });
        }

        const [updatePembayaran] = await connection.query(`
            UPDATE pembayaran
            SET status = ?, updated_at = ?
            WHERE id_pembayaran = ?
        `, [1, new Date(), parseInt(idPembayaran)]);

        res.status(201).json({ data: updatePembayaran, message: "Pembayaran Verified Success" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const orderStatus = async (req, res) => {
    try {
        const { idUser, status } = req.query;

        const parsedIdUser = parseInt(idUser);
        const parsedStatus = parseInt(status);
        const connection = await db.connect()
        const [order] = await connection.query(`
            SELECT p.id_pembayaran, p.status
            FROM pembayaran p
            JOIN pemesanan pem ON pem.id_pemesanan = p.pemesanan_id_pemesanan
            WHERE pem.user_id_user = ? AND p.status = ?
            ORDER BY p.created_at DESC
        `, [parsedIdUser, parsedStatus]);

        res.status(200).json({ data: order, message: "Order successfully loaded" });
    } catch (error) {
        console.error(`Error: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};

const orderItem = async (req, res) => {
    try {
        const { idPembayaran } = req.params;
        const connection = await db.connect()
        const [item] = await connection.query(`
            SELECT p.id_pembayaran, pem.user_id_user, p.status, sg.gambar_sepatu, sv.nama_sepatu, dps.warna, dp.quantity, u.nomor_ukuran, dp.subtotal
            FROM pembayaran p
            JOIN pemesanan pem ON pem.id_pemesanan = p.pemesanan_id_pemesanan
            JOIN detail_pemesanan dp ON dp.pemesanan_id_pemesanan = pem.id_pemesanan
            JOIN stok s ON s.id_stok = dp.stok_id_stok
            JOIN detail_sepatu dps ON dps.idDetail_sepatu = s.detail_sepatu_idDetail_sepatu
            JOIN sepatu_gambar sg ON sg.detail_sepatu_idDetail_sepatu = dps.idDetail_sepatu
            JOIN ukuran u ON u.id_ukuran = s.ukuran_id_ukuran
            JOIN sepatu_version sv ON sv.id_sepatu = dps.sepatu_id_sepatu
            WHERE p.id_pembayaran = ?
            GROUP BY sv.id_sepatu
        `, [parseInt(idPembayaran)]);

        res.status(200).json({ data: item, message: "item loaded successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    pembayaranIndex,
    pembayaranStore,
    updatePembayaran,
    orderItem,
    orderStatus,
    pembayaranExpired,
    pembayaranVerified
};
