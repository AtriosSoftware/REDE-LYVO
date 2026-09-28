import React, { useState } from 'react';
import { 
  X, 
  Camera, 
  Video, 
  Mic, 
  Type, 
  MapPin, 
  Clock, 
  Globe, 
  Lock, 
  Sparkles, 
  Upload, 
  Play, 
  Square,
  Flame,
  Check
} from 'lucide-react';
import { VibeType, VibePrivacy, VibeColor, VibeItem, UserProfile } from '../types';
import { VIBE_COLORS } from '../lib/vibeColors';

interface CreateVibeModalProps {
  currentUser: UserProfile;
  onClose: () => void;
  onCreateVibe: (vibe: Partial<VibeItem>) => void;
}

const SAMPLE_PHOTO_PRESETS = [
  { label: 'Noite Neon', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1080&q=80' },
  { label: 'Pôr do Sol', url: 'https://images.unsplash.com/photo-1509233725247-49e657c54213?auto=format&fit=crop&w=1080&q=80' },
  { label: 'Café Urbano', url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1080&q=80' },
  { label: 'Concerto / Som', url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1080&q=80' },
];

export const CreateVibeModal: React.FC<CreateVibeModalProps> = ({
  currentUser,
  onClose,
  onCreateVibe,
}) => {
  const [vibeType, setVibeType] = useState<VibeType>('text');
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [location, setLocation] = useState('Lisboa, Centro');
  const [privacy, setPrivacy] = useState<VibePrivacy>('public');
  const [durationHours, setDurationHours] = useState<number>(24);
  const [vibeColor, setVibeColor] = useState<VibeColor>(currentUser.vibeColor);
  
  // Audio recording simulation state
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [audioSeconds, setAudioSeconds] = useState(0);

  const selectedColorConfig = VIBE_COLORS[vibeColor];

  // Audio timer
  React.useEffect(() => {
    let interval: any;
    if (isRecordingAudio) {
      interval = setInterval(() => {
        setAudioSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecordingAudio]);

  const handleToggleRecord = () => {
    if (isRecordingAudio) {
      setIsRecordingAudio(false);
    } else {
      setAudioSeconds(0);
      setIsRecordingAudio(true);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setMediaUrl(url);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !mediaUrl && vibeType !== 'audio') return;

    const newVibe: Partial<VibeItem> = {
      type: vibeType,
      content: content.trim(),
      mediaUrl: mediaUrl || (vibeType === 'photo' ? SAMPLE_PHOTO_PRESETS[0].url : undefined),
      audioDuration: vibeType === 'audio' ? Math.max(5, audioSeconds || 12) : undefined,
      location: location.trim(),
      distance: 'Perto de ti',
      privacy,
      authorVibeColor: vibeColor,
      createdAt: Date.now(),
      expiresAt: Date.now() + durationHours * 60 * 60 * 1000,
    };

    onCreateVibe(newVibe);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-[#0D0D15] border border-[#222234] rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-[#1E1E2E] flex items-center justify-between bg-[#11111B]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F43F9E] animate-pulse" />
            <h2 className="font-extrabold text-base text-white font-['Outfit']">
              Criar Nova Vibe
            </h2>
            <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full">
              {durationHours}h TTL
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1B1B29] text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Scrollable Area */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Vibe Type Selector Tabs */}
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#151522] rounded-xl border border-[#242436]">
            {[
              { type: 'text' as const, label: 'Texto', icon: Type },
              { type: 'photo' as const, label: 'Foto', icon: Camera },
              { type: 'video' as const, label: 'Vídeo', icon: Video },
              { type: 'audio' as const, label: 'Áudio', icon: Mic },
            ].map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setVibeType(type);
                  if (type === 'photo' && !mediaUrl) {
                    setMediaUrl(SAMPLE_PHOTO_PRESETS[0].url);
                  }
                }}
                className={`py-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${
                  vibeType === type
                    ? 'bg-gradient-to-tr from-[#8B5CF6] to-[#22D3EE] text-white font-semibold shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10.5px]">{label}</span>
              </button>
            ))}
          </div>

          {/* Type-Specific Interactive Inputs */}
          {vibeType === 'text' && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300">
                O que estás a viver agora?
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Ex: 'Estou no centro de Lisboa 😂' ou 'Quem está acordado agora?'"
                rows={4}
                maxLength={240}
                className="w-full bg-[#161624] border border-[#26263A] rounded-xl p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#8B5CF6] resize-none"
              />
              <div className="flex justify-between text-[11px] text-zinc-500">
                <span>Espontâneo & direto</span>
                <span>{content.length}/240</span>
              </div>
            </div>
          )}

          {vibeType === 'photo' && (
            <div className="space-y-3">
              <label className="text-xs font-semibold text-zinc-300">
                Foto do Momento
              </label>
              
              {/* Media Preview */}
              {mediaUrl && (
                <div className="relative rounded-xl overflow-hidden border border-[#2A2A40] max-h-48 bg-black">
                  <img src={mediaUrl} alt="Preview" className="w-full h-48 object-cover" />
                  <button
                    type="button"
                    onClick={() => setMediaUrl('')}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-black"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Upload button or Presets */}
              <div className="flex items-center gap-2">
                <label className="flex-1 py-2.5 px-3 rounded-xl bg-[#181827] border border-[#2B2B3E] hover:border-[#8B5CF6] text-zinc-300 hover:text-white flex items-center justify-center gap-2 text-xs cursor-pointer transition-all">
                  <Upload className="w-4 h-4 text-[#22D3EE]" />
                  <span>Carregar do Dispositivo</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              {/* Quick Presets */}
              <div>
                <span className="text-[10.5px] text-zinc-500 block mb-1.5">Ou escolhe uma cena:</span>
                <div className="grid grid-cols-4 gap-1.5">
                  {SAMPLE_PHOTO_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setMediaUrl(p.url)}
                      className={`relative h-14 rounded-lg overflow-hidden border transition-all ${
                        mediaUrl === p.url ? 'border-[#F43F9E] scale-95 shadow-[0_0_8px_#F43F9E]' : 'border-zinc-800'
                      }`}
                    >
                      <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                      <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[8.5px] text-white text-center py-0.5 truncate">
                        {p.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Legenda rápida (opcional)..."
                className="w-full bg-[#161624] border border-[#26263A] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>
          )}

          {vibeType === 'video' && (
            <div className="space-y-3">
              <label className="text-xs font-semibold text-zinc-300">
                Vídeo Curto (até 30s)
              </label>
              {mediaUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-[#2A2A40] max-h-48 bg-black">
                  <img src={mediaUrl} alt="Preview" className="w-full h-48 object-cover" />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] text-white">
                    Vídeo pronto
                  </span>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-zinc-700 bg-[#141420] text-center">
                  <Video className="w-7 h-7 text-[#22D3EE] mx-auto mb-1.5" />
                  <p className="text-xs text-zinc-300 font-medium">Gravar ou Carregar Clip</p>
                  <label className="inline-block mt-2 px-3 py-1.5 rounded-lg bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 text-[#C4B5FD] text-xs font-semibold cursor-pointer">
                    Escolher Vídeo
                    <input type="file" accept="video/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              )}

              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Descrição do vídeo..."
                className="w-full bg-[#161624] border border-[#26263A] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>
          )}

          {vibeType === 'audio' && (
            <div className="space-y-3 p-4 rounded-xl bg-[#141422] border border-[#262638] text-center">
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={handleToggleRecord}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95 ${
                    isRecordingAudio
                      ? 'bg-red-500 text-white animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.5)]'
                      : 'bg-gradient-to-tr from-[#8B5CF6] to-[#22D3EE] text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]'
                  }`}
                >
                  {isRecordingAudio ? <Square className="w-6 h-6 fill-white" /> : <Mic className="w-7 h-7" />}
                </button>
                
                <span className="text-sm font-mono text-white mt-2 font-semibold">
                  {isRecordingAudio ? `A gravar: 0:${String(audioSeconds).padStart(2, '0')}` : 'Toca para gravar nota de voz'}
                </span>
                <span className="text-[11px] text-zinc-400 mt-0.5">
                  Microfone ativo • Som espontâneo
                </span>
              </div>

              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Contexto do áudio (ex: 'Música ao vivo no Chiado')..."
                className="w-full bg-[#181827] border border-[#2A2A3E] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#8B5CF6] mt-2 text-left"
              />
            </div>
          )}

          {/* Location Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#22D3EE]" />
              <span>Localização Aproximada</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: Lisboa, Centro"
                className="flex-1 bg-[#161624] border border-[#26263A] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#8B5CF6]"
              />
              <button
                type="button"
                onClick={() => setLocation('Lisboa, Chiado')}
                className="px-2.5 py-1.5 rounded-xl bg-[#1A1A2A] border border-[#2B2B3C] text-[11px] text-zinc-300 hover:text-white"
              >
                Chiado
              </button>
              <button
                type="button"
                onClick={() => setLocation('Porto, Ribeira')}
                className="px-2.5 py-1.5 rounded-xl bg-[#1A1A2A] border border-[#2B2B3C] text-[11px] text-zinc-300 hover:text-white"
              >
                Porto
              </button>
            </div>
          </div>

          {/* Expiration TTL Duration Selector */}
          <div className="space-y-2 p-3 rounded-2xl bg-[#141422] border border-[#242436]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#F43F9E] animate-pulse" />
                <span>Tempo de Vida da Publicação</span>
              </label>
              <span className="text-xs font-mono font-bold text-[#F43F9E] bg-[#F43F9E]/10 border border-[#F43F9E]/30 px-2 py-0.5 rounded-full">
                {durationHours < 1 ? `${Math.round(durationHours * 60)} minutos` : `${durationHours}h`}
              </span>
            </div>

            <p className="text-[11px] text-zinc-400">
              Escolhe a duração que quiseres (até 24 horas). Após esse período, desaparece para sempre.
            </p>

            {/* Quick Presets */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1">
              {[
                { hours: 0.5, label: '30 min' },
                { hours: 1, label: '1 hora' },
                { hours: 3, label: '3 horas' },
                { hours: 6, label: '6 horas' },
                { hours: 12, label: '12 horas' },
                { hours: 24, label: '24 horas' },
              ].map(({ hours, label }) => (
                <button
                  key={hours}
                  type="button"
                  onClick={() => setDurationHours(hours)}
                  className={`py-1.5 px-1 rounded-xl text-[11px] font-semibold transition-all border text-center ${
                    durationHours === hours
                      ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-white shadow-[0_0_10px_rgba(139,92,246,0.3)]'
                      : 'bg-[#181828] border-[#252538] text-zinc-400 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Custom slider up to 24h */}
            <div className="pt-2">
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono mb-1">
                <span>Personalizado:</span>
                <span>{durationHours}h de 24h</span>
              </div>
              <input
                type="range"
                min="1"
                max="24"
                step="1"
                value={Math.max(1, Math.round(durationHours))}
                onChange={(e) => setDurationHours(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[#F43F9E]"
              />
            </div>
          </div>

          {/* Privacy Selector: Public vs Private */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              Visibilidade
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPrivacy('public')}
                className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                  privacy === 'public'
                    ? 'bg-[#22D3EE]/15 border-[#22D3EE] text-white shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                    : 'bg-[#151522] border-[#222234] text-zinc-400'
                }`}
              >
                <Globe className="w-4 h-4 text-[#22D3EE]" />
                <div className="text-left">
                  <p className="text-xs font-semibold">Pública</p>
                  <p className="text-[10px] text-zinc-400">Aparece no "Agora" & Radar</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPrivacy('friends')}
                className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                  privacy === 'friends'
                    ? 'bg-[#F43F9E]/15 border-[#F43F9E] text-white shadow-[0_0_10px_rgba(244,63,158,0.2)]'
                    : 'bg-[#151522] border-[#222234] text-zinc-400'
                }`}
              >
                <Lock className="w-4 h-4 text-[#F43F9E]" />
                <div className="text-left">
                  <p className="text-xs font-semibold">Privada</p>
                  <p className="text-[10px] text-zinc-400">Apenas Amigos ou Link</p>
                </div>
              </button>
            </div>
          </div>

          {/* Vibe Color Accent Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              Vibe Color para este Momento
            </label>
            <div className="flex items-center gap-2">
              {(Object.keys(VIBE_COLORS) as VibeColor[]).map((c) => {
                const conf = VIBE_COLORS[c];
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setVibeColor(c)}
                    className={`w-7 h-7 rounded-full transition-transform ${conf.bgClass} flex items-center justify-center ${
                      vibeColor === c ? 'scale-125 ring-2 ring-white shadow-lg' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    {vibeColor === c && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

        </form>

        {/* Modal Footer Submit */}
        <div className="p-4 border-t border-[#1E1E2E] bg-[#10101A] flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-[#1A1A28] border border-[#2B2B3E] text-zinc-300 text-xs font-semibold hover:bg-[#222234] transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="flex-2 py-3 rounded-xl bg-gradient-to-r from-[#F43F9E] via-[#8B5CF6] to-[#22D3EE] text-white text-xs font-bold shadow-[0_0_18px_rgba(139,92,246,0.5)] active:scale-95 hover:opacity-95 transition-all flex items-center justify-center gap-2"
          >
            <Flame className="w-4 h-4 fill-white" />
            <span>Publicar Vibe ({durationHours}h)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
