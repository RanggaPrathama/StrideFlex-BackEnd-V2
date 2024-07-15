const db = require('../database.js');

const indexCart = async (req, res) => {
    try {
        const id_user = req.params.id_user;
        const connection = await db.connect();
        const [rows] = await connection.query(`
            SELECT 
                c.id_cart,
                c.stok_id_stok,
                c.user_id_user,
                c.quantity, 
                b.nama_brand,
                sv.nama_sepatu,
                ds.harga_sepatu,
                ds.warna,
                sg.gambar_sepatu,
                u.nomor_ukuran
            FROM 
                cart c
            JOIN 
                stok s ON s.id_stok = c.stok_id_stok
            JOIN 
                ukuran u ON s.ukuran_id_ukuran = u.id_ukuran
            JOIN 
                detail_sepatu ds ON ds.idDetail_sepatu = s.detail_sepatu_idDetail_sepatu
            JOIN 
                sepatu_version sv ON sv.id_sepatu = ds.sepatu_id_sepatu
            JOIN 
                brand b ON b.id_brand = sv.brand_id_brand
            JOIN 
                sepatu_gambar sg ON ds.idDetail_sepatu = sg.detail_sepatu_idDetail_sepatu
            WHERE 
                c.user_id_user = ? AND c.status = 1
            GROUP BY 
                c.id_cart, c.stok_id_stok;
        `, [id_user]);
        connection.close();
        res.status(200).json({ data: rows, message: "Cart Berhasil DiLoad !" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createCart = async (req, res) => {
    try {
        const { id_stok, id_user } = req.body;
        const connection = await db.connect();
        const [cart] = await connection.query(`
            SELECT 
                * 
            FROM 
                cart 
            WHERE 
                stok_id_stok = ? 
                AND user_id_user = ? 
                AND status = 1
            LIMIT 1;
        `, [id_stok, id_user]);

        if (cart.length > 0) {
            const updatedCart = await connection.query(`
                UPDATE cart SET quantity = ? 
                WHERE id_cart = ?;
            `, [cart[0].quantity + 1, cart[0].id_cart]);
            connection.close();
            return res.status(200).json({ data: updatedCart, status: 'Success Updated' });
        } else {
            const newCart = await connection.query(`
                INSERT INTO 
                    cart (user_id_user, stok_id_stok, quantity) 
                VALUES 
                    (?, ?, ?);
            `, [id_user, id_stok, 1]);
            connection.close();
            return res.status(201).json({ data: newCart, status: 'Success Created' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const updateQuantity = async (req, res) => {
    try {
        const { id_cart, id_user } = req.query;
        const { quantity } = req.body;
        const connection = await db.connect();
        const updatedCart = await connection.query(`
            UPDATE  cart 
            SET quantity = ? 
            WHERE 
                id_cart = ? 
                AND user_id_user = ?;
        `, [quantity, id_cart, id_user]);
        connection.close();
        res.status(201).json({ data: updatedCart, message: "Cart Berhasil DiUpdate!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteCart = async (req, res) => {
    try {
        const { id_cart, id_user } = req.query;
        const connection = await db.connect();
        const deletedCart = await connection.query(`
            UPDATE 
                cart 
            SET 
                status = 0,
                updated_at = CURRENT_TIMESTAMP 
            WHERE 
                id_cart = ? 
                AND user_id_user = ?;
        `, [id_cart, id_user]);
        connection.close();
        res.status(201).json({ data: deletedCart, message: "Cart Berhasil DiHapus!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    indexCart,
    createCart,
    updateQuantity,
    deleteCart
};
