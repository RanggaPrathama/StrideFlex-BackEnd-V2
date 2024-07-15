const db = require('../database.js');

const getWishList = async (req, res) => {
    try {
        const id_user = req.params.id_user;
        const connection = await db.connect()
        const [wishList] = await connection.query(`
            SELECT f.id_favorit, f.user_id_user AS id_user, f.detail_sepatu_idDetail_sepatu AS idDetail_sepatu, ds.sepatu_id_sepatu AS id_sepatu, sg.gambar_sepatu, ds.warna, sv.nama_sepatu, ds.harga_sepatu
            FROM favorite f
            JOIN detail_sepatu ds ON ds.idDetail_sepatu = f.detail_sepatu_idDetail_sepatu
            JOIN sepatu_version sv ON sv.id_sepatu = ds.sepatu_id_sepatu 
            JOIN sepatu_gambar sg ON sg.detail_sepatu_idDetail_sepatu = ds.idDetail_sepatu
            WHERE f.user_id_user = ? AND f.status = 1
            GROUP BY f.id_favorit
        `, [parseInt(id_user)]);
        connection.end()
        res.status(200).json({ data: wishList, message: "WishList Berhasil DiLoad!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const addWishList = async (req, res) => {
    try {
        const connection = await db.connect()
        const [cekWishList] = await connection.query(`
            SELECT * FROM favorite
            WHERE user_id_user = ? AND detail_sepatu_idDetail_sepatu = ?
        `, [parseInt(req.body.id_user), parseInt(req.body.idDetail_sepatu)]);

        if (cekWishList.length > 0) {
            const [wishList] = await connection.query(`
                UPDATE favorite
                SET status = 1, created_at = ?
                WHERE id_favorit = ?
            `, [new Date(), cekWishList[0].id_favorit]);

            return res.status(200).json({ data: wishList, status: 200, message: "Success WishList Created" });
        } else {
            const [wishlist] = await connection.query(`
                INSERT INTO favorite (user_id_user, detail_sepatu_idDetail_sepatu, status, created_at)
                VALUES (?, ?, 1, ?)
            `, [parseInt(req.body.id_user), parseInt(req.body.idDetail_sepatu), new Date()]);


            return res.status(201).json({ data: wishlist, status: 201, message: "Success WishList Created" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const removeWishList = async (req, res) => {
    try {
        const connection = await db.connect()
        const [cekWishList] = await connection.query(`
            SELECT * FROM favorite
            WHERE user_id_user = ? AND detail_sepatu_idDetail_sepatu = ?
        `, [parseInt(req.params.id_user), parseInt(req.params.idDetail_sepatu)]);

        if (cekWishList.length > 0) {
            const [wishList] = await connection.query(`
                UPDATE favorite
                SET status = 0, updated_at = ?
                WHERE id_favorit = ?
            `, [new Date(), cekWishList[0].id_favorit]);

            return res.status(200).json({ data: wishList, status: 200, message: "WishList deleted successfully" });
        } else {
            return res.status(404).json({ status: 404, message: "WishList not found" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    addWishList,
    removeWishList,
    getWishList,
};
