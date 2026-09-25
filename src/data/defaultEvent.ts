import { EventConfig, CertificateConfig } from '../types/index.ts';

export const defaultCertificateConfig: CertificateConfig = {
  title: 'CERTIFICADO DE PARTICIPAÇÃO',
  subtitle: 'A Igreja Evangélica Pentecostal Cristã (IEPC) certifica que',
  textTemplate: 'participou com louvor e dedicação da Conferência de Jovens da Igreja IEPC ({evento}), realizada em {data}, sediada em {local}, cumprindo a programação de comunhão, adoração e ministração com carga horária de {carga_horaria}.',
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
  name: 'Conferência de Jovens IEPC 2026',
  tagline: 'Juventude com Propósito • Avivamento, Adoração, Fé e Comunhão',
  description: 'O grande Encontro de Jovens da Igreja Evangélica Pentecostal Cristã (IEPC) reunirá a juventude e adolescentes para momentos marcantes na presença de Deus. Teremos louvor ao vivo com o Ministério de Louvor Jovem IEPC, ministração bíblica direcionada para a vida dos jovens, testemunhos, oração especial no altar, dinâmicas de acolhimento e confraternização. Um ambiente caloroso e transformador aberto a todos os membros e visitantes.',
  importantInfo: 'Inscrições 100% gratuitas! Não é necessário ter WhatsApp para se inscrever. O evento acontecerá no mês de Novembro de 2026 (dia exato a ser anunciado nos cultos e atualizado aqui no site). Traga sua Bíblia, venha com coração aberto e convide seus amigos!',
  startDate: '2026-11-01',
  endDate: '2026-11-30',
  time: '19h00 às 22h00',
  locationName: 'Igreja Evangélica Pentecostal Cristã (IEPC) - Templo Sede',
  locationAddress: 'Templo Sede da IEPC - Auditório Central dos Jovens',
  bannerUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1600&q=80',
  maxCapacity: 600,
  isRegistrationOpen: true,
  registeredCount: 7,
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
      time: '18h30 - 19h00',
      title: 'Recepção, Acolhimento & Entrega de Crachás',
      speaker: 'Equipe de Acolhimento Jovem IEPC',
      description: 'Chegada da juventude, credenciamento ágil com QR Code ou nome completo e entrega do mini crachá.',
      location: 'Hall de Entrada do Templo',
    },
    {
      id: 'sch-2',
      time: '19h00 - 19h30',
      title: 'Abertura com Oração & Dinâmica de Boas-Vindas',
      speaker: 'Liderança da Juventude IEPC',
      description: 'Oração inicial consagrando o evento e dinâmica alegre de integração e quebra-gelo.',
      location: 'Nave Principal',
    },
    {
      id: 'sch-3',
      time: '19h30 - 20h20',
      title: 'Louvor & Adoração ao Vivo',
      speaker: 'Banda do Ministério de Louvor Jovem IEPC',
      description: 'Momento de celebração e profunda adoração com canções congregacionais e contemporâneas.',
      location: 'Altar Central',
    },
    {
      id: 'sch-4',
      time: '20h20 - 21h20',
      title: 'Ministração da Palavra: Juventude com Propósito',
      speaker: 'Ministro da Palavra / Pastores da IEPC',
      description: 'Mensagem prática das Escrituras sobre identidade cristã, integridade, vocação e fé nos dias atuais.',
      location: 'Púlpito do Templo',
    },
    {
      id: 'sch-5',
      time: '21h20 - 21h45',
      title: 'Clamor no Altar & Oração pelos Jovens',
      speaker: 'Corpo Pastoral e Líderes IEPC',
      description: 'Tempo de entrega, oração por propósitos, renovo espiritual e busca pela presença de Deus.',
      location: 'Frente do Altar',
    },
    {
      id: 'sch-6',
      time: '21h45 - 22h30',
      title: 'Confraternização, Fotos & Comunhão',
      speaker: 'Todos os Jovens e Amigos',
      description: 'Momento de alegria, fotos no backdrop dos jovens, lanche especial de confraternização e novas amizades.',
      location: 'Área de Convivência da IEPC',
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
      answer: 'O evento acontecerá no mês de Novembro de 2026, das 19h00 às 22h00. O dia específico será divulgado nos cultos e atualizado nesta página. Sua inscrição antecipada já garante sua vaga e confecção do crachá!',
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

export const defaultRegistrations = [
  {
    id: 'reg-1',
    code: 'EVT-26-JOV01',
    name: 'Gabriel Santos Oliveira',
    email: 'gabriel.santos@iepc.com.br',
    phone: '(11) 98234-5678',
    birthDate: '2004-05-12',
    city: 'São Paulo',
    state: 'SP',
    organization: 'IEPC Templo Sede',
    ticketType: 'jovem-iepc',
    notes: 'Banda de Louvor Jovem',
    createdAt: '2026-09-15T09:30:00.000Z',
    status: 'Presente' as const,
    checkedInAt: '2026-09-20T18:45:00.000Z',
    checkedInBy: 'Liderança Jovem',
    certificateCode: 'CERT-26-JOV01',
    termsAccepted: true,
  },
  {
    id: 'reg-2',
    code: 'EVT-26-JOV02',
    name: 'Beatriz Helena de Souza',
    email: 'beatriz.souza@iepc.com.br',
    phone: '(11) 97123-8899',
    birthDate: '2005-11-23',
    city: 'São Paulo',
    state: 'SP',
    organization: 'IEPC Templo Sede',
    ticketType: 'jovem-iepc',
    notes: '',
    createdAt: '2026-09-16T14:20:00.000Z',
    status: 'Presente' as const,
    checkedInAt: '2026-09-20T18:50:00.000Z',
    checkedInBy: 'Liderança Jovem',
    certificateCode: 'CERT-26-JOV02',
    termsAccepted: true,
  },
  {
    id: 'reg-3',
    code: 'EVT-26-JOV03',
    name: 'Matheus Henrique Lima',
    email: 'matheus.lima@gmail.com',
    phone: '',
    birthDate: '2003-03-04',
    city: 'Osasco',
    state: 'SP',
    organization: 'Amigo Convidado',
    ticketType: 'jovem-convidado',
    notes: 'Convidado pelo Gabriel',
    createdAt: '2026-09-17T11:10:00.000Z',
    status: 'Confirmado' as const,
    termsAccepted: true,
  },
  {
    id: 'reg-4',
    code: 'EVT-26-JOV04',
    name: 'Larissa Menezes Rocha',
    email: 'larissa.rocha@iepc.com.br',
    phone: '(11) 99234-9988',
    birthDate: '2000-08-19',
    city: 'São Paulo',
    state: 'SP',
    organization: 'IEPC - Equipe de Acolhimento',
    ticketType: 'lideranca-apoio',
    notes: 'Equipe de recepção e crachás',
    createdAt: '2026-09-18T16:45:00.000Z',
    status: 'Confirmado' as const,
    termsAccepted: true,
  },
  {
    id: 'reg-5',
    code: 'EVT-26-JOV05',
    name: 'Lucas Eduardo Pereira',
    email: 'lucas.pereira@gmail.com',
    phone: '',
    birthDate: '2006-01-30',
    city: 'Guarulhos',
    state: 'SP',
    organization: 'Amigo Convidado',
    ticketType: 'jovem-convidado',
    createdAt: '2026-09-19T10:15:00.000Z',
    status: 'Inscrito' as const,
    termsAccepted: true,
  },
  {
    id: 'reg-6',
    code: 'EVT-26-JOV06',
    name: 'Rebeca Vitória Silva',
    email: 'rebeca.silva@iepc.com.br',
    phone: '(11) 98122-3344',
    birthDate: '2002-09-14',
    city: 'São Paulo',
    state: 'SP',
    organization: 'IEPC Congregação Norte',
    ticketType: 'jovem-iepc',
    notes: 'Grupo de Louvor e Dança',
    createdAt: '2026-09-19T13:00:00.000Z',
    status: 'Inscrito' as const,
    termsAccepted: true,
  },
];

export function getLocalRegistrations() {
  try {
    const raw = localStorage.getItem('eventpass_local_registrations');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error reading local registrations:', e);
  }
  return defaultRegistrations;
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

