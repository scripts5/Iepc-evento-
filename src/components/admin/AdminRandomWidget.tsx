import React, { useState } from 'react';
import { Sparkles, Dices, Quote, ShieldCheck, RefreshCw, HeartHandshake } from 'lucide-react';

const RANDOM_VERSES = [
  {
    ref: '1 Timóteo 4:12',
    text: 'Ninguém despreze a tua mocidade; mas sê o exemplo dos fiéis, na palavra, no trato, no amor, no espírito, na fé, na pureza.',
    tag: 'Exemplo Jovem',
  },
  {
    ref: 'Salmos 119:9',
    text: 'De que maneira poderá o jovem guardar puro o seu caminho? Observando-o conforme a tua palavra.',
    tag: 'Vida Santa',
  },
  {
    ref: 'Isaías 40:31',
    text: 'Mas os que esperam no Senhor renovarão as suas forças. Subirão com asas como águias; correrão e não se cansarão.',
    tag: 'Renovação',
  },
  {
    ref: '1 João 2:14',
    text: 'Jovens, eu vos escrevi, porque sois fortes, e a palavra de Deus permanece em vós, e já vencestes o maligno.',
    tag: 'Força & Vitória',
  },
  {
    ref: 'Eclesiastes 12:1',
    text: 'Lembra-te também do teu Criador nos dias da tua mocidade, antes que venham os maus dias.',
    tag: 'Prioridade',
  },
  {
    ref: 'Provérbios 27:17',
    text: 'Como o ferro com o ferro se afia, assim o homem afia o rosto do seu amigo.',
    tag: 'Comunhão',
  },
  {
    ref: 'Josué 1:9',
    text: 'Não te mandei eu? Sê forte e corajoso; não temas, nem te espantes, porque o Senhor, teu Deus, é contigo por onde quer que andares.',
    tag: 'Coragem',
  },
  {
    ref: 'Romanos 12:2',
    text: 'E não vos conformeis com este século, mas transformai-vos pela renovação da vossa mente.',
    tag: 'Transformação',
  },
  {
    ref: 'Jeremias 29:11',
    text: 'Porque eu bem sei os pensamentos que penso de vós, diz o Senhor; pensamentos de paz e não de mal, para vos dar o fim que esperais.',
    tag: 'Esperança',
  },
];

const RANDOM_STATUSES = [
  'Nível de Fé: 100% 🔥 | Café da Portaria: Quentinho ☕',
  'Missão da ADM: Nenhum jovem sem mini crachá e sem acolhimento caloroso! ✨',
  'Frequência Espiritual: Máxima potência | Portaria pronta para receber a todos! 🕊️',
  'Status Aleatório: Crachás alinhados, louvores afinados e corações abertos! 🎸',
  'Liderança IEPC: Servindo com alegria e excelência na Casa do Senhor! 🌟',
  'Dica Aleatória do Administrador: Dê um "A Paz do Senhor" bem animado no check-in! 🤝',
  'Modo Administrador Ativo: Organização pontual e presença de Deus constante! ⚡',
];

export const AdminRandomWidget: React.FC = () => {
  const [verseIndex, setVerseIndex] = useState(() => Math.floor(Math.random() * RANDOM_VERSES.length));
  const [statusIndex, setStatusIndex] = useState(() => Math.floor(Math.random() * RANDOM_STATUSES.length));
  const [sessionToken, setSessionToken] = useState(() =>
    Math.random().toString(36).substring(2, 8).toUpperCase()
  );
  const [isSpinning, setIsSpinning] = useState(false);

  const randomizeAll = () => {
    setIsSpinning(true);
    setTimeout(() => {
      setVerseIndex(prev => (prev + 1) % RANDOM_VERSES.length);
      setStatusIndex(prev => (prev + 1) % RANDOM_STATUSES.length);
      setSessionToken(Math.random().toString(36).substring(2, 8).toUpperCase());
      setIsSpinning(false);
    }, 250);
  };

  const currentVerse = RANDOM_VERSES[verseIndex];
  const currentStatus = RANDOM_STATUSES[statusIndex];

  return (
    <div
      id="admin-random-panel"
      className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white rounded-3xl p-5 sm:p-6 border border-indigo-700/50 shadow-xl space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-400/20 text-amber-300 rounded-xl border border-amber-400/30">
            <Dices className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                Painel Aleatório do Administrador
              </span>
              <span className="text-[10px] bg-white/10 text-white/80 px-2 py-0.5 rounded-full font-mono">
                TOKEN #{sessionToken}
              </span>
            </div>
            <p className="text-xs text-indigo-200">
              Mensagem inspiradora e status gerados aleatoriamente ao entrar como ADM
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={randomizeAll}
          disabled={isSpinning}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-white bg-white/15 hover:bg-white/25 rounded-xl border border-white/20 transition-all self-start sm:self-auto cursor-pointer shadow-xs active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSpinning ? 'animate-spin' : ''}`} />
          <span>Sortear Outro Sei Lá 🎲</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Verse Section */}
        <div className="md:col-span-2 bg-black/25 rounded-2xl p-4 border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-300 flex items-center gap-1.5 uppercase tracking-wider">
              <Quote className="w-3.5 h-3.5 text-amber-400" />
              Versículo Aleatório para a Liderança
            </span>
            <span className="text-[10px] bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded-full">
              {currentVerse.tag}
            </span>
          </div>
          <p className="text-sm font-medium text-slate-100 leading-relaxed italic">
            "{currentVerse.text}"
          </p>
          <p className="text-xs font-bold text-amber-400 text-right">
            — {currentVerse.ref}
          </p>
        </div>

        {/* Fun Status & Admin Tip */}
        <div className="bg-black/25 rounded-2xl p-4 border border-white/10 flex flex-col justify-between space-y-3">
          <div>
            <span className="text-[11px] font-bold text-purple-300 flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Status Aleatório da Equipe
            </span>
            <p className="text-xs text-white font-medium mt-1.5 leading-snug">
              {currentStatus}
            </p>
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-indigo-200">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Acesso ADM Autorizado
            </span>
            <span className="text-[10px] text-white/60">IEPC 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
};
