import React, { useState, useMemo } from 'react';
import { 
  CreditCard, 
  Plus, 
  Calendar, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Circle, 
  ChevronRight, 
  Tag, 
  AlertCircle,
  HelpCircle,
  Filter,
  FilterX,
  Search
} from 'lucide-react';
import { CreditCardExpenseItem } from '../types/finance';
import { 
  getInstallmentsForMonth, 
  formatCurrency, 
  formatMonthName, 
  addMonthsToYearMonth 
} from '../utils/financeUtils';

interface CreditCardSectionProps {
  selectedYearMonth: string;
  creditExpenses: CreditCardExpenseItem[];
  onOpenNewModal: () => void;
  onEditExpense: (item: CreditCardExpenseItem) => void;
  onDeleteExpense: (id: string) => void;
  onToggleInstallmentPaid: (expenseId: string, installmentNumber: number) => void;
}

export const CreditCardSection: React.FC<CreditCardSectionProps> = ({
  selectedYearMonth,
  creditExpenses,
  onOpenNewModal,
  onEditExpense,
  onDeleteExpense,
  onToggleInstallmentPaid,
}) => {
  const [selectedExpenseForDetail, setSelectedExpenseForDetail] = useState<CreditCardExpenseItem | null>(null);

  // Filter States
  const [selectedCardFilter, setSelectedCardFilter] = useState<string>('all');
  const [selectedDueDayFilter, setSelectedDueDayFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract available unique Card names (including standard presets)
  const defaultCardExamples = ['PDA', 'C6 BANK', 'VISA AZUL', 'VISA SANTANDER', 'Cartão Principal'];
  const availableCards = useMemo(() => {
    const cardsInExpenses = creditExpenses
      .map(e => (e.cardName || 'Cartão Principal').trim())
      .filter(Boolean);
    const merged = Array.from(new Set([...cardsInExpenses, ...defaultCardExamples]));
    return merged.sort((a, b) => a.localeCompare(b));
  }, [creditExpenses]);

  // Extract available unique Due Days
  const availableDueDays = useMemo(() => {
    const daysInExpenses = creditExpenses.map(e => e.dueDay).filter(d => d && d >= 1 && d <= 31);
    const merged = Array.from(new Set(daysInExpenses.length > 0 ? daysInExpenses : [5, 10, 15, 20, 25, 30]));
    return merged.sort((a, b) => a - b);
  }, [creditExpenses]);

  // Get active installments for the currently selected month
  const currentProjections = getInstallmentsForMonth(creditExpenses, selectedYearMonth);
  const totalBillForMonth = currentProjections.reduce((acc, curr) => acc + curr.installmentAmount, 0);

  // Filtered Projections based on Card Name, Due Day, and Search Query
  const filteredProjections = useMemo(() => {
    return currentProjections.filter((item) => {
      // Card Filter
      if (selectedCardFilter !== 'all') {
        const itemCard = (item.cardName || 'Cartão Principal').trim().toLowerCase();
        if (itemCard !== selectedCardFilter.trim().toLowerCase()) {
          return false;
        }
      }

      // Due Day Filter
      if (selectedDueDayFilter !== 'all') {
        if (String(item.dueDay) !== String(selectedDueDayFilter)) {
          return false;
        }
      }

      // Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const descMatch = item.description.toLowerCase().includes(q);
        const catMatch = item.category.toLowerCase().includes(q);
        const cardMatch = (item.cardName || '').toLowerCase().includes(q);
        if (!descMatch && !catMatch && !cardMatch) {
          return false;
        }
      }

      return true;
    });
  }, [currentProjections, selectedCardFilter, selectedDueDayFilter, searchQuery]);

  const totalFilteredBill = useMemo(() => {
    return filteredProjections.reduce((acc, curr) => acc + curr.installmentAmount, 0);
  }, [filteredProjections]);

  const isFiltered = selectedCardFilter !== 'all' || selectedDueDayFilter !== 'all' || searchQuery.trim() !== '';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
      
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Fatura de Cartão de Crédito
              <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-medium">
                Vencimento do dia 01 ao 30
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Gastos parcelados aplicados automaticamente aos meses seguintes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-slate-500 block">Fatura {formatMonthName(selectedYearMonth)}</span>
            <span className="text-lg font-extrabold text-indigo-600">
              {formatCurrency(isFiltered ? totalFilteredBill : totalBillForMonth)}
            </span>
            {isFiltered && (
              <span className="text-[10px] text-slate-400 block">
                Total sem filtro: {formatCurrency(totalBillForMonth)}
              </span>
            )}
          </div>

          <button
            onClick={onOpenNewModal}
            className="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            id="add-card-purchase-btn"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Compra</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      {currentProjections.length > 0 && (
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5 text-indigo-600" />
              Filtrar Fatura por Cartão ou Vencimento
            </span>
            {isFiltered && (
              <button
                onClick={() => {
                  setSelectedCardFilter('all');
                  setSelectedDueDayFilter('all');
                  setSearchQuery('');
                }}
                className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer transition-colors"
              >
                <FilterX className="w-3.5 h-3.5" />
                Limpar Filtros
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Card Name Select */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Cartão de Crédito
              </label>
              <div className="relative flex items-center">
                <CreditCard className="w-4 h-4 text-slate-400 absolute left-2.5 pointer-events-none" />
                <select
                  value={selectedCardFilter}
                  onChange={(e) => setSelectedCardFilter(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  id="filter-card-select"
                >
                  <option value="all">Todos os Cartões</option>
                  {availableCards.map((card) => (
                    <option key={card} value={card}>
                      {card}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Due Day Select */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Dia de Vencimento
              </label>
              <div className="relative flex items-center">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-2.5 pointer-events-none" />
                <select
                  value={selectedDueDayFilter}
                  onChange={(e) => setSelectedDueDayFilter(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  id="filter-dueday-select"
                >
                  <option value="all">Todos os Vencimentos</option>
                  {availableDueDays.map((day) => (
                    <option key={day} value={String(day)}>
                      Vencimento no dia {String(day).padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search Input */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Buscar Compra
              </label>
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute left-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Descrição ou categoria..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Active Badges */}
          {isFiltered && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/60 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-500 font-medium">Filtro ativo:</span>
                {selectedCardFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md text-[11px] font-semibold">
                    Cartão: {selectedCardFilter}
                    <button onClick={() => setSelectedCardFilter('all')} className="hover:text-indigo-900 ml-0.5 cursor-pointer">✕</button>
                  </span>
                )}
                {selectedDueDayFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md text-[11px] font-semibold">
                    Vencimento: Dia {String(selectedDueDayFilter).padStart(2, '0')}
                    <button onClick={() => setSelectedDueDayFilter('all')} className="hover:text-indigo-900 ml-0.5 cursor-pointer">✕</button>
                  </span>
                )}
                {searchQuery.trim() !== '' && (
                  <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md text-[11px] font-semibold">
                    Busca: "{searchQuery}"
                    <button onClick={() => setSearchQuery('')} className="hover:text-indigo-900 ml-0.5 cursor-pointer">✕</button>
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-500">
                Subtotal filtrado: <b className="text-indigo-700">{formatCurrency(totalFilteredBill)}</b> ({filteredProjections.length} {filteredProjections.length === 1 ? 'item' : 'itens'})
              </span>
            </div>
          )}
        </div>
      )}

      {/* Active Installments List for the selected Month */}
      {currentProjections.length === 0 ? (
        <div className="text-center py-10 px-4 rounded-xl bg-slate-50 border border-dashed border-slate-200">
          <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-slate-700">Nenhuma parcela neste mês</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Não há compras com parcelas ativas marcadas para {formatMonthName(selectedYearMonth)}.
          </p>
          <button
            onClick={onOpenNewModal}
            className="mt-4 inline-flex items-center space-x-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Cadastrar primeira compra no cartão</span>
          </button>
        </div>
      ) : filteredProjections.length === 0 ? (
        <div className="text-center py-10 px-4 rounded-xl bg-slate-50 border border-dashed border-slate-200">
          <FilterX className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-slate-700">Nenhuma compra encontrada</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Não foram encontradas compras com os filtros selecionados para este mês.
          </p>
          <button
            onClick={() => {
              setSelectedCardFilter('all');
              setSelectedDueDayFilter('all');
              setSearchQuery('');
            }}
            className="mt-3 inline-flex items-center space-x-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
          >
            <FilterX className="w-3.5 h-3.5" />
            <span>Limpar filtros de busca</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
            <span>
              Parcelas Devidas em {formatMonthName(selectedYearMonth)} ({filteredProjections.length}{isFiltered ? ` de ${currentProjections.length}` : ''})
            </span>
            {isFiltered && (
              <span className="text-indigo-600 font-bold">
                Total Filtrado: {formatCurrency(totalFilteredBill)}
              </span>
            )}
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {filteredProjections.map((item) => {
              const originalExpense = creditExpenses.find(e => e.id === item.expenseId);

              return (
                <div 
                  key={`${item.expenseId}-${item.currentInstallment}`}
                  className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start space-x-3">
                    <button
                      onClick={() => onToggleInstallmentPaid(item.expenseId, item.currentInstallment)}
                      className={`mt-0.5 p-1 rounded-lg transition-colors cursor-pointer ${
                        item.isPaid 
                          ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' 
                          : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'
                      }`}
                      title={item.isPaid ? 'Marcar como Pendente' : 'Marcar como Pago'}
                    >
                      {item.isPaid ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-sm">
                          {item.description}
                        </span>
                        <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                          Parcela {item.currentInstallment}/{item.totalInstallments}
                        </span>
                        {item.cardName && (
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                            {item.cardName}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          Vencimento: dia {String(item.dueDay).padStart(2, '0')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Tag className="w-3 h-3 text-slate-400" />
                          {item.category}
                        </span>
                        <span className="text-slate-400">
                          Total da compra: {formatCurrency(item.installmentAmount * item.totalInstallments)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-right">
                      <span className="text-xs text-slate-500 block">Valor da Parcela</span>
                      <span className="text-base font-bold text-slate-900">
                        {formatCurrency(item.installmentAmount)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      {originalExpense && (
                        <>
                          <button
                            onClick={() => setSelectedExpenseForDetail(originalExpense)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Ver projeção de parcelas nos outros meses"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEditExpense(originalExpense)}
                            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Editar Compra"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteExpense(originalExpense.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Excluir Compra"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Projection Modal / Detail for Selected Credit Purchase */}
      {selectedExpenseForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-bold text-slate-900 text-base">
                  Projeção de Parcelas nos Meses
                </h4>
                <p className="text-xs text-slate-500">
                  {selectedExpenseForDetail.description} ({selectedExpenseForDetail.installments}x)
                </p>
              </div>
              <button
                onClick={() => setSelectedExpenseForDetail(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {Array.from({ length: selectedExpenseForDetail.installments }).map((_, idx) => {
                const instNum = idx + 1;
                const instMonth = addMonthsToYearMonth(selectedExpenseForDetail.startMonth, idx);
                const instAmount = selectedExpenseForDetail.totalAmount / selectedExpenseForDetail.installments;
                const isSelected = instMonth === selectedYearMonth;

                return (
                  <div
                    key={instNum}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                      isSelected 
                        ? 'bg-indigo-50 border-indigo-200 font-semibold' 
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <span className="text-slate-900 font-medium">
                        Parcela {instNum} de {selectedExpenseForDetail.installments}
                      </span>
                      <span className="text-slate-500 block text-[11px]">
                        Vencimento no mês: <b>{formatMonthName(instMonth)}</b> (Dia {selectedExpenseForDetail.dueDay})
                      </span>
                    </div>

                    <span className="font-bold text-indigo-700">
                      {formatCurrency(instAmount)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedExpenseForDetail(null)}
                className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
