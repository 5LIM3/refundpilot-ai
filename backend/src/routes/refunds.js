const express = require('express');
const { nanoid } = require('nanoid');
const db = require('../db');
const { evaluatePolicy } = require('../policy');
const { analyzeRequest, detectInjectionAttempt } = require('../aiService');

const router = express.Router();

// POST /api/refunds — customer submits a refund request
router.post('/', async (req, res) => {
  const { customerId, orderId, reason, message } = req.body || {};

  if (!customerId || !orderId || !reason || !message) {
    return res.status(400).json({ error: 'customerId, orderId, reason, and message are all required.' });
  }
  if (message.length > 2000) {
    return res.status(400).json({ error: 'message is too long (max 2000 characters).' });
  }

  const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(customerId);
  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND customerId = ?').get(orderId, customerId);

  if (!customer) {
    return res.status(404).json({ error: 'Customer not found.' });
  }

  // Policy engine decides FIRST, deterministically, from real order data —
  // never from the free-text message alone.
  let { decision, reasons } = evaluatePolicy(order, customer, { reason });

  // Independent injection check on top of the AI layer's own check, applied
  // directly to raw input before it ever reaches a model.
  const injectionAttempt = detectInjectionAttempt(message) || detectInjectionAttempt(reason);
  if (injectionAttempt && decision === 'approved') {
    decision = 'escalated';
    reasons = [...reasons, 'Message flagged for suspicious/override language — routed to human review regardless of policy outcome.'];
  }

  const ai = await analyzeRequest({ message, decision, reasons });

  const id = `req_${nanoid(10)}`;
  const record = {
    id,
    customerId,
    orderId,
    reason,
    message,
    decision,
    policyReasons: JSON.stringify(reasons),
    aiSummary: ai.summary,
    aiFlags: JSON.stringify({ suspicious: ai.suspicious || injectionAttempt, suspicionReason: ai.suspicionReason, mode: ai.mode }),
    createdAt: new Date().toISOString(),
  };

  db.prepare(
    `INSERT INTO refund_requests (id, customerId, orderId, reason, message, decision, policyReasons, aiSummary, aiFlags, createdAt)
     VALUES (@id, @customerId, @orderId, @reason, @message, @decision, @policyReasons, @aiSummary, @aiFlags, @createdAt)`
  ).run(record);

  res.status(201).json({
    id,
    decision,
    reasons,
    customerFacingNote: ai.customerFacingNote,
  });
});

// GET /api/refunds/customers — list customers + orders, for the request form
router.get('/customers', (req, res) => {
  const customers = db.prepare('SELECT id, name, email FROM customers').all();
  const orders = db.prepare('SELECT id, customerId, item, amount, deliveredAt, finalSale, opened FROM orders').all();
  res.json({ customers, orders });
});

module.exports = router;
