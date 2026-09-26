import { EventConfig, CertificateConfig } from '../types/index.ts';

export const defaultCertificateConfig: CertificateConfig = {
  title: 'CERTIFICADO DE PARTICIPAÇÃO',
  subtitle: 'A Igreja Evangélica Pentecostal Cristã (IEPC) certifica que',
  textTemplate: 'participou com louvor e dedicação do Evento dos Jovens da Igreja IEPC ({evento}), realizada em {data}, sediada em {local}, cumprindo a programação de comunhão, adoração e ministração com carga horária de {carga_horaria}.',
  workloadHours: '8 horas',
  signatoryName1: 'Pastor Presidente da IEPC',
  signatoryRole1: 'Liderança Pastoral Geral',
  signatoryName2: 'Coordenação de Jovens IEPC',
  signatoryRole2: 'Líder do Departamento da Juventude',
  themeColor: '#4f46e5',
  borderStyle: 'gold',
  showQrCode: true,
  institutionName: 'Igreja Evangélica Pentecostal Cristã (IEPC) - Departamento de Jovens',
};

export const defaultEventData: EventConfig & { registeredCount: number; isCapacityFull: boolean } = {
  id: 'evt-jovens-iepc-2026',
  name: 'Evento dos Jovens IEPC 2026',
  tagline: 'Juventude com Propósito • Avivamento, Adoração, Fé e Comunhão',
  description: 'O grande Encontro de Jovens da Igreja Evangélica Pentecostal Cristã (IEPC) reunirá a juventude e adolescentes para momentos marcantes na presença de Deus. Teremos louvor ao vivo com o Ministério de Louvor Jovem IEPC, ministração bíblica direcionada para a vida dos jovens, testemunhos, oração especial no altar, dinâmicas de acolhimento e confraternização. Um ambiente caloroso e transformador aberto a todos os membros e visitantes.',
  importantInfo: 'Inscrições 100% gratuitas! Não é necessário ter WhatsApp para se inscrever. O evento acontecerá no dia 21 de Novembro de 2026 (sábado), com início às 8h da manhã com um delicioso café da manhã para todos e programação abençoada durante o dia inteiro. Traga sua Bíblia, venha com coração aberto e convide seus amigos!',
  startDate: '2026-11-21',
  endDate: '2026-11-21',
  time: 'Início às 08:00 • Evento durante todo o dia',
  locationName: 'Igreja Evangélica Pentecostal Cristã (IEPC) - Templo Sede',
  locationAddress: 'Templo Sede da IEPC - Auditório Central dos Jovens',
  bannerUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1600&q=80',
  maxCapacity: 600,
  isRegistrationOpen: true,
  registeredCount: 0,
  isCapacityFull: false,
  ticketTypes: [
    {
      id: 'jovem-iepc',
      name: 'Jovem IEPC (Membro da Igreja)',
      description: 'Para jovens e adolescentes que já congregam na IEPC. Acesso total, mini crachá e certificado.',
      price: 0,
      maxQuantity: 350,
    },
    {
      id: 'jovem-convidado',
      name: 'Jovem Convidado / Amigo Visitante',
      description: 'Para amigos, familiares e convidados especiais de outras congregações ou da comunidade.',
      price: 0,
      maxQuantity: 200,
    },
    {
      id: 'lideranca-apoio',
      name: 'Liderança de Jovens & Voluntários',
      description: 'Para a equipe de apoio, louvor, acolhimento, recepção e multimídia da juventude.',
      price: 0,
      maxQuantity: 50,
    },
  ],
  schedule: [],
  faq: [
    {
      id: 'faq-1',
      question: 'O evento é gratuito ou precisa pagar alguma taxa?',
      answer: 'É 100% gratuito! A IEPC não cobra nenhum valor para inscrição ou entrada. Venha e traga seus amigos!',
    },
    {
      id: 'faq-2',
      question: 'Preciso ter WhatsApp para me inscrever?',
      answer: 'Não! O WhatsApp não é necessário. Basta preencher seu nome e cidade. Seu código e comprovante ficam disponíveis imediatamente no site.',
    },
    {
      id: 'faq-3',
      question: 'Qual a data e horário do evento?',
      answer: 'O evento acontecerá no dia 21 de Novembro de 2026 (sábado), com início às 08:00 e acontecerá durante todo o dia. Todas as inscrições são confirmadas automaticamente!',
    },
    {
      id: 'faq-4',
      question: 'Amigos que não são da igreja podem participar?',
      answer: 'Com certeza! Convidamos todos os jovens e adolescentes. Todos são recebidos com amor e acolhimento.',
    },
    {
      id: 'faq-5',
      question: 'Haverá crachá de identificação e certificado?',
      answer: 'Sim! Todos os inscritos contam com mini crachá oficial personalizado e emissão de certificado digital de participação após o check-in na portaria.',
    },
    {
      id: 'faq-6',
      question: 'Como faço para consultar ou confirmar minha inscrição?',
      answer: 'Clique no botão "Já estou inscrito" no menu superior e digite seu código de inscrição ou nome/e-mail para visualizar seu crachá e QR Code.',
    },
  ],
  contact: {
    email: 'jovens@iepc.com.br',
    phone: '(11) 3200-1000',
    instagram: '@jovens.iepc',
    address: 'Igreja Evangélica Pentecostal Cristã (IEPC) - Templo Sede',
  },
  termsText: 'Ao realizar a inscrição para o Encontro de Jovens da IEPC, você concorda em participar das atividades de comunhão com respeito cristão e autoriza o registro fotográfico institucional para as mídias da igreja.',
  privacyText: 'Seus dados pessoais são mantidos em sigilo e utilizados exclusivamente pela organização da IEPC para controle de presença, confecção do crachá e emissão do certificado de participação.',
  certificateConfig: defaultCertificateConfig,
};

export const defaultRegistrations: any[] = [];

export function getLocalRegistrations() {
  try {
    const raw = localStorage.getItem('eventpass_local_registrations');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Exclude legacy mock/test records
        const clean = parsed.filter(
          (r: any) =>
            r.id !== 'reg-1' &&
            r.id !== 'reg-2' &&
            r.id !== 'reg-3' &&
            r.id !== 'reg-4' &&
            r.id !== 'reg-5' &&
            r.id !== 'reg-6' &&
            r.id !== 'reg-1789951659315-927' &&
            !r.code?.includes('JOV')
        );
        return clean;
      }
    }
  } catch (e) {
    console.error('Error reading local registrations:', e);
  }
  return [];
}

export function saveLocalRegistrations(regs: any[]) {
  try {
    localStorage.setItem('eventpass_local_registrations', JSON.stringify(regs));
  } catch (e) {
    console.error('Error saving local registrations:', e);
  }
}

export function getLocalEventData(): EventConfig & { registeredCount: number; isCapacityFull: boolean } {
  try {
    const raw = localStorage.getItem('eventpass_local_event');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.name) {
        const regs = getLocalRegistrations();
        return {
          ...defaultEventData,
          ...parsed,
          time: (!parsed.time || parsed.time === '19h00 às 22h00' || parsed.time === 'Horário a definir') ? 'Horário não definido' : parsed.time,
          registeredCount: regs.filter((r: any) => r.status !== 'Cancelado').length,
          isCapacityFull: regs.filter((r: any) => r.status !== 'Cancelado').length >= (parsed.maxCapacity || defaultEventData.maxCapacity),
        };
      }
    }
  } catch (e) {
    console.error('Error reading local event data:', e);
  }
  const regs = getLocalRegistrations();
  return {
    ...defaultEventData,
    registeredCount: regs.filter((r: any) => r.status !== 'Cancelado').length,
    isCapacityFull: regs.filter((r: any) => r.status !== 'Cancelado').length >= defaultEventData.maxCapacity,
  };
}

export function saveLocalEventData(data: Partial<EventConfig>) {
  try {
    const current = getLocalEventData();
    const updated = { ...current, ...data };
    localStorage.setItem('eventpass_local_event', JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving local event data:', e);
  }
}

