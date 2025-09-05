const api = require("../whapi/api.controller");

async function handleError(to) {
    const message = {
        to,
        body: "Hmm… não consegui captar o que você quis dizer. Bora tentar de novo?"
    };

    try {
        const response = await api.post('/messages/text', message);
        return response;
    } catch (error) {
        console.error("Erro ao enviar mensagem de saudação:", error);
        throw error;
    }
}

module.exports = handleError;