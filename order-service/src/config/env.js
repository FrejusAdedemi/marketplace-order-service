require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3004,
  DATABASE_URL: process.env.DATABASE_URL,
  STOCK_SERVICE_URL: process.env.STOCK_SERVICE_URL,
  INTERNAL_SECRET: process.env.INTERNAL_SECRET,
  JWT_SECRET: process.env.JWT_SECRET
};