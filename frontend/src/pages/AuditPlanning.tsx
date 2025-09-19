import React, { useState } from 'react';
import { useAuditPlans } from '../api/audits';
import type { AuditPlan } from '../types';

const statusLabels: Record<AuditPlan['status'], string> = {
  planned: 'Planned',
  'in-progress': 'In progress',
  complete: 'Complete'
};

export const AuditPlanning: React.FC = () => {
  const { plans, createPlan, updatePlanStatus } = useAuditPlans();
  const [title, setTitle] = useState('');
  const [owner, setOwner] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await createPlan({ title, owner, startDate, endDate });
      setTitle('');
      setOwner('');
      setStartDate('');
      setEndDate('');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, status: AuditPlan['status']) => {
    try {
      await updatePlanStatus(id, status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update plan status');
    }
  };

  return (
    <section>
      <header style={{ marginBottom: '2rem' }}>
        <h1>Audit planning</h1>
        <p>Coordinate engagements, resources and timelines aligned to risk priorities.</p>
      </header>
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginTop: 0 }}>Add engagement</h2>
        <form onSubmit={handleSubmit} className="form-grid" aria-describedby={error ? 'plan-error' : undefined}>
          <div className="form-control">
            <label htmlFor="plan-title">Engagement title</label>
            <input
              id="plan-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </div>
          <div className="form-control">
            <label htmlFor="plan-owner">Owner</label>
            <input
              id="plan-owner"
              value={owner}
              onChange={(event) => setOwner(event.target.value)}
              required
            />
          </div>
          <div className="form-control">
            <label htmlFor="plan-start">Start date</label>
            <input
              id="plan-start"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              required
            />
          </div>
          <div className="form-control">
            <label htmlFor="plan-end">End date</label>
            <input
              id="plan-end"
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              required
            />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            {error ? (
              <p id="plan-error" role="alert" style={{ color: '#b91c1c' }}>
                {error}
              </p>
            ) : null}
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Scheduling…' : 'Schedule engagement'}
            </button>
          </div>
        </form>
      </div>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Engagement roadmap</h2>
        <table className="data-table">
          <caption className="visually-hidden">Upcoming audit engagements</caption>
          <thead>
            <tr>
              <th scope="col">Engagement</th>
              <th scope="col">Owner</th>
              <th scope="col">Schedule</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {plans.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>
                  No engagements scheduled yet.
                </td>
              </tr>
            ) : (
              plans.map((plan) => (
                <tr key={plan.id}>
                  <th scope="row">{plan.title}</th>
                  <td>{plan.owner}</td>
                  <td>
                    <time dateTime={plan.startDate}>{plan.startDate}</time> –{' '}
                    <time dateTime={plan.endDate}>{plan.endDate}</time>
                  </td>
                  <td>
                    <label htmlFor={`status-${plan.id}`} className="visually-hidden">
                      Update status for {plan.title}
                    </label>
                    <select
                      id={`status-${plan.id}`}
                      value={plan.status}
                      onChange={(event) => handleStatusChange(plan.id, event.target.value as AuditPlan['status'])}
                    >
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
