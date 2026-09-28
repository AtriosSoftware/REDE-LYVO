import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  Key,
  Globe,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Check,
  Copy,
  Users,
  Code,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  getSupabaseConfig,
  saveCustomSupabaseConfig,
  clearCustomSupabaseConfig,
  testSupabaseConnection,
  getSupabaseClient,
  syncUserToSupabase,
  syncAllUsersToSupabase,
  COMPLETE_SUPABASE_SCHEMA_SQL,
} from '../lib/supabaseClient';
import { getRegisteredAccounts } from '../lib/authStore';

interface SupabaseConfigModalProps {
  onClose: () => void;
  onConfigUpdated?: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  onClose,
  onConfigUpdated,
}) => {
  const currentConfig = getSupabaseConfig();
  const [urlInput, setUrlInput] = useState(currentConfig.url || '');
  const [keyInput, setKeyInput] = useState(currentConfig.key || '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [syncingAccounts, setSyncingAccounts] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [showSql, setShowSql] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const localAccounts = getRegisteredAccounts();
  const SQL_SNIPPET = COMPLETE_SUPABASE_SCHEMA_SQL;

  useEffect(() => {
    if (currentConfig.isConfigured) {
      handleTest(true);
    }
  }, []);

  const handleCopySql = () => {
    navigator.clipboard?.writeText?.(SQL_SNIPPET);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleSave = () => {
    if (!urlInput.trim() || !keyInput.trim()) {
      setTestResult({
        ok: false,
        message: 'Por favor preenche o URL e a chave anon do teu projeto Supabase.',
      });
      return;
    }

    if (!urlInput.startsWith('https://')) {
      setTestResult({
        ok: false,
        message: 'O Project URL deve começar por https:// (ex: https://xyzcompany.supabase.co)',
      });
      return;
    }

    saveCustomSupabaseConfig(urlInput.trim(), keyInput.trim());
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
    onConfigUpdated?.();
    handleTest(false);
  };

  const handleClear = () => {
    clearCustomSupabaseConfig();
    setUrlInput('');
    setKeyInput('');
    setTestResult(null);
    setSyncResult(null);
    onConfigUpdated?.();
  };

  const handleTest = async (isInitial = false) => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testSupabaseConnection();
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ ok: false, message: err?.message || 'Erro de conexão' });
    } finally {
      setTesting(false);
    }
  };

  const handleSyncAllAccounts = async () => {
    const config = getSupabaseConfig();
    if (!config.isConfigured) {
      setSyncResult('Guarda primeiro as credenciais do Supabase antes de sincronizar.');
      return;
    }

    setSyncingAccounts(true);
    setSyncResult(null);

    const accounts = getRegisteredAccounts();
    const result = await syncAllUsersToSupabase(accounts);

    setSyncingAccounts(false);
    setSyncResult(result.message);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-lg bg-[#0D0D16] border border-[#24243A] rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 bg-[#11111E] border-b border-[#1E1E30] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#22D3EE]/10 border border-[#22D3EE]/30 flex items-center justify-center text-[#22D3EE]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white font-['Outfit'] flex items-center gap-2">
                Conectar com Supabase Real
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  currentConfig.isConfigured 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {currentConfig.isConfigured ? '🟢 Conectado' : '⚪ Modo Local'}
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                Sincroniza novos cadastros, tokens e vibes com o teu banco PostgreSQL
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

        {/* Content Form */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Explanation Alert */}
          <div className="p-3 rounded-2xl bg-[#121222] border border-[#232338] space-y-1.5 text-zinc-300">
            <p className="leading-relaxed">
              No ambiente do Google AI Studio, a aplicação funciona em <strong className="text-white">modo local por defeito</strong>. Para que os novos cadastros e tokens sejam enviados para o teu painel Supabase, insere o teu Project URL e a chave pública (Anon Key):
            </p>
            <div className="p-2 rounded-xl bg-[#0A0A14] border border-[#1E1E30] flex items-center justify-between text-[11px]">
              <span className="text-zinc-400">Localização das chaves no Supabase:</span>
              <span className="font-mono text-[#22D3EE] font-medium">Settings &gt; API</span>
            </div>
          </div>

          {/* Project URL input */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#22D3EE]" />
              Project URL
            </label>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://xyzabcdefghijklm.supabase.co"
              className="w-full px-3 py-2.5 rounded-xl bg-[#090912] border border-[#25253A] text-white placeholder-zinc-600 focus:outline-none focus:border-[#22D3EE] font-mono text-xs"
            />
          </div>

          {/* Anon Key input */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-[#8B5CF6]" />
              API Anon Key (Public Key)
            </label>
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3 py-2.5 rounded-xl bg-[#090912] border border-[#25253A] text-white placeholder-zinc-600 focus:outline-none focus:border-[#8B5CF6] font-mono text-xs"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] text-white font-bold shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              {isSaved ? <Check className="w-4 h-4 text-white" /> : <ShieldCheck className="w-4 h-4" />}
              {isSaved ? 'Credenciais Guardadas!' : 'Guardar e Conectar'}
            </button>

            {currentConfig.isConfigured && (
              <button
                onClick={() => handleTest(false)}
                disabled={testing}
                className="px-3 py-2.5 rounded-xl bg-[#181829] border border-[#2B2B40] text-zinc-200 hover:text-white flex items-center gap-1.5 transition-all"
                title="Testar Conexão"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin text-[#22D3EE]' : ''}`} />
                <span>Testar</span>
              </button>
            )}

            {currentConfig.isConfigured && (
              <button
                onClick={handleClear}
                className="px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 flex items-center gap-1.5 transition-all"
                title="Desconectar"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Test Connection Output */}
          {testResult && (
            <div
              className={`p-3 rounded-2xl border flex items-start gap-2.5 ${
                testResult.ok
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-300'
              }`}
            >
              {testResult.ok ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              )}
              <div className="text-[11.5px] leading-relaxed">
                <strong>{testResult.ok ? 'Status Supabase:' : 'Atenção:'}</strong> {testResult.message}
              </div>
            </div>
          )}

          {/* Bulk Sync Registered Accounts */}
          <div className="p-3 rounded-2xl bg-[#11111E] border border-[#232338] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5 text-[11px]">
                <Users className="w-3.5 h-3.5 text-[#22D3EE]" />
                Contas Registadas no Navegador ({localAccounts.length})
              </span>
              <button
                onClick={handleSyncAllAccounts}
                disabled={syncingAccounts}
                className="px-2.5 py-1 rounded-lg bg-[#1E1E32] hover:bg-[#282845] text-[#22D3EE] font-bold text-[10.5px] border border-[#2F2F4B] transition-all flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${syncingAccounts ? 'animate-spin' : ''}`} />
                {syncingAccounts ? 'A sincronizar...' : 'Enviar Contas para o Supabase'}
              </button>
            </div>
            <p className="text-[10.5px] text-zinc-400">
              O teu novo cadastro está guardado na app com o seu token de 4 dígitos. Clica acima para enviar todos os utilizadores locais diretamente para a tabela <code className="text-zinc-200">public.users</code> do Supabase.
            </p>
            {syncResult && (
              <div className="p-2 rounded-xl bg-[#090912] border border-[#25253A] text-[10.5px] text-emerald-400 font-mono">
                {syncResult}
              </div>
            )}
          </div>

          {/* Quick SQL Helper to create table */}
          <div className="p-3 rounded-2xl bg-[#11111C] border border-[#202030] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-300 flex items-center gap-1.5 text-[11px]">
                <Code className="w-3.5 h-3.5 text-[#8B5CF6]" />
                Script SQL da Tabela public.users
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="px-2 py-0.5 rounded-lg bg-[#1B1B2C] hover:bg-[#25253C] text-xs text-white border border-[#2E2E44] flex items-center gap-1 transition-colors"
                >
                  {copiedSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-zinc-400" />}
                  <span>{copiedSql ? 'Copiado!' : 'Copiar SQL'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowSql(!showSql)}
                  className="p-1 text-zinc-400 hover:text-white"
                >
                  {showSql ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {showSql && (
              <pre className="p-2.5 rounded-xl bg-[#06060C] border border-[#1A1A28] text-[10px] text-emerald-400 font-mono overflow-x-auto whitespace-pre leading-relaxed">
                {SQL_SNIPPET}
              </pre>
            )}
            <p className="text-[10px] text-zinc-500">
              Cola este script no <strong>SQL Editor</strong> do painel Supabase para criar a tabela com as permissões de registo necessárias.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-[#11111E] border-t border-[#1E1E30] flex items-center justify-between">
          <span className="text-[11px] text-zinc-400">
            {currentConfig.isConfigured ? '🟢 Conexão Supabase Ativa' : '⚪ Modo de Testes em Memória/Local'}
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

