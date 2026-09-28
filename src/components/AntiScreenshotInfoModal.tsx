import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, ShieldCheck, Smartphone, Monitor, EyeOff, Sparkles, CheckCircle2, Code2, AlertTriangle } from 'lucide-react';

interface AntiScreenshotInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  enabled: boolean;
  onToggleEnabled: () => void;
  blurProtection: boolean;
  onToggleBlurProtection: () => void;
  onTestBlackout: () => void;
}

export const AntiScreenshotInfoModal: React.FC<AntiScreenshotInfoModalProps> = ({
  isOpen,
  onClose,
  enabled,
  onToggleEnabled,
  blurProtection,
  onToggleBlurProtection,
  onTestBlackout,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg max-h-[85vh] flex flex-col bg-[#0E0E18] border border-[#26263D] rounded-3xl shadow-[0_12px_50px_rgba(0,0,0,0.85)] overflow-hidden"
        >
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute top-0 right-1/4 w-40 h-40 bg-[#8B5CF6]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-40 h-40 bg-[#EF4444]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-[#1C1C2C] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-[#EF4444]/20 to-[#8B5CF6]/20 border border-[#EF4444]/40 text-[#EF4444]">
                <EyeOff className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
                  <span>Escudo Anti-Screenshot</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Ecrã Preto
                  </span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Proteção visual ativa contra capturas de ecrã e gravação
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-[#181826] text-zinc-400 hover:text-white hover:bg-[#232338] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs text-zinc-300">
            {/* Quick Test Action Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#171728] to-[#12121E] border border-[#2D2D46] flex items-center justify-between gap-3">
              <div>
                <span className="font-bold text-white text-xs block">
                  Testar Proteção de Ecrã Preto
                </span>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Simula uma captura e escurece 100% do ecrã instantaneamente.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setTimeout(() => {
                    onTestBlackout();
                  }, 150);
                }}
                className="px-3.5 py-2 rounded-xl bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold text-xs shadow-lg shadow-red-500/25 active:scale-95 transition-all shrink-0"
              >
                Simular Print
              </button>
            </div>

            {/* Toggle Switches */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-[#131320] border border-[#232336]">
              <div className="flex items-center justify-between py-1">
                <div>
                  <span className="font-semibold text-white block">
                    Ativar Escudo Anti-Screenshot
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    Interceta PrintScreen, atalhos de corte e impressão.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onToggleEnabled}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    enabled ? 'bg-[#8B5CF6]' : 'bg-zinc-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="border-t border-[#1F1F30] pt-2 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block">
                    Blackout ao Desfocar Janela (Snipping Tool)
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    Torna o ecrã preto se uma ferramenta externa roubar o foco.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onToggleBlurProtection}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    blurProtection ? 'bg-[#22D3EE]' : 'bg-zinc-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      blurProtection ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* How It Works on the Web */}
            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Monitor className="w-4 h-4 text-[#22D3EE]" />
                Como o LYVO Bloqueia Prints na Web
              </h4>
              <ul className="space-y-2 text-zinc-400 text-[11.5px] leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Interceção de Teclas Físicas:</strong> Ao pressionar <code className="text-[#22D3EE] bg-black/40 px-1 py-0.5 rounded">PrintScreen</code>, atalhos macOS (<code className="text-[#22D3EE] bg-black/40 px-1 py-0.5 rounded">Cmd+Shift+3/4/5</code>) ou <code className="text-[#22D3EE] bg-black/40 px-1 py-0.5 rounded">Win+Shift+S</code>, o LYVO dispara uma camada 100% preta de opacidade total em menos de 1 milissegundo.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Detetor de Ferramenta de Recorte (Blur Trap):</strong> Ferramentas como o Snipping Tool ou gravadores retiram o foco do navegador para selecionar a área. Ao perder o foco, a aplicação desvanece para preto instantaneamente.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Limpeza da Área de Transferência:</strong> A área de transferência substitui qualquer frame gravado por uma mensagem de segurança criptografada.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Proteção @media print:</strong> Se alguém tentar imprimir ou gravar para PDF (<code className="text-[#22D3EE] bg-black/40 px-1 py-0.5 rounded">Ctrl+P</code>), o motor CSS renderiza uma página totalmente preta.
                  </span>
                </li>
              </ul>
            </div>

            {/* Native Mobile Architecture (Android / iOS / Capacitor) */}
            <div className="p-3.5 rounded-2xl bg-[#141422] border border-[#28283E] space-y-2">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-[#8B5CF6]" />
                Em Aplicação Nativa (Android & iOS)
              </h4>
              <p className="text-[11.5px] text-zinc-400 leading-relaxed">
                Ao empacotar a aplicação LYVO como app nativa (via Capacitor, React Native ou Flutter), o ecrã preto no print é garantido ao nível do chip gráfico do sistema operacional:
              </p>

              <div className="p-2.5 rounded-xl bg-[#090910] border border-[#222234] font-mono text-[11px] text-zinc-300 space-y-1">
                <p className="text-[#22D3EE] font-bold">// Android (MainActivity.java / Kotlin):</p>
                <p className="text-emerald-400">
                  getWindow().setFlags(
                    WindowManager.LayoutParams.FLAG_SECURE,
                    WindowManager.LayoutParams.FLAG_SECURE
                  );
                </p>
                <p className="text-zinc-500 text-[10px]">
                  /* O Android GPU transforma todos os prints e gravações em tela 100% preta automaticamente */
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-[#090910] border border-[#222234] font-mono text-[11px] text-zinc-300 space-y-1">
                <p className="text-[#F43F9E] font-bold">// iOS (Swift / UIKit):</p>
                <p className="text-pink-300">
                  UIScreen.capturedDidChangeNotification
                </p>
                <p className="text-zinc-500 text-[10px]">
                  /* Oculta a view ou desenha uma overlay preta quando isCaptured == true */
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[#1C1C2C] bg-[#0A0A12] flex items-center justify-between shrink-0">
            <span className="text-[11px] text-zinc-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Proteção ativa em todas as Vibes e DMs
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#1D1D2E] hover:bg-[#282840] text-white text-xs font-semibold transition-colors"
            >
              Fechar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
