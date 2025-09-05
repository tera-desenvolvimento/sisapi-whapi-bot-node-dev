function isTransportes(message) {
    const matchs = [
        "transporte",
        "van",
        "onibus",
        "carro",
        "veiculo",
        "ambulancia",
        "conducao"
    ];

    const entrada = message.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");

    return matchs.some(pattern => entrada.includes(pattern));
}

module.exports = isTransportes;