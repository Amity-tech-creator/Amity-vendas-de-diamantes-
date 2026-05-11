import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Zap, ShieldCheck, Cpu } from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, reportFirestoreError, OperationType } from '../utils';

interface Order {
  id: string;
  gameName: string;
  packageName: string;
  status: string;
  createdAt: any;
  playerId: string;
}

export const LiveAutomationFeed = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(docs);
    }, (error) => {
      reportFirestoreError(error, OperationType.LIST, 'orders');
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Activity className="text-cyber-emerald animate-pulse" size={18} />
            <div className="absolute inset-0 bg-cyber-emerald/20 blur-sm animate-pulse" />
          </div>
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white italic">Motor de Automação <span className="text-cyber-emerald">LIVE</span></h3>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-zinc-950 border border-zinc-900">
           <div className="w-1.5 h-1.5 rounded-full bg-cyber-emerald animate-ping" />
           <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Sincronizado</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-zinc-950 border border-zinc-900 p-6 space-y-4">
          <div className="flex items-center gap-2 text-cyber-cyan">
             <Cpu size={14} />
             <span className="text-[9px] font-black uppercase tracking-widest italic">Core Engine Status</span>
          </div>
          <div className="space-y-1">
             <p className="text-2xl font-heading text-white italic tracking-tighter">99.9% <span className="text-[10px] text-zinc-600">UPTIME</span></p>
             <div className="h-1 w-full bg-zinc-900 overflow-hidden">
                <motion.div 
                   animate={{ x: ['-100%', '100%'] }}
                   transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                   className="h-full w-1/3 bg-cyber-cyan shadow-[0_0_10px_#22d3ee]" 
                />
             </div>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 p-6 space-y-4">
          <div className="flex items-center gap-2 text-cyber-emerald">
             <Zap size={14} />
             <span className="text-[9px] font-black uppercase tracking-widest italic">Latência de Injeção</span>
          </div>
          <div className="space-y-1">
             <p className="text-2xl font-heading text-white italic tracking-tighter">~1.2s <span className="text-[10px] text-zinc-600">MÉDIA</span></p>
             <p className="text-[8px] text-zinc-700 font-bold uppercase tracking-widest italic tracking-[0.2em]">Otimizado via CDN Regional</p>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 p-6 space-y-4">
          <div className="flex items-center gap-2 text-white">
             <ShieldCheck size={14} />
             <span className="text-[9px] font-black uppercase tracking-widest italic">Protocolo Anti-Ban</span>
          </div>
          <div className="space-y-1">
             <p className="text-2xl font-heading text-white italic tracking-tighter">ATIVO <span className="text-[10px] text-zinc-600">SECURE_V4</span></p>
             <p className="text-[8px] text-zinc-700 font-bold uppercase tracking-widest italic tracking-[0.2em]">Criptografia de Hash End-to-End</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[9px] text-zinc-700 font-black uppercase tracking-[0.4em] italic mb-4">Registro de Transmissões Recentes</p>
        <div className="grid grid-cols-1 gap-2">
          <AnimatePresence mode="popLayout">
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.1 }}
                className="bg-black border border-zinc-900 p-4 flex items-center justify-between group hover:border-cyber-emerald/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-zinc-950 border border-zinc-900 text-cyber-emerald">
                    <Zap size={14} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-white uppercase tracking-widest">
                       {order.gameName} <span className="text-zinc-600">/</span> {order.packageName}
                    </p>
                    <p className="text-[8px] text-zinc-500 font-mono italic">
                      TARGET_ID: {order.playerId.slice(0, 3)}****{order.playerId.slice(-2)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                   <div className={`px-2 py-0.5 text-[8px] font-black border uppercase tracking-widest rounded-sm ${order.status === 'delivered' ? 'text-cyber-emerald border-cyber-emerald/20 bg-cyber-emerald/5' : 'text-cyber-orange border-cyber-orange/20 bg-cyber-orange/5'}`}>
                      {order.status === 'delivered' ? 'ENTREGUE_AUTO' : 'EM_FILA'}
                   </div>
                   <p className="text-[7px] text-zinc-800 font-bold mt-1 uppercase">Sinc: {new Date(order.createdAt?.seconds * 1000).toLocaleTimeString()}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
