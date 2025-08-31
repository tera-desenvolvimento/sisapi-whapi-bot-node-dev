const fluxModel = require("../../models/flux.model");

async function createFlux(chatId, step) {
    try {
        const newFlux = new fluxModel({
            chatId,
            step
        });

        await newFlux.save();

        return {
            success: true,
            message: "Fluxo criado com sucesso",
            flux: newFlux
        };
    } catch (error) {
        console.error("Erro ao criar fluxo:", error);
        return {
            success: false,
            message: "Erro ao criar fluxo",
            error: error.message
        };
    }
}

module.exports = createFlux;