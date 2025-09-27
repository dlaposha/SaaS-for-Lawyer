import { apiService } from './api';
import { Case, PaginationParams, PaginatedResponse } from '@types';

class CaseService {
  async getCases(params: PaginationParams): Promise<PaginatedResponse<Case>> {
    const queryParams = new URLSearchParams({
      page: params.page.toString(),
      limit: params.limit.toString(),
      ...(params.search && { search: params.search }),
      ...(params.sortBy && { sortBy: params.sortBy }),
      ...(params.sortOrder && { sortOrder: params.sortOrder }),
    });

    return apiService.get<PaginatedResponse<Case>>(`/cases?${queryParams}`);
  }

  async getCase(id: number): Promise<Case> {
    return apiService.get<Case>(`/cases/${id}`);
  }

  async createCase(caseData: Partial<Case>): Promise<Case> {
    return apiService.post<Case>('/cases', caseData);
  }

  async updateCase(id: number, caseData: Partial<Case>): Promise<Case> {
    return apiService.put<Case>(`/cases/${id}`, caseData);
  }

  async deleteCase(id: number): Promise<void> {
    return apiService.delete(`/cases/${id}`);
  }

  async getCaseStatusStats(): Promise<Record<string, number>> {
    return apiService.get('/cases/stats/status');
  }
}

export const caseService = new CaseService();