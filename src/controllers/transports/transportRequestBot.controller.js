const api = require("../whapi/api.controller");
const updateStep = require('../flux/updateStep.controller');
const getFluxByChatId = require('../flux/getFluxByChatId.controller');
const validateDocId = require('../misc/validateDocId.controller');
const getDispoTrips = require('./getDispoTrips.controller');
const getTripRequestsByCar = require('./getTripRequestsByCar.controller');
const updateRequestData = require('../flux/updateRequestData.controller');
const sendMenu = require('../misc/sendMenu.controller');
const axios = require('axios');

const transportRequestBot = async (messageData) => {
    const mainFlux = await getFluxByChatId(messageData.from);

    if (messageData.first) {
        const message = {
            to: messageData.from,
            body: "Olá! Para consultar vagas de transporte, por favor, informe a data desejada no formato DD/MM/AAAA."
        };

        try {
            const response = await api.post('/messages/text', message);
            updateStep(messageData.from, "aguardandoDataRequest");
            return response;
        } catch (error) {
            console.error("Error sending message:", error);
        }
    } else if (messageData.messages && messageData.messages[0].type === 'text') {
        const userMessage = messageData.messages[0].text.body;

        // Validate date format (DD/MM/YYYY) 
        const datePattern = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
        if (datePattern.test(userMessage)) {
            const dispoTrips = await getDispoTrips(userMessage);
            const availableSeats = dispoTrips.availableSeats;

            updateRequestData(messageData.from, 'tripDate', userMessage);

            const message= {
                to: messageData.from,
                type: "button",
                header: {
                    type: "text",
                    text: ""
                },
                body: {
                    text: "Escolha uma das opções abaixo para solicitar uma vaga:"
                },
                footer: {
                    type: "text",
                    text: ""
                },
                action: {
                    buttons: availableSeats.map(vehicle => {
                        if(vehicle.availableSeats > 0) {
                            return {
                                type: "quick_reply",
                                id: `agendar_${vehicle.exitTime}_${vehicle.destination}`,
                                title: `${vehicle.destination} - Saída: ${vehicle.exitTime} - Vagas: ${vehicle.availableSeats}`
                            };
                        }
                    })
                }
            };

            try {
                const response = await api.post('/messages/interactive', message);
                updateStep(messageData.from, "aguardandoEscolhaVaga");
                return response;
            } catch (error) {
                console.error("Error sending message:", error);
            }

        } else if (mainFlux.data.step === "aguardandoDocIdRequest") {
            const isValid = validateDocId(userMessage);
            
            if (isValid) {
                updateRequestData(messageData.from, 'docId', userMessage);

                const message = {
                    to: messageData.from,
                    body: `Obrigado! Recebemos seu CPF como ${userMessage}.\n\nAgora nos informe seu nome completo:`
                };

                try {
                    const response = await api.post('/messages/text', message);
                    updateStep(messageData.from, "aguardandoNomeRequest");
                    return response;
                } catch (error) {
                    console.error("Error sending message:", error);
                }
            } else {
                const message = {
                    to: messageData.from,
                    body: "O CPF informado é inválido. Por favor, envie um CPF válido no formato XXX.XXX.XXX-XX."
                };

                try {
                    const response = await api.post('/messages/text', message);
                    return response;
                } catch (error) {
                    console.error("Error sending message:", error);
                }
            }
        } else if (mainFlux.data.step === "aguardandoNomeRequest") {
            updateRequestData(messageData.from, 'name', userMessage.toUpperCase());

            const message = {
                to: messageData.from,
                body: `Obrigado, ${userMessage.split(" ")[0]}!\n\nAgora nos informe seu endereço completo (rua, número):`
            };

            try {
                const response = await api.post('/messages/text', message);
                updateStep(messageData.from, "aguardandoEnderecoRequest");
                return response;
            } catch (error) {
                console.error("Error sending message:", error);
            }
        } else if (mainFlux.data.step === "aguardandoEnderecoRequest") {
            updateRequestData(messageData.from, 'address', userMessage.toUpperCase());

            const message = {
                to: messageData.from,
                body: `Estamos quase lá!\n\nMe informa um ponto de referência onde possamos te buscar?`
            };

            try {
                const response = await api.post('/messages/text', message);
                updateStep(messageData.from, "aguardandoPickupLocationRequest");
                return response;
            } catch (error) {
                console.error("Error sending message:", error);
            }
        } else if (mainFlux.data.step === "aguardandoPickupLocationRequest") {
            updateRequestData(messageData.from, 'pickupLocation', userMessage.toUpperCase());

            const message = {
                to: messageData.from,
                body: `Só mais uma coisa:\n\nMe envia por favor a foto de um documento que comprove a necessidade de agendamento do seu transporte (ex: solicitação de exame, receita médica ou outro documento similar).`
            };

            try {
                const response = await api.post('/messages/text', message);
                updateStep(messageData.from, "aguardandoDocProofRequest");
                return response;
            } catch (error) {
                console.error("Error sending message:", error);
            }
        }
    } else if (messageData.messages && messageData.messages[0].type === 'reply') {
        const replyOption = messageData.messages[0].reply.buttons_reply.id;
        const flux = await getFluxByChatId(messageData.from);

        if (replyOption.startsWith('ButtonsV3:agendar')) {
            const exitTime = replyOption.split('_')[1];
            const destination = replyOption.split('_')[2];

            updateRequestData(messageData.from, 'exitTime', exitTime);
            updateRequestData(messageData.from, 'destination', destination);
            const message = {
                to: messageData.from,
                body: `Você selecionou o transporte com saída às ${exitTime} com destino à ${destination}.\n\nVamos precisar de mais algumas informações para completar sua solicitação.\n\nPor favor, informe seu CPF no formato XXX.XXX.XXX-XX.`
            };

            try {
                const response = await api.post('/messages/text', message);
                updateStep(messageData.from, "aguardandoDocIdRequest");
                return response;
            } catch (error) {
                console.error("Error sending message:", error);
            }
        }
    } else if (messageData.messages && messageData.messages[0].type === 'image') {
        if (mainFlux.data.step === "aguardandoDocProofRequest") {
            const imageId = messageData.messages[0].image.id;
            updateRequestData(messageData.from, 'shedulingDocumentImage', imageId).then(async () =>{
                await axios.post(`${process.env.SISAPI_API}/trip/request/create`,
                    {
                        name: mainFlux.data.requestData.name,
                        docId: mainFlux.data.requestData.docId,
                        tripDate: mainFlux.data.requestData.tripDate,
                        exitTime: mainFlux.data.requestData.exitTime,
                        address: mainFlux.data.requestData.address,
                        phone: mainFlux.data.chatId,
                        pickupLocation: mainFlux.data.requestData.pickupLocation,
                        destination: mainFlux.data.requestData.destination,
                        shedulingDocumentImage: imageId
                    }   
                )
                
                const tripRequests = await getTripRequestsByCar(mainFlux.data.requestData.tripDate, mainFlux.data.requestData.exitTime);

                const message = {
                    to: messageData.from,
                    body: `Obrigado! Sua solicitação de transporte foi registrada com sucesso.\n\n Você solicitou uma vaga para o dia ${mainFlux.data.requestData.tripDate}, com saída às ${mainFlux.data.requestData.exitTime} para ${mainFlux.data.requestData.destination}.\n\nA quantidade atual de solicitações para este carro é de ${tripRequests.requestsCount}. Em breve entraremos em contato com mais detalhes sobre a sua solicitação.`
                };

                try {
                    await api.post('/messages/text', message);
                    await sendMenu(messageData.from);
                    updateStep(messageData.from, "post_greetings");
                } catch (error) {
                    console.error("Error sending message:", error);
                }
            });
        }
    }
}

module.exports = transportRequestBot;