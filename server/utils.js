const createResponse = (status, message, data = null) => {
    return {
        status: status,
        message: message,
        data: data
    };
};

const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        try {
            const base64 = file.toString('base64');
            resolve(base64);
        } catch (error) {
            reject(error);
        }
    });
};

  
module.exports = {createResponse, convertImageToBase64};