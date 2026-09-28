import React from 'react';
import { Plus } from 'lucide-react';
import { StoryGroup, UserProfile } from '../types';
import { VIBE_COLORS } from '../lib/vibeColors';

interface StoryReelProps {
  stories: StoryGroup[];
  currentUser: UserProfile;
  onOpenStory: (story: StoryGroup) => void;
  onAddNewStory: () => void;
}

export const StoryReel: React.FC<StoryReelProps> = ({
  stories,
  currentUser,
  onOpenStory,
  onAddNewStory,
}) => {
  const userColor = VIBE_COLORS[currentUser.vibeColor];

  return (
    <div className="w-full py-3 overflow-x-auto no-scrollbar scroll-smooth">
      <div className="flex items-center gap-3.5 px-4 min-w-max">
        {/* Current User: Add Story Button */}
        <div className="flex flex-col items-center gap-1.5">
          <button
            onClick={onAddNewStory}
            className="relative w-15 h-15 rounded-full p-[2px] border border-dashed border-[#8B5CF6]/50 hover:border-[#8B5CF6] transition-all group flex items-center justify-center bg-[#11111A]"
          >
            <div className="w-full h-full rounded-full overflow-hidden relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#22D3EE] flex items-center justify-center shadow-lg text-white">
                  <Plus className="w-4 h-4 stroke-[3]" />
                </div>
              </div>
            </div>
          </button>
          <span className="text-[11px] font-medium text-zinc-300 max-w-[64px] truncate text-center">
            A tua Vibe
          </span>
        </div>

        {/* Stories from other users */}
        {stories
          .filter((s) => !s.isUser)
          .map((story) => {
            const storyColor = VIBE_COLORS[story.userVibeColor] || VIBE_COLORS.purple;
            return (
              <div key={story.userId} className="flex flex-col items-center gap-1.5">
                <button
                  onClick={() => onOpenStory(story)}
                  className={`relative w-15 h-15 rounded-full p-[2.5px] transition-all transform hover:scale-105 active:scale-95 ${
                    story.hasUnseen
                      ? `bg-gradient-to-tr ${storyColor.gradient} shadow-[0_0_12px_rgba(139,92,246,0.3)]`
                      : 'bg-zinc-700'
                  }`}
                >
                  <div className="w-full h-full rounded-full p-[2px] bg-[#08080D]">
                    <img
                      src={story.userAvatar}
                      alt={story.userName}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  {story.location && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-[1px] bg-[#0A0A10] border border-white/20 rounded-full text-[8.5px] text-zinc-300 font-medium whitespace-nowrap shadow-sm">
                      {story.location.split(',')[0]}
                    </span>
                  )}
                </button>
                <span className="text-[11px] font-medium text-zinc-300 max-w-[64px] truncate text-center">
                  {story.userName}
                </span>
              </div>
            );
          })}
      </div>
    </div>
  );
};
