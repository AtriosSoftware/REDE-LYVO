import React, { useState, useEffect } from 'react';
import { 
  X, 
  Heart, 
  MessageCircle, 
  Share2, 
  Send, 
  MapPin, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  Check
} from 'lucide-react';
import { StoryGroup, VibeItem } from '../types';
import { VIBE_COLORS, formatTimeRemaining, formatTimeAgo } from '../lib/vibeColors';

interface StoryViewerProps {
  storyGroup: StoryGroup;
  onClose: () => void;
  onSendReply: (recipientName: string, text: string) => void;
  onLikeVibe: (vibeId: string) => void;
  onOpenComments: (vibe: VibeItem) => void;
}

export const StoryViewer: React.FC<StoryViewerProps> = ({
  storyGroup,
  onClose,
  onSendReply,
  onLikeVibe,
  onOpenComments,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [replyText, setReplyText] = useState('');
  const [sentToast, setSentToast] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const currentVibe = storyGroup.vibes[currentIndex] || storyGroup.vibes[0];
  const colorConfig = VIBE_COLORS[storyGroup.userVibeColor] || VIBE_COLORS.purple;

  // Auto-progress timer (5 seconds per story slide)
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentIndex < storyGroup.vibes.length - 1) {
            setCurrentIndex((c) => c + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentIndex, isPaused, storyGroup.vibes.length, onClose]);

  const handleNext = () => {
    if (currentIndex < storyGroup.vibes.length - 1) {
      setCurrentIndex((c) => c + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((c) => c - 1);
      setProgress(0);
    }
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!replyText.trim()) return;

    onSendReply(storyGroup.userName, replyText);
    setReplyText('');
    setSentToast(true);
    setTimeout(() => setSentToast(false), 2500);
  };

  const handleQuickReaction = (emoji: string) => {
    onSendReply(storyGroup.userName, `Reagiu com ${emoji}`);
    setSentToast(true);
    setTimeout(() => setSentToast(false), 2500);
  };

  if (!currentVibe) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-0 sm:p-4 backdrop-blur-xl">
      <div className="relative w-full max-w-md h-full sm:h-[92vh] sm:rounded-3xl overflow-hidden bg-[#0A0A12] border-0 sm:border border-white/10 flex flex-col justify-between shadow-2xl">
        
        {/* Background Media / Graphic */}
        <div className="absolute inset-0 z-0">
          {currentVibe.mediaUrl ? (
            <img
              src={currentVibe.mediaUrl}
              alt="Story"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-b from-[#1E1238] via-[#0E0B1A] to-[#08080D] flex items-center justify-center p-8`}>
              <p className="text-xl sm:text-2xl text-white font-semibold text-center leading-relaxed drop-shadow-md">
                "{currentVibe.content}"
              </p>
            </div>
          )}
          {/* Subtle gradient overlays for legibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90 pointer-events-none" />
        </div>

        {/* Tap zones for navigation */}
        <div className="absolute inset-y-16 inset-x-0 z-10 flex">
          <div 
            className="w-1/3 h-full cursor-pointer" 
            onClick={handlePrev}
            onMouseDown={() => setIsPaused(true)}
            onMouseUp={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          />
          <div 
            className="w-2/3 h-full cursor-pointer" 
            onClick={handleNext}
            onMouseDown={() => setIsPaused(true)}
            onMouseUp={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          />
        </div>

        {/* Top Header: Progress bars & User profile */}
        <div className="relative z-20 p-4 space-y-3">
          {/* Progress bar line segments */}
          <div className="flex items-center gap-1.5 w-full">
            {storyGroup.vibes.map((_, idx) => (
              <div key={idx} className="flex-1 h-1 rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-100"
                  style={{
                    width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%',
                  }}
                />
              </div>
            ))}
          </div>

          {/* User info & close */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    stroke={colorConfig.hex}
                    strokeWidth="2.2"
                    strokeDasharray="5.5 2.8"
                    strokeLinecap="round"
                    style={{ filter: `drop-shadow(0 0 4px ${colorConfig.hex}aa)` }}
                  />
                </svg>
                <div className="w-[28px] h-[28px] rounded-full overflow-hidden">
                  <img
                    src={storyGroup.userAvatar}
                    alt={storyGroup.userName}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-white drop-shadow">
                    {storyGroup.userName}
                  </span>
                  <span className="text-[11px] text-white/70">
                    {formatTimeAgo(currentVibe.createdAt)}
                  </span>
                </div>
                {currentVibe.location && (
                  <div className="flex items-center gap-1 text-[10.5px] text-[#22D3EE] drop-shadow">
                    <MapPin className="w-3 h-3" />
                    <span>{currentVibe.location}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10.5px] text-white font-mono">
                <Clock className="w-3 h-3 text-[#F43F9E]" />
                <span>{formatTimeRemaining(currentVibe.expiresAt)}</span>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Floating Right Interaction Bar (Matching the uploaded design!) */}
        <div className="absolute right-3.5 bottom-24 z-20 flex flex-col items-center gap-4">
          {/* Like */}
          <button
            onClick={() => onLikeVibe(currentVibe.id)}
            className="flex flex-col items-center gap-1 group active:scale-125 transition-transform"
          >
            <div className={`w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${
              currentVibe.hasLiked
                ? 'bg-[#F43F9E] text-white shadow-[0_0_15px_#F43F9E]'
                : 'bg-black/50 text-white border border-white/20 hover:bg-black/70'
            }`}>
              <Heart className={`w-5 h-5 ${currentVibe.hasLiked ? 'fill-white' : ''}`} />
            </div>
            <span className="text-xs font-semibold text-white drop-shadow">
              {currentVibe.likes}
            </span>
          </button>

          {/* Comment */}
          <button
            onClick={() => onOpenComments(currentVibe)}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-md text-white border border-white/20 flex items-center justify-center hover:bg-black/70 transition-colors">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-white drop-shadow">
              {currentVibe.commentsCount}
            </span>
          </button>

          {/* Share */}
          <button
            onClick={() => {
              navigator.clipboard?.writeText?.(window.location.href);
              setSentToast(true);
              setTimeout(() => setSentToast(false), 2000);
            }}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-md text-white border border-white/20 flex items-center justify-center hover:bg-black/70 transition-colors">
              <Share2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-white drop-shadow">
              {currentVibe.sharesCount}
            </span>
          </button>
        </div>

        {/* Bottom Vibe Caption & Ephemeral Reply Box */}
        <div className="relative z-20 p-4 space-y-3 bg-gradient-to-t from-black via-black/80 to-transparent">
          {currentVibe.content && (
            <p className="text-[14px] text-white font-medium drop-shadow-md pr-16 line-clamp-2">
              {currentVibe.content}
            </p>
          )}

          {/* Quick Reaction Pill Emoji Bar */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {['🔥', '❤️', '😂', '👏', '⚡', '🍹'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleQuickReaction(emoji)}
                className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md hover:bg-white/25 active:scale-95 transition-all text-sm"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Reply Form */}
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Responder a ${storyGroup.userName} (mensagem efémera)...`}
              className="flex-1 bg-white/15 backdrop-blur-md border border-white/20 rounded-full px-4 py-2.5 text-sm text-white placeholder-white/60 focus:outline-none focus:border-[#8B5CF6]"
            />
            <button
              type="submit"
              disabled={!replyText.trim()}
              className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#22D3EE] text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_12px_rgba(139,92,246,0.4)]"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>

          {/* Sent Toast Notification */}
          {sentToast && (
            <div className="absolute top-[-40px] left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-emerald-500/90 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg backdrop-blur-md animate-bounce">
              <Check className="w-3.5 h-3.5" />
              <span>Enviado! Desaparece em 24h.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
