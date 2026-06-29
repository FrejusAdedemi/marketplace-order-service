const axios = require('axios');
const env = require('../config/env');

const stockClient = axios.create({
  baseURL: env.STOCK_SERVICE_URL,
  headers: {
    'X-Internal-Secret': env.INTERNAL_SECRET
  }
});

module.exports = stockClient;