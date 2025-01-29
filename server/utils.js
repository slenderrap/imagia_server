const axios = require('axios');
require('dotenv').config();

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


const sendSms = async (text, receiver) => {
    try {
        const apiToken = process.env.API_TOKEN;
        const username = process.env.USERNAME; 

        const url = `http://192.168.1.16:8000/api/sendsms/`;

        const response = await axios.get(url, {
            params: {
                api_token: apiToken,
                username: username,
                text: text,
                receiver: receiver
            }
        });

        return response.data;
    } catch (error) {
        throw new Error(`Error sending SMS: ${error.message}`);
    }
};


module.exports = {createResponse, sendSms, convertImageToBase64};