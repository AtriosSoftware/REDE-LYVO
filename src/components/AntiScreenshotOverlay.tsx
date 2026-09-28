import React, { useEffect, useState, useCallback } from 'react';
import { Shield, ShieldAlert, EyeOff, Lock, Smartphone, HelpCircle } from 'lucide-react';

interface AntiScreenshotOverlayProps {
  enabled: boolean;
  blurProtection: boolean;
  onOpenInfoModal: () => void;
  onScreenshotAttempt?: (reason: string) => void;
}

export const AntiScreenshotOverlay: React.FC<AntiScreenshotOverlayProps> = ({
  enabled,
  blurProtection,
  onOpenInfoModal,
  onScreenshotAttempt,
}) => {
  const [isBlackedOut, setIsBlackedOut] = useState(false);
  const [blackoutReason, setBlackoutReason] = useState<string | null>(null);
  const [showWarningToast, setShowWarningToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const triggerBlackout = useCallback((reason: string, durationMs = 2500) => {
    if (!enabled) return;
    setIsBlackedOut(true);
    setBlackoutReason(reason);
    setToastMessage(reason);
    setShowWarningToast(true);

    if (onScreenshotAttempt) {
      onScreenshotAttempt(reason);
    }

    // Attempt to overwrite clipboard if supported (prevents pasted screenshots)
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText('🔒 LYVO ANTI-SCREENSHOT: Captura de ecrã bloqueada por privacidade.');
      }
    } catch (e) {
      // Ignore clipboard permission errors silently
    }

    if (durationMs > 0) {
      setTimeout(() => {
        setIsBlackedOut(false);
      }, durationMs);
    }
  }, [enabled, onScreenshotAttempt]);

  // Expose global test trigger on window for easy testing
  useEffect(() => {
    (window as any).__lyvoTriggerScreenshotBlackout = (reason = 'Simulação de captura de ecrã') => {
      triggerBlackout(reason, 2500);
    };
    return () => {
      delete (window as any).__lyvoTriggerScreenshotBlackout;
    };
  }, [triggerBlackout]);

  // Keyboard shortcut listener (PrintScreen, Snipping tool, Mac screenshot shortcuts)
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Standard PrintScreen key (Windows / Linux)
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        e.preventDefault();
        triggerBlackout('Tecla PrintScreen intercetada! Ecrã protegido a preto.', 3000);
        return;
      }

      // 2. Mac shortcuts (Cmd + Shift + 3, Cmd + Shift + 4, Cmd + Shift + 5)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey) {
        if (['3', '4', '5', 'Digit3', 'Digit4', 'Digit5'].includes(e.key) || ['3', '4', '5'].includes(e.code)) {
          e.preventDefault();
          triggerBlackout('Atalho de captura macOS detetado! Ecrã protegido a preto.', 3000);
          return;
        }

        // Windows Snipping Tool (Windows + Shift + S or Ctrl + Shift + S)
        if (e.key.toLowerCase() === 's' || e.code === 'KeyS') {
          triggerBlackout('Atalho de captura / recorte detetado! Ecrã protegido a preto.', 2500);
          return;
        }
      }

      // 3. Print dialog (Ctrl + P or Cmd + P)
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'p' || e.code === 'KeyP')) {
        e.preventDefault();
        triggerBlackout('Tentativa de impressão bloqueada.', 2000);
        return;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        triggerBlackout('PrintScreen libertado — Ecrã bloqueado a preto.', 2500);
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
    };
  }, [enabled, triggerBlackout]);

  // Blur & Visibility Change detection (when external snipping tools or screen recorders activate)
  useEffect(() => {
    if (!enabled || !blurProtection) return;

    const handleWindowBlur = () => {
      // When window loses focus (e.g. Snipping tool opened or recording started)
      setIsBlackedOut(true);
      setBlackoutReason('Janela desfocada (Snipping Tool ou troca de app).');
    };

    const handleWindowFocus = () => {
      // Instantly restore when user returns to app
      setIsBlackedOut(false);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsBlackedOut(true);
        setBlackoutReason('App em segundo plano.');
      } else {
        setIsBlackedOut(false);
      }
    };

    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, blurProtection]);

  // Auto-hide warning toast after 4s
  useEffect(() => {
    if (!showWarningToast) return;
    const timer = setTimeout(() => setShowWarningToast(false), 4000);
    return () => clearTimeout(timer);
  }, [showWarningToast]);

  return (
    <>
      {/* 1. Complete Pitch Black Screen Shield */}
      {isBlackedOut && (
        <div
          id="lyvo-screen-blackout-shield"
          className="fixed inset-0 z-[999999] bg-black select-none pointer-events-auto flex flex-col items-center justify-center p-6"
          style={{ backgroundColor: '#000000' }}
          onClick={() => setIsBlackedOut(false)}
        >
          {/* Subtle minimal indicator that stays visually dark so the captured image is pitch black */}
          <div className="max-w-xs text-center space-y-3 opacity-30 hover:opacity-90 transition-opacity cursor-pointer">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-center text-zinc-500">
              <EyeOff className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-mono font-bold tracking-widest text-zinc-500 uppercase">
                LYVO PRIVACY SHIELD
              </p>
              <p className="text-[11px] text-zinc-600 mt-1">
                Ecrã protegido a preto contra capturas de ecrã e gravações.
              </p>
              <span className="inline-block mt-3 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-500">
                Toque no ecrã para voltar
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2. Notification Toast when Screenshot Attempt is Detected */}
      {showWarningToast && !isBlackedOut && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-sm pointer-events-none animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="bg-[#0D0D14]/95 border border-red-500/40 rounded-2xl p-3 shadow-[0_8px_30px_rgba(239,68,68,0.25)] backdrop-blur-xl flex items-center justify-between gap-2.5 pointer-events-auto">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  Tentativa de Print Intercetada!
                </p>
                <p className="text-[10.5px] text-zinc-400">
                  O ecrã ficou preto para proteger os dados.
                </p>
              </div>
            </div>
            <button
              onClick={onOpenInfoModal}
              className="px-2 py-1 rounded-lg bg-[#181826] hover:bg-[#222236] border border-[#2B2B42] text-[10px] text-[#22D3EE] font-semibold shrink-0 transition-colors"
            >
              Info
            </button>
          </div>
        </div>
      )}
    </>
  );
};
