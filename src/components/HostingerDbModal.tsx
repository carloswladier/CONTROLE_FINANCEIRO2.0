import React, { useState, useEffect } from 'react';
import { 
  Database, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  UploadCloud, 
  DownloadCloud, 
  ExternalLink, 
  Key, 
  Server, 
  ShieldCheck,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';

interface HostingerDbStatus {
  configured: boolean;
  connected: boolean;
  latencyMs?: number;
  message?: string;
  error?: string;
  errorCode?: string;
  config?: {
    host: string;
    port: number;
    user: string;
    database: string;
    hasPassword: boolean;
  };
}

interface HostingerDbModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPullFromDb: (data: any) => void;
  onPushToDb: () => void;
  isSyncing: boolean;
  dbStatus: HostingerDbStatus | null;
  checkDbStatus: () => Promise<void>;
}

export const HostingerDbModal: React.FC<HostingerDbModalProps> = ({
  isOpen,
  onClose,
  onPullFromDb,
  onPushToDb,
  isSyncing,
  dbStatus,
  checkDbStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'test' | 'guide'>('status');

  // Test custom form
  const [testHost, setTestHost] = useState('');
  const [testPort, setTestPort] = useState('3306');
  const [testUser, setTestUser] = useState('');
  const [testPassword, setTestPassword] = useState('');
  const [testDatabase, setTestDatabase] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);

  const [copiedEnv, setCopiedEnv] = useState(false);

  useEffect(() => {
    if (isOpen) {
      checkDbStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestLoading(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/db/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: testHost.trim(),
          port: testPort.trim(),
          user: testUser.trim(),
          password: testPassword,
          database: testDatabase.trim(),
        })
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`O servidor retornou uma resposta inválida (Status ${res.status}). O servidor Node/Express pode ter sido reiniciado; tente novamente.`);
      }

      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: 'Erro de comunicação ao testar conexão: ' + (err?.message || err)
      });
    } finally {
      setTestLoading(false);
    }
  };

  const envSnippet = `# Adicione estas variáveis nas Secrets / Configurações do AI Studio:
HOSTINGER_DB_HOST=${testHost || dbStatus?.config?.host || 'sql123.main-hosting.eu'}
HOSTINGER_DB_PORT=${testPort || '3306'}
HOSTINGER_DB_USER=${testUser || dbStatus?.config?.user || 'u123456789_usuario'}
HOSTINGER_DB_PASSWORD=${testPassword ? '********' : 'sua_senha_aqui'}
HOSTINGER_DB_NAME=${testDatabase || dbStatus?.config?.database || 'u123456789_meubanco'}`;

  const copyEnvSnippet = () => {
    navigator.clipboard.writeText(envSnippet);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full my-8 shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl transition-colors cursor-pointer"
          >
            ✕
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/20 border border-indigo-400/30 rounded-xl text-indigo-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Conexão Banco de Dados Hostinger MySQL</h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Sincronize e armazene seus dados financeiros diretamente no seu banco Hostinger
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('status')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'status'
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              Status Atual
            </button>
            <button
              onClick={() => setActiveTab('test')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'test'
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              Testar Conexão
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'guide'
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Passo a Passo Hostinger
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">

          {/* TAB 1: STATUS */}
          {activeTab === 'status' && (
            <div className="space-y-6">
              {/* Connection Status Box */}
              <div className={`p-4 rounded-xl border flex items-start justify-between gap-4 ${
                dbStatus?.connected
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : dbStatus?.configured
                  ? 'bg-rose-50 border-rose-200 text-rose-950'
                  : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}>
                <div className="flex items-start gap-3">
                  {dbStatus?.connected ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                  ) : dbStatus?.configured ? (
                    <XCircle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="text-sm font-bold">
                      {dbStatus?.connected
                        ? 'Conectado ao MySQL da Hostinger'
                        : dbStatus?.configured
                        ? 'Erro na Conexão com a Hostinger'
                        : 'Aguardando Configuração das Credenciais'}
                    </h4>
                    <p className="text-xs mt-1 leading-relaxed">
                      {dbStatus?.message || dbStatus?.error || 'Configure o arquivo de ambiente para conectar automaticamente.'}
                    </p>
                    {dbStatus?.latencyMs !== undefined && (
                      <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">
                        Latência: {dbStatus.latencyMs} ms
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => checkDbStatus()}
                  className="p-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 flex-shrink-0 cursor-pointer"
                  title="Recarregar Status"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Testar Novamente
                </button>
              </div>

              {/* Current Configuration Table */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Parâmetros de Conexão Atuais
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[10px] font-bold">HOST (SERVIDOR)</span>
                    <span className="font-semibold text-slate-800 truncate block">
                      {dbStatus?.config?.host || 'Não definido (HOSTINGER_DB_HOST)'}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[10px] font-bold">PORTA</span>
                    <span className="font-semibold text-slate-800">
                      {dbStatus?.config?.port || 3306}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[10px] font-bold">USUÁRIO</span>
                    <span className="font-semibold text-slate-800 truncate block">
                      {dbStatus?.config?.user || 'Não definido (HOSTINGER_DB_USER)'}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[10px] font-bold">BANCO DE DADOS</span>
                    <span className="font-semibold text-slate-800 truncate block">
                      {dbStatus?.config?.database || 'Não definido (HOSTINGER_DB_NAME)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions: Sync Push / Pull */}
              <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  Sincronização de Dados Financeiros
                </h4>
                <p className="text-xs text-indigo-900/80">
                  Transfira seus dados atuais do controle financeiro para a Hostinger ou baixe os registros salvos na nuvem.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                  <button
                    onClick={onPushToDb}
                    disabled={!dbStatus?.connected || isSyncing}
                    className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
                  >
                    <UploadCloud className="w-4 h-4" />
                    Enviar Dados para Hostinger (Salvar)
                  </button>

                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/db/sync');
                        const json = await res.json();
                        if (json.success) {
                          onPullFromDb(json.data);
                        } else {
                          alert('Erro ao carregar do banco: ' + json.message);
                        }
                      } catch (err: any) {
                        alert('Falha ao se comunicar com a API: ' + err.message);
                      }
                    }}
                    disabled={!dbStatus?.connected || isSyncing}
                    className="w-full sm:w-auto px-4 py-2.5 bg-white border border-indigo-200 hover:bg-indigo-50 disabled:opacity-50 text-indigo-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <DownloadCloud className="w-4 h-4" />
                    Baixar Dados da Hostinger (Carregar)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TEST CUSTOM CONNECTION */}
          {activeTab === 'test' && (
            <form onSubmit={handleTestConnection} className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-600">
                <p>
                  Teste suas credenciais de acesso ao MySQL da Hostinger antes de gravá-las no ambiente. 
                  Ao testar, o sistema verificará a conexão e criará automaticamente as tabelas necessárias (`cf_incomes`, `cf_fixed_expenses`, etc).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Servidor (Host) MySQL
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: sql123.main-hosting.eu ou IP"
                    value={testHost}
                    onChange={(e) => setTestHost(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Porta
                  </label>
                  <input
                    type="number"
                    value={testPort}
                    onChange={(e) => setTestPort(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Usuário do Banco (User)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: u123456789_usuario"
                    value={testUser}
                    onChange={(e) => setTestUser(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Senha (Password)
                  </label>
                  <input
                    type="password"
                    placeholder="Sua senha do banco"
                    value={testPassword}
                    onChange={(e) => setTestPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Nome do Banco de Dados (Database Name)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: u123456789_financas"
                    value={testDatabase}
                    onChange={(e) => setTestDatabase(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="submit"
                  disabled={testLoading}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-colors"
                >
                  {testLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Testando Conexão...
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      Testar Conexão Hostinger
                    </>
                  )}
                </button>
              </div>

              {testResult && (
                <div className={`p-4 rounded-xl text-xs border ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}>
                  <div className="font-bold flex items-center gap-1.5 mb-1">
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600" />
                    )}
                    {testResult.success ? 'Conexão bem sucedida!' : 'Falha na conexão'}
                  </div>
                  <p>{testResult.message}</p>
                  {testResult.latencyMs && (
                    <span className="mt-1 font-semibold block text-[11px]">
                      Tempo de resposta: {testResult.latencyMs}ms
                    </span>
                  )}
                </div>
              )}
            </form>
          )}

          {/* TAB 3: HOSTINGER STEP BY STEP GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs text-slate-700">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-amber-900 leading-relaxed">
                <p className="font-bold mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Importante sobre a Hostinger: Liberação de MySQL Remoto
                </p>
                <p className="mb-2">
                  Por padrão, a Hostinger bloqueia acessos externos ao banco de dados por segurança. Para que o sistema consiga se conectar, você precisa habilitar o <b>MySQL Remoto</b> no seu hPanel.
                </p>
                <p className="text-[11px] bg-amber-100/70 p-2 rounded-lg font-medium text-amber-950">
                  💡 <b>Nota sobre SSL:</b> A variável <code>HOSTINGER_DB_SSL</code> é <b>opcional</b> e não existe no painel da Hostinger. Você pode ignorá-la ou deixar como <code>false</code>.
                </p>
              </div>

              <ol className="space-y-3 list-decimal list-inside pl-1 text-slate-800 font-medium">
                <li className="leading-relaxed">
                  <span className="font-bold">Acesse o hPanel da Hostinger</span> e selecione a opção <b>Bancos de Dados MySQL</b>.
                </li>
                <li className="leading-relaxed">
                  <span className="font-bold">Crie um novo Banco e Usuário</span> (ou utilize um existente). Anote o nome do servidor MySQL (ex: <code>sql123.main-hosting.eu</code>), o nome do banco, usuário e senha.
                </li>
                <li className="leading-relaxed">
                  <span className="font-bold">Habilite o Remote MySQL (MySQL Remoto):</span>
                  <p className="text-slate-600 font-normal mt-1 pl-4">
                    No menu lateral do hPanel, clique em <b>Bancos de Dados &gt; MySQL Remoto</b>. Selecione o seu banco de dados e no campo IP coloque <code>%</code> (o símbolo de porcentagem autoriza conexões de qualquer IP) e clique em <b>Criar</b>.
                  </p>
                </li>
                <li className="leading-relaxed">
                  <span className="font-bold">Adicione as variáveis no AI Studio:</span>
                  <p className="text-slate-600 font-normal mt-1 pl-4">
                    Copie o modelo de variáveis abaixo e cole nas configurações de Secrets do projeto:
                  </p>
                </li>
              </ol>

              {/* Code Snippet Box */}
              <div className="bg-slate-900 text-slate-100 p-3.5 rounded-xl font-mono text-[11px] relative">
                <button
                  type="button"
                  onClick={copyEnvSnippet}
                  className="absolute top-2.5 right-2.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-sans font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copiedEnv ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copiar Modelo
                    </>
                  )}
                </button>
                <pre className="whitespace-pre-wrap leading-relaxed overflow-x-auto pr-16">{envSnippet}</pre>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${dbStatus?.connected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            Status Hostinger: {dbStatus?.connected ? 'Online' : 'Offline'}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
