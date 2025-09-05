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
const otherInfos = require('./controllers/misc/otherInfos.controller');
const isGreetings = require('./controllers/misc/isGreetings.controller');
const handleError = require('./controllers/misc/handleError.controller');

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
            console.log('Mensagem do próprio bot, ignorando...');
            return res.sendStatus(200);
        } else {
            const from = messageData.messages[0].from;

            const flux = await getFluxByChatId(from);

            if(flux.success === false || (messageData.messages[0].type === "text" && isGreetings(messageData.messages[0].text.body))) {
                const flux = await getFluxByChatId(from);

                if(flux.success === false) {
                    createFlux(from, "post_greetings");

                    await sendGreetings(from);
                    await sendMenu(from);
                } else {
                    updateStep(from, "post_greetings");

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
                        case "consultarAgendamento":
                            updateStep(flux.data.chatId, "transporte");
                            await transportsBot({ from: flux.data.chatId, first: true });
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
                    await handleError(flux.data.chatId);
                    updateStep(from, "post_greetings");
                    await sendMenu(flux.data.chatId);
                }
            } else if (flux.data.step === "aguardandoDocIdResultado") {
                await examesBot({ from: flux.data.chatId, messages: messageData.messages });
            } else if (flux.data.step === "aguardandoDocIdTransporte") {
                await transportsBot({ from: flux.data.chatId, messages: messageData.messages });
            } else if (flux.data.step === "aguardandoInformacoes") {
                await otherInfos({ from: flux.data.chatId, messages: messageData.messages });
            }
        }
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });
}

startApp();