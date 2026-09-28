import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Radio,
  EyeOff,
  Lock,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  Check,
  Copy,
  Shield,
  ShieldAlert,
  User,
  AtSign,
  Smartphone,
  Flame,
  Clock,
  MapPin,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Pause,
  Play,
  CheckCircle2,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Bell,
  Plus,
  Music,
  Film,
  Wifi,
  Battery,
  Home,
  Compass,
  Send,
  Camera,
  Database
} from 'lucide-react';
import { VibeColor, RegisteredAccount } from '../types';
import { VIBE_COLORS } from '../lib/vibeColors';
import {
  registerNewUser,
  verifyLogin,
  isUsernameTaken,
  setSessionActive,
  getRegisteredAccounts,
} from '../lib/authStore';
import {
  syncUserToSupabase,
  getSupabaseConfig,
  recoverUserFromSupabase,
} from '../lib/supabaseClient';
import { SupabaseConfigModal } from './SupabaseConfigModal';

interface IntroAndAuthProps {
  onLoginSuccess: (account: RegisteredAccount) => void;
  initialScreen?: 'intro' | 'login' | 'register';
  onClose?: () => void;
  canClose?: boolean;
}

// Neon Curly Hand-Drawn Doodle Arrow pointing down to the active pagination pill
const DoodleNeonArrow: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    width="52"
    height="82"
    viewBox="0 0 52 82"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`filter drop-shadow-[0_0_12px_rgba(244,63,94,0.6)] ${className}`}
  >
    {/* Looping curve matching the reference picture */}
    <path
      d="M 38 4 C 18 10, 4 32, 22 44 C 36 52, 34 66, 18 74"
      stroke="url(#doodleGradIntro)"
      strokeWidth="2.8"
      strokeLinecap="round"
    />
    {/* Arrowhead */}
    <path
      d="M 12 65 L 18 74 L 27 70"
      stroke="url(#doodleGradIntro)"
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <defs>
      <linearGradient id="doodleGradIntro" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#C084FC" />
        <stop offset="50%" stopColor="#38BDF8" />
        <stop offset="100%" stopColor="#FB7185" />
      </linearGradient>
    </defs>
  </svg>
);

// High-fidelity smartphone status bar
const MobileStatusBar: React.FC<{ time?: string; light?: boolean }> = ({ time = '9:40 PM', light = true }) => (
  <div className="w-full px-6 pt-3 pb-2 flex items-center justify-between z-30 select-none shrink-0">
    <span className={`text-xs font-semibold tracking-tight ${light ? 'text-white/95' : 'text-zinc-300'}`}>
      {time}
    </span>
    <div className={`flex items-center gap-2 ${light ? 'text-white/90' : 'text-zinc-300'}`}>
      {/* Cellular Signal 4 bars */}
      <div className="flex items-end gap-[2px] h-3">
        <span className="w-[3px] h-[3px] bg-current rounded-full" />
        <span className="w-[3px] h-[5px] bg-current rounded-full" />
        <span className="w-[3px] h-[8px] bg-current rounded-full" />
        <span className="w-[3px] h-[11px] bg-current rounded-full" />
      </div>
      {/* Wifi */}
      <Wifi className="w-3.5 h-3.5" />
      {/* Battery */}
      <div className="w-5 h-2.5 rounded-[4px] border border-current p-[1px] flex items-center">
        <div className="w-3 h-full bg-current rounded-[2px]" />
      </div>
    </div>
  </div>
);

export const IntroAndAuth: React.FC<IntroAndAuthProps> = ({
  onLoginSuccess,
  initialScreen = 'intro',
  onClose,
  canClose = false,
}) => {
  const [screen, setScreen] = useState<'intro' | 'login' | 'register' | 'reveal-token'>(initialScreen);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const mouseStartX = useRef<number | null>(null);
  const isMouseDown = useRef(false);
  const lastWheelTime = useRef<number>(0);

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % 3);
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + 3) % 3);
  };

  // Auto-roll through slides smoothly every 5.2 seconds unless paused or dragging
  useEffect(() => {
    if (screen !== 'intro' || !isAutoPlaying || isDragging) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 5200);

    return () => clearInterval(interval);
  }, [screen, isAutoPlaying, isDragging, currentSlide]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    touchStartX.current = e.touches[0].clientX;
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || touchStartX.current === null) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStartX.current;
    if ((currentSlide === 0 && diff > 0) || (currentSlide === 2 && diff < 0)) {
      setDragOffset(diff * 0.35); // Elastic boundary resistance
    } else {
      setDragOffset(diff);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragOffset < -45) {
      goToNextSlide();
    } else if (dragOffset > 45) {
      goToPrevSlide();
    }
    setDragOffset(0);
    touchStartX.current = null;
  };

  // Mouse handlers for desktop drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest('button, a, input, [role="button"]')) return;
    isMouseDown.current = true;
    setIsDragging(true);
    mouseStartX.current = e.clientX;
    setDragOffset(0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown.current || mouseStartX.current === null) return;
    const diff = e.clientX - mouseStartX.current;
    if ((currentSlide === 0 && diff > 0) || (currentSlide === 2 && diff < 0)) {
      setDragOffset(diff * 0.35);
    } else {
      setDragOffset(diff);
    }
  };

  const handleMouseUp = () => {
    if (!isMouseDown.current) return;
    isMouseDown.current = false;
    setIsDragging(false);
    if (dragOffset < -45) {
      goToNextSlide();
    } else if (dragOffset > 45) {
      goToPrevSlide();
    }
    setDragOffset(0);
    mouseStartX.current = null;
  };

  // Wheel horizontal scroll (trackpad or mouse wheel)
  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastWheelTime.current < 550) return;
    if (Math.abs(e.deltaX) > 25 || (e.shiftKey && Math.abs(e.deltaY) > 25)) {
      if (e.deltaX > 25 || (e.shiftKey && e.deltaY > 25)) {
        goToNextSlide();
      } else {
        goToPrevSlide();
      }
      lastWheelTime.current = now;
    }
  };

  // Login Form States
  const [loginUsername, setLoginUsername] = useState('');
  const [loginTokenDigits, setLoginTokenDigits] = useState(['', '', '', '']);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regColor, setRegColor] = useState<VibeColor>('purple');
  const [regError, setRegError] = useState<string | null>(null);
  const [regLoading, setRegLoading] = useState(false);

  // Token Reveal States (Shown strictly ONCE right after registration)
  const [generatedAccount, setGeneratedAccount] = useState<RegisteredAccount | null>(null);
  const [hasCopiedToken, setHasCopiedToken] = useState(false);
  const [acknowledgedStorage, setAcknowledgedStorage] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [supabaseConfig, setSupabaseConfig] = useState(getSupabaseConfig());
  const [supabaseSyncStatus, setSupabaseSyncStatus] = useState<{
    synced: boolean;
    message?: string;
    error?: string;
  } | null>(null);

  // Refs for 4-digit PIN inputs in Login
  const digitInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Intro Slides Data
  const slides = [
    {
      id: 'onboarding',
      badge: 'DESCOBERTA',
      title: 'Discover, Share, Follow Your World',
      subtitle: 'Partilha o presente. Sem perfis eternos.',
      description: 'Publicações e vibes com 24 horas de lifespan e conversas purgadas em 1 minuto.'
    },
    {
      id: 'stories',
      badge: 'FEED & STORIES',
      title: 'Feed & Stories em Tempo Real',
      subtitle: 'Sente o pulsar de quem está à tua volta.',
      description: 'Stories efêmeras, reações ao vivo e radar geográfico dinâmico na tua cidade.'
    },
    {
      id: 'immersive',
      badge: 'ZERO RASTO & 1 MIN TTL',
      title: 'Vibes Imersivas & Autodestruição',
      subtitle: 'Sem prints, sem histórico permanente.',
      description: 'Mensagens no chat são destruídas 1 minuto após saíres da conversa pelo pg_cron.'
    }
  ];

  // Handle Login PIN Input
  const handleDigitChange = (index: number, val: string) => {
    // Only accept numeric digit
    const cleaned = val.replace(/\D/g, '').slice(-1);
    const newDigits = [...loginTokenDigits];
    newDigits[index] = cleaned;
    setLoginTokenDigits(newDigits);
    setLoginError(null);

    // Auto-focus next input if filled
    if (cleaned && index < 3) {
      digitInputRefs[index + 1].current?.focus();
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !loginTokenDigits[index] && index > 0) {
      digitInputRefs[index - 1].current?.focus();
    }
  };

  const handleDigitPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (!pasted) return;
    const newDigits = ['', '', '', ''];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setLoginTokenDigits(newDigits);
    if (pasted.length === 4) {
      digitInputRefs[3].current?.focus();
    } else if (pasted.length > 0) {
      digitInputRefs[Math.min(pasted.length, 3)].current?.focus();
    }
  };

  // Perform Login
  const handlePerformLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const cleanUsername = loginUsername.trim().toLowerCase().replace(/^@/, '');
    const token = loginTokenDigits.join('');

    if (!cleanUsername) {
      setLoginError('Por favor insere o teu nome de utilizador.');
      return;
    }

    if (token.length !== 4) {
      setLoginError('Por favor insere o token de 4 dígitos completo.');
      return;
    }

    setLoginLoading(true);

    setTimeout(async () => {
      const account = verifyLogin(cleanUsername, token);
      if (account) {
        setLoginLoading(false);
        setSessionActive(account);
        onLoginSuccess(account);
        return;
      }

      // Fallback: recover from Supabase if device was lost or storage was cleared
      try {
        const supaAccount = await recoverUserFromSupabase(cleanUsername);
        setLoginLoading(false);
        if (supaAccount && supaAccount.token === token) {
          const accounts = getRegisteredAccounts();
          if (!accounts.some((a) => a.username.toLowerCase() === supaAccount.username.toLowerCase())) {
            accounts.push(supaAccount);
            localStorage.setItem('lyvo_registered_users', JSON.stringify(accounts));
          }
          setSessionActive(supaAccount);
          onLoginSuccess(supaAccount);
          return;
        }
      } catch (err) {
        // ignore
      }

      setLoginLoading(false);
      setLoginError('Nome de utilizador ou token de 4 dígitos incorreto.');
    }, 400);
  };

  // Auto-fill demo account
  const handleFillDemo = () => {
    setLoginUsername('martim_lyvo');
    setLoginTokenDigits(['1', '2', '3', '4']);
    setLoginError(null);
  };

  // Perform Registration
  const handlePerformRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    const cleanName = regName.trim();
    const cleanUsername = regUsername.trim().toLowerCase().replace(/^@/, '');

    if (!cleanName) {
      setRegError('Por favor insere a tua alcunha ou nome.');
      return;
    }

    if (!cleanUsername || cleanUsername.length < 3) {
      setRegError('O nome de utilizador deve ter pelo menos 3 caracteres.');
      return;
    }

    if (!/^[a-z0-9_]+$/.test(cleanUsername)) {
      setRegError('Usa apenas letras minúsculas, números e sublinhados (_).');
      return;
    }

    if (isUsernameTaken(cleanUsername)) {
      setRegError(`O nome de utilizador @${cleanUsername} já está a ser utilizado.`);
      return;
    }

    setRegLoading(true);

    // Generate account and 4-digit token strictly upon registration click!
    setTimeout(async () => {
      try {
        const { account } = registerNewUser({
          name: cleanName,
          username: cleanUsername,
          vibeColor: regColor,
        });

        setRegLoading(false);
        setGeneratedAccount(account);
        // Switch to the critical ONE-TIME token reveal screen!
        setScreen('reveal-token');

        // Attempt Supabase live sync in the background
        syncUserToSupabase(account).then((status) => {
          setSupabaseSyncStatus(status);
        }).catch((err) => {
          setSupabaseSyncStatus({
            synced: false,
            error: err?.message || 'Falha de rede com Supabase',
          });
        });
      } catch (err: any) {
        setRegLoading(false);
        setRegError(err.message || 'Erro ao criar conta.');
      }
    }, 500);
  };

  // Handle Copy Token
  const handleCopyToken = () => {
    if (!generatedAccount) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(generatedAccount.token);
        setHasCopiedToken(true);
        setTimeout(() => setHasCopiedToken(false), 3000);
      }
    } catch (e) {
      // Fallback
    }
  };

  // Enter App from Token Reveal Screen
  const handleEnterAppWithToken = () => {
    if (!generatedAccount) return;
    setSessionActive(generatedAccount);
    onLoginSuccess(generatedAccount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07070D] overflow-y-auto p-4 select-none">
      {/* Dynamic Background Glows */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#8B5CF6]/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-10 right-10 w-72 h-72 bg-[#22D3EE]/10 rounded-full blur-[90px] pointer-events-none" />

      {/* Close button if optional modal mode */}
      {canClose && onClose && (
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-20 px-3.5 py-1.5 rounded-full bg-[#18182A] hover:bg-[#25253C] border border-[#2C2C44] text-xs font-semibold text-zinc-300 transition-colors"
        >
          Voltar à App
        </button>
      )}

      <div className="relative w-full max-w-md my-auto flex flex-col">
        {/* =================================================================== */}
        {/* SCREEN 1: INTRO BANNERS PHONE MOCKUP */}
        {/* =================================================================== */}
        {screen === 'intro' && (
          <div className="w-full flex flex-col items-center">
            {/* Top Device Tabs (Desktop & Tablet Quick Navigation) */}
            <div className="hidden sm:flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#121220]/80 backdrop-blur-md border border-[#23233A] mb-3">
              {[
                { label: '1. Onboarding', sub: 'Descoberta' },
                { label: '2. Feed & Stories', sub: '24 Horas' },
                { label: '3. Vibe & Zero Rasto', sub: '1 min TTL' },
              ].map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    currentSlide === idx
                      ? 'bg-gradient-to-r from-[#F43F9E] to-[#22D3EE] text-white shadow-md shadow-pink-500/20'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#1A1A2C]'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Phone Container with Side Arrow Controls */}
            <div className="relative w-full flex items-center justify-center">
              {/* Left Desktop Arrow Button */}
              <button
                type="button"
                onClick={goToPrevSlide}
                aria-label="Banner anterior"
                className="hidden md:flex absolute -left-14 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#161628]/90 hover:bg-[#23233E] border border-white/20 text-white items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.6)] hover:scale-105 active:scale-95 transition-all z-30 group cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5 text-zinc-300 group-hover:text-white transition-colors" />
              </button>

              {/* Smartphone Chassis - Styled exactly as the high-fashion phone frames in reference image */}
              <motion.div
                key="intro-screen-phone"
                initial={{ opacity: 0, scale: 0.98, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -15 }}
                className="w-full max-w-[390px] h-[670px] sm:h-[700px] rounded-[46px] border-[7px] border-[#1C1C2C] bg-[#0A0A14] shadow-[0_25px_80px_rgba(0,0,0,0.95)] overflow-hidden relative select-none ring-1 ring-white/10"
              >
                {/* Horizontal Rolling Carousel Track */}
                <div
                  className="w-full h-full flex select-none will-change-transform cursor-grab active:cursor-grabbing"
                  style={{
                    transform: `translateX(calc(-${currentSlide * 100}% + ${dragOffset}px))`,
                    transition: isDragging ? 'none' : 'transform 550ms cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onWheel={handleWheel}
                >
                  {/* SLIDE 0: DISCOVER, SHARE, FOLLOW YOUR WORLD (Left Phone) */}
                  <div className="min-w-full w-full h-full shrink-0 relative flex flex-col justify-between overflow-hidden">
                    {/* Full Bleed Background Image */}
                    <div className="absolute inset-0 overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1080&q=85"
                        alt="Discover Your World"
                        className="w-full h-full object-cover object-[center_top] scale-105 pointer-events-none"
                      />
                      {/* Atmospheric Lighting Gradients */}
                      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/25 to-black/95" />
                      <div className="absolute top-0 right-0 w-64 h-64 bg-[#22D3EE]/20 rounded-full blur-[80px] pointer-events-none" />
                      <div className="absolute bottom-1/3 left-0 w-64 h-64 bg-[#F43F9E]/25 rounded-full blur-[90px] pointer-events-none" />
                    </div>

                    {/* Top Status Bar & Skip */}
                    <div className="relative z-20">
                      <MobileStatusBar time="9:40 PM" />
                      <div className="px-6 pt-1 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                          <span className="w-2 h-2 rounded-full bg-[#22D3EE] animate-pulse" />
                          <span className="text-[10px] font-bold text-white tracking-wider font-['Outfit']">LYVO</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setScreen('login')}
                          className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-xs font-semibold text-white/90 hover:text-white border border-white/15 transition-all hover:bg-black/60 cursor-pointer"
                        >
                          Skip
                        </button>
                      </div>
                    </div>

                    {/* Content Area with Display Headline & Curly Neon Arrow */}
                    <div className="relative z-20 px-6 pt-4 pb-2 flex-1 flex flex-col justify-between">
                      <div>
                        <h1 className="text-[34px] font-black text-white font-['Outfit'] leading-[1.08] tracking-tight drop-shadow-md">
                          Discover,<br />
                          Share, Follow<br />
                          Your World
                        </h1>
                        <p className="text-xs text-white/80 font-medium mt-2 max-w-[240px] drop-shadow">
                          Vibes e histórias com 24h de lifespan. Mensagens no chat destruídas em 1 minuto.
                        </p>
                      </div>

                      {/* Curly Doodle Neon Arrow pointing straight to pagination */}
                      <div className="flex items-center ml-8 -mb-2">
                        <DoodleNeonArrow />
                      </div>
                    </div>

                    {/* Bottom Navigation & CTA */}
                    <div className="relative z-20 px-6 pb-4 space-y-3 bg-gradient-to-t from-black via-black/80 to-transparent pt-4">
                      {/* Pagination Pills */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setCurrentSlide(0)}
                          className={`h-2 transition-all duration-300 rounded-full ${
                            currentSlide === 0
                              ? 'w-9 bg-gradient-to-r from-[#FF5E62] via-[#F43F9E] to-[#22D3EE] shadow-[0_0_12px_rgba(244,63,94,0.6)]'
                              : 'w-2 bg-white/40 hover:bg-white/80'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setCurrentSlide(1)}
                          className={`h-2 transition-all duration-300 rounded-full ${
                            currentSlide === 1
                              ? 'w-9 bg-gradient-to-r from-[#FF5E62] via-[#F43F9E] to-[#22D3EE] shadow-[0_0_12px_rgba(244,63,94,0.6)]'
                              : 'w-2 bg-white/40 hover:bg-white/80'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setCurrentSlide(2)}
                          className={`h-2 transition-all duration-300 rounded-full ${
                            currentSlide === 2
                              ? 'w-9 bg-gradient-to-r from-[#FF5E62] via-[#F43F9E] to-[#22D3EE] shadow-[0_0_12px_rgba(244,63,94,0.6)]'
                              : 'w-2 bg-white/40 hover:bg-white/80'
                          }`}
                        />
                      </div>

                      {/* Get Started Button */}
                      <button
                        type="button"
                        onClick={goToNextSlide}
                        className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#FF5E62] via-[#F43F9E] to-[#8B5CF6] text-white font-bold text-sm tracking-wide shadow-[0_10px_30px_rgba(244,63,94,0.45)] hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Get Started</span>
                        <span className="text-base leading-none">↗</span>
                      </button>

                      {/* Secondary Link to Login */}
                      <button
                        type="button"
                        onClick={() => setScreen('login')}
                        className="w-full text-center text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
                      >
                        Já tens token de 4 dígitos? <strong className="text-white underline underline-offset-4">Entrar</strong>
                      </button>

                      {/* Home Indicator */}
                      <div className="w-28 h-1 bg-white/40 rounded-full mx-auto mt-2" />
                    </div>
                  </div>

                  {/* SLIDE 1: STORIES & FEED CARD (Middle Phone) */}
                  <div className="min-w-full w-full h-full shrink-0 relative flex flex-col justify-between overflow-hidden bg-[#0A0A14]">
                    {/* Subtle Background Glow */}
                    <div className="absolute top-10 -left-10 w-60 h-60 bg-[#F43F9E]/15 rounded-full blur-[80px] pointer-events-none" />
                    <div className="absolute bottom-20 -right-10 w-60 h-60 bg-[#8B5CF6]/15 rounded-full blur-[80px] pointer-events-none" />

                    {/* Top Bar: Status + Profile Greeting */}
                    <div className="relative z-20">
                      <MobileStatusBar time="9:40 PM" />
                      <div className="px-5 pt-1 pb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="relative">
                            <img
                              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                              alt="Maya Quinn"
                              className="w-9 h-9 rounded-full object-cover border border-white/20"
                            />
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0A0A14]" />
                          </div>
                          <div>
                            <p className="text-[11px] text-zinc-400 font-medium">Hey 👋</p>
                            <h3 className="text-xs font-bold text-white">Maya Quinn</h3>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="w-8 h-8 rounded-full bg-[#1A1A2C] border border-[#2B2B42] flex items-center justify-center text-zinc-300 hover:text-white relative cursor-pointer"
                          >
                            <Bell className="w-4 h-4" />
                            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#F43F9E]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setScreen('login')}
                            className="w-8 h-8 rounded-full bg-[#1A1A2C] border border-[#2B2B42] flex items-center justify-center text-zinc-300 hover:text-white cursor-pointer"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Stories Reel */}
                    <div className="relative z-20 px-4 py-1">
                      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
                        {/* Add Story */}
                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <div className="w-12 h-12 rounded-full border-2 border-dashed border-[#22D3EE] p-0.5 flex items-center justify-center bg-[#141424]">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#22D3EE]/20 to-[#8B5CF6]/20 flex items-center justify-center text-[#22D3EE]">
                              <Plus className="w-4 h-4" />
                            </div>
                          </div>
                          <span className="text-[10px] text-zinc-400 font-medium">Add Story</span>
                        </div>

                        {/* Story 1 */}
                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-[#FF5E62] via-[#F43F9E] to-[#8B5CF6]">
                            <img
                              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80"
                              alt="Julien"
                              className="w-full h-full rounded-full object-cover border-2 border-[#0A0A14]"
                            />
                          </div>
                          <span className="text-[10px] text-zinc-300 font-medium">Julien</span>
                        </div>

                        {/* Story 2 */}
                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-[#22D3EE] to-[#8B5CF6]">
                            <img
                              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80"
                              alt="Samera"
                              className="w-full h-full rounded-full object-cover border-2 border-[#0A0A14]"
                            />
                          </div>
                          <span className="text-[10px] text-zinc-300 font-medium">Samera</span>
                        </div>

                        {/* Story 3 */}
                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-[#F43F9E] to-[#F59E0B]">
                            <img
                              src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80"
                              alt="Mariane"
                              className="w-full h-full rounded-full object-cover border-2 border-[#0A0A14]"
                            />
                          </div>
                          <span className="text-[10px] text-zinc-300 font-medium">Mariane</span>
                        </div>

                        {/* Story 4 */}
                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-[#8B5CF6] to-[#22D3EE]">
                            <img
                              src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=120&q=80"
                              alt="Elmania"
                              className="w-full h-full rounded-full object-cover border-2 border-[#0A0A14]"
                            />
                          </div>
                          <span className="text-[10px] text-zinc-300 font-medium">Elmania</span>
                        </div>
                      </div>
                    </div>

                    {/* Central Glassmorphic Card (Gabriella Collins) */}
                    <div className="relative z-20 px-4 py-1 flex-1 flex flex-col justify-center">
                      <div className="relative rounded-3xl overflow-hidden border border-white/20 bg-gradient-to-b from-white/10 to-black/50 backdrop-blur-xl p-2.5 shadow-2xl">
                        {/* Media Image */}
                        <div className="relative h-52 sm:h-56 rounded-2xl overflow-hidden">
                          <img
                            src="https://images.unsplash.com/photo-1516726817505-f5ed825624d8?auto=format&fit=crop&w=1080&q=85"
                            alt="Gabriella Collins"
                            className="w-full h-full object-cover object-center pointer-events-none"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                          {/* Floating Vertical Interaction Dock on Right */}
                          <div className="absolute top-4 right-2.5 flex flex-col items-center gap-2.5 p-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/15">
                            <button type="button" className="flex flex-col items-center text-white hover:text-[#F43F9E] transition-colors cursor-pointer">
                              <Heart className="w-4 h-4 fill-white/20" />
                              <span className="text-[9px] font-semibold mt-0.5">1.25k</span>
                            </button>
                            <button type="button" className="flex flex-col items-center text-white hover:text-[#22D3EE] transition-colors cursor-pointer">
                              <MessageCircle className="w-4 h-4" />
                              <span className="text-[9px] font-semibold mt-0.5">1.25k</span>
                            </button>
                            <button type="button" className="flex flex-col items-center text-white hover:text-amber-300 transition-colors cursor-pointer">
                              <Bookmark className="w-4 h-4" />
                            </button>
                            <button type="button" className="flex flex-col items-center text-white hover:text-emerald-300 transition-colors cursor-pointer">
                              <Share2 className="w-4 h-4" />
                              <span className="text-[9px] font-semibold mt-0.5">100</span>
                            </button>
                          </div>
                        </div>

                        {/* Author & Quote Footer */}
                        <div className="p-2 pt-2.5">
                          <div className="flex items-center gap-2">
                            <img
                              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                              alt="Gabriella"
                              className="w-5 h-5 rounded-full object-cover border border-white/20"
                            />
                            <span className="text-xs font-bold text-white">Gabriella Collins</span>
                            <span className="text-[10px] text-zinc-400">• 1h ago</span>
                          </div>
                          <p className="text-[11px] text-zinc-300 italic mt-1 leading-snug">
                            "Life reflects what we show; a smile brings the brightest results."
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Floating Frosted Bottom Dock & Controls */}
                    <div className="relative z-20 px-5 pb-3 space-y-2">
                      {/* Floating Bottom Nav Dock */}
                      <div className="flex items-center justify-around py-2 px-4 rounded-2xl bg-[#161628]/80 backdrop-blur-md border border-white/10 shadow-lg">
                        <div className="p-1.5 rounded-full bg-gradient-to-r from-[#F43F9E] to-[#8B5CF6] text-white shadow-md shadow-pink-500/25">
                          <Home className="w-4 h-4" />
                        </div>
                        <Camera className="w-4 h-4 text-zinc-400 hover:text-white cursor-pointer" />
                        <MessageCircle className="w-4 h-4 text-zinc-400 hover:text-white cursor-pointer" />
                        <User className="w-4 h-4 text-zinc-400 hover:text-white cursor-pointer" />
                      </div>

                      {/* Pagination Indicator */}
                      <div className="flex items-center justify-center gap-2 pt-0.5">
                        <button
                          type="button"
                          onClick={() => setCurrentSlide(0)}
                          className={`h-2 transition-all duration-300 rounded-full ${
                            currentSlide === 0
                              ? 'w-9 bg-gradient-to-r from-[#FF5E62] via-[#F43F9E] to-[#22D3EE] shadow-[0_0_12px_rgba(244,63,94,0.6)]'
                              : 'w-2 bg-white/40 hover:bg-white/80'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setCurrentSlide(1)}
                          className={`h-2 transition-all duration-300 rounded-full ${
                            currentSlide === 1
                              ? 'w-9 bg-gradient-to-r from-[#FF5E62] via-[#F43F9E] to-[#22D3EE] shadow-[0_0_12px_rgba(244,63,94,0.6)]'
                              : 'w-2 bg-white/40 hover:bg-white/80'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setCurrentSlide(2)}
                          className={`h-2 transition-all duration-300 rounded-full ${
                            currentSlide === 2
                              ? 'w-9 bg-gradient-to-r from-[#FF5E62] via-[#F43F9E] to-[#22D3EE] shadow-[0_0_12px_rgba(244,63,94,0.6)]'
                              : 'w-2 bg-white/40 hover:bg-white/80'
                          }`}
                        />
                      </div>

                      {/* Get Started / Next */}
                      <button
                        type="button"
                        onClick={goToNextSlide}
                        className="w-full py-3 px-6 rounded-full bg-gradient-to-r from-[#FF5E62] via-[#F43F9E] to-[#8B5CF6] text-white font-bold text-xs tracking-wide shadow-[0_8px_25px_rgba(244,63,94,0.35)] hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Get Started</span>
                        <span className="text-sm">↗</span>
                      </button>

                      {/* Secondary Link to Login */}
                      <button
                        type="button"
                        onClick={() => setScreen('login')}
                        className="w-full text-center text-[11px] font-semibold text-zinc-400 hover:text-white transition-colors"
                      >
                        Já tens token de 4 dígitos? <strong className="text-white underline underline-offset-4">Entrar</strong>
                      </button>

                      {/* Home Indicator */}
                      <div className="w-28 h-1 bg-white/40 rounded-full mx-auto" />
                    </div>
                  </div>

                  {/* SLIDE 2: IMMERSIVE FULLSCREEN VIBE & ZERO RETENTION (Right Phone) */}
                  <div className="min-w-full w-full h-full shrink-0 relative flex flex-col justify-between overflow-hidden">
                    {/* Fullscreen Media Artwork */}
                    <div className="absolute inset-0 overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1080&q=85"
                        alt="Victoria Hamilton"
                        className="w-full h-full object-cover object-center pointer-events-none"
                      />
                      {/* Neon Lighting Vignette */}
                      <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-transparent to-black/95" />
                      <div className="absolute top-1/4 right-0 w-48 h-48 bg-[#8B5CF6]/30 rounded-full blur-[70px] pointer-events-none" />
                      <div className="absolute bottom-1/4 left-0 w-48 h-48 bg-[#F43F9E]/30 rounded-full blur-[70px] pointer-events-none" />
                    </div>

                    {/* Top Bar: Status + Segmented Tabs */}
                    <div className="relative z-20">
                      <MobileStatusBar time="9:40 PM" />
                      <div className="px-5 pt-1 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setCurrentSlide(1)}
                          className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/60 transition-colors cursor-pointer"
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-1 p-1 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-xs font-semibold">
                          <span className="px-3 py-1 rounded-full text-zinc-400 hover:text-white cursor-pointer transition-colors">
                            Following
                          </span>
                          <span className="px-3 py-1 rounded-full bg-white/20 text-white shadow-sm font-bold">
                            For You
                          </span>
                        </div>

                        <div className="w-8" />
                      </div>
                    </div>

                    {/* Floating Vertical Interaction Dock on the Right */}
                    <div className="relative z-20 px-4 flex justify-end">
                      <div className="flex flex-col items-center gap-3 p-2 rounded-full bg-black/45 backdrop-blur-md border border-white/20 shadow-xl">
                        <button type="button" className="flex flex-col items-center text-white hover:text-[#F43F9E] transition-colors cursor-pointer">
                          <Heart className="w-4 h-4 fill-white/20" />
                          <span className="text-[9px] font-semibold mt-0.5">1.25k</span>
                        </button>
                        <button type="button" className="flex flex-col items-center text-white hover:text-[#22D3EE] transition-colors cursor-pointer">
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-[9px] font-semibold mt-0.5">1.25k</span>
                        </button>
                        <button type="button" className="flex flex-col items-center text-white hover:text-amber-300 transition-colors cursor-pointer">
                          <Bookmark className="w-4 h-4" />
                        </button>
                        <button type="button" className="flex flex-col items-center text-white hover:text-emerald-300 transition-colors cursor-pointer">
                          <Share2 className="w-4 h-4" />
                          <span className="text-[9px] font-semibold mt-0.5">100</span>
                        </button>
                      </div>
                    </div>

                    {/* Bottom Author Card & CTA */}
                    <div className="relative z-20 px-5 pb-4 space-y-2.5 bg-gradient-to-t from-black via-black/85 to-transparent pt-4">
                      {/* Glass Author Capsule */}
                      <div className="p-2.5 rounded-2xl bg-black/50 backdrop-blur-xl border border-white/20 shadow-xl space-y-1.5">
                        <div className="flex items-center gap-2">
                          <img
                            src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80"
                            alt="Victoria"
                            className="w-6 h-6 rounded-full object-cover border border-white/30"
                          />
                          <div>
                            <h4 className="text-xs font-bold text-white">Victoria Hamilton</h4>
                            <p className="text-[10px] text-zinc-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#22D3EE]" /> Lisboa, Chiado
                            </p>
                          </div>
                        </div>

                        <p className="text-[11px] text-zinc-300 leading-snug">
                          Partilhando música, cinema e momentos únicos que vivem só hoje.
                        </p>

                        {/* Tag Chips */}
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-[10px] text-zinc-200 flex items-center gap-1">
                            <Music className="w-3 h-3 text-[#22D3EE]" /> Music
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-[10px] text-zinc-200 flex items-center gap-1">
                            <Film className="w-3 h-3 text-[#F43F9E]" /> Cinema
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-[10px] text-zinc-200 flex items-center gap-1">
                            <Flame className="w-3 h-3 text-amber-400" /> Sport
                          </span>
                        </div>

                        {/* Zero Rasto Notice */}
                        <div className="p-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-1.5 text-[10px] text-emerald-300 font-medium">
                          <Clock className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>Chat com autodestruição em 1 min após saíres</span>
                        </div>
                      </div>

                      {/* Pagination Indicator */}
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setCurrentSlide(0)}
                          className={`h-2 transition-all duration-300 rounded-full ${
                            currentSlide === 0
                              ? 'w-9 bg-gradient-to-r from-[#FF5E62] via-[#F43F9E] to-[#22D3EE] shadow-[0_0_12px_rgba(244,63,94,0.6)]'
                              : 'w-2 bg-white/40 hover:bg-white/80'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setCurrentSlide(1)}
                          className={`h-2 transition-all duration-300 rounded-full ${
                            currentSlide === 1
                              ? 'w-9 bg-gradient-to-r from-[#FF5E62] via-[#F43F9E] to-[#22D3EE] shadow-[0_0_12px_rgba(244,63,94,0.6)]'
                              : 'w-2 bg-white/40 hover:bg-white/80'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setCurrentSlide(2)}
                          className={`h-2 transition-all duration-300 rounded-full ${
                            currentSlide === 2
                              ? 'w-9 bg-gradient-to-r from-[#FF5E62] via-[#F43F9E] to-[#22D3EE] shadow-[0_0_12px_rgba(244,63,94,0.6)]'
                              : 'w-2 bg-white/40 hover:bg-white/80'
                          }`}
                        />
                      </div>

                      {/* Action Button -> Open Register / Token Generation */}
                      <button
                        type="button"
                        onClick={() => setScreen('register')}
                        className="w-full py-3 px-6 rounded-full bg-gradient-to-r from-[#FF5E62] via-[#F43F9E] to-[#8B5CF6] text-white font-bold text-xs tracking-wide shadow-[0_10px_30px_rgba(244,63,94,0.45)] hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Get Started & Gerar Token</span>
                        <span className="text-sm leading-none">↗</span>
                      </button>

                      {/* Secondary Link to Login */}
                      <button
                        type="button"
                        onClick={() => setScreen('login')}
                        className="w-full text-center text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
                      >
                        Já tens token de 4 dígitos? <strong className="text-white underline underline-offset-4">Entrar</strong>
                      </button>

                      {/* Home Indicator */}
                      <div className="w-28 h-1 bg-white/40 rounded-full mx-auto" />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right Desktop Arrow Button */}
              <button
                type="button"
                onClick={goToNextSlide}
                aria-label="Próximo banner"
                className="hidden md:flex absolute -right-14 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#161628]/90 hover:bg-[#23233E] border border-white/20 text-white items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.6)] hover:scale-105 active:scale-95 transition-all z-30 group cursor-pointer"
              >
                <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-white transition-colors" />
              </button>
            </div>

            {/* Interactive Carousel Bar (Auto-roll pause/play, swipe gesture cue, slide counter) */}
            <div className="mt-3.5 flex items-center justify-between w-full max-w-[390px] px-3.5 py-1.5 rounded-full bg-[#121220]/80 backdrop-blur-md border border-[#23233A] text-xs text-zinc-400">
              <button
                type="button"
                onClick={() => setIsAutoPlaying((prev) => !prev)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1A1A2E] hover:bg-[#252542] text-zinc-300 hover:text-white transition-colors text-[11px] font-medium cursor-pointer"
                title={isAutoPlaying ? 'Pausar rolar automático' : 'Iniciar rolar automático'}
              >
                {isAutoPlaying ? (
                  <>
                    <Pause className="w-3 h-3 text-[#22D3EE]" />
                    <span>Rolar Ativo</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 text-zinc-400" />
                    <span>Pausado</span>
                  </>
                )}
              </button>

              <span className="text-[11px] text-zinc-400 font-medium hidden xs:inline">
                ⇄ Desliza ou arrasta para rolar
              </span>

              <div className="flex items-center gap-1 font-mono text-[11px] font-bold text-zinc-300 bg-[#1A1A2E] px-2.5 py-0.5 rounded-full border border-white/5">
                <span className="text-white">{currentSlide + 1}</span>
                <span className="text-zinc-500">/</span>
                <span>3</span>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* SCREEN 2: LOGIN WITH USERNAME + 4-DIGIT TOKEN */}
        {/* =================================================================== */}
        {screen === 'login' && (
          <motion.div
            key="login-screen"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="w-full bg-[#0D0D16] border border-[#232336] rounded-3xl p-6 shadow-[0_15px_60px_rgba(0,0,0,0.85)] flex flex-col space-y-5"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setScreen('intro')}
                className="p-2 rounded-xl bg-[#161626] border border-[#28283E] text-zinc-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="text-center">
                <h2 className="text-lg font-black text-white font-['Outfit'] tracking-wide">
                  Entrar no LYVO
                </h2>
                <p className="text-[11px] text-zinc-400">Live the moment.</p>
              </div>
              <div className="w-8" />
            </div>

            {/* Error banner if any */}
            {loginError && (
              <div className="p-3 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center gap-2.5 text-red-300 text-xs animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handlePerformLogin} className="space-y-4">
              {/* Username Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                  <span>Nome de Utilizador</span>
                  <span className="text-[10px] text-zinc-500">Único no LYVO</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 flex items-center">
                    <AtSign className="w-4 h-4 text-[#22D3EE]" />
                  </div>
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => {
                      setLoginUsername(e.target.value.toLowerCase().trim());
                      setLoginError(null);
                    }}
                    placeholder="martim_lyvo"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#131320] border border-[#25253A] focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE] text-white text-sm placeholder:text-zinc-600 outline-none transition-all"
                    autoCapitalize="none"
                    autoCorrect="off"
                  />
                </div>
              </div>

              {/* 4-Digit Token Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#8B5CF6]" />
                    <span>Token de 4 Dígitos</span>
                  </label>
                  <span className="text-[10.5px] text-zinc-400 font-mono">Chave Única</span>
                </div>

                {/* 4 PIN Boxes */}
                <div className="grid grid-cols-4 gap-3">
                  {loginTokenDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={digitInputRefs[index]}
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(index, e.target.value)}
                      onKeyDown={(e) => handleDigitKeyDown(index, e)}
                      onPaste={index === 0 ? handleDigitPaste : undefined}
                      className={`w-full h-14 text-center text-xl font-mono font-black rounded-2xl bg-[#131320] border transition-all outline-none text-white ${
                        digit
                          ? 'border-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.3)] bg-[#17172A]'
                          : 'border-[#26263C] focus:border-[#22D3EE]'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] text-white font-bold text-sm shadow-[0_0_25px_rgba(139,92,246,0.3)] hover:opacity-95 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
              >
                {loginLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    A autenticar...
                  </span>
                ) : (
                  <>
                    <span>Entrar no LYVO</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Demo Quick Fill Helper */}
            <div className="p-3 rounded-2xl bg-[#131322] border border-[#232338] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-zinc-300 block">Conta de Demonstração</span>
                <span className="text-[10px] text-zinc-500 font-mono">@martim_lyvo • Token: 1234</span>
              </div>
              <button
                type="button"
                onClick={handleFillDemo}
                className="px-2.5 py-1.5 rounded-xl bg-[#1D1D30] hover:bg-[#282842] border border-[#30304C] text-[11px] font-bold text-[#22D3EE] transition-colors active:scale-95"
              >
                Preencher
              </button>
            </div>

            {/* Links */}
            <div className="text-center space-y-2 pt-1 border-t border-[#1C1C2C]">
              <button
                type="button"
                onClick={() => setScreen('register')}
                className="text-xs text-zinc-400 hover:text-white transition-colors block w-full py-1"
              >
                Ainda não tens conta? <strong className="text-[#22D3EE]">Fazer Registo e Obter Token</strong>
              </button>
              <button
                type="button"
                onClick={() => setScreen('intro')}
                className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors block w-full"
              >
                Ver Banners de Introdução
              </button>
            </div>
          </motion.div>
        )}

        {/* =================================================================== */}
        {/* SCREEN 3: REGISTRATION (NAME/NICKNAME + UNIQUE USERNAME) */}
        {/* =================================================================== */}
        {screen === 'register' && (
          <motion.div
            key="register-screen"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="w-full bg-[#0D0D16] border border-[#232336] rounded-3xl p-6 shadow-[0_15px_60px_rgba(0,0,0,0.85)] flex flex-col space-y-5"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setScreen('login')}
                className="p-2 rounded-xl bg-[#161626] border border-[#28283E] text-zinc-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="text-center">
                <h2 className="text-lg font-black text-white font-['Outfit'] tracking-wide">
                  Registo no LYVO
                </h2>
                <p className="text-[11px] text-zinc-400">Gera a tua identidade e token de 4 dígitos</p>
              </div>
              <div className="w-8" />
            </div>

            {/* Supabase Destination Status Badge */}
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#121222] border border-[#232338]">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${supabaseConfig.isConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <div className="text-[11px] leading-tight">
                  <span className="text-zinc-400 block text-[10px]">Destino do Registo:</span>
                  <strong className={supabaseConfig.isConfigured ? 'text-emerald-400' : 'text-zinc-200'}>
                    {supabaseConfig.isConfigured ? 'Base de Dados Supabase (Live)' : 'Armazenamento Local no Browser'}
                  </strong>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSupabaseModalOpen(true)}
                className="px-2.5 py-1 rounded-xl bg-[#1C1C30] hover:bg-[#262642] text-[10.5px] font-bold text-[#22D3EE] border border-[#2E2E4E] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Database className="w-3 h-3" />
                <span>{supabaseConfig.isConfigured ? 'Gerir' : 'Conectar Supabase'}</span>
              </button>
            </div>

            {/* Error banner if any */}
            {regError && (
              <div className="p-3 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center gap-2.5 text-red-300 text-xs animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handlePerformRegister} className="space-y-4">
              {/* Field 1: Name / Nickname */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                  <span>Nome ou Alcunha</span>
                  <span className="text-[10px] text-zinc-500">Como te vão chamar</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 flex items-center">
                    <User className="w-4 h-4 text-[#F43F9E]" />
                  </div>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => {
                      setRegName(e.target.value);
                      setRegError(null);
                    }}
                    placeholder="Ex: Beatriz, Kiko, Diogo"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#131320] border border-[#25253A] focus:border-[#F43F9E] focus:ring-1 focus:ring-[#F43F9E] text-white text-sm placeholder:text-zinc-600 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Field 2: Unique Username */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                  <span>Nome de Utilizador Único</span>
                  <span className="text-[10px] text-zinc-500">Sem espaços (@username)</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 flex items-center">
                    <AtSign className="w-4 h-4 text-[#22D3EE]" />
                  </div>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => {
                      const sanitized = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                      setRegUsername(sanitized);
                      setRegError(null);
                    }}
                    placeholder="ex: beatriz_lx"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#131320] border border-[#25253A] focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE] text-white text-sm placeholder:text-zinc-600 outline-none transition-all"
                    autoCapitalize="none"
                    autoCorrect="off"
                  />
                </div>
              </div>

              {/* Field 3: Vibe Color Choice */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  Cor da Tua Vibe
                </label>
                <div className="flex items-center justify-between gap-2 p-2 rounded-2xl bg-[#131320] border border-[#25253A]">
                  {(['purple', 'cyan', 'pink', 'emerald', 'amber', 'rose'] as VibeColor[]).map((c) => {
                    const cfg = VIBE_COLORS[c];
                    const isSelected = regColor === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setRegColor(c)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${cfg.bgClass} ${
                          isSelected
                            ? 'ring-2 ring-white scale-110 shadow-lg'
                            : 'opacity-60 hover:opacity-100'
                        }`}
                      >
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notice before registration */}
              <div className="p-3 rounded-2xl bg-[#141424] border border-[#26263C] text-[11px] text-zinc-400 leading-relaxed flex items-start gap-2.5">
                <KeyRound className="w-4 h-4 text-[#22D3EE] shrink-0 mt-0.5" />
                <span>
                  Ao clicares em <strong>Fazer Registo</strong>, o teu <strong>token de 4 dígitos</strong> será gerado e exibido <strong>apenas UMA vez</strong>. Não há passwords.
                </span>
              </div>

              {/* Primary Action Button: "Fazer Registo" */}
              <button
                type="submit"
                disabled={regLoading}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#F43F9E] via-[#8B5CF6] to-[#22D3EE] text-white font-bold text-sm shadow-[0_0_30px_rgba(244,63,94,0.35)] hover:opacity-95 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
              >
                {regLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    A criar conta e gerar token...
                  </span>
                ) : (
                  <>
                    <span>Fazer Registo & Gerar Token</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Back to Login Link */}
            <div className="text-center pt-2 border-t border-[#1C1C2C]">
              <button
                type="button"
                onClick={() => setScreen('login')}
                className="text-xs text-zinc-400 hover:text-white transition-colors"
              >
                Já tens uma conta? <strong className="text-[#8B5CF6]">Fazer Login com Token</strong>
              </button>
            </div>
          </motion.div>
        )}

        {/* =================================================================== */}
        {/* SCREEN 4: TOKEN REVEAL SCREEN (SHOWN STRICTLY ONCE UPON REGISTRATION) */}
        {/* =================================================================== */}
        {screen === 'reveal-token' && generatedAccount && (
          <motion.div
            key="reveal-screen"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full bg-[#0D0D16] border-2 border-[#EF4444]/60 rounded-3xl p-6 shadow-[0_0_60px_rgba(239,68,68,0.25)] flex flex-col space-y-5"
          >
            {/* Top Critical Alert Badge */}
            <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-300">
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 animate-pulse" />
              <div className="text-[11px] leading-tight">
                <span className="font-bold text-white block uppercase tracking-wider">Atenção Crítica: Exibição Única</span>
                <span>Este token NUNCA mais será mostrado nem recuperado.</span>
              </div>
            </div>

            {/* Title */}
            <div className="text-center space-y-1">
              <h2 className="text-xl font-black text-white font-['Outfit'] tracking-tight">
                O Teu Token de 4 Dígitos
              </h2>
              <p className="text-xs text-zinc-400">
                Registo concluído para <strong className="text-white">@{generatedAccount.username}</strong>
              </p>
            </div>

            {/* 4 DIGIT NEON DISPLAY */}
            <div className="py-2">
              <div className="flex items-center justify-center gap-3">
                {generatedAccount.token.split('').map((digit: string, i: number) => (
                  <div
                    key={i}
                    className="w-14 h-20 rounded-2xl bg-gradient-to-b from-[#18182A] to-[#0F0F1B] border-2 border-[#22D3EE] flex items-center justify-center text-3xl font-mono font-black text-white shadow-[0_0_25px_rgba(34,211,238,0.35)]"
                  >
                    {digit}
                  </div>
                ))}
              </div>

              {/* Copy Token Button */}
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={handleCopyToken}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95 ${
                    hasCopiedToken
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                      : 'bg-[#18182E] hover:bg-[#232340] border border-[#2D2D48] text-[#22D3EE]'
                  }`}
                >
                  {hasCopiedToken ? (
                    <>
                      <Check className="w-4 h-4" />
                      Token Copiado para a Área de Transferência!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copiar Token ({generatedAccount.token})
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Account Info Recap */}
            <div className="p-3 rounded-2xl bg-[#131320] border border-[#232336] space-y-1.5 text-xs text-zinc-300">
              <div className="flex justify-between">
                <span className="text-zinc-500">Alcunha:</span>
                <span className="font-semibold text-white">{generatedAccount.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Utilizador:</span>
                <span className="font-mono font-bold text-[#22D3EE]">@{generatedAccount.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Token Gerado:</span>
                <span className="font-mono font-black text-red-400">{generatedAccount.token}</span>
              </div>
            </div>

            {/* Supabase Sync Status & Action Box */}
            {supabaseSyncStatus?.synced ? (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-1">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Sincronizado no Supabase (tabela public.users)!</span>
                </div>
                <p className="text-[10.5px] text-emerald-200/80">
                  O teu utilizador @{generatedAccount.username} e token de 4 dígitos foram gravados com sucesso na tua base de dados PostgreSQL.
                </p>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-[#141220] border border-[#2D2240] space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      Guardado no navegador local
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9.5px]">Modo Local</span>
                    </h4>
                    <p className="text-[11px] text-zinc-300 mt-0.5 leading-snug">
                      Como estás no ambiente do Google AI Studio, o teu Supabase ainda não está conectado. Podes conectar agora para transferir este novo utilizador e token:
                    </p>
                  </div>
                </div>

                {supabaseSyncStatus?.error && (
                  <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-[10.5px] text-red-300">
                    <strong>Aviso do Supabase:</strong> {supabaseSyncStatus.error}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setIsSupabaseModalOpen(true)}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#22D3EE]/20 via-[#8B5CF6]/20 to-[#F43F9E]/20 hover:from-[#22D3EE]/30 hover:to-[#F43F9E]/30 border border-[#8B5CF6]/50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-98 shadow-sm cursor-pointer"
                >
                  <Database className="w-4 h-4 text-[#22D3EE]" />
                  <span>Conectar Supabase & Sincronizar Agora</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#F43F9E]" />
                </button>
              </div>
            )}

            {/* Mandatory Checkbox to make sure they won't lose it */}
            <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#171424] border border-[#382648] cursor-pointer">
              <input
                type="checkbox"
                checked={acknowledgedStorage}
                onChange={(e) => setAcknowledgedStorage(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-zinc-700 text-[#8B5CF6] focus:ring-[#8B5CF6]"
              />
              <span className="text-[11px] text-zinc-300 leading-snug">
                Confirmo que <strong>copiei ou anotei o meu token de 4 dígitos</strong> num local seguro e entendo que ele não voltará a aparecer.
              </span>
            </label>

            {/* Final Enter Button */}
            <button
              type="button"
              disabled={!acknowledgedStorage}
              onClick={handleEnterAppWithToken}
              className={`w-full py-3.5 px-4 rounded-2xl text-white font-bold text-sm shadow-[0_0_30px_rgba(34,211,238,0.35)] transition-all flex items-center justify-center gap-2 active:scale-98 ${
                acknowledgedStorage
                  ? 'bg-gradient-to-r from-[#22D3EE] via-[#8B5CF6] to-[#F43F9E] hover:opacity-95 cursor-pointer'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Compreendi e Guardei — Entrar no LYVO</span>
            </button>
          </motion.div>
        )}

        {/* Supabase Configuration Modal */}
        {isSupabaseModalOpen && (
          <SupabaseConfigModal
            onClose={() => setIsSupabaseModalOpen(false)}
            onConfigUpdated={() => {
              const cfg = getSupabaseConfig();
              setSupabaseConfig(cfg);
              if (generatedAccount) {
                syncUserToSupabase(generatedAccount)
                  .then((status) => setSupabaseSyncStatus(status))
                  .catch((err) => setSupabaseSyncStatus({ synced: false, error: err?.message }));
              }
            }}
          />
        )}
      </div>
    </div>
  );
};
