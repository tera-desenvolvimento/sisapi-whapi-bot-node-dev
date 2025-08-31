const axios = require('axios');

async function getExamesByDocId(docId) {
    const exames = await axios.post(
        `${process.env.SISAPI_API}/exame/listPacientExames`,
        {docId}
    )

    return exames.data;
}

module.exports = getExamesByDocId;