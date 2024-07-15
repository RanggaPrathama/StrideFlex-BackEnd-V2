const mysql = require('mysql2/promise');
const dotenv = require('dotenv')
dotenv.config()

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
};

let connection;

async function connect() {
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to the database');
        return connection
    } catch (error) {
        console.error('Error connecting to the database:', error.message);
        throw error;
    }
}

async function close() {
    try {
        if (connection) {
            await connection.end();
            console.log('Connection to the database closed');
        }
    } catch (error) {
        console.error('Error closing the database connection:', error.message);
        throw error;
    }
}

module.exports = {
    connect,
    close,
    getConnection: () => connection // Opsional: fungsi untuk mendapatkan koneksi langsung
};
