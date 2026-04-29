const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory store (replace with DB in production)
let orders = [
  { id: uuidv4(), customer: 'Rahul Sharma', item: 'Butter Chicken + Naan', amount: 349, status: 'delivered', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), restaurant: 'Punjabi Tadka', city: 'Mumbai' },
  { id: uuidv4(), customer: 'Priya Singh', item: 'Masala Dosa + Filter Coffee', amount: 189, status: 'delivered', createdAt: new Date(Date.now() - 86400000).toISOString(), restaurant: 'South Spice', city: 'Bengaluru' },
  { id: uuidv4(), customer: 'Amit Kumar', item: 'Biryani Combo', amount: 429, status: 'preparing', createdAt: new Date(Date.now() - 3600000).toISOString(), restaurant: 'Hyderabadi House', city: 'Hyderabad' },
  { id: uuidv4(), customer: 'Sneha Patel', item: 'Paneer Tikka + Roti', amount: 299, status: 'out_for_delivery', createdAt: new Date(Date.now() - 1800000).toISOString(), restaurant: 'Spice Garden', city: 'Delhi' },
  { id: uuidv4(), customer: 'Vikram Nair', item: 'Veg Thali', amount: 199, status: 'placed', createdAt: new Date(Date.now() - 600000).toISOString(), restaurant: 'Gujarati Bhavan', city: 'Ahmedabad' },
];

const VALID_STATUSES = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

// ─── ROUTES ───────────────────────────────────────────────

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime().toFixed(1) + 's', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// API info
app.get('/api', (req, res) => {
  res.json({
    name: 'OrderFlow API',
    version: '1.0.0',
    author: 'Nikhil Pandey',
    description: 'High-throughput order management REST API',
    endpoints: {
      'GET /api/orders': 'List all orders (supports ?status= and ?city= filters)',
      'POST /api/orders': 'Create a new order',
      'GET /api/orders/:id': 'Get order by ID',
      'PATCH /api/orders/:id/status': 'Update order status',
      'DELETE /api/orders/:id': 'Cancel order',
      'GET /api/stats': 'Get order statistics',
    }
  });
});

// GET all orders with optional filters
app.get('/api/orders', (req, res) => {
  let result = [...orders];
  if (req.query.status) result = result.filter(o => o.status === req.query.status);
  if (req.query.city) result = result.filter(o => o.city?.toLowerCase() === req.query.city.toLowerCase());
  result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ success: true, count: result.length, data: result });
});

// POST create order
app.post('/api/orders', (req, res) => {
  const { customer, item, amount, restaurant, city } = req.body;
  if (!customer || !item || !amount) {
    return res.status(400).json({ success: false, error: 'customer, item, and amount are required' });
  }
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ success: false, error: 'amount must be a positive number' });
  }
  const order = { id: uuidv4(), customer, item, amount, restaurant: restaurant || 'Unknown', city: city || 'Unknown', status: 'placed', createdAt: new Date().toISOString() };
  orders.unshift(order);
  res.status(201).json({ success: true, data: order });
});

// GET single order
app.get('/api/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
  res.json({ success: true, data: order });
});

// PATCH update status
app.patch('/api/orders/:id/status', (req, res) => {
  const { status } = req.body;
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ success: false, error: `Invalid status. Valid: ${VALID_STATUSES.join(', ')}` });
  }
  const idx = orders.findIndex(o => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, error: 'Order not found' });
  orders[idx].status = status;
  orders[idx].updatedAt = new Date().toISOString();
  res.json({ success: true, data: orders[idx] });
});

// DELETE cancel order
app.delete('/api/orders/:id', (req, res) => {
  const idx = orders.findIndex(o => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, error: 'Order not found' });
  orders[idx].status = 'cancelled';
  res.json({ success: true, message: 'Order cancelled', data: orders[idx] });
});

// GET stats
app.get('/api/stats', (req, res) => {
  const total = orders.length;
  const revenue = orders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.amount, 0);
  const byStatus = VALID_STATUSES.reduce((acc, s) => ({ ...acc, [s]: orders.filter(o => o.status === s).length }), {});
  const avgOrder = total > 0 ? Math.round(orders.reduce((s, o) => s + o.amount, 0) / total) : 0;
  res.json({ success: true, data: { total, revenue, avgOrderValue: avgOrder, byStatus } });
});

// Serve dashboard for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`OrderFlow API running on http://localhost:${PORT}`));