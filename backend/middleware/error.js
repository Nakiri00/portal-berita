const ErrorHandler = require('../utils/errorHandler');

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal Server Error';

    // Penanganan Error Mongoose Bad ObjectId (CastError)
    if (err.name === 'CastError') {
        const message = `Resource not found. Invalid: ${err.path}`;
        err = new ErrorHandler(message, 400);
    }

    // Penanganan Error Validasi Mongoose (ValidationError)
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(value => value.message);
        err = new ErrorHandler(message.join(', '), 400);
    }

    // Penanganan Error Kunci Duplikat Mongoose (11000)
    if (err.code === 11000) {
        const message = `Nilai duplikat dimasukkan untuk field ${Object.keys(err.keyValue)}`;
        err = new ErrorHandler(message, 400);
    }
    
    // Penanganan Error JWT Salah
    if (err.name === 'JsonWebTokenError') {
        const message = 'JSON Web Token tidak valid. Coba lagi';
        err = new ErrorHandler(message, 401);
    }
    
    // Penanganan Error JWT Kedaluwarsa
    if (err.name === 'TokenExpiredError') {
        const message = 'JSON Web Token kedaluwarsa. Coba login lagi';
        err = new ErrorHandler(message, 401);
    }


    res.status(err.statusCode).json({
        success: false,
        message: err.message,
        // Error stack hanya ditampilkan jika di mode pengembangan
        error: process.env.NODE_ENV === 'DEVELOPMENT' ? err : {} 
    });
};