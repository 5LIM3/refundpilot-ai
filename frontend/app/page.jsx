'use client';

import { useEffect, useState } from 'react';

const REASONS = [
  'Item arrived damaged',
  'Wrong item shipped',
  'Changed my mind',
  'No longer needed',
  'Other',
];

export default function CustomerPage() {
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [orderId, setOrderId] = useState('');
  const [reason, setReason] = useState(REASONS[0]);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/refunds/customers')
      .then((r) => r.json())
      .then((data) => {
        setCustomers(data.customers || []);
        setOrders(data.orders || []);
      })
      .catch(() => setError('Could not load customer data. Is the backend running?'));
  }, []);

  const customerOrders = orders.filter((o) => o.customerId === customerId);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setResult(null);
    if (!customerId || !orderId || !message.trim()) {
      setError('Please choose a customer, an order, and describe the issue.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/refunds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, orderId, reason, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
      setResult(data);
      setMessage('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid md:grid-cols-5 gap-10">
      <div className="md:col-span-3">
        <h1 className="text-2xl font-semibold tracking-tight mb-1">Request a refund</h1>
        <p className="text-slate mb-8 max-w-md">
          Tell us what happened and we'll check it against your order and our refund policy right away.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5">Customer (demo account)</label>
            <select
              className="w-full border border-line rounded-lg px-3 py-2 bg-white"
              value={customerId}
              onChange={(e) => { setCustomerId(e.target.value); setOrderId(''); }}
            >
              <option value="">Select a customer…</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name} — {c.email}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Order</label>
            <select
              className="w-full border border-line rounded-lg px-3 py-2 bg-white disabled:opacity-50"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              disabled={!customerId}
            >
              <option value="">Select an order…</option>
              {customerOrders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.item} — ${o.amount.toFixed(2)}{o.finalSale ? ' (final sale)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Reason</label>
            <select
              className="w-full border border-line rounded-lg px-3 py-2 bg-white"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Tell us more</label>
            <textarea
              className="w-full border border-line rounded-lg px-3 py-2 bg-white min-h-[110px]"
              placeholder="Describe what happened with your order…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={2000}
            />
          </div>

          {error && <p className="text-denied text-sm">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="bg-ink text-white rounded-lg px-5 py-2.5 text-sm font-medium disabled:opacity-50"
          >
            {submitting ? 'Checking…' : 'Submit request'}
          </button>
        </form>
      </div>

      <div className="md:col-span-2">
        <div className="border border-line rounded-xl p-5 bg-white sticky top-6">
          <h2 className="text-sm font-medium text-slate mb-3">System response</h2>
          {!result && <p className="text-sm text-slate">Submit a request to see the decision here.</p>}
          {result && (
            <div className="space-y-3">
              <span className={`status-pill status-${result.decision}`}>{result.decision}</span>
              <p className="text-sm leading-relaxed">{result.customerFacingNote}</p>
              <div className="pt-3 border-t border-line">
                <p className="text-xs uppercase tracking-wide text-slate mb-1.5">Why</p>
                <ul className="text-xs text-slate space-y-1 list-disc pl-4">
                  {result.reasons.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
              <p className="font-mono text-[11px] text-slate pt-1">ref: {result.id}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
