const axios = require('axios');

async function getTripsByDocId(docId) {
    const trips = await axios.get(
        `${process.env.SISAPI_API}/trip/patient/${docId}`,
    )

    return trips.data;
}

module.exports = getTripsByDocId;