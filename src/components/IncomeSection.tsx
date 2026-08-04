import React from 'react';
import { 
  TrendingUp, 
  Plus, 
  Calendar, 
  Trash2, 
  Edit3, 
  DollarSign, 
  Briefcase, 
  Home, 
  Plane, 
  Smartphone, 
  Sparkles,
  Repeat
} from 'lucide-react';
import { IncomeItem } from '../types/finance';
import { INCOME_CATEGORY_LABELS, formatCurrency } from '../utils/financeUtils';

interface IncomeSectionProps {
  selectedYearMonth: string;
  incomes: IncomeItem[];
  onOpenNewModal: () => void;
  onEditIncome: (item: IncomeItem) => void;
  onDeleteIncome: (id: string) => void;
}

export const IncomeSection: React.FC<IncomeSectionProps> = ({
  selectedYearMonth,
  incomes,
  onOpenNewModal,
  onEditIncome,
  onDeleteIncome,
}) => {
  const currentMonthIncomes = incomes.filter(inc => {
    if (inc.isRecurring) return true;
    return inc.date.startsWith(selectedYearMonth);
  });

  const totalIncome = currentMonthIncomes.reduce((acc, curr) => acc + curr.amount, 0);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'salario': return <Briefcase className="w-4 h-4 text-emerald-600" />;
      case 'aluguel': return <Home className="w-4 h-4 text-teal-600" />;
      case 'passagem': return <Plane className="w-4 h-4 text-cyan-600" />;
      case 'conserto': return <Smartphone className="w-4 h-4 text-indigo-600" />;
      case 'renda_extra': return <Sparkles className="w-4 h-4 text-amber-600" />;
      default: return <DollarSign className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Entradas & Ganhos
            </h3>
            <p className="text-xs text-slate-500">
              Salário, aluguel, venda de passagens, conserto de celulares, serviços e rendas extras
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-slate-500 block">Total de Entradas</span>
            <span className="text-lg font-extrabold text-emerald-600">
              {formatCurrency(totalIncome)}
            </span>
          </div>

          <button
            onClick={onOpenNewModal}
            className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            id="add-income-item-btn"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Receita</span>
          </button>
        </div>
      </div>

      {/* List */}
      {currentMonthIncomes.length === 0 ? (
        <div className="text-center py-10 px-4 rounded-xl bg-slate-50 border border-dashed border-slate-200">
          <TrendingUp className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-slate-700">Nenhum ganho cadastrado para este mês</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Cadastre seus rendimentos mensais como salário fixo, comissões ou receitas avulsas.
          </p>
          <button
            onClick={onOpenNewModal}
            className="mt-4 inline-flex items-center space-x-1.5 text-xs text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Cadastrar primeira receita</span>
          </button>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
          {currentMonthIncomes.map((item) => {
            const [y, m, d] = item.date.split('-');
            const formattedDate = `${d}/${m}/${y}`;

            return (
              <div
                key={item.id}
                className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-xl bg-emerald-50 shrink-0">
                    {getCategoryIcon(item.category)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-sm">
                        {item.description}
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                        {INCOME_CATEGORY_LABELS[item.category] || item.category}
                      </span>
                      {item.isRecurring && (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
                          <Repeat className="w-3 h-3 text-emerald-600" />
                          Mensal Recorrente
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        Data / Início: <b>{formattedDate}</b>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Valor do Ganho</span>
                    <span className="text-base font-bold text-emerald-600">
                      + {formatCurrency(item.amount)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onEditIncome(item)}
                      className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Editar"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteIncome(item.id)}
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
      )}

    </div>
  );
};
