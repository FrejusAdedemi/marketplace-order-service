const router = require('express').Router();

const auth = require('../middlewares/auth.middleware');
const controller = require('../controllers/order.controller');

router.post('/', auth, controller.createOrder);
router.get('/', auth, controller.getOrders);
router.get('/:id', auth, controller.getOrderById);
router.post('/:id/confirm', auth, controller.confirmOrder);
router.delete('/:id', auth, controller.cancelOrder);

module.exports = router;