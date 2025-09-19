import React from 'react';
import { render, screen } from '@testing-library/react';
import { RiskDashboard } from '../pages/RiskDashboard';

jest.mock('../api/risks', () => ({
  useRiskSummary: () => ({
    summary: {
      totalRisks: 10,
      highRisks: 4,
      mediumRisks: 3,
      lowRisks: 3,
      trend: [
        { month: 'Jan', high: 2, medium: 1, low: 1 },
        { month: 'Feb', high: 1, medium: 1, low: 1 },
        { month: 'Mar', high: 1, medium: 1, low: 1 }
      ]
    },
    isLoading: false,
    error: null,
    refresh: jest.fn()
  }),
  useRisks: () => ({
    risks: [
      { id: '1', title: 'Risk', category: 'Operational', inherentRisk: 4, residualRisk: 3, owner: 'Owner', status: 'open' }
    ],
    isLoading: false,
    error: null,
    refresh: jest.fn()
  }),
  useRiskQuestionnaire: jest.fn(),
  useFollowUpItems: jest.fn()
}));

describe('RiskDashboard', () => {
  it('renders key metrics and charts', () => {
    render(<RiskDashboard />);
    expect(screen.getByRole('heading', { name: /risk dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('article', { name: /total risks/i })).toBeInTheDocument();
    expect(screen.getByRole('article', { name: /risk trend chart/i })).toBeInTheDocument();
    expect(screen.getByRole('article', { name: /risk distribution chart/i })).toBeInTheDocument();
  });
});
