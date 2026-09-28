import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Check, RefreshCw, Quote } from 'lucide-react';

export const SLOGAN_PRESETS = [
  'Live the moment.',
  'Partilha o momento. Deixa-o desaparecer.',
  'Ephemeral by design. Real by nature.',
  'No archives. Just now.',
  'Feel the now. Let it fade.',
  'Viva o presente sem filtros.',
  'Zero trace. Pure connection.',
  'Momentos reais, sem arquivo.',
];

interface SloganModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSlogan: string;
  onSelectSlogan: (slogan: string) => void;
}

export const SloganModal: React.FC<SloganModalProps> = ({
  isOpen,
  onClose,
  currentSlogan,
  onSelectSlogan,
}) => {
  const [customInput, setCustomInput] = useState('');
  const [selected, setSelected] = useState(currentSlogan);

  if (!isOpen) return null;

  const handleApply = (sloganToApply: string) => {
    const trimmed = sloganToApply.trim();
    if (!trimmed) return;
    onSelectSlogan(trimmed);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md bg-[#0F0F1A] border border-[#27273E] rounded-3xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-1/4 w-36 h-36 bg-[#8B5CF6]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-36 h-36 bg-[#22D3EE]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#1E1E30]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-[#8B5CF6]/20 to-[#22D3EE]/20 border border-[#8B5CF6]/40 text-[#22D3EE]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-['Outfit']">
                  Slogan LYVO
                </h3>
                <p className="text-xs text-zinc-400">
                  Personaliza o lema oficial da aplicação
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

          {/* Live Preview Card */}
          <div className="my-5 p-4 rounded-2xl bg-[#090910] border border-[#232338] relative overflow-hidden">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block mb-1">
              Pré-visualização do Topo
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-extrabold text-lg text-white font-['Outfit'] tracking-wider bg-gradient-to-r from-white via-zinc-100 to-[#22D3EE] bg-clip-text text-transparent">
                LYVO
              </span>
              <span className="text-zinc-500 font-light">—</span>
              <span className="text-sm font-medium text-[#22D3EE] tracking-tight">
                {selected}
              </span>
            </div>
          </div>

          {/* Presets List */}
          <div className="space-y-2 mb-5">
            <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
              <span>Slogans recomendados</span>
              <span className="text-[10px] text-zinc-500">Toque para selecionar</span>
            </label>
            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
              {SLOGAN_PRESETS.map((preset) => {
                const isCurrent = selected === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setSelected(preset);
                      setCustomInput('');
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-all ${
                      isCurrent
                        ? 'bg-[#8B5CF6]/20 border border-[#8B5CF6]/60 text-white font-medium shadow-[0_0_12px_rgba(139,92,246,0.2)]'
                        : 'bg-[#151524] border border-[#222238] text-zinc-300 hover:bg-[#1C1C30] hover:border-[#333350]'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate pr-2">
                      <Quote className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-[#22D3EE]' : 'text-zinc-500'}`} />
                      <span className="truncate">{preset}</span>
                    </span>
                    {isCurrent && (
                      <span className="flex items-center justify-center w-4 h-4 rounded-full bg-[#8B5CF6] text-white shrink-0">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Slogan Input */}
          <div className="space-y-2 mb-6">
            <label className="text-xs font-semibold text-zinc-300">
              Ou escreve um slogan personalizado:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customInput}
                maxLength={45}
                onChange={(e) => {
                  setCustomInput(e.target.value);
                  if (e.target.value.trim()) {
                    setSelected(e.target.value);
                  }
                }}
                placeholder="Ex: Live the moment."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#131320] border border-[#25253A] text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#8B5CF6]"
              />
              <button
                type="button"
                disabled={!customInput.trim()}
                onClick={() => handleApply(customInput)}
                className="px-3.5 py-2 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold transition-all active:scale-95 shrink-0"
              >
                Definir
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-[#1C1C2C]">
            <button
              type="button"
              onClick={() => {
                setSelected('Live the moment.');
                handleApply('Live the moment.');
              }}
              className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Restaurar padrão
            </button>

            <button
              type="button"
              onClick={() => handleApply(selected)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] text-white text-xs font-bold shadow-lg shadow-[#8B5CF6]/30 hover:opacity-95 transition-all active:scale-95"
            >
              Confirmar Slogan
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
