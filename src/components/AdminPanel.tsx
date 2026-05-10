import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gamepad2, 
  ArrowLeft, 
  RefreshCw, 
  AlertCircle, 
  User, 
  Activity, 
  Tag,
  MessageSquare,
  Bot,
  Zap,
  Link,
  Copy,
  ExternalLink,
  Plus,
  Trash2,
  Pencil
} from 'lucide-react';
import { db, auth } from '../firebase';
import { GAMES } from '../constants';
import { 
  collection, 
  setDoc, 
  doc, 
  getDoc,
  query, 
  orderBy, 
  limit, 
  getDocs, 
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { Game, Package } from '../types';

interface Stats {
  totalRevenue: number;
  pendingCount: number;
  majorPrice: number;
}

const TabButton = ({ active, onClick, label }: any) => (
  <button 
    onClick={onClick}
    className={`px-8 py-3 text-xs font-black tracking-[0.2em] uppercase transition-all ${
      active 
      ? 'bg-zinc-800 text-white shadow-lg' 
      : 'text-zinc-500 hover:text-zinc-300'
    }`}
  >
    {label}
  </button>
);

const StatsCard = ({ label, value, unit, color }: any) => (
  <div className={`p-8 bg-zinc-900/40 border-l-4 ${color} space-y-2 backdrop-blur-md`}>
    <p className="text-xs text-zinc-400 font-black uppercase tracking-[0.3em] italic">{label}</p>
    <div className="flex items-baseline gap-2">
      <p className="text-4xl font-heading text-white">{value}</p>
      <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{unit}</span>
    </div>
  </div>
);

const TransactionRow = ({ order, idx, onUpdate }: any) => (
  <motion.div 
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: idx * 0.03 }}
    className="bg-zinc-950/80 border border-zinc-900 p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 group hover:border-zinc-700 transition-all"
  >
    <div className="flex items-center gap-6 flex-1">
      <div className={`w-2 h-12 ${order.status === 'pending' ? 'bg-cyber-orange' : 'bg-cyber-emerald'} opacity-50`} />
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-cyber-cyan uppercase tracking-widest bg-cyber-cyan/10 px-2 py-0.5 border border-cyber-cyan/20">
            {order.method}
          </span>
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
            {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : 'Recent'}
          </span>
        </div>
        <h4 className="text-xl font-bold text-white tracking-tight italic">{order.pkgName}</h4>
        <div className="flex items-center gap-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest italic">
          <span>Target: <b className="text-white">ID-{order.playerId}</b></span>
          <span className="opacity-20">//</span>
          <span>Log: <b className="text-zinc-300">{order.id.slice(0, 8)}...</b></span>
        </div>
      </div>
    </div>

    <div className="flex items-center gap-8 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 border-zinc-900 pt-4 lg:pt-0">
      <div className="text-right">
        <p className="text-2xl font-black italic text-zinc-100 tracking-tighter">{order.price},00 <span className="text-xs">MT</span></p>
        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${order.status === 'pending' ? 'text-cyber-orange' : 'text-cyber-emerald'}`}>
          {order.status === 'pending' ? 'AGUARDANDO_TICKET' : 'MODULO_SINCRONIZADO'}
        </span>
      </div>
      
      {order.status === 'pending' && (
        <button 
          onClick={() => onUpdate(order.id, 'confirmado')}
          className="cyber-button scale-75 origin-right bg-cyber-cyan text-black"
        >
          AUTORIZAR
        </button>
      )}
    </div>
  </motion.div>
);

const GameConfigSection = ({ game, onAddPkg, onEditPkg, onTogglePkg }: any) => (
  <div className="space-y-8">
    <div className="flex items-center justify-between pb-4 border-b border-zinc-900/50">
      <div className="flex items-center gap-4">
        <div className={`p-3 bg-black border border-zinc-800 ${game.accent}`}>
          <Gamepad2 size={24} />
        </div>
        <h4 className="text-4xl font-heading text-white">{game.name.toUpperCase()}</h4>
      </div>
      <button 
        onClick={onAddPkg}
        className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-cyber-emerald text-xs font-black uppercase tracking-[0.2em] hover:bg-cyber-emerald hover:text-black transition-all"
      >
        + INJETAR PACOTE
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {game.packages.map((pkg: any) => (
        <div key={pkg.id} className={`p-6 bg-zinc-950 border transition-all flex flex-col justify-between h-48 group ${pkg.active === false ? 'border-zinc-900 opacity-40 grayscale' : 'border-zinc-900 hover:border-zinc-700'}`}>
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">ID: {pkg.id.slice(0, 10)}</p>
              <h5 className="text-lg font-bold text-white group-hover:text-cyber-cyan transition-colors">{pkg.name}</h5>
              {pkg.category && <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest opacity-60">CAT: {pkg.category}</span>}
            </div>
            <Tag size={16} className="text-zinc-800" />
          </div>

          <div className="space-y-4">
            <p className="text-xl font-black italic text-zinc-400">{pkg.price},00 <span className="text-xs">MT</span></p>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => onEditPkg(pkg)}
                className="py-2 bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] font-black uppercase hover:text-white transition-all"
              >
                EDITAR
              </button>
              <button 
                onClick={() => onTogglePkg(pkg.id, pkg.active !== false)}
                className={`py-2 text-[10px] font-black uppercase border transition-all ${pkg.active === false ? 'bg-cyber-emerald/10 border-cyber-emerald/30 text-cyber-emerald' : 'bg-cyber-red/10 border-cyber-red/30 text-cyber-red'}`}
              >
                {pkg.active === false ? 'REATIVAR' : 'DESLIGAR'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const PriceEditModal = ({ pkg, onClose, onSave }: any) => {
  const [val, setVal] = useState(pkg.price);
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    if (val <= 0) {
      setError('O preço deve ser um valor positivo superior a zero.');
      return;
    }
    onSave(val);
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm p-10 bg-zinc-900 border-l-4 border-cyber-cyan shadow-2xl relative overflow-hidden"
      >
        <div className="relative z-10 space-y-10">
          <div>
            <h3 className="text-3xl font-heading text-white mb-2 uppercase">RECALIBRAR <span className="text-cyber-cyan">PREÇO</span></h3>
            <p className="text-xs text-zinc-400 font-black uppercase tracking-[0.3em] italic">{pkg.name}</p>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs text-zinc-400 font-black uppercase tracking-widest">Novo Valor Unitário (MZN)</label>
              <input 
                type="number"
                value={val}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  setVal(n);
                  if (n > 0) setError(null);
                }}
                className={`w-full p-5 bg-black border font-mono text-3xl font-bold tracking-tight focus:outline-none transition-colors ${error ? 'border-cyber-red text-cyber-red' : 'border-zinc-800 text-cyber-cyan focus:border-cyber-cyan'}`}
              />
              <AnimatePresence>
                {error && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-[10px] font-black text-cyber-red uppercase tracking-widest flex items-center gap-2 mt-2"
                  >
                    <AlertCircle size={12} /> {error}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={handleSave}
                className="cyber-button bg-cyber-cyan text-black"
              >
                APLICAR ALTERAÇÕES
              </button>
              <button 
                onClick={onClose}
                className="cyber-button text-zinc-500 border-zinc-800"
              >
                ABORTAR
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const AddPackageModal = ({ onClose, onSave }: any) => {
  const [form, setForm] = useState({ name: '', price: 0, amount: 0, cat: 'DEFAULT' });
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    if (form.price <= 0) {
      setError('Preço inválido: O valor deve ser maior que zero.');
      return;
    }
    if (!form.name.trim()) {
      setError('Nome requerido: O pacote precisa de uma identificação.');
      return;
    }
    onSave(form.name, form.price, form.amount, form.cat);
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md p-10 bg-zinc-900 border-l-4 border-cyber-emerald shadow-2xl"
      >
        <h3 className="text-3xl font-heading text-white mb-8 uppercase italic">Injetar Novo <span className="text-cyber-emerald font-black">Produto</span></h3>
        
        <div className="space-y-4">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-cyber-red/10 border border-cyber-red/20 text-cyber-red text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mb-4"
            >
              <AlertCircle size={14} /> {error}
            </motion.div>
          )}

          <div className="space-y-1">
            <label className="text-xs text-zinc-400 font-black uppercase tracking-widest">Nomenclatura</label>
            <input 
              value={form.name} 
              onChange={e => {
                setForm({...form, name: e.target.value});
                setError(null);
              }} 
              className="cyber-input py-3" 
              placeholder="Ex: 1550 Diamantes" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-zinc-400 font-black uppercase tracking-widest">Taxa (MZN)</label>
              <input 
                type="number" 
                value={form.price} 
                onChange={e => {
                  const n = Number(e.target.value);
                  setForm({...form, price: n});
                  if (n > 0) setError(null);
                }} 
                className={`cyber-input py-3 ${error?.includes('Preço') ? 'border-cyber-red text-cyber-red' : ''}`} 
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-400 font-black uppercase tracking-widest">Volume Líquido</label>
              <input 
                type="number" 
                value={form.amount} 
                onChange={e => setForm({...form, amount: Number(e.target.value)})} 
                className="cyber-input py-3" 
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-400 font-black uppercase tracking-widest">Vetor de Categoria</label>
            <select 
              value={form.cat} 
              onChange={e => setForm({...form, cat: e.target.value})} 
              className="cyber-input py-3 appearance-none bg-black border border-zinc-800 text-white"
            >
              <option value="DEFAULT">PADRÃO</option>
              <option value="DIAMANTES">DIAMANTES</option>
              <option value="NIVEL">NÍVEL</option>
              <option value="ASSINATURA">ASSINATURA</option>
              <option value="PASSE">PASSE</option>
            </select>
          </div>
 
            <div className="flex flex-col gap-3 pt-6">
            <button 
              onClick={handleSave}
              className="cyber-button bg-cyber-emerald text-black border-transparent hover:bg-white shadow-lg"
            >
              ATIVAR NO CATÁLOGO
            </button>
            <button 
              onClick={onClose}
              className="cyber-button text-zinc-500 border-zinc-800"
            >
              CANCELAR INJEÇÃO
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const NoOrdersView = ({ onLogin }: any) => (
  <div className="py-20 text-center text-zinc-700 italic border border-zinc-900 bg-zinc-950/40 p-12 space-y-6">
    <AlertCircle className="w-12 h-12 text-cyber-red mx-auto mb-4 opacity-30" />
    <div className="space-y-2">
      <p className="font-black uppercase tracking-[0.4em] text-zinc-400">Fluxo de Dados Bloqueado</p>
      <p className="text-xs max-w-xs mx-auto opacity-50">Não foram encontrados registros ou o terminal não possui autorização central.</p>
    </div>
    {auth.currentUser?.isAnonymous && (
      <button 
        onClick={onLogin}
        className="cyber-button mx-auto scale-90 border-zinc-800 hover:border-white text-white"
      >
        <User size={16} /> AUTENTICAÇÃO GOOGLE
      </button>
    )}
  </div>
);

import { handleFirestoreError, OperationType } from '../utils';

export const AdminPanel = ({ onBack, onLogin }: { onBack: () => void, onLogin: () => void }) => {
  const [activeTab, setActiveTab] = useState<'TRANS' | 'PROD' | 'BOT'>('TRANS');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmado'>('all');
  const [orders, setOrders] = useState<any[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({ totalRevenue: 0, pendingCount: 0, majorPrice: 0 });
  const [botCommands, setBotCommands] = useState<any[]>([]);
  const [isAddingCommand, setIsAddingCommand] = useState(false);
  const [editingCommand, setEditingCommand] = useState<any | null>(null);
  const [newCommand, setNewCommand] = useState({ trigger: '', response: '', description: '' });
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [groupLink, setGroupLink] = useState('');
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [autoApprove, setAutoApprove] = useState(false);

  const fetchBotConfig = useCallback(async () => {
    try {
      const docRef = doc(db, 'config', 'bot');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        setWhatsappNumber(data.whatsappNumber || '');
        setGroupLink(data.groupLink || '');
        setAutoApprove(data.autoApprove || false);
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, 'config/bot');
    }
  }, []);

  const saveBotConfig = async () => {
    const path = 'config/bot';
    try {
      setIsSavingConfig(true);
      await setDoc(doc(db, 'config', 'bot'), { whatsappNumber, groupLink, autoApprove }, { merge: true });
      alert('Configurações salvas com sucesso!');
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, path);
    } finally {
      setIsSavingConfig(false);
    }
  };

  const fetchBotCommands = useCallback(async () => {
    const path = 'bot_commands';
    try {
      const snap = await getDocs(collection(db, path));
      setBotCommands(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
    }
  }, []);

  const fetchAllOrders = useCallback(async () => {
    const path = 'orders';
    try {
      const q = query(
        collection(db, path),
        orderBy('createdAt', 'desc'),
        limit(100)
      );
      const querySnapshot = await getDocs(q);
      const ordersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any)
      }));
      setOrders(ordersData);
      
      const rev = ordersData.reduce((acc, curr) => acc + (curr.price || 0), 0);
      const pending = ordersData.filter(o => o.status === 'pending').length;
      const prices = ordersData.map(o => o.price || 0);
      const major = prices.length > 0 ? Math.max(...prices) : 0;
      
      setStats({ totalRevenue: rev, pendingCount: pending, majorPrice: major });
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
    }
  }, []);

  const fetchGames = useCallback(async () => {
    const path = 'games';
    try {
      const gamesSnap = await getDocs(collection(db, path));
      if (gamesSnap.empty) {
        setGames([]);
        return;
      }
      const gamesData = await Promise.all(gamesSnap.docs.map(async (docSnapshot) => {
        const data = docSnapshot.data();
        const subPath = `games/${docSnapshot.id}/packages`;
        const pkgsSnap = await getDocs(collection(db, subPath));
        const pkgs = pkgsSnap.docs.map(pd => ({ id: pd.id, ...pd.data() }) as Package);
        return { 
          id: docSnapshot.id as any, 
          ...data,
          packages: pkgs
        } as Game;
      }));
      setGames(gamesData);
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchAllOrders(), fetchGames(), fetchBotCommands(), fetchBotConfig()]);
      } catch (e) {
        console.error("Admin init failed:", e);
      } finally {
        setLoading(false);
      }
    };
    init().catch(err => console.error("Admin unhandled init error:", err));
  }, [fetchAllOrders, fetchGames, fetchBotCommands, fetchBotConfig]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const path = `orders/${orderId}`;
    try {
      await setDoc(doc(db, 'orders', orderId), { status: newStatus }, { merge: true });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      setStats(prev => ({
        ...prev,
        pendingCount: newStatus === 'confirmado' ? prev.pendingCount - 1 : prev.pendingCount,
        majorPrice: prev.majorPrice // Mantendo interface
      }));
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  };

  const handleAddCommand = async () => {
    if (!newCommand.trigger || !newCommand.response) return;
    const triggerId = newCommand.trigger.replace(/\./g, '').toLowerCase();
    const path = `bot_commands/${triggerId || 'cmd'}`;
    try {
      await setDoc(doc(db, 'bot_commands', triggerId || 'cmd'), newCommand);
      await fetchBotCommands();
      setIsAddingCommand(false);
      setNewCommand({ trigger: '', response: '', description: '' });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  };

  const handleDeleteCommand = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este comando?')) return;
    const path = `bot_commands/${id}`;
    try {
      await deleteDoc(doc(db, 'bot_commands', id));
      await fetchBotCommands();
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, path);
    }
  };

  const [editingPkg, setEditingPkg] = useState<{ gameId: string, pkg: Package } | null>(null);
  const [addingPkgToGame, setAddingPkgToGame] = useState<string | null>(null);
  const [isAddingGame, setIsAddingGame] = useState(false);
  const [newGameData, setNewGameData] = useState({ name: '', description: '', color: 'bg-zinc-900', accent: 'text-cyan-500' });

  const handleAddPackage = async (gameId: string, name: string, price: number, amount: number, category: string) => {
    try {
      const id = `${gameId.toLowerCase().replace(/\s/g, '-')}-${Date.now()}`;
      await setDoc(doc(db, `games/${gameId}/packages`, id), {
        name,
        price,
        amount,
        category,
        active: true
      });
      await fetchGames();
      setAddingPkgToGame(null);
    } catch (e) {
      console.error(e);
      alert('Erro ao adicionar pacote');
    }
  };

  const handleUpdatePrice = async (gameId: string, pkgId: string, newPrice: number) => {
    try {
      await updateDoc(doc(db, `games/${gameId}/packages`, pkgId), { price: newPrice });
      await fetchGames();
      setEditingPkg(null);
    } catch (e) {
      console.error(e);
      alert('Erro ao atualizar preço');
    }
  };

  const handleAddGame = async () => {
    if (!newGameData.name) return;
    try {
      const gameId = newGameData.name.toLowerCase().replace(/\s+/g, '_');
      await setDoc(doc(db, 'games', gameId), {
        ...newGameData,
        active: true
      });
      await fetchGames();
      setIsAddingGame(false);
      setNewGameData({ name: '', description: '', color: 'bg-zinc-900', accent: 'text-cyan-500' });
    } catch (e) {
      console.error(e);
      alert('Erro ao adicionar jogo');
    }
  };

  const handleTogglePackage = async (gameId: string, pkgId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, `games/${gameId}/packages`, pkgId), { active: !currentStatus });
      await fetchGames();
    } catch (e) {
      console.error(e);
      alert('Erro ao alterar status');
    }
  };

  const seedInitialData = async () => {
    try {
      setLoading(true);
      const seedPromises = GAMES.map(async (g) => {
        const gameRef = doc(db, 'games', g.id);
        await setDoc(gameRef, {
          name: g.name,
          description: g.description,
          color: g.color || 'bg-zinc-900',
          accent: g.accent || 'text-cyan-500',
          startingPrice: g.startingPrice || (g.packages && g.packages.length > 0 ? Math.min(...g.packages.map(p => p.price)) : 0),
          active: true
        });
        
        const pkgPromises = g.packages.map(async (p) => {
          return setDoc(doc(db, `games/${g.id}/packages`, p.id), {
            name: p.name,
            amount: p.amount,
            price: p.price,
            category: 'DEFAULT',
            active: true
          });
        });
        await Promise.all(pkgPromises);
      });

      await Promise.all(seedPromises);
      await fetchGames();
      alert('Dados iniciais sincronizados com sucesso!');
    } catch (error) {
      console.error("Erro ao sincronizar dados:", error);
      alert('Falha na sincronização crítica.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch(err => {
      console.warn('Clipboard copy failed:', err);
    });
    alert('Copiado para o clipboard!');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-12 pb-20"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 pb-10 border-b border-zinc-900">
        <div className="space-y-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-cyber-red font-black uppercase text-xs tracking-[0.4em] hover:opacity-70 transition-opacity"
          >
            <ArrowLeft size={12} /> Desconectar Terminal
          </button>
          <h2 className="text-6xl font-heading text-white">NÚCLEO DE <span className="text-cyber-red">OPERAÇÕES</span></h2>
          <div className="flex items-center gap-4 text-zinc-400 text-xs uppercase font-black tracking-widest italic">
            <span>Terminal: #RX-0912</span>
            <span className="w-1.5 h-1.5 bg-cyber-emerald rounded-full" />
            <span>Sincronizado via Cloud</span>
            <span className="opacity-30">|</span>
            <span className="text-[10px] text-cyber-cyan opacity-60 lowercase font-mono">{auth.currentUser?.email}</span>
          </div>
        </div>
        
        <div className="flex gap-2 p-1 bg-zinc-950 border border-zinc-900">
          <TabButton active={activeTab === 'TRANS'} onClick={() => setActiveTab('TRANS')} label="Transações" />
          <TabButton active={activeTab === 'PROD'} onClick={() => setActiveTab('PROD')} label="Catálogo" />
          <TabButton active={activeTab === 'BOT'} onClick={() => setActiveTab('BOT')} label="Bot" />
        </div>
      </div>

      {activeTab === 'TRANS' ? (
        <div className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard label="Receita Bruta" value={`${stats.totalRevenue},00`} unit="MZN" color="border-cyber-cyan" />
            <StatsCard label="Fila de Espera" value={stats.pendingCount} unit="Tarefas" color="border-cyber-orange" />
            <StatsCard label="Volume Crítico" value={`${stats.majorPrice},00`} unit="MZN" color="border-cyber-red" />
          </div>

          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-heading italic uppercase tracking-widest text-zinc-400">Stream de Transmissões</h3>
                <div className="flex bg-zinc-950 border border-zinc-900 p-1">
                  <button onClick={() => setStatusFilter('all')} className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === 'all' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>Todos</button>
                  <button onClick={() => setStatusFilter('pending')} className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === 'pending' ? 'bg-cyber-orange text-black' : 'text-zinc-500 hover:text-zinc-300'}`}>Pendentes</button>
                  <button onClick={() => setStatusFilter('confirmado')} className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === 'confirmado' ? 'bg-cyber-emerald text-black' : 'text-zinc-500 hover:text-zinc-300'}`}>Confirmados</button>
                </div>
              </div>
              <RefreshCw className="text-zinc-800 cursor-pointer hover:text-white transition-colors" size={16} onClick={fetchAllOrders} />
            </div>
            
            {loading ? (
              <div className="py-20 text-center animate-pulse text-zinc-600 font-mono text-xs tracking-[0.5em]">BUFFERING_DATA_STREAM...</div>
            ) : orders.filter(o => statusFilter === 'all' || o.status === statusFilter).length === 0 ? (
              <NoOrdersView onLogin={onBack} />
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {orders.filter(o => statusFilter === 'all' || o.status === statusFilter).map((order, idx) => (
                  <TransactionRow key={order.id} order={order} idx={idx} onUpdate={updateOrderStatus} />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'PROD' ? (
        <div className="space-y-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h3 className="text-xl font-heading italic uppercase tracking-widest text-zinc-400">Gerenciador de Módulos</h3>
            <div className="flex gap-4">
              <button 
                onClick={() => setIsAddingGame(true)}
                className="px-4 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-cyber-cyan transition-all flex items-center gap-2"
              >
                <Plus size={14} /> NOVO JOGO
              </button>
              <button 
                onClick={seedInitialData}
                className="px-4 py-2 border border-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all flex items-center gap-2"
              >
                <RefreshCw size={14} /> SINCRONIZAR BASE
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="py-20 text-center animate-pulse text-zinc-600 font-mono text-xs tracking-[0.5em]">SCANNING_MODULES...</div>
          ) : games.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-zinc-900 bg-zinc-950/40 p-12 space-y-8">
              <div className="space-y-2">
                <AlertCircle className="w-12 h-12 text-zinc-800 mx-auto opacity-30" />
                <h4 className="text-xl font-heading text-zinc-500 uppercase">Banco de Dados Vazio</h4>
                <p className="text-xs text-zinc-600 max-w-sm mx-auto font-black uppercase tracking-widest">Nenhum jogo foi detectado na grid secundária de armazenamento.</p>
              </div>
              <button 
                onClick={seedInitialData}
                className="cyber-button mx-auto bg-cyber-cyan text-black"
              >
                SINCRONIZAR CATÁLOGO PADRÃO
              </button>
            </div>
          ) : (
            <div className="space-y-16">
              {games.map(game => (
                <GameConfigSection 
                  key={game.id} 
                  game={game} 
                  onAddPkg={() => setAddingPkgToGame(game.id)}
                  onEditPkg={(pkg: Package) => setEditingPkg({ gameId: game.id, pkg })}
                  onTogglePkg={(pkgId: string, status: boolean) => handleTogglePackage(game.id, pkgId, status)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-16">
          <div className="p-12 bg-zinc-950 border border-zinc-900 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity text-cyber-cyan">
              <Bot size={120} />
            </div>
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-cyber-cyan/10 border border-cyber-cyan/20 text-cyber-cyan">
                  <Bot size={24} />
                </div>
                <div>
                  <h3 className="text-4xl font-heading text-white italic">CENTRAL DE <span className="text-cyber-cyan">AUTOMAÇÃO</span></h3>
                  <div className="flex items-center gap-4 mt-2">
                    <p className="text-xs text-zinc-500 font-black uppercase tracking-[0.4em]">Gerenciamento de Gatilhos Inteligentes</p>
                    <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800">
                       <span className="w-2 h-2 bg-cyber-emerald rounded-full animate-pulse" />
                       <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">BOT_ACTIVE</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
                 <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Número do WhatsApp (Internacional)</label>
                       <input 
                         type="text"
                         value={whatsappNumber}
                         onChange={e => setWhatsappNumber(e.target.value)}
                         placeholder="Ex: 258840000000"
                         className="w-full bg-black border border-zinc-800 p-4 text-white font-mono text-sm focus:border-cyber-cyan outline-none"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Link do Grupo Oficial</label>
                       <input 
                         type="text"
                         value={groupLink}
                         onChange={e => setGroupLink(e.target.value)}
                         placeholder="Ex: https://chat.whatsapp.com/..."
                         className="w-full bg-black border border-zinc-800 p-4 text-white font-mono text-sm focus:border-cyber-cyan outline-none"
                       />
                    </div>
                 </div>

                 <div className="space-y-4">
                   <div className="flex items-center justify-between p-6 bg-zinc-900/50 border border-zinc-800 h-full">
                      <div className="space-y-1">
                        <p className="text-xs text-white font-black uppercase tracking-widest">Auto-Aprovação de Pedidos</p>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">Sinal de entrega enviado instantaneamente<br/>após o pagamento via M-Pesa/e-mola.</p>
                      </div>
                      <button 
                        onClick={() => setAutoApprove(!autoApprove)}
                        className={`w-14 h-8 flex items-center p-1 transition-colors duration-300 ${autoApprove ? 'bg-cyber-emerald shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-zinc-800'}`}
                      >
                        <div className={`w-6 h-6 bg-white transition-transform duration-300 ${autoApprove ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                   </div>
                 </div>
              </div>

               <div className="max-w-4xl pt-4">
                  <button 
                  onClick={saveBotConfig}
                  disabled={isSavingConfig}
                  className="w-full py-5 bg-zinc-800 text-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all disabled:opacity-50 shadow-xl"
                  >
                    {isSavingConfig ? 'SINCRONIZANDO...' : 'SALVAR CONFIGURAÇÕES DO NÚCLEO'}
                  </button>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Dynamic Command List */}
            <div className="space-y-8">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-3">
                  <MessageSquare className="text-cyber-emerald" size={18} />
                  <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white">Comandos e Gatilhos</h4>
                </div>
                <button 
                  onClick={() => {
                    setEditingCommand(null);
                    setNewCommand({ trigger: '', response: '', description: '' });
                    setIsAddingCommand(true);
                  }}
                  className="px-6 py-3 bg-cyber-emerald text-black text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all flex items-center gap-2 shadow-lg"
                >
                  <Plus size={16} /> NOVO COMANDO
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {botCommands.length === 0 ? (
                  <div className="p-20 text-center border border-zinc-900 bg-zinc-950/20 space-y-4">
                    <MessageSquare className="w-12 h-12 text-zinc-900 mx-auto" />
                    <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest italic">Nenhum gatilho de resposta configurado</p>
                  </div>
                ) : (
                  botCommands.map((cmd) => (
                    <div key={cmd.id} className="p-8 bg-black border border-zinc-900 group hover:border-cyber-cyan transition-all relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-cyber-cyan opacity-20" />
                      <div className="flex justify-between items-start mb-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black text-cyber-cyan bg-cyber-cyan/10 px-2 py-0.5 border border-cyber-cyan/20">TRIGGER</span>
                            <code className="text-xl font-mono font-black text-white">{cmd.trigger}</code>
                          </div>
                          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest italic pl-1">{cmd.description || 'Sem descrição'}</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              if (!whatsappNumber) {
                                alert('Erro: Vincule um número de WhatsApp primeiro nas configurações acima.');
                                return;
                              }
                              const cleanNumber = whatsappNumber.replace(/[^\d]/g, '');
                              copyToClipboard(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(cmd.trigger)}`);
                            }}
                            className="p-3 bg-zinc-900 text-zinc-500 hover:text-cyber-cyan transition-colors"
                            title="Copiar Link de Ativação"
                          >
                            <Link size={16} />
                          </button>
                          <button 
                            onClick={() => {
                              setEditingCommand(cmd);
                              setNewCommand({ trigger: cmd.trigger, response: cmd.response, description: cmd.description || '' });
                            }}
                            className="p-3 bg-zinc-900 text-zinc-500 hover:text-cyber-emerald transition-colors"
                            title="Editar Dados"
                          >
                            <Pencil size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteCommand(cmd.id)}
                            className="p-3 bg-zinc-900 text-zinc-500 hover:text-cyber-red transition-colors"
                            title="Remover Registro"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="p-6 bg-zinc-900/30 border border-zinc-800/50 text-xs text-zinc-400 font-mono leading-relaxed relative">
                        <div className="absolute top-2 right-2 opacity-10">
                          <MessageSquare size={14} />
                        </div>
                        <p className="whitespace-pre-wrap">{cmd.response}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Integration Guide Update */}
            <div className="bg-zinc-900/40 border border-zinc-800 p-8 space-y-8">
              <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
                <Zap className="text-cyber-orange" size={18} />
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">Guia de Implementação</h4>
              </div>
              
              <div className="space-y-6">
                {[
                  { step: "01", title: "AutoResponder WA", text: "Instale o app e adicione regras de 'Correspondência Exata' para cada comando configurado ao lado." },
                  { step: "02", title: "Webhook Manual", text: "Use o link gerado no botão 'Link' em seus botões de redirecionamento no site principal." },
                  { step: "03", title: "Padrão de Resposta", text: "Sempre que o bot detectar o prefixo '.', ele deve devolver o template configurado no painel." }
                ].map((s, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <span className="text-[9px] font-black text-cyber-orange bg-cyber-orange/10 border border-cyber-orange/20 px-2 py-0.5 mt-1">STEP_{s.step}</span>
                    <div className="space-y-1">
                      <p className="text-[10px] text-white font-black uppercase tracking-widest">{s.title}</p>
                      <p className="text-xs text-zinc-400 leading-relaxed italic">{s.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-zinc-800">
                 <button 
                  onClick={() => window.open('https://play.google.com/store/search?q=autoresponder+wa&c=apps', '_blank')}
                  className="w-full flex items-center justify-center gap-2 p-4 bg-black border border-zinc-800 text-zinc-500 text-[10px] font-black uppercase hover:text-white hover:border-cyber-orange transition-all"
                >
                  <ExternalLink size={14} /> Download Ferramenta de Notificação
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {editingPkg && (
          <PriceEditModal 
            pkg={editingPkg.pkg} 
            onClose={() => setEditingPkg(null)} 
            onSave={(price: number) => handleUpdatePrice(editingPkg.gameId, editingPkg.pkg.id, price)} 
          />
        )}
        {addingPkgToGame && (
          <AddPackageModal 
            onClose={() => setAddingPkgToGame(null)} 
            onSave={(name: string, price: number, amount: number, cat: string) => handleAddPackage(addingPkgToGame, name, price, amount, cat)} 
          />
        )}
        {isAddingGame && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-md bg-zinc-950 border border-zinc-900 p-8 space-y-8"
            >
              <h3 className="text-2xl font-heading text-white italic">CADASTRAR <span className="text-cyber-cyan">NOVO JOGO</span></h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Nome do Jogo</label>
                  <input 
                    type="text" 
                    className="w-full bg-black border border-zinc-800 p-4 text-white text-sm focus:border-cyber-cyan outline-none"
                    placeholder="Ex: Valorant"
                    value={newGameData.name}
                    onChange={e => setNewGameData({...newGameData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Descrição Curta</label>
                  <input 
                    type="text" 
                    className="w-full bg-black border border-zinc-800 p-4 text-white text-sm focus:border-cyber-cyan outline-none"
                    placeholder="Ex: Créditos para servidor MZ"
                    value={newGameData.description}
                    onChange={e => setNewGameData({...newGameData, description: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={handleAddGame}
                  className="flex-1 py-4 bg-cyber-cyan text-black font-black uppercase text-[10px] tracking-widest"
                >
                  SALVAR JOGO
                </button>
                <button 
                  onClick={() => setIsAddingGame(false)}
                  className="flex-1 py-4 bg-zinc-900 text-zinc-500 font-black uppercase text-[10px] tracking-widest"
                >
                  CANCELAR
                </button>
              </div>
            </motion.div>
          </div>
        )}
        {isAddingCommand || editingCommand ? (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-md bg-zinc-950 border border-zinc-900 p-8 space-y-8"
            >
              <h3 className="text-2xl font-heading text-white italic">
                {editingCommand ? 'EDITAR' : 'NOVO'} <span className="text-cyber-emerald">GATILHO</span>
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Gatilho (Trigger)</label>
                  <input 
                    type="text" 
                    className="w-full bg-black border border-zinc-800 p-4 text-white font-mono text-sm focus:border-cyber-emerald outline-none"
                    placeholder="Ex: .preços"
                    value={newCommand.trigger}
                    onChange={e => setNewCommand({...newCommand, trigger: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Descrição</label>
                  <input 
                    type="text" 
                    className="w-full bg-black border border-zinc-800 p-4 text-white text-sm focus:border-cyber-emerald outline-none"
                    placeholder="Ex: Envia lista de preços"
                    value={newCommand.description}
                    onChange={e => setNewCommand({...newCommand, description: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Resposta do Bot</label>
                  <textarea 
                    rows={4}
                    className="w-full bg-black border border-zinc-800 p-4 text-white text-sm focus:border-cyber-emerald outline-none resize-none"
                    placeholder="Nossos preços são: ..."
                    value={newCommand.response}
                    onChange={e => setNewCommand({...newCommand, response: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={async () => {
                    if (!newCommand.trigger || !newCommand.response) return;
                    
                    if (editingCommand) {
                      // Se o gatilho mudou, precisamos excluir o antigo e criar o novo porque o ID é o trigger
                      const oldId = editingCommand.id;
                      const newId = newCommand.trigger.replace(/\./g, '').toLowerCase();
                      
                      try {
                        if (oldId !== newId) {
                          await deleteDoc(doc(db, 'bot_commands', oldId));
                        }
                        await setDoc(doc(db, 'bot_commands', newId || 'cmd'), newCommand);
                        await fetchBotCommands();
                        setEditingCommand(null);
                        setNewCommand({ trigger: '', response: '', description: '' });
                      } catch (e) {
                        handleFirestoreError(e, OperationType.WRITE, `bot_commands/${newId}`);
                      }
                    } else {
                      handleAddCommand();
                    }
                  }}
                  className="flex-1 py-4 bg-cyber-emerald text-black font-black uppercase text-[10px] tracking-widest"
                >
                  {editingCommand ? 'ATUALIZAR' : 'SALVAR'} GATILHO
                </button>
                <button 
                  onClick={() => {
                    setIsAddingCommand(false);
                    setEditingCommand(null);
                    setNewCommand({ trigger: '', response: '', description: '' });
                  }}
                  className="flex-1 py-4 bg-zinc-900 text-zinc-500 font-black uppercase text-[10px] tracking-widest"
                >
                  CANCELAR
                </button>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminPanel;
