import React, { useState, useEffect } from 'react';
import { X, CreditCard, Receipt, ShoppingBag, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { 
  CreditCardExpenseItem, 
  FixedExpenseItem, 
  IncomeItem, 
  VariableExpenseItem 
} from '../types/finance';
import { formatCurrency, getCurrentYearMonth } from '../utils/financeUtils';

type ModalType = 'credit' | 'fixed' | 'variable' | 'income';

interface TransactionModalProps {
  isOpen: boolean;
  initialType?: ModalType;
  editingItem?: any; // item being edited if any
  selectedYearMonth: string;
  onClose: () => void;
  onSaveCredit: (item: Partial<CreditCardExpenseItem>) => void;
  onSaveFixed: (item: Partial<FixedExpenseItem>) => void;
  onSaveVariable: (item: Partial<VariableExpenseItem>) => void;
  onSaveIncome: (item: Partial<IncomeItem>) => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  initialType = 'credit',
  editingItem,
  selectedYearMonth,
  onClose,
  onSaveCredit,
  onSaveFixed,
  onSaveVariable,
  onSaveIncome,
}) => {
  const [activeType, setActiveType] = useState<ModalType>(initialType);

  // Common fields
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [date, setDate] = useState(`${selectedYearMonth}-01`);

  // Credit Card specific
  const [installments, setInstallments] = useState(1);
  const [cardName, setCardName] = useState('');
  const [startMonth, setStartMonth] = useState(selectedYearMonth);

  // Income specific
  const [isRecurring, setIsRecurring] = useState(false);

  useEffect(() => {
    setActiveType(initialType);
  }, [initialType]);

  useEffect(() => {
    if (editingItem) {
      setDescription(editingItem.description || '');
      setCategory(editingItem.category || '');

      if ('totalAmount' in editingItem) {
        // Credit card
        setActiveType('credit');
        setAmount(String(editingItem.totalAmount));
        setInstallments(editingItem.installments || 1);
        setDueDay(editingItem.dueDay ? String(editingItem.dueDay) : '');
        setCardName(editingItem.cardName || '');
        setStartMonth(editingItem.startMonth || selectedYearMonth);
      } else if ('dueDay' in editingItem) {
        // Fixed expense
        setActiveType('fixed');
        setAmount(String(editingItem.amount));
        setDueDay(editingItem.dueDay ? String(editingItem.dueDay) : '');
      } else if ('isRecurring' in editingItem) {
        // Income
        setActiveType('income');
        setAmount(String(editingItem.amount));
        setDate(editingItem.date || `${selectedYearMonth}-01`);
        setIsRecurring(Boolean(editingItem.isRecurring));
      } else {
        // Variable expense
        setActiveType('variable');
        setAmount(String(editingItem.amount));
        setDate(editingItem.date || `${selectedYearMonth}-01`);
      }
    } else {
      // Reset all form inputs to empty / blank defaults
      setDescription('');
      setAmount('');
      setCategory('');
      setDueDay('');
      setInstallments(1);
      setCardName('');
      setStartMonth(selectedYearMonth);
      setDate(`${selectedYearMonth}-01`);
      setIsRecurring(false);
    }
  }, [editingItem, isOpen, selectedYearMonth]);

  if (!isOpen) return null;

  const parsedVal = parseFloat(amount.replace(',', '.'));
  const numAmount = isNaN(parsedVal) ? 0 : parsedVal;
  const isAmountValid = amount.trim() !== '' && !isNaN(parsedVal) && parsedVal >= 0;
  const numDueDay = parseInt(dueDay, 10) || 10;
  const installmentCalculated = installments > 0 ? numAmount / installments : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !isAmountValid) return;

    if (activeType === 'credit') {
      onSaveCredit({
        id: editingItem?.id,
        description,
        totalAmount: numAmount,
        installments: Math.max(1, installments),
        dueDay: Math.min(30, Math.max(1, numDueDay)), // 1 to 30 as requested
        purchaseDate: date,
        startMonth: startMonth || selectedYearMonth,
        category: category || 'outros',
        cardName: cardName.trim() || 'Cartão Principal',
      });
    } else if (activeType === 'fixed') {
      onSaveFixed({
        id: editingItem?.id,
        description,
        amount: numAmount,
        category: category || 'outros',
        dueDay: Math.min(31, Math.max(1, numDueDay)),
        active: true,
      });
    } else if (activeType === 'variable') {
      onSaveVariable({
        id: editingItem?.id,
        description,
        amount: numAmount,
        category: category || 'outros',
        date: date || `${selectedYearMonth}-01`,
      });
    } else if (activeType === 'income') {
      onSaveIncome({
        id: editingItem?.id,
        description,
        amount: numAmount,
        category: category || 'outros',
        date: date || `${selectedYearMonth}-01`,
        isRecurring,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">
              {editingItem ? 'Editar Lançamento' : 'Novo Lançamento Financeiro'}
            </h3>
            <p className="text-xs text-slate-500">
              Escolha a categoria e informe os dados detalhados
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type Selector (if not editing) */}
        {!editingItem && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-4 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveType('income')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeType === 'income' 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Receita</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveType('credit')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeType === 'credit' 
                  ? 'bg-indigo-600 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Cartão</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveType('fixed')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeType === 'fixed' 
                  ? 'bg-slate-800 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Fixo</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveType('variable')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeType === 'variable' 
                  ? 'bg-amber-600 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Variável</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Descrição / Nome do Lançamento
            </label>
            <input
              type="text"
              required
              placeholder={
                activeType === 'income' ? 'Ex: Salário, Venda de passagem, Conserto de celular' :
                activeType === 'credit' ? 'Ex: Smartphone 12x, Passagens Aéreas' :
                activeType === 'fixed' ? 'Ex: Conta de Luz, Aluguel, Financiamento, IPVA' :
                'Ex: Supermercado, Gasolina'
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Amount & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {activeType === 'credit' ? 'Valor Total da Compra (R$)' : 'Valor (R$)'}
              </label>
              <input
                type="number"
                step="any"
                required
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2 text-sm font-bold border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Categoria
              </label>
              {activeType === 'income' && (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Selecione uma categoria...</option>
                  <option value="salario">Salário</option>
                  <option value="aluguel">Aluguel (Recebido)</option>
                  <option value="passagem">Venda de Passagem</option>
                  <option value="conserto">Conserto de Celular</option>
                  <option value="renda_extra">Renda Extra</option>
                  <option value="outros">Outros Ganhos</option>
                </select>
              )}

              {activeType === 'fixed' && (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Selecione uma categoria...</option>
                  <option value="agua">Água</option>
                  <option value="luz">Luz</option>
                  <option value="financiamento">Financiamento</option>
                  <option value="emprestimo">Empréstimo</option>
                  <option value="aluguel">Aluguel (Pago)</option>
                  <option value="iptu">IPTU</option>
                  <option value="ipva">IPVA</option>
                  <option value="outros">Outros Gastos Fixos</option>
                </select>
              )}

              {activeType === 'variable' && (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Selecione uma categoria...</option>
                  <option value="comida">Comida / Alimentação</option>
                  <option value="combustivel">Combustível</option>
                  <option value="lazer">Lazer</option>
                  <option value="outros">Outros Gastos Diversos</option>
                </select>
              )}

              {activeType === 'credit' && (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Selecione uma categoria...</option>
                  <option value="eletronicos">Eletrônicos & Celulares</option>
                  <option value="eletrodomesticos">Eletrodomésticos</option>
                  <option value="viagem">Viagens & Passagens</option>
                  <option value="comida">Restaurantes & Comida</option>
                  <option value="vestuario">Roupas & Acessórios</option>
                  <option value="outros">Outros</option>
                </select>
              )}
            </div>
          </div>

          {/* Credit Card Specific Fields */}
          {activeType === 'credit' && (
            <div className="bg-indigo-50/70 rounded-xl p-4 space-y-3 border border-indigo-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-indigo-900 mb-1">
                    Número de Parcelas
                  </label>
                  <select
                    value={installments}
                    onChange={(e) => setInstallments(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-indigo-200 rounded-lg"
                  >
                    {Array.from({ length: 36 }).map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}x {numAmount > 0 ? `de ${formatCurrency(numAmount / (i + 1))}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-indigo-900 mb-1">
                    Dia Vencimento Fatura (01 a 30)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    placeholder="Ex: 10"
                    value={dueDay}
                    onChange={(e) => setDueDay(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-indigo-200 rounded-lg font-bold text-indigo-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-indigo-900 mb-1">
                    Nome / Identificação do Cartão
                  </label>
                  <input
                    type="text"
                    value={cardName}
                    placeholder="Ex: Cartão Nubank, Itaú"
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-indigo-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-indigo-900 mb-1">
                    Mês Início das Parcelas
                  </label>
                  <input
                    type="month"
                    value={startMonth}
                    onChange={(e) => setStartMonth(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-indigo-200 rounded-lg"
                  />
                </div>
              </div>

              {numAmount > 0 && installments > 1 && (
                <div className="text-xs text-indigo-800 bg-white p-2.5 rounded-lg border border-indigo-200 flex items-center justify-between font-medium">
                  <span>Valor estimado por parcela:</span>
                  <span className="font-extrabold text-indigo-950">{formatCurrency(installmentCalculated)} / mês</span>
                </div>
              )}
            </div>
          )}

          {/* Fixed Expense Specific Fields */}
          {activeType === 'fixed' && (
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dia do Vencimento Mensal (01 a 31)
              </label>
              <input
                type="number"
                min="1"
                max="31"
                placeholder="Ex: 10"
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg"
              />
            </div>
          )}

          {/* Variable / Income Date Field */}
          {(activeType === 'variable' || activeType === 'income') && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Data do Lançamento
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          {/* Income Recurring Toggle */}
          {activeType === 'income' && (
            <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span>Repetir esta receita automaticamente nos meses seguintes</span>
            </label>
          )}

          {/* Submit / Cancel */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              Salvar Lançamento
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
