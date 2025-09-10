const schedule = require('node-schedule');
const clearFluxes = require('../flux/clearFluxes.controller');

function clearBotFluxes() {
    // Limpando fluxos de whatsapp em aberto todo dia, 2h da madrugada
    const rule = new schedule.RecurrenceRule();
    rule.hour = 2;

    const job = schedule.scheduleJob(rule, async function(){
        await clearFluxes();
    });
}

module.exports = clearBotFluxes;