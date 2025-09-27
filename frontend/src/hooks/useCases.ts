import { useState, useEffect, useCallback } from 'react';
import { caseService } from '@services/case';
import { Case, PaginationParams, PaginatedResponse } from '@types';

export const useCases = (initialParams: PaginationParams) => {
  const [cases, setCases] = useState<Case[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<Case> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<PaginationParams>(initialParams);

  const fetchCases = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await caseService.getCases(params);
      setCases(response.data);
      setPagination(response);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch cases');
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const refetch = () => {
    fetchCases();
  };

  const updateParams = (newParams: Partial<PaginationParams>) => {
    setParams(prev => ({ ...prev, ...newParams }));
  };

  return {
    cases,
    pagination,
    isLoading,
    error,
    params,
    refetch,
    updateParams,
  };
};