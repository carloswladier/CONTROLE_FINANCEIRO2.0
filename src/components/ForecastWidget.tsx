import React from 'react';
import { Sparkles, Calendar, Wallet, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { MonthlyDataSummary } from '../types/finance';
import { formatCurrency, formatMonthName } from '../utils/financeUtils';

interface ForecastWidgetProps {
  summary: MonthlyDataSummary;
  onOpenNewExpenseModal: (type?: 'credit' | 'fixed' | 'variable' | 'income') => void;
}

export const ForecastWidget: React.FC<ForecastWidgetProps> = ({ summary, onOpenNewExpenseModal }) => {
  const {
    yearMonth,
    totalIncome,
    totalExpenses,
    netBalance,
    daysRemainingInMonth,
    dailyBudgetLimit,
  } = summary;

  const committedExpenses = summary.totalFixed + summary.totalCreditCard;
  const committedRatio = totalIncome > 0 ? (committedExpenses / totalIncome) * 100 : 0;
  const totalExpenseRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

  const isHealthy = netBalance > 0 && totalExpenseRatio <= 85;
  const isWarning = netBalance > 0 && totalExpenseRatio > 85;
  const isDanger = netBalance <= 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs relative overflow-hidden">
      
      {/* Decorative background glow */}
      <div className={`absolute -right-16 -bottom-16 w-48 h-48 rounded-full blur-3xl opacity-10 pointer-events-none ${
        isHealthy ? 'bg-emerald-500' : isWarning ? 'bg-amber-500' : 'bg-rose-500'
      }`} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Previsão de Orçamento Restante
              <span className="text-xs bg-indigo-50 text-indigo-700 font-medium px-2.5 py-0.5 rounded-full border border-indigo-100">
                {formatMonthName(yearMonth)}
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Projeção calculada com base em receitas, compromissos fixos e cartão parcelado.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-slate-500 block">Previsão Final do Mês</span>
            <span className={`text-xl font-extrabold ${
              isHealthy ? 'text-emerald-600' : isWarning ? 'text-amber-600' : 'text-rose-600'
            }`}>
              {formatCurrency(netBalance)}
            </span>
          </div>
        </div>
      </div>

      {/* Progress & Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5">
        
        {/* Progress Bar & Commitment ratio */}
        <div className="space-y-3 md:col-span-2">
          <div className="flex justify-between text-xs font-medium text-slate-600">
            <span>Comprometimento do Orçamento ({totalExpenseRatio.toFixed(1)}%)</span>
            <span>{formatCurrency(totalExpenses)} de {formatCurrency(totalIncome)}</span>
          </div>

          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex p-0.5">
            {/* Fixed */}
            <div 
              style={{ width: `${Math.min(100, (summary.totalFixed / (totalIncome || 1)) * 100)}%` }}
              className="bg-slate-700 h-full rounded-l-full"
              title={`Gastos Fixos: ${formatCurrency(summary.totalFixed)}`}
            />
            {/* Credit */}
            <div 
              style={{ width: `${Math.min(100, (summary.totalCreditCard / (totalIncome || 1)) * 100)}%` }}
              className="bg-indigo-500 h-full"
              title={`Cartão Parcelado: ${formatCurrency(summary.totalCreditCard)}`}
            />
            {/* Variable */}
            <div 
              style={{ width: `${Math.min(100, (summary.totalVariable / (totalIncome || 1)) * 100)}%` }}
              className="bg-amber-500 h-full rounded-r-full"
              title={`Gastos Variáveis: ${formatCurrency(summary.totalVariable)}`}
            />
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
              <span>Fixos: <b>{formatCurrency(summary.totalFixed)}</b></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              <span>Cartão Parcelado: <b>{formatCurrency(summary.totalCreditCard)}</b></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>Variáveis: <b>{formatCurrency(summary.totalVariable)}</b></span>
            </div>
          </div>
        </div>

        {/* Daily Spending Limit Forecast */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                Limite Diário Recomendado
              </span>
              {daysRemainingInMonth > 0 && (
                <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                  {daysRemainingInMonth} dias restantes
                </span>
              )}
            </div>

            <div className="text-xl font-bold text-slate-900 mt-1">
              {daysRemainingInMonth > 0 
                ? formatCurrency(dailyBudgetLimit)
                : 'Fim do mês'
              }
              <span className="text-xs font-normal text-slate-500 block">
                / dia até o fim do mês
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-200 text-xs">
            {isHealthy && (
              <span className="text-emerald-700 flex items-center gap-1 font-medium">
                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                Orçamento confortável!
              </span>
            )}
            {isWarning && (
              <span className="text-amber-700 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                Orçamento no limite (acima de 85%)
              </span>
            )}
            {isDanger && (
              <span className="text-rose-700 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                Saldo negativo previsto!
              </span>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
