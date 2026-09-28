import React, { useState, useEffect, useRef } from 'react';
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
  Check,
  Flame,
  Zap,
  Radio,
  Edit3,
  Bell
} from 'lucide-react';
import { VibeItem, UserProfile } from '../types';
import { VIBE_COLORS, formatTimeRemaining, formatTimeAgo } from '../lib/vibeColors';

interface VibeCardProps {
  vibe: VibeItem;
  currentUser?: UserProfile;
  onLike: (id: string) => void;
  onOpenComments: (vibe: VibeItem) => void;
  onOpenFullscreen?: (vibe: VibeItem) => void;
  onEdit?: (vibe: VibeItem) => void;
  onCallAttention?: (vibeId: string, emoji: string) => void;
}

interface FloatingSpark {
  id: number;
  emoji: string;
  x: number;
}

export const VibeCard: React.FC<VibeCardProps> = ({
  vibe,
  currentUser,
  onLike,
  onOpenComments,
  onOpenFullscreen,
  onEdit,
  onCallAttention,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [likedAnimation, setLikedAnimation] = useState(false);
  const [floatingSparks, setFloatingSparks] = useState<FloatingSpark[]>([]);
  const [doubleTapHeart, setDoubleTapHeart] = useState(false);

  const lastTapRef = useRef<number>(0);
  const authorColor = VIBE_COLORS[vibe.authorVibeColor] || VIBE_COLORS.purple;

  const isOwn = currentUser
    ? vibe.authorId === currentUser.id || vibe.authorUsername === currentUser.username
    : false;

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
    triggerSpark('💖');
    onLike(vibe.id);
  };

  const triggerSpark = (emoji: string) => {
    const newSpark: FloatingSpark = {
      id: Date.now() + Math.random(),
      emoji,
      x: Math.floor(Math.random() * 60) + 20,
    };
    setFloatingSparks((prev) => [...prev.slice(-5), newSpark]);
    setTimeout(() => {
      setFloatingSparks((prev) => prev.filter((s) => s.id !== newSpark.id));
    }, 1200);

    if (onCallAttention) {
      onCallAttention(vibe.id, emoji);
    }

    if (!vibe.hasLiked) {
      onLike(vibe.id);
    }
  };

  const handleMediaDoubleTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 320) {
      setDoubleTapHeart(true);
      triggerSpark('💖');
      if (!vibe.hasLiked) onLike(vibe.id);
      setTimeout(() => setDoubleTapHeart(false), 800);
    }
    lastTapRef.current = now;
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

  // Determine hot/active status to draw attention
  const isHot = vibe.likes >= 40;
  const isFresh = Date.now() - vibe.createdAt < 2 * 3600 * 1000;

  return (
    <article className={`relative bg-gradient-to-b from-[#131322] via-[#0F0F1A] to-[#0A0A12] backdrop-blur-md rounded-2xl border transition-all duration-300 overflow-hidden shadow-xl ${
      isHot 
        ? 'border-[#F43F9E]/40 shadow-[0_0_24px_rgba(244,63,158,0.18)] hover:border-[#F43F9E]/70' 
        : 'border-[#222238] hover:border-[#22D3EE]/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.12)]'
    }`}>
      {/* Expiration Bar on top */}
      <div className="w-full bg-[#181824] h-1.5 relative overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${authorColor.gradient} transition-all duration-1000`}
          style={{ width: `${percentLeft}%` }}
        />
      </div>

      {/* Floating Attention Emojis */}
      {floatingSparks.map((spark) => (
        <div
          key={spark.id}
          style={{ left: `${spark.x}%`, bottom: '65px' }}
          className="absolute z-50 text-2xl animate-float-up pointer-events-none select-none drop-shadow-[0_0_12px_rgba(255,255,255,0.9)]"
        >
          {spark.emoji}
        </div>
      ))}

      <div className="p-4">
        {/* Top Attention Banner — Highlights Vibes to catch users' eyes */}
        {isHot ? (
          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#F43F9E]/20 via-[#F97316]/20 to-purple-500/20 border border-[#F43F9E]/40 text-[#F9A8D4] mb-3 shadow-[0_0_15px_rgba(244,63,158,0.2)]">
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-[#F97316] fill-[#F97316] animate-bounce" />
              <span className="text-[11px] font-extrabold tracking-wide uppercase font-['Outfit']">Vibe em Chamas</span>
            </div>
            <span className="text-[10.5px] text-zinc-300 font-mono font-medium">🔥 {vibe.likes} reações</span>
          </div>
        ) : isFresh ? (
          <div className="flex items-center justify-between px-3 py-1 rounded-xl bg-gradient-to-r from-[#22D3EE]/20 via-[#8B5CF6]/20 to-transparent border border-[#22D3EE]/35 text-[#7DD3FC] mb-3">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#22D3EE] fill-[#22D3EE] animate-pulse" />
              <span className="text-[11px] font-bold tracking-wide uppercase">Recém Publicada</span>
            </div>
            <span className="text-[10px] text-cyan-200/90 font-mono">24h a contar</span>
          </div>
        ) : vibe.type === 'audio' ? (
          <div className="flex items-center justify-between px-3 py-1 rounded-xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-transparent border border-purple-500/35 text-purple-200 mb-3">
            <div className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-[#A78BFA] animate-pulse" />
              <span className="text-[11px] font-bold tracking-wide uppercase">Vibe Sonora Ao Vivo</span>
            </div>
            <span className="text-[10px] text-purple-300/90 font-mono">Áudio Efémero</span>
          </div>
        ) : null}

        {/* Card Header: Author, Location, TTL badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            {/* Author Avatar with Dashed Vibe Ring (tracinhos ao redor do perfil na vibe) */}
            <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 40 40">
                <circle
                  cx="20"
                  cy="20"
                  r="17"
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="2"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="17"
                  fill="none"
                  stroke={authorColor.hex}
                  strokeWidth="2.2"
                  strokeDasharray="6 3.2"
                  strokeLinecap="round"
                  style={{ filter: `drop-shadow(0 0 4px ${authorColor.hex}aa)` }}
                />
              </svg>
              <div className="w-[30px] h-[30px] rounded-full overflow-hidden p-[1px] bg-[#0A0A14]">
                <img
                  src={vibe.authorAvatar}
                  alt={vibe.authorName}
                  className="w-full h-full object-cover rounded-full"
                  loading="lazy"
                />
              </div>
              <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${authorColor.bgClass} border-2 border-[#11111A]`} />
            </div>

            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-semibold text-[13.5px] text-white leading-none">
                  {vibe.authorName}
                </h3>
                {vibe.isSponsored ? (
                  <span className="text-[9.5px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Patrocinado
                  </span>
                ) : isOwn ? (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#8B5CF6]/25 text-[#C4B5FD] border border-[#8B5CF6]/40 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22D3EE] animate-pulse" />
                    A tua publicação
                  </span>
                ) : (
                  <span className="text-[11.5px] text-zinc-400 font-normal">
                    @{vibe.authorUsername}
                  </span>
                )}
                {vibe.editedAt && (
                  <span className="text-[9.5px] text-[#22D3EE] font-mono px-1 py-0.2 rounded bg-cyan-950/40 border border-cyan-800/40">
                    • Editado
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

          {/* Ephemeral Countdown Pill & Alterar button */}
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#181826] border border-[#2B2B3E] text-[10.5px] text-zinc-300 font-mono shadow-sm">
              <Clock className="w-3 h-3 text-[#F43F9E] animate-pulse" />
              <span>{formatTimeRemaining(vibe.expiresAt)}</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <span className="text-[9.5px] text-zinc-500">
                {formatTimeAgo(vibe.createdAt)}
              </span>

              {isOwn && onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(vibe)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gradient-to-r from-[#8B5CF6]/30 to-[#22D3EE]/25 hover:from-[#8B5CF6]/50 hover:to-[#22D3EE]/45 border border-[#8B5CF6]/60 text-white transition-all text-[11px] font-bold shadow-sm active:scale-95 cursor-pointer group"
                  title="Fazer alteração na tua publicação"
                >
                  <Edit3 className="w-3 h-3 text-[#22D3EE] group-hover:rotate-12 transition-transform" />
                  <span>Alterar</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Section based on Vibe Type */}
        {vibe.type === 'text' && (
          <div 
            onClick={() => onOpenFullscreen?.(vibe)}
            className={`cursor-pointer rounded-2xl p-5 my-2.5 border ${authorColor.borderClass}/40 bg-gradient-to-br from-[#1A1A2E]/90 via-[#131322]/90 to-[#0C0C14] shadow-xl relative group overflow-hidden hover:border-[#22D3EE]/50 transition-all`}
          >
            {/* Decorative quotation watermark */}
            <div className="absolute top-1 right-3 text-5xl font-serif text-white/5 pointer-events-none select-none">
              “
            </div>
            
            {/* Ambient backlight glow */}
            <div className={`absolute -bottom-8 -left-8 w-32 h-32 rounded-full ${authorColor.bgClass}/10 blur-2xl pointer-events-none`} />

            <p className="text-[16px] sm:text-[17px] text-white font-semibold leading-relaxed relative z-10 drop-shadow-sm">
              {vibe.content}
            </p>

            <div className="mt-3.5 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] relative z-10">
              <span className="flex items-center gap-1.5 font-medium text-zinc-300">
                <Sparkles className={`w-3.5 h-3.5 ${authorColor.textClass} animate-spin duration-[6000ms]`} />
                <span>Vibe Pura & Espontânea</span>
              </span>
              <span className="text-[10.5px] text-[#22D3EE] font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                Expandir →
              </span>
            </div>
          </div>
        )}

        {vibe.type === 'photo' && vibe.mediaUrl && (
          <div 
            className="relative my-2.5 rounded-2xl overflow-hidden bg-black/60 group border border-white/10 hover:border-[#22D3EE]/40 transition-colors shadow-lg cursor-pointer"
            onClick={handleMediaDoubleTap}
          >
            <img
              src={vibe.mediaUrl}
              alt="Vibe visual"
              onClick={() => onOpenFullscreen?.(vibe)}
              className="w-full max-h-96 object-cover rounded-2xl cursor-pointer transition-transform duration-300 group-hover:scale-[1.01]"
              loading="lazy"
            />

            {/* Double Tap Heart Burst */}
            {doubleTapHeart && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 animate-in zoom-in-50 duration-200">
                <Heart className="w-20 h-20 text-[#F43F9E] fill-[#F43F9E] drop-shadow-[0_0_20px_#F43F9E]" />
              </div>
            )}

            {/* Live 24h tag */}
            <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-[10px] text-white font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Foto • 24h</span>
            </div>

            {vibe.content && (
              <div className="p-3.5 bg-gradient-to-t from-[#0B0B12] via-[#0B0B12]/80 to-transparent">
                <p className="text-[13.5px] text-zinc-100 font-medium">
                  {vibe.content}
                </p>
              </div>
            )}
          </div>
        )}

        {vibe.type === 'video' && vibe.mediaUrl && (
          <div 
            onClick={() => onOpenFullscreen?.(vibe)}
            className="relative my-2.5 rounded-2xl overflow-hidden bg-black/50 group cursor-pointer border border-white/10 hover:border-[#8B5CF6]/50 transition-colors shadow-lg"
          >
            <img
              src={vibe.mediaUrl}
              alt="Prévia de vídeo"
              className="w-full max-h-96 object-cover rounded-2xl"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/20 transition-colors">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-[0_0_20px_rgba(255,255,255,0.3)] group-hover:scale-110 transition-transform">
                <Play className="w-5 h-5 fill-white ml-0.5" />
              </div>
            </div>
            <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] text-white font-medium">
              Vídeo Curto • 24h
            </span>
            {vibe.content && (
              <div className="p-3.5 bg-gradient-to-t from-[#0B0B12] via-[#0B0B12]/80 to-transparent">
                <p className="text-[13.5px] text-zinc-200 font-medium">
                  {vibe.content}
                </p>
              </div>
            )}
          </div>
        )}

        {vibe.type === 'audio' && (
          <div className="my-2.5 p-4 rounded-2xl bg-gradient-to-br from-[#171726] to-[#0F0F1A] border border-[#2A2A40] relative overflow-hidden shadow-md">
            <div className="flex items-center gap-3">
              {/* Play / Pause button with pulsating glow */}
              <button
                onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-all shadow-lg active:scale-95 ${
                  isPlayingAudio ? 'bg-[#F43F9E] shadow-[0_0_18px_#F43F9E]' : 'bg-[#8B5CF6] shadow-[0_0_15px_#8B5CF6]'
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
                <div className="flex items-end gap-[3px] h-9 w-full py-1">
                  {[40, 65, 80, 45, 90, 70, 30, 85, 95, 60, 45, 75, 85, 35, 90, 65, 50, 80, 40, 60].map((h, i) => {
                    const activeBar = (i / 20) * 100 <= audioProgress;
                    return (
                      <span
                        key={i}
                        className={`flex-1 rounded-full transition-all duration-150 ${
                          activeBar ? 'bg-gradient-to-t from-[#8B5CF6] to-[#22D3EE]' : 'bg-zinc-700'
                        }`}
                        style={{
                          height: `${isPlayingAudio ? Math.max(20, (h * (1 + Math.sin(i + Date.now() / 200))) / 2) : h}%`,
                        }}
                      />
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-[10.5px] text-zinc-400 mt-1">
                  <span className="font-medium text-[#22D3EE]">{isPlayingAudio ? 'A reproduzir...' : 'Toca para ouvir o momento'}</span>
                  <span className="font-mono text-zinc-300">
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
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5 border border-amber-500/30 transition-all cursor-pointer"
            >
              <span>{vibe.sponsoredCta}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Quick Attention Sparks Toolbar (Chamar a atenção dos utilizadores) */}
        <div className="mt-3 py-2 px-2.5 rounded-xl bg-[#0C0C16] border border-[#1E1E2E] flex items-center justify-between">
          <span className="text-[11px] text-zinc-400 font-semibold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#22D3EE] animate-pulse" />
            <span>{isOwn ? 'Testar atenção:' : 'Chamar atenção:'}</span>
          </span>

          <div className="flex items-center gap-1.5">
            {[
              { emoji: '🔥', label: 'Em chamas' },
              { emoji: '⚡', label: 'Energia' },
              { emoji: '💖', label: 'Adorei' },
              { emoji: '🚀', label: 'Voar' },
              { emoji: '👀', label: 'A ver' },
            ].map(({ emoji, label }) => (
              <button
                key={emoji}
                type="button"
                onClick={() => triggerSpark(emoji)}
                className="w-7 h-7 rounded-lg bg-[#141422] hover:bg-[#202035] border border-[#27273C] hover:border-[#22D3EE]/60 flex items-center justify-center text-sm transition-all active:scale-125 cursor-pointer shadow-sm hover:shadow-[0_0_10px_rgba(34,211,238,0.2)]"
                title={`Chamar atenção do autor com ${emoji} (${label})`}
              >
                <span>{emoji}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Attention Reactions Received Display (Aparece para o utilizador que fez a publicação e para quem vê) */}
        {vibe.attentionReactions && vibe.attentionReactions.length > 0 && (
          <div className={`mt-2.5 p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
            isOwn
              ? 'bg-gradient-to-r from-[#8B5CF6]/20 via-[#22D3EE]/15 to-transparent border-[#8B5CF6]/50 shadow-[0_0_15px_rgba(139,92,246,0.15)]'
              : 'bg-[#10101C] border-[#222236]'
          }`}>
            <div className="flex items-center gap-2 min-w-0">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                isOwn ? 'bg-[#8B5CF6]/30 text-[#C4B5FD]' : 'bg-[#181828] text-zinc-400'
              }`}>
                <Bell className={`w-3.5 h-3.5 ${isOwn ? 'text-[#22D3EE] animate-bounce' : 'text-zinc-400'}`} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[11px] font-bold ${isOwn ? 'text-cyan-300' : 'text-zinc-300'}`}>
                    {isOwn ? '🔔 Atenção recebida na tua publicação:' : '⚡ Alguém chamou atenção:'}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-white">
                    {vibe.attentionCount || vibe.attentionReactions.length}
                  </span>
                </div>
                <p className="text-[10.5px] text-zinc-400 truncate">
                  {vibe.attentionReactions.slice(0, 3).map((r) => `${r.reactorName} (${r.emoji})`).join(' • ')}
                </p>
              </div>
            </div>

            {/* Quick emoji badges */}
            <div className="flex items-center gap-1 shrink-0">
              {vibe.attentionReactions.slice(0, 4).map((r, idx) => (
                <span
                  key={r.id || idx}
                  className="w-6 h-6 rounded-md bg-[#18182A] border border-white/10 flex items-center justify-center text-xs shadow-sm hover:scale-110 transition-transform"
                  title={`${r.reactorName} chamou a atenção com ${r.emoji}`}
                >
                  {r.emoji}
                </span>
              ))}
            </div>
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
              <span className="font-semibold">{vibe.likes}</span>
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

          <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-medium">
            <ShieldCheck className="w-3 h-3 text-emerald-400/80" />
            <span>24h Efémero</span>
          </div>
        </div>
      </div>
    </article>
  );
};
