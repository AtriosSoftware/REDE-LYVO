import React, { useState } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Radio, 
  Flame, 
  Compass, 
  RefreshCw,
  PlusCircle,
  Filter
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
}) => {
  const [selectedLocation, setSelectedLocation] = useState('Todos');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'text' | 'media' | 'audio'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

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

    // Type match
    if (selectedFilter === 'text') return vibe.type === 'text';
    if (selectedFilter === 'media') return vibe.type === 'photo' || vibe.type === 'video';
    if (selectedFilter === 'audio') return vibe.type === 'audio';

    return true;
  });

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    onSimulateIncomingVibe();
    setTimeout(() => setIsRefreshing(false), 700);
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

          {/* Quick manual simulation button */}
          <button
            onClick={handleManualRefresh}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#141420] border border-[#262638] text-[11px] text-zinc-300 hover:text-white transition-all active:scale-95 ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            title="Atualizar feed agora"
          >
            <RefreshCw className="w-3 h-3 text-[#22D3EE]" />
            <span className="text-[10.5px]">Novo Momento</span>
          </button>
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
      <div className="px-4 mt-2.5 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          {[
            { id: 'all' as const, label: 'Todas as Vibes' },
            { id: 'text' as const, label: 'Pensamentos' },
            { id: 'media' as const, label: 'Fotos/Vídeos' },
            { id: 'audio' as const, label: 'Áudios' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setSelectedFilter(id)}
              className={`text-[11px] py-0.5 transition-colors ${
                selectedFilter === id
                  ? 'text-white font-semibold border-b-2 border-[#8B5CF6]'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <span className="text-[10.5px] text-zinc-500 font-mono">
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
              onLike={onLikeVibe}
              onOpenComments={onOpenComments}
              onOpenFullscreen={onOpenFullscreen}
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
