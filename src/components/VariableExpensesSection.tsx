import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Plus, 
  Calendar, 
  Trash2, 
  Edit3, 
  Utensils, 
  Fuel, 
  Smile, 
  MoreHorizontal,
  Search,
  Filter
} from 'lucide-react';
import { VariableExpenseItem } from '../types/finance';
import { VARIABLE_CATEGORY_LABELS, formatCurrency } from '../utils/financeUtils';

interface VariableExpensesSectionProps {
  selectedYearMonth: string;
  variableExpenses: VariableExpenseItem[];
  onOpenNewModal: () => void;
  onEditExpense: (item: VariableExpenseItem) => void;
  onDeleteExpense: (id: string) => void;
}

export const VariableExpensesSection: React.FC<VariableExpensesSectionProps> = ({
  selectedYearMonth,
  variableExpenses,
  onOpenNewModal,
  onEditExpense,
  onDeleteExpense,
}) => {
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currentMonthExpenses = variableExpenses.filter(v => v.date.startsWith(selectedYearMonth));

  const filteredExpenses = currentMonthExpenses.filter(v => {
    const matchesCategory = selectedCategoryFilter === 'all' || v.category === selectedCategoryFilter;
    const matchesSearch = v.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalVariable = currentMonthExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'comida': return <Utensils className="w-4 h-4 text-orange-500" />;
      case 'combustivel': return <Fuel className="w-4 h-4 text-rose-500" />;
      case 'lazer': return <Smile className="w-4 h-4 text-purple-500" />;
      default: return <ShoppingBag className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Gastos Variáveis & Diversos
            </h3>
            <p className="text-xs text-slate-500">
              Despesas do dia a dia: alimentação/comida, combustível, lazer, compras avulsas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-slate-500 block">Variáveis no Mês</span>
            <span className="text-lg font-extrabold text-amber-600">
              {formatCurrency(totalVariable)}
            </span>
          </div>

          <button
            onClick={onOpenNewModal}
            className="inline-flex items-center space-x-1.5 bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            id="add-variable-expense-btn"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Gasto</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar gasto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
              selectedCategoryFilter === 'all' 
                ? 'bg-amber-100 text-amber-900 font-semibold' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setSelectedCategoryFilter('comida')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
              selectedCategoryFilter === 'comida' 
                ? 'bg-orange-100 text-orange-900 font-semibold' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Comida
          </button>
          <button
            onClick={() => setSelectedCategoryFilter('combustivel')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
              selectedCategoryFilter === 'combustivel' 
                ? 'bg-rose-100 text-rose-900 font-semibold' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Combustível
          </button>
          <button
            onClick={() => setSelectedCategoryFilter('lazer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
              selectedCategoryFilter === 'lazer' 
                ? 'bg-purple-100 text-purple-900 font-semibold' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Lazer
          </button>
        </div>
      </div>

      {/* List */}
      {filteredExpenses.length === 0 ? (
        <div className="text-center py-10 px-4 rounded-xl bg-slate-50 border border-dashed border-slate-200">
          <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-slate-700">Nenhum gasto variável neste mês</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Lance seus gastos do dia a dia como supermercado, combustível, lazer e compras em geral.
          </p>
          <button
            onClick={onOpenNewModal}
            className="mt-4 inline-flex items-center space-x-1.5 text-xs text-amber-700 hover:text-amber-900 font-semibold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar gasto pontual</span>
          </button>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
          {filteredExpenses.map((item) => {
            const [y, m, d] = item.date.split('-');
            const formattedDate = `${d}/${m}/${y}`;

            return (
              <div
                key={item.id}
                className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-xl bg-slate-100 shrink-0">
                    {getCategoryIcon(item.category)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-sm">
                        {item.description}
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">
                        {VARIABLE_CATEGORY_LABELS[item.category] || item.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        Data: <b>{formattedDate}</b>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Valor</span>
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
      )}

    </div>
  );
};
