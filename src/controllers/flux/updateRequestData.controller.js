const fluxModel = require("../../models/flux.model");

async function updateRequestData(chatId, field, value) {
    try {
        const flux = await fluxModel.findOneAndUpdate(
            { chatId },
            { [`requestData.${field}`]: value },
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
            message: "Dados de requisição atualizados com sucesso",
            data: flux
        };
    } catch (error) {
        console.error("Erro ao atualizar dados de requisição:", error);
        return {
            status: 200,
            message: "Erro ao atualizar dados de requisição",
            error: error.message
        };
    }
}

module.exports = updateRequestData;