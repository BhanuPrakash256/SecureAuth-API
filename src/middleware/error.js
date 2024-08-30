const logger = require("../Utils/logger");

const errorHandler = (err, req, res, next) => {

    console.log("Middleware Error Handling");
    
    const errStatus = err.statusCode || 500;
    const errMsg = err.message || 'Something went wrong';

    res.status(errStatus).json({
        success: false,
        status: errStatus,
        message: errMsg,
    });
    
    if (err.name === 'TokenExpiredError' || err.name === 'ForbiddenError') {
        logger.warn(`${err.name}[${errStatus}]: ${errMsg}`);
    }
    else {
        logger.error(`${err.name}[${errStatus}]: ${errMsg}`);
    }
}

module.exports = errorHandler;




// stack: process.env.NODE_ENV === 'development' ? err.stack : {}