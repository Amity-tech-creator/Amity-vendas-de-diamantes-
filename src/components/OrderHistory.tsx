import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Activity } from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';

export const OrderHistory = ({ onBack, hideBack = false, isEmbedded = false }: { onBack: () => void, hideBack?: boolean, isEmbedded?: boolean }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!auth.currentUser) return;
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', auth.currentUser.uid),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const ordersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setOrders(ordersData);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders().catch(err => console.error("OrderHistory unhandled fetch error:", err));
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`space-y-10 ${isEmbedded ? '' : 'pb-20'}`}
    >
      {!hideBack && (
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-cyber-cyan hover:text-white transition-all uppercase text-xs font-black tracking-[0.4em]"
        >
          <ArrowLeft size={12} /> VOLTAR AO TERMINAL
        </button>
      )}

      {!isEmbedded && (
        <div className="flex items-end gap-4 mb-10 pb-6 border-b border-zinc-900">
          <div className="flex-1">
            <h2 className="text-6xl font-heading text-white">HISTÓRICO DE <span className="text-cyber-cyan">DADOS</span></h2>
            <p className="text-zinc-500 text-xs font-black uppercase tracking-[0.4em] mt-2 italic">Sincronização de Pedidos Efetuados</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-40 text-center animate-pulse text-zinc-600 font-mono text-xs tracking-[0.5em]">RECOVERY_CLOUD_LOGS...</div>
      ) : orders.length === 0 ? (
        <div className="py-20 text-center bg-black/40 border border-zinc-900 italic text-zinc-500 uppercase font-black tracking-widest p-12">
          NENHUMA TRANSMISSÃO DETECTADA NO NODE ATUAL.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {orders.map((order, idx) => (
             <motion.div 
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-zinc-950/50 border border-zinc-900 p-8 flex flex-col md:flex-row justify-between items-center gap-6 hover:border-zinc-700 transition-all group"
             >
                <div className="flex items-center gap-8 flex-1">
                   <div className={`p-4 bg-black border border-zinc-800 ${order.status === 'pending' ? 'text-cyber-orange' : 'text-cyber-emerald'}`}>
                      <Activity size={24} />
                   </div>
                   <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-white uppercase tracking-widest">{order.pkgName}</span>
                        <span className="italic text-[10px] text-zinc-500 tracking-widest uppercase">{order.id.slice(0, 12)}</span>
                      </div>
                      <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">DESTINO: <span className="text-cyber-cyan font-mono">{order.playerId}</span></p>
                      <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">{order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : 'Recente'}</p>
                   </div>
                </div>
                <div className="text-center md:text-right space-y-2">
                   <p className="text-3xl font-black italic text-white tracking-tighter">{order.price},00 <span className="text-xs">MT</span></p>
                   <div className={`flex items-center justify-center md:justify-end gap-2 text-[10px] font-black uppercase tracking-[0.2em] ${order.status === 'pending' ? 'text-cyber-orange' : 'text-cyber-emerald'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${order.status === 'pending' ? 'bg-cyber-orange animate-pulse' : 'bg-cyber-emerald'}`} />
                      {order.status === 'pending' ? 'EM_PROCESSAMENTO' : 'SINCRONIZADO'}
                   </div>
                </div>
             </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default OrderHistory;
