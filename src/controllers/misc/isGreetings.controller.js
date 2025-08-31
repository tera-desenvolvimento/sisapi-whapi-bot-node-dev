function isGreetings(message) {
    const saudacoes = [
        "oi",
        "ola",
        "bom dia",
        "boa tarde",
        "boa noite",
        "e ai",
        "fala",
        "salve",
        "alo",
        "opa",
        "menu",
        "inicio"
    ];

    const entrada = message.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    console.log(entrada);

    return saudacoes.some(saudacao => entrada.startsWith(saudacao));
}

module.exports = isGreetings;