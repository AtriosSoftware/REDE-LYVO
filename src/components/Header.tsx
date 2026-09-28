import React from 'react';
import { Sparkles, Database, Radio, Bell, Edit3, EyeOff, Shield } from 'lucide-react';
import { UserProfile } from '../types';
import { VIBE_COLORS } from '../lib/vibeColors';
import { getSupabaseConfig } from '../lib/supabaseClient';

interface HeaderProps {
  currentUser: UserProfile;
  onOpenArchitecture: () => void;
  onOpenSupabaseConfig?: () => void;
  onlineCount?: number;
  slogan?: string;
  onOpenSloganModal?: () => void;
  onOpenAntiScreenshotModal?: () => void;
  onTestScreenshotBlackout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onOpenArchitecture,
  onOpenSupabaseConfig,
  onlineCount = 2418,
  slogan = 'Live the moment.',
  onOpenSloganModal,
  onOpenAntiScreenshotModal,
  onTestScreenshotBlackout,
}) => {
  const userColorConfig = VIBE_COLORS[currentUser.vibeColor];
  const isSupabaseActive = getSupabaseConfig().isConfigured;

  return (
    <header className="sticky top-0 z-40 bg-[#08080D]/90 backdrop-blur-xl border-b border-[#1A1A26]">
      <div className="max-w-md mx-auto px-4 h-15 flex items-center justify-between">
        {/* Brand Logo & Slogan (Clickable to change slogan) */}
        <div className="flex items-center gap-2.5">
          <div 
            onClick={onOpenSloganModal}
            role="button"
            tabIndex={0}
            title="LYVO — Live the moment. Clique para alterar o slogan"
            className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[#8B5CF6] via-[#EC4899] to-[#22D3EE] p-[1.5px] shadow-[0_0_16px_rgba(139,92,246,0.35)] cursor-pointer active:scale-95 transition-transform"
          >
            <div className="w-full h-full bg-[#08080D] rounded-[10px] flex items-center justify-center">
              {/* Geometric Neon L-V Badge for LYVO */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 4V17C5 18.6569 6.34315 20 8 20H13" stroke="url(#lyvo-grad-1)" strokeWidth="2.7" strokeLinecap="round"/>
                <path d="M12 7L16.5 17L21 7" stroke="url(#lyvo-grad-2)" strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="16.5" cy="5" r="1.5" fill="#22D3EE" />
                <defs>
                  <linearGradient id="lyvo-grad-1" x1="5" y1="4" x2="13" y2="20" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F43F9E" />
                    <stop offset="1" stopColor="#8B5CF6" />
                  </linearGradient>
                  <linearGradient id="lyvo-grad-2" x1="12" y1="7" x2="21" y2="17" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#8B5CF6" />
                    <stop offset="1" stopColor="#22D3EE" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenSloganModal}
            className="group flex flex-col items-start text-left focus:outline-none cursor-pointer"
            title="Clique para escolher ou personalizar o slogan da LYVO"
          >
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-wider text-xl text-white font-['Outfit'] group-hover:text-[#22D3EE] transition-colors">
                LYVO
              </span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded-full bg-[#8B5CF6]/20 text-[#A78BFA] border border-[#8B5CF6]/30">
                24h
              </span>
              <span className="text-[10px] text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 ml-0.5">
                <Sparkles className="w-2.5 h-2.5 text-[#22D3EE]" />
                <span className="text-[9.5px] text-zinc-400">slogan</span>
              </span>
            </div>
            <p className="text-[11px] text-zinc-300 group-hover:text-white font-medium tracking-tight flex items-center gap-1 transition-colors">
              <span>{slogan}</span>
              <Edit3 className="w-2.5 h-2.5 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </p>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Live Online Pulse */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#11111A] border border-[#262638] text-[11px] font-medium text-zinc-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-zinc-200 font-semibold">{onlineCount.toLocaleString()}</span>
            <span className="text-zinc-400 text-[10px] hidden sm:inline">agora</span>
          </div>

          {/* Supabase Config & Status Trigger */}
          <button
            onClick={onOpenSupabaseConfig || onOpenArchitecture}
            title={isSupabaseActive ? "Supabase Conectado (Clique para gerir ou sincronizar)" : "Conectar Supabase Real (Clique para inserir URL e Key)"}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all text-xs active:scale-95 ${
              isSupabaseActive 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                : 'bg-[#151522] border-[#2A2A3E] hover:border-[#22D3EE]/50 hover:bg-[#1A1A2E] text-zinc-300 hover:text-white'
            }`}
          >
            <Database className={`w-3.5 h-3.5 ${isSupabaseActive ? 'text-emerald-400' : 'text-[#22D3EE]'}`} />
            <span className="hidden sm:inline text-[11px] font-medium">
              {isSupabaseActive ? 'Supabase Ativo' : 'Supabase'}
            </span>
            <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseActive ? 'bg-emerald-400' : 'bg-amber-400/80'}`} />
          </button>

          {/* Anti-Screenshot Shield button */}
          {onOpenAntiScreenshotModal && (
            <button
              onClick={onOpenAntiScreenshotModal}
              title="Escudo Anti-Screenshot: Impede capturas de ecrã (Ecrã Preto)"
              className="flex items-center gap-1 p-2 rounded-xl bg-[#171424] border border-[#3E2548] hover:border-[#EF4444]/60 hover:bg-[#20152B] text-red-300 hover:text-white transition-all text-xs active:scale-95"
            >
              <EyeOff className="w-3.5 h-3.5 text-[#EF4444]" />
              <span className="text-[11px] font-semibold text-red-400 hidden xs:inline">Anti-Print</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
