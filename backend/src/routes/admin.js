const express = require('express');
const db = require('../db');

const router = express.Router();

// GET /api/admin/requests — recent refund requests with decisions + audit notes
router.get('/requests', (req, res) => {
  const rows = db
    .prepare(
      `SELECT rr.*, c.name as customerName, o.item as orderItem, o.amount as orderAmount
       FROM refund_requests rr
       JOIN customers c ON c.id = rr.customerId
       JOIN orders o ON o.id = rr.orderId
       ORDER BY rr.createdAt DESC`
    )
    .all();

  const requests = rows.map((r) => ({
    ...r,
    policyReasons: JSON.parse(r.policyReasons || '[]'),
    aiFlags: JSON.parse(r.aiFlags || '{}'),
  }));

  const summary = {
    total: requests.length,
    approved: requests.filter((r) => r.decision === 'approved').length,
    denied: requests.filter((r) => r.decision === 'denied').length,
    escalated: requests.filter((r) => r.decision === 'escalated').length,
    flaggedSuspicious: requests.filter((r) => r.aiFlags.suspicious).length,
  };

  res.json({ requests, summary });
});

module.exports = router;
