export type RegistrationStatus = 'Inscrito' | 'Confirmado' | 'Cancelado' | 'Presente';

export type UserRole = 'ADMIN' | 'STAFF';
export type AdminRole = UserRole;

export interface TicketType {
  id: string;
  name: string;
  description: string;
  price: number; // 0 for free
  maxQuantity?: number;
}

export interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  speaker?: string;
  description?: string;
  location?: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  whatsapp?: string;
  instagram?: string;
  address?: string;
}

export interface EventConfig {
  id: string;
  name: string;
  tagline?: string;
  slogan?: string;
  description: string;
  importantInfo?: string;
  startDate: string;
  endDate?: string;
  time?: string;
  timeSchedule?: string;
  locationName: string;
  locationAddress?: string;
  address?: string;
  city?: string;
  state?: string;
  bannerUrl: string;
  logoUrl?: string;
  maxCapacity: number;
  isRegistrationOpen: boolean;
  ticketTypes: TicketType[];
  schedule: ScheduleItem[];
  faq?: FaqItem[];
  faqs?: FaqItem[];
  contact: ContactInfo;
  termsText?: string;
  privacyText?: string;
  certificateConfig?: CertificateConfig;
}

export interface CertificateConfig {
  title: string;
  subtitle: string;
  textTemplate: string;
  workloadHours: string;
  signatoryName1: string;
  signatoryRole1: string;
  signatoryName2?: string;
  signatoryRole2?: string;
  themeColor: string;
  borderStyle: 'classic' | 'gold' | 'modern' | 'minimal';
  showQrCode: boolean;
  institutionName: string;
}

export interface Registration {
  id: string;
  code: string; // e.g. EVT-26-9F8A
  certificateCode?: string; // e.g. CERT-26-9F8A
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  age?: number | string;
  bringingGuests?: boolean;
  guestsCount?: number;
  guestsNames?: string;
  accompanyingCount?: number;
  accompanyingNames?: string;
  city: string;
  state: string;
  organization?: string;
  ticketType: string;
  notes?: string;
  createdAt: string;
  status: RegistrationStatus;
  checkedInAt?: string;
  checkedInBy?: string;
  termsAccepted: boolean;
  qrCodeDataUrl?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  passwordHash?: string;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface DashboardStats {
  totalRegistrations: number;
  todayRegistrations: number;
  confirmedRegistrations: number;
  cancelledRegistrations: number;
  presentRegistrations: number;
  presenceRate: number;
  capacityProgress: number;
  maxCapacity: number;
  registrationsOverTime: { date: string; count: number }[];
  byTicketType: { name: string; count: number }[];
  byStatus: { status: string; count: number }[];
}

export interface CheckinResult {
  success: boolean;
  alreadyCheckedIn: boolean;
  registration?: Registration;
  message: string;
}
