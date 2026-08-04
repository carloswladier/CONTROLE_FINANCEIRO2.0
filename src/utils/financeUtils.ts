import {
  CreditCardExpenseItem,
  FixedExpenseItem,
  IncomeItem,
  InstallmentProjection,
  MonthlyDataSummary,
  VariableExpenseItem
} from '../types/finance';

// Category Labels Map
export const INCOME_CATEGORY_LABELS: Record<string, string> = {
  salario: 'Salário',
  aluguel: 'Aluguel (Recebido)',
  passagem: 'Venda de Passagem',
  conserto: 'Conserto de Celular',
  renda_extra: 'Renda Extra',
  outros: 'Outros Ganhos',
};

export const FIXED_CATEGORY_LABELS: Record<string, string> = {
  agua: 'Água',
  luz: 'Luz / Energia',
  financiamento: 'Financiamento',
  emprestimo: 'Empréstimo',
  aluguel: 'Aluguel (Pago)',
  iptu: 'IPTU',
  ipva: 'IPVA',
  outros: 'Outros Fixos',
};

export const VARIABLE_CATEGORY_LABELS: Record<string, string> = {
  comida: 'Alimentação / Comida',
  combustivel: 'Combustível',
  lazer: 'Lazer & Entretenimento',
  outros: 'Outros Gastos',
};

// Colors for chart visualization
export const CATEGORY_COLORS: Record<string, string> = {
  // Income
  salario: '#10b981',
  aluguel: '#059669',
  passagem: '#34d399',
  conserto: '#6ee7b7',
  renda_extra: '#10b981',
  
  // Fixed
  agua: '#0284c7',
  luz: '#eab308',
  financiamento: '#6366f1',
  emprestimo: '#8b5cf6',
  iptu: '#ec4899',
  ipva: '#f43f5e',
  
  // Variable
  comida: '#f97316',
  combustivel: '#ef4444',
  lazer: '#a855f7',
  
  // General fallback
  outros: '#64748b',
};

// Format currency BRL
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
}

// Get Portuguese month name YYYY-MM -> "Agosto de 2026"
export function formatMonthName(yearMonth: string): string {
  if (!yearMonth) return '';
  const [yearStr, monthStr] = yearMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const date = new Date(year, month, 15);
  
  const monthName = date.toLocaleDateString('pt-BR', { month: 'long' });
  const capitalized = monthName.charAt(0).toUpperCase() + monthName.slice(1);
  return `${capitalized} de ${year}`;
}

// Calculate month difference between two YYYY-MM strings
export function getMonthDifference(startYM: string, targetYM: string): number {
  const [startY, startM] = startYM.split('-').map(Number);
  const [targetY, targetM] = targetYM.split('-').map(Number);
  return (targetY - startY) * 12 + (targetM - startM);
}

// Get current YYYY-MM
export function getCurrentYearMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

// Helper to add/subtract months from YYYY-MM
export function addMonthsToYearMonth(yearMonth: string, delta: number): string {
  const [y, m] = yearMonth.split('-').map(Number);
  const date = new Date(y, m - 1 + delta, 1);
  const newY = date.getFullYear();
  const newM = String(date.getMonth() + 1).padStart(2, '0');
  return `${newY}-${newM}`;
}

// Get Installments for a specific month
export function getInstallmentsForMonth(
  creditExpenses: CreditCardExpenseItem[],
  targetYearMonth: string
): InstallmentProjection[] {
  const projections: InstallmentProjection[] = [];

  for (const exp of creditExpenses) {
    const monthDiff = getMonthDifference(exp.startMonth, targetYearMonth);
    
    // Check if this month falls into the installment range
    if (monthDiff >= 0 && monthDiff < exp.installments) {
      const currentInst = monthDiff + 1;
      const instAmount = exp.totalAmount / exp.installments;
      const isPaid = exp.paidInstallments?.includes(currentInst) || false;

      projections.push({
        expenseId: exp.id,
        description: exp.description,
        currentInstallment: currentInst,
        totalInstallments: exp.installments,
        installmentAmount: instAmount,
        dueDay: exp.dueDay,
        category: exp.category,
        cardName: exp.cardName || 'Cartão Principal',
        purchaseDate: exp.purchaseDate,
        isPaid,
      });
    }
  }

  return projections;
}

// Calculate summary data for a month
export function calculateMonthlySummary(
  targetYM: string,
  incomes: IncomeItem[],
  fixedExpenses: FixedExpenseItem[],
  variableExpenses: VariableExpenseItem[],
  creditExpenses: CreditCardExpenseItem[]
): MonthlyDataSummary {
  // 1. Calculate Income for targetYM
  const targetIncomeItems = incomes.filter(inc => {
    if (inc.isRecurring) return true; // recurring shows every month
    return inc.date.startsWith(targetYM);
  });
  const totalIncome = targetIncomeItems.reduce((acc, curr) => acc + curr.amount, 0);

  // 2. Fixed Expenses for targetYM
  const activeFixed = fixedExpenses.filter(f => f.active);
  const totalFixed = activeFixed.reduce((acc, curr) => acc + curr.amount, 0);

  // 3. Variable Expenses for targetYM
  const targetVariables = variableExpenses.filter(v => v.date.startsWith(targetYM));
  const totalVariable = targetVariables.reduce((acc, curr) => acc + curr.amount, 0);

  // 4. Credit Card Installments for targetYM
  const projections = getInstallmentsForMonth(creditExpenses, targetYM);
  const totalCreditCard = projections.reduce((acc, curr) => acc + curr.installmentAmount, 0);

  // Total Expenses
  const totalExpenses = totalFixed + totalVariable + totalCreditCard;
  const netBalance = totalIncome - totalExpenses;

  // Forecast calculation
  const now = new Date();
  const currentYM = getCurrentYearMonth();
  
  let daysRemaining = 0;
  if (targetYM === currentYM) {
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    daysRemaining = Math.max(1, daysInMonth - now.getDate() + 1);
  } else if (targetYM > currentYM) {
    const [y, m] = targetYM.split('-').map(Number);
    daysRemaining = new Date(y, m, 0).getDate();
  } else {
    daysRemaining = 0;
  }

  const remainingForecast = netBalance;
  const dailyBudgetLimit = daysRemaining > 0 ? Math.max(0, netBalance / daysRemaining) : 0;

  return {
    yearMonth: targetYM,
    totalIncome,
    totalFixed,
    totalVariable,
    totalCreditCard,
    totalExpenses,
    netBalance,
    remainingForecast,
    daysRemainingInMonth: daysRemaining,
    dailyBudgetLimit,
  };
}

// Default Seed Data
export const INITIAL_INCOMES: IncomeItem[] = [
  {
    id: 'inc-1',
    description: 'Salário Mensal',
    amount: 5500.00,
    category: 'salario',
    date: '2026-08-01',
    isRecurring: true,
  },
  {
    id: 'inc-2',
    description: 'Conserto de Celular',
    amount: 350.00,
    category: 'conserto',
    date: '2026-08-05',
    isRecurring: false,
  },
  {
    id: 'inc-3',
    description: 'Venda de Passagem Aérea',
    amount: 420.00,
    category: 'passagem',
    date: '2026-08-10',
    isRecurring: false,
  },
  {
    id: 'inc-4',
    description: 'Rendimento Aluguel Quarto',
    amount: 800.00,
    category: 'aluguel',
    date: '2026-08-02',
    isRecurring: true,
  },
];

export const INITIAL_FIXED_EXPENSES: FixedExpenseItem[] = [
  {
    id: 'fix-1',
    description: 'Aluguel do Apê',
    amount: 1800.00,
    category: 'aluguel',
    dueDay: 10,
    active: true,
  },
  {
    id: 'fix-2',
    description: 'Conta de Luz',
    amount: 210.50,
    category: 'luz',
    dueDay: 15,
    active: true,
  },
  {
    id: 'fix-3',
    description: 'Conta de Água',
    amount: 85.00,
    category: 'agua',
    dueDay: 18,
    active: true,
  },
  {
    id: 'fix-4',
    description: 'Parcela Financiamento Carro',
    amount: 890.00,
    category: 'financiamento',
    dueDay: 20,
    active: true,
  },
  {
    id: 'fix-5',
    description: 'Empréstimo Pessoal',
    amount: 320.00,
    category: 'emprestimo',
    dueDay: 25,
    active: true,
  },
  {
    id: 'fix-6',
    description: 'IPTU 2026',
    amount: 145.00,
    category: 'iptu',
    dueDay: 12,
    active: true,
  },
  {
    id: 'fix-7',
    description: 'IPVA (Parcela 4/5)',
    amount: 220.00,
    category: 'ipva',
    dueDay: 28,
    active: true,
  },
];

export const INITIAL_VARIABLE_EXPENSES: VariableExpenseItem[] = [
  {
    id: 'var-1',
    description: 'Supermercado da Semana',
    amount: 450.30,
    category: 'comida',
    date: '2026-08-02',
  },
  {
    id: 'var-2',
    description: 'Abastecimento Posto Shell',
    amount: 220.00,
    category: 'combustivel',
    date: '2026-08-03',
  },
  {
    id: 'var-3',
    description: 'Ingresso Cinema e Lanche',
    amount: 95.00,
    category: 'lazer',
    date: '2026-08-04',
  },
  {
    id: 'var-4',
    description: 'Restaurante Fim de Semana',
    amount: 160.00,
    category: 'comida',
    date: '2026-08-07',
  },
];

export const INITIAL_CREDIT_EXPENSES: CreditCardExpenseItem[] = [
  {
    id: 'card-1',
    description: 'Smartphone Samsung Galaxy',
    totalAmount: 3600.00,
    installments: 12,
    dueDay: 10,
    purchaseDate: '2026-05-15',
    startMonth: '2026-06',
    category: 'eletronicos',
    cardName: 'Cartão Nubank',
  },
  {
    id: 'card-2',
    description: 'Geladeira Frost Free',
    totalAmount: 2400.00,
    installments: 10,
    dueDay: 15,
    purchaseDate: '2026-03-10',
    startMonth: '2026-04',
    category: 'eletrodomesticos',
    cardName: 'Cartão Itaú',
  },
  {
    id: 'card-3',
    description: 'Passagem Viagem Férias',
    totalAmount: 1800.00,
    installments: 6,
    dueDay: 10,
    purchaseDate: '2026-07-01',
    startMonth: '2026-08',
    category: 'viagem',
    cardName: 'Cartão Nubank',
  },
  {
    id: 'card-4',
    description: 'Jantar Comemoração',
    totalAmount: 280.00,
    installments: 1,
    dueDay: 10,
    purchaseDate: '2026-08-01',
    startMonth: '2026-08',
    category: 'comida',
    cardName: 'Cartão Nubank',
  },
];
