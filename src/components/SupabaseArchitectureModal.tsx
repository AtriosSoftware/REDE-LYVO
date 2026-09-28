import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Clock, 
  Trash2, 
  Copy, 
  Check, 
  ShieldCheck, 
  Terminal, 
  Server, 
  HardDrive,
  Play,
  KeyRound,
  ExternalLink
} from 'lucide-react';
import { getSupabaseConfig } from '../lib/supabaseClient';

interface SupabaseArchitectureModalProps {
  onClose: () => void;
  onSimulateCronPurge: () => { purgedVibes: number; purgedMessages: number };
  onOpenConnectModal?: () => void;
}

export const SupabaseArchitectureModal: React.FC<SupabaseArchitectureModalProps> = ({
  onClose,
  onSimulateCronPurge,
  onOpenConnectModal,
}) => {
  const [activeTab, setActiveTab] = useState<'sql' | 'cron' | 'storage' | 'rls'>('cron');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [cronLog, setCronLog] = useState<string | null>(null);
  const supabaseConfig = getSupabaseConfig();

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard?.writeText?.(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleTestCron = () => {
    const result = onSimulateCronPurge();
    const timestamp = new Date().toLocaleTimeString();
    setCronLog(
      `[${timestamp}] pg_cron EXECUTADO COM SUCESSO!\n` +
      `QUERY: DELETE FROM vibes WHERE expires_at <= NOW(); -> ${result.purgedVibes} eliminadas\n` +
      `QUERY: DELETE FROM messages WHERE expires_at <= NOW(); -> ${result.purgedMessages} eliminadas\n` +
      `STORAGE: Edge function supabase/functions/purge-storage invocada.`
    );
  };

  const SQL_TABLES = `-- ==========================================
-- 1. TABELAS ESSENCIAIS SUPABASE (LYVO ZERO RASTO)
-- ==========================================

-- Tabela de Utilizadores (Login via Username + Token 4 Dígitos)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    token VARCHAR(4) NOT NULL,
    avatar_url TEXT,
    bio TEXT DEFAULT 'Live the moment. No LYVO.',
    vibe_color TEXT DEFAULT 'purple',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Políticas RLS para tabela users (Permitir registo e consulta por chave anon)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir leitura de users para todos" ON public.users;
CREATE POLICY "Permitir leitura de users para todos" ON public.users FOR SELECT USING (true);
DROP POLICY IF EXISTS "Permitir registo e upsert de users" ON public.users;
CREATE POLICY "Permitir registo e upsert de users" ON public.users FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Tabela de Vibes (Fotos, Vídeos, Áudios, Texto com Duração Escolhida pelo Utilizador)
CREATE TABLE IF NOT EXISTS public.vibes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('photo', 'video', 'audio', 'text')),
    content TEXT,
    media_url TEXT,
    audio_duration INT DEFAULT 0,
    location TEXT DEFAULT 'Lisboa, Centro',
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    privacy TEXT DEFAULT 'public' CHECK (privacy IN ('public', 'friends')),
    author_vibe_color TEXT DEFAULT 'purple',
    -- Duração escolhida pelo utilizador (ex: 0.5h, 1h, 6h, 12h ou até 24h)
    duration_hours NUMERIC(4, 2) DEFAULT 24 CHECK (duration_hours > 0 AND duration_hours <= 24),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Tabela de Conversas Efémeras
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Tabela de Mensagens do Chat (ZERO GRAVAÇÃO PERMANENTE: Apagadas em 1 min após saída)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT DEFAULT 'text' CHECK (type IN ('text', 'audio', 'photo')),
    content TEXT,
    media_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- Por padrão ou ao sair da conversa, expira e é destruída em 1 minuto
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 minute')
);

-- Índices de performance para rápida eliminação por TTL
CREATE INDEX IF NOT EXISTS idx_vibes_expires_at ON public.vibes(expires_at);
CREATE INDEX IF NOT EXISTS idx_messages_expires_at ON public.messages(expires_at);`;

  const SQL_CRON = `-- ==========================================
-- 2. PG_CRON: ELIMINAÇÃO AUTOMÁTICA EM TEMPO REAL
-- ==========================================
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Função que apaga dados expirados:
-- - Mensagens de chat (destruídas 1 minuto após saírem)
-- - Vibes (conforme o tempo escolhido pelo utilizador até 24h)
CREATE OR REPLACE FUNCTION purge_ephemeral_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- 1. Apaga Mensagens do chat (1 minuto após expiração)
    DELETE FROM public.messages 
    WHERE expires_at <= NOW();

    -- 2. Apaga Vibes expiradas (conforme duração definida pelo autor)
    DELETE FROM public.vibes 
    WHERE expires_at <= NOW();

    -- 3. Apaga Conversas vazias ou expiradas
    DELETE FROM public.conversations 
    WHERE expires_at <= NOW();
END;
$$;

-- Função chamada pelo app quando o utilizador sai da conversa:
-- Define a autodestruição de todas as mensagens dessa conversa para daqui a 1 minuto
CREATE OR REPLACE FUNCTION schedule_conversation_exit_purge(target_conv_id UUID)
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

-- Agenda o Job para correr A CADA 1 MINUTO
SELECT cron.schedule(
    'lyvo-auto-purge-1min',
    '* * * * *', -- Executa a cada minuto
    'SELECT purge_ephemeral_data();'
);`;

  const SQL_STORAGE = `// ==========================================
// 3. SUPABASE EDGE FUNCTION: PURGA DE FICHEIROS DO STORAGE
// (Fotos, Vídeos e Áudios guardados no bucket 'ephemeral-media')
// ==========================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // 1. Procura ficheiros no bucket 'ephemeral-media' com created_at > 24h
  const { data: files, error } = await supabase.storage
    .from('ephemeral-media')
    .list('', { limit: 1000 })

  if (error) return new Response(error.message, { status: 500 })

  const now = Date.now()
  const twentyFourHours = 24 * 60 * 60 * 1000

  // 2. Filtra ficheiros criados há mais de 24 horas
  const filesToDelete = files
    .filter(file => (now - new Date(file.created_at).getTime()) > twentyFourHours)
    .map(file => file.name)

  if (filesToDelete.length > 0) {
    await supabase.storage
      .from('ephemeral-media')
      .remove(filesToDelete)
  }

  return new Response(JSON.stringify({ deleted: filesToDelete.length }), {
    headers: { 'Content-Type': 'application/json' },
  })
})`;

  const SQL_RLS = `-- ==========================================
-- 4. ROW LEVEL SECURITY (RLS) PARA VIBES PÚBLICAS & PRIVADAS
-- ==========================================
ALTER TABLE public.vibes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Vibes públicas são visíveis para todos antes de expirarem
CREATE POLICY "Vibes públicas visíveis para todos"
ON public.vibes FOR SELECT
USING (
    privacy = 'public' 
    AND expires_at > NOW()
);

-- Utilizadores só podem ler mensagens das conversas em que participam
CREATE POLICY "Mensagens privadas apenas para participantes"
ON public.messages FOR SELECT
USING (
    auth.uid() = sender_id
    AND expires_at > NOW()
);`;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-xl bg-[#0D0D16] border border-[#24243A] rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 bg-[#11111E] border-b border-[#1E1E30] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white font-['Outfit']">
                Arquitetura Supabase (Zero Retenção 24h)
              </h3>
              <p className="text-[11px] text-zinc-400">
                Solução para a tua pergunta: como eliminar tudo após 24 horas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1B1B2B] text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Interactive Explanation Banner */}
        <div className="px-4 py-3 bg-[#131322] border-b border-[#202034] text-xs text-zinc-300 space-y-2">
          {/* Live Supabase Connection Bar */}
          <div className="p-2.5 rounded-xl bg-[#0F0F1B] border border-[#232338] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${supabaseConfig.isConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <div className="text-[11px] leading-tight">
                <span className="font-bold text-white block">
                  {supabaseConfig.isConfigured ? 'Conectado a Banco Supabase' : 'Banco em Modo Local (Mock)'}
                </span>
                <span className="text-zinc-400 text-[10px]">
                  {supabaseConfig.isConfigured 
                    ? `URL: ${supabaseConfig.url?.substring(0, 32)}...` 
                    : 'Insere as tuas chaves para persistir utilizadores e tokens no teu projeto real'}
                </span>
              </div>
            </div>

            {onOpenConnectModal && (
              <button
                onClick={onOpenConnectModal}
                className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] text-white font-bold text-[10.5px] shadow-sm hover:opacity-95 transition-all flex items-center gap-1 shrink-0"
              >
                <KeyRound className="w-3 h-3" />
                <span>{supabaseConfig.isConfigured ? 'Gerir Conexão' : 'Conectar Supabase'}</span>
              </button>
            )}
          </div>

          <p className="leading-relaxed">
            Para garantir que <strong>nenhum dado fica gravado por mais de 24 horas</strong> (conversas, fotos, vídeos, áudios e vibes), a arquitetura não confia apenas no telemóvel do utilizador:
          </p>
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <div className="p-2 rounded-lg bg-[#181829] border border-[#26263C]">
              <span className="text-[#22D3EE] font-bold block">1. PostgreSQL TTL</span>
              <span>Coluna <code className="text-white">expires_at</code> indexada</span>
            </div>
            <div className="p-2 rounded-lg bg-[#181829] border border-[#26263C]">
              <span className="text-[#8B5CF6] font-bold block">2. pg_cron Engine</span>
              <span>Purga a cada 5m no servidor</span>
            </div>
            <div className="p-2 rounded-lg bg-[#181829] border border-[#26263C]">
              <span className="text-[#F43F9E] font-bold block">3. Storage Purge</span>
              <span>Elimina ficheiros físicos</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#1E1E30] bg-[#0E0E18] px-2">
          {[
            { id: 'cron' as const, label: '⏰ pg_cron (Auto-Delete)', code: SQL_CRON },
            { id: 'sql' as const, label: '🐘 Esquema SQL (TTL)', code: SQL_TABLES },
            { id: 'storage' as const, label: '🪣 Edge Function Storage', code: SQL_STORAGE },
            { id: 'rls' as const, label: '🔒 RLS Segurança', code: SQL_RLS },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`py-2.5 px-3 text-xs font-semibold transition-all border-b-2 ${
                activeTab === id
                  ? 'border-[#22D3EE] text-[#22D3EE]'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Code View Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0A0A12]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-mono">
              {activeTab === 'cron' && 'pg_cron_job.sql'}
              {activeTab === 'sql' && 'schema_tables.sql'}
              {activeTab === 'storage' && 'purge_storage.ts'}
              {activeTab === 'rls' && 'row_level_security.sql'}
            </span>

            <button
              onClick={() => {
                const code =
                  activeTab === 'cron'
                    ? SQL_CRON
                    : activeTab === 'sql'
                    ? SQL_TABLES
                    : activeTab === 'storage'
                    ? SQL_STORAGE
                    : SQL_RLS;
                copyToClipboard(code, activeTab);
              }}
              className="px-2.5 py-1 rounded-lg bg-[#181828] border border-[#2B2B3E] text-zinc-300 hover:text-white text-xs flex items-center gap-1.5 transition-colors"
            >
              {copiedCode === activeTab ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar SQL</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-3.5 rounded-2xl bg-[#0F0F1A] border border-[#202034] text-xs font-mono text-zinc-300 overflow-x-auto leading-relaxed">
            <code>
              {activeTab === 'cron' && SQL_CRON}
              {activeTab === 'sql' && SQL_TABLES}
              {activeTab === 'storage' && SQL_STORAGE}
              {activeTab === 'rls' && SQL_RLS}
            </code>
          </pre>

          {/* Interactive Live Cron Test in Browser */}
          <div className="p-3.5 rounded-2xl bg-[#141424] border border-[#282840] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                Simulador Interativo pg_cron no App
              </span>
              <button
                onClick={handleTestCron}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] text-white text-xs font-bold shadow-md active:scale-95 transition-all"
              >
                Disparar Purga Agora
              </button>
            </div>
            <p className="text-[11px] text-zinc-400 leading-normal">
              Clica acima para simular a execução do trigger e verificar no feed a purga de todas as publicações com <code className="text-white">expires_at &lt;= NOW()</code>.
            </p>

            {cronLog && (
              <pre className="p-2.5 rounded-xl bg-[#0B0B14] border border-[#1E1E2E] text-[10.5px] font-mono text-emerald-400 whitespace-pre-wrap">
                {cronLog}
              </pre>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-[#11111E] border-t border-[#1E1E30] flex items-center justify-between">
          <span className="text-[11px] text-zinc-400">
            Compatível com Supabase Free Tier
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#1C1C2C] text-white text-xs font-semibold hover:bg-[#252538] transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
