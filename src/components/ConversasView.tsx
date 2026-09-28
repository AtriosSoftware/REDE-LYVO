import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  ArrowLeft, 
  Send, 
  Mic, 
  Image as ImageIcon, 
  Trash2, 
  Play, 
  Pause, 
  Lock, 
  Flame, 
  Check, 
  CheckCheck,
  AlertTriangle
} from 'lucide-react';
import { Conversation, EphemeralMessage, UserProfile } from '../types';
import { VIBE_COLORS, formatTimeRemaining, formatTimeAgo } from '../lib/vibeColors';

interface ConversasViewProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  currentUser: UserProfile;
  purgingConversations?: Record<string, number>;
  onSelectConversation: (id: string | null) => void;
  onLeaveConversation?: (conversationId: string) => void;
  onSendMessage: (conversationId: string, text: string, type?: 'text' | 'audio' | 'photo') => void;
  onPurgeConversation: (conversationId: string) => void;
}

export const ConversasView: React.FC<ConversasViewProps> = ({
  conversations,
  activeConversationId,
  currentUser,
  purgingConversations = {},
  onSelectConversation,
  onLeaveConversation,
  onSendMessage,
  onPurgeConversation,
}) => {
  const [inputText, setInputText] = useState('');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);

  const activeConv = conversations.find((c) => c.id === activeConversationId);

  const handleExitChat = () => {
    if (activeConv) {
      if (onLeaveConversation) {
        onLeaveConversation(activeConv.id);
      } else {
        onSelectConversation(null);
      }
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversationId) return;
    onSendMessage(activeConversationId, inputText.trim(), 'text');
    setInputText('');
  };

  const handleSendAudioMock = () => {
    if (!activeConversationId) return;
    onSendMessage(activeConversationId, 'Nota de áudio espontânea (0:12)', 'audio');
  };

  const handleSendPhotoMock = () => {
    if (!activeConversationId) return;
    onSendMessage(
      activeConversationId,
      'Foto efêmera enviada',
      'photo'
    );
  };

  // If inside a specific active conversation
  if (activeConv) {
    const partnerColor = VIBE_COLORS[activeConv.participantVibeColor] || VIBE_COLORS.purple;

    return (
      <div className="fixed inset-0 z-40 bg-[#0A0A10] flex flex-col max-w-md mx-auto">
        {/* Chat Header */}
        <div className="p-3.5 bg-[#10101C] border-b border-[#1E1E2F] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExitChat}
              className="p-1.5 rounded-xl bg-[#171726] text-zinc-300 hover:text-white flex items-center gap-1 group"
              title="Sair da conversa (inicia autodestruição em 1 min)"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-[10px] text-zinc-400 group-hover:text-white hidden sm:inline">Sair</span>
            </button>

            <div className={`relative w-9 h-9 rounded-full p-[1.5px] border ${partnerColor.borderClass} ${partnerColor.glowClass}`}>
              <img
                src={activeConv.participantAvatar}
                alt={activeConv.participantName}
                className="w-full h-full object-cover rounded-full"
              />
              {activeConv.isOnline && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-[#10101C]" />
              )}
            </div>

            <div>
              <h3 className="font-bold text-sm text-white leading-none">
                {activeConv.participantName}
              </h3>
              <div className="flex items-center gap-1.5 mt-1 text-[10.5px]">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                <span className="font-mono text-amber-300 font-medium">
                  Apaga 1 min após sair
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExitChat}
              className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-[11px] font-semibold flex items-center gap-1 transition-colors"
              title="Sair da conversa e apagar as mensagens em 1 minuto"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Sair (1m TTL)</span>
            </button>

            <button
              onClick={() => setShowPurgeConfirm(true)}
              className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs transition-colors"
              title="Destruir esta conversa imediatamente"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Purge Modal Confirmation */}
        {showPurgeConfirm && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-xs bg-[#12121D] border border-red-500/30 rounded-2xl p-5 text-center space-y-3 shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto border border-red-500/40">
                <Flame className="w-6 h-6 animate-pulse" />
              </div>
              <h4 className="font-bold text-white text-base">Purga Manual Imediata?</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Todas as mensagens e ficheiros desta conversa serão apagados da base de dados e do Storage imediatamente, sem esperar pelo 1 minuto.
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowPurgeConfirm(false)}
                  className="flex-1 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    onPurgeConversation(activeConv.id);
                    setShowPurgeConfirm(false);
                    onSelectConversation(null);
                  }}
                  className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg"
                >
                  Destruir Agora
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Ephemeral Architecture banner */}
        <div className="px-3.5 py-2 bg-[#171224] border-b border-[#2C1C38] flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1.5 text-pink-300 font-medium">
            <Flame className="w-3.5 h-3.5 text-[#F43F9E] animate-pulse" />
            <span>Zero Rasto: Mensagens apagadas em 1 min após saíres</span>
          </span>
          <span className="font-mono text-[10px] text-[#22D3EE] bg-[#22D3EE]/10 px-2 py-0.5 rounded-full border border-[#22D3EE]/30">
            Auto-Purge 1m
          </span>
        </div>

        {/* Messages List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {activeConv.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500">
              <ShieldCheck className="w-10 h-10 text-[#8B5CF6] mb-2 opacity-60" />
              <p className="text-sm font-semibold text-zinc-300">Inicia a conversa efémera</p>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                As mensagens enviadas desaparecerão automaticamente em 24 horas.
              </p>
            </div>
          ) : (
            activeConv.messages.map((msg) => {
              const isMe = msg.senderId === currentUser.id;
              const senderColor = isMe
                ? VIBE_COLORS[currentUser.vibeColor]
                : partnerColor;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-3 shadow-md relative ${
                      isMe
                        ? 'bg-gradient-to-tr from-[#8B5CF6] to-[#6366F1] text-white rounded-br-xs'
                        : 'bg-[#181827] border border-[#27273A] text-zinc-200 rounded-bl-xs'
                    }`}
                  >
                    {/* Audio Message */}
                    {msg.type === 'audio' && (
                      <div className="flex items-center gap-3 py-1">
                        <button
                          type="button"
                          onClick={() =>
                            setPlayingAudioId(playingAudioId === msg.id ? null : msg.id)
                          }
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                            isMe ? 'bg-white/20' : 'bg-[#F43F9E]'
                          }`}
                        >
                          {playingAudioId === msg.id ? (
                            <Pause className="w-4 h-4 fill-white" />
                          ) : (
                            <Play className="w-4 h-4 fill-white ml-0.5" />
                          )}
                        </button>
                        <div>
                          <div className="flex gap-0.5 h-4 items-center">
                            {[40, 70, 90, 50, 80, 100, 60, 40].map((h, i) => (
                              <span
                                key={i}
                                className={`w-1 rounded-full ${
                                  playingAudioId === msg.id ? 'bg-[#22D3EE] animate-pulse' : 'bg-white/50'
                                }`}
                                style={{ height: `${h}%` }}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] opacity-75 font-mono">0:14</span>
                        </div>
                      </div>
                    )}

                    {/* Photo Message */}
                    {msg.type === 'photo' && (
                      <div className="rounded-xl overflow-hidden mb-1.5 max-w-[200px]">
                        <img
                          src={msg.mediaUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80'}
                          alt="Foto efémera"
                          className="w-full h-32 object-cover"
                        />
                      </div>
                    )}

                    {/* Text content */}
                    {msg.content && msg.type !== 'audio' && (
                      <p className="text-sm font-normal leading-relaxed">
                        {msg.content}
                      </p>
                    )}

                    {/* Message footer timestamp + burn timer */}
                    <div className="flex items-center justify-end gap-1.5 mt-1 text-[9.5px] opacity-70">
                      <span>{formatTimeAgo(msg.createdAt)}</span>
                      <span>•</span>
                      <span className="font-mono">
                        🔥 {formatTimeRemaining(msg.expiresAt)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Message Input Form */}
        <form onSubmit={handleSend} className="p-3 bg-[#10101B] border-t border-[#1E1E2E] flex items-center gap-2">
          <button
            type="button"
            onClick={handleSendPhotoMock}
            className="p-2.5 rounded-xl bg-[#171726] border border-[#27273A] text-zinc-400 hover:text-white"
            title="Enviar Foto Efémera"
          >
            <ImageIcon className="w-4 h-4 text-[#22D3EE]" />
          </button>

          <button
            type="button"
            onClick={handleSendAudioMock}
            className="p-2.5 rounded-xl bg-[#171726] border border-[#27273A] text-zinc-400 hover:text-white"
            title="Gravar Áudio Efémero"
          >
            <Mic className="w-4 h-4 text-[#F43F9E]" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Mensagem temporária (apaga 1 min após saíres)..."
            className="flex-1 bg-[#171726] border border-[#27273A] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#8B5CF6]"
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8B5CF6] to-[#22D3EE] text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
      </div>
    );
  }

  // Conversation List View
  return (
    <div className="pb-24 pt-2 px-4 space-y-4">
      {/* List Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="font-extrabold text-base text-white tracking-wide font-['Outfit']">
            Conversas Efémeras
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Zero rasto: as mensagens são apagadas 1 min após saíres da conversa.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 font-medium">
          <Flame className="w-3 h-3 text-amber-400 animate-pulse" />
          <span>1 min após sair</span>
        </div>
      </div>

      {/* Security Architecture Guarantee Card */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#141422] to-[#10101B] border border-[#242438] flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#22D3EE]/10 border border-[#22D3EE]/30 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5 text-[#22D3EE]" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
            <span>Privacidade Zero Rasto no Chat</span>
            <span className="text-[10px] text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded font-mono">1 min TTL</span>
          </h4>
          <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
            Nenhuma mensagem é gravada permanentemente. Assim que qualquer utilizador sai da conversa, o motor Postgres purga todas as mensagens em 1 minuto.
          </p>
        </div>
      </div>

      {/* Conversations List */}
      <div className="space-y-2.5">
        {conversations.map((conv) => {
          const convColor = VIBE_COLORS[conv.participantVibeColor] || VIBE_COLORS.purple;
          const isPurging = !!purgingConversations[conv.id];
          return (
            <div
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className="p-3 rounded-2xl bg-[#11111A] border border-[#1E1E2C] hover:border-[#2C2C3E] transition-all cursor-pointer flex items-center gap-3 group active:scale-[0.99]"
            >
              {/* Avatar */}
              <div className={`relative w-12 h-12 rounded-full p-[2px] border ${convColor.borderClass} ${convColor.glowClass} shrink-0`}>
                <img
                  src={conv.participantAvatar}
                  alt={conv.participantName}
                  className="w-full h-full object-cover rounded-full"
                />
                {conv.isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#11111A]" />
                )}
              </div>

              {/* Chat Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-sm text-white truncate">
                    {conv.participantName}
                  </h4>
                  <span className="text-[10px] text-zinc-500">
                    {formatTimeAgo(conv.lastMessageTime)}
                  </span>
                </div>

                <p className="text-xs text-zinc-400 truncate group-hover:text-zinc-300">
                  {conv.lastMessage}
                </p>

                {/* Expiration status badge */}
                <div className="flex items-center gap-1.5 mt-1.5 text-[10px]">
                  {isPurging ? (
                    <span className="flex items-center gap-1 text-amber-400 font-medium">
                      <Flame className="w-3 h-3 animate-pulse" />
                      A autodestruir mensagens em 1 minuto...
                    </span>
                  ) : conv.messages.length === 0 ? (
                    <span className="text-zinc-500 font-mono">
                      Sem mensagens (destruídas)
                    </span>
                  ) : (
                    <span className="text-zinc-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#F43F9E]" />
                      Apaga 1 min após saíres
                    </span>
                  )}
                </div>
              </div>

              {/* Unread badge */}
              {conv.unreadCount > 0 && (
                <div className="w-5 h-5 rounded-full bg-[#F43F9E] text-white text-[10px] font-bold flex items-center justify-center shadow-[0_0_8px_#F43F9E]">
                  {conv.unreadCount}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
