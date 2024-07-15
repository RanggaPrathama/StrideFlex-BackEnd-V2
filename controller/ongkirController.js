const db = require('../database.js');

const getOngkir = async (req, res) => {
    try {
        const connection = await db.connect();
        const [ongkir] = await connection.query('SELECT * FROM jenis_ongkir');
        connection.close();
        res.status(200).json({ ongkir: ongkir, message: 'Ongkir Berhasil diload ' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};

const getOngkirByid = async (req, res) => {
    const connection = await db.connect();
    try {
        const { idOngkir } = req.params;
        
        const [ongkir] = await connection.query('SELECT * FROM jenis_ongkir WHERE id_ongkir = ?', [parseInt(idOngkir)]);
       
        const responseData = {
            ongkir: ongkir[0],
            message: 'Ongkir Berhasil diload' 
        }
        res.status(200).json(responseData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }finally{
        connection.close();
    }
};

const storeOngkir = async (req, res) => {
    try {
        const { namaOngkir, hargaOngkir } = req.body;
        const connection = await db.connect();
        const [ongkir] = await connection.query('INSERT INTO jenis_ongkir (nama_ongkir, harga_ongkir, status) VALUES (?, ?, ?)', [namaOngkir, parseInt(hargaOngkir), 1]);
        connection.close();
        res.status(201).json({ ongkir: ongkir, message: 'Created ongkir successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getOngkir,
    getOngkirByid,
    storeOngkir
};
