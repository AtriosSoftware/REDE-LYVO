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
  MessageSquare
} from 'lucide-react';
import { VibeItem, UserProfile } from '../types';
import { TRENDING_TOPICS, RADAR_NEARBY_USERS } from '../data/mockData';
import { VIBE_COLORS, formatTimeRemaining } from '../lib/vibeColors';

interface ExplorarViewProps {
  vibes: VibeItem[];
  currentUser: UserProfile;
  onSelectVibe: (vibe: VibeItem) => void;
  onOpenChatWith: (userId: string, userName: string) => void;
}

export const ExplorarView: React.FC<ExplorarViewProps> = ({
  vibes,
  currentUser,
  onSelectVibe,
  onOpenChatWith,
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

      {/* 2. Interactive Social Radar (Proximity Discovery) */}
      <div className="rounded-2xl bg-gradient-to-b from-[#151524] to-[#0E0E18] border border-[#252538] p-4 relative overflow-hidden shadow-lg">
        <div className="flex items-center justify-between mb-3 relative z-10">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22D3EE] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#22D3EE]"></span>
            </span>
            <h3 className="font-extrabold text-sm text-white font-['Outfit']">
              Radar de Proximidade
            </h3>
          </div>
          <span className="text-[10px] text-zinc-400 bg-black/40 px-2 py-0.5 rounded-full border border-white/10">
            Raio de 5 km
          </span>
        </div>

        {/* Visual Radar Screen */}
        <div className="relative h-32 rounded-xl bg-[#08080E] border border-cyan-500/20 overflow-hidden flex items-center justify-center">
          {/* Radar Circles */}
          <div className="absolute w-20 h-20 rounded-full border border-cyan-500/20" />
          <div className="absolute w-36 h-36 rounded-full border border-cyan-500/15" />
          <div className="absolute w-52 h-52 rounded-full border border-cyan-500/10" />
          
          {/* Sweeping radar scanner */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-cyan-500/10 to-transparent animate-spin duration-[4000ms] pointer-events-none" />

          {/* Center User Dot */}
          <div className="relative z-10 w-4 h-4 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#22D3EE] shadow-[0_0_12px_#22D3EE] flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
          </div>

          {/* Nearby User Pins */}
          {RADAR_NEARBY_USERS.map((user, idx) => {
            const positions = [
              { top: '24%', left: '26%' },
              { top: '30%', right: '28%' },
              { bottom: '26%', left: '38%' },
              { bottom: '22%', right: '22%' },
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
                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-black/80 px-1 py-[1px] rounded text-[8px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  {user.distance}
                </span>
              </button>
            );
          })}
        </div>

        {/* Nearby People list cards */}
        <div className="grid grid-cols-2 gap-2 mt-3 relative z-10">
          {RADAR_NEARBY_USERS.map((u) => {
            const uColor = VIBE_COLORS[u.vibeColor];
            return (
              <div
                key={u.id}
                onClick={() => onOpenChatWith(u.id, u.name)}
                className="p-2 rounded-xl bg-[#141422] border border-[#252538] hover:border-[#22D3EE]/50 transition-all cursor-pointer flex items-center gap-2"
              >
                <div className={`w-8 h-8 rounded-full p-[1px] border ${uColor.borderClass} shrink-0`}>
                  <img src={u.avatar} alt={u.name} className="w-full h-full object-cover rounded-full" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white truncate">{u.name}</p>
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
                {/* Visual Thumbnail */}
                {vibe.mediaUrl ? (
                  <div className="relative h-40 w-full overflow-hidden bg-black">
                    <img
                      src={vibe.mediaUrl}
                      alt="Thumbnail"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  </div>
                ) : (
                  <div className={`p-4 h-40 flex flex-col justify-between bg-gradient-to-br from-[#181826] to-[#0E0E16] border-b border-[#222234]`}>
                    <p className="text-xs text-zinc-200 line-clamp-4 font-medium leading-relaxed">
                      "{vibe.content}"
                    </p>
                    <span className="text-[10px] text-zinc-500">
                      {vibe.type === 'audio' ? '🎤 Nota de Voz' : '💬 Texto'}
                    </span>
                  </div>
                )}

                {/* Expiration Pill */}
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[9.5px] text-zinc-300 font-mono flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5 text-[#F43F9E]" />
                  <span>{formatTimeRemaining(vibe.expiresAt)}</span>
                </div>

                {/* Author Info footer */}
                <div className="p-2.5 bg-[#10101A] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className={`w-5 h-5 rounded-full p-[1px] border ${authorColor.borderClass} shrink-0`}>
                      <img src={vibe.authorAvatar} alt={vibe.authorName} className="w-full h-full object-cover rounded-full" />
                    </div>
                    <span className="text-[11px] font-medium text-zinc-200 truncate">
                      {vibe.authorName}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">
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
