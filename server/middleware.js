const { createResponse } = require('./utils.js');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json(
            createResponse('ERROR', 'Es requereix la capçalera d\'autorització')
        );
    }

    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json(
            createResponse('ERROR', 'Format d\'autorització invàlid')
        );
    }

    const token = authHeader.substring(7);

    if (token !== 'ABCD1234EFGH5678IJKL') {
        return res.status(401).json(
            createResponse('ERROR', 'Token invàlid')
        );
    }

    next();
};
  

module.exports = authMiddleware;