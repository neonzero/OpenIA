import React, { useMemo, useState } from 'react';
import { useWorkingPapers } from '../api/audits';
import type { WorkingPaper } from '../types';

const statusToBadge: Record<WorkingPaper['status'], string> = {
  draft: 'badge--warning',
  review: 'badge--danger',
  approved: 'badge--success'
};

export const WorkingPapers: React.FC = () => {
  const [auditId, setAuditId] = useState('');
  const { papers, updateStatus } = useWorkingPapers(auditId || undefined);
  const [selectedPaper, setSelectedPaper] = useState<WorkingPaper | null>(null);

  const lastUpdated = useMemo(() => {
    if (!papers.length) return null;
    return papers.reduce((latest, paper) => (paper.updatedAt > latest.updatedAt ? paper : latest));
  }, [papers]);

  const handleStatusChange = async (paper: WorkingPaper, status: WorkingPaper['status']) => {
    await updateStatus(paper.id, status);
  };

  return (
    <section>
      <header style={{ marginBottom: '2rem' }}>
        <h1>Working papers</h1>
        <p>Maintain fieldwork evidence, review notes and approvals.</p>
      </header>
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginTop: 0 }}>Filter by engagement</h2>
        <div className="form-control" style={{ maxWidth: '320px' }}>
          <label htmlFor="audit-filter">Audit identifier</label>
          <input
            id="audit-filter"
            value={auditId}
            onChange={(event) => setAuditId(event.target.value)}
            placeholder="Enter engagement ID"
          />
        </div>
        {lastUpdated ? (
          <p style={{ marginTop: '1rem', color: '#4b5563' }}>
            Latest update: <strong>{lastUpdated.name}</strong> on{' '}
            <time dateTime={lastUpdated.updatedAt}>{lastUpdated.updatedAt}</time>
          </p>
        ) : null}
      </div>
      <div className="card-grid">
        {papers.map((paper) => (
          <article className="card" key={paper.id}>
            <h2 style={{ marginTop: 0 }}>{paper.name}</h2>
            <p style={{ color: '#4b5563' }}>Owner: {paper.owner}</p>
            <p>
              <span className={`badge ${statusToBadge[paper.status]}`}>{paper.status.toUpperCase()}</span>
            </p>
            <p style={{ color: '#4b5563' }}>
              Updated <time dateTime={paper.updatedAt}>{paper.updatedAt}</time>
            </p>
            <button type="button" onClick={() => setSelectedPaper(paper)}>
              View details
            </button>
            <div style={{ marginTop: '1rem' }}>
              <label htmlFor={`paper-status-${paper.id}`} className="visually-hidden">
                Update status for {paper.name}
              </label>
              <select
                id={`paper-status-${paper.id}`}
                value={paper.status}
                onChange={(event) => handleStatusChange(paper, event.target.value as WorkingPaper['status'])}
              >
                <option value="draft">Draft</option>
                <option value="review">In review</option>
                <option value="approved">Approved</option>
              </select>
            </div>
          </article>
        ))}
      </div>
      {papers.length === 0 ? (
        <p>No working papers found for the selected engagement.</p>
      ) : null}
      {selectedPaper ? (
        <div role="dialog" aria-modal="true" aria-labelledby="paper-dialog-title" style={{ marginTop: '2rem', background: '#fff', padding: '2rem', borderRadius: '1rem', boxShadow: '0 20px 40px rgba(15, 23, 42, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 id="paper-dialog-title" style={{ margin: 0 }}>{selectedPaper.name}</h2>
            <button type="button" onClick={() => setSelectedPaper(null)}>
              Close
            </button>
          </div>
          <dl>
            <div>
              <dt>Owner</dt>
              <dd>{selectedPaper.owner}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{selectedPaper.status}</dd>
            </div>
            <div>
              <dt>Last updated</dt>
              <dd>
                <time dateTime={selectedPaper.updatedAt}>{selectedPaper.updatedAt}</time>
              </dd>
            </div>
          </dl>
        </div>
      ) : null}
    </section>
  );
};
