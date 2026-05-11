import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  CreditCard, 
  Activity, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  User,
  Sparkles,
  Smartphone,
  Check,
  Copy
} from 'lucide-react';
import { Game, Package } from '../types';
import { db, auth } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const VodacomLogo = () => (
  <div className="w-10 h-10 bg-cyber-red rounded-lg flex items-center justify-center border border-white/10 shadow-[0_0_15px_rgba(239,68,68,0.3)] shrink-0">
    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
      <div className="w-3 h-3 bg-cyber-red rounded-full" />
    </div>
  </div>
);

const MovitelLogo = () => (
  <div className="w-10 h-10 bg-cyber-orange rounded-lg flex items-center justify-center border border-white/10 shadow-[0_0_15px_rgba(249,115,22,0.3)] shrink-0">
    <span className="text-white font-black text-xl italic tracking-tighter">m</span>
  </div>
);

export const MethodToggle = ({ active, onClick, label, sub, color, icon }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-4 p-6 border-2 transition-all duration-300 text-left relative overflow-hidden ${
      active 
      ? `bg-zinc-900 ${color} text-white shadow-xl` 
      : 'bg-black border-zinc-900 text-zinc-600 hover:border-zinc-800'
    }`}
  >
    <div className={`transition-all duration-300 ${active ? 'scale-110' : 'grayscale opacity-50'}`}>
      {icon}
    </div>
    <div>
      <p className="font-black text-xl italic tracking-tighter uppercase leading-none">{label}</p>
      <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-40 mt-1">{sub}</p>
    </div>
    {active && <div className="absolute top-2 right-2 w-2 h-2 bg-cyber-cyan rounded-full animate-pulse shadow-[0_0_10px_#06b6d4]" />}
  </button>
);

export const CheckoutForm = ({ 
  game, 
  pkg, 
  onConfirm, 
  onBack,
  onHelp
}: { 
  game: Game, 
  pkg: Package, 
  onConfirm: (data: { playerId: string, method: 'MPESA' | 'EMOLA' }) => void,
  onBack: () => void,
  onHelp?: (msg: string) => void
}) => {
  const [playerId, setPlayerId] = useState('');
  const [method, setMethod] = useState<'MPESA' | 'EMOLA'>('MPESA');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!auth.currentUser) return;
      try {
        const snap = await getDoc(doc(db, 'profiles', auth.currentUser.uid));
        if (snap.exists() && snap.data().lastPlayerId) {
          setPlayerId(snap.data().lastPlayerId);
        }
      } catch (e) {
        console.warn("Profile fetch failed:", e);
      }
    };
    fetchProfile();
  }, []);

  const handleHelpClick = () => {
    onHelp?.(`Preciso de ajuda com a recarga de ${game.name}. Estou tentando comprar o pacote de ${pkg.name} via ${method}.`);
  };

  const validatePlayerId = (id: string) => {
    if (!id) return 'Identificação Requerida no Node';
    const numericRegex = /^\d+$/;
    if (!numericRegex.test(id)) return 'Erro de Sintaxe: Use apenas caracteres numéricos';
    if (id.length < 6) return 'Sincronização Falhou: ID Muito Curto (Mín. 6 Dígitos)';
    if (id.length > 15) return 'Sincronização Falhou: ID Muito Longo (Máx. 15 Dígitos)';
    return null;
  };

  const error = playerId.length > 0 ? validatePlayerId(playerId) : (touched ? 'Identificação Requerida no Node' : null);
  const isValid = playerId.length > 0 && !validatePlayerId(playerId);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-8"
    >
      <button 
        onClick={onBack}
        className="group flex items-center gap-3 text-zinc-600 hover:text-white transition-all uppercase text-[10px] font-black tracking-[0.3em]"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Retornar ao Catálogo
      </button>

      <div className="bg-zinc-950 border border-zinc-900 shadow-2xl relative overflow-hidden group">
        <div className={`absolute top-0 left-0 w-full h-[2px] transition-all duration-700 ${error ? 'bg-cyber-red shadow-[0_0_20px_rgba(239,68,68,0.6)]' : (isValid ? 'bg-cyber-emerald shadow-[0_0_20px_rgba(16,185,129,0.6)]' : 'bg-zinc-800')}`} />
        
        <div className="p-8 lg:p-14 space-y-14">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-5">
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`p-5 bg-black border-2 border-zinc-900 shadow-lg ${game.accent}`}
                >
                  <game.icon size={28} />
                </motion.div>
                <div>
                  <h3 className="text-5xl font-heading text-white italic tracking-tighter leading-none">CHECKOUT <span className="text-cyber-cyan">PROTOCOLO</span></h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">{game.name.toUpperCase()}</span>
                    <div className="w-2 h-2 bg-zinc-800 rounded-full" />
                    <span className="text-[10px] font-black text-cyber-cyan uppercase tracking-[0.4em]">{pkg.name}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right flex items-center md:items-end flex-col gap-2">
              <div className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-sm">
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest italic tracking-[0.3em]">AES_ENCRYPTION_V2</span>
              </div>
              <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1.5 border transition-all duration-500 rounded-sm ${error ? 'text-cyber-red bg-cyber-red/10 border-cyber-red/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : (isValid ? 'text-cyber-emerald bg-cyber-emerald/10 border-cyber-emerald/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'text-zinc-600 border-zinc-900')}`}>
                <Activity size={12} className={isValid ? 'animate-pulse' : ''} /> {error ? 'DADOS_INVÁLIDOS' : (isValid ? 'LINK_ESTÁVEL' : 'SINCRONIZANDO...')}
              </div>
            </div>
          </div>
          
          <div className="space-y-10">
            <div className="space-y-5">
              <label className="flex items-center gap-3 text-[11px] font-black text-zinc-500 uppercase tracking-[0.5em] italic">
                <CreditCard size={14} className="text-cyber-cyan" /> Método de Liquidação
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <MethodToggle 
                  active={method === 'MPESA'} 
                  onClick={() => setMethod('MPESA')} 
                  label="M-PESA" 
                  sub="Vodacom Mozambique"
                  color="border-cyber-red"
                  icon={<VodacomLogo />}
                />
                <MethodToggle 
                  active={method === 'EMOLA'} 
                  onClick={() => setMethod('EMOLA')} 
                  label="E-MOLA" 
                  sub="Movitel Mozambique"
                  color="border-cyber-orange"
                  icon={<MovitelLogo />}
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] italic">
                <User size={12} className={error ? 'text-cyber-red' : (isValid ? 'text-cyber-emerald' : 'text-cyber-cyan')} /> Identificação Global na Grid
              </label>
              <div className="relative">
                <motion.input
                  animate={{ x: error ? [-1, 2, -2, 2, 0] : 0 }}
                  transition={{ duration: 0.1, repeat: error ? 2 : 0 }}
                  type="text"
                  value={playerId}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setPlayerId(val);
                    if (!touched) setTouched(true);
                  }}
                  onBlur={() => setTouched(true)}
                  placeholder="INSERIR_ID_PROTOCOLO..."
                  className={`block w-full px-8 py-7 bg-black border focus:outline-none text-white placeholder:text-zinc-900 transition-all font-mono font-bold text-4xl tracking-[0.2em] outline-none shadow-inner ${
                    error 
                    ? 'border-cyber-red/50 text-cyber-red focus:border-cyber-red shadow-[0_0_30px_rgba(239,68,68,0.1)]' 
                    : (isValid 
                        ? 'border-cyber-emerald/50 focus:border-cyber-emerald text-cyber-emerald shadow-[0_0_30px_rgba(16,185,129,0.1)]' 
                        : 'border-zinc-900 focus:border-cyber-cyan')
                  }`}
                />
                <div className="absolute top-0 right-8 h-full flex items-center gap-6 pointer-events-none">
                  <AnimatePresence mode="wait">
                    {isValid ? (
                      <motion.div
                        key="valid-icon"
                        initial={{ scale: 0, opacity: 0, rotate: -90 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        exit={{ scale: 0, opacity: 0, rotate: 90 }}
                        className="text-cyber-emerald"
                      >
                        <CheckCircle2 size={28} className="drop-shadow-[0_0_10px_#10b981]" />
                      </motion.div>
                    ) : error ? (
                      <motion.div
                        key="error-icon"
                        initial={{ scale: 0, opacity: 0, rotate: 90 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        exit={{ scale: 0, opacity: 0, rotate: -90 }}
                        className="text-cyber-red"
                      >
                        <AlertCircle size={28} className="drop-shadow-[0_0_10px_#ef4444]" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="idle-icon"
                        animate={{ opacity: [0.2, 0.5, 0.2] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-zinc-800"
                      >
                        <RefreshCw size={24} />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex flex-col items-end border-l border-zinc-900 pl-6">
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] transition-colors ${error ? 'text-cyber-red' : (isValid ? 'text-cyber-emerald' : 'text-zinc-800')}`}>
                      {error ? 'ERR_FORMAT_FAIL' : (isValid ? 'STATUS_AUTH_OK' : 'WAIT_INPUT_NODE')}
                    </span>
                    <span className="text-[7px] text-zinc-900 font-black tracking-tighter uppercase italic">V26.PROTOS_SECURE</span>
                  </div>
                </div>
              </div>
              <AnimatePresence>
                {error && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-cyber-red text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                  >
                    <AlertCircle size={12} className="animate-pulse" /> {error}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="p-8 bg-black border border-zinc-900 flex justify-between items-center group-hover:border-zinc-800 transition-colors">
              <div className="space-y-1">
                <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.3em] italic">Câmbio em Realtime</p>
                <p className="text-5xl font-heading text-white italic tracking-tighter">{pkg.price},00 <span className="text-lg">MT</span></p>
              </div>
              <div className="hidden sm:flex flex-col items-end gap-2">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-1 h-3 bg-cyber-cyan/20" />
                  ))}
                </div>
                <span className="text-[8px] font-black text-zinc-800 uppercase">Load_Balancing...</span>
              </div>
            </div>

            <button
              disabled={!isValid}
              onClick={() => onConfirm({ playerId, method })}
              className={`w-full py-8 font-black uppercase italic tracking-[0.3em] text-2xl transition-all relative overflow-hidden group ${
                isValid 
                ? 'bg-cyber-cyan text-black hover:bg-white hover:shadow-[0_0_50px_rgba(6,182,212,0.4)]' 
                : 'bg-zinc-900 text-zinc-800 cursor-not-allowed opacity-50'
              }`}
            >
              <span className="relative z-10 flex items-center justify-center gap-4">
                {isValid ? 'INICIAR TRANSMISSÃO' : error ? 'DADOS_CORROMPIDOS' : 'AGUARDANDO_DADOS'} <ChevronRight size={28} className={isValid ? 'animate-bounce-x' : ''} />
              </span>
            </button>

            <button 
              onClick={handleHelpClick}
              className="w-full text-zinc-600 hover:text-cyber-cyan text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-colors group mt-2"
            >
              <Sparkles size={12} className="group-hover:animate-pulse" />
              Dúvidas sobre este pacote? Consultar Sinal_IA
              <div className="h-[1px] flex-1 bg-zinc-900 group-hover:bg-cyber-cyan/20 transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const SuccessStep = ({ onReset, orderData }: any) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [complete, setComplete] = useState(false);

  const steps = [
    { label: 'Analise_OCR', sub: 'Escaneando comprovante de liquidação...', duration: 2500 },
    { label: 'Sinc_Terminal', sub: 'Vinculando ID de usuário ao pacote...', duration: 2000 },
    { label: 'Tunnel_Active', sub: 'Abrindo pipeline para servidor regional...', duration: 2200 },
    { label: 'Injection_V4', sub: 'Disparando créditos no node alvo...', duration: 1800 },
    { label: 'Finalizing', sub: 'Limpando cookies e confirmando hashes...', duration: 1500 },
  ];

  useEffect(() => {
    if (currentStep < steps.length) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, steps[currentStep].duration);
      return () => clearTimeout(timer);
    } else {
      setComplete(true);
    }
  }, [currentStep, steps.length]);

  return (
    <motion.div 
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="text-center py-16 bg-zinc-950 border border-zinc-900 px-10 relative overflow-hidden group shadow-2xl"
    >
      <div className="absolute top-0 left-0 w-full h-[1px] bg-cyber-emerald shadow-[0_0_20px_rgba(16,185,129,1)] group-hover:top-full transition-all duration-[4000ms] ease-in-out" />
      
      <div className="relative z-10 space-y-12">
        {!complete ? (
          <div className="space-y-12">
            <div className="flex flex-col items-center gap-6">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-zinc-900" />
                  <motion.circle
                    cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="4" fill="transparent"
                    strokeDasharray="251.2"
                    initial={{ strokeDashoffset: 251.2 }}
                    animate={{ strokeDashoffset: 251.2 - (251.2 * (currentStep / steps.length)) }}
                    className="text-cyber-emerald"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="text-cyber-emerald font-mono text-xl font-black">
                     {Math.round((currentStep / steps.length) * 100)}%
                   </div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-heading text-white italic tracking-tighter uppercase leading-none">PROCESSAMENTO <span className="text-cyber-emerald">AUTOMÁTICO</span></h3>
                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.4em] animate-pulse">Sinal_IA_Engine v4.2 Ativa</p>
              </div>
            </div>

            <div className="max-w-md mx-auto bg-black border border-zinc-900 p-6 text-left space-y-4 font-mono">
              {steps.map((s, i) => (
                <div key={s.label} className={`flex items-start gap-4 transition-all duration-500 ${i > currentStep ? 'opacity-20 blur-[1px]' : 'opacity-100'}`}>
                  <div className={`mt-1.5 w-2 h-2 rounded-full ${i < currentStep ? 'bg-cyber-emerald shadow-[0_0_8px_#10b981]' : (i === currentStep ? 'bg-white animate-ping' : 'bg-zinc-800')}`} />
                  <div className="space-y-1">
                    <p className={`text-[11px] font-black uppercase tracking-widest ${i === currentStep ? 'text-white' : (i < currentStep ? 'text-cyber-emerald' : 'text-zinc-700')}`}>
                      [{s.label}] {i < currentStep ? 'DONE' : (i === currentStep ? 'RUNNING...' : 'PENDING')}
                    </p>
                    <p className="text-[9px] text-zinc-500">{s.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="w-32 h-32 bg-black border border-zinc-900 flex items-center justify-center mx-auto mb-10 rotate-45 group">
              <CheckCircle2 className="w-16 h-16 text-cyber-emerald -rotate-45 group-hover:scale-110 transition-all duration-500" />
            </div>
            
            <div className="space-y-4">
              <h2 className="text-7xl font-heading tracking-tighter text-white italic">PEDIDO <span className="text-cyber-emerald">PROCESSADO</span></h2>
              <p className="text-zinc-600 font-black uppercase tracking-[0.4em] max-w-xl mx-auto text-[10px] leading-loose italic opacity-80">
                O sinal automático de <span className="text-cyber-emerald">ENTREGA INSTANTÂNEA</span> foi disparado. Seus créditos foram injetados no Player ID: <span className="text-white bg-zinc-900 px-2 py-0.5">{orderData?.playerId || 'SINCRONIZADO'}</span> via terminal prioritário.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="bg-black border border-zinc-900 p-8 flex flex-col items-center group-hover:border-cyber-emerald/30 transition-colors">
                <p className="text-zinc-800 text-[9px] mb-3 uppercase tracking-widest font-black italic">Tempo de Resposta</p>
                <p className="text-white font-black italic text-3xl tracking-tighter">Instantâneo</p>
              </div>
              <div className="bg-black border border-zinc-900 p-8 flex flex-col items-center group-hover:border-cyber-emerald/30 transition-colors">
                <p className="text-zinc-800 text-[9px] mb-3 uppercase tracking-widest font-black italic">Protocolo_Final</p>
                <p className="text-cyber-emerald font-black italic text-3xl tracking-tighter">ENTREGUE</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-5 justify-center pt-8">
              <button
                onClick={onReset}
                className="px-10 py-5 bg-white text-black font-black uppercase italic tracking-[0.2em] text-lg hover:bg-cyber-emerald transition-all"
              >
                RETORNAR AO TERMINAL
              </button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export const CopyBlock = ({ label, value, isCopied, onCopy }: any) => (
  <div className="group space-y-2">
    <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em]">{label}</p>
    <div className="bg-black/50 border border-zinc-800 p-4 flex justify-between items-center hover:border-cyber-cyan/30 transition-all">
      <p className="text-2xl font-mono font-bold text-white tracking-widest">{value}</p>
      <button 
        onClick={onCopy}
        className={`p-2 transition-all ${isCopied ? 'text-cyber-emerald' : 'text-zinc-700 hover:text-white'}`}
      >
        {isCopied ? <Check size={20} /> : <Copy size={20} />}
      </button>
    </div>
  </div>
);

export const PaymentInstructions = ({ 
  data, 
  pkg, 
  game,
  onComplete 
}: { 
  data: { playerId: string, method: 'MPESA' | 'EMOLA' }, 
  pkg: Package,
  game: Game,
  onComplete: () => void | Promise<void> 
}) => {
  const number = data.method === 'MPESA' ? '85.629.5597' : '87.108.7088';
  const [copied, setCopied] = useState<'number' | 'amount' | null>(null);

  const copyToClipboard = (text: string, type: 'number' | 'amount') => {
    navigator.clipboard.writeText(text).catch(err => {
      console.warn('Clipboard write failed:', err);
    });
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto space-y-12"
    >
      <div className="text-center md:text-left space-y-4">
        <h2 className="text-7xl font-heading text-white italic tracking-tighter">LIQUIDAÇÃO <span className="text-cyber-cyan">PENDENTE</span></h2>
        <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.5em] flex items-center justify-center md:justify-start gap-3 italic">
           Verificação de Protocolo Nível 2 Ativa
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-zinc-950 border border-zinc-900 p-10 space-y-10 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-cyber-cyan opacity-20" />
          
          <div className="flex items-center gap-4 text-cyber-cyan font-black uppercase text-[10px] tracking-widest pb-6 border-b border-zinc-900">
            <span className="w-8 h-8 bg-cyber-cyan text-black flex items-center justify-center font-bold">01</span>
            Instruções de Transferência
          </div>

          <div className="space-y-8">
            <CopyBlock 
              label="Endpoint de Destino (Telemóvel)" 
              value={number} 
              isCopied={copied === 'number'} 
              onCopy={() => copyToClipboard(number, 'number')} 
            />
            <CopyBlock 
              label="Montante de Câmbio (MZN)" 
              value={`${pkg.price},00`} 
              isCopied={copied === 'amount'} 
              onCopy={() => copyToClipboard(pkg.price.toString(), 'amount')} 
            />
          </div>

          <div className="p-5 bg-black border-l-4 border-cyber-cyan text-zinc-500 text-[9px] leading-relaxed uppercase tracking-widest font-black italic">
            Atenção: Use exatamente o valor especificado. Divergências podem retardar a sincronização em até 24h.
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 p-10 space-y-10 flex flex-col justify-between group">
          <div className="space-y-8">
            <div className="flex items-center gap-4 text-zinc-700 font-black uppercase text-[10px] tracking-widest pb-6 border-b border-zinc-900">
              <span className="w-8 h-8 bg-zinc-900 text-zinc-700 flex items-center justify-center font-bold">02</span>
              Validação de Transmissão
            </div>
            <p className="text-xs text-zinc-400 uppercase tracking-[0.2em] font-black leading-relaxed italic opacity-70">
              Após liquidar, dispare o gatilho de validação via WhatsApp. Nossa I.A. de triagem processará o ticket instantaneamente.
            </p>
          </div>

          <div className="space-y-4 mt-6">
            <button
              onClick={() => {
                const message = `Olá! Protocolo iniciado via Grid.%0A🚀 *PEDIDO:* ${pkg.name}%0A🕹️ *SERVIÇO:* ${game.name}%0A🎯 *ID ALVO:* ${data.playerId}%0A💳 *MÉTODO:* ${data.method}`;
                window.open(`https://wa.me/258856295597?text=${message}`, '_blank');
              }}
              className="w-full py-8 bg-cyber-emerald text-black font-black uppercase italic tracking-[0.3em] text-2xl hover:bg-white transition-all shadow-[0_0_50px_rgba(16,185,129,0.3)] flex items-center justify-center gap-4 relative group"
            >
              ENVIAR COMPROVATIVO
            </button>
            <button
              onClick={onComplete}
              className="w-full py-5 text-[11px] text-zinc-600 font-black uppercase tracking-[0.5em] hover:text-white transition-colors border border-transparent hover:border-zinc-900"
            >
              Confirmar no Terminal de Dados
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

