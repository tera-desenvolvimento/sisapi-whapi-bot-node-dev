function isExames(message) {
    const matchs = [
        "exame",
        "exames",
        "resultado",
        "resultados",
        "laudo",
        "analise",
        "relatorio",
        "testagem",
        "teste",
        "diagnostico"
    ];

    const entrada = message.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    
    return matchs.some(pattern => entrada.includes(pattern));
}

module.exports = isExames;