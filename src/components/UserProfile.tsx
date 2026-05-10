import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Shield, ArrowLeft, LogOut, MessageSquare, Bot, ExternalLink, Zap } from 'lucide-react';
import { auth, db } from '../firebase';
import OrderHistory from './OrderHistory';
import { signOut } from 'firebase/auth';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

export const UserProfile = ({ onBack }: { onBack: () => void }) => {
  const user = auth.currentUser;
  const [botCommands, setBotCommands] = useState<any[]>([]);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [groupLink, setGroupLink] = useState('');

  useEffect(() => {
    const fetchBotData = async () => {
      try {
        const [cmdsSnap, configSnap] = await Promise.all([
          getDocs(collection(db, 'bot_commands')),
          getDoc(doc(db, 'config', 'bot'))
        ]);
        setBotCommands(cmdsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        if (configSnap.exists()) {
          const data = configSnap.data();
          setWhatsappNumber(data.whatsappNumber || '');
          setGroupLink(data.groupLink || '');
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchBotData();
  }, []);

  const handleLogout = async () => {
    if (window.confirm('Deseja encerrar a sessão do terminal?')) {
      await signOut(auth);
      window.location.reload(); // Force reload to clear all states
    }
  };

  if (!user) {
    return (
      <div className="py-20 text-center text-zinc-500 font-black uppercase tracking-[0.4em]">
        Acesso Negado: Terminal Não Autenticado
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-12 pb-20"
    >
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-cyber-cyan hover:text-white transition-all uppercase text-xs font-black tracking-[0.4em]"
      >
        <ArrowLeft size={12} /> VOLTAR AO TERMINAL
      </button>

      <div className="flex flex-col md:flex-row gap-12 items-start">
        {/* User Info Card */}
        <div className="w-full md:w-1/3 space-y-6">
          <div className="p-8 bg-zinc-900/40 border-l-4 border-cyber-cyan backdrop-blur-md space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-black border border-zinc-800 flex items-center justify-center text-cyber-cyan">
                <User size={32} />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-heading text-white">PERFIL</h3>
                <p className="text-xs text-zinc-400 font-black uppercase tracking-widest italic flex items-center gap-2">
                  <Shield size={10} className="text-cyber-emerald" /> 
                  Terminal Ativo
                </p>
              </div>
            </div>

            <div className="space-y-4 border-t border-zinc-800 pt-6">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Identificador Cloud (UID)</label>
                <div className="p-3 bg-black/50 border border-zinc-800 font-mono text-xs text-zinc-300 break-all">
                  {user.uid}
                </div>
              </div>

              {user.email && (
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Vetor de Comunicação (Email)</label>
                  <div className="flex items-center gap-3 p-3 bg-black/50 border border-zinc-800 font-mono text-xs text-white">
                    <Mail size={12} className="text-zinc-400" />
                    {user.email}
                  </div>
                </div>
              )}

              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-3 py-4 mt-8 bg-zinc-950 border border-cyber-red/30 text-cyber-red hover:bg-cyber-red/10 hover:border-cyber-red transition-all font-black uppercase text-xs tracking-[0.4em] italic shadow-[0_0_20px_rgba(239,68,68,0.1)]"
              >
                <LogOut size={16} /> ENCERRAR_SESSÃO
              </button>
            </div>
          </div>

          {/* WhatsApp Bot Info */}
          {whatsappNumber && botCommands.length > 0 && (
            <div className="p-8 bg-zinc-900/40 border-l-4 border-cyber-emerald backdrop-blur-md space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-cyber-emerald/10 border border-cyber-emerald/20 text-cyber-emerald">
                  <Bot size={20} />
                </div>
                <div>
                   <h4 className="text-sm font-black uppercase tracking-widest text-white">BOT WHATSAPP</h4>
                   <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest italic leading-tight">Automação de Suporte Ativa</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] text-zinc-300 font-medium leading-relaxed italic border-b border-zinc-800 pb-2">
                  Nosso assistente automatizado responde instantaneamente a estes comandos:
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {botCommands.map(cmd => (
                    <button 
                      key={cmd.id}
                      onClick={() => window.open(`https://wa.me/${whatsappNumber.replace(/\+/g, '')}?text=${encodeURIComponent(cmd.trigger)}`, '_blank')}
                      className="p-3 bg-black border border-zinc-900 group hover:border-cyber-emerald transition-all flex items-center justify-between"
                    >
                      <div className="text-left">
                        <code className="text-xs font-mono font-black text-cyber-emerald">{cmd.trigger}</code>
                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">{cmd.description}</p>
                      </div>
                      <ExternalLink size={12} className="text-zinc-800 group-hover:text-cyber-emerald transition-colors" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 space-y-3">
                 {groupLink && (
                   <button 
                    onClick={() => window.open(groupLink, '_blank')}
                    className="w-full flex items-center justify-center gap-2 p-4 bg-cyber-emerald text-black text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                   >
                     <Zap size={14} fill="currentColor" /> ACESSAR GRUPO OFICIAL
                   </button>
                 )}
                 <div className="p-4 bg-cyber-emerald/5 border border-cyber-emerald/10 rounded-sm">
                    <p className="text-[9px] text-cyber-emerald font-black uppercase tracking-widest leading-relaxed">
                      Dica: Use ".status [ID_DO_PEDIDO]" para rastrear suas recargas em tempo real via WhatsApp.
                    </p>
                 </div>
              </div>
            </div>
          )}
        </div>

        {/* Embedded Order History */}
        <div className="w-full md:w-2/3">
          <div className="mb-6 pb-4 border-b border-zinc-900/50">
            <h4 className="text-xl font-heading text-white italic uppercase tracking-widest px-4 border-l-2 border-cyber-cyan">Sincronização de Transmissões</h4>
          </div>
          <OrderHistory onBack={onBack} hideBack={true} isEmbedded={true} />
        </div>
      </div>
    </motion.div>
  );
};

export default UserProfile;
