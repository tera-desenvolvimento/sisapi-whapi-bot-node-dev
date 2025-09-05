const api = require("../whapi/api.controller");
const updateStep = require('../flux/updateStep.controller');
const validateDocId = require('../misc/validateDocId.controller');
const getTripsByDocId = require('./getTripsByDocId.controller');
const sendMenu = require('../misc/sendMenu.controller');

const transportsBot = async (messageData) => {
    if (messageData.first) {
        const message = {
            to: messageData.from,
            body: "Digita seu CPF no seguinte formato 999.999.999-99, pra que eu possa consultar se existe agendamento no setor de transportes."
        };

        try {
            const response = await api.post('/messages/text', message);
            updateStep(messageData.from, "aguardandoDocIdTransporte");
            return response;
        } catch (error) {
            console.error("Erro ao enviar mensagem de saudação:", error);
            throw error;
        }
    } else if (messageData.messages && messageData.messages[0].type === 'text') {
        const userMessage = messageData.messages[0].text.body;

        if (validateDocId(userMessage)) {
            const trips = await getTripsByDocId(userMessage);

            if (trips && trips.length > 0) {
                await api.post("/messages/text", {
                    to: messageData.from,
                    body: `Localizei ${trips.length} agendamentos para este cpf 😊\n\n${trips.map(agendamento => `Data: ${agendamento.date} - ${agendamento.exitTime}\nDestino: *${agendamento.destination}*`).join("\n")}\n\né importante lembrar que o veículo sai no horário marcado, seja pontual.`
                });

                updateStep(messageData.from, "post_greetings");
                await sendMenu(messageData.from);
            } else {
                await api.post("/messages/text", {
                    to: messageData.from,
                    body: `Não existe agendamento para este CPF 😢, tente realizar outra pesquisa ou consultar diretamente no setor de transportes da secretaria.\nDeseja saber sobre outro assunto? É só clicar em alguma das opções abaixo`
                });

                updateStep(messageData.from, "post_greetings");
                await sendMenu(messageData.from);
            }
        } else {
            const message = {
                to: messageData.from,
                body: "Desculpa, não consegui entender, talvez não esteja no formato correto. Pra que eu possa consultar, preciso que o formato seja 999.999.999-99 (com pontos e traço). Por favor digite novamente."
            };

            try {
                await api.post('/messages/text', message);
                updateStep(messageData.from, "aguardandoDocIdTransporte");
            } catch (error) {
                console.error("Erro ao enviar mensagem de CPF inválido:", error);
                throw error;
            }
        }
    }
};

module.exports = transportsBot;