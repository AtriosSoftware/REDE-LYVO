import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MapPin, 
  Clock, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';
import { VibeItem } from '../types';
import { VIBE_COLORS, formatTimeRemaining, formatTimeAgo } from '../lib/vibeColors';

interface VibeCardProps {
  vibe: VibeItem;
  onLike: (id: string) => void;
  onOpenComments: (vibe: VibeItem) => void;
  onOpenFullscreen?: (vibe: VibeItem) => void;
}

export const VibeCard: React.FC<VibeCardProps> = ({
  vibe,
  onLike,
  onOpenComments,
  onOpenFullscreen,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [likedAnimation, setLikedAnimation] = useState(false);

  const authorColor = VIBE_COLORS[vibe.authorVibeColor] || VIBE_COLORS.purple;

  // Audio mock playback simulation
  useEffect(() => {
    let interval: any;
    if (isPlayingAudio) {
      interval = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 100) {
            setIsPlayingAudio(false);
            return 0;
          }
          return prev + 5;
        });
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isPlayingAudio]);

  const handleLikeClick = () => {
    setLikedAnimation(true);
    setTimeout(() => setLikedAnimation(false), 500);
    onLike(vibe.id);
  };

  const handleShareClick = () => {
    setIsCopied(true);
    navigator.clipboard?.writeText?.(`${window.location.origin}/#vibe/${vibe.id}`);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Calculate percentage of 24h lifetime left for the burn bar
  const totalLifetime = 24 * 60 * 60 * 1000;
  const timeLeft = Math.max(0, vibe.expiresAt - Date.now());
  const percentLeft = Math.min(100, Math.max(5, (timeLeft / totalLifetime) * 100));

  return (
    <article className="relative bg-[#11111A]/90 backdrop-blur-md rounded-2xl border border-[#1E1E2C] overflow-hidden shadow-lg transition-all hover:border-[#2E2E42]">
      {/* Expiration Bar on top */}
      <div className="w-full bg-[#181824] h-1 relative overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${authorColor.gradient} transition-all duration-1000`}
          style={{ width: `${percentLeft}%` }}
        />
      </div>

      <div className="p-4">
        {/* Card Header: Author, Location, TTL badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`relative w-10 h-10 rounded-full p-[2px] border ${authorColor.borderClass} ${authorColor.glowClass}`}>
              <img
                src={vibe.authorAvatar}
                alt={vibe.authorName}
                className="w-full h-full object-cover rounded-full"
                loading="lazy"
              />
              <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ${authorColor.bgClass} border-2 border-[#11111A]`} />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold text-[13.5px] text-white leading-none">
                  {vibe.authorName}
                </h3>
                {vibe.isSponsored ? (
                  <span className="text-[9.5px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Patrocinado
                  </span>
                ) : (
                  <span className="text-[11.5px] text-zinc-400 font-normal">
                    @{vibe.authorUsername}
                  </span>
                )}
              </div>

              {vibe.location && (
                <div className="flex items-center gap-1 text-[11px] text-zinc-400 mt-1">
                  <MapPin className="w-3 h-3 text-[#22D3EE] shrink-0" />
                  <span className="truncate max-w-[150px]">{vibe.location}</span>
                  {vibe.distance && (
                    <span className="text-zinc-500 text-[10px]">• {vibe.distance}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Ephemeral Countdown Pill */}
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#181826] border border-[#2B2B3E] text-[10.5px] text-zinc-300 font-mono">
              <Clock className="w-3 h-3 text-[#F43F9E] animate-pulse" />
              <span>{formatTimeRemaining(vibe.expiresAt)}</span>
            </div>
            <span className="text-[9.5px] text-zinc-500 mt-0.5">
              {formatTimeAgo(vibe.createdAt)}
            </span>
          </div>
        </div>

        {/* Content Section based on Vibe Type */}
        {vibe.type === 'text' && (
          <div 
            onClick={() => onOpenFullscreen?.(vibe)}
            className={`cursor-pointer rounded-xl p-4 my-2 border ${authorColor.borderClass}/30 bg-gradient-to-br from-[#181826] via-[#12121D] to-[#0D0D15] shadow-inner relative group`}
          >
            <p className="text-[15px] sm:text-[16px] text-zinc-100 font-medium leading-relaxed">
              {vibe.content}
            </p>
            <div className="mt-3 flex items-center justify-between text-[10.5px] text-zinc-500">
              <span className="flex items-center gap-1">
                <Sparkles className={`w-3 h-3 ${authorColor.textClass}`} />
                Vibe pura e espontânea
              </span>
              <span className="text-[10px] text-zinc-400 group-hover:text-white transition-colors">
                Tocar para expandir →
              </span>
            </div>
          </div>
        )}

        {vibe.type === 'photo' && vibe.mediaUrl && (
          <div className="relative my-2 rounded-xl overflow-hidden bg-black/40 group">
            <img
              src={vibe.mediaUrl}
              alt="Vibe visual"
              onClick={() => onOpenFullscreen?.(vibe)}
              className="w-full max-h-96 object-cover rounded-xl cursor-pointer transition-transform duration-300 group-hover:scale-[1.01]"
              loading="lazy"
            />
            {vibe.content && (
              <div className="p-3 bg-gradient-to-t from-[#0B0B12] via-[#0B0B12]/80 to-transparent">
                <p className="text-[13.5px] text-zinc-200 font-medium">
                  {vibe.content}
                </p>
              </div>
            )}
          </div>
        )}

        {vibe.type === 'video' && vibe.mediaUrl && (
          <div 
            onClick={() => onOpenFullscreen?.(vibe)}
            className="relative my-2 rounded-xl overflow-hidden bg-black/50 group cursor-pointer"
          >
            <img
              src={vibe.mediaUrl}
              alt="Prévia de vídeo"
              className="w-full max-h-96 object-cover rounded-xl"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/20 transition-colors">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                <Play className="w-5 h-5 fill-white ml-0.5" />
              </div>
            </div>
            <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] text-white font-medium">
              Vídeo Curto • 24h
            </span>
            {vibe.content && (
              <div className="p-3 bg-gradient-to-t from-[#0B0B12] via-[#0B0B12]/80 to-transparent">
                <p className="text-[13.5px] text-zinc-200 font-medium">
                  {vibe.content}
                </p>
              </div>
            )}
          </div>
        )}

        {vibe.type === 'audio' && (
          <div className="my-2 p-3.5 rounded-xl bg-[#171724] border border-[#262638] relative overflow-hidden">
            <div className="flex items-center gap-3">
              {/* Play / Pause button */}
              <button
                onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                className={`w-11 h-11 rounded-full flex items-center justify-center text-white transition-all shadow-md active:scale-95 ${
                  isPlayingAudio ? 'bg-[#F43F9E]' : 'bg-[#8B5CF6]'
                }`}
              >
                {isPlayingAudio ? (
                  <Pause className="w-5 h-5 fill-white" />
                ) : (
                  <Play className="w-5 h-5 fill-white ml-0.5" />
                )}
              </button>

              {/* Waveform Visualizer */}
              <div className="flex-1">
                <div className="flex items-end gap-[3px] h-8 w-full py-1">
                  {[40, 65, 80, 45, 90, 70, 30, 85, 95, 60, 45, 75, 85, 35, 90, 65, 50, 80, 40, 60].map((h, i) => {
                    const activeBar = (i / 20) * 100 <= audioProgress;
                    return (
                      <span
                        key={i}
                        className={`flex-1 rounded-full transition-all duration-150 ${
                          activeBar ? 'bg-[#22D3EE]' : 'bg-zinc-700'
                        }`}
                        style={{
                          height: `${isPlayingAudio ? Math.max(20, (h * (1 + Math.sin(i + Date.now() / 200))) / 2) : h}%`,
                        }}
                      />
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-1">
                  <span>{isPlayingAudio ? 'A reproduzir...' : 'Áudio espontâneo'}</span>
                  <span className="font-mono">
                    0:{vibe.audioDuration ? String(vibe.audioDuration).padStart(2, '0') : '18'}
                  </span>
                </div>
              </div>
            </div>

            {vibe.content && (
              <p className="text-[13px] text-zinc-300 mt-2.5 font-normal">
                {vibe.content}
              </p>
            )}
          </div>
        )}

        {/* Sponsored CTA if applicable */}
        {vibe.isSponsored && vibe.sponsoredCta && (
          <div className="mt-2 pt-2 border-t border-[#1F1F2F] flex items-center justify-between">
            <span className="text-[11px] text-zinc-400">Sugestão contextual perto de ti</span>
            <button
              onClick={() => alert(`Redirecionando para reservas: ${vibe.authorName}`)}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5 border border-amber-500/30 transition-all"
            >
              <span>{vibe.sponsoredCta}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Action Controls Footer */}
        <div className="mt-3 pt-2.5 border-t border-[#1C1C28] flex items-center justify-between text-zinc-400">
          <div className="flex items-center gap-4">
            {/* Like */}
            <button
              onClick={handleLikeClick}
              className={`flex items-center gap-1.5 text-xs font-medium transition-all active:scale-125 ${
                vibe.hasLiked ? 'text-[#F43F9E]' : 'hover:text-white'
              }`}
            >
              <Heart
                className={`w-4 h-4 transition-transform ${
                  vibe.hasLiked ? 'fill-[#F43F9E] text-[#F43F9E]' : ''
                } ${likedAnimation ? 'scale-125' : ''}`}
              />
              <span>{vibe.likes}</span>
            </button>

            {/* Comments */}
            <button
              onClick={() => onOpenComments(vibe)}
              className="flex items-center gap-1.5 text-xs font-medium hover:text-white transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{vibe.commentsCount}</span>
            </button>

            {/* Share */}
            <button
              onClick={handleShareClick}
              className="flex items-center gap-1.5 text-xs font-medium hover:text-white transition-colors"
              title="Copiar link temporário da Vibe"
            >
              {isCopied ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
              <span className="hidden xs:inline">
                {isCopied ? 'Copiado!' : vibe.sharesCount}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
            <ShieldCheck className="w-3 h-3 text-zinc-500" />
            <span>Eliminação auto às 24h</span>
          </div>
        </div>
      </div>
    </article>
  );
};
