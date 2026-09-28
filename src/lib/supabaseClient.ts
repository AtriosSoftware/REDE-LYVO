import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { RegisteredAccount, VibeItem, EphemeralMessage, Conversation, VibeColor } from '../types';

// Complete SQL Schema definition for Supabase with automated Ephemeral TTL purge
export const COMPLETE_SUPABASE_SCHEMA_SQL = `-- ==============================================================================
-- 🚀 LYVO - QUERY MESTRE PARA O SUPABASE (SQL EDITOR)
-- Arquitetura de Privacidade Máxima, Zero Retenção e Recuperação por Token
-- Copie e cole este script completo no SQL Editor do seu projeto Supabase e clique em RUN!
-- ==============================================================================

-- 0. EXTENSÕES NECESSÁRIAS (UUID e PG_CRON para purga automática)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
DO $$ 
BEGIN 
    BEGIN
        CREATE EXTENSION IF NOT EXISTS pg_cron;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'pg_cron não pôde ser ativado via script SQL direto. Pode ativá-lo no painel Supabase (Database -> Extensions).';
    END;
END $$;

-- ==============================================================================
-- 1. TABELA DE UTILIZADORES E RECUPERAÇÃO DE CONTA (TOKEN DE 4 DÍGITOS)
-- Salva o perfil e o token para o utilizador restaurar a conta caso perca o telemóvel
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    token VARCHAR(12) NOT NULL, -- Código/PIN de recuperação (ex: '1234', '5678')
    avatar_url TEXT,
    bio TEXT DEFAULT 'Live the moment. No LYVO.',
    vibe_color TEXT DEFAULT 'purple',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migrações seguras caso a tabela já existisse
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS token VARCHAR(12);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT 'Live the moment. No LYVO.';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS vibe_color TEXT DEFAULT 'purple';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ DEFAULT NOW();

-- Índices de alta performance para restauração rápida de conta
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(lower(username));
CREATE INDEX IF NOT EXISTS idx_users_token ON public.users(token);

-- ==============================================================================
-- 2. TABELA DE VIBES (Fotos, Vídeos, Áudios, Texto com TTL Personalizado)
-- Tempo de vida escolhido pelo utilizador: 30 min, 1h, 3h, 15h, 17h até 24h
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.vibes (
    id TEXT PRIMARY KEY,
    author_id TEXT,
    author_name TEXT,
    author_username TEXT,
    author_avatar TEXT,
    author_vibe_color TEXT DEFAULT 'purple',
    type TEXT NOT NULL DEFAULT 'photo',
    content TEXT,
    media_url TEXT, -- URL da foto, vídeo ou gravação áudio
    audio_duration INT DEFAULT 0,
    location TEXT DEFAULT 'Lisboa, Centro',
    distance TEXT DEFAULT 'Perto de ti',
    privacy TEXT DEFAULT 'public',
    duration_hours NUMERIC(5, 2) NOT NULL DEFAULT 24, -- Suporta 0.5 (30min), 1, 3, 15, 17, 24h
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'), -- Momento exato da destruição programada
    likes INT DEFAULT 0,
    shares_count INT DEFAULT 0,
    views_count INT DEFAULT 0,
    edited_at TIMESTAMPTZ,
    attention_reactions JSONB DEFAULT '[]'::jsonb
);

-- Garante que todas as colunas existem mesmo se a tabela foi criada anteriormente sem elas
ALTER TABLE public.vibes ADD COLUMN IF NOT EXISTS author_id TEXT;
ALTER TABLE public.vibes ADD COLUMN IF NOT EXISTS author_name TEXT;
ALTER TABLE public.vibes ADD COLUMN IF NOT EXISTS author_username TEXT;
ALTER TABLE public.vibes ADD COLUMN IF NOT EXISTS author_avatar TEXT;
ALTER TABLE public.vibes ADD COLUMN IF NOT EXISTS author_vibe_color TEXT DEFAULT 'purple';
ALTER TABLE public.vibes ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'photo';
ALTER TABLE public.vibes ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE public.vibes ADD COLUMN IF NOT EXISTS media_url TEXT;
ALTER TABLE public.vibes ADD COLUMN IF NOT EXISTS audio_duration INT DEFAULT 0;
ALTER TABLE public.vibes ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'Lisboa, Centro';
ALTER TABLE public.vibes ADD COLUMN IF NOT EXISTS distance TEXT DEFAULT 'Perto de ti';
ALTER TABLE public.vibes ADD COLUMN IF NOT EXISTS privacy TEXT DEFAULT 'public';
ALTER TABLE public.vibes ADD COLUMN IF NOT EXISTS duration_hours NUMERIC(5, 2) DEFAULT 24;
ALTER TABLE public.vibes ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.vibes ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours');
ALTER TABLE public.vibes ADD COLUMN IF NOT EXISTS likes INT DEFAULT 0;
ALTER TABLE public.vibes ADD COLUMN IF NOT EXISTS shares_count INT DEFAULT 0;
ALTER TABLE public.vibes ADD COLUMN IF NOT EXISTS views_count INT DEFAULT 0;
ALTER TABLE public.vibes ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ;
ALTER TABLE public.vibes ADD COLUMN IF NOT EXISTS attention_reactions JSONB DEFAULT '[]'::jsonb;

-- Preenche expires_at para linhas antigas nulas
UPDATE public.vibes SET expires_at = NOW() + INTERVAL '24 hours' WHERE expires_at IS NULL;

-- Índices críticos para rápida eliminação de registos expirados e busca por autor
CREATE INDEX IF NOT EXISTS idx_vibes_expires_at ON public.vibes(expires_at);
CREATE INDEX IF NOT EXISTS idx_vibes_author ON public.vibes(author_username);

-- Trigger de segurança: se expires_at não for fornecido, calcula automaticamente pelo duration_hours
CREATE OR REPLACE FUNCTION public.calculate_vibe_expiration()
RETURNS trigger AS $$
BEGIN
    IF NEW.expires_at IS NULL THEN
        NEW.expires_at := NEW.created_at + ((COALESCE(NEW.duration_hours, 24)) || ' hours')::interval;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_calculate_vibe_expiration ON public.vibes;
CREATE TRIGGER trg_calculate_vibe_expiration
BEFORE INSERT ON public.vibes
FOR EACH ROW EXECUTE FUNCTION public.calculate_vibe_expiration();

-- ==============================================================================
-- 3. TABELA DE STORIES EFÉMEROS (Fotos/Vídeos de 24 horas)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.stories (
    id TEXT PRIMARY KEY,
    author_id TEXT,
    author_name TEXT,
    author_username TEXT,
    author_avatar TEXT,
    author_vibe_color TEXT DEFAULT 'purple',
    type TEXT DEFAULT 'photo',
    content TEXT,
    media_url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours')
);

ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS author_id TEXT;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS author_name TEXT;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS author_username TEXT;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS author_avatar TEXT;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS author_vibe_color TEXT DEFAULT 'purple';
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'photo';
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS media_url TEXT;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours');

UPDATE public.stories SET expires_at = NOW() + INTERVAL '24 hours' WHERE expires_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON public.stories(expires_at);

-- ==============================================================================
-- 4. TABELA DE CONVERSAS EFÉMERAS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.conversations (
    id TEXT PRIMARY KEY,
    participant_id TEXT,
    participant_name TEXT,
    participant_username TEXT,
    participant_avatar TEXT,
    participant_vibe_color TEXT DEFAULT 'purple',
    last_message TEXT,
    last_message_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours')
);

ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS participant_id TEXT;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS participant_name TEXT;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS participant_username TEXT;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS participant_avatar TEXT;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS participant_vibe_color TEXT DEFAULT 'purple';
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS last_message TEXT;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS last_message_time TIMESTAMPTZ;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours');

UPDATE public.conversations SET expires_at = NOW() + INTERVAL '24 hours' WHERE expires_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_conversations_expires_at ON public.conversations(expires_at);

-- ==============================================================================
-- 5. TABELA DE MENSAGENS EFÉMERAS (Texto, Áudio, Foto com Autodestruição)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id TEXT,
    sender_name TEXT,
    sender_avatar TEXT,
    sender_vibe_color TEXT DEFAULT 'purple',
    type TEXT NOT NULL DEFAULT 'text',
    content TEXT,
    media_url TEXT,
    audio_duration INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours')
);

ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS conversation_id TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS sender_id TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS sender_name TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS sender_avatar TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS sender_vibe_color TEXT DEFAULT 'purple';
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'text';
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS media_url TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS audio_duration INT DEFAULT 0;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours');

UPDATE public.messages SET expires_at = NOW() + INTERVAL '24 hours' WHERE expires_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_messages_expires_at ON public.messages(expires_at);
CREATE INDEX IF NOT EXISTS idx_messages_conv ON public.messages(conversation_id);

-- ==============================================================================
-- 6. TABELA DE ALERTAS DE ATENÇÃO RECEBIDA (⚡ Chamar a Atenção)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.attention_alerts (
    id TEXT PRIMARY KEY,
    vibe_id TEXT,
    vibe_snippet TEXT,
    emoji TEXT NOT NULL DEFAULT '⚡',
    reactor_name TEXT,
    reactor_avatar TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
    is_read BOOLEAN DEFAULT false
);

ALTER TABLE public.attention_alerts ADD COLUMN IF NOT EXISTS vibe_id TEXT;
ALTER TABLE public.attention_alerts ADD COLUMN IF NOT EXISTS vibe_snippet TEXT;
ALTER TABLE public.attention_alerts ADD COLUMN IF NOT EXISTS emoji TEXT DEFAULT '⚡';
ALTER TABLE public.attention_alerts ADD COLUMN IF NOT EXISTS reactor_name TEXT;
ALTER TABLE public.attention_alerts ADD COLUMN IF NOT EXISTS reactor_avatar TEXT;
ALTER TABLE public.attention_alerts ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.attention_alerts ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours');
ALTER TABLE public.attention_alerts ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;

UPDATE public.attention_alerts SET expires_at = NOW() + INTERVAL '24 hours' WHERE expires_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_alerts_expires_at ON public.attention_alerts(expires_at);

-- ==============================================================================
-- 7. FUNÇÃO DE PURGA AUTOMÁTICA GERAL (APAGA DADOS EXPIRADOS DA BASE DE DADOS)
-- Elimina permanentemente mensagens, fotos, conversas e vibes expiradas
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.purge_expired_ephemeral_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INT := 0;
  m_count INT := 0;
  c_count INT := 0;
  s_count INT := 0;
  a_count INT := 0;
BEGIN
  -- 1. Apagar mensagens de chat cujo expires_at já passou
  WITH deleted_msgs AS (
    DELETE FROM public.messages WHERE expires_at <= NOW() RETURNING id
  ) SELECT count(*) INTO m_count FROM deleted_msgs;

  -- 2. Apagar conversas expiradas
  WITH deleted_convs AS (
    DELETE FROM public.conversations WHERE expires_at <= NOW() RETURNING id
  ) SELECT count(*) INTO c_count FROM deleted_convs;

  -- 3. Apagar vibes, fotos e áudios expirados
  WITH deleted_vibes AS (
    DELETE FROM public.vibes WHERE expires_at <= NOW() RETURNING id
  ) SELECT count(*) INTO v_count FROM deleted_vibes;

  -- 4. Apagar stories expirados
  WITH deleted_stories AS (
    DELETE FROM public.stories WHERE expires_at <= NOW() RETURNING id
  ) SELECT count(*) INTO s_count FROM deleted_stories;

  -- 5. Apagar alertas de atenção expirados
  WITH deleted_alerts AS (
    DELETE FROM public.attention_alerts WHERE expires_at <= NOW() RETURNING id
  ) SELECT count(*) INTO a_count FROM deleted_alerts;

  RETURN jsonb_build_object(
    'purged_vibes', v_count,
    'purged_messages', m_count,
    'purged_conversations', c_count,
    'purged_stories', s_count,
    'purged_alerts', a_count,
    'purged_at', NOW()
  );
END;
$$;

-- Função auxiliar quando o utilizador sai de uma conversa no chat:
-- Programa a autodestruição de todas as mensagens dessa conversa para daqui a 1 minuto
CREATE OR REPLACE FUNCTION public.schedule_conversation_exit_purge(target_conv_id TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.messages
    SET expires_at = NOW() + INTERVAL '1 minute'
    WHERE conversation_id = target_conv_id;
END;
$$;

-- ==============================================================================
-- 8. AGENDAMENTO AUTOMÁTICO DO PG_CRON (A CADA 1 MINUTO)
-- Garante purga autônoma diretamente no servidor Postgres mesmo com telemóvel desligado
-- ==============================================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        -- Remove agendamento anterior se existir para evitar duplicados
        PERFORM cron.unschedule('lyvo-auto-purge-every-minute') 
        WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'lyvo-auto-purge-every-minute');

        -- Agenda para correr a cada minuto em ponto
        PERFORM cron.schedule(
            'lyvo-auto-purge-every-minute',
            '* * * * *',
            'SELECT public.purge_expired_ephemeral_data();'
        );
    END IF;
END $$;

-- ==============================================================================
-- 9. VIEWS PÚBLICAS DE CONTEÚDO ATIVO (Zero Rasto para Leituras)
-- ==============================================================================
CREATE OR REPLACE VIEW public.active_vibes AS
SELECT * FROM public.vibes 
WHERE expires_at > NOW();

CREATE OR REPLACE VIEW public.active_messages AS
SELECT * FROM public.messages 
WHERE expires_at > NOW();

-- ==============================================================================
-- 10. POLÍTICAS RLS (ROW LEVEL SECURITY) - MÁXIMA PRIVACIDADE
-- Nenhum registo expirado pode ser lido mesmo antes do cron executar!
-- ==============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir leitura de users" ON public.users;
CREATE POLICY "Permitir leitura de users" ON public.users FOR SELECT USING (true);
DROP POLICY IF EXISTS "Permitir registo/upsert de users" ON public.users;
CREATE POLICY "Permitir registo/upsert de users" ON public.users FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.vibes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir leitura de vibes ativas" ON public.vibes;
CREATE POLICY "Permitir leitura de vibes ativas" ON public.vibes FOR SELECT USING (expires_at > NOW());
DROP POLICY IF EXISTS "Permitir gerir vibes" ON public.vibes;
CREATE POLICY "Permitir gerir vibes" ON public.vibes FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir leitura de stories ativas" ON public.stories;
CREATE POLICY "Permitir leitura de stories ativas" ON public.stories FOR SELECT USING (expires_at > NOW());
DROP POLICY IF EXISTS "Permitir gerir stories" ON public.stories;
CREATE POLICY "Permitir gerir stories" ON public.stories FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir conversas ativas" ON public.conversations;
CREATE POLICY "Permitir conversas ativas" ON public.conversations FOR ALL TO anon, authenticated USING (expires_at > NOW()) WITH CHECK (true);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir mensagens ativas" ON public.messages;
CREATE POLICY "Permitir mensagens ativas" ON public.messages FOR ALL TO anon, authenticated USING (expires_at > NOW()) WITH CHECK (true);

ALTER TABLE public.attention_alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir alertas ativos" ON public.attention_alerts;
CREATE POLICY "Permitir alertas ativos" ON public.attention_alerts FOR ALL TO anon, authenticated USING (expires_at > NOW()) WITH CHECK (true);

-- ==============================================================================
-- 11. BUCKET DE STORAGE (Para Ficheiros de Fotos, Áudios e Vídeos)
-- ==============================================================================
DO $$
BEGIN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('ephemeral-media', 'ephemeral-media', true)
    ON CONFLICT (id) DO NOTHING;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Bucket storage pode ser criado na secção Storage do painel se necessário.';
END $$;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Upload livre para media efémera" ON storage.objects;
    CREATE POLICY "Upload livre para media efémera" ON storage.objects
    FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'ephemeral-media');

    DROP POLICY IF EXISTS "Leitura de media efémera" ON storage.objects;
    CREATE POLICY "Leitura de media efémera" ON storage.objects
    FOR SELECT TO anon, authenticated USING (bucket_id = 'ephemeral-media');
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Políticas de storage podem ser geridas no painel Storage > Policies.';
END $$;
`;

// Read from env (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY) or local fallback
const ENV_SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const ENV_SUPABASE_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();

const LOCAL_STORAGE_SUPABASE_URL_KEY = 'lyvo_custom_supabase_url';
const LOCAL_STORAGE_SUPABASE_KEY_KEY = 'lyvo_custom_supabase_key';

export function getSupabaseConfig(): { url: string | null; key: string | null; isConfigured: boolean } {
  let url = ENV_SUPABASE_URL || null;
  let key = ENV_SUPABASE_KEY || null;

  try {
    const customUrl = localStorage.getItem(LOCAL_STORAGE_SUPABASE_URL_KEY)?.trim();
    const customKey = localStorage.getItem(LOCAL_STORAGE_SUPABASE_KEY_KEY)?.trim();
    if (customUrl) url = customUrl;
    if (customKey) key = customKey;
  } catch (e) {
    // ignore
  }

  const isConfigured = Boolean(url && key && url.startsWith('https://') && key.length > 20);
  return { url, key, isConfigured };
}

export function saveCustomSupabaseConfig(url: string, key: string): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_SUPABASE_URL_KEY, url.trim());
    localStorage.setItem(LOCAL_STORAGE_SUPABASE_KEY_KEY, key.trim());
    cachedClient = null; // reset client
  } catch (e) {
    console.error('Failed to store custom Supabase config', e);
  }
}

export function clearCustomSupabaseConfig(): void {
  try {
    localStorage.removeItem(LOCAL_STORAGE_SUPABASE_URL_KEY);
    localStorage.removeItem(LOCAL_STORAGE_SUPABASE_KEY_KEY);
    cachedClient = null;
  } catch (e) {
    console.error('Failed to clear custom Supabase config', e);
  }
}

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient) return cachedClient;

  const { url, key, isConfigured } = getSupabaseConfig();
  if (!isConfigured || !url || !key) {
    return null;
  }

  try {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    return cachedClient;
  } catch (err) {
    console.warn('Could not initialize Supabase client:', err);
    return null;
  }
}

// User Record in Supabase
export interface SupabaseUserRow {
  id?: string;
  name: string;
  username: string;
  token: string;
  avatar_url?: string;
  bio?: string;
  vibe_color?: string;
  created_at?: string;
}

/**
 * Syncs a newly registered or verified account to Supabase public.users table.
 * If Supabase is not yet configured, returns a clear status so the UI informs the user.
 */
export async function syncUserToSupabase(account: RegisteredAccount): Promise<{
  synced: boolean;
  notConfigured?: boolean;
  message?: string;
  error?: string;
}> {
  const supabase = getSupabaseClient();
  const config = getSupabaseConfig();

  if (!supabase || !config.isConfigured) {
    return {
      synced: false,
      notConfigured: true,
      message: 'Supabase ainda não conectado. O utilizador e token foram salvos com segurança no armazenamento local do navegador.',
    };
  }

  try {
    const userRow: SupabaseUserRow = {
      name: account.name,
      username: account.username.toLowerCase(),
      token: account.token,
      avatar_url: account.avatar,
      bio: account.bio,
      vibe_color: account.vibeColor,
    };

    // Upsert by username
    const { data, error } = await supabase
      .from('users')
      .upsert(userRow, { onConflict: 'username' })
      .select();

    if (error) {
      console.warn('Supabase users insert warning:', error);
      let friendlyError = error.message;

      if (error.code === '42P01' || error.message.includes('relation "public.users" does not exist') || error.message.includes('relation "users" does not exist')) {
        friendlyError = 'Tabela "public.users" ainda não existe no teu Supabase. Executa o script SQL no SQL Editor do Supabase.';
      } else if (error.code === '42501' || error.message.toLowerCase().includes('row-level security') || error.message.toLowerCase().includes('policy')) {
        friendlyError = 'A política RLS do Supabase bloqueou a inserção anónima. Adiciona a política permissiva na tabela users.';
      }

      return {
        synced: false,
        error: friendlyError,
      };
    }

    return {
      synced: true,
      message: `Utilizador @${account.username} e token sincronizados com a tabela public.users no Supabase!`,
    };
  } catch (err: any) {
    console.warn('Supabase sync exception:', err);
    return {
      synced: false,
      error: err?.message || 'Falha de rede ao contactar o servidor Supabase',
    };
  }
}

/**
 * Bulk syncs all local registered accounts to Supabase public.users
 */
export async function syncAllUsersToSupabase(accounts: RegisteredAccount[]): Promise<{
  success: boolean;
  syncedCount: number;
  totalCount: number;
  message: string;
  errors: string[];
}> {
  const config = getSupabaseConfig();
  if (!config.isConfigured) {
    return {
      success: false,
      syncedCount: 0,
      totalCount: accounts.length,
      message: 'Supabase não está configurado. Insere o Project URL e Anon Key.',
      errors: ['Credenciais Supabase não configuradas'],
    };
  }

  let syncedCount = 0;
  const errors: string[] = [];

  for (const account of accounts) {
    const res = await syncUserToSupabase(account);
    if (res.synced) {
      syncedCount++;
    } else if (res.error) {
      errors.push(`@${account.username}: ${res.error}`);
    }
  }

  return {
    success: errors.length === 0,
    syncedCount,
    totalCount: accounts.length,
    message: errors.length === 0
      ? `Sucesso! ${syncedCount} de ${accounts.length} utilizador(es) sincronizados no Supabase.`
      : `${syncedCount} sincronizados. Atenção: ${errors[0]}`,
    errors,
  };
}

/**
 * Syncs a published or edited Vibe to Supabase public.vibes table.
 */
export async function syncVibeToSupabase(vibe: VibeItem): Promise<{
  synced: boolean;
  message?: string;
  error?: string;
}> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { synced: false, message: 'Supabase não conectado' };
  }

  try {
    const durationHours = Math.max(0.5, Math.round(((vibe.expiresAt - vibe.createdAt) / (3600 * 1000)) * 10) / 10);

    const { error } = await supabase.from('vibes').upsert({
      id: vibe.id,
      author_id: vibe.authorId,
      author_name: vibe.authorName,
      author_username: vibe.authorUsername,
      author_avatar: vibe.authorAvatar,
      author_vibe_color: vibe.authorVibeColor,
      type: vibe.type,
      content: vibe.content || null,
      media_url: vibe.mediaUrl || null,
      audio_duration: vibe.audioDuration || 0,
      location: vibe.location || 'Lisboa, Centro',
      distance: vibe.distance || 'Perto de ti',
      privacy: vibe.privacy,
      duration_hours: durationHours,
      created_at: new Date(vibe.createdAt).toISOString(),
      expires_at: new Date(vibe.expiresAt).toISOString(),
      likes: vibe.likes || 0,
      shares_count: vibe.sharesCount || 0,
      views_count: vibe.viewsCount || 0,
      edited_at: vibe.editedAt ? new Date(vibe.editedAt).toISOString() : null,
      attention_reactions: vibe.attentionReactions || [],
    }, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase vibes upsert warning:', error.message);
      return { synced: false, error: error.message };
    }
    return { synced: true };
  } catch (err: any) {
    return { synced: false, error: err?.message };
  }
}

/**
 * Syncs an ephemeral message to Supabase public.messages table
 */
export async function syncMessageToSupabase(message: EphemeralMessage): Promise<{ synced: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { synced: false };

  try {
    const { error } = await supabase.from('messages').upsert({
      id: message.id,
      conversation_id: message.conversationId,
      sender_id: message.senderId,
      sender_name: message.senderName,
      sender_avatar: message.senderAvatar,
      sender_vibe_color: message.senderVibeColor,
      type: message.type,
      content: message.content,
      media_url: message.mediaUrl || null,
      audio_duration: message.audioDuration || null,
      created_at: new Date(message.createdAt).toISOString(),
      expires_at: new Date(message.expiresAt).toISOString(),
    }, { onConflict: 'id' });

    if (error) return { synced: false, error: error.message };
    return { synced: true };
  } catch (err: any) {
    return { synced: false, error: err?.message };
  }
}

/**
 * Syncs a conversation to Supabase public.conversations table
 */
export async function syncConversationToSupabase(conversation: Conversation): Promise<{ synced: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { synced: false };

  try {
    const { error } = await supabase.from('conversations').upsert({
      id: conversation.id,
      participant_id: conversation.participantId,
      participant_name: conversation.participantName,
      participant_username: conversation.participantUsername,
      participant_avatar: conversation.participantAvatar,
      participant_vibe_color: conversation.participantVibeColor,
      last_message: conversation.lastMessage,
      last_message_time: new Date(conversation.lastMessageTime).toISOString(),
      created_at: new Date().toISOString(),
      expires_at: new Date(conversation.expiresAt).toISOString(),
    }, { onConflict: 'id' });

    if (error) return { synced: false, error: error.message };
    return { synced: true };
  } catch (err: any) {
    return { synced: false, error: err?.message };
  }
}

/**
 * Automatically purges all expired vibes, messages and conversations from Supabase
 * Deletes items where expires_at <= NOW()
 */
export async function purgeExpiredFromSupabase(): Promise<{
  purgedVibes: number;
  purgedMessages: number;
  purgedConversations: number;
  purgedStories: number;
  purgedAlerts: number;
  success: boolean;
}> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { purgedVibes: 0, purgedMessages: 0, purgedConversations: 0, purgedStories: 0, purgedAlerts: 0, success: false };
  }

  const nowIso = new Date().toISOString();
  let vCount = 0;
  let mCount = 0;
  let cCount = 0;
  let sCount = 0;
  let aCount = 0;

  try {
    // 1. First attempt to call the server-side RPC function if it was created
    const { data: rpcData, error: rpcError } = await supabase.rpc('purge_expired_ephemeral_data');
    if (!rpcError && rpcData) {
      return {
        purgedVibes: rpcData.purged_vibes || 0,
        purgedMessages: rpcData.purged_messages || 0,
        purgedConversations: rpcData.purged_conversations || 0,
        purgedStories: rpcData.purged_stories || 0,
        purgedAlerts: rpcData.purged_alerts || 0,
        success: true,
      };
    }

    // 2. Direct client query delete fallback
    const { data: delVibes } = await supabase
      .from('vibes')
      .delete()
      .lte('expires_at', nowIso)
      .select('id');
    vCount = delVibes?.length || 0;

    const { data: delMsgs } = await supabase
      .from('messages')
      .delete()
      .lte('expires_at', nowIso)
      .select('id');
    mCount = delMsgs?.length || 0;

    const { data: delConvs } = await supabase
      .from('conversations')
      .delete()
      .lte('expires_at', nowIso)
      .select('id');
    cCount = delConvs?.length || 0;

    const { data: delStories } = await supabase
      .from('stories')
      .delete()
      .lte('expires_at', nowIso)
      .select('id');
    sCount = delStories?.length || 0;

    const { data: delAlerts } = await supabase
      .from('attention_alerts')
      .delete()
      .lte('expires_at', nowIso)
      .select('id');
    aCount = delAlerts?.length || 0;

    return {
      purgedVibes: vCount,
      purgedMessages: mCount,
      purgedConversations: cCount,
      purgedStories: sCount,
      purgedAlerts: aCount,
      success: true,
    };
  } catch (err) {
    console.warn('Supabase auto purge exception:', err);
    return { purgedVibes: vCount, purgedMessages: mCount, purgedConversations: cCount, purgedStories: sCount, purgedAlerts: aCount, success: false };
  }
}

/**
 * Recovers a user account from Supabase using their token (or username)
 * Useful when the user loses their phone and wants to restore access
 */
export async function recoverUserFromSupabase(tokenOrUsername: string): Promise<RegisteredAccount | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const clean = tokenOrUsername.trim().toLowerCase().replace(/^@/, '');

  try {
    // Search by token or username
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`token.eq.${tokenOrUsername.trim()},username.eq.${clean}`)
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    const recovered: RegisteredAccount = {
      id: data.id || `user_${Date.now()}`,
      name: data.name,
      username: data.username,
      token: data.token,
      avatar: data.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      bio: data.bio || 'Live the moment. No LYVO.',
      vibeColor: (data.vibe_color as VibeColor) || 'purple',
      createdAt: data.created_at ? new Date(data.created_at).getTime() : Date.now(),
    };

    return recovered;
  } catch (err) {
    console.warn('Supabase recovery error:', err);
    return null;
  }
}

/**
 * Tests connection to configured Supabase instance
 */
export async function testSupabaseConnection(): Promise<{ ok: boolean; message: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      ok: false,
      message: 'Supabase não configurado. Forneça o Project URL e Anon Key.',
    };
  }

  try {
    // Attempt a lightweight select on public.users
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (error) {
      // If table does not exist yet (code 42P01)
      if (error.code === '42P01' || error.message.includes('relation "public.users" does not exist')) {
        return {
          ok: true,
          message: 'Conectado ao Supabase com sucesso! (Nota: a tabela public.users ainda não foi criada. Copie o script SQL no modal).',
        };
      }
      return {
        ok: false,
        message: `Erro Supabase: ${error.message}`,
      };
    }

    return {
      ok: true,
      message: `Conexão bem sucedida! ${count ?? 0} utilizador(es) na tabela public.users.`,
    };
  } catch (err: any) {
    return {
      ok: false,
      message: `Falha na conexão: ${err?.message || 'Verifique a URL e a Anon Key'}`,
    };
  }
}
