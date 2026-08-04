import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Receipt, 
  ShoppingBag, 
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { MonthlyDataSummary } from '../types/finance';
import { formatCurrency } from '../utils/financeUtils';

interface SummaryCardsProps {
  summary: MonthlyDataSummary;
  onNavigateToTab: (tab: 'all' | 'credit' | 'fixed' | 'variable' | 'income' | 'forecast') => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary, onNavigateToTab }) => {
  const isPositive = summary.netBalance >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* Total Receitas */}
      <div 
        onClick={() => onNavigateToTab('income')}
        className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        id="summary-card-income"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Ganhos / Receitas
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {formatCurrency(summary.totalIncome)}
          </div>
          <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            Entradas
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Salários, aluguéis, passagens, vendas
        </p>
      </div>

      {/* Cartões de Crédito (Fatura do Mês) */}
      <div 
        onClick={() => onNavigateToTab('credit')}
        className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
        id="summary-card-credit"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Cartão de Crédito
          </span>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {formatCurrency(summary.totalCreditCard)}
          </div>
          <span className="text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full font-medium">
            Parcelas do mês
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Gasto parcelado devido no mês
        </p>
      </div>

      {/* Gastos Fixos & Variáveis */}
      <div 
        onClick={() => onNavigateToTab('fixed')}
        className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group"
        id="summary-card-expenses"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Gastos Fixos & Variáveis
          </span>
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Receipt className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {formatCurrency(summary.totalFixed + summary.totalVariable)}
          </div>
          <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
            Contas + Dia a Dia
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
          <span>Fixos: <b>{formatCurrency(summary.totalFixed)}</b></span>
          <span>Variáveis: <b>{formatCurrency(summary.totalVariable)}</b></span>
        </div>
      </div>

      {/* Saldo Líquido do Mês */}
      <div 
        onClick={() => onNavigateToTab('forecast')}
        className={`rounded-2xl p-5 border shadow-xs transition-all cursor-pointer group ${
          isPositive 
            ? 'bg-linear-to-br from-emerald-500 to-teal-600 text-white border-emerald-400' 
            : 'bg-linear-to-br from-rose-500 to-red-600 text-white border-rose-400'
        }`}
        id="summary-card-balance"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-100 opacity-90">
            Saldo Líquido Mensal
          </span>
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
            {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold tracking-tight">
            {formatCurrency(summary.netBalance)}
          </div>
          <span className="text-xs bg-white/20 backdrop-blur-xs px-2.5 py-1 rounded-full font-semibold">
            {isPositive ? 'Sobra' : 'Déficit'}
          </span>
        </div>
        <p className="text-xs text-white/80 mt-2 flex items-center gap-1">
          {isPositive ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Receitas superam total de gastos</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Atenção: Despesas maiores que os ganhos</span>
            </>
          )}
        </p>
      </div>

    </div>
  );
};
