module.exports = func => (req, res, next) => {
    // Memastikan promise dari fungsi controller dieksekusi,
    // dan jika ada error (catch), error tersebut langsung diteruskan ke middleware error (next(error))
    Promise.resolve(func(req, res, next)).catch(next);
};