import React from 'react';
import { 
  X, 
  Heart, 
  MessageCircle, 
  Share2, 
  MapPin, 
  Clock, 
  Sparkles,
  Check
} from 'lucide-react';
import { VibeItem } from '../types';
import { VIBE_COLORS, formatTimeRemaining, formatTimeAgo } from '../lib/vibeColors';

interface FullscreenVibeViewerProps {
  vibe: VibeItem | null;
  onClose: () => void;
  onLike: (id: string) => void;
  onOpenComments: (vibe: VibeItem) => void;
}

export const FullscreenVibeViewer: React.FC<FullscreenVibeViewerProps> = ({
  vibe,
  onClose,
  onLike,
  onOpenComments,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!vibe) return null;

  const authorColor = VIBE_COLORS[vibe.authorVibeColor] || VIBE_COLORS.purple;

  const handleShare = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-0 sm:p-4">
      <div className="relative w-full max-w-md h-full sm:h-[90vh] sm:rounded-3xl bg-[#090910] border border-[#222234] overflow-hidden flex flex-col justify-between shadow-2xl">
        
        {/* Top Header */}
        <div className="p-4 bg-gradient-to-b from-black/90 via-black/50 to-transparent z-10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  stroke={authorColor.hex}
                  strokeWidth="2.2"
                  strokeDasharray="5.5 2.8"
                  strokeLinecap="round"
                  style={{ filter: `drop-shadow(0 0 4px ${authorColor.hex}aa)` }}
                />
              </svg>
              <div className="w-[28px] h-[28px] rounded-full overflow-hidden">
                <img
                  src={vibe.authorAvatar}
                  alt={vibe.authorName}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm text-white">{vibe.authorName}</h3>
                <span className="text-xs text-zinc-400">@{vibe.authorUsername}</span>
              </div>
              {vibe.location && (
                <div className="flex items-center gap-1 text-[10.5px] text-[#22D3EE]">
                  <MapPin className="w-3 h-3" />
                  <span>{vibe.location}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/60 border border-white/20 text-[10.5px] text-white font-mono">
              <Clock className="w-3 h-3 text-[#F43F9E]" />
              <span>{formatTimeRemaining(vibe.expiresAt)}</span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center Media or Text */}
        <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
          {vibe.mediaUrl ? (
            <img
              src={vibe.mediaUrl}
              alt="Vibe expandida"
              className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl"
            />
          ) : (
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#1A1A2E] to-[#0E0E18] border border-[#2A2A44] shadow-xl text-center max-w-sm">
              <Sparkles className={`w-8 h-8 ${authorColor.textClass} mx-auto mb-3`} />
              <p className="text-lg text-white font-semibold leading-relaxed">
                "{vibe.content}"
              </p>
              <span className="text-xs text-zinc-500 mt-4 block font-mono">
                Criado há {formatTimeAgo(vibe.createdAt)} • Desaparece em 24h
              </span>
            </div>
          )}
        </div>

        {/* Bottom Interaction & Caption */}
        <div className="p-4 bg-gradient-to-t from-black via-black/80 to-transparent space-y-3 z-10">
          {vibe.content && vibe.mediaUrl && (
            <p className="text-sm text-zinc-200 font-medium">
              {vibe.content}
            </p>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <div className="flex items-center gap-4">
              <button
                onClick={() => onLike(vibe.id)}
                className={`flex items-center gap-1.5 text-xs font-semibold ${
                  vibe.hasLiked ? 'text-[#F43F9E]' : 'text-white'
                }`}
              >
                <Heart className={`w-5 h-5 ${vibe.hasLiked ? 'fill-[#F43F9E]' : ''}`} />
                <span>{vibe.likes}</span>
              </button>

              <button
                onClick={() => onOpenComments(vibe)}
                className="flex items-center gap-1.5 text-xs font-semibold text-white"
              >
                <MessageCircle className="w-5 h-5" />
                <span>{vibe.commentsCount}</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 text-xs font-semibold text-white"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Share2 className="w-5 h-5" />}
                <span>{copied ? 'Copiado!' : vibe.sharesCount}</span>
              </button>
            </div>

            <span className="text-[10.5px] text-zinc-400">
              Eliminação automática às 24h
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
