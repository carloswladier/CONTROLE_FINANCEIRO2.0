import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Receipt, 
  ShoppingBag, 
  TrendingUp, 
  Sparkles, 
  BarChart3, 
  LayoutGrid,
  Info
} from 'lucide-react';
import { 
  CreditCardExpenseItem, 
  FixedExpenseItem, 
  IncomeItem, 
  VariableExpenseItem 
} from './types/finance';
import { 
  calculateMonthlySummary, 
  getCurrentYearMonth, 
  INITIAL_CREDIT_EXPENSES, 
  INITIAL_FIXED_EXPENSES, 
  INITIAL_INCOMES, 
  INITIAL_VARIABLE_EXPENSES 
} from './utils/financeUtils';
import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { ForecastWidget } from './components/ForecastWidget';
import { ChartsSection } from './components/ChartsSection';
import { CreditCardSection } from './components/CreditCardSection';
import { FixedExpensesSection } from './components/FixedExpensesSection';
import { VariableExpensesSection } from './components/VariableExpensesSection';
import { IncomeSection } from './components/IncomeSection';
import { TransactionModal } from './components/TransactionModal';
import { ConfirmModal } from './components/ConfirmModal';
import { HostingerDbModal } from './components/HostingerDbModal';

type ActiveTab = 'all' | 'credit' | 'fixed' | 'variable' | 'income' | 'forecast' | 'charts';

export default function App() {
  const [selectedYearMonth, setSelectedYearMonth] = useState<string>(getCurrentYearMonth());
  const [activeTab, setActiveTab] = useState<ActiveTab>('all');

  // Core Data States
  const [incomes, setIncomes] = useState<IncomeItem[]>(() => {
    const saved = localStorage.getItem('cf_incomes');
    return saved ? JSON.parse(saved) : [];
  });

  const [fixedExpenses, setFixedExpenses] = useState<FixedExpenseItem[]>(() => {
    const saved = localStorage.getItem('cf_fixed');
    return saved ? JSON.parse(saved) : [];
  });

  const [variableExpenses, setVariableExpenses] = useState<VariableExpenseItem[]>(() => {
    const saved = localStorage.getItem('cf_variable');
    return saved ? JSON.parse(saved) : [];
  });

  const [creditExpenses, setCreditExpenses] = useState<CreditCardExpenseItem[]>(() => {
    const saved = localStorage.getItem('cf_credit');
    return saved ? JSON.parse(saved) : [];
  });

  // Hostinger Database States
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Check Hostinger DB connection status
  const checkDbStatus = async () => {
    try {
      const res = await fetch('/api/db/status');
      const json = await res.json();
      setDbStatus(json);
    } catch (err) {
      setDbStatus({
        configured: false,
        connected: false,
        error: 'Erro de comunicação ao checar banco Hostinger.'
      });
    }
  };

  useEffect(() => {
    checkDbStatus();
  }, []);

  const handlePushToHostingerDb = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/db/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incomes,
          fixedExpenses,
          variableExpenses,
          creditExpenses
        })
      });
      const json = await res.json();
      if (json.success) {
        alert('Dados salvos com sucesso no banco de dados Hostinger!');
        checkDbStatus();
      } else {
        alert('Erro ao salvar no banco Hostinger: ' + json.message);
      }
    } catch (err: any) {
      alert('Erro de comunicação: ' + (err?.message || err));
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePullFromHostingerDb = (data: any) => {
    if (!data) return;
    if (data.incomes) setIncomes(data.incomes);
    if (data.fixedExpenses) setFixedExpenses(data.fixedExpenses);
    if (data.variableExpenses) setVariableExpenses(data.variableExpenses);
    if (data.creditExpenses) setCreditExpenses(data.creditExpenses);
    alert('Dados carregados com sucesso do banco de dados Hostinger!');
    setIsDbModalOpen(false);
  };

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'credit' | 'fixed' | 'variable' | 'income'>('credit');
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // Custom Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'danger',
    onConfirm: () => {},
  });

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    variant: 'danger' | 'warning' | 'info' = 'danger'
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      variant,
      onConfirm,
    });
  };

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem('cf_incomes', JSON.stringify(incomes));
  }, [incomes]);

  useEffect(() => {
    localStorage.setItem('cf_fixed', JSON.stringify(fixedExpenses));
  }, [fixedExpenses]);

  useEffect(() => {
    localStorage.setItem('cf_variable', JSON.stringify(variableExpenses));
  }, [variableExpenses]);

  useEffect(() => {
    localStorage.setItem('cf_credit', JSON.stringify(creditExpenses));
  }, [creditExpenses]);

  // Monthly Summary Calculation
  const monthlySummary = calculateMonthlySummary(
    selectedYearMonth,
    incomes,
    fixedExpenses,
    variableExpenses,
    creditExpenses
  );

  // Modal Triggers
  const handleOpenModal = (type: 'credit' | 'fixed' | 'variable' | 'income' = 'credit', itemToEdit?: any) => {
    setModalType(type);
    setEditingItem(itemToEdit || null);
    setIsModalOpen(true);
  };

  // Clear all user data (Start completely blank)
  const handleClearData = () => {
    showConfirm(
      'Limpar Todos os Dados',
      'Deseja limpar todos os lançamentos da tabela? Esta ação apagará os dados atuais e você poderá inserir seus próprios novos valores.',
      () => {
        setIncomes([]);
        setFixedExpenses([]);
        setVariableExpenses([]);
        setCreditExpenses([]);
        localStorage.removeItem('cf_incomes');
        localStorage.removeItem('cf_fixed');
        localStorage.removeItem('cf_variable');
        localStorage.removeItem('cf_credit');
      },
      'danger'
    );
  };

  // Reset to Sample Demo Data
  const handleResetData = () => {
    showConfirm(
      'Carregar Dados de Exemplo',
      'Deseja carregar os dados de demonstração de exemplo? Isso substituirá seus dados atuais com exemplos.',
      () => {
        setIncomes(INITIAL_INCOMES);
        setFixedExpenses(INITIAL_FIXED_EXPENSES);
        setVariableExpenses(INITIAL_VARIABLE_EXPENSES);
        setCreditExpenses(INITIAL_CREDIT_EXPENSES);
        setSelectedYearMonth(getCurrentYearMonth());
      },
      'warning'
    );
  };

  // Export JSON
  const handleExportData = () => {
    const data = {
      incomes,
      fixedExpenses,
      variableExpenses,
      creditExpenses,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `controle-financeiro-backup-${selectedYearMonth}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.incomes && parsed.fixedExpenses && parsed.creditExpenses) {
          setIncomes(parsed.incomes);
          setFixedExpenses(parsed.fixedExpenses);
          setVariableExpenses(parsed.variableExpenses || []);
          setCreditExpenses(parsed.creditExpenses);
          alert('Dados importados com sucesso!');
        } else {
          alert('Arquivo JSON com formato inválido.');
        }
      } catch (err) {
        alert('Erro ao carregar o arquivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  // Handlers for Credit Card Expenses
  const handleSaveCredit = (item: Partial<CreditCardExpenseItem>) => {
    if (item.id) {
      setCreditExpenses(prev => prev.map(c => c.id === item.id ? { ...c, ...item } as CreditCardExpenseItem : c));
    } else {
      const newCard: CreditCardExpenseItem = {
        id: `card-${Date.now()}`,
        description: item.description || 'Nova Compra',
        totalAmount: item.totalAmount || 0,
        installments: item.installments || 1,
        dueDay: item.dueDay || 10,
        purchaseDate: item.purchaseDate || `${selectedYearMonth}-01`,
        startMonth: item.startMonth || selectedYearMonth,
        category: item.category || 'geral',
        cardName: item.cardName || 'Cartão Principal',
      };
      setCreditExpenses(prev => [newCard, ...prev]);
    }
  };

  const handleDeleteCredit = (id: string) => {
    showConfirm(
      'Excluir Compra',
      'Tem certeza que deseja excluir esta compra no cartão?',
      () => setCreditExpenses(prev => prev.filter(c => c.id !== id)),
      'danger'
    );
  };

  const handleToggleInstallmentPaid = (expenseId: string, installmentNumber: number) => {
    setCreditExpenses(prev => prev.map(exp => {
      if (exp.id !== expenseId) return exp;
      const currentPaid = exp.paidInstallments || [];
      const isAlreadyPaid = currentPaid.includes(installmentNumber);
      const newPaid = isAlreadyPaid 
        ? currentPaid.filter(i => i !== installmentNumber)
        : [...currentPaid, installmentNumber];
      return { ...exp, paidInstallments: newPaid };
    }));
  };

  // Handlers for Fixed Expenses
  const handleSaveFixed = (item: Partial<FixedExpenseItem>) => {
    if (item.id) {
      setFixedExpenses(prev => prev.map(f => f.id === item.id ? { ...f, ...item } as FixedExpenseItem : f));
    } else {
      const newFixed: FixedExpenseItem = {
        id: `fix-${Date.now()}`,
        description: item.description || 'Novo Gasto Fixo',
        amount: item.amount || 0,
        category: item.category || 'outros',
        dueDay: item.dueDay || 10,
        active: true,
      };
      setFixedExpenses(prev => [newFixed, ...prev]);
    }
  };

  const handleDeleteFixed = (id: string) => {
    showConfirm(
      'Excluir Gasto Fixo',
      'Tem certeza que deseja excluir este gasto fixo?',
      () => setFixedExpenses(prev => prev.filter(f => f.id !== id)),
      'danger'
    );
  };

  const handleToggleFixedPaid = (expenseId: string, month: string) => {
    setFixedExpenses(prev => prev.map(exp => {
      if (exp.id !== expenseId) return exp;
      const currentPaid = exp.paidMonths || [];
      const isPaid = currentPaid.includes(month);
      const newPaid = isPaid ? currentPaid.filter(m => m !== month) : [...currentPaid, month];
      return { ...exp, paidMonths: newPaid };
    }));
  };

  const handleToggleFixedActive = (expenseId: string) => {
    setFixedExpenses(prev => prev.map(f => f.id === expenseId ? { ...f, active: !f.active } : f));
  };

  // Handlers for Variable Expenses
  const handleSaveVariable = (item: Partial<VariableExpenseItem>) => {
    if (item.id) {
      setVariableExpenses(prev => prev.map(v => v.id === item.id ? { ...v, ...item } as VariableExpenseItem : v));
    } else {
      const newVar: VariableExpenseItem = {
        id: `var-${Date.now()}`,
        description: item.description || 'Novo Gasto',
        amount: item.amount || 0,
        category: item.category || 'outros',
        date: item.date || `${selectedYearMonth}-01`,
      };
      setVariableExpenses(prev => [newVar, ...prev]);
    }
  };

  const handleDeleteVariable = (id: string) => {
    showConfirm(
      'Excluir Gasto Variável',
      'Tem certeza que deseja excluir este gasto variável?',
      () => setVariableExpenses(prev => prev.filter(v => v.id !== id)),
      'danger'
    );
  };

  // Handlers for Income
  const handleSaveIncome = (item: Partial<IncomeItem>) => {
    if (item.id) {
      setIncomes(prev => prev.map(inc => inc.id === item.id ? { ...inc, ...item } as IncomeItem : inc));
    } else {
      const newInc: IncomeItem = {
        id: `inc-${Date.now()}`,
        description: item.description || 'Nova Receita',
        amount: item.amount || 0,
        category: item.category || 'outros',
        date: item.date || `${selectedYearMonth}-01`,
        isRecurring: item.isRecurring || false,
      };
      setIncomes(prev => [newInc, ...prev]);
    }
  };

  const handleDeleteIncome = (id: string) => {
    showConfirm(
      'Excluir Receita',
      'Tem certeza que deseja excluir esta receita?',
      () => setIncomes(prev => prev.filter(inc => inc.id !== id)),
      'danger'
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased">
      
      {/* Header Bar */}
      <Header
        selectedYearMonth={selectedYearMonth}
        onSelectYearMonth={setSelectedYearMonth}
        onOpenNewExpenseModal={handleOpenModal}
        onResetData={handleResetData}
        onClearData={handleClearData}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onOpenHostingerDbModal={() => setIsDbModalOpen(true)}
        dbConnected={Boolean(dbStatus?.connected)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* KPI Cards Summary */}
        <SummaryCards
          summary={monthlySummary}
          onNavigateToTab={(tab) => setActiveTab(tab as ActiveTab)}
        />

        {/* Tab Navigation Menu */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('all')}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80'
            }`}
            id="tab-all"
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Visão Geral do Mês</span>
          </button>

          <button
            onClick={() => setActiveTab('credit')}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'credit'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200/80'
            }`}
            id="tab-credit"
          >
            <CreditCard className="w-4 h-4" />
            <span>Cartão de Crédito</span>
          </button>

          <button
            onClick={() => setActiveTab('fixed')}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'fixed'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80'
            }`}
            id="tab-fixed"
          >
            <Receipt className="w-4 h-4" />
            <span>Gastos Fixos</span>
          </button>

          <button
            onClick={() => setActiveTab('variable')}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'variable'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-amber-600 hover:bg-amber-50 border border-slate-200/80'
            }`}
            id="tab-variable"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Gastos Variáveis</span>
          </button>

          <button
            onClick={() => setActiveTab('income')}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'income'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 border border-slate-200/80'
            }`}
            id="tab-income"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Ganhos / Receitas</span>
          </button>

          <button
            onClick={() => setActiveTab('charts')}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'charts'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-violet-600 hover:bg-violet-50 border border-slate-200/80'
            }`}
            id="tab-charts"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Gráficos</span>
          </button>

          <button
            onClick={() => setActiveTab('forecast')}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'forecast'
                ? 'bg-indigo-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-indigo-900 hover:bg-indigo-50 border border-slate-200/80'
            }`}
            id="tab-forecast"
          >
            <Sparkles className="w-4 h-4" />
            <span>Previsão Orçamentária</span>
          </button>
        </div>

        {/* Tab Content Rendering */}
        {activeTab === 'all' && (
          <div className="space-y-6">
            <ForecastWidget
              summary={monthlySummary}
              onOpenNewExpenseModal={handleOpenModal}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CreditCardSection
                selectedYearMonth={selectedYearMonth}
                creditExpenses={creditExpenses}
                onOpenNewModal={() => handleOpenModal('credit')}
                onEditExpense={(item) => handleOpenModal('credit', item)}
                onDeleteExpense={handleDeleteCredit}
                onToggleInstallmentPaid={handleToggleInstallmentPaid}
              />

              <FixedExpensesSection
                selectedYearMonth={selectedYearMonth}
                fixedExpenses={fixedExpenses}
                onOpenNewModal={() => handleOpenModal('fixed')}
                onEditExpense={(item) => handleOpenModal('fixed', item)}
                onDeleteExpense={handleDeleteFixed}
                onToggleFixedPaid={handleToggleFixedPaid}
                onToggleFixedActive={handleToggleFixedActive}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <VariableExpensesSection
                selectedYearMonth={selectedYearMonth}
                variableExpenses={variableExpenses}
                onOpenNewModal={() => handleOpenModal('variable')}
                onEditExpense={(item) => handleOpenModal('variable', item)}
                onDeleteExpense={handleDeleteVariable}
              />

              <IncomeSection
                selectedYearMonth={selectedYearMonth}
                incomes={incomes}
                onOpenNewModal={() => handleOpenModal('income')}
                onEditIncome={(item) => handleOpenModal('income', item)}
                onDeleteIncome={handleDeleteIncome}
              />
            </div>

            <ChartsSection
              selectedYearMonth={selectedYearMonth}
              incomes={incomes}
              fixedExpenses={fixedExpenses}
              variableExpenses={variableExpenses}
              creditExpenses={creditExpenses}
            />
          </div>
        )}

        {activeTab === 'credit' && (
          <CreditCardSection
            selectedYearMonth={selectedYearMonth}
            creditExpenses={creditExpenses}
            onOpenNewModal={() => handleOpenModal('credit')}
            onEditExpense={(item) => handleOpenModal('credit', item)}
            onDeleteExpense={handleDeleteCredit}
            onToggleInstallmentPaid={handleToggleInstallmentPaid}
          />
        )}

        {activeTab === 'fixed' && (
          <FixedExpensesSection
            selectedYearMonth={selectedYearMonth}
            fixedExpenses={fixedExpenses}
            onOpenNewModal={() => handleOpenModal('fixed')}
            onEditExpense={(item) => handleOpenModal('fixed', item)}
            onDeleteExpense={handleDeleteFixed}
            onToggleFixedPaid={handleToggleFixedPaid}
            onToggleFixedActive={handleToggleFixedActive}
          />
        )}

        {activeTab === 'variable' && (
          <VariableExpensesSection
            selectedYearMonth={selectedYearMonth}
            variableExpenses={variableExpenses}
            onOpenNewModal={() => handleOpenModal('variable')}
            onEditExpense={(item) => handleOpenModal('variable', item)}
            onDeleteExpense={handleDeleteVariable}
          />
        )}

        {activeTab === 'income' && (
          <IncomeSection
            selectedYearMonth={selectedYearMonth}
            incomes={incomes}
            onOpenNewModal={() => handleOpenModal('income')}
            onEditIncome={(item) => handleOpenModal('income', item)}
            onDeleteIncome={handleDeleteIncome}
          />
        )}

        {activeTab === 'charts' && (
          <ChartsSection
            selectedYearMonth={selectedYearMonth}
            incomes={incomes}
            fixedExpenses={fixedExpenses}
            variableExpenses={variableExpenses}
            creditExpenses={creditExpenses}
          />
        )}

        {activeTab === 'forecast' && (
          <ForecastWidget
            summary={monthlySummary}
            onOpenNewExpenseModal={handleOpenModal}
          />
        )}

      </main>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        initialType={modalType}
        editingItem={editingItem}
        selectedYearMonth={selectedYearMonth}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSaveCredit={handleSaveCredit}
        onSaveFixed={handleSaveFixed}
        onSaveVariable={handleSaveVariable}
        onSaveIncome={handleSaveIncome}
      />

      {/* Confirmation Dialog Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Hostinger DB Connection Modal */}
      <HostingerDbModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        onPullFromDb={handlePullFromHostingerDb}
        onPushToDb={handlePushToHostingerDb}
        isSyncing={isSyncing}
        dbStatus={dbStatus}
        checkDbStatus={checkDbStatus}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          Controle Financeiro Pessoal • Gestão Inteligente de Cartões, Parcelas e Gastos Fixos
        </div>
      </footer>

    </div>
  );
}
