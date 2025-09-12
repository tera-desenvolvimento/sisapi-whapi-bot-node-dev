const api = require("../whapi/api.controller");

async function sendMenu(to) {
    const message = {
        to,
        type: "button",
        header: {
            type: "text",
            text: ""
        },
        body: {
            text: "⚠️ Este contato não recebe ligações. Em caso de dúvidas, vá até a Secretaria.\n\nEscolha uma das opções abaixo, lembrando que sempre que quiser retornar a estas opções é só digitar *menu:*"
        },
        footer: {
            type: "text",
            text: ""
        },
        action: {
            buttons: [
                {
                    type: "quick_reply",
                    id: "verResultado",
                    title: "1️⃣ Consultar resultado de exame"
                },
                {
                    type: "quick_reply",
                    id: "consultarTransporte",
                    title: "2️⃣ Setor de transporte"
                },
                {
                    type: "quick_reply",
                    id: "outrasInformacoes",
                    title: "3️⃣ Outras informações"
                }
            ]
        }
    };

    try {
        const response = await api.post('/messages/interactive', message);
        return response;
    } catch (error) {
        console.error("Erro ao enviar mensagem de saudação:", error);
        throw error;
    }
}

module.exports = sendMenu;
