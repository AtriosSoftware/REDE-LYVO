import React, { useState } from 'react';
import { X, Heart, Send, ShieldAlert, Sparkles } from 'lucide-react';
import { VibeItem, Comment } from '../types';
import { VIBE_COLORS, formatTimeAgo } from '../lib/vibeColors';

interface CommentsDrawerProps {
  vibe: VibeItem | null;
  onClose: () => void;
  onAddComment: (vibeId: string, text: string) => void;
}

export const CommentsDrawer: React.FC<CommentsDrawerProps> = ({
  vibe,
  onClose,
  onAddComment,
}) => {
  const [commentText, setCommentText] = useState('');

  if (!vibe) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(vibe.id, commentText);
    setCommentText('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-[#0F0F17] border border-[#222234] rounded-t-3xl sm:rounded-3xl max-h-[85vh] h-[550px] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#1E1E2C] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 rounded-full bg-[#8B5CF6]" />
            <h3 className="font-bold text-base text-white">
              {vibe.commentsCount} Respostas
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono">
              Efémeras
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1A1A28] text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Ephemeral Notice Banner */}
        <div className="px-4 py-2 bg-[#141422] border-b border-[#1F1F30] flex items-center gap-2 text-[11px] text-zinc-400">
          <ShieldAlert className="w-3.5 h-3.5 text-[#22D3EE] shrink-0" />
          <span>Comentários públicos sem histórico. Expiram junto com esta Vibe.</span>
        </div>

        {/* Comments Scrollable List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {vibe.comments.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500">
              <Sparkles className="w-8 h-8 text-[#8B5CF6]/50 mb-2" />
              <p className="text-sm font-medium text-zinc-400">Sê a primeira pessoa a responder!</p>
              <p className="text-xs text-zinc-500 mt-1">
                Comenta o momento antes que ele desapareça.
              </p>
            </div>
          ) : (
            vibe.comments.map((comment) => {
              const commentColor = VIBE_COLORS[comment.userVibeColor] || VIBE_COLORS.purple;
              return (
                <div key={comment.id} className="flex items-start gap-3 group">
                  <div className={`w-8 h-8 rounded-full p-[1.5px] border ${commentColor.borderClass} shrink-0`}>
                    <img
                      src={comment.userAvatar}
                      alt={comment.userName}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-zinc-200">
                        {comment.userName}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        {formatTimeAgo(comment.createdAt)}
                      </span>
                    </div>

                    <p className="text-[13px] text-zinc-300 mt-0.5 leading-relaxed">
                      {comment.text}
                    </p>

                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-zinc-500">
                      <button className="hover:text-white transition-colors">
                        Responder
                      </button>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3 text-zinc-500" />
                        {comment.likes}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Input Field */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-[#1F1F30] bg-[#0C0C14] flex items-center gap-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Escreve uma resposta espontânea..."
            className="flex-1 bg-[#171724] border border-[#28283C] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#8B5CF6]"
          />
          <button
            type="submit"
            disabled={!commentText.trim()}
            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8B5CF6] to-[#22D3EE] text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>

      </div>
    </div>
  );
};
