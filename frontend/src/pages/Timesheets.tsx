import React, { useMemo, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useTimesheets } from '../api/audits';
import type { TimesheetEntry } from '../types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export const Timesheets: React.FC = () => {
  const { entries, submitEntry } = useTimesheets();
  const [auditor, setAuditor] = useState('');
  const [date, setDate] = useState('');
  const [hours, setHours] = useState('');
  const [engagement, setEngagement] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalHours = useMemo(() => entries.reduce((sum, item) => sum + item.hours, 0), [entries]);

  const chartData = useMemo(() => {
    const grouped = entries.reduce<Record<string, number>>((acc, entry) => {
      acc[entry.engagement] = (acc[entry.engagement] ?? 0) + entry.hours;
      return acc;
    }, {});

    return {
      labels: Object.keys(grouped),
      datasets: [
        {
          label: 'Hours recorded',
          data: Object.values(grouped),
          backgroundColor: 'rgba(11, 114, 133, 0.6)',
          borderRadius: 12
        }
      ]
    };
  }, [entries]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const payload: Partial<TimesheetEntry> = {
      auditor,
      date,
      hours: Number(hours),
      engagement
    };

    try {
      await submitEntry(payload);
      setAuditor('');
      setDate('');
      setHours('');
      setEngagement('');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit timesheet');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section>
      <header style={{ marginBottom: '2rem' }}>
        <h1>Timesheets</h1>
        <p>Track utilisation by engagement to optimise coverage and budgets.</p>
      </header>
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginTop: 0 }}>Log effort</h2>
        <form onSubmit={handleSubmit} className="form-grid" aria-describedby={error ? 'timesheet-error' : undefined}>
          <div className="form-control">
            <label htmlFor="timesheet-auditor">Auditor</label>
            <input
              id="timesheet-auditor"
              value={auditor}
              onChange={(event) => setAuditor(event.target.value)}
              required
            />
          </div>
          <div className="form-control">
            <label htmlFor="timesheet-date">Date</label>
            <input
              id="timesheet-date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </div>
          <div className="form-control">
            <label htmlFor="timesheet-hours">Hours</label>
            <input
              id="timesheet-hours"
              type="number"
              min={0}
              step="0.25"
              value={hours}
              onChange={(event) => setHours(event.target.value)}
              required
            />
          </div>
          <div className="form-control">
            <label htmlFor="timesheet-engagement">Engagement</label>
            <input
              id="timesheet-engagement"
              value={engagement}
              onChange={(event) => setEngagement(event.target.value)}
              required
            />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            {error ? (
              <p id="timesheet-error" role="alert" style={{ color: '#b91c1c' }}>
                {error}
              </p>
            ) : null}
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Save entry'}
            </button>
          </div>
        </form>
      </div>
      <div className="card-grid">
        <article className="card" aria-label="Total hours">
          <h2>Total hours this period</h2>
          <p style={{ fontSize: '2.5rem', margin: 0 }}>{totalHours.toFixed(1)}</p>
          <p style={{ color: '#4b5563' }}>Inclusive of all logged engagements</p>
        </article>
        <article className="chart-card" aria-label="Hours by engagement chart">
          <h2 style={{ marginTop: 0 }}>Hours by engagement</h2>
          <Bar
            data={chartData}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Hours' } }
              }
            }}
            aria-label="Bar chart of hours by engagement"
            role="img"
          />
        </article>
      </div>
      <div className="card" style={{ marginTop: '2rem' }}>
        <h2 style={{ marginTop: 0 }}>Detailed entries</h2>
        <table className="data-table">
          <caption className="visually-hidden">Timesheet entries</caption>
          <thead>
            <tr>
              <th scope="col">Auditor</th>
              <th scope="col">Engagement</th>
              <th scope="col">Date</th>
              <th scope="col">Hours</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>
                  No entries recorded.
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.id}>
                  <th scope="row">{entry.auditor}</th>
                  <td>{entry.engagement}</td>
                  <td>
                    <time dateTime={entry.date}>{entry.date}</time>
                  </td>
                  <td>{entry.hours.toFixed(1)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
