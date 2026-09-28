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
            className="relative w-16 h-16 rounded-full group flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 bg-transparent"
            title="Publicar nova Vibe"
          >
            {/* Dashed Vibe Ring for Current User */}
            <svg 
              className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none transition-transform duration-700 group-hover:rotate-45"
              viewBox="0 0 64 64"
            >
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="2.5"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke={userColor.hex}
                strokeWidth="2.8"
                strokeDasharray="9.8 4.86"
                strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 5px ${userColor.hex}99)` }}
              />
            </svg>

            <div className="w-[49px] h-[49px] rounded-full overflow-hidden relative p-[1.5px] bg-[#08080D]">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                <div 
                  className="w-5 h-5 rounded-full flex items-center justify-center shadow-lg text-white"
                  style={{ backgroundColor: userColor.hex }}
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>
            </div>
          </button>
          <span className="text-[11px] font-medium text-zinc-300 max-w-[64px] truncate text-center">
            A tua Vibe
          </span>
        </div>

        {/* Stories from other users (Inês, Nika, Diogo, etc.) */}
        {stories
          .filter((s) => !s.isUser)
          .map((story) => {
            const storyColor = VIBE_COLORS[story.userVibeColor] || VIBE_COLORS.purple;
            return (
              <div key={story.userId} className="flex flex-col items-center gap-1.5">
                <button
                  onClick={() => onOpenStory(story)}
                  className="relative w-16 h-16 rounded-full group flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 bg-transparent"
                  title={`Ver vibe de ${story.userName}`}
                >
                  {/* Dashed Vibe Ring (Tracinhos coloridos ao redor do perfil) */}
                  <svg 
                    className={`absolute inset-0 w-full h-full -rotate-90 pointer-events-none transition-transform duration-700 ${
                      story.hasUnseen ? 'group-hover:rotate-45' : ''
                    }`}
                    viewBox="0 0 64 64"
                  >
                    {/* Background subtle ring track */}
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="2.5"
                    />
                    {/* Colorful dashed marks around the profile */}
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke={story.hasUnseen ? storyColor.hex : '#52525b'}
                      strokeWidth="2.8"
                      strokeDasharray="9.8 4.86"
                      strokeLinecap="round"
                      style={
                        story.hasUnseen
                          ? { filter: `drop-shadow(0 0 6px ${storyColor.hex}cc)` }
                          : undefined
                      }
                    />
                  </svg>

                  {/* Profile picture inside the dashed circle */}
                  <div className="w-[49px] h-[49px] rounded-full overflow-hidden p-[1.5px] bg-[#08080D]">
                    <img
                      src={story.userAvatar}
                      alt={story.userName}
                      className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform"
                    />
                  </div>

                  {story.location && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-[1px] bg-[#0A0A10] border border-white/20 rounded-full text-[8.5px] text-zinc-300 font-medium whitespace-nowrap shadow-sm z-10">
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
