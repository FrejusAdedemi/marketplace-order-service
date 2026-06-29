const pool = require('../config/db');

async function createOrder(userId, items, reservationId, total) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const orderRes = await client.query(
      `INSERT INTO orders(user_id, status, total_amount, reservation_id)
       VALUES ($1, 'pending', $2, $3)
       RETURNING *`,
      [userId, total, reservationId]
    );

    const order = orderRes.rows[0];

    for (const item of items) {
      await client.query(
        `INSERT INTO order_items(order_id, product_id, store_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          order.id,
          item.product_id,
          item.store_id,
          item.quantity,
          item.unit_price
        ]
      );
    }

    await client.query('COMMIT');

    return order;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

module.exports = {
  createOrder
};