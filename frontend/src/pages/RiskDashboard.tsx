import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { useRiskSummary, useRisks } from '../api/risks';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend);

export const RiskDashboard: React.FC = () => {
  const { summary, isLoading } = useRiskSummary();
  const { risks } = useRisks({ status: 'open' });

  const lineChartData = useMemo(() => {
    const labels = summary?.trend.map((entry) => entry.month) ?? [];
    return {
      labels,
      datasets: [
        {
          label: 'High',
          data: summary?.trend.map((entry) => entry.high) ?? [],
          borderColor: '#d12c2c',
          backgroundColor: 'rgba(209, 44, 44, 0.1)',
          tension: 0.3,
          fill: true
        },
        {
          label: 'Medium',
          data: summary?.trend.map((entry) => entry.medium) ?? [],
          borderColor: '#f08c00',
          backgroundColor: 'rgba(240, 140, 0, 0.1)',
          tension: 0.3,
          fill: true
        },
        {
          label: 'Low',
          data: summary?.trend.map((entry) => entry.low) ?? [],
          borderColor: '#0ca678',
          backgroundColor: 'rgba(12, 166, 120, 0.1)',
          tension: 0.3,
          fill: true
        }
      ]
    };
  }, [summary]);

  const doughnutData = useMemo(() => ({
    labels: ['High', 'Medium', 'Low'],
    datasets: [
      {
        data: [summary?.highRisks ?? 0, summary?.mediumRisks ?? 0, summary?.lowRisks ?? 0],
        backgroundColor: ['#d12c2c', '#f08c00', '#0ca678'],
        borderWidth: 0
      }
    ]
  }), [summary]);

  return (
    <section aria-busy={isLoading} aria-live="polite">
      <header style={{ marginBottom: '2rem' }}>
        <h1>Risk dashboard</h1>
        <p>Monitor the control environment, top exposures and mitigation progress in real time.</p>
      </header>
      <div className="card-grid" role="list">
        <article className="card" role="listitem" aria-label="Total risks">
          <h2>Total risks</h2>
          <p style={{ fontSize: '2.5rem', margin: 0 }}>{summary?.totalRisks ?? '—'}</p>
          <p style={{ color: '#4b5563' }}>Active inventory managed by assurance teams</p>
        </article>
        <article className="card" role="listitem" aria-label="High priority">
          <h2>High priority</h2>
          <p style={{ fontSize: '2.5rem', margin: 0 }}>{summary?.highRisks ?? '—'}</p>
          <p style={{ color: '#4b5563' }}>Requires executive attention</p>
        </article>
        <article className="card" role="listitem" aria-label="Mitigation backlog">
          <h2>Mitigation backlog</h2>
          <p style={{ fontSize: '2.5rem', margin: 0 }}>{risks.length}</p>
          <p style={{ color: '#4b5563' }}>Open items assigned to risk owners</p>
        </article>
      </div>
      <div className="card-grid" style={{ marginTop: '2rem' }}>
        <article className="chart-card" aria-label="Risk trend chart">
          <h2 style={{ marginTop: 0 }}>Monthly exposure trend</h2>
          <Line
            data={lineChartData}
            aria-label="Risk exposure trend chart"
            role="img"
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: 'bottom' },
                tooltip: { mode: 'index', intersect: false }
              },
              scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Number of risks' } },
                x: { title: { display: true, text: 'Month' } }
              }
            }}
            style={{ minHeight: '320px' }}
          />
        </article>
        <article className="chart-card" aria-label="Risk distribution chart">
          <h2 style={{ marginTop: 0 }}>Current severity mix</h2>
          <Doughnut
            data={doughnutData}
            aria-label="Risk severity distribution"
            role="img"
            options={{ plugins: { legend: { position: 'bottom' } } }}
          />
          <p style={{ marginTop: '1rem', color: '#4b5563' }}>
            Severity mix calculated from inherent and residual scores aggregated by category.
          </p>
        </article>
      </div>
    </section>
  );
};
