const Order = require('../models/Order');
const Service = require('../models/Service');
const Job = require('../models/Job');
const { sendNotification } = require('../utils/notificationHelper');

// @desc    Create an order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { serviceId, jobId, amount, orderType, packageType } = req.body;
    
    let providerId;
    if (orderType === 'service') {
      const service = await Service.findById(serviceId);
      if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
      providerId = service.provider;
    } else if (orderType === 'job') {
      const job = await Job.findById(jobId);
      if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
      providerId = job.hiredProvider;
    }

    const order = await Order.create({
      customer: req.user.id,
      provider: providerId,
      service: serviceId,
      job: jobId,
      amount,
      totalAmount: amount, // simplify for now
      orderType,
      packageType
    });

    res.status(201).json({ success: true, data: order });

    // Send notification to provider
    const io = req.app.get('io');
    await sendNotification(io, {
      recipient: providerId,
      type: 'service_ordered',
      title: 'New Order Received',
      message: `You have received a new order for ${orderType === 'service' ? 'your service' : 'a job'}.`,
      data: { orderId: order._id }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'customer') {
      query = { customer: req.user.id };
    } else if (req.user.role === 'provider') {
      query = { provider: req.user.id };
    }

    const orders = await Order.find(query)
      .populate('customer', 'firstName lastName avatar')
      .populate('provider', 'firstName lastName avatar')
      .populate('service', 'title')
      .populate('job', 'title');

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    let order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Authorization: Only provider can update status (usually)
    if (order.provider.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to update this order' });
    }

    order.status = status;
    if (status === 'completed') {
      order.completedAt = Date.now();
    } else if (status === 'delivered') {
      order.deliveredAt = Date.now();
    }

    await order.save();

    // Send notification to customer
    const io = req.app.get('io');
    await sendNotification(io, {
      recipient: order.customer,
      type: `order_${status}`,
      title: 'Order Status Updated',
      message: `Your order status has been updated to: ${status}`,
      data: { orderId: order._id }
    });

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
