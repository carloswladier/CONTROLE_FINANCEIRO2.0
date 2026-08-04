import React from 'react';
import { 
  Receipt, 
  Plus, 
  Calendar, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Circle, 
  Droplet, 
  Zap, 
  Home, 
  Car, 
  Building2, 
  Landmark, 
  DollarSign, 
  HelpCircle 
} from 'lucide-react';
import { FixedExpenseItem } from '../types/finance';
import { FIXED_CATEGORY_LABELS, formatCurrency, formatMonthName } from '../utils/financeUtils';

interface FixedExpensesSectionProps {
  selectedYearMonth: string;
  fixedExpenses: FixedExpenseItem[];
  onOpenNewModal: () => void;
  onEditExpense: (item: FixedExpenseItem) => void;
  onDeleteExpense: (id: string) => void;
  onToggleFixedPaid: (expenseId: string, month: string) => void;
  onToggleFixedActive: (expenseId: string) => void;
}

export const FixedExpensesSection: React.FC<FixedExpensesSectionProps> = ({
  selectedYearMonth,
  fixedExpenses,
  onOpenNewModal,
  onEditExpense,
  onDeleteExpense,
  onToggleFixedPaid,
  onToggleFixedActive,
}) => {
  const activeItems = fixedExpenses.filter(f => f.active);
  const totalFixedAmount = activeItems.reduce((acc, curr) => acc + curr.amount, 0);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'agua': return <Droplet className="w-4 h-4 text-sky-500" />;
      case 'luz': return <Zap className="w-4 h-4 text-amber-500" />;
      case 'aluguel': return <Home className="w-4 h-4 text-indigo-500" />;
      case 'financiamento': return <Building2 className="w-4 h-4 text-violet-500" />;
      case 'emprestimo': return <Landmark className="w-4 h-4 text-purple-500" />;
      case 'iptu': return <Home className="w-4 h-4 text-rose-500" />;
      case 'ipva': return <Car className="w-4 h-4 text-red-500" />;
      default: return <Receipt className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold shadow-xs">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Gastos Fixos Recorrentes
            </h3>
            <p className="text-xs text-slate-500">
              Contas de água, luz, financiamentos, empréstimos, aluguel, IPTU, IPVA, etc.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-slate-500 block">Total Recorrente Mensal</span>
            <span className="text-lg font-extrabold text-slate-900">
              {formatCurrency(totalFixedAmount)}
            </span>
          </div>

          <button
            onClick={onOpenNewModal}
            className="inline-flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            id="add-fixed-expense-btn"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Gasto Fixo</span>
          </button>
        </div>
      </div>

      {/* List */}
      {fixedExpenses.length === 0 ? (
        <div className="text-center py-10 px-4 rounded-xl bg-slate-50 border border-dashed border-slate-200">
          <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-slate-700">Nenhum gasto fixo cadastrado</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Cadastre suas contas recorrentes mensais como Água, Luz, Aluguel, Financiamentos ou Impostos.
          </p>
          <button
            onClick={onOpenNewModal}
            className="mt-4 inline-flex items-center space-x-1.5 text-xs text-slate-800 hover:text-slate-900 font-semibold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Cadastrar primeiro gasto fixo</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
            <span>Contas Cadastradas ({fixedExpenses.length})</span>
            <span>Status no Mês {selectedYearMonth}</span>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {fixedExpenses.map((item) => {
              const isPaid = item.paidMonths?.includes(selectedYearMonth) || false;

              return (
                <div
                  key={item.id}
                  className={`p-4 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    !item.active ? 'opacity-50 bg-slate-50/50' : 'hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <button
                      onClick={() => onToggleFixedPaid(item.id, selectedYearMonth)}
                      className={`mt-0.5 p-1 rounded-lg transition-colors cursor-pointer ${
                        isPaid 
                          ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' 
                          : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'
                      }`}
                      title={isPaid ? 'Marcar como Pendente' : 'Marcar como Pago no Mês'}
                    >
                      {isPaid ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded bg-slate-100 text-slate-600">
                          {getCategoryIcon(item.category)}
                        </span>
                        <span className="font-semibold text-slate-900 text-sm">
                          {item.description}
                        </span>
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">
                          {FIXED_CATEGORY_LABELS[item.category] || item.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          Dia de vencimento: <b>{String(item.dueDay).padStart(2, '0')}</b>
                        </span>
                        <span>•</span>
                        <button
                          onClick={() => onToggleFixedActive(item.id)}
                          className={`text-[11px] underline cursor-pointer ${
                            item.active ? 'text-slate-500 hover:text-slate-700' : 'text-emerald-600 font-medium'
                          }`}
                        >
                          {item.active ? 'Pausar no orçamento' : 'Ativar no orçamento'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-right">
                      <span className="text-xs text-slate-500 block">Valor Mensal</span>
                      <span className="text-base font-bold text-slate-900">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => onEditExpense(item)}
                        className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Editar"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteExpense(item.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
