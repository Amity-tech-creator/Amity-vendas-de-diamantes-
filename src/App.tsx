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
import { db, auth } from './firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { 
  collection, 
  setDoc, 
  doc, 
  getDoc,
  serverTimestamp, 
  query,
  where,
  getDocs,
  orderBy,
  limit,
  onSnapshot,
  getCountFromServer,
  getDocFromServer
} from 'firebase/firestore';

import { 
  GameType, 
  Package, 
  Game, 
  NotificationType, 
  UserProfile as IUserProfile
} from './types';

import { 
  GAMES, 
  WHATSAPP_LINK, 
  WHATSAPP_SUPPORT_LINK 
} from './constants';

import { aiSearch } from './services/aiService';
import { handleFirestoreError, reportFirestoreError, OperationType } from './utils';

// Views and Components
const AdminPanel = lazy(() => import('./components/AdminPanel'));
const OrderHistory = lazy(() => import('./components/OrderHistory'));
const UserProfile = lazy(() => import('./components/UserProfile'));
const LoginScreen = lazy(() => import('./components/LoginScreen'));

import { AIAssistant } from './components/AIAssistant';
import { LiveAutomationFeed } from './components/LiveAutomationFeed';
import { GameCard, PackageItem, PackageGrid } from './components/GameComponents';
import { CheckoutForm, PaymentInstructions, SuccessStep } from './components/CheckoutViews';
import { NotificationTray } from './components/NotificationTray';
import { Notification } from './types';

// --- Layout Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick, badge }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-6 py-4 transition-all duration-300 group relative ${
      active 
      ? 'bg-zinc-900 text-cyber-cyan border-r-2 border-cyber-cyan' 
      : 'text-zinc-500 hover:text-white hover:bg-zinc-950/50'
    }`}
  >
    <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
      <Icon size={20} />
    </div>
    <span className="text-[10px] font-black uppercase tracking-[0.3em] italic">{label}</span>
    {badge && (
      <span className="absolute right-4 px-1.5 py-0.5 bg-cyber-emerald text-black text-[8px] font-black rounded-sm animate-pulse">
        {badge}
      </span>
    )}
  </button>
);

const Sidebar = ({ currentStep, setStep, isAdmin, userProfile }: any) => (
  <aside className="w-72 bg-black border-r border-zinc-900 flex flex-col h-full overflow-y-auto scrollbar-hide">
    <div className="p-8 border-b border-zinc-900 flex flex-col items-center gap-4">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-cyber-cyan to-cyber-emerald opacity-20 blur group-hover:opacity-40 transition-opacity" />
        <div className="relative w-16 h-16 bg-black border border-zinc-800 flex items-center justify-center">
          <Gem className="text-cyber-cyan w-8 h-8 group-hover:scale-110 transition-transform" />
        </div>
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-heading text-white italic tracking-tighter uppercase">GRID <span className="text-cyber-cyan">SIGNAL</span></h1>
        <p className="text-[8px] text-zinc-600 font-black uppercase tracking-[0.4em] mt-1">Sinal_IA Engine v4.2</p>
      </div>
    </div>

    <div className="flex-1 py-8">
      <div className="px-6 mb-6">
        <p className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.4em] mb-4 italic">Protocolos_Privados</p>
        <div className="space-y-1">
          <SidebarItem 
            icon={Home} 
            label="Dashboard" 
            active={currentStep === 'HOME' || currentStep === 'PACKAGES' || currentStep === 'FORM' || currentStep === 'PAYMENT' || currentStep === 'SUCCESS'} 
            onClick={() => setStep('HOME')} 
          />
          <SidebarItem 
            icon={History} 
            label="Meus Pedidos" 
            active={currentStep === 'ORDER_HISTORY'} 
            onClick={() => setStep('ORDER_HISTORY')} 
          />
          <SidebarItem 
            icon={User} 
            label="Perfil Node" 
            active={currentStep === 'PROFILE'} 
            onClick={() => setStep('PROFILE')} 
          />
        </div>
      </div>

      <div className="px-6 mb-6">
        <p className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.4em] mb-4 italic">Operações_Sinal</p>
        <div className="space-y-1">
          <SidebarItem 
            icon={Activity} 
            label="Live Feed" 
            onClick={() => {}} 
            badge="LIVE"
          />
          <SidebarItem 
            icon={MessageSquare} 
            label="Suporte" 
            onClick={() => window.open(WHATSAPP_SUPPORT_LINK, '_blank')} 
          />
        </div>
      </div>

      {isAdmin && (
        <div className="px-6 mb-6">
          <p className="text-[9px] font-black text-cyber-cyan/50 uppercase tracking-[0.4em] mb-4 italic">Master_Control</p>
          <div className="space-y-1">
            <SidebarItem 
              icon={Terminal} 
              label="Terminal Admin" 
              active={currentStep === 'ADMIN'} 
              onClick={() => setStep('ADMIN')} 
            />
          </div>
        </div>
      )}
    </div>

    <div className="mt-8 p-6 bg-zinc-950/50 border-t border-zinc-900 space-y-6">
      {userProfile && (
        <div className="flex items-center gap-4 p-3 bg-black border border-zinc-900 rounded-sm">
          <div className="w-10 h-10 bg-zinc-900 rounded-sm overflow-hidden border border-zinc-800 flex items-center justify-center">
            <User size={20} className="text-zinc-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-white truncate uppercase italic">{userProfile.displayName}</p>
            <p className="text-[9px] text-cyber-emerald font-bold uppercase tracking-widest">{userProfile.balance},00 MT</p>
          </div>
        </div>
      )}
      
      <button 
        onClick={() => auth.signOut()}
        className="w-full py-3 bg-zinc-900 hover:bg-cyber-red/20 text-zinc-500 hover:text-cyber-red transition-all border border-transparent hover:border-cyber-red/30 flex items-center justify-center gap-3 group"
      >
        <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-[9px] font-black uppercase tracking-widest italic">Encerrar Sessão</span>
      </button>
    </div>
  </aside>
);

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
  const [paymentStatus, setPaymentStatus] = useState<'IDLE' | 'VERIFYING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

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

  const [userProfile, setUserProfile] = useState<IUserProfile | null>(null);
  const [isReseller, setIsReseller] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Sync Auth State
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch or create profile
        try {
          const profileSnap = await getDoc(doc(db, 'profiles', currentUser.uid));
          if (profileSnap.exists()) {
            const data = profileSnap.data() as IUserProfile;
            setUserProfile(data);
            setIsAdmin(data.role === 'admin');
            setIsReseller(data.role === 'reseller');
          } else {
            // New user initialization
            const newProfile: IUserProfile = {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'Piloto Desconhecido',
              balance: 0,
              role: 'user',
              vipLevel: 0,
              createdAt: serverTimestamp()
            };
            try {
              await setDoc(doc(db, 'profiles', currentUser.uid), newProfile);
              setUserProfile(newProfile);
            } catch (writeErr) {
              reportFirestoreError(writeErr, OperationType.WRITE, `profiles/${currentUser.uid}`);
            }
          }
        } catch (e) {
          console.error("Erro ao carregar perfil:", e);
          reportFirestoreError(e, OperationType.GET, `profiles/${currentUser.uid}`);
        }
      } else {
        setUserProfile(null);
        setIsAdmin(false);
        setIsReseller(false);
      }
      setCheckingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Games
  // Firebase Initialization Check
  const initFirebase = async () => {
    try {
      // Test connection
      await getDocFromServer(doc(db, 'system', 'handshake'));
    } catch (error) {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.error("Firebase is offline. Check configuration.");
      }
    }
  };

  const fetchGamesData = useCallback(async () => {
    try {
      const gamesSnap = await getDocs(collection(db, 'games'));
      
      const getGameIcon = (name: string) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('free fire')) return Gamepad2;
        if (lowerName.includes('pubg')) return Gamepad2;
        return Smartphone;
      };

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
            startingPrice: g.startingPrice || 0,
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
              active: true,
              bonus: p.bonus || '',
              exactAmount: p.exactAmount || `${p.amount} Itens`
            });
          });
          await Promise.all(pkgPromises);
        });

        await Promise.all(seedPromises);
        // Refresh after seeding
        const refreshedSnap = await getDocs(collection(db, 'games'));
        const refreshedData = refreshedSnap.docs.map(d => {
          const data = d.data();
          return {
            id: d.id as any,
            name: data.name,
            description: data.description,
            color: data.color,
            accent: data.accent,
            startingPrice: data.startingPrice || 0,
            icon: getGameIcon(data.name),
            packages: []
          } as Game;
        });
        setGames(refreshedData);
        setLoadingGames(false);
        return;
      }

      const gamesData = gamesSnap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id as any,
          name: data.name,
          description: data.description,
          color: data.color,
          accent: data.accent,
          startingPrice: data.startingPrice || 0,
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
      
      // Update selected game using functional update to avoid stale closure
      setSelectedGame(prev => {
        if (prev?.id === gameId) {
          return { ...prev, packages: pkgs };
        }
        return prev;
      });
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
        const presenceQuery = query(collection(db, 'presence'), where('lastSeen', '>=', fiveMinutesAgo));
        const presenceSnap = await getCountFromServer(presenceQuery);
        setOnlineCount(Math.max(1, presenceSnap.data().count));

        // Count orders today
        setDeliveriesToday(1420 + Math.floor(Math.random() * 5)); // Base for visual effect

        // If user is admin, we can try to get real count
        if (user && user.email === 'do2738735@gmail.com') {
           const startOfDay = new Date();
           startOfDay.setHours(0, 0, 0, 0);
           const ordersQuery = query(collection(db, 'orders'), where('createdAt', '>=', startOfDay));
           const ordersSnap = await getCountFromServer(ordersQuery);
           setDeliveriesToday(1420 + ordersSnap.data().count);
        }
      } catch (e: any) {
        // Only log if it's not a permission error or if user is admin
        const isAdmin = user?.email === 'do2738735@gmail.com';
        const isPermissionError = e.message?.includes('permission-denied');
        const isConnectionError = e.message?.includes('Connection failed') || e.message?.includes('offline');
        
        if (isAdmin && !isPermissionError && !isConnectionError) {
          console.error("Failed to fetch stats:", e.message || e);
        } else if (!isPermissionError && !isConnectionError) {
          // Fallback for non-admins if it's something totally unexpected
          console.debug("Stats fetch failed (minor):", e.message || e);
        }
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
      const isAdmin = user?.email === 'do2738735@gmail.com' || step === 'ADMIN';
      if (searchQuery.length >= 3 && isAdmin) {
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
    setIsMobileMenuOpen(false);
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


  const handlePurchase = async (method: 'MPESA' | 'EMOLA' | 'BALANCE') => {
    if (!selectedPkg || !checkoutData) return;

    setStep('PAYMENT');
    setPaymentStatus('VERIFYING');
    setPurchaseError(null);

    try {
      const response = await fetch('/api/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: selectedGame?.id,
          playerId: checkoutData.playerId,
          packageId: selectedPkg.id,
          amount: selectedPkg.amount,
          price: selectedPkg.price,
          userId: user?.uid || 'anonymous',
          paymentMethod: method.toLowerCase()
        })
      });

      const result = await response.json();

      if (result.success) {
        const uid = user?.uid || 'anonymous';
        const orderId = result.orderId || (result.data?.orderId) || `TX-${Date.now()}`;
        
        await setDoc(doc(db, 'orders', orderId), {
          userId: uid,
          playerId: checkoutData.playerId,
          gameId: selectedGame?.id,
          gameName: selectedGame?.name,
          packageId: selectedPkg.id,
          packageName: selectedPkg.name,
          price: selectedPkg.price,
          status: 'completed',
          paymentMethod: method.toLowerCase(),
          transactionId: orderId,
          createdAt: serverTimestamp()
        });

        // Sync Metadata
        if (user) {
          try {
            await setDoc(doc(db, 'profiles', user.uid), {
              lastPlayerId: checkoutData.playerId,
              displayName: user.displayName || 'Piloto'
            }, { merge: true });
          } catch (metaErr) {
            console.warn("Falha ao sincronizar logs de ID:", metaErr);
          }
        }

        setDeliveriesToday(prev => prev + 1);

        setTimeout(() => {
          setPaymentStatus('SUCCESS');
          setStep('SUCCESS');
          addNotification(NotificationType.SUCCESS, 'Recarga Concluída', `Seus itens para ${selectedGame?.name} foram entregues.`, CheckCircle2);
        }, 1500);
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error("Erro no processamento:", error);
      setPaymentStatus('ERROR');
      setPurchaseError(error.message);
      addNotification(NotificationType.ERROR, 'Erro Crítico', error.message, AlertCircle);
    }
  };

  const handleReset = () => {
    setStep('HOME');
    setSelectedGame(null);
    setSelectedPkg(null);
    setCheckoutData(null);
    setIsMobileMenuOpen(false);
  };

  const handleNavigate = (newStep: typeof step) => {
    setStep(newStep);
    setSearchQuery('');
    setIsMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  if (checkingAuth) {
    return (
      <div className="flex h-screen bg-black items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="relative flex flex-col items-center">
          <div className="w-20 h-20 bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
            <Loader2 className="animate-spin text-cyber-cyan" size={32} />
          </div>
          <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.5em] animate-pulse italic">
            Sincronizando_Acesso_Root...
          </p>
        </div>
      </div>
    );
  }

  // Auth fallback handled in main AnimatePresence

  return (
    <div className="flex h-screen bg-black text-white relative overflow-hidden selection:bg-cyber-cyan selection:text-black">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
      <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-cyber-cyan/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-cyber-emerald/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Sidebar Desktop */}
      <div className="hidden lg:block h-full relative z-40">
        <Sidebar 
          currentStep={step} 
          setStep={(s: any) => {
            setStep(s);
            if (s === 'HOME') {
              setSelectedGame(null);
              setSelectedPkg(null);
              setCheckoutData(null);
            }
          }} 
          isAdmin={isAdmin}
          userProfile={userProfile}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Top Header */}
        <header className="h-20 border-b border-zinc-900 bg-black/50 backdrop-blur-md px-6 lg:px-12 flex items-center justify-between relative z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-zinc-500 hover:text-white"
            >
              <Menu size={24} />
            </button>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] italic mb-0.5">Sessão_Ativa</span>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-cyber-emerald rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
                <span className="text-xs font-mono font-bold text-zinc-400">PROTOCOLO_V4.SECURE</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest italic mb-0.5">Hash_Rede</span>
              <span className="text-[10px] font-mono text-cyber-cyan tracking-tighter">0xCC...SINAL_88</span>
            </div>
            {auth.currentUser ? (
               <div className="flex items-center gap-4 pl-8 border-l border-zinc-900">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-zinc-400 uppercase italic leading-none mb-1">{auth.currentUser.displayName || 'PILOTO'}</span>
                    <span className="text-[11px] font-black text-cyber-emerald italic tracking-tighter leading-none">{userProfile?.balance || 0},00 MT</span>
                  </div>
                  <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-sm flex items-center justify-center">
                    <User size={18} className="text-zinc-600" />
                  </div>
               </div>
            ) : (
               <button 
                onClick={() => setStep('AUTH')}
                className="px-6 py-2 bg-zinc-900 border border-zinc-800 hover:bg-white hover:text-black transition-all text-[10px] font-black uppercase tracking-widest"
              >
                AUTENTICAR_NODE
              </button>
            )}
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto scrollbar-hide relative z-20 p-6 lg:p-12">
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
              
              <div className="pt-24 space-y-24">
                {/* Live Automation Feed */}
                <div className="relative">
                  <div className="absolute -top-12 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-900 to-transparent" />
                  <LiveAutomationFeed />
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
          
          {step === 'AUTH' && (
            <motion.div
              key="auth"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Suspense fallback={<div className="py-40 text-center">CARREGANDO...</div>}>
                <LoginScreen 
                  onSuccess={() => setStep('HOME')} 
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
                game={selectedGame}
                onComplete={() => {
                  handlePurchase(checkoutData.method);
                }}
              />
            </motion.div>
          )}

          {step === 'SUCCESS' && (
            <SuccessStep 
              onReset={handleReset} 
              orderData={checkoutData} 
            />
          )}
        </AnimatePresence>
        </main>

        {/* Dashboard Footer */}
        <footer className="h-12 border-t border-zinc-900 bg-black/80 backdrop-blur-md px-6 lg:px-12 flex items-center justify-between relative z-30">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-cyber-emerald rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] italic">Signal_Active</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.2em] italic">Deliveries_Today:</span>
              <span className="text-[11px] font-black text-white font-mono">{deliveriesToday}</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <span className="hidden lg:inline text-[9px] font-black text-zinc-800 uppercase tracking-widest italic">Quantum_Encryption: AES_256</span>
            <div className="hidden lg:block w-px h-4 bg-zinc-900" />
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-cyber-cyan uppercase tracking-widest animate-pulse">Scanning_Nodes...</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] lg:hidden"
            />
            <motion.div 
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-72 z-[110] lg:hidden"
            >
              <Sidebar 
                currentStep={step} 
                setStep={(s: any) => {
                  setStep(s);
                  setIsMobileMenuOpen(false);
                  if (s === 'HOME') {
                    setSelectedGame(null);
                    setSelectedPkg(null);
                    setCheckoutData(null);
                  }
                }} 
                isAdmin={isAdmin}
                userProfile={userProfile}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <NotificationTray 
        notifications={notifications}
        removeNotification={removeNotification}
      />

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
                      className="w-full py-4 bg-cyber-cyan text-black font-black uppercase italic tracking-widest hover:bg-white text-[10px] transition-all flex items-center justify-center gap-2"
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
                      <User size={14} /> AUTENTICAÇÃO GOOGLE
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
        isAdmin={isAdmin} 
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
