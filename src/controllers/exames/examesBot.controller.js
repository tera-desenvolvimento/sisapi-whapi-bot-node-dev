const api = require("../whapi/api.controller");
const updateStep = require('../flux/updateStep.controller');
const validateDocId = require('../misc/validateDocId.controller');
const getExamesByDocId = require('../exames/getExamesByDocId.controller');
const sendMenu = require('../misc/sendMenu.controller');
const transportsBot = require('../transports/transportsBot.controller');
const isTransportes = require('../misc/isTransportes.controller');

const examesBot = async (messageData) => {
    if(messageData.first) {
        const message = {
            to: messageData.from,
            body: "Digita seu CPF no seguinte formato 999.999.999-99, pra que eu possa consultar se seu exame já chegou na Secretaria."
        };

        try {
            const response = await api.post('/messages/text', message);
            updateStep(messageData.from, "aguardandoDocIdResultado");
            return response;
        } catch (error) {
            console.error("Erro ao enviar mensagem de saudação:", error);
            throw error;
        }
    } else if (messageData.messages && messageData.messages[0].type === 'text') {
        const userMessage = messageData.messages[0].text.body;

        if (validateDocId(userMessage)) {
            const exames = await getExamesByDocId(userMessage);

            if (exames && exames.data.length > 0) {
                await api.post("/messages/text", {
                    to: messageData.from,
                    body: `Localizei estes exames que podem ser retirados direto na secretaria 👇🏼\n\n${exames.data.map(exame => `- Tipo: *${exame.type}* - Disponível desde: ${new Date(exame.arrivedDate).toLocaleDateString("pt-BR")}`).join("\n")}\n\nVocê pode retirar na sala de *RESULTADO DE EXAMES* aqui na secretaria, funciona de segunda a sexta das 7h30 as 13h, fica localizada na Rua do Bonfim, 565. Leve seu CPF.`
                });

                updateStep(messageData.from, "post_greetings");
                await sendMenu(messageData.from);
            } else {
                await api.post("/messages/text", {
                    to: messageData.from,
                    body: `Ainda não existe exame disponível para retirada para este CPF 😢, tente realizar outra pesquisa amanhã.\nDeseja saber sobre outro assunto? É só clicar em alguma das opções abaixo`
                });

                updateStep(messageData.from, "post_greetings");
                await sendMenu(messageData.from);
            }
        } else if (isTransportes(userMessage)){
            updateStep(messageData.messages[0].from, "transporte");
            await transportsBot({ from: messageData.messages[0].from, first: true });
        } else {
             const message = {
                to: messageData.from,
                body: "Desculpa, não consegui entender, talvez não esteja no formato correto. Pra que eu possa consultar, preciso que o formato seja 999.999.999-99 (com pontos e traço). Por favor digite novamente."
            };

            try {
                const response = await api.post('/messages/text', message);
                updateStep(messageData.from, "aguardandoDocIdResultado");
                return response;
            } catch (error) {
                console.error("Erro ao enviar mensagem de saudação:", error);
                throw error;
            }
        }
    }
};

module.exports = examesBot;