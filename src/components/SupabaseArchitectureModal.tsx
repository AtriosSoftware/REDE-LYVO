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
import { getSupabaseConfig, COMPLETE_SUPABASE_SCHEMA_SQL, purgeExpiredFromSupabase } from '../lib/supabaseClient';

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
  const [activeTab, setActiveTab] = useState<'master' | 'summary' | 'cron' | 'storage' | 'rls'>('master');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [cronLog, setCronLog] = useState<string | null>(null);
  const supabaseConfig = getSupabaseConfig();

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard?.writeText?.(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleTestCron = async () => {
    const localResult = onSimulateCronPurge();
    const supaResult = await purgeExpiredFromSupabase();
    const timestamp = new Date().toLocaleTimeString();
    setCronLog(
      `[${timestamp}] PURGA EXECUTADA NO SUPABASE & TELEMÓVEL!\n` +
      `• Base de Dados Supabase: ${supaResult.purgedVibes} vibes apagadas, ${supaResult.purgedMessages} mensagens apagadas, ${supaResult.purgedStories} stories apagados, ${supaResult.purgedAlerts} alertas apagados\n` +
      `• Telemóvel (LocalStorage): ${localResult.purgedVibes} vibes limpas, ${localResult.purgedMessages} mensagens limpas\n` +
      `• Zero Rasto: Fotos, áudios e mensagens expiradas foram permanentemente eliminadas.`
    );
  };

  const SQL_TABLES = COMPLETE_SUPABASE_SCHEMA_SQL;

  const SQL_CRON = `-- ==========================================
-- 2. PG_CRON: ELIMINAÇÃO AUTOMÁTICA EM TEMPO REAL
-- ==========================================
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Função que apaga dados expirados:
-- - Mensagens de chat (destruídas 1 minuto após saírem ou TTL definido)
-- - Vibes (conforme o tempo escolhido pelo utilizador de 30min até 24h)
-- - Stories e Alertas de Atenção
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

  -- 5. Apagar alertas expirados
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

-- Agenda o Job para correr A CADA 1 MINUTO
SELECT cron.schedule(
    'lyvo-auto-purge-every-minute',
    '* * * * *', -- Executa a cada minuto
    'SELECT public.purge_expired_ephemeral_data();'
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
-- 4. ROW LEVEL SECURITY (RLS) PARA MÁXIMA PRIVACIDADE
-- Nenhum registo expirado pode ser lido mesmo antes do cron rodar!
-- ==========================================
ALTER TABLE public.vibes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Vibes públicas são visíveis para todos estritamente enquanto válidas
DROP POLICY IF EXISTS "Permitir leitura de vibes ativas" ON public.vibes;
CREATE POLICY "Permitir leitura de vibes ativas"
ON public.vibes FOR SELECT
USING (
    privacy = 'public' 
    AND expires_at > NOW()
);

-- Mensagens com autodestruição: invisíveis após expiração
DROP POLICY IF EXISTS "Permitir mensagens ativas" ON public.messages;
CREATE POLICY "Permitir mensagens ativas"
ON public.messages FOR ALL
TO anon, authenticated
USING (expires_at > NOW())
WITH CHECK (true);`;

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
        <div className="flex border-b border-[#1E1E30] bg-[#0E0E18] px-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'master' as const, label: '🚀 Query Mestre (SQL Editor)' },
            { id: 'summary' as const, label: '📊 Dados Guardados & TTL' },
            { id: 'cron' as const, label: '⏰ pg_cron (Auto-Delete)' },
            { id: 'storage' as const, label: '🪣 Storage Fotos & Áudio' },
            { id: 'rls' as const, label: '🔒 RLS Privacidade' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`py-2.5 px-3 text-xs font-semibold whitespace-nowrap transition-all border-b-2 ${
                activeTab === id
                  ? 'border-[#22D3EE] text-[#22D3EE] bg-[#22D3EE]/5'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Code / Content View Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0A0A12]">
          
          {/* Summary Tab: Visual Architecture of Data & Privacy */}
          {activeTab === 'summary' && (
            <div className="space-y-3 text-xs text-zinc-300">
              <div className="p-3.5 rounded-2xl bg-[#141424] border border-[#26263E] space-y-2">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#22D3EE]" />
                  <span>1. Dados Guardados no Supabase (Estrutura)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="p-2.5 rounded-xl bg-[#0D0D18] border border-white/5 space-y-1">
                    <span className="text-[#8B5CF6] font-bold block">👤 Utilizadores & Token (public.users)</span>
                    <p className="text-zinc-400">
                      Guarda <code className="text-white">id</code>, <code className="text-white">name</code>, <code className="text-white">username</code>, <code className="text-amber-400 font-bold">token (4 dígitos)</code>, avatar e bio.
                    </p>
                    <span className="text-[10px] text-emerald-400 block font-mono">
                      ✓ Permite restaurar a conta caso percas o telemóvel!
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#0D0D18] border border-white/5 space-y-1">
                    <span className="text-[#F43F9E] font-bold block">🔥 Vibes, Fotos & Áudios (public.vibes)</span>
                    <p className="text-zinc-400">
                      Guarda posts, fotos, áudios, textos, localização e a coluna <code className="text-rose-400 font-bold">expires_at</code>.
                    </p>
                    <span className="text-[10px] text-zinc-400 block font-mono">
                      ⏱️ TTL: 30min, 1h, 3h, 15h, 17h até 24h na barra de rolagem.
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#0D0D18] border border-white/5 space-y-1">
                    <span className="text-[#22D3EE] font-bold block">💬 Mensagens do Chat (public.messages)</span>
                    <p className="text-zinc-400">
                      Mensagens de texto, notas de voz e fotos trocadas em conversa direta.
                    </p>
                    <span className="text-[10px] text-rose-400 block font-mono">
                      💣 Autodestruição programada 1 min após sair do chat.
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#0D0D18] border border-white/5 space-y-1">
                    <span className="text-amber-400 font-bold block">⚡ Atenções & Stories (alerts / stories)</span>
                    <p className="text-zinc-400">
                      Alertas quando alguém chama a atenção num post e stories efémeros de 24h.
                    </p>
                    <span className="text-[10px] text-zinc-400 block font-mono">
                      🗑️ Eliminados em cascata quando o post expira.
                    </span>
                  </div>
                </div>
              </div>

              {/* Dual Cleanup Mechanism */}
              <div className="p-3.5 rounded-2xl bg-[#141424] border border-[#26263E] space-y-2">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  <span>2. Como os dados são apagados do Banco e do Telemóvel</span>
                </h4>

                <div className="space-y-2 text-[11px] text-zinc-300">
                  <div className="flex gap-2.5 items-start p-2 rounded-xl bg-black/30 border border-white/5">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold text-xs">
                      1
                    </div>
                    <div>
                      <strong className="text-white block">No Banco de Dados (Supabase PostgreSQL):</strong>
                      <p className="text-zinc-400 leading-relaxed">
                        A extensão <code className="text-emerald-400">pg_cron</code> roda automaticamente a cada 1 minuto executando <code className="text-cyan-400">purge_expired_ephemeral_data()</code>. Registos com <code className="text-white">expires_at &lt;= NOW()</code> são permanentemente excluídos com <code className="text-rose-400">DELETE</code> em cascata. Além disso, as políticas <strong className="text-white">RLS</strong> impedem qualquer leitura externa se já estiver expirado.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-start p-2 rounded-xl bg-black/30 border border-white/5">
                    <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 font-bold text-xs">
                      2
                    </div>
                    <div>
                      <strong className="text-white block">No Telemóvel do Utilizador (LocalStorage & Memória):</strong>
                      <p className="text-zinc-400 leading-relaxed">
                        O motor do app executa uma verificação local a cada 5 segundos e ao focar no app. Quando o tempo de vida esgota, a Vibe ou mensagem é imediatamente expurgada do <code className="text-cyan-400">localStorage</code> e do estado do telemóvel, deixando <strong>zero vestígios físicos</strong> no dispositivo.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Code Viewer (Master, Cron, Storage, RLS) */}
          {activeTab !== 'summary' && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-mono">
                  {activeTab === 'master' && '01_lyvo_master_supabase_query.sql (COMPLETA)'}
                  {activeTab === 'cron' && '02_pg_cron_job.sql'}
                  {activeTab === 'storage' && '03_purge_storage.ts'}
                  {activeTab === 'rls' && '04_row_level_security.sql'}
                </span>

                <button
                  onClick={() => {
                    const code =
                      activeTab === 'master'
                        ? SQL_TABLES
                        : activeTab === 'cron'
                        ? SQL_CRON
                        : activeTab === 'storage'
                        ? SQL_STORAGE
                        : SQL_RLS;
                    copyToClipboard(code, activeTab);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#22D3EE]/20 to-[#8B5CF6]/20 border border-[#22D3EE]/50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:border-[#22D3EE] transition-all cursor-pointer"
                >
                  {copiedCode === activeTab ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copiado para a Área de Transferência!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#22D3EE]" />
                      <span>Copiar Query para o SQL Editor</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-3.5 rounded-2xl bg-[#0F0F1A] border border-[#202034] text-xs font-mono text-zinc-300 overflow-x-auto leading-relaxed max-h-[360px]">
                <code>
                  {activeTab === 'master' && SQL_TABLES}
                  {activeTab === 'cron' && SQL_CRON}
                  {activeTab === 'storage' && SQL_STORAGE}
                  {activeTab === 'rls' && SQL_RLS}
                </code>
              </pre>
            </>
          )}

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
