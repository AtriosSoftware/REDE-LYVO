import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { RegisteredAccount, VibeItem, EphemeralMessage } from '../types';

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
 * Syncs a published Vibe to Supabase public.vibes table.
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
    const { error } = await supabase.from('vibes').insert({
      id: vibe.id.startsWith('vibe_') ? undefined : vibe.id,
      type: vibe.type,
      content: vibe.content || null,
      media_url: vibe.mediaUrl || null,
      audio_duration: vibe.audioDuration || 0,
      location: vibe.location || 'Lisboa',
      privacy: vibe.privacy,
      author_vibe_color: vibe.authorVibeColor,
      created_at: new Date(vibe.createdAt).toISOString(),
      expires_at: new Date(vibe.expiresAt).toISOString(),
    });

    if (error) {
      return { synced: false, error: error.message };
    }
    return { synced: true };
  } catch (err: any) {
    return { synced: false, error: err?.message };
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
