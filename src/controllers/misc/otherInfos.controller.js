const api = require("../whapi/api.controller");
const updateStep = require('../flux/updateStep.controller');
const sendMenu = require('./sendMenu.controller');

async function otherInfos(messageData) {
    if(messageData.first) {
        const message = {
            to: messageData.from,
            type: "button",
            body: {
                text: "ℹ️ Qual informação você deseja?"
            },
            action: {
                buttons: [
                    {
                        type: 'quick_reply',
                        id: 'infoHorarios',
                        title: '🕐 Horários'
                    },
                    {
                        type: 'quick_reply',
                        id: 'infoLocal',
                        title: '📍 Localização'
                    },
                    {
                        type: 'quick_reply',
                        id: 'menu',
                        title: 'Voltar ao início'
                    }
                ]
            }
        };

        try {
            const response = await api.post('/messages/interactive', message);
            updateStep(messageData.from, "aguardandoInformacoes");
            return response;
        } catch (error) {
            console.error("Erro ao enviar mensagem de informações:", error);
            throw error;
        }
    } else if (messageData.messages && messageData.messages[0].type === 'reply') {
        const replyOption = messageData.messages[0].reply.buttons_reply.id;

        switch(replyOption.split(":")[1]) {
            case "infoHorarios":
                await api.post("/messages/text", {
                    to: messageData.from,
                    body: "🕐 Atendimento de segunda a sexta, das 7h às 13h."
                });

                await api.post("/messages/interactive", {
                    to: messageData.from,
                    type: "button",
                    body: {
                        text: "ℹ️ Deseja mais alguma informação?"
                    },
                    action: {
                        buttons: [
                            {
                                type: 'quick_reply',
                                id: 'infoLocal',
                                title: '📍 Localização'
                            },
                            {
                                type: 'quick_reply',
                                id: 'menu',
                                title: 'Voltar ao início'
                            }
                        ]
                    }
                });
                break;
            case "infoLocal":
                await api.post("/messages/text", {
                    to: messageData.from,
                    body: "📍 Estamos localizados na Rua do Bonfim, nº 565, Neópolis-SE."
                });

                await api.post("/messages/interactive", {
                    to: messageData.from,
                    type: "button",
                    body: {
                        text: "ℹ️ Deseja mais alguma informação?"
                    },
                    action: {
                        buttons: [
                            {
                                type: 'quick_reply',
                                id: 'infoHorarios',
                                title: '🕐 Horários'
                            },
                            {
                                type: 'quick_reply',
                                id: 'menu',
                                title: 'Voltar ao início'
                            }
                        ]
                    }
                });
                break;
            case "menu":
                await sendMenu(messageData.from);
                updateStep(messageData.from, "post_greetings");
                break;
            default:
                const message = {
                    to: messageData.from,
                    type: "button",
                    body: {
                        text: "Desculpe, não entendi sua solicitação. Escolha uma das opções abaixo:"
                    },
                    action: {
                        buttons: [
                            {
                                type: 'quick_reply',
                                id: 'infoHorarios',
                                title: '🕐 Horários'
                            },
                            {
                                type: 'quick_reply',
                                id: 'infoLocal',
                                title: '📍 Localização'
                            },
                            {
                                type: 'quick_reply',
                                id: 'menu',
                                title: 'Voltar ao início'
                            }
                        ]
                    }
                };

                try {
                    const response = await api.post('/messages/interactive', message);
                    updateStep(messageData.from, "aguardandoInformacoes");
                    return response;
                } catch (error) {
                    console.error("Erro ao enviar mensagem de informações:", error);
                }
                break;
        }
    }
}

module.exports = otherInfos;