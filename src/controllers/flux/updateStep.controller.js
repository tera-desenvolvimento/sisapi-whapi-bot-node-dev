const fluxModel = require("../../models/flux.model");

async function updateStep(chatId, newStep) {
    try {
        const flux = await fluxModel.findOneAndUpdate(
            { chatId },
            { step: newStep },
            { new: false }
        );

        if (!flux) {
            return {
                status: 200,
                message: "Fluxo não encontrado"
            };
        }

        return {
            status: 200,
            message: "Fluxo atualizado com sucesso",
            data: flux
        };
    } catch (error) {
        console.error("Erro ao atualizar fluxo:", error);
        return {
            status: 200,
            message: "Erro ao atualizar fluxo",
            error: error.message
        };
    }
}

module.exports = updateStep;
