const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const orderRoutes = require('./routes/order.route');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/orders', orderRoutes);

app.use(errorMiddleware);

module.exports = app;