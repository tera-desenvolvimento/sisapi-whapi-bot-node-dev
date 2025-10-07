require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

const connectDB = require('./controllers/misc/databaseConnection.controller');
const getFluxByChatId = require('./controllers/flux/getFluxByChatId.controller');
const createFlux = require('./controllers/flux/createFlux.controller');
const sendGreetings = require('./controllers/misc/sendGreetings.controller');
const sendMenu = require('./controllers/misc/sendMenu.controller');
const updateStep = require('./controllers/flux/updateStep.controller');
const examesBot = require('./controllers/exames/examesBot.controller');
const transportsBot = require('./controllers/transports/transportsBot.controller');
const transportRequestBot = require('./controllers/transports/transportRequestBot.controller');
const otherInfos = require('./controllers/misc/otherInfos.controller');
const isGreetings = require('./controllers/misc/isGreetings.controller');
const isTransportes = require('./controllers/misc/isTransportes.controller');
const isExames = require('./controllers/misc/isExames.controller');
const handleError = require('./controllers/misc/handleError.controller');
const clearFluxes = require('./controllers/flux/clearFluxes.controller');
const api = require('./controllers/whapi/api.controller');

const sendMessage = require('./controllers/whapi/sendMessage.controller');

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.json({
        message: "Chatbot rodando"
    });
});

async function startApp() {
    await connectDB();

    app.post('/sendMessage', async (req, res) => {
        const { to, message } = req.body;

        const result = await sendMessage(to, message);
        res.json(result);
    });

    app.post('/webhook', async (req, res) => {
        const messageData = req.body;

        if(messageData.statuses) {
            // Ignorar eventos que não sejam mensagens
            return res.sendStatus(200);
        } else if (messageData.messages[0].from_me) {
            //console.log('Mensagem do próprio bot, ignorando...');
            return res.sendStatus(200);
        } else {
            const from = messageData.messages[0].from;

            const flux = await getFluxByChatId(from);

            if(flux.success === false || (messageData.messages[0].type === "text" && isGreetings(messageData.messages[0].text.body))) {
                if(isExames(messageData.messages[0].text.body)) {
                    if(flux.success === false) {
                        createFlux(from, "post_greetings");
                    } else {
                        updateStep(from, "post_greetings");
                    }

                    //console.log("caiu no Exame");
                    updateStep(from, "resultado");
                    await examesBot({ from: from, first: true });
                } else if(isTransportes(messageData.messages[0].text.body)) {
                    if(flux.success === false) {
                        createFlux(from, "post_greetings");
                    } else {
                        updateStep(from, "post_greetings");
                    }

                    updateStep(from, "transporte");
                    await transportsBot({ from: from, first: true });
                } else {
                    if(flux.success === false) {
                        createFlux(from, "post_greetings");
                    } else {
                        updateStep(from, "post_greetings");
                    }

                    await sendGreetings(from);
                    await sendMenu(from);
                }
            } else if (flux.data.step === "post_greetings") {
                if(messageData.messages[0].type === "reply") {
                    const replyOption = messageData.messages[0].reply.buttons_reply.id;

                    switch(replyOption.split(":")[1]) {
                        case "verResultado":
                            updateStep(flux.data.chatId, "resultado");
                            await examesBot({ from: flux.data.chatId, first: true });
                            break;
                        case "consultarTransporte":
                                const message = {
                                    to: flux.data.chatId,
                                    type: "button",
                                    header: {
                                        type: "text",
                                        text: ""
                                    },
                                    body: {
                                        text: "Escolha uma das opções abaixo de acordo com o que você deseja:"
                                    },
                                    footer: {
                                        type: "text",
                                        text: ""
                                    },
                                    action: {
                                        buttons: [
                                            {
                                                type: "quick_reply",
                                                id: "consultarVagasTransporte",
                                                title: "1️⃣ Agendar vaga"
                                            },
                                            {
                                                type: "quick_reply",
                                                id: "consultarAgendamento",
                                                title: "2️⃣ Consultar minha vaga"
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
                        case "consultarAgendamento":
                            updateStep(flux.data.chatId, "transporte");
                            await transportsBot({ from: flux.data.chatId, first: true });
                            break;
                        case "consultarVagasTransporte":
                            updateStep(flux.data.chatId, "consultarVagasTransporte");
                            await transportRequestBot({ from: flux.data.chatId, first: true });
                            break;
                        case "outrasInformacoes":
                            updateStep(flux.data.chatId, "outrasInformacoes");
                            await otherInfos({ from: flux.data.chatId, first: true });
                            break;

                        // Lógica para opção inválida
                        default:
                            updateStep(flux.data.chatId, "opcaoInvalida");
                            break;
                    }
                } else {
                    await handleError(messageData);
                }
            } else if (flux.data.step === "aguardandoDocIdResultado" || flux.data.step === "resultado") {
                await examesBot({ from: flux.data.chatId, messages: messageData.messages });
            } else if (flux.data.step === "aguardandoDocIdTransporte" || flux.data.step === "transporte") {
                await transportsBot({ from: flux.data.chatId, messages: messageData.messages });
            } else if (flux.data.step === "aguardandoInformacoes") {
                await otherInfos({ from: flux.data.chatId, messages: messageData.messages });
            } else if (flux.data.step === "aguardandoDataRequest" || flux.data.step === "aguardandoEscolhaVaga" || flux.data.step === "aguardandoDocIdRequest" || flux.data.step === "aguardandoNomeRequest" || flux.data.step === "aguardandoEnderecoRequest" || flux.data.step === "aguardandoPickupLocationRequest" || flux.data.step === "aguardandoDocProofRequest" || flux.data.step === "aguardandoDesembarqueRequest" ) {
                await transportRequestBot({ from: flux.data.chatId, messages: messageData.messages });
            }
        }
    });

    app.get('/clearFluxes', async (req, res) => {
        await clearFluxes();
        res.json({ message: "Limpeza de fluxos pendentes realizada." });
        
    });

    const PORT = process.env.PORT || 3002;

    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });
}

startApp();