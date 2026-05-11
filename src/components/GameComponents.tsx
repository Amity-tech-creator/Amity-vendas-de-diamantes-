import { FC, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  AlertCircle, 
  ArrowLeft 
} from 'lucide-react';
import { Game, Package, GameType } from '../types';

export const GameCard: FC<{ 
  game: Game, 
  onClick: () => void 
}> = ({ game, onClick }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const accentColors: Record<string, string> = {
    [GameType.FREE_FIRE]: 'text-cyber-orange',
    [GameType.COD_MOBILE]: 'text-zinc-400',
    [GameType.PUBG_MOBILE]: 'text-cyber-yellow',
    [GameType.MOBILE_LEGENDS]: 'text-blue-500',
    [GameType.EFOOTBALL]: 'text-cyan-400',
    [GameType.ROBLOX]: 'text-white',
    [GameType.VALORANT]: 'text-cyber-red'
  };

  const borderColors: Record<string, string> = {
    [GameType.FREE_FIRE]: 'border-cyber-orange/20 group-hover:border-cyber-orange',
    [GameType.COD_MOBILE]: 'border-zinc-800/20 group-hover:border-zinc-500',
    [GameType.PUBG_MOBILE]: 'border-cyber-yellow/20 group-hover:border-cyber-yellow',
    [GameType.MOBILE_LEGENDS]: 'border-blue-500/20 group-hover:border-blue-500',
    [GameType.EFOOTBALL]: 'border-cyan-500/20 group-hover:border-cyan-500',
    [GameType.ROBLOX]: 'border-white/20 group-hover:border-white',
    [GameType.VALORANT]: 'border-cyber-red/20 group-hover:border-cyber-red'
  };

  const displayPrice = (game.packages && game.packages.length > 0)
    ? game.packages[0].price
    : (game.startingPrice || 0);

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`group relative h-64 cursor-pointer bg-zinc-950 border transition-all duration-500 overflow-hidden ${borderColors[game.id]}`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative h-full p-8 flex flex-col justify-between z-10">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className={`p-3 bg-black border border-zinc-900 ${accentColors[game.id]} shadow-lg`}>
              <game.icon size={20} />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-cyber-emerald animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Node_Active</span>
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-heading text-white italic tracking-tighter uppercase leading-none">{game.name}</h2>
            <p className="text-[10px] text-zinc-500 mt-2 font-black uppercase tracking-widest italic opacity-80">
              {game.description}
            </p>
          </div>
        </div>
        <div className="flex justify-between items-end pt-4 border-t border-zinc-900/50">
          <div className="space-y-1">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600 italic">Preço Base</p>
            <p className={`text-xl font-black italic tracking-tighter ${accentColors[game.id]}`}>
              {displayPrice},00 MT
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-cyber-cyan group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </motion.div>
  );
};

export const SortTrigger = ({ active, onClick, children }: any) => (
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

export const CategoryDivider = ({ label, sublabel }: { label: string, sublabel?: string }) => (
  <div className="relative py-8 flex flex-col items-center w-full">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-zinc-900"></div>
    </div>
    <div className="relative bg-black px-6 flex flex-col items-center">
      <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.5em]">{label}</span>
      {sublabel && <span className="text-[8px] text-cyber-cyan font-bold uppercase mt-1 tracking-widest opacity-60">[{sublabel}]</span>}
    </div>
  </div>
);

export const PackageSkeleton = () => (
  <div className="flex items-center justify-between p-6 bg-zinc-950/20 border border-zinc-900/50 animate-pulse w-full">
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

export const PackageGrid = ({ 
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
            Filtragem de Preços
          </div>
          <div className="flex bg-zinc-950 border border-zinc-900 p-1">
            <SortTrigger active={sortOrder === 'default'} onClick={() => setSortOrder('default')}>
              Padrão
            </SortTrigger>
            <SortTrigger active={sortOrder === 'asc'} onClick={() => setSortOrder('asc')}>
              Menor Preço
            </SortTrigger>
            <SortTrigger active={sortOrder === 'desc'} onClick={() => setSortOrder('desc')}>
              Maior Preço
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
          ) : sortedAll.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-zinc-900 bg-zinc-950/40 p-12 space-y-4">
              <AlertCircle className="w-12 h-12 text-zinc-800 mx-auto opacity-30" />
              <div className="space-y-1">
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em]">Node Vazio</p>
                <p className="text-xs text-zinc-600 font-bold uppercase italic tracking-widest leading-relaxed">Não foram encontrados pacotes de recarga para este serviço no momento.</p>
              </div>
            </div>
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

export const PackageItem: FC<{ pkg: Package, idx: number, onSelect: () => void }> = ({ pkg, idx, onSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false);

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
      onClick={() => setIsExpanded(!isExpanded)}
      className={`group flex flex-col p-0 bg-zinc-900/30 border border-zinc-900 hover:border-cyber-cyan/50 cursor-pointer transition-all overflow-hidden ${pkg.active === false ? 'opacity-30 grayscale pointer-events-none' : ''}`}
    >
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-black border border-zinc-800 flex items-center justify-center text-zinc-700 font-mono text-xs group-hover:text-cyber-cyan transition-colors">
            #{String(idx + 1).padStart(2, '0')}
          </div>
          <div>
            <h4 className="text-xl font-bold text-white group-hover:text-cyber-cyan transition-colors italic tracking-tight">{pkg.name}</h4>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Custo Terminal</span>
          <div className="px-6 py-2 bg-zinc-800 text-zinc-100 font-black text-xl italic tracking-tighter group-hover:bg-cyber-cyan group-hover:text-black transition-all shadow-lg">
            {pkg.price},00 <span className="text-xs">MT</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="border-t border-zinc-800 bg-black/40 px-6 py-6 space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Quantidade Real</p>
                <p className="text-sm font-bold text-white tracking-widest">{pkg.exactAmount || `${pkg.amount} Unidades`}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Bônus Adicional</p>
                <p className="text-sm font-bold text-cyber-emerald tracking-widest">{pkg.bonus || 'Nenhum Bônus Ativo'}</p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect();
                }}
                className="w-full py-4 bg-cyber-cyan text-black font-black uppercase italic tracking-[0.2em] text-xs hover:bg-white transition-all flex items-center justify-center gap-2 group/btn"
              >
                PROSSEGUIR PARA CHECKOUT <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
