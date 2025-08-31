const axios = require('axios');
const api = require("./api.controller");

async function sendMessage(to, message) {
    try {
        const response = await api.post('/messages/text', {
            to,
            body: message
        });

        return { success: true, data: response.data };

    } catch (err) {
        return {
            success: false,
            error: 'Erro ao enviar mensagem',
            details: err.response?.data || err.message
        };
    }
}

module.exports = sendMessage;