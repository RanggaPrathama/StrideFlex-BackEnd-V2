const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

// Import file koneksi database
const db = require('../database.js');

const Register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    let connection;
    try {
        connection = await db.connect();
        const { nama_user, email, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Kata sandi tidak sama" });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const insertUserQuery = 'INSERT INTO user (nama_user, email, password) VALUES (?, ?, ?)';
        const [newUser] = await connection.query(insertUserQuery, [nama_user, email, hashPassword]);

        res.status(200).json({ data: newUser, message: "User created successfully", status: "success" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (connection) await connection.close();
    }
};

const Login = async (req, res) => {
    let connection;
    try {
       connection = await db.connect()
        
        const { email, password } = req.body;
        const selectUserQuery = 'SELECT * FROM user WHERE email = ? AND statusAktif = 1';
        const [user] = await connection.query(selectUserQuery, [email]);
        console.log(user);
        if (user.length === 0) return res.status(400).json({ message: "User tidak ditemukan" });

        const validPassword = await bcrypt.compare(password, user[0].password);

        if (!validPassword) return res.status(400).json({ message: "Kata sandi salah" });

        const accessToken = jwt.sign(user[0], process.env.SECRET_KEY, { expiresIn: '3h' });
        const RefreshToken = jwt.sign(user[0], process.env.REFRESH_KEY, { expiresIn: '1d' });
       // console.log(`Refresh token: ${RefreshToken}`)
        const waktuExp = checkTokenExpiration(accessToken);
        await updateRefreshToken(RefreshToken, user[0].id_user);

        res.status(200).json({ data: user, token: accessToken, waktuExp: waktuExp, message: "Login berhasil" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    } finally {
        if (connection) await connection.close();
    }
};

const deleteAccount = async (req, res) => {
    let connection;
    try {
        connection = await db.connect();
        const { idUser, email } = req.body;
        const selectUserQuery = 'SELECT * FROM user WHERE email = ? AND id_user = ?';
        const [user] = await connection.query(selectUserQuery, [email, idUser]);
        if(user.length === 0) return res.status(404).json({message: 'User not found'})

        const deleteAccountQuery = 'UPDATE user SET statusAktif = 0 WHERE email = ? AND id_user = ?';
        const [result] = await connection.query(deleteAccountQuery, [email, idUser]);

        if (result.length === 0) return res.status(404).json({ message: "User not found" });

        res.status(201).json({ data: result,message: "Account deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (connection) await connection.close();
    }
};

const updateNewPassword = async (req, res) => {
    let connection;
    try {
        connection = await db.connect();
        const { email, password, newPassword } = req.body;
        const selectUserQuery = 'SELECT * FROM user WHERE email = ?';
        const [user] = await connection.query(selectUserQuery, [email]);

        if (user.length === 0) return res.status(404).json({ message: "User not found" });

        const passwordvalid = await bcrypt.compare(password, user[0].password);
        if (!passwordvalid) return res.status(400).json({ message: "Password salah" });

        const updateNewPassword = await bcrypt.hash(newPassword, 10);
        const updatePasswordQuery = 'UPDATE user SET password = ? WHERE email = ?';
        await connection.query(updatePasswordQuery, [updateNewPassword, email]);

        res.status(200).json({ data: updatePasswordQuery,message: "Password updated" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (connection) await connection.close();
    }
};

const checkTokenExpiration = (token) => {
    try {
        const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
        const now = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
        const expDate = new Date(decodedToken.exp * 1000).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

        if (decodedToken.exp > Math.floor(Date.now() / 1000)) {
            const expiresIn = decodedToken.exp - Math.floor(Date.now() / 1000);
            console.log('Token masih berlaku. Waktu kedaluwarsa:', expDate);
            return expDate;
        } else {
            console.log('Token sudah kedaluwarsa.');
            return 0;
        }
    } catch (error) {
        console.error('Error dalam memeriksa token:', error.message);
        return 0;
    }
};

const updateRefreshToken = async (refreshToken, userId) => {
    let connection;
    try {
        connection = await db.connect();
        const updateRefreshTokenQuery = 'UPDATE user SET refresh_token = ? WHERE id_user = ?';
        await connection.query(updateRefreshTokenQuery, [refreshToken, userId]);
    } catch (error) {
        console.error('Error dalam mengupdate refresh token:', error.message);
    } finally{
        if (connection) await connection.close();
    }
};

module.exports = {
    Register,
    Login,
    deleteAccount,
    updateNewPassword
};
