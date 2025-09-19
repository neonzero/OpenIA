import React, { useMemo, useState } from 'react';
import { useRiskQuestionnaire } from '../api/risks';
import type { QuestionnaireResponse } from '../types';

const likertScale = [
  { value: '1', label: 'Rare' },
  { value: '2', label: 'Unlikely' },
  { value: '3', label: 'Possible' },
  { value: '4', label: 'Likely' },
  { value: '5', label: 'Almost certain' }
];

const impactScale = [
  { value: '1', label: 'Insignificant' },
  { value: '2', label: 'Minor' },
  { value: '3', label: 'Moderate' },
  { value: '4', label: 'Major' },
  { value: '5', label: 'Severe' }
];

export const RiskIdentificationQuestionnaire: React.FC = () => {
  const { submit } = useRiskQuestionnaire();
  const [owner, setOwner] = useState('');
  const [riskCategory, setRiskCategory] = useState('');
  const [likelihood, setLikelihood] = useState('3');
  const [impact, setImpact] = useState('3');
  const [description, setDescription] = useState('');
  const [controls, setControls] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const inherentScore = useMemo(() => Number(likelihood) * Number(impact), [likelihood, impact]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const response: QuestionnaireResponse = {
      responses: {
        owner,
        riskCategory,
        likelihood,
        impact,
        description,
        controls
      }
    };

    try {
      await submit(response);
      setStatusMessage('Risk captured. Workflow has been initiated for assessment.');
      setErrorMessage(null);
      setDescription('');
      setControls('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to submit questionnaire.');
      setStatusMessage(null);
    }
  };

  return (
    <section>
      <header style={{ marginBottom: '2rem' }}>
        <h1>Risk identification questionnaire</h1>
        <p>Capture emerging risks with rich context to feed prioritisation and audit planning.</p>
      </header>
      <form onSubmit={handleSubmit} aria-describedby={errorMessage ? 'questionnaire-error' : undefined}>
        <div className="form-grid">
          <div className="form-control">
            <label htmlFor="owner">Risk owner</label>
            <input
              id="owner"
              name="owner"
              value={owner}
              onChange={(event) => setOwner(event.target.value)}
              required
            />
          </div>
          <div className="form-control">
            <label htmlFor="riskCategory">Risk category</label>
            <select
              id="riskCategory"
              name="riskCategory"
              value={riskCategory}
              onChange={(event) => setRiskCategory(event.target.value)}
              required
            >
              <option value="" disabled>
                Select a category
              </option>
              <option value="strategic">Strategic</option>
              <option value="financial">Financial</option>
              <option value="compliance">Compliance</option>
              <option value="operational">Operational</option>
              <option value="technology">Technology</option>
            </select>
          </div>
          <div className="form-control">
            <label htmlFor="likelihood">Likelihood</label>
            <select
              id="likelihood"
              name="likelihood"
              value={likelihood}
              onChange={(event) => setLikelihood(event.target.value)}
            >
              {likertScale.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-control">
            <label htmlFor="impact">Impact</label>
            <select
              id="impact"
              name="impact"
              value={impact}
              onChange={(event) => setImpact(event.target.value)}
            >
              {impactScale.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-grid" style={{ marginTop: '1.5rem' }}>
          <div className="form-control">
            <label htmlFor="description">Risk description</label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe the scenario, drivers and potential outcomes"
              required
            />
          </div>
          <div className="form-control">
            <label htmlFor="controls">Existing controls</label>
            <textarea
              id="controls"
              name="controls"
              value={controls}
              onChange={(event) => setControls(event.target.value)}
              placeholder="Summarise preventive and detective measures currently in place"
            />
          </div>
        </div>
        <aside style={{ marginTop: '1.5rem' }} aria-live="polite">
          <p>
            Estimated inherent score: <strong>{inherentScore}</strong> (likelihood {likelihood} × impact {impact}).
          </p>
        </aside>
        {errorMessage ? (
          <p id="questionnaire-error" role="alert" style={{ color: '#b91c1c' }}>
            {errorMessage}
          </p>
        ) : null}
        {statusMessage ? (
          <p role="status" style={{ color: '#0ca678' }}>
            {statusMessage}
          </p>
        ) : null}
        <button type="submit" style={{ marginTop: '1.5rem' }}>
          Submit risk for review
        </button>
      </form>
    </section>
  );
};
