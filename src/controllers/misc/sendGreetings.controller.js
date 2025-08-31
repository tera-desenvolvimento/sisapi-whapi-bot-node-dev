const api = require("../whapi/api.controller");

async function sendGreetings(to) {
    const message = {
        to,
        body: "Olá! 👋 Sou o assistente virtual da Secretaria Municipal de Saúde. Fui desenvolvido para lhe ajudar com algumas informações importantes."
    };

    try {
        const response = await api.post('/messages/text', message);
        return response;
    } catch (error) {
        console.error("Erro ao enviar mensagem de saudação:", error);
        throw error;
    }
}

module.exports = sendGreetings;
