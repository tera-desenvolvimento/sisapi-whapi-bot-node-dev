const fluxModel = require("../../models/flux.model");

async function getFluxByChatId(chatId) {
    try {
        const flux = await fluxModel.findOne({ chatId });

        if (!flux) {
            return {
                success: false,
                message: "Fluxo não encontrado"
            };
        }

        return {
            success: true,
            message: "Fluxo encontrado",
            data: flux
        };
    } catch (error) {
        console.error("Erro ao buscar fluxo:", error);
        return {
            success: false,
            message: "Erro ao buscar fluxo",
            error: error.message
        };
    }
}

module.exports = getFluxByChatId;
