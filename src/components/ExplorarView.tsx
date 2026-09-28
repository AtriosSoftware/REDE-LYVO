import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  TrendingUp, 
  Radio, 
  Users, 
  Flame, 
  Sparkles, 
  Music, 
  Clock, 
  MessageSquare,
  Eye,
  EyeOff,
  Shield
} from 'lucide-react';
import { VibeItem, UserProfile } from '../types';
import { TRENDING_TOPICS, RADAR_NEARBY_USERS } from '../data/mockData';
import { VIBE_COLORS, formatTimeRemaining } from '../lib/vibeColors';

interface ExplorarViewProps {
  vibes: VibeItem[];
  currentUser: UserProfile;
  onSelectVibe: (vibe: VibeItem) => void;
  onOpenChatWith: (userId: string, userName: string) => void;
  isRadarVisible?: boolean;
  onToggleRadarVisible?: () => void;
}

export const ExplorarView: React.FC<ExplorarViewProps> = ({
  vibes,
  currentUser,
  onSelectVibe,
  onOpenChatWith,
  isRadarVisible = true,
  onToggleRadarVisible,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const filteredVibes = vibes.filter((v) => {
    if (selectedTag) {
      return (
        v.content.toLowerCase().includes(selectedTag.replace('#', '').toLowerCase()) ||
        v.location?.toLowerCase().includes(selectedTag.replace('#', '').toLowerCase())
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        v.content.toLowerCase().includes(q) ||
        v.authorName.toLowerCase().includes(q) ||
        v.authorUsername.toLowerCase().includes(q) ||
        v.location?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="pb-24 pt-2 px-4 space-y-5">
      {/* 1. Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (selectedTag) setSelectedTag(null);
          }}
          placeholder="Pesquisar Vibes, locais, pessoas (#Lisboa, Chiado...)"
          className="w-full bg-[#12121D] border border-[#222234] rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#22D3EE] transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
          >
            Limpar
          </button>
        )}
      </div>

      {/* 2. Interactive Social Radar (Proximity Discovery & Visibility Control) */}
      <div className="rounded-2xl bg-gradient-to-b from-[#151524] to-[#0E0E18] border border-[#252538] p-4 relative overflow-hidden shadow-lg">
        <div className="flex items-center justify-between mb-3 relative z-10">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isRadarVisible ? 'bg-[#22D3EE]' : 'bg-purple-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isRadarVisible ? 'bg-[#22D3EE]' : 'bg-purple-500'}`}></span>
            </span>
            <h3 className="font-extrabold text-sm text-white font-['Outfit']">
              Radar de Proximidade
            </h3>
            <span className="text-[10px] text-zinc-400 bg-black/40 px-2 py-0.5 rounded-full border border-white/10 hidden xs:inline">
              5 km
            </span>
          </div>

          {/* Toggle: Aparecer ou não no Radar */}
          {onToggleRadarVisible && (
            <button
              type="button"
              onClick={onToggleRadarVisible}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold transition-all active:scale-95 cursor-pointer shadow-sm ${
                isRadarVisible
                  ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-300 hover:bg-emerald-500/25'
                  : 'bg-purple-950/70 border-purple-500/40 text-purple-200 hover:bg-purple-900/60'
              }`}
              title={isRadarVisible ? "Estás visível. Clica para ativar Modo Fantasma (ocultar perfil)" : "Modo Fantasma ativo. Clica para aparecer no radar"}
            >
              {isRadarVisible ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Visível no Radar</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3 h-3 text-purple-300" />
                  <span>Modo Fantasma (Oculto)</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Visual Radar Screen */}
        <div className={`relative h-36 rounded-xl border overflow-hidden flex items-center justify-center transition-colors ${
          isRadarVisible 
            ? 'bg-[#08080E] border-cyan-500/20' 
            : 'bg-[#0B0914] border-purple-500/20'
        }`}>
          {/* Radar Circles */}
          <div className={`absolute w-20 h-20 rounded-full border ${isRadarVisible ? 'border-cyan-500/20' : 'border-purple-500/15'}`} />
          <div className={`absolute w-36 h-36 rounded-full border ${isRadarVisible ? 'border-cyan-500/15' : 'border-purple-500/10'}`} />
          <div className={`absolute w-52 h-52 rounded-full border ${isRadarVisible ? 'border-cyan-500/10' : 'border-purple-500/5'}`} />
          
          {/* Sweeping radar scanner */}
          <div className={`absolute inset-0 bg-gradient-to-tr from-transparent pointer-events-none ${
            isRadarVisible 
              ? 'via-cyan-500/10 to-transparent animate-spin duration-[4000ms]' 
              : 'via-purple-500/5 to-transparent animate-spin duration-[8000ms] opacity-50'
          }`} />

          {/* Center User Dot */}
          <div className="relative z-10 flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full p-[2px] border ${
              isRadarVisible 
                ? 'border-[#22D3EE] shadow-[0_0_15px_#22D3EE]' 
                : 'border-purple-500/60 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
            } bg-black overflow-hidden flex items-center justify-center transition-all`}>
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className={`w-full h-full object-cover rounded-full ${!isRadarVisible ? 'opacity-60 grayscale-[30%]' : ''}`} 
              />
            </div>
            
            {/* Center Status Tag */}
            <span className={`mt-1 px-1.5 py-0.5 rounded text-[8.5px] font-medium backdrop-blur-md border ${
              isRadarVisible 
                ? 'bg-black/70 border-cyan-500/30 text-cyan-200' 
                : 'bg-purple-950/80 border-purple-500/30 text-purple-300'
            }`}>
              {isRadarVisible ? 'Tu (Visível)' : 'Tu (Invisível)'}
            </span>
          </div>

          {/* Nearby User Pins */}
          {RADAR_NEARBY_USERS.map((user, idx) => {
            const positions = [
              { top: '16%', left: '22%' },
              { top: '22%', right: '22%' },
              { bottom: '20%', left: '30%' },
              { bottom: '16%', right: '28%' },
            ];
            const pos = positions[idx % positions.length];
            const uColor = VIBE_COLORS[user.vibeColor] || VIBE_COLORS.purple;

            return (
              <button
                key={user.id}
                onClick={() => onOpenChatWith(user.id, user.name)}
                style={pos}
                className="absolute z-20 group transform hover:scale-125 transition-transform"
                title={`${user.name} (${user.distance}) - Iniciar conversa efémera`}
              >
                <div className={`w-7 h-7 rounded-full p-[1.5px] border ${uColor.borderClass} ${uColor.glowClass} bg-black overflow-hidden shadow-lg`}>
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-full" />
                </div>
                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-black/80 px-1 py-[1px] rounded text-[8px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {user.distance}
                </span>
              </button>
            );
          })}

          {/* Ghost Mode Overlay Tag */}
          {!isRadarVisible && (
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-purple-950/85 border border-purple-500/30 text-[9.5px] text-purple-200 font-medium flex items-center gap-1 shadow-md">
              <EyeOff className="w-2.5 h-2.5 text-purple-400" />
              <span>Modo Furtivo Ativo</span>
            </div>
          )}
        </div>

        {/* Status description pill below radar */}
        <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-[#10101C] border border-[#222234] flex items-center justify-between text-[11px]">
          <span className="text-zinc-400 flex items-center gap-1.5">
            {isRadarVisible ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <span>Outros utilizadores a &lt; 5 km vêem a tua presença aproximada.</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0" />
                <span className="text-purple-300">Estás 100% invisível. O teu perfil não é mostrado a ninguém.</span>
              </>
            )}
          </span>

          {onToggleRadarVisible && (
            <button
              onClick={onToggleRadarVisible}
              className={`text-[10.5px] font-semibold underline underline-offset-2 shrink-0 ml-2 ${
                isRadarVisible ? 'text-zinc-400 hover:text-white' : 'text-[#22D3EE] hover:text-cyan-300'
              }`}
            >
              {isRadarVisible ? 'Ficar invisível' : 'Ficar visível'}
            </button>
          )}
        </div>

        {/* Nearby People list cards */}
        <div className="grid grid-cols-2 gap-2 mt-3 relative z-10">
          {RADAR_NEARBY_USERS.map((u) => {
            const uColor = VIBE_COLORS[u.vibeColor];
            return (
              <div
                key={u.id}
                onClick={() => onOpenChatWith(u.id, u.name)}
                className="p-2 rounded-xl bg-[#141422] border border-[#252538] hover:border-[#22D3EE]/50 transition-all cursor-pointer flex items-center gap-2 group"
              >
                <div className={`w-8 h-8 rounded-full p-[1px] border ${uColor.borderClass} shrink-0`}>
                  <img src={u.avatar} alt={u.name} className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white truncate group-hover:text-[#22D3EE] transition-colors">{u.name}</p>
                  <p className="text-[10px] text-[#22D3EE] font-mono">{u.distance}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Temas & Hashtags Populares */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-white font-['Outfit'] flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-[#F43F9E]" />
            Temas em Destaque
          </h3>
          {selectedTag && (
            <button
              onClick={() => setSelectedTag(null)}
              className="text-[11px] text-[#22D3EE] hover:underline"
            >
              Ver todos os temas
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {TRENDING_TOPICS.map((topic) => (
            <button
              key={topic.tag}
              onClick={() => {
                setSelectedTag(selectedTag === topic.tag ? null : topic.tag);
                setSearchQuery('');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                selectedTag === topic.tag
                  ? 'bg-gradient-to-r from-[#F43F9E] to-[#8B5CF6] text-white font-semibold shadow-md'
                  : 'bg-[#12121D] border border-[#202030] text-zinc-300 hover:border-zinc-500'
              }`}
            >
              <span>{topic.tag}</span>
              <span className="text-[10px] text-zinc-500 font-mono">
                {topic.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Grid de Descoberta de Vibes */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-white font-['Outfit'] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
            {selectedTag ? `Vibes de ${selectedTag}` : 'Descobrir Momentos'}
          </h3>
          <span className="text-xs text-zinc-500 font-mono">
            {filteredVibes.length} vibes
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {filteredVibes.map((vibe) => {
            const authorColor = VIBE_COLORS[vibe.authorVibeColor] || VIBE_COLORS.purple;
            return (
              <div
                key={vibe.id}
                onClick={() => onSelectVibe(vibe)}
                className="group relative rounded-2xl overflow-hidden bg-[#13131F] border border-[#222234] hover:border-[#8B5CF6]/60 transition-all cursor-pointer shadow-md flex flex-col justify-between"
              >
                {/* 1. Header Dedicado: Horário & Tipo (nunca sobrepõe a foto nem o texto!) */}
                <div className="px-2.5 py-1.5 bg-[#121220] border-b border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-400 font-medium">
                    {vibe.type === 'audio' ? '🎤 Áudio' : vibe.type === 'photo' ? '📸 Imagem' : vibe.type === 'video' ? '🎬 Vídeo' : '💬 Texto'}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-zinc-300 font-mono bg-black/40 px-1.5 py-0.5 rounded-full border border-white/10">
                    <Clock className="w-2.5 h-2.5 text-[#F43F9E]" />
                    <span>{formatTimeRemaining(vibe.expiresAt)}</span>
                  </div>
                </div>

                {/* 2. Conteúdo visual ou textual limpo e desobstruído */}
                {vibe.mediaUrl ? (
                  <div className="relative h-36 w-full overflow-hidden bg-black">
                    <img
                      src={vibe.mediaUrl}
                      alt="Thumbnail"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="p-3 h-36 flex flex-col justify-between bg-gradient-to-br from-[#181826] to-[#0E0E16]">
                    <p className="text-xs text-zinc-200 line-clamp-4 font-medium leading-relaxed italic">
                      "{vibe.content}"
                    </p>
                    {vibe.location && (
                      <span className="text-[10px] text-zinc-500 flex items-center gap-1 truncate">
                        <MapPin className="w-2.5 h-2.5 text-[#22D3EE] shrink-0" />
                        <span className="truncate">{vibe.location}</span>
                      </span>
                    )}
                  </div>
                )}

                {/* 3. Rodapé do Autor com Tracinhos da Vibe */}
                <div className="p-2.5 bg-[#10101A] border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="relative w-6 h-6 flex items-center justify-center shrink-0">
                      <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 24 24">
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          fill="none"
                          stroke={authorColor.hex}
                          strokeWidth="2"
                          strokeDasharray="4.5 2.5"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="w-[17px] h-[17px] rounded-full overflow-hidden">
                        <img src={vibe.authorAvatar} alt={vibe.authorName} className="w-full h-full object-cover rounded-full" />
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-zinc-200 truncate">
                      {vibe.authorName}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1 shrink-0">
                    ❤️ {vibe.likes}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
