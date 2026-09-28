import React, { useState } from 'react';
import { 
  Settings, 
  Flame, 
  Clock, 
  Trash2, 
  Check, 
  ShieldCheck, 
  Database, 
  ExternalLink,
  Sparkles,
  MapPin,
  Lock,
  EyeOff,
  Eye,
  Radio,
  LogOut,
  ShieldAlert
} from 'lucide-react';
import { UserProfile, VibeColor, VibeItem } from '../types';
import { VIBE_COLORS, formatTimeRemaining } from '../lib/vibeColors';

interface PerfilViewProps {
  currentUser: UserProfile;
  userVibes: VibeItem[];
  onUpdateVibeColor: (color: VibeColor) => void;
  onClearAllMyData: () => void;
  onOpenArchitectureModal: () => void;
  onOpenSupabaseConfig?: () => void;
  onDeleteVibe: (vibeId: string) => void;
  slogan?: string;
  onOpenSloganModal?: () => void;
  antiScreenshotEnabled?: boolean;
  onToggleAntiScreenshot?: () => void;
  onTestAntiScreenshot?: () => void;
  onOpenAntiScreenshotModal?: () => void;
  onLogout?: () => void;
  onOpenIntroBanners?: () => void;
  isRadarVisible?: boolean;
  onToggleRadarVisible?: () => void;
}

export const PerfilView: React.FC<PerfilViewProps> = ({
  currentUser,
  userVibes,
  onUpdateVibeColor,
  onClearAllMyData,
  onOpenArchitectureModal,
  onOpenSupabaseConfig,
  onDeleteVibe,
  slogan = 'Live the moment.',
  onOpenSloganModal,
  antiScreenshotEnabled = true,
  onToggleAntiScreenshot,
  onTestAntiScreenshot,
  onOpenAntiScreenshotModal,
  onLogout,
  onOpenIntroBanners,
  isRadarVisible = true,
  onToggleRadarVisible,
}) => {
  const [activeTab, setActiveTab] = useState<'vibes' | 'privacy'>('vibes');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const currentColorConfig = VIBE_COLORS[currentUser.vibeColor] || VIBE_COLORS.purple;

  const handleColorChange = (c: VibeColor) => {
    onUpdateVibeColor(c);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="pb-24 pt-2 px-4 space-y-4">
      {/* 1. Profile Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-b from-[#131322] via-[#0E0E18] to-[#0A0A12] border border-[#222238] shadow-xl relative overflow-hidden">
        
        {/* Ambient background glow */}
        <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full ${currentColorConfig.glowClass} opacity-20 blur-3xl pointer-events-none`} />

        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-3.5">
            <div className={`relative w-16 h-16 rounded-full p-[2.5px] border-2 ${currentColorConfig.borderClass} ${currentColorConfig.glowClass}`}>
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-full h-full object-cover rounded-full"
              />
              <span className={`absolute bottom-0 right-0 w-4 h-4 rounded-full ${currentColorConfig.bgClass} border-2 border-[#0E0E18]`} />
            </div>

            <div>
              <h2 className="font-extrabold text-base text-white font-['Outfit']">
                {currentUser.name}
              </h2>
              <p className="text-xs text-zinc-400">@{currentUser.username}</p>
              
              <div className="flex items-center gap-1 text-[11px] text-[#22D3EE] mt-1">
                <MapPin className="w-3 h-3" />
                <span>Lisboa, Portugal</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenArchitectureModal}
              className="p-2 rounded-xl bg-[#181828] border border-[#2B2B3E] text-zinc-300 hover:text-white transition-colors"
              title="Ver infraestrutura Supabase"
            >
              <Database className="w-4 h-4 text-[#22D3EE]" />
            </button>
            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#24151D] hover:bg-rose-600/20 border border-rose-500/30 text-rose-300 hover:text-rose-100 transition-all text-xs font-semibold cursor-pointer active:scale-95 shadow-sm"
                title="Terminar Sessão (Sair da Conta)"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>Sair</span>
              </button>
            )}
          </div>
        </div>

        {/* Bio */}
        <p className="text-xs text-zinc-300 mt-3.5 font-normal leading-relaxed">
          {currentUser.bio}
        </p>

        {/* Followers / Following Stats */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#1C1C2C] text-center">
          <div>
            <span className="block font-bold text-sm text-white font-mono">{userVibes.length}</span>
            <span className="text-[10.5px] text-zinc-400">Vibes Ativas</span>
          </div>
          <div>
            <span className="block font-bold text-sm text-white font-mono">{currentUser.followersCount}</span>
            <span className="text-[10.5px] text-zinc-400">Seguidores</span>
          </div>
          <div>
            <span className="block font-bold text-sm text-white font-mono">{currentUser.followingCount}</span>
            <span className="text-[10.5px] text-zinc-400">A Seguir</span>
          </div>
        </div>

        {/* Vibe Color Picker */}
        <div className="mt-4 pt-3.5 border-t border-[#1C1C2C]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Sparkles className={`w-3.5 h-3.5 ${currentColorConfig.textClass}`} />
              Personalizar a tua Vibe Color
            </span>
            {savedSuccess && (
              <span className="text-[10.5px] text-emerald-400 font-semibold flex items-center gap-1 animate-pulse">
                <Check className="w-3 h-3" /> Guardado!
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {(Object.keys(VIBE_COLORS) as VibeColor[]).map((col) => {
              const cfg = VIBE_COLORS[col];
              const isSelected = currentUser.vibeColor === col;
              return (
                <button
                  key={col}
                  onClick={() => handleColorChange(col)}
                  className={`w-8 h-8 rounded-full ${cfg.bgClass} flex items-center justify-center transition-all ${
                    isSelected ? 'scale-110 ring-2 ring-white shadow-lg' : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Slogan Customization */}
        <div className="mt-4 pt-3.5 border-t border-[#1C1C2C] flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#22D3EE]" />
              Slogan LYVO
            </span>
            <p className="text-[11px] text-zinc-400 mt-0.5 font-medium">
              LYVO — <span className="text-[#22D3EE]">{slogan}</span>
            </p>
          </div>
          {onOpenSloganModal && (
            <button
              type="button"
              onClick={onOpenSloganModal}
              className="px-3 py-1.5 rounded-xl bg-[#1B1B2C] hover:bg-[#25253C] border border-[#2F2F48] text-xs font-medium text-zinc-200 hover:text-white transition-colors active:scale-95"
            >
              Mudar
            </button>
          )}
        </div>

      </div>

      {/* 2. Sub Tabs: Minhas Vibes vs Privacidade & Supabase */}
      <div className="flex border-b border-[#1C1C2C]">
        <button
          onClick={() => setActiveTab('vibes')}
          className={`flex-1 pb-2.5 text-xs font-bold transition-all text-center ${
            activeTab === 'vibes'
              ? 'text-white border-b-2 border-[#8B5CF6]'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Minhas Vibes ({userVibes.length})
        </button>
        <button
          onClick={() => setActiveTab('privacy')}
          className={`flex-1 pb-2.5 text-xs font-bold transition-all text-center ${
            activeTab === 'privacy'
              ? 'text-white border-b-2 border-[#22D3EE]'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Zero Retenção & Supabase
        </button>
      </div>

      {/* Tab: Minhas Vibes */}
      {activeTab === 'vibes' && (
        <div className="space-y-3">
          {userVibes.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#11111A] border border-[#202030] text-center space-y-2">
              <Flame className="w-8 h-8 text-[#8B5CF6] mx-auto opacity-60" />
              <p className="text-sm font-semibold text-white">Não tens nenhuma Vibe no ar</p>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                Partilha uma foto, vídeo, áudio ou pensamento. Ele desaparecerá para sempre em 24h.
              </p>
            </div>
          ) : (
            userVibes.map((vibe) => (
              <div
                key={vibe.id}
                className="p-3.5 rounded-2xl bg-[#11111A] border border-[#1F1F30] flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {vibe.mediaUrl ? (
                    <img
                      src={vibe.mediaUrl}
                      alt="Thumbnail"
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-[#191928] border border-[#2A2A40] flex items-center justify-center shrink-0 text-sm font-bold text-[#8B5CF6]">
                      {vibe.type === 'audio' ? '🎤' : '💬'}
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">
                      {vibe.content || `${vibe.type.toUpperCase()} sem legenda`}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-400 font-mono">
                      <span className="flex items-center gap-1 text-[#F43F9E]">
                        <Clock className="w-3 h-3" />
                        {formatTimeRemaining(vibe.expiresAt)}
                      </span>
                      <span>•</span>
                      <span>❤️ {vibe.likes}</span>
                      <span>•</span>
                      <span>💬 {vibe.commentsCount}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteVibe(vibe.id)}
                  className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
                  title="Apagar Vibe agora"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Privacidade & Supabase */}
      {activeTab === 'privacy' && (
        <div className="space-y-3.5">
          <div className="p-4 rounded-2xl bg-[#12121E] border border-[#242438] space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-sm text-white">Política de Zero Retenção</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              No LYVO, a privacidade é estrutural e baseada no motor PostgreSQL da Supabase. O banco de dados nunca preserva publicações ou conversas após o período de validade.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div className="p-2.5 rounded-xl bg-[#161626] border border-[#28283C]">
                <span className="text-zinc-400 text-[11px] block">Armazenamento Ativo:</span>
                <span className="font-bold text-white font-mono text-sm">
                  {(userVibes.length * 1.4).toFixed(1)} MB (Temporário)
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#161626] border border-[#28283C]">
                <span className="text-zinc-400 text-[11px] block">Histórico Gravado:</span>
                <span className="font-bold text-emerald-400 font-mono text-sm">
                  0.0 MB (Permanente)
                </span>
              </div>
            </div>
          </div>

          {/* Proximity Radar & Ghost Mode Privacy Section */}
          <div className="p-4 rounded-2xl bg-[#12121E] border border-[#242438] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${isRadarVisible ? 'bg-[#22D3EE]/20 text-[#22D3EE]' : 'bg-purple-500/20 text-purple-400'}`}>
                  {isRadarVisible ? <Radio className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Radar de Proximidade</h3>
                  <p className="text-[10.5px] text-zinc-400">
                    {isRadarVisible ? 'Visível para utilizadores num raio de 5 km' : 'Modo Fantasma: Oculto no radar'}
                  </p>
                </div>
              </div>

              {onToggleRadarVisible && (
                <button
                  type="button"
                  onClick={onToggleRadarVisible}
                  className={`w-10 h-5.5 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                    isRadarVisible ? 'bg-[#22D3EE]' : 'bg-zinc-700'
                  }`}
                  title={isRadarVisible ? "Ativar Modo Fantasma (Ocultar do radar)" : "Ficar visível no radar"}
                >
                  <div
                    className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                      isRadarVisible ? 'translate-x-4.5' : 'translate-x-0'
                    }`}
                  />
                </button>
              )}
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              {isRadarVisible ? (
                <span>
                  🟢 <strong className="text-zinc-200">Estás visível:</strong> Outros utilizadores num raio de 5 km podem ver a tua presença aproximada na aba Explorar e enviar convites de conversa.
                </span>
              ) : (
                <span>
                  👻 <strong className="text-purple-300">Modo Fantasma Ativo:</strong> A tua posição e perfil estão completamente ocultos do radar de todas as pessoas. Podes continuar a navegar e explorar anonimamente.
                </span>
              )}
            </p>
          </div>

          {/* Anti-Screenshot Shield Section */}
          <div className="p-4 rounded-2xl bg-[#12121E] border border-[#242438] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-red-500/20 text-red-400">
                  <EyeOff className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Escudo Anti-Screenshot</h3>
                  <p className="text-[10.5px] text-zinc-400">Torna o ecrã 100% preto em capturas e recortes</p>
                </div>
              </div>

              {onToggleAntiScreenshot && (
                <button
                  type="button"
                  onClick={onToggleAntiScreenshot}
                  className={`w-10 h-5.5 rounded-full transition-colors relative p-0.5 ${
                    antiScreenshotEnabled ? 'bg-[#EF4444]' : 'bg-zinc-700'
                  }`}
                  title="Ativar/desativar proteção de ecrã preto"
                >
                  <div
                    className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                      antiScreenshotEnabled ? 'translate-x-4.5' : 'translate-x-0'
                    }`}
                  />
                </button>
              )}
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Quando alguém tenta tirar print ou usar ferramentas de captura, o LYVO dispara uma camada preta opaca instantânea e limpa a área de transferência.
            </p>

            <div className="flex items-center gap-2 pt-1">
              {onTestAntiScreenshot && (
                <button
                  type="button"
                  onClick={onTestAntiScreenshot}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#EF4444]/15 hover:bg-[#EF4444]/25 border border-[#EF4444]/40 text-red-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                  Testar Ecrã Preto Agora
                </button>
              )}

              {onOpenAntiScreenshotModal && (
                <button
                  type="button"
                  onClick={onOpenAntiScreenshotModal}
                  className="py-2 px-3 rounded-xl bg-[#171728] hover:bg-[#202034] border border-[#2B2B40] text-zinc-300 hover:text-white text-xs font-medium transition-colors"
                >
                  Detalhes Técnicos & FLAG_SECURE
                </button>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-4 rounded-2xl bg-[#12121E] border border-[#242438] space-y-3">
            <h4 className="font-bold text-xs text-white uppercase tracking-wider">
              Ações de Privacidade Imediatas
            </h4>

            {onOpenSupabaseConfig && (
              <button
                onClick={onOpenSupabaseConfig}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#22D3EE]/15 to-[#8B5CF6]/15 border border-[#22D3EE]/40 hover:border-[#22D3EE] text-white text-xs font-semibold flex items-center justify-between transition-all"
              >
                <span className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#22D3EE]" />
                  <span>Conectar Projeto Supabase (PostgreSQL Real)</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#22D3EE]/20 text-[#22D3EE] font-bold">
                  Configurar
                </span>
              </button>
            )}
            
            <button
              onClick={onOpenArchitectureModal}
              className="w-full py-2.5 px-3 rounded-xl bg-[#171728] border border-[#2A2A40] text-zinc-300 hover:text-white text-xs font-semibold flex items-center justify-between transition-colors"
            >
              <span className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#22D3EE]" />
                Ver Guia de Deploy Supabase + pg_cron
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
            </button>

            <button
              onClick={onClearAllMyData}
              className="w-full py-2.5 px-3 rounded-xl bg-red-600/10 border border-red-500/30 text-red-400 hover:bg-red-600/20 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Destruir Todas as Minhas Vibes Imediatamente
            </button>
          </div>

          {/* Account & Session Controls */}
          <div className="p-4 rounded-2xl bg-[#12121E] border border-[#242438] space-y-2.5">
            <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#22D3EE]" />
              Sessão & Conta
            </h4>

            {onOpenIntroBanners && (
              <button
                type="button"
                onClick={onOpenIntroBanners}
                className="w-full py-2.5 px-3 rounded-xl bg-[#171728] hover:bg-[#222238] border border-[#2A2A40] text-zinc-300 hover:text-white text-xs font-semibold flex items-center justify-between transition-colors"
              >
                <span>Ver Banners de Introdução LYVO</span>
                <Sparkles className="w-3.5 h-3.5 text-[#22D3EE]" />
              </button>
            )}

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="w-full py-2.5 px-3 rounded-xl bg-[#201524] hover:bg-[#2C1C32] border border-[#482038] text-rose-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors active:scale-98"
              >
                <Lock className="w-3.5 h-3.5" />
                Terminar Sessão (Voltar ao Login com Token)
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
