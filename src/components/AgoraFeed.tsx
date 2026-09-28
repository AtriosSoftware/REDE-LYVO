import React, { useState } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Radio, 
  Flame, 
  Compass, 
  RefreshCw,
  PlusCircle,
  Filter,
  Zap
} from 'lucide-react';
import { VibeItem, StoryGroup, UserProfile } from '../types';
import { StoryReel } from './StoryReel';
import { VibeCard } from './VibeCard';

interface AgoraFeedProps {
  vibes: VibeItem[];
  stories: StoryGroup[];
  currentUser: UserProfile;
  onLikeVibe: (id: string) => void;
  onOpenComments: (vibe: VibeItem) => void;
  onOpenStory: (story: StoryGroup) => void;
  onOpenCreate: () => void;
  onOpenFullscreen?: (vibe: VibeItem) => void;
  onSimulateIncomingVibe: () => void;
  onEditVibe?: (vibe: VibeItem) => void;
  onCallAttention?: (vibeId: string, emoji: string) => void;
}

const LOCATION_PILLS = [
  'Todos',
  '📍 Lisboa',
  '📍 Porto',
  '📍 Chiado',
  '📍 Bairro Alto',
  '📍 Perto de Mim',
];

export const AgoraFeed: React.FC<AgoraFeedProps> = ({
  vibes,
  stories,
  currentUser,
  onLikeVibe,
  onOpenComments,
  onOpenStory,
  onOpenCreate,
  onOpenFullscreen,
  onSimulateIncomingVibe,
  onEditVibe,
  onCallAttention,
}) => {
  const [selectedLocation, setSelectedLocation] = useState('Todos');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'hot' | 'text' | 'media' | 'audio'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);

  // Filter vibes
  const filteredVibes = vibes.filter((vibe) => {
    // Location match
    if (selectedLocation !== 'Todos') {
      const cleanLoc = selectedLocation.replace('📍 ', '').toLowerCase();
      if (cleanLoc === 'perto de mim') {
        if (!vibe.distance?.includes('m') && !vibe.distance?.includes('1.')) return false;
      } else if (!vibe.location?.toLowerCase().includes(cleanLoc)) {
        return false;
      }
    }

    // Type / Hot match
    if (selectedFilter === 'hot') return vibe.likes >= 35;
    if (selectedFilter === 'text') return vibe.type === 'text';
    if (selectedFilter === 'media') return vibe.type === 'photo' || vibe.type === 'video';
    if (selectedFilter === 'audio') return vibe.type === 'audio';

    return true;
  });

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setPulseKey((prev) => prev + 1);
    onSimulateIncomingVibe();
    setTimeout(() => setIsRefreshing(false), 850);
  };

  return (
    <div className="pb-24 pt-2">
      {/* 1. Stories Reel at Top */}
      <div className="mb-2">
        <StoryReel
          stories={stories}
          currentUser={currentUser}
          onOpenStory={onOpenStory}
          onAddNewStory={onOpenCreate}
        />
      </div>

      {/* 2. "AGORA" Live Section Banner */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 text-[#A78BFA]">
              <Radio className="w-3.5 h-3.5 animate-pulse text-[#22D3EE]" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-white tracking-wide font-['Outfit'] flex items-center gap-1.5">
                AGORA
                <span className="text-[10px] font-normal text-zinc-400 font-sans tracking-normal">
                  • Em direto
                </span>
              </h2>
            </div>
          </div>

          {/* Innovative "Novo Momento" Live Pulse Button */}
          <div className="relative group">
            {/* Ambient Breathing Neon Aura */}
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#8B5CF6]/50 via-[#22D3EE]/50 to-[#F43F9E]/50 opacity-60 blur-md group-hover:opacity-95 transition-opacity duration-500 animate-aura-breath -z-10 pointer-events-none" />

            {/* Dynamic Shockwave ripple wave on click */}
            {pulseKey > 0 && (
              <span
                key={pulseKey}
                className="absolute inset-0 rounded-full border-2 border-[#22D3EE] animate-shockwave pointer-events-none z-20"
              />
            )}

            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="relative flex items-center p-[1.5px] rounded-full bg-gradient-to-r from-[#8B5CF6] via-[#22D3EE] to-[#F43F9E] animate-gradient-sweep transition-all duration-300 transform active:scale-90 hover:scale-105 shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:shadow-[0_0_24px_rgba(139,92,246,0.65)] cursor-pointer select-none overflow-hidden"
              title="Sintonizar novo momento ao vivo"
            >
              {/* Inner dark glassmorphic body */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0B0B14]/90 backdrop-blur-xl w-full h-full relative overflow-hidden group-hover:bg-[#111124]/90 transition-colors">
                
                {/* Sweeping Light Shimmer Beam */}
                <div className="absolute inset-0 w-2/3 h-full bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none animate-light-shimmer" />

                {/* Pulsing Live Energy Beacon */}
                <div className="relative flex items-center justify-center w-2 h-2 mr-0.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22D3EE] opacity-80" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#22D3EE] shadow-[0_0_8px_#22D3EE]" />
                </div>

                {/* Electric Icon with smooth acceleration and sparkles */}
                <div className="relative flex items-center justify-center">
                  <RefreshCw
                    className={`w-3.5 h-3.5 transition-all duration-500 ${
                      isRefreshing
                        ? 'animate-spin-electric text-[#F43F9E] drop-shadow-[0_0_8px_#F43F9E]'
                        : 'group-hover:rotate-180 text-[#22D3EE] drop-shadow-[0_0_6px_#22D3EE]'
                    }`}
                  />
                  {isRefreshing && (
                    <Sparkles className="w-2.5 h-2.5 text-yellow-300 absolute -top-1.5 -right-1.5 animate-bounce drop-shadow-[0_0_4px_#FDE047]" />
                  )}
                </div>

                {/* Gradient typography with live feedback */}
                <span className="text-[11px] font-bold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent group-hover:from-white group-hover:to-[#22D3EE] transition-all">
                  {isRefreshing ? 'A sintonizar...' : 'Novo Momento'}
                </span>

                {/* Micro Zap Energy Accent */}
                <Zap
                  className={`w-3 h-3 text-amber-400 transition-transform duration-300 ${
                    isRefreshing ? 'scale-125 text-yellow-300 animate-pulse' : 'opacity-85 group-hover:scale-110'
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        <p className="text-[12px] text-zinc-400 mt-1">
          O que as pessoas normais estão a viver neste exato segundo.
        </p>
      </div>

      {/* 3. Location Filter Pills */}
      <div className="px-4 overflow-x-auto no-scrollbar py-1">
        <div className="flex items-center gap-1.5 min-w-max">
          {LOCATION_PILLS.map((loc) => (
            <button
              key={loc}
              onClick={() => setSelectedLocation(loc)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedLocation === loc
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] text-white shadow-[0_0_10px_rgba(139,92,246,0.3)] font-semibold'
                  : 'bg-[#12121D] text-zinc-400 border border-[#202030] hover:text-zinc-200'
              }`}
            >
              {loc}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Secondary Type Filters */}
      <div className="px-4 mt-2.5 flex items-center justify-between text-xs text-zinc-400 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2.5 min-w-max">
          {[
            { id: 'all' as const, label: 'Todas as Vibes' },
            { id: 'hot' as const, label: '🔥 Em Alta' },
            { id: 'text' as const, label: 'Pensamentos' },
            { id: 'media' as const, label: 'Fotos/Vídeos' },
            { id: 'audio' as const, label: 'Áudios' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setSelectedFilter(id)}
              className={`text-[11px] py-0.5 transition-colors cursor-pointer ${
                selectedFilter === id
                  ? 'text-white font-semibold border-b-2 border-[#8B5CF6]'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <span className="text-[10.5px] text-zinc-500 font-mono ml-2 shrink-0">
          {filteredVibes.length} vibes ativas
        </span>
      </div>

      {/* 5. Vibes Stream */}
      <div className="px-4 mt-3 space-y-4">
        {filteredVibes.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#11111A] border border-[#202030] text-center space-y-3">
            <Sparkles className="w-8 h-8 text-[#8B5CF6] mx-auto opacity-70" />
            <h3 className="font-bold text-white text-sm">Sem Vibes ativas nesta seleção</h3>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto">
              Todas as vibes anteriores já expiraram ou foram purgadas após 24h.
            </p>
            <button
              onClick={onOpenCreate}
              className="mt-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] text-white text-xs font-semibold shadow-md active:scale-95"
            >
              Publicar a primeira Vibe agora
            </button>
          </div>
        ) : (
          filteredVibes.map((vibe) => (
            <VibeCard
              key={vibe.id}
              vibe={vibe}
              currentUser={currentUser}
              onLike={onLikeVibe}
              onOpenComments={onOpenComments}
              onOpenFullscreen={onOpenFullscreen}
              onEdit={onEditVibe}
              onCallAttention={onCallAttention}
            />
          ))
        )}
      </div>

      {/* Bottom Ephemeral Guarantee Footnote */}
      <div className="mt-8 px-6 text-center">
        <p className="text-[11px] text-zinc-500 flex items-center justify-center gap-1.5">
          <span>🔒 LYVO Zero Storage:</span>
          <span>Conteúdo apagado dos servidores após 24 horas.</span>
        </p>
      </div>
    </div>
  );
};
