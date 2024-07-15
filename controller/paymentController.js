const db = require('../database.js');
const multer = require('multer');
const { MulterError } = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images/payment');
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
            return cb(new Error('Invalid mimetype  '));
        }
    }
}).single('file');

const createPayment = async (req, res) => {
    upload(req, res, async (error) => {
        if (error instanceof MulterError) {
            return res.status(500).json({ message: error.message });
        } else if (error) {
            return res.status(500).json({ message: error.message });
        }

        try {
            const { atasNama, noRekening, namaBank } = req.body;
            const connection = await db.connect();
            const [result] = await connection.query('INSERT INTO payments (atas_nama, no_rekening, nama_bank, gambar_bank) VALUES (?, ?, ?, ?)', [atasNama, parseInt(noRekening), namaBank, req.file.filename]);
            connection.close();
            res.status(201).json({ data: result, status: "success payments created" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
};

const getPayment = async (req, res) => {
    try {
        const connection = await db.connect();
        const [payment] = await connection.query('SELECT * FROM payments');
        connection.close();
        res.status(200).json({ data: payment, message: "payment berhasil diload" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getPaymentId = async (req, res) => {
    try {
        const { idPayment } = req.params;
        const connection = await db.connect();
        const [payment] = await connection.query('SELECT * FROM payments WHERE id_payment = ? LIMIT 1', [parseInt(idPayment)]);
        connection.close();
        if (!payment) {
            return res.status(404).json({ message: "payment tidak ditemukan" });
        }
        
        const responseData = {
            data: payment[0], 
            message: "payment berhasil diload"
        };

        res.status(200).json(responseData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



module.exports = {
    getPayment,
    createPayment,
    getPaymentId
};
