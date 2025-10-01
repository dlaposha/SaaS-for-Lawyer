import { apiService, demoApi } from './api';

export interface Case {
  id: number;
  case_number: string;
  title: string;
  description?: string;
  client_id: number;
  client_name?: string;
  status: 'open' | 'in_progress' | 'on_hold' | 'closed' | 'archived';
  stage: 'pre_trial' | 'first_instance' | 'appeal' | 'cassation' | 'enforcement';
  hourly_rate?: number;
  budget?: number;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

class CaseService {
  async getCases(params: PaginationParams): Promise<PaginatedResponse<Case>> {
    try {
      const queryParams = new URLSearchParams({
        page: params.page.toString(),
        limit: params.limit.toString(),
        ...(params.search && { search: params.search }),
        ...(params.sortBy && { sortBy: params.sortBy }),
        ...(params.sortOrder && { sortOrder: params.sortOrder }),
      });

      return await apiService.get<PaginatedResponse<Case>>(`/cases?${queryParams}`);
    } catch (error: any) {
      if (error.message === 'NETWORK_UNAVAILABLE') {
        console.warn('🌐 Backend unavailable, using demo data for cases');
        const demoData = await demoApi.getCases();
        const startIndex = (params.page - 1) * params.limit;
        const endIndex = startIndex + params.limit;
        const paginatedItems = demoData.data.slice(startIndex, endIndex);

        return {
          items: paginatedItems,
          total: demoData.data.length,
          page: params.page,
          size: params.limit,
          pages: Math.ceil(demoData.data.length / params.limit),
        };
      }
      throw error;
    }
  }

  async getCase(id: number): Promise<Case> {
    try {
      return await apiService.get<Case>(`/cases/${id}`);
    } catch (error: any) {
      if (error.message === 'NETWORK_UNAVAILABLE') {
        const demoData = await demoApi.getCases();
        const caseItem = demoData.data.find((c: any) => c.id === id);
        if (!caseItem) {
          throw new Error(`Case with id ${id} not found`);
        }
        return caseItem;
      }
      throw error;
    }
  }

  async createCase(caseData: Partial<Case>): Promise<Case> {
    try {
      return await apiService.post<Case>('/cases', caseData);
    } catch (error: any) {
      if (error.message === 'NETWORK_UNAVAILABLE') {
        const demoCase: Case = {
          id: Date.now(),
          case_number: `CASE-${Date.now()}`,
          title: caseData.title || 'Нова справа',
          description: caseData.description,
          client_id: caseData.client_id || 1,
          client_name: 'Демо Клієнт',
          status: 'open',
          stage: 'pre_trial',
          hourly_rate: caseData.hourly_rate || 1000,
          budget: caseData.budget || 0,
          due_date: caseData.due_date,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        console.log('🌐 Demo mode: case created', demoCase);
        return demoCase;
      }
      throw error;
    }
  }

  async updateCase(id: number, caseData: Partial<Case>): Promise<Case> {
    try {
      return await apiService.put<Case>(`/cases/${id}`, caseData);
    } catch (error: any) {
      if (error.message === 'NETWORK_UNAVAILABLE') {
        const currentCase = await this.getCase(id);
        const updatedCase: Case = {
          ...currentCase,
          ...caseData,
          updated_at: new Date().toISOString(),
        };
        console.log('🌐 Demo mode: case updated', updatedCase);
        return updatedCase;
      }
      throw error;
    }
  }

  async deleteCase(id: number): Promise<void> {
    try {
      await apiService.delete(`/cases/${id}`);
    } catch (error: any) {
      if (error.message === 'NETWORK_UNAVAILABLE') {
        console.log('🌐 Demo mode: case deletion simulated for id', id);
        return;
      }
      throw error;
    }
  }

  async getCaseStatusStats(): Promise<Record<string, number>> {
    try {
      return await apiService.get<Record<string, number>>('/cases/stats/status');
    } catch (error: any) {
      if (error.message === 'NETWORK_UNAVAILABLE') {
        return {
          open: 5,
          in_progress: 3,
          on_hold: 2,
          closed: 10,
          archived: 8
        };
      }
      throw error;
    }
  }

  async searchCases(query: string): Promise<Case[]> {
    try {
      const response = await this.getCases({
        page: 1,
        limit: 50,
        search: query
      });
      return response.items;
    } catch (error: any) {
      if (error.message === 'NETWORK_UNAVAILABLE') {
        const demoData = await demoApi.getCases();
        return demoData.data.filter((caseItem: Case) =>
          caseItem.title.toLowerCase().includes(query.toLowerCase()) ||
          caseItem.case_number.toLowerCase().includes(query.toLowerCase()) ||
          caseItem.description?.toLowerCase().includes(query.toLowerCase())
        );
      }
      throw error;
    }
  }

  async getCasesByStatus(status: Case['status']): Promise<Case[]> {
    try {
      const response = await this.getCases({ page: 1, limit: 100 });
      return response.items.filter(caseItem => caseItem.status === status);
    } catch (error: any) {
      if (error.message === 'NETWORK_UNAVAILABLE') {
        const demoData = await demoApi.getCases();
        return demoData.data.filter((caseItem: Case) => caseItem.status === status);
      }
      throw error;
    }
  }
}

export const caseService = new CaseService();