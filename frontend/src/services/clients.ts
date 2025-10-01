import { apiService, demoApi } from './api';

export interface Client {
  id: number;
  type: 'person' | 'company';
  name: string;
  emails: string[];
  phones: string[];
  address?: string;
  kyc_status: 'pending' | 'verified' | 'rejected';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
}

class ClientService {
  async getClients(params: PaginationParams): Promise<{ items: Client[]; total: number }> {
    try {
      const queryParams = new URLSearchParams({
        page: params.page.toString(),
        limit: params.limit.toString(),
        ...(params.search && { search: params.search }),
      });

      return await apiService.get(`/clients?${queryParams}`);
    } catch (error: any) {
      if (error.message === 'NETWORK_UNAVAILABLE') {
        console.warn('🌐 Backend unavailable, using demo data for clients');
        const demoData = await demoApi.getClients();
        return {
          items: demoData.data,
          total: demoData.data.length,
        };
      }
      throw error;
    }
  }

  async getClient(id: number): Promise<Client> {
    try {
      return await apiService.get<Client>(`/clients/${id}`);
    } catch (error: any) {
      if (error.message === 'NETWORK_UNAVAILABLE') {
        const demoData = await demoApi.getClients();
        const client = demoData.data.find((c: any) => c.id === id);
        if (!client) {
          throw new Error(`Client with id ${id} not found`);
        }
        return client;
      }
      throw error;
    }
  }

  async createClient(clientData: Partial<Client>): Promise<Client> {
    try {
      return await apiService.post<Client>('/clients', clientData);
    } catch (error: any) {
      if (error.message === 'NETWORK_UNAVAILABLE') {
        const demoClient: Client = {
          id: Date.now(),
          type: clientData.type || 'person',
          name: clientData.name || 'Новий клієнт',
          emails: clientData.emails || [],
          phones: clientData.phones || [],
          address: clientData.address,
          kyc_status: 'pending',
          notes: clientData.notes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        return demoClient;
      }
      throw error;
    }
  }

  async updateClient(id: number, clientData: Partial<Client>): Promise<Client> {
    try {
      return await apiService.put<Client>(`/clients/${id}`, clientData);
    } catch (error: any) {
      if (error.message === 'NETWORK_UNAVAILABLE') {
        const currentClient = await this.getClient(id);
        return {
          ...currentClient,
          ...clientData,
          updated_at: new Date().toISOString(),
        };
      }
      throw error;
    }
  }

  async deleteClient(id: number): Promise<void> {
    try {
      await apiService.delete(`/clients/${id}`);
    } catch (error: any) {
      if (error.message === 'NETWORK_UNAVAILABLE') {
        console.log('🌐 Demo mode: client deletion simulated');
        return;
      }
      throw error;
    }
  }

  async searchClients(query: string): Promise<Client[]> {
    try {
      const response = await this.getClients({ page: 1, limit: 50, search: query });
      return response.items;
    } catch (error: any) {
      if (error.message === 'NETWORK_UNAVAILABLE') {
        const demoData = await demoApi.getClients();
        return demoData.data.filter((client: Client) =>
          client.name.toLowerCase().includes(query.toLowerCase()) ||
          client.emails.some(email => email.toLowerCase().includes(query.toLowerCase()))
        );
      }
      throw error;
    }
  }
}

export const clientService = new ClientService();