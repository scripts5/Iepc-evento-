import React from 'react';
import { ShieldCheck, ArrowLeft, Lock, FileText, UserCheck, Trash2 } from 'lucide-react';
import { useEvent } from '../context/EventContext.tsx';

export const PrivacyPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { event } = useEvent();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <button
        type="button"
        onClick={() => onNavigate('/')}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para o evento
      </button>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xl space-y-8">
        <div className="border-b border-slate-100 pb-6 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Conformidade LGPD (Lei Federal nº 13.709/2018)
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Política de Privacidade e Tratamento de Dados
          </h1>
          <p className="text-sm text-slate-600">
            Última atualização: Setembro de 2026. Transparência total sobre como seus dados são coletados, protegidos e utilizados.
          </p>
        </div>

        <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              1. Finalidade da Coleta de Dados Pessoais
            </h2>
            <p>
              Os dados solicitados no formulário de inscrição do <strong>{event?.name}</strong> (como nome completo, e-mail, telefone opcional, data de nascimento, cidade e estado) são coletados estritamente para as seguintes finalidades legítimas:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Identificação inequívoca do participante para controle de acesso ao local do evento;</li>
              <li>Geração do código de credenciamento único e QR Code para check-in ágil na portaria;</li>
              <li>Envio de comunicações essenciais sobre horários, alterações de cronograma e orientações de segurança;</li>
              <li>Emissão do Certificado Oficial de Participação após o término do evento;</li>
              <li>Cumprimento de obrigações legais e de segurança coletiva no espaço físico do evento.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-600" />
              2. Princípio da Minimização e Não Compartilhamento
            </h2>
            <p>
              Coletamos apenas os dados estritamente necessários para a realização do evento. <strong>Seus dados jamais serão vendidos, alugados ou compartilhados com empresas de marketing terceiras.</strong> O acesso à lista de inscritos é restrito aos administradores e equipe de credenciamento autorizada com credenciais seguras.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-indigo-600" />
              3. Direitos do Titular de Dados
            </h2>
            <p>
              De acordo com os artigos 18 e 19 da Lei Geral de Proteção de Dados, você tem o direito de:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Confirmar a existência de tratamento e acessar seus dados cadastrados a qualquer momento pela página "Consultar Inscrição";</li>
              <li>Corrigir dados incompletos, inexatos ou desatualizados entrando em contato com a equipe organizadora;</li>
              <li>Solicitar o cancelamento da sua inscrição e a eliminação dos seus dados pessoais;</li>
              <li>Revogar o seu consentimento.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-600" />
              4. Como Solicitar a Exclusão dos Seus Dados
            </h2>
            <p>
              Caso decida não comparecer ao evento ou deseje que seus dados sejam eliminados dos nossos registros, basta acessar a página{' '}
              <button
                type="button"
                onClick={() => onNavigate('/consultar-inscricao')}
                className="text-indigo-600 font-bold hover:underline"
              >
                Consultar Inscrição
              </button>
              , localizar sua credencial e clicar em <em>"Solicitar cancelamento da vaga (LGPD)"</em>. Se preferir, envie uma mensagem para o e-mail oficial do evento:{' '}
              <strong className="text-slate-900">{event?.contact?.email}</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
