const jwt = require('jsonwebtoken');

const verifyToken = async (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    console.log(token);
    if (!token) return res.status(401).json({ error: 'Token tidak ditemukan' });
    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: err.message });
        req.user = user;
        next();
    });
};

module.exports = {
    verifyToken,
};
