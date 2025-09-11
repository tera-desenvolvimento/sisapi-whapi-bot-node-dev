const axios = require('axios');

async function getDispoTrips(date) {
    const trips = await axios.post(
        `${process.env.SISAPI_API}/trip/dispo`,
        { date }
    )

    return trips.data;
}

module.exports = getDispoTrips;