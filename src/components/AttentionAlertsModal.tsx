import React from 'react';
import { 
  X, 
  Bell, 
  Sparkles, 
  Zap, 
  Clock, 
  Flame, 
  Heart, 
  CheckCheck,
  Send,
  Radio
} from 'lucide-react';
import { AttentionAlert, UserProfile } from '../types';
import { formatTimeAgo } from '../lib/vibeColors';

interface AttentionAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: AttentionAlert[];
  currentUser: UserProfile;
  onSimulateIncomingAlert: () => void;
  onClearAlerts?: () => void;
  onSelectVibe?: (vibeId: string) => void;
}

export const AttentionAlertsModal: React.FC<AttentionAlertsModalProps> = ({
  isOpen,
  onClose,
  alerts,
  currentUser,
  onSimulateIncomingAlert,
  onClearAlerts,
  onSelectVibe,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-[#0F0F1A] border border-[#2B2B42] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#202034] flex items-center justify-between bg-[#141424]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#8B5CF6]/30 to-[#F43F9E]/30 border border-[#8B5CF6]/50 flex items-center justify-center text-[#22D3EE]">
              <Bell className="w-4 h-4 text-[#F43F9E] animate-bounce" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
                Atenção Recebida
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#8B5CF6]/20 text-[#A78BFA] border border-[#8B5CF6]/40">
                  {alerts.length} alertas
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400">
                Utilizadores que tocaram nos emojis para chamar a tua atenção
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1F1F30] hover:bg-[#2A2A40] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action toolbar to simulate or clear */}
        <div className="px-5 py-2.5 bg-[#121220] border-b border-[#1E1E2E] flex items-center justify-between">
          <button
            type="button"
            onClick={onSimulateIncomingAlert}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1C1C30] hover:bg-[#282845] border border-[#2D2D4B] text-[11px] text-[#22D3EE] font-semibold transition-all cursor-pointer active:scale-95 shadow-sm"
          >
            <Zap className="w-3.5 h-3.5 text-[#22D3EE] animate-pulse" />
            <span>Simular Atenção de Amigo</span>
          </button>

          {alerts.length > 0 && onClearAlerts && (
            <button
              type="button"
              onClick={onClearAlerts}
              className="text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            >
              Limpar histórico
            </button>
          )}
        </div>

        {/* Alerts List */}
        <div className="p-4 overflow-y-auto space-y-2.5 divide-y divide-zinc-800/40">
          {alerts.length === 0 ? (
            <div className="text-center py-10 px-4 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#181828] border border-[#2B2B40] mx-auto flex items-center justify-center text-zinc-500">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-white">Nenhum alerta recente</h3>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
                Quando outros utilizadores carregarem nos emojis de atenção (🔥, ⚡, 💖, 🚀, 👀) numa publicação tua, os alertas aparecem aqui em tempo real!
              </p>
              <button
                type="button"
                onClick={onSimulateIncomingAlert}
                className="mt-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] text-white text-xs font-semibold shadow-md active:scale-95"
              >
                Testar Alerta Agora
              </button>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                onClick={() => {
                  if (onSelectVibe && alert.vibeId) {
                    onSelectVibe(alert.vibeId);
                    onClose();
                  }
                }}
                className={`pt-2.5 first:pt-0 flex items-start gap-3 p-2.5 rounded-2xl transition-all cursor-pointer ${
                  !alert.read ? 'bg-[#18182C]/60 hover:bg-[#1E1E36]' : 'hover:bg-[#151524]'
                }`}
              >
                {/* Reactor Avatar with emoji badge */}
                <div className="relative shrink-0">
                  <img
                    src={
                      alert.reactorAvatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
                    }
                    alt={alert.reactorName}
                    className="w-10 h-10 rounded-full object-cover border border-white/20"
                  />
                  <span className="absolute -bottom-1 -right-1 text-base leading-none drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-bounce">
                    {alert.emoji}
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-xs font-bold text-white truncate">
                      {alert.reactorName}
                    </h4>
                    <span className="text-[10px] text-zinc-500 font-mono shrink-0">
                      {formatTimeAgo(alert.createdAt)}
                    </span>
                  </div>

                  <p className="text-[11.5px] text-zinc-300 mt-0.5 leading-snug">
                    Carregou em <span className="text-base align-middle">{alert.emoji}</span> para <strong className="text-cyan-300 font-semibold">chamar a tua atenção</strong> na tua publicação!
                  </p>

                  {alert.vibeSnippet && (
                    <p className="text-[10.5px] text-zinc-500 italic truncate mt-1 bg-[#0D0D16] px-2 py-0.5 rounded-md border border-white/5">
                      “{alert.vibeSnippet}”
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-[#202034] bg-[#121220] flex items-center justify-between text-xs text-zinc-400">
          <span className="flex items-center gap-1.5 text-[11px]">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>Alertas ao vivo na tua conta</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#1C1C2C] hover:bg-[#27273C] text-zinc-200 font-medium text-xs transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
