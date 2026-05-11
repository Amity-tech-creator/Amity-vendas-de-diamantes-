import { FC } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { Notification, NotificationType } from '../types';

interface NotificationTrayProps {
  notifications: Notification[];
  removeNotification: (id: string) => void;
}

export const NotificationTray: FC<NotificationTrayProps> = ({ 
  notifications, 
  removeNotification 
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
