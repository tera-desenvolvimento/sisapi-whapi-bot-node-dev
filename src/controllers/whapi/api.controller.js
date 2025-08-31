const axios = require("axios");

const api = axios.create({
  baseURL: `https://gate.whapi.cloud`,
  headers: {
    'Authorization': `Bearer ${process.env.WHAPI_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

module.exports = api;