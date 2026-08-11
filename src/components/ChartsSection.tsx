import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { 
  CreditCardExpenseItem, 
  FixedExpenseItem, 
  IncomeItem, 
  VariableExpenseItem 
} from '../types/finance';
import { 
  calculateMonthlySummary, 
  formatCurrency, 
  addMonthsToYearMonth 
} from '../utils/financeUtils';
import { BarChart3, Calendar } from 'lucide-react';

interface ChartsSectionProps {
  selectedYearMonth: string;
  incomes: IncomeItem[];
  fixedExpenses: FixedExpenseItem[];
  variableExpenses: VariableExpenseItem[];
  creditExpenses: CreditCardExpenseItem[];
}

// Custom label rendered to the right of horizontal bars (layout="vertical")
const renderRightLabel = (color: string) => (props: any) => {
  const { x, y, width, height, value } = props;
  if (!value || value <= 0) return null;

  const formattedValue = `R$ ${Math.round(value).toLocaleString('pt-BR')}`;

  return (
    <text
      x={x + width + 6}
      y={y + height / 2 + 4}
      fill={color}
      textAnchor="start"
      fontSize={10}
      fontWeight={700}
    >
      {formattedValue}
    </text>
  );
};

// Custom top label rendered above vertical bars (layout="horizontal")
const renderTopLabel = (color: string) => (props: any) => {
  const { x, y, width, value } = props;
  if (!value || value <= 0) return null;

  const formattedValue = `R$ ${Math.round(value).toLocaleString('pt-BR')}`;

  return (
    <text
      x={x + width / 2}
      y={y - 8}
      fill={color}
      textAnchor="middle"
      fontSize={9}
      fontWeight={700}
    >
      {formattedValue}
    </text>
  );
};

export const ChartsSection: React.FC<ChartsSectionProps> = ({
  selectedYearMonth,
  incomes,
  fixedExpenses,
  variableExpenses,
  creditExpenses,
}) => {
  // Orientation state: defaults to horizontal bars
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');

  // Option to set offset start if user wants (defaults to 12 months starting from selected month)
  const [startOffset, setStartOffset] = useState<number>(0);

  // Generate 12 consecutive months based on startOffset
  const monthList = Array.from({ length: 12 }, (_, i) => 
    addMonthsToYearMonth(selectedYearMonth, i + startOffset)
  );

  const multiMonthData = monthList.map(ym => {
    const s = calculateMonthlySummary(ym, incomes, fixedExpenses, variableExpenses, creditExpenses);
    const [y, m] = ym.split('-');
    const shortMonth = new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('pt-BR', { month: 'short' });
    return {
      yearMonth: ym,
      label: `${shortMonth}/${y.slice(2)}`,
      Receitas: s.totalIncome,
      Despesas: s.totalExpenses,
      Saldo: s.netBalance,
    };
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      
      {/* Chart Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Evolução Financeira (12 Meses)
          </h3>
          <p className="text-xs text-slate-500">
            Comparativo de Receitas e Despesas mês a mês com valores exibidos horizontalmente
          </p>
        </div>

        {/* Controls: Orientation Toggle & Start Month Preset */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold border border-slate-200">
            <button
              type="button"
              onClick={() => setOrientation('horizontal')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                orientation === 'horizontal'
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Barras Horizontais
            </button>
            <button
              type="button"
              onClick={() => setOrientation('vertical')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                orientation === 'vertical'
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Barras Verticais
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Início:
            </label>
            <select
              value={startOffset}
              onChange={(e) => setStartOffset(Number(e.target.value))}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value={0}>A partir do mês selecionado</option>
              <option value={-2}>2 meses anteriores + 10 meses</option>
              <option value={-5}>5 meses anteriores + 7 meses</option>
            </select>
          </div>
        </div>
      </div>

      {/* 12-Month Bar Chart */}
      <div className={`${orientation === 'horizontal' ? 'h-[620px]' : 'h-96'} w-full pt-2 transition-all`}>
        <ResponsiveContainer width="100%" height="100%">
          {orientation === 'horizontal' ? (
            <BarChart 
              layout="vertical"
              data={multiMonthData} 
              margin={{ top: 15, right: 85, left: 10, bottom: 10 }}
              barGap={3}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis 
                type="number"
                tickFormatter={(v) => `R$${v}`} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <YAxis 
                type="category"
                dataKey="label" 
                width={75} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
              />
              <Tooltip 
                formatter={(val: number) => [formatCurrency(val), '']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              
              <Bar 
                dataKey="Receitas" 
                fill="#10b981" 
                radius={[0, 6, 6, 0]} 
                label={renderRightLabel('#047857')}
              />
              <Bar 
                dataKey="Despesas" 
                fill="#f43f5e" 
                radius={[0, 6, 6, 0]} 
                label={renderRightLabel('#e11d48')}
              />
            </BarChart>
          ) : (
            <BarChart 
              data={multiMonthData} 
              margin={{ top: 32, right: 12, left: 10, bottom: 10 }}
              barGap={3}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="label" 
                tickLine={false} 
                tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
              />
              <YAxis 
                tickFormatter={(v) => `R$${v}`} 
                width={75} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <Tooltip 
                formatter={(val: number) => [formatCurrency(val), '']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              
              <Bar 
                dataKey="Receitas" 
                fill="#10b981" 
                radius={[6, 6, 0, 0]} 
                label={renderTopLabel('#047857')}
              />
              <Bar 
                dataKey="Despesas" 
                fill="#f43f5e" 
                radius={[6, 6, 0, 0]} 
                label={renderTopLabel('#e11d48')}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

    </div>
  );
};

