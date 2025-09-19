import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiClient } from './client';
import type { FollowUpItem, QuestionnaireResponse, Risk, RiskSummary } from '../types';

const buildQueryString = (params?: Record<string, string | number | undefined>) => {
  if (!params) {
    return '';
  }

  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');

  return query ? `?${query}` : '';
};

export const useRiskSummary = () => {
  const [summary, setSummary] = useState<RiskSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<RiskSummary>('/risks/summary');
      setSummary(response);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return useMemo(
    () => ({ summary, isLoading, error, refresh }),
    [summary, isLoading, error, refresh]
  );
};

export interface UseRisksOptions {
  status?: Risk['status'];
  owner?: string;
}

export const useRisks = (options?: UseRisksOptions) => {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = buildQueryString(options);
      const response = await apiClient.get<Risk[]>(`/risks${query}`);
      setRisks(response);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [options?.owner, options?.status]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return useMemo(
    () => ({ risks, isLoading, error, refresh }),
    [risks, isLoading, error, refresh]
  );
};

export const useRiskQuestionnaire = () => {
  const submit = useCallback(async (payload: QuestionnaireResponse) => {
    return apiClient.post<Risk>(`/risks/${payload.riskId ?? 'new'}/questionnaire`, payload);
  }, []);

  return { submit };
};

export const useFollowUpItems = (riskId?: string) => {
  const [items, setItems] = useState<FollowUpItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = buildQueryString({ riskId });
      const response = await apiClient.get<FollowUpItem[]>(`/risks/follow-ups${query}`);
      setItems(response);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [riskId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return useMemo(
    () => ({ items, isLoading, error, refresh }),
    [items, isLoading, error, refresh]
  );
};
