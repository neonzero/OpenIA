import React, { useMemo, useState } from 'react';
import { useFollowUpItems } from '../api/risks';
import type { FollowUpItem } from '../types';

const statusOrder: FollowUpItem['status'][] = ['pending', 'in-progress', 'complete'];

const statusLabel: Record<FollowUpItem['status'], string> = {
  pending: 'Pending',
  'in-progress': 'In progress',
  complete: 'Complete'
};

export const FollowUpTracker: React.FC = () => {
  const [riskId, setRiskId] = useState('');
  const [statusFilter, setStatusFilter] = useState<FollowUpItem['status'] | 'all'>('all');
  const { items } = useFollowUpItems(riskId || undefined);

  const filteredItems = useMemo(() => {
    if (statusFilter === 'all') return items;
    return items.filter((item) => item.status === statusFilter);
  }, [items, statusFilter]);

  const completionRate = useMemo(() => {
    if (!items.length) return 0;
    const completed = items.filter((item) => item.status === 'complete').length;
    return Math.round((completed / items.length) * 100);
  }, [items]);

  return (
    <section>
      <header style={{ marginBottom: '2rem' }}>
        <h1>Follow-up tracker</h1>
        <p>Monitor remediation activities to confirm risk treatments remain effective.</p>
      </header>
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginTop: 0 }}>Filters</h2>
        <div className="form-grid">
          <div className="form-control">
            <label htmlFor="followup-risk">Risk identifier</label>
            <input
              id="followup-risk"
              value={riskId}
              onChange={(event) => setRiskId(event.target.value)}
              placeholder="Enter risk ID"
            />
          </div>
          <div className="form-control">
            <label htmlFor="followup-status">Status</label>
            <select
              id="followup-status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as FollowUpItem['status'] | 'all')}
            >
              <option value="all">All</option>
              {statusOrder.map((status) => (
                <option key={status} value={status}>
                  {statusLabel[status]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <article className="card" aria-label="Completion rate">
        <h2>Remediation progress</h2>
        <p style={{ marginTop: 0 }}>Overall completion rate {completionRate}%.</p>
        <div style={{ height: '12px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${completionRate}%`,
              background: '#0ca678',
              height: '100%'
            }}
            role="presentation"
          />
        </div>
      </article>
      <div className="card" style={{ marginTop: '2rem' }}>
        <h2 style={{ marginTop: 0 }}>Action items</h2>
        <table className="data-table">
          <caption className="visually-hidden">Follow-up actions and due dates</caption>
          <thead>
            <tr>
              <th scope="col">Risk</th>
              <th scope="col">Action</th>
              <th scope="col">Owner</th>
              <th scope="col">Due date</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                  No follow-up actions found.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item.id}>
                  <th scope="row">{item.riskId}</th>
                  <td>{item.action}</td>
                  <td>{item.owner}</td>
                  <td>
                    <time dateTime={item.dueDate}>{item.dueDate}</time>
                  </td>
                  <td>{statusLabel[item.status]}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
