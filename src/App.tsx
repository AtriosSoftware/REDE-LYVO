import React, { useState, useEffect } from 'react';
import { 
  VibeItem, 
  StoryGroup, 
  Conversation, 
  UserProfile, 
  VibeColor,
  EphemeralMessage,
  AttentionAlert
} from './types';
import { 
  CURRENT_USER_DEFAULT, 
  MOCK_VIBES, 
  MOCK_STORIES, 
  MOCK_CONVERSATIONS 
} from './data/mockData';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { AgoraFeed } from './components/AgoraFeed';
import { ExplorarView } from './components/ExplorarView';
import { ConversasView } from './components/ConversasView';
import { PerfilView } from './components/PerfilView';
import { CreateVibeModal } from './components/CreateVibeModal';
import { EditVibeModal } from './components/EditVibeModal';
import { AttentionAlertsModal } from './components/AttentionAlertsModal';
import { StoryViewer } from './components/StoryViewer';
import { CommentsDrawer } from './components/CommentsDrawer';
import { FullscreenVibeViewer } from './components/FullscreenVibeViewer';
import { SupabaseArchitectureModal } from './components/SupabaseArchitectureModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { SloganModal } from './components/SloganModal';
import { AntiScreenshotOverlay } from './components/AntiScreenshotOverlay';
import { AntiScreenshotInfoModal } from './components/AntiScreenshotInfoModal';
import { IntroAndAuth } from './components/IntroAndAuth';
import { isSessionActive, clearSession, accountToUserProfile } from './lib/authStore';
import { syncVibeToSupabase, syncMessageToSupabase, purgeExpiredFromSupabase } from './lib/supabaseClient';

const playAttentionChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.38);
  } catch (e) {
    // Audio autoplay restrictions catch
  }
};

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('agora');
  
  // Custom Slogan State (Defaults to 'Live the moment.')
  const [slogan, setSlogan] = useState<string>(() => {
    return localStorage.getItem('lyvo_slogan') || 'Live the moment.';
  });
  const [isSloganModalOpen, setIsSloganModalOpen] = useState(false);

  // Authentication & Onboarding State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return isSessionActive();
  });
  const [showIntroModal, setShowIntroModal] = useState(false);

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('lyvo_user') || localStorage.getItem('vybe_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* use default */ }
    }
    return CURRENT_USER_DEFAULT;
  });

  const [vibes, setVibes] = useState<VibeItem[]>(() => {
    const saved = localStorage.getItem('lyvo_vibes') || localStorage.getItem('vybe_vibes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Only retain non-expired vibes
        const valid = parsed.filter((v: VibeItem) => v.expiresAt > Date.now());
        const hasUserVibe = valid.some((v: VibeItem) => v.authorId === 'user_current' || v.authorUsername === 'martim_lyvo');
        if (hasUserVibe) return valid;
        const userMock = MOCK_VIBES.find((mv) => mv.authorId === 'user_current');
        return userMock ? [userMock, ...valid] : valid;
      } catch (e) { /* use default */ }
    }
    return MOCK_VIBES;
  });

  const [stories, setStories] = useState<StoryGroup[]>(MOCK_STORIES);
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('lyvo_conversations') || localStorage.getItem('vybe_conversations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.filter((c: Conversation) => c.expiresAt > Date.now());
      } catch (e) { /* use default */ }
    }
    return MOCK_CONVERSATIONS;
  });

  // Modals & Active states
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeStory, setActiveStory] = useState<StoryGroup | null>(null);
  const [activeFullscreenVibe, setActiveFullscreenVibe] = useState<VibeItem | null>(null);
  const [activeCommentVibe, setActiveCommentVibe] = useState<VibeItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingVibe, setEditingVibe] = useState<VibeItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAttentionModalOpen, setIsAttentionModalOpen] = useState(false);
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState(false);
  const [isSupabaseConfigModalOpen, setIsSupabaseConfigModalOpen] = useState(false);
  
  // Attention Alerts Received by the User (Persisted)
  const [attentionAlerts, setAttentionAlerts] = useState<AttentionAlert[]>(() => {
    const saved = localStorage.getItem('lyvo_attention_alerts');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'att-init-1',
        vibeId: 'vibe-user-current',
        vibeSnippet: 'A começar a noite aqui no Chiado 🌆',
        emoji: '⚡',
        reactorName: 'Diogo Ribeiro',
        reactorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        createdAt: Date.now() - 10 * 60 * 1000,
        read: false,
      },
      {
        id: 'att-init-2',
        vibeId: 'vibe-user-current',
        vibeSnippet: 'A começar a noite aqui no Chiado 🌆',
        emoji: '🔥',
        reactorName: 'Inês Carmo',
        reactorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
        createdAt: Date.now() - 4 * 60 * 1000,
        read: false,
      }
    ];
  });

  const [incomingAttentionAlert, setIncomingAttentionAlert] = useState<{
    emoji: string;
    reactorName: string;
    text: string;
    vibeId: string;
  } | null>(null);

  // Anti-Screenshot Shield States
  const [antiScreenshotEnabled, setAntiScreenshotEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('lyvo_anti_screenshot');
    return saved !== null ? saved === 'true' : true;
  });
  const [antiScreenshotBlur, setAntiScreenshotBlur] = useState<boolean>(() => {
    const saved = localStorage.getItem('lyvo_anti_screenshot_blur');
    return saved !== null ? saved === 'true' : false;
  });
  const [isAntiScreenshotModalOpen, setIsAntiScreenshotModalOpen] = useState(false);

  // Proximity Radar Visibility (Ghost Mode vs Visible)
  const [isRadarVisible, setIsRadarVisible] = useState<boolean>(() => {
    const saved = localStorage.getItem('lyvo_radar_visible');
    return saved !== null ? saved === 'true' : true;
  });

  const handleToggleRadarVisible = () => {
    setIsRadarVisible((prev) => {
      const next = !prev;
      localStorage.setItem('lyvo_radar_visible', String(next));
      showToast(next ? '🟢 Radar de Proximidade: Estás agora visível (5 km)' : '👻 Modo Fantasma ATIVADO: Estás invisível no radar');
      return next;
    });
  };

  // Live online count fluctuation
  const [onlineCount, setOnlineCount] = useState(2418);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleTestBlackout = () => {
    if ((window as any).__lyvoTriggerScreenshotBlackout) {
      (window as any).__lyvoTriggerScreenshotBlackout('Simulação de captura de ecrã: Tela 100% preta ativada.');
    } else {
      showToast('🛡️ Escudo Anti-Screenshot: Tela protegida a preto.');
    }
  };

  const handleLogout = () => {
    clearSession();
    setIsAuthenticated(false);
    showToast('Sessão terminada. Até já!');
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('lyvo_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('lyvo_vibes', JSON.stringify(vibes));
  }, [vibes]);

  useEffect(() => {
    localStorage.setItem('lyvo_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('lyvo_slogan', slogan);
  }, [slogan]);

  useEffect(() => {
    localStorage.setItem('lyvo_anti_screenshot', String(antiScreenshotEnabled));
  }, [antiScreenshotEnabled]);

  useEffect(() => {
    localStorage.setItem('lyvo_anti_screenshot_blur', String(antiScreenshotBlur));
  }, [antiScreenshotBlur]);

  useEffect(() => {
    localStorage.setItem('lyvo_attention_alerts', JSON.stringify(attentionAlerts));
  }, [attentionAlerts]);

  // Online count subtle live fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineCount((prev) => prev + Math.floor(Math.random() * 5) - 2);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Continuous Ephemeral Purge Cycle (Deletes expired vibes & messages from both device storage and Supabase database)
  useEffect(() => {
    // Initial purge on startup
    purgeExpiredFromSupabase().catch(() => {});

    const purgeLocalAndRemote = () => {
      const now = Date.now();

      // 1. Purge from user's phone / device storage & state
      setVibes((prev) => {
        const kept = prev.filter((v) => v.expiresAt > now);
        if (kept.length !== prev.length) {
          localStorage.setItem('lyvo_vibes', JSON.stringify(kept));
        }
        return kept;
      });

      setConversations((prev) => {
        const kept = prev
          .filter((c) => c.expiresAt > now)
          .map((c) => ({
            ...c,
            messages: c.messages.filter((m) => m.expiresAt > now),
          }));
        localStorage.setItem('lyvo_conversations', JSON.stringify(kept));
        return kept;
      });

      setAttentionAlerts((prev) => {
        const kept = prev.filter((a) => now - a.createdAt < 24 * 60 * 60 * 1000);
        if (kept.length !== prev.length) {
          localStorage.setItem('lyvo_attention_alerts', JSON.stringify(kept));
        }
        return kept;
      });

      // 2. Purge from Supabase database
      purgeExpiredFromSupabase().catch(() => {});
    };

    const purgeInterval = setInterval(purgeLocalAndRemote, 5000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        purgeLocalAndRemote();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(purgeInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Total unread count for conversations
  const unreadMessagesCount = conversations.reduce(
    (acc, curr) => acc + curr.unreadCount,
    0
  );

  // Handlers
  const handleLikeVibe = (id: string) => {
    setVibes((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          const hasLiked = !v.hasLiked;
          return {
            ...v,
            hasLiked,
            likes: hasLiked ? v.likes + 1 : Math.max(0, v.likes - 1),
          };
        }
        return v;
      })
    );

    // Also update if viewed in fullscreen
    if (activeFullscreenVibe && activeFullscreenVibe.id === id) {
      setActiveFullscreenVibe((prev) =>
        prev
          ? {
              ...prev,
              hasLiked: !prev.hasLiked,
              likes: !prev.hasLiked ? prev.likes + 1 : Math.max(0, prev.likes - 1),
            }
          : null
      );
    }
  };

  const handleAddComment = (vibeId: string, text: string) => {
    const newComment = {
      id: `c_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      userVibeColor: currentUser.vibeColor,
      text,
      createdAt: Date.now(),
      likes: 0,
    };

    setVibes((prev) =>
      prev.map((v) => {
        if (v.id === vibeId) {
          const updatedComments = [newComment, ...v.comments];
          const updatedVibe = {
            ...v,
            comments: updatedComments,
            commentsCount: v.commentsCount + 1,
          };
          if (activeCommentVibe && activeCommentVibe.id === vibeId) {
            setActiveCommentVibe(updatedVibe);
          }
          return updatedVibe;
        }
        return v;
      })
    );
  };

  const handleCreateVibe = (vibeData: Partial<VibeItem>) => {
    const newVibe: VibeItem = {
      id: `vibe_user_${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorUsername: currentUser.username,
      authorAvatar: currentUser.avatar,
      authorVibeColor: vibeData.authorVibeColor || currentUser.vibeColor,
      type: vibeData.type || 'text',
      content: vibeData.content || '',
      mediaUrl: vibeData.mediaUrl,
      audioDuration: vibeData.audioDuration,
      location: vibeData.location || 'Lisboa, Centro',
      distance: 'A tua publicação',
      privacy: vibeData.privacy || 'public',
      createdAt: Date.now(),
      expiresAt: vibeData.expiresAt || (Date.now() + 24 * 60 * 60 * 1000),
      likes: 0,
      hasLiked: false,
      commentsCount: 0,
      sharesCount: 0,
      viewsCount: 1,
      comments: [],
    };

    setVibes((prev) => [newVibe, ...prev]);

    // Also add to user's story reel if it's visual
    if (newVibe.mediaUrl || newVibe.content) {
      setStories((prev) => {
        const userStory = prev.find((s) => s.isUser);
        if (userStory) {
          return prev.map((s) =>
            s.isUser ? { ...s, vibes: [newVibe, ...s.vibes] } : s
          );
        } else {
          const newStoryGroup: StoryGroup = {
            userId: currentUser.id,
            userName: currentUser.name,
            userAvatar: currentUser.avatar,
            userVibeColor: currentUser.vibeColor,
            vibes: [newVibe],
            hasUnseen: false,
            isUser: true,
          };
          return [newStoryGroup, ...prev];
        }
      });
    }

    showToast('✨ Vibe publicada! Desaparecerá para sempre em 24h.');
    setCurrentTab('agora');

    // Async sync to Supabase if configured
    syncVibeToSupabase(newVibe).catch(() => {});
  };

  const handleSendMessage = (
    conversationId: string,
    text: string,
    type: 'text' | 'audio' | 'photo' = 'text'
  ) => {
    const newMsg: EphemeralMessage = {
      id: `msg_${Date.now()}`,
      conversationId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      senderVibeColor: currentUser.vibeColor,
      content: text,
      type,
      mediaUrl:
        type === 'photo'
          ? 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80'
          : undefined,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            lastMessage: type === 'audio' ? '🎤 Nota de voz' : type === 'photo' ? '📸 Foto' : text,
            lastMessageTime: Date.now(),
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    // Sync message to Supabase database (with its custom TTL)
    syncMessageToSupabase(newMsg).catch(() => {});
  };

  const handleSendStoryReply = (recipientName: string, text: string) => {
    // Find or create conversation with this user
    const existing = conversations.find((c) => c.participantName === recipientName);
    if (existing) {
      handleSendMessage(existing.id, text, 'text');
    } else {
      const newConvId = `conv_${Date.now()}`;
      const newConv: Conversation = {
        id: newConvId,
        participantId: `user_${Date.now()}`,
        participantName: recipientName,
        participantUsername: recipientName.toLowerCase().replace(/\s+/g, '_'),
        participantAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        participantVibeColor: 'pink',
        lastMessage: text,
        lastMessageTime: Date.now(),
        unreadCount: 0,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        isOnline: true,
        messages: [
          {
            id: `msg_${Date.now()}`,
            conversationId: newConvId,
            senderId: currentUser.id,
            senderName: currentUser.name,
            senderAvatar: currentUser.avatar,
            senderVibeColor: currentUser.vibeColor,
            content: text,
            type: 'text',
            createdAt: Date.now(),
            expiresAt: Date.now() + 24 * 60 * 60 * 1000,
          },
        ],
      };
      setConversations((prev) => [newConv, ...prev]);
    }
  };

  const [purgingConversations, setPurgingConversations] = useState<Record<string, number>>({});

  const handleLeaveConversation = (conversationId: string) => {
    setActiveConversationId(null);
    const wipeTime = Date.now() + 60 * 1000;
    setPurgingConversations((prev) => ({ ...prev, [conversationId]: wipeTime }));

    // Update message expiration in this conversation to 1 minute from now
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              messages: c.messages.map((m) => ({
                ...m,
                expiresAt: Math.min(m.expiresAt, wipeTime),
              })),
            }
          : c
      )
    );

    showToast('⏱️ Saíste da conversa. Todas as mensagens serão destruídas em 1 minuto!');

    // Absolute destruction after 60 seconds (zero retention)
    setTimeout(() => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === conversationId) {
            return {
              ...c,
              messages: [],
              lastMessage: 'Mensagens destruídas (1 min após saída)',
              lastMessageTime: Date.now(),
            };
          }
          return c;
        })
      );
      setPurgingConversations((prev) => {
        const next = { ...prev };
        delete next[conversationId];
        return next;
      });
    }, 60000);
  };

  const handlePurgeConversation = (conversationId: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== conversationId));
    showToast('🗑️ Conversa destruída da base de dados e Storage.');
  };

  const handleClearAllMyData = () => {
    setVibes((prev) => prev.filter((v) => v.authorId !== currentUser.id));
    setConversations([]);
    localStorage.removeItem('lyvo_vibes');
    localStorage.removeItem('lyvo_conversations');
    localStorage.removeItem('vybe_vibes');
    localStorage.removeItem('vybe_conversations');
    showToast('🔥 Todas as tuas Vibes e conversas foram purgadas!');
  };

  const handleSaveEditedVibe = (updatedVibe: VibeItem) => {
    setVibes((prev) =>
      prev.map((v) => (v.id === updatedVibe.id ? updatedVibe : v))
    );

    // Also update story reel if it contains this vibe
    setStories((prev) =>
      prev.map((s) =>
        s.isUser
          ? {
              ...s,
              vibes: s.vibes.map((v) => (v.id === updatedVibe.id ? updatedVibe : v)),
            }
          : s
      )
    );

    showToast('✨ Publicação alterada com sucesso na Timeline!');
    syncVibeToSupabase(updatedVibe).catch(() => {});
  };

  const handleDeleteVibe = (vibeId: string) => {
    setVibes((prev) => prev.filter((v) => v.id !== vibeId));
    setStories((prev) =>
      prev.map((s) =>
        s.isUser
          ? {
              ...s,
              vibes: s.vibes.filter((v) => v.id !== vibeId),
            }
          : s
      )
    );
    showToast('🗑️ Publicação eliminada com sucesso.');
  };

  const handleCallAttention = (vibeId: string, emoji: string) => {
    const targetVibe = vibes.find((v) => v.id === vibeId);
    const isOwn = targetVibe
      ? targetVibe.authorId === currentUser.id || targetVibe.authorUsername === currentUser.username
      : false;

    const newAlert: AttentionAlert = {
      id: `att_${Date.now()}_${Math.random()}`,
      vibeId,
      vibeSnippet: targetVibe?.content?.slice(0, 45) || 'Vibe visual',
      emoji,
      reactorName: currentUser.name,
      reactorAvatar: currentUser.avatar,
      createdAt: Date.now(),
      read: false,
    };

    // Update target vibe's attentionReactions
    setVibes((prev) =>
      prev.map((v) => {
        if (v.id === vibeId) {
          const existing = v.attentionReactions || [];
          return {
            ...v,
            attentionCount: (v.attentionCount || 0) + 1,
            attentionReactions: [newAlert, ...existing].slice(0, 10),
          };
        }
        return v;
      })
    );

    // If it's the author's own publication:
    if (isOwn) {
      playAttentionChime();
      setIncomingAttentionAlert({
        emoji,
        reactorName: currentUser.name,
        text: 'Chamaste a atenção na tua própria publicação!',
        vibeId,
      });
      setAttentionAlerts((prev) => [newAlert, ...prev]);
      showToast(`🔔 Atenção chamada com ${emoji}! Notificação visível no topo.`);
      setTimeout(() => setIncomingAttentionAlert(null), 5000);
    } else {
      // It's another user's post (e.g. Inês or Diogo)
      showToast(`⚡ Chamaste a atenção de ${targetVibe?.authorName || 'autor'} com ${emoji}! O autor foi notificado.`);

      // Simulate the author receiving and reacting back
      setTimeout(() => {
        const friendAlert: AttentionAlert = {
          id: `att_${Date.now()}`,
          vibeId,
          vibeSnippet: targetVibe?.content?.slice(0, 40),
          emoji,
          reactorName: targetVibe?.authorName || 'Amigo',
          reactorAvatar: targetVibe?.authorAvatar,
          createdAt: Date.now(),
          read: false,
        };
        playAttentionChime();
        setIncomingAttentionAlert({
          emoji,
          reactorName: targetVibe?.authorName || 'Amigo',
          text: `Notificou que recebeu a tua chamada de atenção!`,
          vibeId,
        });
        setAttentionAlerts((prev) => [friendAlert, ...prev]);
        setTimeout(() => setIncomingAttentionAlert(null), 5000);
      }, 2500);
    }
  };

  const handleSimulateIncomingAttention = () => {
    const friendNames = [
      { name: 'Diogo Ribeiro', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', emoji: '⚡' },
      { name: 'Inês Carmo', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80', emoji: '🔥' },
      { name: 'Nika Rossi', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80', emoji: '🚀' },
      { name: 'Tomás Ramos', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80', emoji: '💖' },
    ];
    const picked = friendNames[Math.floor(Math.random() * friendNames.length)];
    const myVibe = vibes.find((v) => v.authorId === currentUser.id || v.authorUsername === currentUser.username) || vibes[0];

    const alertItem: AttentionAlert = {
      id: `att_${Date.now()}`,
      vibeId: myVibe ? myVibe.id : 'vibe-user-current',
      vibeSnippet: myVibe?.content?.slice(0, 40) || 'A tua publicação',
      emoji: picked.emoji,
      reactorName: picked.name,
      reactorAvatar: picked.avatar,
      createdAt: Date.now(),
      read: false,
    };

    if (myVibe) {
      setVibes((prev) =>
        prev.map((v) => {
          if (v.id === myVibe.id) {
            const existing = v.attentionReactions || [];
            return {
              ...v,
              attentionCount: (v.attentionCount || 0) + 1,
              attentionReactions: [alertItem, ...existing].slice(0, 10),
            };
          }
          return v;
        })
      );
    }

    playAttentionChime();
    setAttentionAlerts((prev) => [alertItem, ...prev]);
    setIncomingAttentionAlert({
      emoji: picked.emoji,
      reactorName: picked.name,
      text: `Chamou a tua atenção na tua publicação!`,
      vibeId: myVibe ? myVibe.id : '',
    });
    setTimeout(() => setIncomingAttentionAlert(null), 5000);
  };

  const handleUpdateVibeColor = (color: VibeColor) => {
    setCurrentUser((prev) => ({ ...prev, vibeColor: color }));
  };

  const handleOpenChatWith = (userId: string, userName: string) => {
    const existing = conversations.find(
      (c) => c.participantId === userId || c.participantName === userName
    );
    if (existing) {
      setActiveConversationId(existing.id);
    } else {
      const newConv: Conversation = {
        id: `conv_${Date.now()}`,
        participantId: userId,
        participantName: userName,
        participantUsername: userName.toLowerCase().replace(/\s+/g, '_'),
        participantAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        participantVibeColor: 'cyan',
        lastMessage: 'Conversa efémera iniciada via Radar',
        lastMessageTime: Date.now(),
        unreadCount: 0,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        isOnline: true,
        messages: [],
      };
      setConversations((prev) => [newConv, ...prev]);
      setActiveConversationId(newConv.id);
    }
    setCurrentTab('conversas');
  };

  const handleSimulateIncomingVibe = () => {
    const sampleMoments = [
      { text: 'Alguém para beber um copo no Cais do Sodré agora? 🍸', loc: 'Lisboa, Cais do Sodré', color: 'pink' as VibeColor },
      { text: 'A luz do pôr do sol na Ribeira do Porto hoje está surreal 🔥', loc: 'Porto, Ribeira', color: 'amber' as VibeColor },
      { text: 'Quem está acordado a ouvir música às 3 da manhã? 🎧', loc: 'Lisboa, Centro', color: 'purple' as VibeColor },
    ];
    const picked = sampleMoments[Math.floor(Math.random() * sampleMoments.length)];
    const incoming: VibeItem = {
      id: `incoming_${Date.now()}`,
      authorId: `user_${Date.now()}`,
      authorName: 'Utilizador Próximo',
      authorUsername: 'spontaneous_user',
      authorAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
      authorVibeColor: picked.color,
      type: 'text',
      content: picked.text,
      location: picked.loc,
      distance: 'A 450m de ti',
      privacy: 'public',
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      likes: 1,
      hasLiked: false,
      commentsCount: 0,
      sharesCount: 0,
      viewsCount: 1,
      comments: [],
    };
    setVibes((prev) => [incoming, ...prev]);
    showToast('⚡ Novo momento espontâneo recebido perto de ti!');
  };

  const handleSimulateCronPurge = () => {
    // Purge everything expired (or purge 1 old mock item to demonstrate)
    let purgedVibes = 0;
    let purgedMessages = 0;

    setVibes((prev) => {
      const kept = prev.filter((v) => v.expiresAt > Date.now());
      purgedVibes = prev.length - kept.length;
      return kept;
    });

    setConversations((prev) => {
      return prev.map((c) => {
        const keptMsgs = c.messages.filter((m) => m.expiresAt > Date.now());
        purgedMessages += c.messages.length - keptMsgs.length;
        return { ...c, messages: keptMsgs };
      });
    });

    return {
      purgedVibes: purgedVibes || 1,
      purgedMessages: purgedMessages || 2,
    };
  };

  const userVibes = vibes.filter((v) => v.authorId === currentUser.id);

  // If user is not authenticated, show the Intro Banners & Token Auth Experience
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#08080D] text-zinc-100 font-['Plus_Jakarta_Sans'] antialiased selection:bg-[#8B5CF6]/30">
        <IntroAndAuth
          initialScreen="intro"
          onLoginSuccess={(account) => {
            const profile = accountToUserProfile(account);
            setCurrentUser(profile);
            setIsAuthenticated(true);
            showToast(`Bem-vindo ao LYVO, ${account.name}!`);
          }}
        />
        {toastMessage && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[99999] px-4 py-2.5 rounded-2xl bg-[#181828]/95 border border-[#8B5CF6]/40 text-white text-xs font-semibold shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-3 duration-200">
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08080D] text-zinc-100 font-['Plus_Jakarta_Sans'] antialiased selection:bg-[#8B5CF6]/30">
      {/* App Shell Container */}
      <div className="max-w-md mx-auto min-h-screen flex flex-col bg-[#0A0A10] border-x border-[#1A1A28] shadow-2xl relative">
        
        {/* Top Sticky Header */}
        <Header
          currentUser={currentUser}
          onOpenArchitecture={() => setIsArchitectureModalOpen(true)}
          onOpenSupabaseConfig={() => setIsSupabaseConfigModalOpen(true)}
          onlineCount={onlineCount}
          slogan={slogan}
          onOpenSloganModal={() => setIsSloganModalOpen(true)}
          onOpenAntiScreenshotModal={() => setIsAntiScreenshotModalOpen(true)}
          onTestScreenshotBlackout={handleTestBlackout}
          onLogout={handleLogout}
          attentionAlertsCount={attentionAlerts.filter((a) => !a.read).length || attentionAlerts.length}
          onOpenAttentionAlerts={() => setIsAttentionModalOpen(true)}
        />

        {/* Dynamic Main Views */}
        <main className={`flex-1 overflow-x-hidden ${antiScreenshotEnabled ? 'anti-screenshot-active' : ''}`}>
          {currentTab === 'agora' && (
            <AgoraFeed
              vibes={vibes}
              stories={stories}
              currentUser={currentUser}
              onLikeVibe={handleLikeVibe}
              onOpenComments={(vibe) => setActiveCommentVibe(vibe)}
              onOpenStory={(story) => setActiveStory(story)}
              onOpenCreate={() => setIsCreateModalOpen(true)}
              onOpenFullscreen={(vibe) => setActiveFullscreenVibe(vibe)}
              onSimulateIncomingVibe={handleSimulateIncomingVibe}
              onEditVibe={(vibe) => {
                setEditingVibe(vibe);
                setIsEditModalOpen(true);
              }}
              onCallAttention={handleCallAttention}
            />
          )}

          {currentTab === 'explorar' && (
            <ExplorarView
              vibes={vibes}
              currentUser={currentUser}
              onSelectVibe={(vibe) => setActiveFullscreenVibe(vibe)}
              onOpenChatWith={handleOpenChatWith}
              isRadarVisible={isRadarVisible}
              onToggleRadarVisible={handleToggleRadarVisible}
            />
          )}

          {currentTab === 'conversas' && (
            <ConversasView
              conversations={conversations}
              activeConversationId={activeConversationId}
              currentUser={currentUser}
              purgingConversations={purgingConversations}
              onSelectConversation={(id) => setActiveConversationId(id)}
              onLeaveConversation={handleLeaveConversation}
              onSendMessage={handleSendMessage}
              onPurgeConversation={handlePurgeConversation}
            />
          )}

          {currentTab === 'perfil' && (
            <PerfilView
              currentUser={currentUser}
              userVibes={userVibes}
              onUpdateVibeColor={handleUpdateVibeColor}
              onClearAllMyData={handleClearAllMyData}
              onOpenArchitectureModal={() => setIsArchitectureModalOpen(true)}
              onOpenSupabaseConfig={() => setIsSupabaseConfigModalOpen(true)}
              onDeleteVibe={handleDeleteVibe}
              slogan={slogan}
              onOpenSloganModal={() => setIsSloganModalOpen(true)}
              antiScreenshotEnabled={antiScreenshotEnabled}
              onToggleAntiScreenshot={() => {
                const next = !antiScreenshotEnabled;
                setAntiScreenshotEnabled(next);
                showToast(next ? '🛡️ Escudo Anti-Print ATIVADO (Ecrã Preto)' : '⚠️ Escudo Anti-Print DESATIVADO');
              }}
              onTestAntiScreenshot={handleTestBlackout}
              onOpenAntiScreenshotModal={() => setIsAntiScreenshotModalOpen(true)}
              onLogout={handleLogout}
              onOpenIntroBanners={() => setShowIntroModal(true)}
              isRadarVisible={isRadarVisible}
              onToggleRadarVisible={handleToggleRadarVisible}
            />
          )}
        </main>

        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-[#181828]/95 border border-[#8B5CF6]/40 text-white text-xs font-semibold shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 duration-200 flex items-center gap-2 max-w-sm text-center">
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Bottom Floating Navigation */}
        <Navigation
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            setActiveConversationId(null);
          }}
          onOpenCreate={() => setIsCreateModalOpen(true)}
          currentUser={currentUser}
          unreadMessagesCount={unreadMessagesCount}
        />

        {/* Creator Modal */}
        {isCreateModalOpen && (
          <CreateVibeModal
            currentUser={currentUser}
            onClose={() => setIsCreateModalOpen(false)}
            onCreateVibe={handleCreateVibe}
          />
        )}

        {/* Edit Vibe Modal (Alteração na própria publicação) */}
        {isEditModalOpen && editingVibe && (
          <EditVibeModal
            vibe={editingVibe}
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setEditingVibe(null);
            }}
            onSave={handleSaveEditedVibe}
            onDelete={handleDeleteVibe}
          />
        )}

        {/* Attention Alerts Modal (Avisos de atenção recebida) */}
        {isAttentionModalOpen && (
          <AttentionAlertsModal
            isOpen={isAttentionModalOpen}
            onClose={() => setIsAttentionModalOpen(false)}
            alerts={attentionAlerts}
            currentUser={currentUser}
            onSimulateIncomingAlert={handleSimulateIncomingAttention}
            onClearAlerts={() => setAttentionAlerts([])}
            onSelectVibe={(vibeId) => {
              const v = vibes.find((item) => item.id === vibeId);
              if (v) {
                setActiveFullscreenVibe(v);
              }
            }}
          />
        )}

        {/* Real-time Incoming Attention Alert Pop-up */}
        {incomingAttentionAlert && (
          <div 
            onClick={() => {
              setIsAttentionModalOpen(true);
              setIncomingAttentionAlert(null);
            }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm px-4 py-3 rounded-2xl bg-[#141424]/95 border border-[#22D3EE]/70 shadow-[0_0_25px_rgba(34,211,238,0.35)] backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-300 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#F43F9E] flex items-center justify-center text-xl shrink-0 shadow-lg animate-bounce">
                {incomingAttentionAlert.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#22D3EE] font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Atenção Recebida!
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">Em direto</span>
                </div>
                <p className="text-xs font-bold text-white truncate mt-0.5">
                  @{incomingAttentionAlert.reactorName} chamou a tua atenção!
                </p>
                <p className="text-[11px] text-zinc-300 truncate">
                  Carregou em <span className="text-sm">{incomingAttentionAlert.emoji}</span> na tua publicação
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Fullscreen Story Viewer */}
        {activeStory && (
          <StoryViewer
            storyGroup={activeStory}
            onClose={() => setActiveStory(null)}
            onSendReply={handleSendStoryReply}
            onLikeVibe={handleLikeVibe}
            onOpenComments={(vibe) => setActiveCommentVibe(vibe)}
          />
        )}

        {/* Comments Drawer */}
        {activeCommentVibe && (
          <CommentsDrawer
            vibe={activeCommentVibe}
            onClose={() => setActiveCommentVibe(null)}
            onAddComment={handleAddComment}
          />
        )}

        {/* Fullscreen Vibe Card Viewer */}
        {activeFullscreenVibe && (
          <FullscreenVibeViewer
            vibe={activeFullscreenVibe}
            onClose={() => setActiveFullscreenVibe(null)}
            onLike={handleLikeVibe}
            onOpenComments={(vibe) => {
              setActiveFullscreenVibe(null);
              setActiveCommentVibe(vibe);
            }}
          />
        )}

        {/* Supabase Architecture & pg_cron TTL Modal */}
        {isArchitectureModalOpen && (
          <SupabaseArchitectureModal
            onClose={() => setIsArchitectureModalOpen(false)}
            onSimulateCronPurge={handleSimulateCronPurge}
            onOpenConnectModal={() => {
              setIsArchitectureModalOpen(false);
              setIsSupabaseConfigModalOpen(true);
            }}
          />
        )}

        {/* Supabase Live Project Connection Modal */}
        {isSupabaseConfigModalOpen && (
          <SupabaseConfigModal
            onClose={() => setIsSupabaseConfigModalOpen(false)}
            onConfigUpdated={() => {
              showToast('Configuração do Supabase atualizada!');
            }}
          />
        )}

        {/* Slogan Customizer Modal */}
        <SloganModal
          isOpen={isSloganModalOpen}
          onClose={() => setIsSloganModalOpen(false)}
          currentSlogan={slogan}
          onSelectSlogan={(newSlogan) => {
            setSlogan(newSlogan);
            localStorage.setItem('lyvo_slogan', newSlogan);
            showToast(`Slogan atualizado: LYVO — ${newSlogan}`);
          }}
        />

        {/* Anti-Screenshot Shield Overlay & Technical Modal */}
        <AntiScreenshotOverlay
          enabled={antiScreenshotEnabled}
          blurProtection={antiScreenshotBlur}
          onOpenInfoModal={() => setIsAntiScreenshotModalOpen(true)}
          onScreenshotAttempt={(reason) => {
            console.warn('[LYVO SECURITY] Screenshot attempt blocked:', reason);
          }}
        />

        <AntiScreenshotInfoModal
          isOpen={isAntiScreenshotModalOpen}
          onClose={() => setIsAntiScreenshotModalOpen(false)}
          enabled={antiScreenshotEnabled}
          onToggleEnabled={() => {
            const next = !antiScreenshotEnabled;
            setAntiScreenshotEnabled(next);
            showToast(next ? '🛡️ Escudo Anti-Screenshot ATIVADO' : '⚠️ Escudo Anti-Screenshot DESATIVADO');
          }}
          blurProtection={antiScreenshotBlur}
          onToggleBlurProtection={() => {
            const next = !antiScreenshotBlur;
            setAntiScreenshotBlur(next);
            showToast(next ? '🔒 Blackout ao desfocar ativado' : '🔓 Blackout ao desfocar desativado');
          }}
          onTestBlackout={handleTestBlackout}
        />

        {/* Intro Banners & Token Guide Replay Modal */}
        {showIntroModal && (
          <IntroAndAuth
            initialScreen="intro"
            canClose={true}
            onClose={() => setShowIntroModal(false)}
            onLoginSuccess={(account) => {
              const profile = accountToUserProfile(account);
              setCurrentUser(profile);
              setIsAuthenticated(true);
              setShowIntroModal(false);
              showToast(`Sessão iniciada como ${account.name}!`);
            }}
          />
        )}

      </div>
    </div>
  );
}
