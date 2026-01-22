const logSlowRequests = function(threshold) {
    return (req, res, next) => {
        const start = Date.now();
        res.on('finish', () => {
            const duration = Date.now() - start
            if (duration > threshold) {
                 console.log(`SLOW REQUEST: ${req.url} took ${duration} ms.`)
                }
        })
        next();
    };
}

module.exports = logSlowRequests