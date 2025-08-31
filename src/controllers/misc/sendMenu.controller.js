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
            text: "Atenção ⚠️ Este contato envia apenas notificações e não recebe mensagens nem ligações. Em caso de dúvidas, procure diretamente a Secretaria Municipal de Saúde.\n\nEscolha uma das opções abaixo, lembrando que sempre que quiser retornar a estas opções é só digitar *menu:*"
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
                    id: "consultarAgendamento",
                    title: "2️⃣ Consultar agendamento de transporte"
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
