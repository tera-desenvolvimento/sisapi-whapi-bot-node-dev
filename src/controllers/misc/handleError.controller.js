const api = require("../whapi/api.controller");
const isExames = require("./isExames.controller");
const isTransportes = require("./isTransportes.controller");
const createFlux = require("../flux/createFlux.controller");
const updateStep = require("../flux/updateStep.controller");
const getFluxByChatId = require("../flux/getFluxByChatId.controller");
const examesBot = require("../exames/examesBot.controller");
const transportsBot = require("../transports/transportsBot.controller");

async function handleError(messageData) {
    const message = {
        to: messageData.messages[0].from,   
        body: "Hmm… não consegui captar o que você quis dizer. Bora tentar de novo?"
    };

    const flux = await getFluxByChatId(messageData.messages[0].from);


     if(isExames(messageData.messages[0].text.body)) {
        if(flux.success === false) {
            createFlux(messageData.messages[0].from, "post_greetings");
        } else {
            updateStep(messageData.messages[0].from, "post_greetings");
        }

        updateStep(messageData.messages[0].from, "resultado");
        await examesBot({ from: messageData.messages[0].from, first: true });
    } else if(isTransportes(messageData.messages[0].text.body)) {
        if(flux.success === false) {
            createFlux(messageData.messages[0].from, "post_greetings");
        } else {
            updateStep(messageData.messages[0].from, "post_greetings");
        }

        updateStep(messageData.messages[0].from, "transporte");
        await transportsBot({ from: messageData.messages[0].from, first: true });
    } else {
        try {
            const response = await api.post('/messages/text', message);
            return response;
        } catch (error) {
            console.error("Erro ao enviar mensagem de saudação:", error);
            throw error;
        }
    }
}

module.exports = handleError;