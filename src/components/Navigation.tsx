import React from 'react';
import { Home, Compass, Plus, MessageCircle, User } from 'lucide-react';
import { UserProfile } from '../types';
import { VIBE_COLORS } from '../lib/vibeColors';

export type TabType = 'agora' | 'explorar' | 'conversas' | 'perfil';

interface NavigationProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenCreate: () => void;
  currentUser: UserProfile;
  unreadMessagesCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  onOpenCreate,
  currentUser,
  unreadMessagesCount,
}) => {
  const userColor = VIBE_COLORS[currentUser.vibeColor];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0A0A10]/95 backdrop-blur-2xl border-t border-[#1C1C2B] safe-area-pb">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between relative">
        {/* 1. Agora (Home) */}
        <button
          onClick={() => onSelectTab('agora')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            currentTab === 'agora'
              ? 'text-white'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <div className="relative">
            <Home className={`w-5 h-5 transition-transform ${currentTab === 'agora' ? 'scale-110 text-[#8B5CF6]' : ''}`} />
            {currentTab === 'agora' && (
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#8B5CF6] shadow-[0_0_8px_#8B5CF6]" />
            )}
          </div>
          <span className={`text-[10px] mt-1 font-medium ${currentTab === 'agora' ? 'text-white font-semibold' : ''}`}>
            Agora
          </span>
        </button>

        {/* 2. Explorar */}
        <button
          onClick={() => onSelectTab('explorar')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            currentTab === 'explorar'
              ? 'text-white'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <div className="relative">
            <Compass className={`w-5 h-5 transition-transform ${currentTab === 'explorar' ? 'scale-110 text-[#22D3EE]' : ''}`} />
            {currentTab === 'explorar' && (
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#22D3EE] shadow-[0_0_8px_#22D3EE]" />
            )}
          </div>
          <span className={`text-[10px] mt-1 font-medium ${currentTab === 'explorar' ? 'text-white font-semibold' : ''}`}>
            Explorar
          </span>
        </button>

        {/* 3. Central Criar Button (+) */}
        <div className="flex-1 flex items-center justify-center -mt-5">
          <button
            onClick={onOpenCreate}
            aria-label="Criar nova Vibe"
            className="group relative flex items-center justify-center w-13 h-13 rounded-full bg-gradient-to-tr from-[#F43F9E] via-[#8B5CF6] to-[#22D3EE] p-[2px] shadow-[0_0_20px_rgba(139,92,246,0.55)] active:scale-95 transition-all hover:scale-105"
          >
            <div className="w-full h-full rounded-full bg-[#0D0D14] flex items-center justify-center group-hover:bg-transparent transition-colors">
              <Plus className="w-6 h-6 text-white transition-transform group-hover:rotate-90 duration-300 stroke-[2.5]" />
            </div>
            {/* Pulsing ring aura */}
            <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-[#F43F9E] to-[#22D3EE] opacity-40 blur-sm group-hover:opacity-75 transition-opacity -z-10" />
          </button>
        </div>

        {/* 4. Conversas */}
        <button
          onClick={() => onSelectTab('conversas')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            currentTab === 'conversas'
              ? 'text-white'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <div className="relative">
            <MessageCircle className={`w-5 h-5 transition-transform ${currentTab === 'conversas' ? 'scale-110 text-[#F43F9E]' : ''}`} />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1 -right-1.5 min-w-[15px] h-[15px] rounded-full bg-[#F43F9E] text-white text-[9px] font-bold flex items-center justify-center px-0.5 shadow-[0_0_6px_#F43F9E]">
                {unreadMessagesCount}
              </span>
            )}
            {currentTab === 'conversas' && (
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#F43F9E] shadow-[0_0_8px_#F43F9E]" />
            )}
          </div>
          <span className={`text-[10px] mt-1 font-medium ${currentTab === 'conversas' ? 'text-white font-semibold' : ''}`}>
            Conversas
          </span>
        </button>

        {/* 5. Perfil */}
        <button
          onClick={() => onSelectTab('perfil')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            currentTab === 'perfil'
              ? 'text-white'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <div className="relative">
            <div className={`w-6 h-6 rounded-full overflow-hidden p-[1px] border transition-all ${
              currentTab === 'perfil'
                ? `${userColor.borderClass} ${userColor.glowClass} scale-110`
                : 'border-zinc-700'
            }`}>
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            {currentTab === 'perfil' && (
              <span className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${userColor.bgClass}`} />
            )}
          </div>
          <span className={`text-[10px] mt-1 font-medium ${currentTab === 'perfil' ? 'text-white font-semibold' : ''}`}>
            Perfil
          </span>
        </button>
      </div>
    </nav>
  );
};
