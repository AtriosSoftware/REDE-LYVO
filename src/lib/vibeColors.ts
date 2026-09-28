import { VibeColor } from '../types';

export interface VibeColorConfig {
  name: string;
  hex: string;
  borderClass: string;
  glowClass: string;
  bgClass: string;
  textClass: string;
  gradient: string;
  badgeBg: string;
}

export const VIBE_COLORS: Record<VibeColor, VibeColorConfig> = {
  purple: {
    name: 'Electric Purple',
    hex: '#8B5CF6',
    borderClass: 'border-[#8B5CF6]',
    glowClass: 'shadow-[0_0_15px_rgba(139,92,246,0.35)]',
    bgClass: 'bg-[#8B5CF6]',
    textClass: 'text-[#A78BFA]',
    gradient: 'from-[#8B5CF6] to-[#6366F1]',
    badgeBg: 'bg-[#8B5CF6]/15 text-[#C4B5FD] border-[#8B5CF6]/30',
  },
  cyan: {
    name: 'Cyber Blue',
    hex: '#22D3EE',
    borderClass: 'border-[#22D3EE]',
    glowClass: 'shadow-[0_0_15px_rgba(34,211,238,0.35)]',
    bgClass: 'bg-[#22D3EE]',
    textClass: 'text-[#38BDF8]',
    gradient: 'from-[#22D3EE] to-[#0284C7]',
    badgeBg: 'bg-[#22D3EE]/15 text-[#7DD3FC] border-[#22D3EE]/30',
  },
  pink: {
    name: 'Neon Pink',
    hex: '#F43F9E',
    borderClass: 'border-[#F43F9E]',
    glowClass: 'shadow-[0_0_15px_rgba(244,63,158,0.35)]',
    bgClass: 'bg-[#F43F9E]',
    textClass: 'text-[#F472B6]',
    gradient: 'from-[#F43F9E] to-[#DB2777]',
    badgeBg: 'bg-[#F43F9E]/15 text-[#F9A8D4] border-[#F43F9E]/30',
  },
  emerald: {
    name: 'Acid Green',
    hex: '#10B981',
    borderClass: 'border-[#10B981]',
    glowClass: 'shadow-[0_0_15px_rgba(16,185,129,0.35)]',
    bgClass: 'bg-[#10B981]',
    textClass: 'text-[#34D399]',
    gradient: 'from-[#10B981] to-[#059669]',
    badgeBg: 'bg-[#10B981]/15 text-[#6EE7B7] border-[#10B981]/30',
  },
  amber: {
    name: 'Solar Orange',
    hex: '#F97316',
    borderClass: 'border-[#F97316]',
    glowClass: 'shadow-[0_0_15px_rgba(249,115,22,0.35)]',
    bgClass: 'bg-[#F97316]',
    textClass: 'text-[#FB923C]',
    gradient: 'from-[#F97316] to-[#EA580C]',
    badgeBg: 'bg-[#F97316]/15 text-[#FDBA74] border-[#F97316]/30',
  },
  rose: {
    name: 'Pulse Crimson',
    hex: '#F43F5E',
    borderClass: 'border-[#F43F5E]',
    glowClass: 'shadow-[0_0_15px_rgba(244,63,94,0.35)]',
    bgClass: 'bg-[#F43F5E]',
    textClass: 'text-[#FB7185]',
    gradient: 'from-[#F43F5E] to-[#E11D48]',
    badgeBg: 'bg-[#F43F5E]/15 text-[#FDA4AF] border-[#F43F5E]/30',
  },
};

export function formatTimeRemaining(expiresAt: number): string {
  const diff = expiresAt - Date.now();
  if (diff <= 0) return 'Expirado';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return `${minutes}m ${seconds}s`;
}

export function formatTimeAgo(createdAt: number): string {
  const diff = Date.now() - createdAt;
  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes < 1) return 'Agora mesmo';
  if (minutes < 60) return `há ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `há ${hours}h`;
}
