const axios = require('axios');

async function getTripRequestsByCar(tripDate, exitTime) {
    const trips = await axios.post(
        `${process.env.SISAPI_API}/trip/request/carRequests`,
        { tripDate, exitTime }
    )

    return trips.data;
}

module.exports = getTripRequestsByCar;