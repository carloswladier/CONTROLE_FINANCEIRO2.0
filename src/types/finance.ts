export type IncomeCategory = 
  | 'salario'
  | 'aluguel'
  | 'passagem'
  | 'conserto'
  | 'renda_extra'
  | 'outros';

export type FixedExpenseCategory = 
  | 'agua'
  | 'luz'
  | 'financiamento'
  | 'emprestimo'
  | 'aluguel'
  | 'iptu'
  | 'ipva'
  | 'outros';

export type VariableExpenseCategory = 
  | 'comida'
  | 'combustivel'
  | 'lazer'
  | 'outros';

export interface IncomeItem {
  id: string;
  description: string;
  amount: number;
  category: IncomeCategory | string;
  date: string; // YYYY-MM-DD
  isRecurring: boolean; // if true, repeats every month
}

export interface FixedExpenseItem {
  id: string;
  description: string;
  amount: number;
  category: FixedExpenseCategory | string;
  dueDay: number; // 1 to 31
  active: boolean;
  paidMonths?: string[]; // list of YYYY-MM where marked paid
}

export interface VariableExpenseItem {
  id: string;
  description: string;
  amount: number;
  category: VariableExpenseCategory | string;
  date: string; // YYYY-MM-DD
}

export interface CreditCardExpenseItem {
  id: string;
  description: string;
  totalAmount: number; // total value of purchase
  installments: number; // total parcelas (e.g. 1 to 36)
  dueDay: number; // 1 to 30
  purchaseDate: string; // YYYY-MM-DD
  startMonth: string; // YYYY-MM when 1st installment starts
  category: string;
  cardName?: string;
  paidInstallments?: number[]; // list of installment numbers marked paid (1-indexed)
}

export interface CardConfig {
  id: string;
  name: string;
  limit: number;
  dueDay: number; // 1-30
  closingDay: number; // 1-30
  color: string;
}

export interface InstallmentProjection {
  expenseId: string;
  description: string;
  currentInstallment: number;
  totalInstallments: number;
  installmentAmount: number;
  dueDay: number;
  category: string;
  cardName?: string;
  purchaseDate: string;
  isPaid: boolean;
}

export interface MonthlyDataSummary {
  yearMonth: string; // YYYY-MM
  totalIncome: number;
  totalFixed: number;
  totalVariable: number;
  totalCreditCard: number;
  totalExpenses: number;
  netBalance: number;
  remainingForecast: number;
  daysRemainingInMonth: number;
  dailyBudgetLimit: number;
}
