import {
  EventConfig,
  Registration,
  AuthUser,
  DashboardStats,
  RegistrationStatus,
  CheckinResult,
  AdminUser,
  CertificateConfig,
} from '../types/index.ts';

function getAuthToken(): string | null {
  return localStorage.getItem('eventpass_admin_token');
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || `Erro na requisição (${response.status})`);
  }

  return data as T;
}

export const api = {
  // Public
  async getPublicEvent(): Promise<EventConfig & { registeredCount: number; isCapacityFull: boolean }> {
    return request<EventConfig & { registeredCount: number; isCapacityFull: boolean }>('/api/event');
  },

  async submitRegistration(data: {
    name: string;
    email: string;
    phone: string;
    birthDate: string;
    age?: number | string;
    bringingGuests?: boolean;
    guestsCount?: number;
    guestsNames?: string;
    city: string;
    state: string;
    organization?: string;
    ticketType: string;
    notes?: string;
    termsAccepted: boolean;
  }): Promise<{ message: string; registration: Registration }> {
    return request<{ message: string; registration: Registration }>('/api/registrations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async checkRegistration(query: string): Promise<Registration> {
    return request<Registration>(`/api/registrations/check/${encodeURIComponent(query)}`);
  },

  async cancelRegistration(code: string, email: string, reason?: string): Promise<{ message: string }> {
    return request<{ message: string }>('/api/registrations/cancel', {
      method: 'POST',
      body: JSON.stringify({ code, email, reason }),
    });
  },

  async getCertificate(code: string): Promise<{
    eligible: boolean;
    message?: string;
    registration: Registration;
    certificateConfig: CertificateConfig;
    event: {
      name: string;
      startDate: string;
      endDate?: string;
      locationName: string;
      locationAddress?: string;
    };
  }> {
    return request(`/api/certificate/${encodeURIComponent(code)}`);
  },

  async updateCertificateTemplate(data: Partial<CertificateConfig>): Promise<{
    message: string;
    certificateConfig: CertificateConfig;
  }> {
    return request('/api/admin/certificate/template', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Auth
  async adminLogin(email: string, password: string): Promise<{ token: string; user: AuthUser }> {
    const res = await request<{ message: string; token: string; user: AuthUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('eventpass_admin_token', res.token);
    localStorage.setItem('eventpass_admin_user', JSON.stringify(res.user));
    return res;
  },

  async getAdminMe(): Promise<AuthUser> {
    return request<AuthUser>('/api/auth/me');
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return request<{ message: string }>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  adminLogout() {
    localStorage.removeItem('eventpass_admin_token');
    localStorage.removeItem('eventpass_admin_user');
  },

  // Dashboard & Attendee Management
  async getAdminStats(): Promise<DashboardStats> {
    return request<DashboardStats>('/api/admin/stats');
  },

  async getAdminRegistrations(params: {
    search?: string;
    status?: string;
    ticketType?: string;
    state?: string;
    onlyCheckedIn?: boolean;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    items: Registration[];
    pagination: { page: number; limit: number; totalItems: number; totalPages: number };
  }> {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.status) query.set('status', params.status);
    if (params.ticketType) query.set('ticketType', params.ticketType);
    if (params.state) query.set('state', params.state);
    if (params.onlyCheckedIn !== undefined) query.set('onlyCheckedIn', params.onlyCheckedIn ? 'true' : 'false');
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.sortOrder) query.set('sortOrder', params.sortOrder);
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());

    return request(`/api/admin/registrations?${query.toString()}`);
  },

  async getAdminRegistration(id: string): Promise<Registration> {
    return request<Registration>(`/api/admin/registrations/${id}`);
  },

  async updateRegistration(id: string, data: Partial<Registration>): Promise<{ message: string; registration: Registration }> {
    return request<{ message: string; registration: Registration }>(`/api/admin/registrations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async updateRegistrationStatus(id: string, status: RegistrationStatus): Promise<{ message: string; registration: Registration }> {
    return request<{ message: string; registration: Registration }>(`/api/admin/registrations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async deleteRegistration(id: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/admin/registrations/${id}`, {
      method: 'DELETE',
    });
  },

  // Check-in
  async performCheckin(code: string): Promise<CheckinResult> {
    return request<CheckinResult>('/api/admin/checkin', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  },

  async performCheckIn(code: string): Promise<CheckinResult> {
    return this.performCheckin(code);
  },

  async getRecentCheckins(): Promise<Registration[]> {
    return request<Registration[]>('/api/admin/checkin/recent');
  },

  // Event Config
  async updateEventConfig(data: Partial<EventConfig>): Promise<{ message: string; event: EventConfig }> {
    return request<{ message: string; event: EventConfig }>('/api/event', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Admin Users
  async getAdminUsers(): Promise<AdminUser[]> {
    return request<AdminUser[]>('/api/admin/users');
  },

  async createAdminUser(data: { name: string; email: string; password: string; role: string }): Promise<{ message: string; user: AdminUser }> {
    return request<{ message: string; user: AdminUser }>('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteAdminUser(id: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/admin/users/${id}`, {
      method: 'DELETE',
    });
  },

  async resetDemoData(): Promise<{ message: string }> {
    return request<{ message: string }>('/api/admin/reset-demo', {
      method: 'POST',
    });
  },

  getExportCsvUrl(filters: { status?: string; ticketType?: string; search?: string } = {}): string {
    const token = getAuthToken();
    const query = new URLSearchParams();
    if (filters.status) query.set('status', filters.status);
    if (filters.ticketType) query.set('ticketType', filters.ticketType);
    if (filters.search) query.set('search', filters.search);
    return `/api/admin/export/csv?${query.toString()}`;
  },
};
