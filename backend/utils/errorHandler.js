class ErrorHandler extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        
        // Membuat properti stack (opsional)
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = ErrorHandler;