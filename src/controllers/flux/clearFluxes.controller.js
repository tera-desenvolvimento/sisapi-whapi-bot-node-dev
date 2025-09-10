const fluxModel = require("../../models/flux.model");

async function clearFluxes() {
    try {
        const data = await fluxModel.deleteMany()

        console.log(data)
    } catch (error) {
        console.log("Erro ao realizar a limpeza de fluxos pendentes: ", error)
    }
}

module.exports = clearFluxes;