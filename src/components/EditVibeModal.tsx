import React, { useState } from 'react';
import { 
  X, 
  Edit3, 
  MapPin, 
  Sparkles, 
  Eye, 
  Globe, 
  Users, 
  Lock, 
  Check, 
  Trash2,
  Image as ImageIcon,
  Clock,
  AlertCircle
} from 'lucide-react';
import { VibeItem, VibeColor, VibePrivacy } from '../types';
import { VIBE_COLORS, formatTimeRemaining } from '../lib/vibeColors';

interface EditVibeModalProps {
  vibe: VibeItem;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedVibe: VibeItem) => void;
  onDelete?: (vibeId: string) => void;
}

const QUICK_LOCATIONS = [
  'Lisboa, Chiado',
  'Lisboa, Bairro Alto',
  'Lisboa, Cais do Sodré',
  'Miradouro Santa Catarina',
  'Porto, Ribeira',
  'Porto, Baixa',
];

const VIBE_COLOR_OPTIONS: { id: VibeColor; label: string; hex: string }[] = [
  { id: 'purple', label: 'Roxo Neon', hex: '#8B5CF6' },
  { id: 'cyan', label: 'Ciano Neon', hex: '#22D3EE' },
  { id: 'pink', label: 'Rosa Neon', hex: '#F43F9E' },
  { id: 'emerald', label: 'Verde Neon', hex: '#10B981' },
  { id: 'amber', label: 'Âmbar Dourado', hex: '#F59E0B' },
  { id: 'rose', label: 'Rubi Intenso', hex: '#F43F5E' },
];

export const EditVibeModal: React.FC<EditVibeModalProps> = ({
  vibe,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const initialHours = Math.max(0.5, Math.min(24, Math.round(((vibe.expiresAt - Date.now()) / (3600 * 1000)) * 2) / 2));
  const [durationHours, setDurationHours] = useState<number>(initialHours > 0 ? initialHours : 12);
  const [hasChangedDuration, setHasChangedDuration] = useState(false);
  const [content, setContent] = useState(vibe.content || '');
  const [location, setLocation] = useState(vibe.location || '');
  const [vibeColor, setVibeColor] = useState<VibeColor>(vibe.authorVibeColor || 'purple');
  const [privacy, setPrivacy] = useState<VibePrivacy>(vibe.privacy || 'public');
  const [mediaUrl, setMediaUrl] = useState(vibe.mediaUrl || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  if (!isOpen) return null;

  const currentColor = VIBE_COLORS[vibeColor] || VIBE_COLORS.purple;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: VibeItem = {
      ...vibe,
      content: content.trim(),
      location: location.trim(),
      authorVibeColor: vibeColor,
      privacy,
      mediaUrl: mediaUrl.trim() || undefined,
      expiresAt: hasChangedDuration ? (Date.now() + durationHours * 3600 * 1000) : vibe.expiresAt,
      editedAt: Date.now(),
    };
    onSave(updated);
    onClose();
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(vibe.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-[#0F0F1A] border border-[#2B2B42] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#202034] flex items-center justify-between bg-[#141424]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 flex items-center justify-center text-[#A78BFA]">
              <Edit3 className="w-4 h-4 text-[#22D3EE]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
                Alterar a tua Publicação
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Na Timeline
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400">
                Atualiza o texto, localização ou estilo da tua Vibe ativa
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1F1F30] hover:bg-[#2A2A40] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle (Editar vs Pré-visualizar) */}
        <div className="px-5 pt-3 pb-1 flex items-center justify-between border-b border-[#1E1E2E] bg-[#11111E]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'editor'
                  ? 'bg-[#8B5CF6] text-white shadow-md'
                  : 'bg-[#181828] text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar Campos</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'preview'
                  ? 'bg-[#22D3EE] text-black shadow-md'
                  : 'bg-[#181828] text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Pré-visualização</span>
            </button>
          </div>

          <div className="text-[11px] text-zinc-400 flex items-center gap-1 font-mono">
            <Clock className="w-3 h-3 text-[#F43F9E]" />
            <span>Resta: {formatTimeRemaining(vibe.expiresAt)}</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-zinc-200 text-sm">
          {activeTab === 'editor' ? (
            <form id="edit-vibe-form" onSubmit={handleSave} className="space-y-4">
              {/* Content Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                    <span>Mensagem / Legenda da Vibe:</span>
                  </label>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {content.length}/280
                  </span>
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  maxLength={280}
                  rows={3}
                  placeholder="Escreve o que estás a sentir ou viver agora..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#141422] border border-[#27273E] text-white text-sm focus:outline-none focus:border-[#22D3EE] transition-colors placeholder:text-zinc-600 resize-none"
                />

                {/* Quick Emoji Insert */}
                <div className="flex items-center gap-1.5 mt-1.5 overflow-x-auto no-scrollbar py-0.5">
                  <span className="text-[10.5px] text-zinc-500 shrink-0">Inserir:</span>
                  {['✨', '🔥', '⚡', '🌃', '🍹', '🎶', '👀', '😎', '🙌', '🚀'].map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setContent((prev) => (prev ? `${prev} ${em}` : em))}
                      className="px-2 py-0.5 rounded-lg bg-[#1B1B2C] hover:bg-[#28283E] text-xs transition-colors"
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location Input */}
              <div>
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5 mb-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#22D3EE]" />
                  <span>Localização:</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: Lisboa, Chiado"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#141422] border border-[#27273E] text-white text-xs focus:outline-none focus:border-[#22D3EE] transition-colors"
                />
                
                {/* Location Quick Chips */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  {QUICK_LOCATIONS.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setLocation(loc)}
                      className={`text-[10.5px] px-2.5 py-1 rounded-full border transition-all ${
                        location === loc
                          ? 'bg-[#22D3EE]/20 border-[#22D3EE] text-[#22D3EE] font-semibold'
                          : 'bg-[#161626] border-[#25253A] text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vibe Neon Color Picker */}
              <div>
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#F43F9E]" />
                  <span>Cor de Vibe do Perfil & Aura:</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {VIBE_COLOR_OPTIONS.map((col) => (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => setVibeColor(col.id)}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                        vibeColor === col.id
                          ? 'bg-[#1C1C30] border-[#22D3EE] shadow-[0_0_12px_rgba(34,211,238,0.2)]'
                          : 'bg-[#131320] border-[#222234] hover:border-zinc-700'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: col.hex }}
                      />
                      <span className="text-[11px] text-zinc-200 font-medium truncate">
                        {col.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Media URL (Optional image edit) */}
              {(vibe.type === 'photo' || vibe.mediaUrl) && (
                <div>
                  <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5 mb-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#A78BFA]" />
                    <span>Link da Imagem / Foto (URL):</span>
                  </label>
                  <input
                    type="url"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2 rounded-xl bg-[#141422] border border-[#27273E] text-white text-xs focus:outline-none focus:border-[#22D3EE] transition-colors"
                  />
                  {mediaUrl && (
                    <div className="mt-2 relative w-20 h-20 rounded-xl overflow-hidden border border-[#2B2B42]">
                      <img src={mediaUrl} alt="Prévia" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setMediaUrl('')}
                        title="Remover foto e manter só texto"
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/80 text-white flex items-center justify-center hover:bg-rose-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Privacy Setting */}
              <div>
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5 mb-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Privacidade da Vibe:</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPrivacy('public')}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all ${
                      privacy === 'public'
                        ? 'bg-[#18182A] border-[#10B981] text-emerald-300'
                        : 'bg-[#12121E] border-[#222232] text-zinc-400'
                    }`}
                  >
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <div className="text-left">
                      <div className="text-xs font-semibold">Público</div>
                      <div className="text-[10px] text-zinc-500">Visível no radar e feed</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrivacy('friends')}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all ${
                      privacy === 'friends'
                        ? 'bg-[#18182A] border-[#8B5CF6] text-purple-300'
                        : 'bg-[#12121E] border-[#222232] text-zinc-400'
                    }`}
                  >
                    <Users className="w-4 h-4 text-purple-400" />
                    <div className="text-left">
                      <div className="text-xs font-semibold">Amigos Próximos</div>
                      <div className="text-[10px] text-zinc-500">Apenas círculo mútuo</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Tempo de Vida / Duração (TTL) */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-[#141424] border border-[#27273C]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#F43F9E] animate-pulse" />
                    <span>Tempo de Vida da Publicação (TTL):</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-[#F43F9E] bg-[#F43F9E]/10 border border-[#F43F9E]/30 px-2 py-0.5 rounded-full">
                    {durationHours < 1 ? `${Math.round(durationHours * 60)} min` : `${durationHours} horas`}
                  </span>
                </div>

                <p className="text-[11px] text-zinc-400">
                  Define quanto tempo a publicação permanece ativa antes de ser permanentemente eliminada do Supabase e do telemóvel.
                </p>

                {/* Quick Presets */}
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1 pt-1">
                  {[
                    { hours: 0.5, label: '30 min' },
                    { hours: 1, label: '1 h' },
                    { hours: 3, label: '3 h' },
                    { hours: 6, label: '6 h' },
                    { hours: 12, label: '12 h' },
                    { hours: 15, label: '15 h' },
                    { hours: 17, label: '17 h' },
                    { hours: 24, label: '24 h' },
                  ].map(({ hours, label }) => (
                    <button
                      key={hours}
                      type="button"
                      onClick={() => {
                        setDurationHours(hours);
                        setHasChangedDuration(true);
                      }}
                      className={`py-1.5 px-0.5 rounded-xl text-[10.5px] font-semibold transition-all border text-center ${
                        durationHours === hours
                          ? 'bg-[#8B5CF6]/30 border-[#8B5CF6] text-white shadow-[0_0_10px_rgba(139,92,246,0.3)]'
                          : 'bg-[#181828] border-[#252538] text-zinc-400 hover:text-white'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Range Slider */}
                <div className="pt-2">
                  <div className="flex justify-between items-center text-[10px] text-zinc-400 font-mono mb-1">
                    <span className="text-[#22D3EE]">Personalizar na barra de rolagem:</span>
                    <span className="font-bold text-white bg-[#1C1C2C] px-2 py-0.5 rounded border border-white/10">
                      {durationHours < 1 ? '30 min' : `${durationHours} horas`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="24"
                    step="0.5"
                    value={durationHours}
                    onChange={(e) => {
                      setDurationHours(Number(e.target.value));
                      setHasChangedDuration(true);
                    }}
                    className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[#F43F9E]"
                  />
                  <div className="flex justify-between text-[9px] text-zinc-500 font-mono mt-1">
                    <span>30m</span>
                    <span>6h</span>
                    <span>12h</span>
                    <span>15h</span>
                    <span>17h</span>
                    <span>24h</span>
                  </div>
                </div>

                {/* Live Expiration target info */}
                <div className="mt-1 px-2.5 py-1.5 rounded-xl bg-[#0F0F18] border border-white/5 flex items-center justify-between text-[10.5px]">
                  <span className="text-zinc-400">Eliminação programada:</span>
                  <span className="font-mono text-cyan-300 font-semibold">
                    Hoje às {new Date(Date.now() + durationHours * 3600 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </form>
          ) : (
            /* Live Preview Tab */
            <div className="space-y-3">
              <div className="text-xs text-zinc-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#22D3EE]" />
                <span>Assim é como a tua publicação aparecerá na Timeline:</span>
              </div>

              {/* Mock Vibe Preview Card */}
              <div className="p-4 rounded-2xl bg-[#131322] border border-[#25253C] space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {/* Avatar with selected color ring */}
                    <div className="relative w-9 h-9 flex items-center justify-center">
                      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 40 40">
                        <circle cx="20" cy="20" r="17" fill="none" stroke={currentColor.hex} strokeWidth="2.5" strokeDasharray="6 3.2" strokeLinecap="round" />
                      </svg>
                      <img src={vibe.authorAvatar} alt={vibe.authorName} className="w-7 h-7 rounded-full object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-xs">{vibe.authorName}</span>
                        <span className="text-[10px] text-zinc-500">@{vibe.authorUsername}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#8B5CF6]/20 text-[#A78BFA] border border-[#8B5CF6]/30">A tua publicação</span>
                      </div>
                      <span className="text-[10.5px] text-zinc-400 flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 text-[#22D3EE]" />
                        {location || 'Sem localização'}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#181826] border border-[#2B2B3E] text-zinc-300 font-mono">
                    24h ativa
                  </span>
                </div>

                {mediaUrl && (
                  <div className="rounded-xl overflow-hidden max-h-48 border border-white/10">
                    <img src={mediaUrl} alt="Prévia" className="w-full h-full object-cover" />
                  </div>
                )}

                <p className="text-white text-sm font-medium leading-relaxed bg-[#0C0C14] p-3 rounded-xl border border-white/5">
                  {content || <span className="text-zinc-600 italic">Sem legenda</span>}
                </p>

                <div className="text-[10px] text-cyan-300 flex items-center gap-1 font-mono">
                  <span>• Editado agora mesmo</span>
                </div>
              </div>
            </div>
          )}

          {/* Delete confirmation section */}
          {showDeleteConfirm && (
            <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-600/40 text-rose-200 text-xs space-y-2 animate-in slide-in-from-top-2">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Eliminar publicação agora?</span>
              </div>
              <p className="text-[11px] text-rose-300/80">
                Esta ação remove imediatamente a tua vibe do feed e dos servidores sem esperar pelas 24 horas.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-colors"
                >
                  Sim, Eliminar Vibe
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 rounded-xl bg-[#242436] text-zinc-300 text-xs hover:bg-[#32324A] transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-4 border-t border-[#202034] bg-[#121220] flex items-center justify-between gap-3">
          {onDelete && !showDeleteConfirm ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-400 hover:text-rose-200 hover:bg-rose-950/30 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#1B1B2C] hover:bg-[#26263C] text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] hover:opacity-95 text-white text-xs font-bold shadow-[0_0_15px_rgba(139,92,246,0.3)] active:scale-95 transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Guardar Alterações</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
