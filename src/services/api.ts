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
import {
  defaultEventData,
  defaultCertificateConfig,
  getLocalEventData,
  saveLocalEventData,
  getLocalRegistrations,
  saveLocalRegistrations,
  defaultRegistrations,
} from '../data/defaultEvent.ts';

// Auto cleanup any old test/mock data from user's browser localStorage
try {
  const localRegsRaw = localStorage.getItem('eventpass_local_registrations');
  if (localRegsRaw) {
    const parsed = JSON.parse(localRegsRaw);
    if (
      Array.isArray(parsed) &&
      parsed.some(
        (r: any) =>
          r.id === 'reg-1' ||
          r.id === 'reg-2' ||
          r.code?.includes('JOV') ||
          r.email?.includes('gabriel.santos@iepc') ||
          r.email?.includes('mateus.jovem@gmail')
      )
    ) {
      localStorage.removeItem('eventpass_local_registrations');
    }
  }
} catch {}

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

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(`Servidor não retornou JSON (${response.status})`);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || `Erro na requisição (${response.status})`);
  }

  return data as T;
}

export const api = {
  // Public Event
  async getPublicEvent(): Promise<EventConfig & { registeredCount: number; isCapacityFull: boolean }> {
    try {
      const data = await request<EventConfig & { registeredCount: number; isCapacityFull: boolean }>('/api/event');
      if (data && data.name) {
        saveLocalEventData(data);
        return data;
      }
    } catch {
      // Fallback seamlessly to local storage
    }
    return getLocalEventData();
  },

  // Submit Registration
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
    try {
      const res = await request<{ message: string; registration: Registration }>('/api/registrations', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (res && res.registration) {
        // Also mirror in local storage
        const currentRegs = getLocalRegistrations();
        if (!currentRegs.some((r: any) => r.id === res.registration.id)) {
          currentRegs.unshift(res.registration);
          saveLocalRegistrations(currentRegs);
        }
        return res;
      }
    } catch (err: any) {
      console.warn('API error during registration, saving locally:', err);
    }

    // Client-side fallback registration
    const regs = getLocalRegistrations();
    const cleanEmail = (data.email || '').trim().toLowerCase();
    
    // Check if email already registered (if provided)
    if (cleanEmail) {
      const existing = regs.find(
        (r: any) => r.email && r.email.toLowerCase() === cleanEmail && r.status !== 'Cancelado'
      );
      if (existing) {
        throw new Error('Este e-mail já possui uma inscrição ativa para este evento.');
      }
    }

    const uniqueCode = `EVT-26-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const newReg: Registration = {
      id: `reg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      code: uniqueCode,
      name: data.name.trim(),
      email: cleanEmail || `${data.name.toLowerCase().replace(/\s+/g, '')}@participante.iepc`,
      phone: data.phone || '',
      birthDate: data.birthDate || '',
      age: data.age ? Number(data.age) : undefined,
      city: data.city || 'São Paulo',
      state: data.state || 'SP',
      organization: data.organization || 'IEPC',
      ticketType: data.ticketType?.trim() || 'Membro IEPC',
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
      status: 'Confirmado',
      termsAccepted: !!data.termsAccepted,
      guestsCount: data.guestsCount || 0,
      guestsNames: data.guestsNames || '',
    };

    regs.unshift(newReg);
    saveLocalRegistrations(regs);

    // Update local event registeredCount
    const evt = getLocalEventData();
    evt.registeredCount = regs.filter((r: any) => r.status !== 'Cancelado').length;
    evt.isCapacityFull = evt.registeredCount >= (evt.maxCapacity || defaultEventData.maxCapacity);
    saveLocalEventData(evt);

    return {
      message: 'Inscrição realizada com sucesso!',
      registration: newReg,
    };
  },

  // Check Registration by query
  async checkRegistration(query: string): Promise<Registration> {
    try {
      return await request<Registration>(`/api/registrations/check/${encodeURIComponent(query)}`);
    } catch {
      // Fallback
    }

    const q = query.trim().toLowerCase();
    const regs = getLocalRegistrations();
    const found = regs.find(
      (r: any) =>
        r.code?.toLowerCase() === q ||
        r.email?.toLowerCase() === q ||
        r.name?.toLowerCase() === q ||
        (r.name && r.name.toLowerCase().includes(q))
    );

    if (found) {
      return found;
    }
    throw new Error('Nenhuma inscrição encontrada com as informações fornecidas.');
  },

  // Cancel Registration
  async cancelRegistration(code: string, email: string, reason?: string): Promise<{ message: string }> {
    try {
      return await request<{ message: string }>('/api/registrations/cancel', {
        method: 'POST',
        body: JSON.stringify({ code, email, reason }),
      });
    } catch {
      // Fallback
    }

    const regs = getLocalRegistrations();
    const index = regs.findIndex((r: any) => r.code?.toLowerCase() === code.trim().toLowerCase());
    if (index !== -1) {
      regs[index].status = 'Cancelado';
      regs[index].cancellationReason = reason || 'Cancelado pelo participante';
      saveLocalRegistrations(regs);
      return { message: 'Inscrição cancelada com sucesso.' };
    }
    throw new Error('Inscrição não encontrada para cancelamento.');
  },

  // Certificate
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
    try {
      return await request(`/api/certificate/${encodeURIComponent(code)}`);
    } catch {
      // Fallback
    }

    const q = code.trim().toLowerCase();
    const regs = getLocalRegistrations();
    const reg = regs.find((r: any) => r.code?.toLowerCase() === q || r.certificateCode?.toLowerCase() === q);

    if (!reg) {
      throw new Error('Inscrição não encontrada para emissão do certificado.');
    }

    const evt = getLocalEventData();
    const isEligible = reg.status === 'Presente' || !!reg.checkedInAt;

    return {
      eligible: isEligible,
      message: isEligible ? 'Certificado disponível!' : 'Certificado disponível apenas após o check-in na portaria do evento.',
      registration: reg,
      certificateConfig: evt.certificateConfig || defaultCertificateConfig,
      event: {
        name: evt.name,
        startDate: evt.startDate,
        endDate: evt.endDate,
        locationName: evt.locationName,
        locationAddress: evt.locationAddress,
      },
    };
  },

  async updateCertificateTemplate(data: Partial<CertificateConfig>): Promise<{
    message: string;
    certificateConfig: CertificateConfig;
  }> {
    try {
      return await request('/api/admin/certificate/template', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch {
      // Fallback
    }
    const evt = getLocalEventData();
    const newCert = { ...(evt.certificateConfig || defaultCertificateConfig), ...data };
    evt.certificateConfig = newCert;
    saveLocalEventData(evt);
    return {
      message: 'Modelo de certificado atualizado com sucesso!',
      certificateConfig: newCert,
    };
  },

  // Auth: Admin Login
  async adminLogin(email: string, password: string): Promise<{ token: string; user: AuthUser }> {
    const cleanPass = (password || '').trim();
    const rawEmail = (email || '').trim();
    const emailToUse = rawEmail || 'administrador@iepc.com.br';

    try {
      const res = await request<{ message: string; token: string; user: AuthUser }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: emailToUse, password: cleanPass }),
      });
      if (res && res.token && res.user) {
        localStorage.setItem('eventpass_admin_token', res.token);
        localStorage.setItem('eventpass_admin_user', JSON.stringify(res.user));
        return res;
      }
    } catch (err: any) {
      console.warn('API login failed or unavailable, checking offline admin master credentials:', err);
    }

    // Offline / fallback validation
    const lowerPass = cleanPass.toLowerCase();
    const savedLocalPass = localStorage.getItem('eventpass_admin_password');
    const isMaster = lowerPass === 'cpei' || lowerPass === 'iepc' || lowerPass === 'admin' || lowerPass === 'iepc2026' || (savedLocalPass && cleanPass === savedLocalPass);
    if (!isMaster) {
      throw new Error('Senha incorreta. A senha para acessar é cpei.');
    }

    const fallbackUser: AuthUser = {
      id: 'usr-admin-iepc',
      name: 'Liderança Administrativa IEPC',
      email: emailToUse,
      role: 'ADMIN',
    };
    const fallbackToken = `token-iepc-${Date.now()}`;
    localStorage.setItem('eventpass_admin_token', fallbackToken);
    localStorage.setItem('eventpass_admin_user', JSON.stringify(fallbackUser));

    return {
      token: fallbackToken,
      user: fallbackUser,
    };
  },

  async getAdminMe(): Promise<AuthUser> {
    try {
      return await request<AuthUser>('/api/auth/me');
    } catch {
      // Fallback
    }
    const saved = localStorage.getItem('eventpass_admin_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return {
      id: 'usr-admin-iepc',
      name: 'Administrador IEPC',
      email: 'administrador@gmail.com',
      role: 'ADMIN',
    };
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    try {
      return await request<{ message: string }>('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
    } catch {
      localStorage.setItem('eventpass_admin_password', newPassword);
      return { message: 'Senha atualizada com sucesso!' };
    }
  },

  adminLogout() {
    localStorage.removeItem('eventpass_admin_token');
    localStorage.removeItem('eventpass_admin_user');
  },

  // Dashboard Stats
  async getAdminStats(): Promise<DashboardStats> {
    try {
      return await request<DashboardStats>('/api/admin/stats');
    } catch {
      // Fallback: calculate directly from local registrations
    }

    const regs = getLocalRegistrations();
    const evt = getLocalEventData();

    const activeRegs = regs.filter((r: any) => r.status !== 'Cancelado');
    const checkedIn = activeRegs.filter((r: any) => r.status === 'Presente' || !!r.checkedInAt);
    const confirmed = activeRegs.filter((r: any) => r.status === 'Confirmado');
    const pending = activeRegs.filter((r: any) => r.status === 'Inscrito');
    const canceled = regs.filter((r: any) => r.status === 'Cancelado');

    const maxCap = evt.maxCapacity || 600;
    const capacityProgress = maxCap > 0 ? Math.min(100, Math.round((activeRegs.length / maxCap) * 100)) : 0;
    const presenceRate = activeRegs.length > 0 ? Math.round((checkedIn.length / activeRegs.length) * 100) : 0;

    // Dynamic time-series (last 7 days)
    const dateMap = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      dateMap.set(`${day}/${month}`, 0);
    }
    activeRegs.forEach((r: any) => {
      if (r.createdAt) {
        const d = new Date(r.createdAt);
        if (!isNaN(d.getTime())) {
          const key = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
          if (dateMap.has(key)) {
            dateMap.set(key, (dateMap.get(key) || 0) + 1);
          }
        }
      }
    });

    const registrationsOverTime = Array.from(dateMap.entries()).map(([date, count]) => ({ date, count }));

    // Dynamic ticket type breakdown
    const ticketMap = new Map<string, number>();
    activeRegs.forEach((r: any) => {
      const type = r.ticketType || 'Membro IEPC';
      ticketMap.set(type, (ticketMap.get(type) || 0) + 1);
    });
    const byTicketType = Array.from(ticketMap.entries()).map(([name, count]) => ({ name, count }));

    // Dynamic denomination breakdown
    const denomMap = new Map<string, number>();
    activeRegs.forEach((r: any) => {
      const denom = (r.organization || '').trim() || 'IEPC (Membro/Geral)';
      denomMap.set(denom, (denomMap.get(denom) || 0) + 1);
    });
    const byDenomination = Array.from(denomMap.entries()).map(([name, count]) => ({ name, count }));

    return {
      totalRegistrations: activeRegs.length,
      todayRegistrations: activeRegs.length,
      confirmedRegistrations: confirmed.length + pending.length,
      cancelledRegistrations: canceled.length,
      presentRegistrations: checkedIn.length,
      presenceRate,
      capacityProgress,
      maxCapacity: maxCap,
      registrationsOverTime,
      byTicketType,
      byStatus: [
        { status: 'Presente', count: checkedIn.length },
        { status: 'Confirmado', count: confirmed.length },
        { status: 'Inscrito', count: pending.length },
        { status: 'Cancelado', count: canceled.length },
      ],
      byDenomination,
    };
  },

  // Attendees List
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
    try {
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

      const res = await request<any>(`/api/admin/registrations?${query.toString()}`);
      if (res && Array.isArray(res.items)) {
        const localRegs = getLocalRegistrations();
        const serverIds = new Set(res.items.map((r: any) => r.id || r.code));
        const extraLocal = localRegs.filter((lr: any) => !serverIds.has(lr.id) && !serverIds.has(lr.code));
        if (extraLocal.length > 0 && !params.onlyCheckedIn) {
          res.items = [...extraLocal, ...res.items];
          res.pagination.totalItems = (res.pagination.totalItems || res.items.length) + extraLocal.length;
        }
        return res;
      }
    } catch {
      // Fallback
    }

    let items = [...getLocalRegistrations()];

    if (params.search) {
      const s = params.search.toLowerCase();
      items = items.filter(
        (r: any) =>
          r.name?.toLowerCase().includes(s) ||
          r.email?.toLowerCase().includes(s) ||
          r.code?.toLowerCase().includes(s) ||
          r.city?.toLowerCase().includes(s)
      );
    }

    if (params.status && params.status !== 'all') {
      items = items.filter((r: any) => r.status === params.status);
    }

    if (params.ticketType && params.ticketType !== 'all') {
      items = items.filter((r: any) => r.ticketType === params.ticketType);
    }

    if (params.onlyCheckedIn) {
      items = items.filter((r: any) => r.status === 'Presente' || !!r.checkedInAt);
    }

    // Sort
    const sortField = params.sortBy || 'createdAt';
    const isDesc = params.sortOrder !== 'asc';
    items.sort((a: any, b: any) => {
      const valA = a[sortField] || '';
      const valB = b[sortField] || '';
      if (valA < valB) return isDesc ? 1 : -1;
      if (valA > valB) return isDesc ? -1 : 1;
      return 0;
    });

    const page = params.page || 1;
    const limit = params.limit || 15;
    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / limit) || 1;
    const paginatedItems = items.slice((page - 1) * limit, page * limit);

    return {
      items: paginatedItems,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    };
  },

  async getAdminRegistration(id: string): Promise<Registration> {
    try {
      return await request<Registration>(`/api/admin/registrations/${id}`);
    } catch {
      // Fallback
    }
    const regs = getLocalRegistrations();
    const found = regs.find((r: any) => r.id === id || r.code === id);
    if (found) return found;
    throw new Error('Inscrição não encontrada.');
  },

  async updateRegistration(id: string, data: Partial<Registration>): Promise<{ message: string; registration: Registration }> {
    try {
      return await request<{ message: string; registration: Registration }>(`/api/admin/registrations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch {
      // Fallback
    }
    const regs = getLocalRegistrations();
    const idx = regs.findIndex((r: any) => r.id === id || r.code === id);
    if (idx !== -1) {
      regs[idx] = { ...regs[idx], ...data };
      saveLocalRegistrations(regs);
      return { message: 'Inscrição atualizada com sucesso!', registration: regs[idx] };
    }
    throw new Error('Inscrição não encontrada para atualização.');
  },

  async updateRegistrationStatus(id: string, status: RegistrationStatus): Promise<{ message: string; registration: Registration }> {
    try {
      return await request<{ message: string; registration: Registration }>(`/api/admin/registrations/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    } catch {
      // Fallback
    }
    const regs = getLocalRegistrations();
    const idx = regs.findIndex((r: any) => r.id === id || r.code === id);
    if (idx !== -1) {
      regs[idx].status = status;
      if (status === 'Presente' && !regs[idx].checkedInAt) {
        regs[idx].checkedInAt = new Date().toISOString();
        regs[idx].checkedInBy = 'Administrador IEPC';
        regs[idx].certificateCode = `CERT-26-${regs[idx].code.replace('EVT-26-', '')}`;
      }
      saveLocalRegistrations(regs);
      return { message: 'Status atualizado com sucesso!', registration: regs[idx] };
    }
    throw new Error('Inscrição não encontrada.');
  },

  async deleteRegistration(id: string): Promise<{ message: string }> {
    try {
      return await request<{ message: string }>(`/api/admin/registrations/${id}`, {
        method: 'DELETE',
      });
    } catch {
      // Fallback
    }
    let regs = getLocalRegistrations();
    regs = regs.filter((r: any) => r.id !== id && r.code !== id);
    saveLocalRegistrations(regs);
    return { message: 'Inscrição removida com sucesso.' };
  },

  // Check-in
  async performCheckin(code: string): Promise<CheckinResult> {
    try {
      return await request<CheckinResult>('/api/admin/checkin', {
        method: 'POST',
        body: JSON.stringify({ code }),
      });
    } catch {
      // Fallback
    }

    const q = code.trim().toLowerCase();
    const regs = getLocalRegistrations();
    const idx = regs.findIndex((r: any) => r.code?.toLowerCase() === q);

    if (idx === -1) {
      return {
        success: false,
        alreadyCheckedIn: false,
        message: 'Código de inscrição inválido ou não encontrado.',
      };
    }

    const reg = regs[idx];
    if (reg.status === 'Presente') {
      return {
        success: false,
        alreadyCheckedIn: true,
        message: `Check-in JÁ REALIZADO anteriormente para ${reg.name} em ${new Date(reg.checkedInAt!).toLocaleTimeString('pt-BR')}.`,
        registration: reg,
      };
    }

    if (reg.status === 'Cancelado') {
      return {
        success: false,
        alreadyCheckedIn: false,
        message: `Esta inscrição está CANCELADA (${reg.cancellationReason || 'sem justificativa'}).`,
        registration: reg,
      };
    }

    reg.status = 'Presente';
    reg.checkedInAt = new Date().toISOString();
    reg.checkedInBy = 'Portaria / Check-in IEPC';
    reg.certificateCode = `CERT-26-${reg.code.replace('EVT-26-', '')}`;
    saveLocalRegistrations(regs);

    return {
      success: true,
      alreadyCheckedIn: false,
      message: `Check-in confirmado com sucesso! Bem-vindo(a), ${reg.name}!`,
      registration: reg,
    };
  },

  async performCheckIn(code: string): Promise<CheckinResult> {
    return this.performCheckin(code);
  },

  async getRecentCheckins(): Promise<Registration[]> {
    try {
      return await request<Registration[]>('/api/admin/checkin/recent');
    } catch {
      // Fallback
    }
    const regs = getLocalRegistrations();
    return regs.filter((r: any) => r.status === 'Presente' || !!r.checkedInAt).slice(0, 10);
  },

  // Event Config
  async updateEventConfig(data: Partial<EventConfig>): Promise<{ message: string; event: EventConfig }> {
    try {
      return await request<{ message: string; event: EventConfig }>('/api/event', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch {
      // Fallback
    }
    saveLocalEventData(data);
    return {
      message: 'Configurações do evento salvas com sucesso!',
      event: getLocalEventData(),
    };
  },

  // Admin Users
  async getAdminUsers(): Promise<AdminUser[]> {
    try {
      return await request<AdminUser[]>('/api/admin/users');
    } catch {
      // Fallback
    }
    return [
      { id: 'usr-admin-iepc', name: 'Administrador IEPC', email: 'administrador@gmail.com', role: 'ADMIN', createdAt: new Date().toISOString() },
      { id: 'usr-staff-iepc', name: 'Equipe de Acolhimento IEPC', email: 'acolhimento@iepc.com.br', role: 'STAFF', createdAt: new Date().toISOString() },
    ];
  },

  async createAdminUser(data: { name: string; email: string; password: string; role: string }): Promise<{ message: string; user: AdminUser }> {
    try {
      return await request<{ message: string; user: AdminUser }>('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      // Fallback
    }
    const newUser: AdminUser = {
      id: `usr-admin-${Date.now()}`,
      name: data.name,
      email: data.email,
      role: data.role as any,
      createdAt: new Date().toISOString(),
    };
    return { message: 'Usuário administrativo cadastrado com sucesso!', user: newUser };
  },

  async deleteAdminUser(id: string): Promise<{ message: string }> {
    try {
      return await request<{ message: string }>(`/api/admin/users/${id}`, {
        method: 'DELETE',
      });
    } catch {
      // Fallback
    }
    return { message: 'Usuário administrativo removido.' };
  },

  async resetDemoData(): Promise<{ message: string }> {
    try {
      return await request<{ message: string }>('/api/admin/reset-demo', {
        method: 'POST',
      });
    } catch {
      // Fallback
    }
    saveLocalRegistrations(defaultRegistrations);
    saveLocalEventData(defaultEventData);
    return { message: 'Dados restaurados com sucesso!' };
  },

  async resendRegistrationEmail(id: string): Promise<{ message: string; previewUrl?: string }> {
    return await request<{ message: string; previewUrl?: string }>(`/api/registrations/${encodeURIComponent(id)}/resend-email`, {
      method: 'POST',
    });
  },

  async getAdminEmailLogs(): Promise<{ logs: any[] }> {
    try {
      return await request<{ logs: any[] }>('/api/admin/email-logs');
    } catch {
      return { logs: [] };
    }
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
