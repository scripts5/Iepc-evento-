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
  time: 'A partir das 08h00 (Café da Manhã) • O dia todo',
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
  schedule: [
    {
      id: 'sch-1',
      time: '08h00 - 09h00',
      title: 'Café da Manhã & Recepção de Boas-Vindas',
      speaker: 'Equipe de Acolhimento Jovem IEPC',
      description: 'Acolhimento da juventude, credenciamento com QR Code, entrega dos mini crachás e café da manhã especial para começar o dia juntos.',
      location: 'Salão de Convivência & Hall do Templo',
    },
    {
      id: 'sch-2',
      time: '09h00 - 09h45',
      title: 'Abertura Oficial, Oração & Louvor Inicial',
      speaker: 'Liderança da Juventude IEPC',
      description: 'Oração de consagração do dia, dinâmicas de integração e início da adoração ao Senhor.',
      location: 'Nave Principal',
    },
    {
      id: 'sch-3',
      time: '09h45 - 11h45',
      title: 'Louvor ao Vivo & 1ª Ministração da Palavra',
      speaker: 'Ministério de Louvor Jovem IEPC & Pastores',
      description: 'Forte momento de celebração e primeira mensagem bíblica direcionada para a vida dos jovens.',
      location: 'Altar Central',
    },
    {
      id: 'sch-4',
      time: '11h45 - 13h30',
      title: 'Intervalo para Almoço & Convivência',
      speaker: 'Todos os Jovens e Visitantes',
      description: 'Momento de confraternização, integração fraterna entre amigos e visitantes e descanso.',
      location: 'Área de Convivência',
    },
    {
      id: 'sch-5',
      time: '13h30 - 15h30',
      title: 'Painel dos Jovens, Dinâmicas & Testemunhos',
      speaker: 'Líderes de Jovens e Convidados',
      description: 'Roda de conversa cristã, testemunhos edificantes e perguntas da juventude.',
      location: 'Auditório Central dos Jovens',
    },
    {
      id: 'sch-6',
      time: '15h30 - 17h00',
      title: 'Louvor Acústico, Gincana Bíblica & Atividades',
      speaker: 'Equipe de Dinâmicas e Louvor',
      description: 'Atividades interativas, quebra-gelo e momentos especiais de aprendizado da Palavra.',
      location: 'Nave Principal',
    },
    {
      id: 'sch-7',
      time: '17h00 - 18h00',
      title: 'Lanche da Tarde & Sessão de Fotos',
      speaker: 'Todos os Participantes',
      description: 'Lanche especial da tarde, fotos comemorativas no backdrop do evento e comunhão.',
      location: 'Área de Convivência',
    },
    {
      id: 'sch-8',
      time: '18h00 - 21h00',
      title: 'Grande Culto de Avivamento & Clamor no Altar',
      speaker: 'Corpo Pastoral & Ministros Convidados',
      description: 'Culto solene de encerramento com louvor vibrante, pregação avivada, clamor no altar e consagração da juventude.',
      location: 'Templo Sede IEPC',
    },
  ],
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
      question: 'Qual a data e horário exatos do evento?',
      answer: 'O Evento dos Jovens acontecerá no dia 21 de Novembro de 2026 (sábado). Começará às 8h da manhã com um delicioso café da manhã para todos e se estenderá durante o dia inteiro com louvor, ministrações, dinâmicas, almoço e encerramento com o Culto de Avivamento!',
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

