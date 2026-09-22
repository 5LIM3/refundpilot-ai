'use client';

import { useEffect, useState } from 'react';

export default function AdminPage() {
  const [data, setData] = useState({ requests: [], summary: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/requests');
      const json = await res.json();
      setData(json);
    } catch {
      setError('Could not load requests. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const { requests, summary } = data;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight mb-1">Support dashboard</h1>
          <p className="text-slate text-sm">Recent refund requests, decisions, and audit notes.</p>
        </div>
        <button onClick={load} className="text-sm border border-line rounded-lg px-3 py-1.5 hover:bg-white">
          Refresh
        </button>
      </div>

      {summary && (
        <div className="grid grid-cols-5 gap-3 mb-8">
          <StatCard label="Total" value={summary.total} />
          <StatCard label="Approved" value={summary.approved} accent="approved" />
          <StatCard label="Denied" value={summary.denied} accent="denied" />
          <StatCard label="Escalated" value={summary.escalated} accent="escalated" />
          <StatCard label="Flagged" value={summary.flaggedSuspicious} />
        </div>
      )}

      {error && <p className="text-denied text-sm">{error}</p>}
      {loading && <p className="text-slate text-sm">Loading…</p>}

      <div className="space-y-3">
        {requests.map((r) => (
          <div key={r.id} className="border border-line rounded-xl p-4 bg-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`status-pill status-${r.decision}`}>{r.decision}</span>
                  {r.aiFlags?.suspicious && (
                    <span className="status-pill" style={{ background: '#F3EAFB', color: '#7A2FB4', borderColor: '#E1C7F2' }}>
                      flagged
                    </span>
                  )}
                  <span className="text-xs text-slate font-mono">{r.aiFlags?.mode === 'live' ? 'AI: live' : 'AI: mock'}</span>
                </div>
                <p className="font-medium text-sm">{r.customerName} — {r.orderItem} (${r.orderAmount.toFixed(2)})</p>
                <p className="text-sm text-slate mt-1 max-w-2xl">"{r.message}"</p>
              </div>
              <span className="text-xs text-slate font-mono whitespace-nowrap">{new Date(r.createdAt).toLocaleString()}</span>
            </div>

            <div className="mt-3 pt-3 border-t border-line grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate mb-1">Policy reasoning</p>
                <ul className="text-xs text-slate space-y-1 list-disc pl-4">
                  {r.policyReasons.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate mb-1">AI summary</p>
                <p className="text-xs text-slate">{r.aiSummary}</p>
                {r.aiFlags?.suspicionReason && (
                  <p className="text-xs mt-1" style={{ color: '#7A2FB4' }}>⚠ {r.aiFlags.suspicionReason}</p>
                )}
              </div>
            </div>
          </div>
        ))}
        {!loading && requests.length === 0 && (
          <p className="text-sm text-slate">No refund requests yet — submit one from the customer page.</p>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  const color = accent === 'approved' ? '#1F7A5C' : accent === 'denied' ? '#A83232' : accent === 'escalated' ? '#B4791F' : '#14171F';
  return (
    <div className="border border-line rounded-xl p-4 bg-white">
      <p className="text-xs uppercase tracking-wide text-slate mb-1">{label}</p>
      <p className="text-2xl font-mono font-medium" style={{ color }}>{value}</p>
    </div>
  );
}
