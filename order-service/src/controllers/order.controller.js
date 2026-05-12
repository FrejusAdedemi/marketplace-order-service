const stockClient = require('../utils/stockClient');
const orderService = require('../services/order.service');
const pool = require('../config/db');

// CREATE ORDER
async function createOrder(req, res, next) {
  try {
    const { items } = req.body;

    const { data } = await stockClient.post(
      '/internal/stocks/reserve',
      { items }
    );

    const reservationId = data.reservation_id;

    const total = items.reduce(
      (sum, i) => sum + i.quantity * i.unit_price,
      0
    );

    const order = await orderService.createOrder(
      req.user.sub,
      items,
      reservationId,
      total
    );

    return res.status(201).json(order);
  } catch (err) {
    if (err.response?.status === 409) {
      return res.status(409).json({
        error: 'Commande impossible'
      });
    }
    next(err);
  }
}

// GET ORDERS
async function getOrders(req, res, next) {
  try {
    let query = 'SELECT * FROM orders';
    let params = [];

    if (req.user.role === 'customer') {
      query += ' WHERE user_id = $1';
      params.push(req.user.sub);
    }

    const result = await pool.query(query, params);

    res.json({ data: result.rows });
  } catch (err) {
    next(err);
  }
}

// GET ORDER BY ID (IDOR SAFE)
async function getOrderById(req, res, next) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM orders WHERE id = $1',
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        error: 'Ressource non trouvée'
      });
    }

    const order = result.rows[0];

    if (
      req.user.role === 'customer' &&
      order.user_id !== req.user.sub
    ) {
      return res.status(404).json({
        error: 'Ressource non trouvée'
      });
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
}

// CONFIRM ORDER
async function confirmOrder(req, res, next) {
  try {
    const { id } = req.params;

    const order = await pool.query(
      'SELECT * FROM orders WHERE id = $1',
      [id]
    );

    const reservationId =
      order.rows[0].reservation_id;

    await stockClient.post(
      '/internal/stocks/confirm',
      { reservation_id: reservationId }
    );

    await pool.query(
      `UPDATE orders SET status='confirmed'
       WHERE id=$1`,
      [id]
    );

    res.json({ id, status: 'confirmed' });
  } catch (err) {
    next(err);
  }
}

// CANCEL ORDER
async function cancelOrder(req, res, next) {
  try {
    const { id } = req.params;

    const order = await pool.query(
      'SELECT * FROM orders WHERE id=$1',
      [id]
    );

    const reservationId =
      order.rows[0].reservation_id;

    await stockClient.post(
      '/internal/stocks/release',
      { reservation_id: reservationId }
    );

    await pool.query(
      `UPDATE orders SET status='cancelled'
       WHERE id=$1 AND status='pending'`,
      [id]
    );

    res.json({ message: 'Commande annulée' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  confirmOrder,
  cancelOrder
};