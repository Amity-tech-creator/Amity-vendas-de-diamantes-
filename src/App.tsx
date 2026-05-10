import { useState, useEffect, useCallback, FC, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gamepad2, 
  Smartphone, 
  CreditCard, 
  CheckCircle2, 
  ChevronRight, 
  Search, 
  User, 
  ArrowLeft,
  Info,
  Copy,
  Check,
  Bell,
  X,
  AlertCircle,
  Tag,
  RefreshCw,
  ShieldCheck,
  Activity,
  LayoutDashboard,
  Phone,
  MessageSquare,
  Plus,
  Eye,
  EyeOff,
  ArrowUpNarrowWide,
  ArrowDownWideNarrow,
  Loader2,
  Menu,
  Sparkles,
  Home,
  History,
  Terminal,
  LogOut,
  LogIn,
  Gem
} from 'lucide-react';

// Firebase Imports
import { db, auth, initFirebase } from './firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { 
  collection, 
  setDoc, 
  doc, 
  serverTimestamp, 
  getCountFromServer,
  query,
  where,
  Timestamp,
  getDocs,
  orderBy,
  limit,
  onSnapshot,
  getDocFromServer
} from 'firebase/firestore';

import { 
  GameType, 
  Package, 
  Game, 
  NotificationType, 
  Notification 
} from './types';

import { 
  GAMES, 
  PAYMENT_NUMBERS, 
  WHATSAPP_LINK, 
  WHATSAPP_SUPPORT_LINK 
} from './constants';

import { aiSearch } from './services/aiService';

import { handleFirestoreError, OperationType } from './utils';

// Lazy Load Heavy Components
const AdminPanel = lazy(() => import('./components/AdminPanel'));
const OrderHistory = lazy(() => import('./components/OrderHistory'));
const UserProfile = lazy(() => import('./components/UserProfile'));
const LoginScreen = lazy(() => import('./components/LoginScreen'));

import { AIAssistant } from './components/AIAssistant';

// --- Components ---

const GameCard: FC<{ game: Game, onClick: () => void }> = ({ game, onClick }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const accentColors: Record<string, string> = {
    [GameType.FREE_FIRE]: 'text-cyber-orange',
    [GameType.COD_MOBILE]: 'text-cyber-cyan',
    [GameType.PUBG_MOBILE]: 'text-cyber-red',
    [GameType.MOBILE_LEGENDS]: 'text-blue-400',
    [GameType.VALORANT]: 'text-cyber-red'
  };

  const borderColors: Record<string, string> = {
    [GameType.FREE_FIRE]: 'border-cyber-orange/20 group-hover:border-cyber-orange',
    [GameType.COD_MOBILE]: 'border-cyber-cyan/20 group-hover:border-cyber-cyan',
    [GameType.PUBG_MOBILE]: 'border-cyber-red/20 group-hover:border-cyber-red',
    [GameType.MOBILE_LEGENDS]: 'border-blue-500/20 group-hover:border-blue-500',
    [GameType.VALORANT]: 'border-cyber-red/20 group-hover:border-cyber-red'
  };

  const minPrice = (game.packages && game.packages.length > 0)
    ? Math.min(...game.packages.map((p: any) => p.price)) 
    : 0;

  return (
    <motion.div
      whileHover={{ 
        y: -12,
        scale: 1.02,
        transition: { type: "spring", stiffness: 400, damping: 17 }
      }}
      whileTap={{ scale: 1.05, opacity: 0.8 }}
      initial={{ opacity: 0, scale: 0.9, y: 30 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      onClick={onClick}
      className={`group relative h-64 cursor-pointer overflow-hidden bg-zinc-950/80 border transition-all duration-500 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)] ${borderColors[game.id]}`}
    >
      {/* Visual Glitch Decor */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative h-full p-8 flex flex-col justify-between z-10">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div 
              className={`p-4 bg-black border border-zinc-900 ${accentColors[game.id]} shadow-[0_0_15px_rgba(0,0,0,0.5)] relative cursor-help transition-transform hover:scale-110`}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <game.icon size={24} />
              
              <AnimatePresence>
                {showTooltip && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className="absolute z-[100] bottom-full mb-4 left-1/2 -translate-x-1/2 w-48 p-4 bg-black border border-zinc-900 shadow-[0_0_30px_rgba(0,0,0,0.8)] pointer-events-none"
                    style={{ backdropFilter: 'blur(10px)' }}
                  >
                     <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs">
                           <span className="text-zinc-400 uppercase font-black tracking-widest">Estoque</span>
                           <span className="text-white font-mono">{(game.packages?.length || 0)} Itens</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                           <span className="text-zinc-400 uppercase font-black tracking-widest">Base</span>
                           <span className="text-cyber-cyan font-mono">{minPrice},00 MT</span>
                        </div>
                        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
                        <div className="text-[10px] text-center text-zinc-400 uppercase tracking-tighter font-bold">Infor_Nodes_Active</div>
                     </div>
                     {/* Triangle pointer */}
                     <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-black border-r border-b border-zinc-900 rotate-45" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-emerald animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Protocolo.V4</span>
            </div>
          </div>
          
          <div>
            <h2 className="text-4xl font-heading text-white italic tracking-tighter uppercase leading-none">{game.name}</h2>
            <p className="text-[11px] text-zinc-400 mt-2 font-black uppercase tracking-widest italic opacity-80">
              {game.description}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-end pt-4 border-t border-zinc-900/50">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Fluxo Inicial</p>
            <p className={`text-2xl font-black italic tracking-tighter ${accentColors[game.id]}`}>
              {game.packages?.[0]?.price || 0},00 <span className="text-xs">MT</span>
            </p>
          </div>
          <div className="flex items-center gap-2 text-zinc-400 font-black italic text-[11px] tracking-widest group-hover:text-white transition-all">
            MODULO.CMD <ChevronRight className="w-4 h-4 text-cyber-cyan" />
          </div>
        </div>
      </div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
    </motion.div>
  );
};

const PackageSkeleton = () => (
  <div className="flex items-center justify-between p-6 bg-zinc-950/20 border border-zinc-900/50 animate-pulse">
    <div className="flex items-center gap-6">
      <div className="w-12 h-12 bg-zinc-900/50 border border-zinc-800" />
      <div className="space-y-2">
        <div className="w-48 h-6 bg-zinc-900/50" />
        <div className="w-24 h-3 bg-zinc-900/30" />
      </div>
    </div>
    <div className="flex flex-col items-end gap-2">
      <div className="w-16 h-2 bg-zinc-900/30" />
      <div className="w-24 h-10 bg-zinc-900/50" />
    </div>
  </div>
);

const PackageGrid = ({ 
  game, 
  onSelect, 
  onBack,
  isLoading 
}: { 
  game: Game, 
  onSelect: (pkg: Package) => void, 
  onBack: () => void,
  isLoading: boolean
}) => {
  const [sortOrder, setSortOrder] = useState<'default' | 'asc' | 'desc'>('default');

  const packages = game.packages || [];

  const getSortedPackages = (pkgs: Package[]) => {
    if (sortOrder === 'default') return pkgs;
    return [...pkgs].sort((a, b) => {
      if (sortOrder === 'asc') return a.price - b.price;
      return b.price - a.price;
    });
  };

  const sortedAll = getSortedPackages(packages);
  const isSorted = sortOrder !== 'default';

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <button 
        onClick={onBack}
        className="group flex items-center gap-3 text-zinc-600 hover:text-white transition-all uppercase text-[10px] font-black tracking-[0.3em]"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Retornar ao Setor de Jogos
      </button>

      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 pb-8 border-b border-zinc-900">
        <div className={`p-4 bg-black border border-zinc-800 ${game.accent}`}>
          <game.icon size={40} />
        </div>
        <div className="text-center md:text-left flex-1">
          <h2 className="text-6xl font-heading text-white">{game.name.toUpperCase()}</h2>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3 italic flex items-center justify-center md:justify-start gap-2">
            <span className="w-2 h-2 bg-cyber-emerald rounded-full animate-pulse" /> Protocolo de Recarga Ativo
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="text-[10px] text-zinc-500 font-black uppercase tracking-widest italic flex items-center gap-2">
            <Search size={14} className="text-zinc-700" /> Filtragem de Preços
          </div>
          <div className="flex bg-zinc-950 border border-zinc-900 p-1">
            <SortTrigger active={sortOrder === 'default'} onClick={() => setSortOrder('default')}>
              Padrão
            </SortTrigger>
            <SortTrigger active={sortOrder === 'asc'} onClick={() => setSortOrder('asc')}>
              <ArrowUpNarrowWide size={12} className="mr-2" /> Menor Preço
            </SortTrigger>
            <SortTrigger active={sortOrder === 'desc'} onClick={() => setSortOrder('desc')}>
              <ArrowDownWideNarrow size={12} className="mr-2" /> Maior Preço
            </SortTrigger>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {isLoading ? (
            <>
              <CategoryDivider label="Sincronizando Nodes" sublabel="Carregando pacotes disponíveis..." />
              {[...Array(6)].map((_, i) => (
                <PackageSkeleton key={i} />
              ))}
            </>
          ) : game.id === GameType.FREE_FIRE && !isSorted ? (
            <>
              <CategoryDivider label="Diamantes" />
              {packages.filter(p => !p.category || p.category === 'DIAMANTES' || p.category === 'DEFAULT').map((pkg, idx) => (
                <PackageItem key={pkg.id} pkg={pkg} idx={idx} onSelect={() => onSelect(pkg)} />
              ))}
              
              {packages.some(p => p.category === 'NIVEL') && (
                <>
                  <CategoryDivider label="Pacotes de Nível" sublabel="Exclusivo: 1x por conta" />
                  {packages.filter(p => p.category === 'NIVEL').map((pkg, idx) => (
                    <PackageItem key={pkg.id} pkg={pkg} idx={idx} onSelect={() => onSelect(pkg)} />
                  ))}
                </>
              )}

              {packages.some(p => p.category === 'ASSINATURA') && (
                <>
                  <CategoryDivider label="Assinaturas" />
                  {packages.filter(p => p.category === 'ASSINATURA').map((pkg, idx) => (
                    <PackageItem key={pkg.id} pkg={pkg} idx={idx} onSelect={() => onSelect(pkg)} />
                  ))}
                </>
              )}

              {packages.some(p => p.category === 'PASSE') && (
                <>
                  <CategoryDivider label="Passe Booyah" />
                  {packages.filter(p => p.category === 'PASSE').map((pkg, idx) => (
                    <PackageItem key={pkg.id} pkg={pkg} idx={idx} onSelect={() => onSelect(pkg)} />
                  ))}
                </>
              )}
            </>
          ) : (
            sortedAll.map((pkg, idx) => (
              <PackageItem key={pkg.id} pkg={pkg} idx={idx} onSelect={() => onSelect(pkg)} />
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
};

const SortTrigger = ({ active, onClick, children }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center px-4 py-2 text-[8px] font-black uppercase tracking-widest transition-all ${
      active 
      ? 'bg-zinc-800 text-cyber-cyan shadow-[0_0_10px_rgba(6,182,212,0.2)]' 
      : 'text-zinc-600 hover:text-zinc-400'
    }`}
  >
    {children}
  </button>
);

const CategoryDivider = ({ label, sublabel }: { label: string, sublabel?: string }) => (
  <div className="relative py-8 flex flex-col items-center">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-zinc-900"></div>
    </div>
    <div className="relative bg-black px-6 flex flex-col items-center">
      <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.5em]">{label}</span>
      {sublabel && <span className="text-[8px] text-cyber-cyan font-bold uppercase mt-1 tracking-widest opacity-60">[{sublabel}]</span>}
    </div>
  </div>
);

const PackageItem: FC<{ pkg: Package, idx: number, onSelect: () => void }> = ({ pkg, idx, onSelect }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        delay: idx * 0.05,
        type: "spring",
        stiffness: 400,
        damping: 30
      }}
      whileHover={{ scale: 1.01, x: 10, backgroundColor: "rgba(24, 24, 27, 0.8)" }}
      whileTap={{ 
        scale: 0.97, 
        filter: "brightness(1.5)",
        boxShadow: "0 0 20px rgba(6, 182, 212, 0.3)",
        borderColor: "rgba(6, 182, 212, 0.8)",
        transition: { duration: 0.1 }
      }}
      onClick={onSelect}
      className={`group flex items-center justify-between p-6 bg-zinc-900/30 border border-zinc-900 hover:border-cyber-cyan/50 cursor-pointer transition-all ${pkg.active === false ? 'opacity-30 grayscale pointer-events-none' : ''}`}
    >
      <div className="flex items-center gap-6">
        <div className="w-12 h-12 bg-black border border-zinc-800 flex items-center justify-center text-zinc-700 font-mono text-xs group-hover:text-cyber-cyan transition-colors">
          #{String(idx + 1).padStart(2, '0')}
        </div>
        <div>
          <h4 className="text-xl font-bold text-white group-hover:text-cyber-cyan transition-colors italic tracking-tight">{pkg.name}</h4>
          {/* Oculto Ref ID para usuários comuns, mantendo o visual limpo */}
        </div>
      </div>
      
      <div className="flex flex-col items-end">
        <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Custo Terminal</span>
        <div className="px-6 py-2 bg-zinc-800 text-zinc-100 font-black text-xl italic tracking-tighter group-hover:bg-cyber-cyan group-hover:text-black transition-all shadow-lg">
          {pkg.price},00 <span className="text-xs">MT</span>
        </div>
      </div>
    </motion.div>
  );
};

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

const CheckoutForm = ({ 
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
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Reconfigurar Transmissão
      </button>

      <div className="bg-zinc-950 border border-zinc-900 shadow-2xl relative overflow-hidden group">
        <div className={`absolute top-0 left-0 w-full h-1 transition-all duration-500 ${error ? 'bg-cyber-red shadow-[0_0_15px_rgba(239,68,68,0.5)]' : (isValid ? 'bg-cyber-emerald shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-zinc-800')}`} />
        
        <div className="p-8 lg:p-12 space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className={`p-4 bg-black border border-zinc-800 ${game.accent}`}>
                  <game.icon size={24} />
                </div>
                <div>
                  <h3 className="text-4xl font-heading text-white italic tracking-tighter">PROTOCOLO DE <span className="text-cyber-cyan">INJEÇÃO</span></h3>
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mt-1">{game.name.toUpperCase()} // SYS: {pkg.name}</p>
                </div>
              </div>
            </div>
            <div className="text-right flex items-center md:items-end flex-col gap-1">
              <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest italic">Auth Layer V.8</span>
              <div className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 border transition-colors ${error ? 'text-cyber-red bg-cyber-red/5 border-cyber-red/20' : (isValid ? 'text-cyber-emerald bg-cyber-emerald/5 border-cyber-emerald/20' : 'text-zinc-600 border-zinc-800')}`}>
                <Activity size={10} className={isValid ? 'animate-pulse' : ''} /> {error ? 'Integridade Violada' : (isValid ? 'Canal Seguro' : 'Aguardando Sinc.')}
              </div>
            </div>
          </div>
          
          <div className="space-y-10">
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] italic">
                <CreditCard size={12} className="text-cyber-cyan" /> Gateway de Liquidação
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  animate={{ x: error ? [-1, 1, -1, 1, 0] : 0 }}
                  transition={{ duration: 0.1, repeat: error ? 2 : 0 }}
                  type="text"
                  value={playerId}
                  onChange={(e) => {
                    setPlayerId(e.target.value);
                    if (!touched) setTouched(true);
                  }}
                  onBlur={() => setTouched(true)}
                  placeholder="ID DO USUÁRIO..."
                  className={`block w-full px-8 py-6 bg-black border focus:outline-none text-white placeholder:text-zinc-900 transition-all font-mono font-bold text-4xl tracking-[0.2em] outline-none shadow-inner ${
                    error ? 'border-cyber-red text-cyber-red focus:border-cyber-red shadow-[0_0_20px_rgba(239,68,68,0.1)]' : (isValid ? 'border-cyber-emerald/50 focus:border-cyber-emerald text-cyber-emerald' : 'border-zinc-900 focus:border-cyber-cyan')
                  }`}
                />
                <div className="absolute top-0 right-4 h-full flex items-center pointer-events-none">
                  <span className={`text-[8px] font-black uppercase tracking-widest transition-colors ${error ? 'text-cyber-red' : (isValid ? 'text-cyber-emerald' : 'text-zinc-800')}`}>
                    {error ? 'Err:_DATA_CORRUPTED' : (isValid ? 'Satus:_SYNCHRONIZED' : 'Awaiting_Input...')}
                  </span>
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

const MethodToggle = ({ active, onClick, label, sub, color, icon }: any) => (
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

const PaymentInstructions = ({ 
  data, 
  pkg, 
  gameId,
  onComplete 
}: { 
  data: { playerId: string, method: 'MPESA' | 'EMOLA' }, 
  pkg: Package,
  gameId: GameType,
  onComplete: () => void | Promise<void> 
}) => {
  const number = data.method === 'MPESA' ? PAYMENT_NUMBERS.MPESA : PAYMENT_NUMBERS.EMOLA;
  const [copied, setCopied] = useState<'number' | 'amount' | null>(null);

  const copyToClipboard = (text: string, type: 'number' | 'amount') => {
    navigator.clipboard.writeText(text);
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
          <ShieldCheck className="text-cyber-cyan" size={16} /> Verificação de Protocolo Nível 2 Ativa
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
              Após liquidar, dispare o gatilho de validação via <span className="text-cyber-emerald">WhatsApp Central</span>. Nossa I.A. de triagem processará o ticket instantaneamente.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => window.open(`${WHATSAPP_LINK}?text=Olá!%20Protocolo%20iniciado.%0A🕹️%20Servidor:%20${pkg.id}%0A📦%20Módulo:%20${pkg.name}%0A💰%20Valor:%20${pkg.price},00%20MT%0A🎯%20ID%20Target:%20${data.playerId}`, '_blank')}
              className="w-full py-6 bg-cyber-emerald text-black font-black uppercase italic tracking-[0.2em] text-xl hover:bg-white transition-all shadow-[0_0_40px_rgba(16,185,129,0.2)] flex items-center justify-center gap-4"
            >
              <Smartphone size={24} /> ENVIAR COMPROVATIVO
            </button>
            <button
              onClick={onComplete}
              className="w-full py-4 text-[10px] text-zinc-700 font-black uppercase tracking-[0.4em] hover:text-white transition-colors"
            >
              Confirmado no Terminal
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const CopyBlock = ({ label, value, isCopied, onCopy }: any) => (
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

const SuccessStep = ({ onReset }: { onReset: () => void }) => {
  return (
    <motion.div 
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="text-center py-24 bg-zinc-950 border border-zinc-900 px-10 relative overflow-hidden group shadow-2xl"
    >
      {/* Laser Line Scan */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-cyber-emerald shadow-[0_0_20px_rgba(16,185,129,1)] group-hover:top-full transition-all duration-[3000ms] ease-in-out" />
      
      <div className="relative z-10 space-y-12">
        <div className="w-32 h-32 bg-black border border-zinc-900 flex items-center justify-center mx-auto mb-10 rotate-45 group">
          <CheckCircle2 className="w-16 h-16 text-cyber-emerald -rotate-45 group-hover:scale-110 transition-all duration-500" />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-7xl font-heading tracking-tighter text-white italic">PEDIDO <span className="text-cyber-emerald">PROCESSADO</span></h2>
          <p className="text-zinc-600 font-black uppercase tracking-[0.4em] max-w-xl mx-auto text-[10px] leading-loose italic opacity-80">
            Seu protocolo de carga foi injetado na fila de prioridade. A sincronizar com os Nodes Centrais de cada servidor (SLA: 5-15 MIN).
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
          <div className="bg-black border border-zinc-900 p-8 flex flex-col items-center group-hover:border-cyber-emerald/30 transition-colors">
            <p className="text-zinc-800 text-[9px] mb-3 uppercase tracking-widest font-black italic">Latência de Rede</p>
            <p className="text-white font-black italic text-3xl tracking-tighter">Otimizado</p>
          </div>
          <div className="bg-black border border-zinc-900 p-8 flex flex-col items-center group-hover:border-cyber-emerald/30 transition-colors">
            <p className="text-zinc-800 text-[9px] mb-3 uppercase tracking-widest font-black italic">Status_Link</p>
            <p className="text-cyber-emerald font-black italic text-3xl tracking-tighter">FILA V.I.P</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-5 justify-center pt-8">
          <button
            onClick={() => window.open(WHATSAPP_LINK, '_blank')}
            className="px-10 py-5 bg-cyber-emerald text-black font-black uppercase italic tracking-[0.2em] text-lg hover:bg-white transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-center justify-center gap-3"
          >
            <Smartphone size={24} /> CANAL DE SUPORTE
          </button>
          <button
            onClick={onReset}
            className="px-10 py-5 bg-zinc-900 text-zinc-500 font-black uppercase italic tracking-[0.2em] text-lg hover:text-white transition-all"
          >
            NOVA TRANSMISSÃO
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const NotificationTray = ({ 
  notifications, 
  removeNotification 
}: { 
  notifications: Notification[], 
  removeNotification: (id: string) => void 
}) => {
  return (
    <div className="fixed bottom-16 sm:bottom-24 right-4 sm:right-12 z-[100] flex flex-col gap-4 w-full max-w-[340px]">
      <AnimatePresence mode="popLayout">
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            layout
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9, transition: { duration: 0.2 } }}
            className={`group relative p-6 bg-zinc-950/90 border border-zinc-900 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden`}
          >
            {/* Status Line */}
            <div className={`absolute left-0 top-0 h-full w-1 ${
              n.type === NotificationType.SUCCESS ? 'bg-cyber-emerald' :
              n.type === NotificationType.ERROR ? 'bg-cyber-red' :
              n.type === NotificationType.PROMO ? 'bg-cyber-orange' :
              'bg-cyber-cyan'
            } shadow-[0_0_10px_currentColor]`} />

            <button 
              onClick={() => removeNotification(n.id)}
              className="absolute top-2 right-2 p-1 text-zinc-800 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
            >
              <X size={14} />
            </button>

            <div className="flex gap-5">
              <div className={`mt-1 p-2 bg-black border border-zinc-800 ${
                n.type === NotificationType.SUCCESS ? 'text-cyber-emerald' :
                n.type === NotificationType.ERROR ? 'text-cyber-red' :
                n.type === NotificationType.PROMO ? 'text-cyber-orange' :
                'text-cyber-cyan'
              }`}>
                <n.icon size={18} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{n.title}</span>
                  <span className="text-[8px] text-zinc-800 font-mono">[{n.id.slice(0, 4)}]</span>
                </div>
                <p className="text-xs font-bold text-zinc-200 leading-relaxed italic pr-4">{n.message}</p>
              </div>
            </div>

            {/* Scanning Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [step, setStep] = useState<'HOME' | 'PACKAGES' | 'FORM' | 'PAYMENT' | 'SUCCESS' | 'ORDER_HISTORY' | 'ADMIN' | 'PROFILE' | 'AUTH'>('HOME');
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [selectedPkg, setSelectedPkg] = useState<Package | null>(null);
  const [checkoutData, setCheckoutData] = useState<{ playerId: string, method: 'MPESA' | 'EMOLA' } | null>(null);
  const [loadingGames, setLoadingGames] = useState(true);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiSearchResult, setAiSearchResult] = useState<any>(null);
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [isAppOpen, setIsAppOpen] = useState(true);
  const [aiTriggerMessage, setAiTriggerMessage] = useState<string | null>(null);
  
  // Reset trigger message after a short delay so it can be re-triggered
  useEffect(() => {
    if (aiTriggerMessage) {
      const timer = setTimeout(() => setAiTriggerMessage(null), 500);
      return () => clearTimeout(timer);
    }
  }, [aiTriggerMessage]);
  
  // Admin logic
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const [adminError, setAdminError] = useState(false);
  const [isAdminVerifying, setIsAdminVerifying] = useState(false);

  const handleAdminVerify = async () => {
    if (!adminPassword) return;
    
    setIsAdminVerifying(true);
    setAdminError(false);
    
    try {
      const { verifyAdminPassword } = await import('./services/adminService');
      const isValid = await verifyAdminPassword(adminPassword);
      
      if (isValid) {
        setStep('ADMIN');
        setShowAdminPrompt(false);
        setAdminPassword('');
      } else {
        setAdminError(true);
        setTimeout(() => setAdminError(false), 800);
      }
    } catch (error) {
      console.error('Erro na validação admin:', error);
      setAdminError(true);
    } finally {
      setIsAdminVerifying(false);
    }
  };

  // Real-time Stats
  const [onlineCount, setOnlineCount] = useState(1);
  const [deliveriesToday, setDeliveriesToday] = useState(1429);


  // Notification State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addNotification = useCallback((type: NotificationType, title: string, message: string, icon: any) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, type, title, message, icon }]);
    setTimeout(() => removeNotification(id), 6000);
  }, [removeNotification]);

  const handleAdminLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      if (auth.currentUser?.email === 'do2738735@gmail.com') {
        setStep('ADMIN');
        setShowAdminPrompt(false);
        setAdminError(false);
      } else {
        alert('Este e-mail não tem permissão de administrador.');
      }
    } catch (error) {
      console.error("Admin login error:", error);
    }
  };

  // Fetch Games & Seeding
  const fetchGamesData = useCallback(async () => {
    try {
      const gamesSnap = await getDocs(collection(db, 'games'));
      
      // Seeding if empty
      if (gamesSnap.empty) {
        console.log("Seeding database with default games...");
        const seedPromises = GAMES.map(async (g) => {
          const gameRef = doc(db, 'games', g.id);
          await setDoc(gameRef, {
            name: g.name,
            description: g.description,
            color: g.color || 'bg-zinc-900',
            accent: g.accent || 'text-cyan-500',
            active: true
          });
          
          const pkgPromises = g.packages.map(async (p, i) => {
            let category = 'DEFAULT';
            if (g.id === GameType.FREE_FIRE) {
              if (i < 6) category = 'DIAMANTES';
              else if (i < 9) category = 'NIVEL';
              else if (i < 11) category = 'ASSINATURA';
              else category = 'PASSE';
            }

            return setDoc(doc(db, `games/${g.id}/packages`, p.id), {
              name: p.name,
              amount: p.amount,
              price: p.price,
              category: category,
              active: true
            });
          });
          await Promise.all(pkgPromises);
        });

        await Promise.all(seedPromises);
        setGames(GAMES);
        setLoadingGames(false);
        return;
      }

      const getGameIcon = (name: string) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('free fire')) return Gamepad2;
        if (lowerName.includes('pubg')) return Gamepad2;
        return Smartphone;
      };

      const gamesData = gamesSnap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id as any,
          name: data.name,
          description: data.description,
          color: data.color,
          accent: data.accent,
          icon: getGameIcon(data.name),
          packages: [] // Initialize empty, fetch on demand
        } as Game;
      });

      setGames(gamesData);
      setLoadingGames(false);
    } catch (e) {
      console.error("Error loading games:", e);
      setLoadingGames(false);
    }
  }, []);

  const fetchPackagesForGame = async (gameId: string) => {
    const gameIndex = games.findIndex(g => g.id === gameId);
    if (gameIndex === -1) return;
    
    // If packages already loaded, don't fetch again
    if (games[gameIndex].packages && games[gameIndex].packages!.length > 0) return;

    setLoadingPackages(true);
    try {
      const pkgsSnap = await getDocs(collection(db, `games/${gameId}/packages`));
      const pkgs = pkgsSnap.docs.map(pd => ({ id: pd.id, ...pd.data() } as Package));
      
      const updatedGames = [...games];
      updatedGames[gameIndex] = {
        ...updatedGames[gameIndex],
        packages: pkgs
      };
      setGames(updatedGames);
      
      // Update selected game if it matches the fetching one
      if (selectedGame?.id === gameId) {
        setSelectedGame(updatedGames[gameIndex]);
      }
    } catch (e) {
      console.error(`Error loading packages for ${gameId}:`, e);
    } finally {
      // Small delay for better UX (skeletons visibility)
      setTimeout(() => setLoadingPackages(false), 800);
    }
  };

  // Initial Notifications & Firebase Init
  useEffect(() => {
    const init = async () => {
      try {
        await initFirebase();
        await fetchGamesData();
      } catch (e) {
        console.error("Critical initialization failure", e);
      }
    };
    init().catch(err => console.error("App unhandled init error:", err));

    const timer = setTimeout(() => {
      addNotification(
        NotificationType.PROMO, 
        'Promoção Ativa', 
        'Ganhe 5% de bônus em todas as recargas via M-Pesa hoje!', 
        Tag
      );
    }, 2000);

    const updateTimer = setTimeout(() => {
      addNotification(
        NotificationType.UPDATE, 
        'App Atualizado', 
        'Novos pacotes de COD Points adicionados à lista.', 
        RefreshCw
      );
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearTimeout(updateTimer);
    };
  }, [addNotification]);

  // Presence & Statistics Tracking
  useEffect(() => {
    let presenceInterval: NodeJS.Timeout;

    const updatePresence = async () => {
      if (!auth.currentUser) return;
      const path = `presence/${auth.currentUser.uid}`;
      try {
        await setDoc(doc(db, path), { lastSeen: serverTimestamp() });
      } catch (e) {
        // Silently fail or log for debug
      }
    };

    const fetchStats = async () => {
      try {
        // Count online users (last 5 minutes)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const presenceQuery = query(collection(db, 'presence'), where('lastSeen', '>=', Timestamp.fromDate(fiveMinutesAgo)));
        const presenceSnap = await getCountFromServer(presenceQuery);
        setOnlineCount(Math.max(1, presenceSnap.data().count));

        // Count orders today
        // Note: For privacy and performance, only count orders if the user has permission to list ALL orders (admin) 
        // OR simply display a base + slight variation for public stats
        setDeliveriesToday(1420 + Math.floor(Math.random() * 5)); // Base for visual effect

        // If user is admin, we can try to get real count
        if (user && user.email === 'do2738735@gmail.com') {
           const startOfDay = new Date();
           startOfDay.setHours(0, 0, 0, 0);
           const ordersQuery = query(collection(db, 'orders'), where('createdAt', '>=', Timestamp.fromDate(startOfDay)));
           const ordersSnap = await getCountFromServer(ordersQuery);
           setDeliveriesToday(1420 + ordersSnap.data().count);
        }
      } catch (e) {
        console.error("Failed to fetch stats (expected if not admin)", e);
      }
    };

    const startTracking = () => {
      updatePresence();
      fetchStats();
      presenceInterval = setInterval(() => {
        updatePresence();
        fetchStats();
      }, 30000); // Every 30 seconds
    };

    // Wait for auth before starting
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      setCheckingAuth(false);
      if (u) startTracking();
    });

    return () => {
      unsubscribe();
      if (presenceInterval) clearInterval(presenceInterval);
    };
  }, []);

  // AI Powered Search Logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 3) {
        setIsAiSearching(true);
        try {
          const result = await aiSearch(searchQuery);
          setAiSearchResult(result);
        } catch (error) {
          console.error("AI Search failed", error);
        } finally {
          setIsAiSearching(false);
        }
      } else {
        setAiSearchResult(null);
      }
    }, 800);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleGameSelect = (game: Game) => {
    setSelectedGame(game);
    setStep('PACKAGES');
    window.scrollTo(0, 0);
    fetchPackagesForGame(game.id);
  };

  const handlePackageSelect = (pkg: Package) => {
    if (!user) {
      setStep('AUTH');
      return;
    }
    setSelectedPkg(pkg);
    setStep('FORM');
    window.scrollTo(0, 0);
  };

  const handleFormConfirm = (data: { playerId: string, method: 'MPESA' | 'EMOLA' }) => {
    if (data.playerId.length < 5) {
      addNotification(
        NotificationType.ERROR,
        'Erro de Validação',
        'O ID inserido parece ser inválido ou muito curto.',
        AlertCircle
      );
      return;
    }
    setCheckoutData(data);
    setStep('PAYMENT');
    window.scrollTo(0, 0);
  };

  const handlePaymentComplete = async () => {
    const path = 'orders';
    try {
      if (!auth.currentUser) {
        setStep('AUTH');
        return;
      }

      if (selectedGame && selectedPkg && checkoutData && auth.currentUser) {
        const uid = auth.currentUser.uid;
        const orderId = `${Date.now()}-${uid.slice(0, 5)}`;
        await setDoc(doc(db, path, orderId), {
          userId: uid,
          playerId: checkoutData.playerId,
          gameId: selectedGame.id,
          packageId: selectedPkg.id,
          pkgName: selectedPkg.name,
          amount: selectedPkg.amount,
          price: selectedPkg.price,
          method: checkoutData.method,
          status: 'pending',
          createdAt: serverTimestamp()
        });
      }
      setStep('SUCCESS');
      addNotification(
        NotificationType.SUCCESS,
        'Pagamento Notificado',
        'Recebemos sua confirmação. Processando seus itens...',
        CheckCircle2
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      addNotification(
        NotificationType.ERROR,
        'Erro ao Registrar',
        'Não foi possível registrar seu pedido. Verifique sua conexão.',
        AlertCircle
      );
    }
    window.scrollTo(0, 0);
  };

  const handleReset = () => {
    setStep('HOME');
    setSelectedGame(null);
    setSelectedPkg(null);
    setCheckoutData(null);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[10px] text-zinc-800 font-black uppercase tracking-[0.5em] animate-pulse italic">
          Handshaking_Node_Access...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Suspense fallback={null}>
        <LoginScreen onLoginSuccess={(u) => setUser(u)} />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-black text-cyan-50 font-sans flex flex-col futuristic-grid">
      <div className="scanline" />
      
      {/* Notifications */}
      <NotificationTray 
        notifications={notifications} 
        removeNotification={removeNotification} 
      />

      {/* System Offline Overlay */}
      {!isAppOpen && user?.email !== 'do2738735@gmail.com' && (
        <div className="fixed inset-0 z-[999] bg-black flex flex-col items-center justify-center p-6 text-center">
          <div className="absolute inset-0 bg-grid-pattern opacity-10" />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 space-y-8"
          >
            <div className="w-24 h-24 bg-zinc-900 border border-cyber-red animate-pulse flex items-center justify-center mx-auto rounded-full shadow-[0_0_50px_rgba(239,68,68,0.3)]">
              <ShieldCheck className="text-cyber-red" size={48} />
            </div>
            <div className="space-y-4">
              <h2 className="text-5xl font-heading italic text-white tracking-tighter">SISTEMA <span className="text-cyber-red">OFFLINE</span></h2>
              <p className="text-zinc-500 font-black uppercase tracking-[0.4em] max-w-sm mx-auto text-[10px] leading-loose italic">
                O terminal da Grid está em manutenção de segurança. Protocolos root ativos apenas pela equipe técnica.
              </p>
            </div>
            <div className="pt-8 border-t border-zinc-900">
              <a 
                href={WHATSAPP_SUPPORT_LINK}
                target="_blank"
                className="px-10 py-5 bg-cyber-red/10 border border-cyber-red/30 text-cyber-red font-black uppercase italic tracking-[0.2em] text-lg hover:bg-cyber-red hover:text-black transition-all"
              >
                CONTATAR OPERADOR
              </a>
            </div>
          </motion.div>
        </div>
      )}

      {/* Navigation */}
      <nav className="relative z-50 h-24 border-b border-zinc-900 bg-black/80 backdrop-blur-xl sticky top-0 px-6 lg:px-12 flex items-center justify-between">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => { handleReset(); setSearchQuery(''); }}>
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-cyber-cyan to-blue-600 flex items-center justify-center transition-all group-hover:rotate-[360deg] duration-700 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] border border-white/10">
              <Gem className="text-white w-7 h-7 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
            </div>
            <div className="absolute -bottom-1 -right-1 p-1 bg-black border border-zinc-800 rounded-md shadow-lg">
              <ShieldCheck className="text-cyber-cyan w-3 h-3" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="block font-heading text-2xl text-white tracking-tighter leading-none font-black italic">AMITY <span className="text-cyber-cyan neon-glow">VENDAS</span></span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-[1px] w-4 bg-cyber-cyan/30" />
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.5em]">Elite Diamond Hub</span>
            </div>
          </div>
        </div>

        <div className="hidden md:flex gap-10 text-[11px] font-black uppercase tracking-[0.4em] text-zinc-400 items-center">
          <button 
            onClick={() => { setStep('HOME'); setSearchQuery(''); setIsMobileMenuOpen(false); }}
            className={`hover:text-white transition-all relative py-2 ${step === 'HOME' ? 'text-cyber-cyan' : ''}`}
          >
            Sinal_Base
            {step === 'HOME' && <motion.div layoutId="nav-line" className="absolute -bottom-1 left-0 w-full h-0.5 bg-cyber-cyan shadow-[0_0_10px_rgba(6,182,212,0.5)]" />}
          </button>
          <button 
            onClick={() => { setStep('ORDER_HISTORY'); setIsMobileMenuOpen(false); }}
            className={`hover:text-white transition-all relative py-2 ${step === 'ORDER_HISTORY' ? 'text-cyber-cyan' : ''}`}
          >
            Logs_Dados
            {step === 'ORDER_HISTORY' && <motion.div layoutId="nav-line" className="absolute -bottom-1 left-0 w-full h-0.5 bg-cyber-cyan shadow-[0_0_10px_rgba(6,182,212,0.5)]" />}
          </button>

          {user ? (
            <div className="flex items-center gap-6">
              <button 
                onClick={() => { setStep('PROFILE'); setIsMobileMenuOpen(false); }}
                className={`hover:text-white transition-all relative py-2 ${step === 'PROFILE' ? 'text-cyber-cyan' : ''}`}
              >
                Perfil_Usuário
                {step === 'PROFILE' && <motion.div layoutId="nav-line" className="absolute -bottom-1 left-0 w-full h-0.5 bg-cyber-cyan shadow-[0_0_10px_rgba(6,182,212,0.5)]" />}
              </button>
              <button 
                onClick={() => auth.signOut()}
                className="p-2 text-zinc-600 hover:text-cyber-red transition-colors"
                title="Sair do Sistema"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => { setStep('AUTH'); setIsMobileMenuOpen(false); }}
              className={`hover:text-white transition-all relative py-2 ${step === 'AUTH' ? 'text-cyber-cyan' : ''}`}
            >
              Iniciar_Sessão
              {step === 'AUTH' && <motion.div layoutId="nav-line" className="absolute -bottom-1 left-0 w-full h-0.5 bg-cyber-cyan shadow-[0_0_10px_rgba(6,182,212,0.5)]" />}
            </button>
          )}

          <button 
            onClick={() => { setShowAdminPrompt(true); setIsMobileMenuOpen(false); }}
            className="hover:text-cyber-red transition-all"
          >
            Acesso_Root
          </button>
          
          <button 
            onClick={() => { setAiTriggerMessage("__OPEN_ONLY__"); }}
            className={`flex items-center gap-2 px-4 py-2 bg-cyber-cyan/10 border border-cyber-cyan/20 text-cyber-cyan hover:bg-cyber-cyan hover:text-black transition-all group ${step === 'ADMIN' ? 'hidden' : ''}`}
          >
            <Sparkles size={14} className="group-hover:animate-spin" />
            <span className="hidden lg:inline uppercase tracking-widest text-[11px] font-black">Abrir Chat IA</span>
          </button>
          
          <div className="h-8 w-[1px] bg-zinc-900" />
          
          <div className="relative">
            <Bell className="w-4 h-4 hover:text-white cursor-pointer transition-colors" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-cyber-cyan rounded-full animate-ping" />
            )}
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-zinc-500 hover:text-white transition-colors relative z-[60]"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[55] md:hidden"
            />
            
            {/* Sidebar Panel */}
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[280px] bg-black border-l border-zinc-900 md:hidden z-[56] shadow-2xl flex flex-col pt-24 px-6 overflow-y-auto"
            >
              <div className="flex flex-col gap-2">
                <div className="text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-4 h-[1px] bg-zinc-800"></span>
                  Navegação
                </div>

                {[
                  { id: 'HOME', label: 'Jogos', icon: Home, color: 'text-white' },
                  !user && { id: 'AUTH', label: 'Entrar', icon: LogIn, color: 'text-white' },
                  { id: 'ORDER_HISTORY', label: 'Histórico', icon: History, color: 'text-white' },
                  { id: 'PROFILE', label: 'Perfil', icon: User, color: 'text-white', authOnly: true },
                ].filter(Boolean).map((item: any) => {
                  if (item.authOnly && !user) return null;
                  const isActive = step === item.id;
                  const Icon = item.icon;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setStep(item.id as any); setSearchQuery(''); setIsMobileMenuOpen(false); }}
                      className={`group flex items-center justify-between p-4 border transition-all ${
                        isActive 
                          ? 'bg-cyber-cyan/5 border-cyber-cyan/30 text-white' 
                          : 'bg-transparent border-transparent text-zinc-500 hover:bg-zinc-900/50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 transition-colors ${isActive ? 'text-cyber-cyan' : 'text-zinc-600 group-hover:text-zinc-400'}`}>
                          <Icon size={18} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.3em]">
                          {item.label}
                        </span>
                      </div>
                      {isActive && (
                        <motion.div 
                          layoutId="active-dot-mobile"
                          className="w-1.5 h-1.5 bg-cyber-cyan rounded-full shadow-[0_0_10px_rgba(6,182,212,1)]"
                        />
                      )}
                    </button>
                  );
                })}

                <button 
                  onClick={() => { setAiTriggerMessage("__OPEN_ONLY__"); setIsMobileMenuOpen(false); }}
                  className="flex items-center justify-between p-4 border border-cyber-cyan/10 bg-cyber-cyan/5 text-cyber-cyan hover:bg-cyber-cyan/10 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2">
                      <Sparkles size={18} className="group-hover:animate-spin" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.3em]">
                      Interagir com Sinal IA
                    </span>
                  </div>
                </button>

                <div className="h-[1px] bg-zinc-900/50 my-4" />

                <button 
                  onClick={() => { setShowAdminPrompt(true); setIsMobileMenuOpen(false); }}
                  className="flex items-center gap-4 p-4 text-cyber-red/70 hover:text-cyber-red hover:bg-cyber-red/5 transition-all text-left group"
                >
                  <div className="p-2">
                    <Terminal size={18} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                    Acesso Root
                  </span>
                </button>

                {user && (
                  <button 
                    onClick={() => { auth.signOut(); setIsMobileMenuOpen(false); }}
                    className="flex items-center gap-4 p-4 text-zinc-600 hover:text-white hover:bg-white/5 transition-all text-left group mt-auto mb-8"
                  >
                    <div className="p-2">
                      <LogOut size={18} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                      Sair do Sistema
                    </span>
                  </button>
                )}
              </div>

              <div className="mt-8 pt-8 border-t border-zinc-900 pb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-zinc-900 flex items-center justify-center font-black text-zinc-600 text-[10px]">
                    ID
                  </div>
                  <div>
                    <div className="text-[8px] text-zinc-700 font-mono">STATUS_CONEXÃO</div>
                    <div className="text-[10px] text-cyber-cyan font-mono animate-pulse uppercase">Encriptado</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12 md:py-20 relative">
        <AnimatePresence mode="wait">
          {(!user && step !== 'HOME') ? (
             <Suspense fallback={<div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin text-cyber-cyan" /></div>}>
               <LoginScreen onLoginSuccess={(u) => { setUser(u); setStep('HOME'); }} />
             </Suspense>
          ) : step === 'AUTH' ? (
             <Suspense fallback={<div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin text-cyber-cyan" /></div>}>
               <LoginScreen onLoginSuccess={(u) => { setUser(u); setStep('HOME'); }} />
             </Suspense>
          ) : step === 'HOME' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-20"
            >
              {/* Hero Banner Section */}
              <div className="relative w-full h-[400px] md:h-[500px] bg-zinc-950 border border-zinc-900 overflow-hidden group">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black" />
                
                {/* Neon Effects */}
                <div className="absolute top-0 left-0 w-full h-1 bg-cyber-cyan opacity-20 shadow-[0_0_20px_rgba(6,182,212,0.5)]" />
                <div className="absolute bottom-0 left-0 w-full h-1 bg-cyber-cyan opacity-20 shadow-[0_0_20px_rgba(6,182,212,0.5)]" />
                
                <div className="relative h-full flex flex-col items-center justify-center text-center p-8">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-6 relative"
                  >
                    <div className="w-24 h-24 md:w-32 md:h-32 border-4 border-cyber-cyan rounded-full flex items-center justify-center p-1 shadow-[0_0_30px_rgba(6,182,212,0.4)]">
                      <div className="w-full h-full bg-zinc-900 rounded-full flex items-center justify-center overflow-hidden relative">
                         <span className="text-4xl md:text-5xl font-black text-white italic">A</span>
                         <div className="absolute inset-0 bg-cyber-cyan/10 animate-pulse" />
                      </div>
                    </div>
                    {/* Character style sparks */}
                    <div className="absolute -top-4 -right-4">
                      <Sparkles className="text-cyber-cyan animate-bounce" size={24} />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-4"
                  >
                    <h2 className="text-4xl md:text-7xl font-heading italic text-white leading-none tracking-tighter drop-shadow-2xl">
                      AMITY <span className="text-cyber-cyan neon-glow">VENDAS</span> <br/> 
                      <span className="text-2xl md:text-4xl uppercase tracking-[0.5em] font-black text-white/50">DE DIAMANTES</span>
                    </h2>
                    <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-zinc-500 max-w-lg mx-auto">
                      O fornecedor elite de créditos Free Fire. <br/>
                      Segurança extrema e entrega instantânea via protocolo MZ.
                    </p>
                  </motion.div>
                </div>

                {/* Glitch Overlay */}
                <div className="absolute top-4 left-4 text-[8px] font-mono text-cyber-cyan opacity-30">
                  STATUS: ENCRYPTED_CONNECTION
                </div>
                <div className="absolute bottom-4 right-4 text-[8px] font-mono text-zinc-700">
                  AMITY_GLOBAL_NETWORK_V4.2
                </div>
              </div>

              {/* Sensitivity Generator Trigger Section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative group cursor-pointer"
                onClick={() => {
                  setAiTriggerMessage("Quero gerar uma sensibilidade otimizada para meu celular.");
                }}
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyber-cyan to-blue-600 opacity-20 blur-xl group-hover:opacity-40 transition-opacity" />
                <div className="relative bg-zinc-950 border border-zinc-900 p-8 flex flex-col md:flex-row items-center gap-8 overflow-hidden">
                  <div className="w-20 h-20 bg-black border border-zinc-800 flex items-center justify-center text-cyber-cyan group-hover:scale-110 transition-transform relative shrink-0">
                    <Activity size={32} className="group-hover:animate-pulse" />
                    <div className="absolute inset-0 bg-cyber-cyan/5 animate-pulse" />
                  </div>
                  
                  <div className="flex-1 text-center md:text-left space-y-2">
                    <div className="flex items-center justify-center md:justify-start gap-2">
                      <span className="text-xs font-black text-cyber-cyan tracking-[0.4em] uppercase">Módulo_Analítico</span>
                      <span className="w-8 h-[1px] bg-zinc-800" />
                      <span className="text-[10px] font-mono text-zinc-400">VER_8.5.1</span>
                    </div>
                    <h3 className="text-4xl font-heading text-white italic italic tracking-tighter uppercase">GERADOR DE <span className="text-cyber-cyan">SENSIBILIDADE IA</span></h3>
                    <p className="text-xs text-zinc-400 font-black uppercase tracking-[0.2em] leading-relaxed max-w-2xl opacity-80">
                      Otimize sua mira com precisão matemática. Nossa IA analisa seu modelo de dispositivo, DPI e HUD para entregar a sensibilidade ideal. <span className="text-white">Toque para iniciar calibração.</span>
                    </p>
                  </div>

                  <button className="px-10 py-5 bg-white text-black font-black uppercase italic tracking-[0.2em] text-sm hover:bg-cyber-cyan transition-all shrink-0">
                    INICIAR ENGINE
                  </button>
                  
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 p-2 opacity-10">
                    <Terminal size={40} />
                  </div>
                </div>
              </motion.div>

              <div className="space-y-6">
                <div className="text-cyber-cyan text-xs font-black uppercase tracking-[0.8em] flex items-center gap-4">
                  <span className="w-16 h-[2px] bg-cyber-cyan neon-glow"></span>
                  SISTEMA_RECARGA.PRO V2.4
                </div>
                <h1 className="text-7xl md:text-9xl font-heading italic text-white leading-[0.8] tracking-tighter">
                  NÚCLEO DE <br/> <span className="text-cyber-cyan">TRANSFERÊNCIA</span>
                </h1>
                <p className="text-zinc-400 max-w-lg text-xs font-black uppercase tracking-[0.3em] leading-relaxed italic opacity-80">
                  Acesso direto a pacotes de créditos para servidores Garena, Activision & Valve. 
                  Sincronização imediata via <span className="text-white">DarkFiber</span> em todo território nacional.
                </p>

                <div className="flex flex-wrap gap-4 mt-12">
                  <button 
                    onClick={() => {
                      const el = document.getElementById('grid-games');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="group px-12 py-5 bg-cyber-cyan text-black font-black uppercase italic tracking-[0.3em] hover:bg-white transition-all shadow-[0_0_30px_rgba(6,182,212,0.3)] flex items-center gap-3"
                  >
                    ACESSAR GRID <ChevronRight className="group-hover:translate-x-2 transition-transform" />
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative max-w-xl group">
                  <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                    <Search className={`transition-all duration-500 ${searchQuery ? 'text-cyber-cyan scale-110 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]' : 'text-zinc-800'}`} size={20} />
                  </div>
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="LOCALIZAR JOGO NA GRID..."
                    className="w-full bg-black border border-zinc-900 px-16 py-6 text-sm font-black uppercase tracking-[0.2em] italic text-cyber-cyan placeholder:text-zinc-800 focus:outline-none focus:border-cyber-cyan/50 focus:bg-zinc-950 transition-all hover:border-zinc-800 shadow-inner"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-4">
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="text-[10px] text-zinc-700 hover:text-white font-black uppercase tracking-widest underline decoration-cyber-cyan/30 underline-offset-4"
                      >
                        REDEFINIR
                      </button>
                    )}
                    <div className="h-4 w-[1px] bg-zinc-900" />
                    <span className="text-[10px] text-zinc-800 font-black uppercase tracking-[0.2em] font-mono">
                      {isAiSearching ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-3 h-3 animate-spin text-cyber-cyan" />
                          PESQUISANDO...
                        </span>
                      ) : (
                        <>{games.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase())).length + (searchQuery.length >= 2 ? 1 : 0)}_ENCONTRADOS</>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Search Recommendation */}
              <AnimatePresence>
                {aiSearchResult?.match && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 40 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="overflow-hidden"
                  >
                    <div 
                      onClick={() => {
                        const matchedGame = GAMES.find(g => g.id === aiSearchResult.gameId);
                        if (matchedGame) handleGameSelect(matchedGame);
                      }}
                      className="group cursor-pointer bg-zinc-950 border border-cyber-cyan/30 p-6 relative overflow-hidden flex flex-col md:flex-row items-center gap-6 hover:border-cyber-cyan transition-all"
                    >
                      <div className="absolute top-0 right-0 p-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[7px] font-black text-cyber-cyan uppercase tracking-widest bg-cyber-cyan/10 px-2 py-0.5 border border-cyber-cyan/20">RECOMENDAÇÃO INTELIGENTE</span>
                        </div>
                      </div>
                      
                      <div className="w-16 h-16 bg-cyber-cyan/10 border border-cyber-cyan/20 flex items-center justify-center relative shrink-0">
                        <Sparkles className="text-cyber-cyan animate-pulse" size={32} />
                        <div className="absolute -inset-1 bg-cyber-cyan/10 blur-xl rounded-full" />
                      </div>

                      <div className="flex-1 text-center md:text-left">
                        <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-2 flex items-center justify-center md:justify-start gap-2">
                           Sinal_IA Sugere: <span className="text-cyber-cyan font-italic">{GAMES.find(g => g.id === aiSearchResult.gameId)?.name || 'JOGO_DETECTADO'}</span>
                        </h3>
                        <p className="text-[10px] text-zinc-400 font-mono italic leading-relaxed max-w-2xl">
                          {aiSearchResult.reason}
                        </p>
                      </div>

                      <button className="px-6 py-3 bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan text-[10px] font-black uppercase tracking-[0.2em] hover:bg-cyber-cyan hover:text-black transition-all group-hover:scale-105">
                        VER JOGO
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Game Grid */}
              <div id="grid-games" className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
                {loadingGames ? (
                  <div className="col-span-1 md:col-span-2 py-20 text-center animate-pulse text-cyan-700 font-black tracking-widest uppercase">
                    SINCRONIZANDO CATÁLOGO DE PROTOCOLO...
                  </div>
                ) : (
                  <>
                    {games
                      .filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((game) => (
                        <GameCard 
                          key={game.id} 
                          game={game} 
                          onClick={() => handleGameSelect(game)} 
                        />
                      ))}
                    
                    {/* Dynamic Search result for any game */}
                    {searchQuery.length >= 2 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -12, transition: { type: "spring", stiffness: 400, damping: 17 } }}
                        className="relative overflow-hidden bg-zinc-950 border-4 border-dashed border-cyber-cyan/30 p-6 flex flex-col justify-between items-start group cursor-pointer h-64 hover:border-cyber-cyan transition-all"
                        onClick={() => window.open(`${WHATSAPP_LINK}?text=Olá,%20gostaria%20de%20comprar%20recarregas%20para%20o%20jogo:%20${encodeURIComponent(searchQuery)}`, '_blank')}
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-cyan/5 blur-3xl" />
                        <div className="relative z-10 w-full">
                          <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 border border-cyber-cyan/30 flex items-center justify-center">
                              <Plus className="text-cyber-cyan animate-pulse" size={20} />
                            </div>
                            <span className="text-[8px] font-black text-cyber-cyan uppercase tracking-[0.2em] bg-cyber-cyan/10 px-2 py-1 border border-cyber-cyan/20">
                              PROTOCOLO_MANUAL
                            </span>
                          </div>
                          <h3 className="text-2xl font-heading text-white line-clamp-2 uppercase italic">{searchQuery}</h3>
                        </div>
                        
                        <div className="relative z-10 w-full pt-4 border-t border-zinc-900 flex items-center justify-between">
                          <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Atendimento_Direto</span>
                          <div className="flex items-center gap-2 text-cyber-cyan text-[10px] font-black uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                            SOLICITAR <ChevronRight size={14} />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Default Request Game Card */}
                    {searchQuery === '' && (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="relative overflow-hidden bg-zinc-950 border-4 border-dashed border-zinc-900 p-6 flex flex-col justify-center items-center text-center group cursor-pointer h-52"
                        onClick={() => window.open(`${WHATSAPP_LINK}?text=Olá,%20gostaria%20de%20comprar%20recarregas%20pra%20outros%20jogos`, '_blank')}
                      >
                        <Search className="text-zinc-800 w-12 h-12 mb-4 group-hover:text-orange-600 transition-colors" />
                        <h3 className="text-2xl font-heading text-zinc-800 group-hover:text-white">Mais Jogos?</h3>
                        <p className="text-zinc-800 text-[10px] font-bold uppercase tracking-widest group-hover:text-zinc-500 mt-2">Peça via WhatsApp</p>
                      </motion.div>
                    )}

                    {games.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && searchQuery !== '' && (
                      <div className="col-span-1 md:col-span-2 mt-8 p-8 border border-zinc-900 bg-zinc-950/50 flex flex-col items-center text-center">
                        <div className="text-zinc-700 font-black text-4xl italic opacity-30 uppercase tracking-tighter mb-4 whitespace-nowrap">EXTRAS_DISPONÍVEIS_VIA_CHAT</div>
                        <p className="text-zinc-400 font-mono text-xs uppercase tracking-[0.3em] font-black max-w-md">O jogo selecionado não possui integração direta na Grid, mas o processamento manual está ativo para "{searchQuery.toUpperCase()}".</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="pt-24 border-t border-zinc-900 grid grid-cols-1 md:grid-cols-3 gap-8">
                <button 
                  onClick={() => setShowAdminPrompt(true)}
                  className="p-8 bg-zinc-950/50 border border-zinc-900 group flex flex-col items-center text-center gap-4 hover:border-cyber-red/30 transition-all"
                >
                  <ShieldCheck className="w-10 h-10 text-zinc-800 group-hover:text-cyber-red transition-colors" />
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 group-hover:text-white transition-colors">Acesso_ROOT</span>
                    <span className="text-[7px] font-black text-zinc-800 uppercase tracking-widest mt-1">Admin_Terminal_Node</span>
                  </div>
                </button>

                <a 
                  href={WHATSAPP_SUPPORT_LINK}
                  target="_blank"
                  rel="no-referrer"
                  className="p-8 bg-zinc-950/50 border border-zinc-900 group flex flex-col items-center text-center gap-4 hover:border-cyber-emerald/30 transition-all"
                >
                  <Smartphone className="w-10 h-10 text-zinc-800 group-hover:text-cyber-emerald transition-colors" />
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 group-hover:text-white transition-colors">Link_Direto</span>
                    <span className="text-[7px] font-black text-zinc-800 uppercase tracking-widest mt-1">Assistência_Operacional</span>
                  </div>
                </a>

                <div className="p-8 bg-zinc-950/50 border border-zinc-900 flex flex-col items-center text-center gap-4 group">
                  <div className="flex flex-col items-center gap-2">
                    <a href="tel:856295597" className="text-lg text-zinc-500 hover:text-cyber-cyan transition-colors font-mono font-bold tracking-widest">85.629.5597</a>
                    <a href="tel:871087088" className="text-lg text-zinc-500 hover:text-cyber-cyan transition-colors font-mono font-bold tracking-widest">87.108.7088</a>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700">Voice_Support_Channel</span>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'ORDER_HISTORY' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
            >
              <Suspense fallback={<div className="py-40 text-center animate-pulse text-zinc-800 font-mono text-[10px] tracking-[0.5em]">CARREGANDO HISTÓRICO...</div>}>
                <OrderHistory onBack={() => setStep('HOME')} />
              </Suspense>
            </motion.div>
          )}

          {step === 'ADMIN' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
            >
              <Suspense fallback={<div className="py-40 text-center animate-pulse text-zinc-800 font-mono text-[10px] tracking-[0.5em]">INICIALIZANDO TERMINAL...</div>}>
                <AdminPanel 
                  onBack={() => setStep('HOME')} 
                  onLogin={handleAdminLogin}
                />
              </Suspense>
            </motion.div>
          )}

          {step === 'PROFILE' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
            >
              <Suspense fallback={<div className="py-40 text-center animate-pulse text-zinc-800 font-mono text-[10px] tracking-[0.5em]">RECUPERANDO PERFIL...</div>}>
                <UserProfile 
                  onBack={() => setStep('HOME')} 
                />
              </Suspense>
            </motion.div>
          )}

          {step === 'PACKAGES' && selectedGame && (
            <motion.div
              key="packages"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <PackageGrid 
                game={selectedGame} 
                onSelect={handlePackageSelect}
                onBack={() => setStep('HOME')}
                isLoading={loadingPackages} 
              />
            </motion.div>
          )}

          {step === 'FORM' && selectedGame && selectedPkg && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <CheckoutForm 
                game={selectedGame} 
                pkg={selectedPkg} 
                onConfirm={handleFormConfirm}
                onBack={() => setStep('PACKAGES')} 
                onHelp={(msg) => setAiTriggerMessage(msg)}
              />
            </motion.div>
          )}

          {step === 'PAYMENT' && selectedPkg && checkoutData && selectedGame && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <PaymentInstructions 
                data={checkoutData} 
                pkg={selectedPkg}
                gameId={selectedGame.id}
                onComplete={handlePaymentComplete}
              />
            </motion.div>
          )}

          {step === 'SUCCESS' && (
            <SuccessStep onReset={handleReset} />
          )}
        </AnimatePresence>
      </main>

      {/* Support and Admin Access Section - Home only ideally, or fixed bottom */}
      {step === 'HOME' && (
        <section className="container mx-auto px-6 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a 
              href={`tel:856295597`}
              className="flex flex-col items-center justify-center p-6 bg-zinc-950/50 border border-zinc-900 group hover:border-cyber-cyan transition-all"
            >
              <Phone size={24} className="text-cyber-cyan mb-2 transition-transform group-hover:scale-110" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Suporte Voz</span>
              <span className="text-lg font-bold text-white font-mono mt-1">856295597</span>
            </a>
            
            <a 
              href={((import.meta as any).env?.VITE_WHATSAPP_SUPPORT_LINK) || 'https://wa.me/258856295597'} 
              target="_blank" 
              rel="no-referrer"
              className="flex flex-col items-center justify-center p-6 bg-zinc-950/50 border border-zinc-900 group hover:border-cyber-emerald transition-all"
            >
              <MessageSquare size={24} className="text-cyber-emerald mb-2 transition-transform group-hover:scale-110" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Suporte WhatsApp</span>
              <span className="text-lg font-bold text-white font-mono mt-1">ENVIAR MENSAGEM</span>
            </a>

            <button 
              onClick={() => setShowAdminPrompt(true)}
              className="flex flex-col items-center justify-center p-6 bg-zinc-900 border border-transparent group hover:bg-white hover:text-black transition-all"
            >
              <ShieldCheck size={24} className="mb-2 transition-transform group-hover:rotate-12" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Terminal de Controle</span>
              <span className="text-lg font-bold font-heading mt-1">SISTEMA ADM</span>
            </button>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-xs text-zinc-500 font-black uppercase tracking-[0.4em]">Linha Secundária: 871087088 // STATUS: OPERACIONAL</p>
          </div>
        </section>
      )}

      {/* Bottom Bar Info */}
      <div className="h-12 bg-black border-t border-cyan-500/30 flex items-center justify-between px-6 sm:px-10 text-xs font-black uppercase tracking-[0.3em] text-cyan-400 relative z-50">
        <span className="hidden sm:inline opacity-60">LINK QUANTUM: SEGURO</span>
        <div className="flex gap-6 mx-auto sm:mx-0">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            ANÁLISE DE REDE: {onlineCount} ATIVOS
          </span>
          <span className="text-white">TRANSAÇÕES_HOJE: {deliveriesToday}</span>
        </div>
      </div>

      <AnimatePresence>
        {showAdminPrompt && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={adminError ? { 
                x: [-5, 5, -5, 5, 0],
                scale: 1,
                opacity: 1,
                y: 0
              } : { scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: adminError ? 0.4 : 0.3 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`w-full max-w-sm p-10 bg-zinc-950 border border-zinc-900 shadow-2xl relative overflow-hidden`}
            >
              {/* Accents */}
              <div className={`absolute top-0 left-0 w-full h-1 ${adminError ? 'bg-cyber-red' : 'bg-cyber-cyan'}`} />
              <div className={`absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 ${adminError ? 'border-cyber-red' : 'border-cyber-cyan'} opacity-20`} />

              <div className="relative z-10">
                <div className="mb-10">
                  <h3 className={`text-4xl font-heading mb-2 italic tracking-tighter ${adminError ? 'text-cyber-red' : 'text-white'}`}>
                    {adminError ? 'SISTEMA_RESTRITO' : <>ACESSO <span className="text-cyber-cyan">NÚCLEO</span></>}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-600">
                    <ShieldCheck size={12} />
                    <span>Verificação de Protocolo de Segurança</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] text-zinc-700 font-black uppercase tracking-widest italic">Chave de Encriptação</label>
                    <div className="relative">
                      <input 
                        type={showAdminPassword ? "text" : "password"}
                        placeholder="••••"
                        autoFocus
                        disabled={isAdminVerifying}
                        className={`w-full p-6 bg-black border ${adminError ? 'border-cyber-red text-cyber-red' : 'border-zinc-900 text-cyber-cyan'} font-mono text-center text-4xl font-bold tracking-[0.5em] focus:outline-none transition-all placeholder:opacity-20 pr-16`}
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAdminVerify();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-700 hover:text-white transition-colors"
                      >
                        {showAdminPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={handleAdminVerify}
                      disabled={isAdminVerifying}
                      className="cyber-button bg-cyber-cyan text-black flex items-center justify-center gap-2"
                    >
                      {isAdminVerifying ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        'AUTENTICAR TERMINAL'
                      )}
                    </button>

                    <div className="relative py-4 flex items-center justify-center">
                      <div className="absolute w-full h-[1px] bg-zinc-900" />
                      <span className="relative z-10 bg-zinc-950 px-4 text-[8px] text-zinc-700 font-black uppercase tracking-widest">OU</span>
                    </div>

                    <button 
                      onClick={async () => {
                        const provider = new GoogleAuthProvider();
                        try {
                          await signInWithPopup(auth, provider);
                          if (auth.currentUser?.email === 'do2738735@gmail.com') {
                            setStep('ADMIN');
                            setShowAdminPrompt(false);
                            setAdminPassword('');
                            setAdminError(false);
                          } else {
                            addNotification(NotificationType.ERROR, 'ACESSO NEGADO', 'Identidade não reconhecida pelo sistema.', AlertCircle);
                          }
                        } catch (e) {
                          console.error(e);
                        }
                      }}
                      className="flex items-center justify-center gap-3 w-full py-4 bg-white text-black text-[10px] font-black uppercase tracking-[0.1em] hover:bg-zinc-200 transition-all border-b-4 border-zinc-400"
                    >
                      <User size={14} /> AUTENTICAÇÃO GOOGLE_BIOMÉTRICA
                    </button>

                    <button 
                      onClick={() => {
                        setShowAdminPrompt(false);
                        setAdminPassword('');
                        setAdminError(false);
                      }}
                      className="w-full py-3 text-[10px] text-zinc-600 font-black uppercase tracking-widest hover:text-white transition-colors mt-2"
                    >
                      CANCELAR OPERAÇÃO
                    </button>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-cyber-cyan/5 rounded-full blur-3xl" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <AIAssistant 
        isAdmin={user?.email === 'do2738735@gmail.com'} 
        userEmail={user?.email}
        onSystemToggle={setIsAppOpen}
        externalMessage={aiTriggerMessage}
        setStep={setStep}
        setSelectedGame={(gameId: string) => {
          const game = GAMES.find(g => g.id === gameId);
          if (game) {
            setSelectedGame(game);
            setStep('PACKAGES');
          }
        }}
      />
    </div>
  );
}

// Fixed placeholder icon usage in loop
const smartphoneIcon = Smartphone;
