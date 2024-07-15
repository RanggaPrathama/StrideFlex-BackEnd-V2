const db = require('../database.js'); 
const multer = require('multer');
const { MulterError } = multer;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images/profile');
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (['image/jpeg', 'image/png', 'image/jpg', 'image/svg+xml'].includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Invalid mimetype'));
        }
    }
}).single('file');

const getUserProfile = async (req, res) => {
    const connection = await db.connect()
    try {
       
        const [user] = await connection.query('SELECT * FROM user WHERE id_user = ?', [parseInt(req.params.idUser)]);
        if (user.length === 0) return res.status(404).json({ message: 'User not found' });
        const responseData = {
            data: user[0],
            message : "User Found"
        }
       
        res.status(200).json( responseData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }finally{
        connection.end()
    }
};

const updateProfile = async (req, res) => {
    try {
        upload(req, res, async (error) => {
            if (error instanceof MulterError) {
                return res.status(400).json({ message: error.message, status: error.status });
            } else if (error) {
                return res.status(500).json({ message: error.message, status: error.status });
            }

            try {
                const connection = await db.connect();
                const [user] = await connection.query('SELECT * FROM user WHERE id_user = ?', [parseInt(req.params.idUser)]);
                if (user.length === 0) return res.status(404).json({ message: 'User not found' });

                const dataToUpdate = {};
                if (req.file) {
                    const urlProfile = `${req.protocol}://${req.get('host')}/images/profile/${req.file.filename}`;
                    dataToUpdate.gambar_profile = req.file.filename;
                    dataToUpdate.urlProfile = urlProfile;
                }
                if (req.body.phoneNumber) {
                    dataToUpdate.phoneNumber = req.body.phoneNumber;
                }
                if(req.body.nama_user){
                    dataToUpdate.nama_user = req.body.nama_user;
                }

                await connection.query('UPDATE user SET ? WHERE id_user = ?', [dataToUpdate, user[0].id_user]);
                const [updatedUser] = await connection.query('SELECT * FROM user WHERE id_user = ?', [user[0].id_user]);

                res.status(200).json({ data: updatedUser[0], message: 'Profile updated successfully' });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createAddress = async (req, res) => {
    const connection = await db.connect()
    try {
       
        const [addresses] = await connection.query('SELECT * FROM alamat_user WHERE user_id_user = ?', [parseInt(req.params.idUser)]);
        const { alamat } = req.body;
        const status = addresses.length < 1 ? 1 : 0;

        const [result] = await connection.query('INSERT INTO alamat_user (user_id_user, alamat, status) VALUES (?, ?, ?)', [parseInt(req.params.idUser), alamat, status]);
        const [createdAddress] = await connection.query('SELECT * FROM alamat_user WHERE id_alamat = ?', [result.insertId]);

        res.status(201).json({ data: createdAddress[0], message: 'Address created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }finally{
        connection.end();
    }
};

const getAddress = async(req,res) =>{
    const connection = await db.connect()
    try {
        const {idAlamat} = req.params
        const [alamat] = await connection.query(`SELECT * FROM alamat_user WHERE id_alamat = ?`, [parseInt(idAlamat)])
        const responseData = {
            data: alamat[0],
            message: "alamat berhasil terload"
        }
        res.status(200).json(responseData)
    } catch (error) {
        res.status(500).json({error: error.message})        
    }finally{
        connection.end()
    }
}

const updateAddress = async (req,res) =>{
    const connection = await db.connect()
    try {
        const {alamat} = req.body
        const [result] = await connection.query('UPDATE alamat_user SET alamat = ? where id_alamat = ?', [alamat, parseInt(req.params.id_alamat)])
        const [dataUpdate] = await connection.query('SELECT * FROM alamat_user WHERE id_alamat = ?', [result.insertId])
        res.status(201).json({data:dataUpdate[0], message:"Alamat updated successfully"})
    } catch (error) {
        res.status(500).json({error:error.message})
    }finally{
        connection.end()
    }
}

const getAddressAktif = async (req, res) => {
    try {
        const connection = await db.connect()
        const [alamat] = await connection.query('SELECT * FROM alamat_user WHERE user_id_user = ? AND status = 1', [parseInt(req.params.idUser)]);
        const responseData = {
            data: alamat[0],
            message: 'Address successfully loaded'
        }
        res.status(200).json(responseData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAddressNonAktif = async (req, res) => {
    const connection  = await db.connect()
    try {
       
        const [alamat] = await connection.query('SELECT * FROM alamat_user WHERE user_id_user = ? AND status = 0', [parseInt(req.params.idUser)]);
        
        res.status(200).json({ data: alamat, message: 'Addresses successfully loaded' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }finally{
        connection.end()
    }
};

const updateAddressAktif = async (req, res) => {
    const connection = await db.connect()
    try {
        const idUser = parseInt(req.params.idUser);
        const idAlamat = parseInt(req.params.idAlamat);
       
        const [cekAktif] = await connection.query('SELECT * FROM alamat_user WHERE user_id_user = ? AND status = 1', [idUser]);
        if (cekAktif.length > 0) {
            await connection.query('UPDATE alamat_user SET status = 0 WHERE id_alamat = ?', [cekAktif[0].id_alamat]);
        }

        await connection.query('UPDATE alamat_user SET status = 1 WHERE id_alamat = ?', [idAlamat]);
        const [newAddressAktif] = await connection.query('SELECT * FROM alamat_user WHERE id_alamat = ?', [idAlamat]);

        res.status(201).json({ data: newAddressAktif[0], message: 'Address updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }finally{
        connection.end()
    }
};

const deleteAddress = async (req, res) => {
    const connection = await db.connect()
    try {
      
        const idAlamat = parseInt(req.params.idAlamat);
        const [address] = await connection.query('DELETE FROM alamat_user WHERE id_alamat = ?', [idAlamat]);

        res.status(200).json({ data: address, message: 'Address deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }finally{
        connection.end()
    }
};

module.exports = {
    updateProfile,
    getUserProfile,
    createAddress,
    getAddressAktif,
    getAddressNonAktif,
    updateAddressAktif,
    deleteAddress,
    updateAddress,
    getAddress
};
