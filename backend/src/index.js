require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

const db = require('./db');
const refundsRouter = require('./routes/refunds');
const adminRouter = require('./routes/admin');

// Auto-seed on first boot if the DB is empty (handy for `docker-compose up`).
const customerCount = db.prepare('SELECT COUNT(*) as n FROM customers').get().n;
if (customerCount === 0) {
  require('./seed');
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '100kb' }));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/refunds', refundsRouter);
app.use('/api/admin', adminRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Refund backend listening on :${PORT}`));
