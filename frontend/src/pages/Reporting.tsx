import React, { useMemo, useState } from 'react';
import { useReportDetails, useReports } from '../api/reports';
import type { ReportSummary } from '../types';

const statusLabel: Record<ReportSummary['status'], string> = {
  draft: 'Draft',
  issued: 'Issued'
};

export const Reporting: React.FC = () => {
  const [status, setStatus] = useState<ReportSummary['status'] | 'all'>('all');
  const [selectedReportId, setSelectedReportId] = useState<string | undefined>(undefined);
  const { reports, generateReport } = useReports(status === 'all' ? undefined : { status });
  const { report } = useReportDetails(selectedReportId);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const issuedCount = useMemo(() => reports.filter((item) => item.status === 'issued').length, [reports]);

  const handleGenerate = async (id: string) => {
    setMessage(null);
    setError(null);
    try {
      const generated = await generateReport(id);
      setMessage(`Report ${generated.title} generated successfully.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to generate report.');
    }
  };

  return (
    <section>
      <header style={{ marginBottom: '2rem' }}>
        <h1>Reporting</h1>
        <p>Deliver timely updates to stakeholders with curated assurance insights.</p>
      </header>
      <div className="card-grid" style={{ marginBottom: '2rem' }}>
        <article className="card">
          <h2>Published reports</h2>
          <p style={{ fontSize: '2.5rem', margin: 0 }}>{issuedCount}</p>
          <p style={{ color: '#4b5563' }}>Reports issued in the current period</p>
        </article>
        <article className="card">
          <h2>Active drafts</h2>
          <p style={{ fontSize: '2.5rem', margin: 0 }}>{reports.length - issuedCount}</p>
          <p style={{ color: '#4b5563' }}>Reports in progress awaiting approval</p>
        </article>
      </div>
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginTop: 0 }}>Report library</h2>
        <div className="form-control" style={{ maxWidth: '240px' }}>
          <label htmlFor="report-status">Filter by status</label>
          <select
            id="report-status"
            value={status}
            onChange={(event) => setStatus(event.target.value as ReportSummary['status'] | 'all')}
          >
            <option value="all">All</option>
            <option value="draft">Draft</option>
            <option value="issued">Issued</option>
          </select>
        </div>
        {message ? (
          <p role="status" style={{ color: '#0ca678' }}>
            {message}
          </p>
        ) : null}
        {error ? (
          <p role="alert" style={{ color: '#b91c1c' }}>
            {error}
          </p>
        ) : null}
        <table className="data-table" style={{ marginTop: '1rem' }}>
          <caption className="visually-hidden">Reports and generation controls</caption>
          <thead>
            <tr>
              <th scope="col">Title</th>
              <th scope="col">Owner</th>
              <th scope="col">Issued</th>
              <th scope="col">Status</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                  No reports match the selected filters.
                </td>
              </tr>
            ) : (
              reports.map((item) => (
                <tr key={item.id}>
                  <th scope="row">{item.title}</th>
                  <td>{item.owner}</td>
                  <td>
                    <time dateTime={item.issuedDate}>{item.issuedDate}</time>
                  </td>
                  <td>{statusLabel[item.status]}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button type="button" onClick={() => setSelectedReportId(item.id)}>
                        View
                      </button>
                      <button type="button" onClick={() => handleGenerate(item.id)}>
                        Generate
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {report ? (
        <article className="card" aria-live="polite">
          <h2 style={{ marginTop: 0 }}>{report.title}</h2>
          <p>
            Owned by <strong>{report.owner}</strong> — issued on{' '}
            <time dateTime={report.issuedDate}>{report.issuedDate}</time>
          </p>
          <p>Status: {statusLabel[report.status]}</p>
        </article>
      ) : null}
    </section>
  );
};
