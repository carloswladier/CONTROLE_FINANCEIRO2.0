import React from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Wallet, 
  RotateCcw, 
  Download, 
  Upload,
  Plus,
  Trash2,
  Database
} from 'lucide-react';
import { formatMonthName, getCurrentYearMonth, addMonthsToYearMonth } from '../utils/financeUtils';

interface HeaderProps {
  selectedYearMonth: string;
  onSelectYearMonth: (ym: string) => void;
  onOpenNewExpenseModal: (defaultType?: 'credit' | 'fixed' | 'variable' | 'income') => void;
  onResetData: () => void;
  onClearData?: () => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenHostingerDbModal?: () => void;
  dbConnected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  selectedYearMonth,
  onSelectYearMonth,
  onOpenNewExpenseModal,
  onResetData,
  onClearData,
  onExportData,
  onImportData,
  onOpenHostingerDbModal,
  dbConnected,
}) => {
  const currentYM = getCurrentYearMonth();
  const isCurrentMonth = selectedYearMonth === currentYM;

  const handlePrevMonth = () => {
    onSelectYearMonth(addMonthsToYearMonth(selectedYearMonth, -1));
  };

  const handleNextMonth = () => {
    onSelectYearMonth(addMonthsToYearMonth(selectedYearMonth, 1));
  };

  const handleCurrentMonthClick = () => {
    onSelectYearMonth(currentYM);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">
                Controle Financeiro
              </h1>
              <p className="text-xs text-slate-500">
                Cartões de Crédito • Parcelas • Gastos Fixos • Previsão
              </p>
            </div>
          </div>

          {/* Month Selector Navigation */}
          <div className="flex items-center justify-between md:justify-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition-colors shadow-2xs"
              title="Mês Anterior"
              id="prev-month-btn"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 px-3 py-1">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-slate-800 text-sm sm:text-base min-w-[140px] text-center">
                {formatMonthName(selectedYearMonth)}
              </span>
              {!isCurrentMonth && (
                <button
                  onClick={handleCurrentMonthClick}
                  className="text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-md font-medium transition-colors"
                  title="Ir para o Mês Atual"
                  id="go-current-month-btn"
                >
                  Atual
                </button>
              )}
            </div>

            <button
              onClick={handleNextMonth}
              className="p-2 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition-colors shadow-2xs"
              title="Próximo Mês"
              id="next-month-btn"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => onOpenNewExpenseModal('income')}
              className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors whitespace-nowrap cursor-pointer"
              id="add-income-btn"
            >
              <Plus className="w-4 h-4" />
              <span>Receita</span>
            </button>

            <button
              onClick={() => onOpenNewExpenseModal('credit')}
              className="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors whitespace-nowrap cursor-pointer"
              id="add-card-btn"
            >
              <Plus className="w-4 h-4" />
              <span>Cartão Parcelado</span>
            </button>

            <button
              onClick={() => onOpenNewExpenseModal('fixed')}
              className="inline-flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-900 text-white px-3 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors whitespace-nowrap cursor-pointer"
              id="add-fixed-btn"
            >
              <Plus className="w-4 h-4" />
              <span>Gasto Fixo</span>
            </button>

            {onOpenHostingerDbModal && (
              <button
                onClick={onOpenHostingerDbModal}
                className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors whitespace-nowrap cursor-pointer border ${
                  dbConnected
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                    : 'bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100'
                }`}
                title="Conexão com Banco de Dados Hostinger MySQL"
                id="hostinger-db-btn"
              >
                <Database className="w-4 h-4 text-indigo-600" />
                <span className="hidden sm:inline">Hostinger DB</span>
                <span className={`w-2 h-2 rounded-full ${dbConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              </button>
            )}

            <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

            {/* Import / Export / Reset */}
            <div className="flex items-center space-x-1">
              <button
                onClick={onExportData}
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                title="Exportar Dados (Backup JSON)"
                id="export-data-btn"
              >
                <Download className="w-4 h-4" />
              </button>

              <label
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Importar Dados (JSON)"
                id="import-data-label"
              >
                <Upload className="w-4 h-4" />
                <input
                  type="file"
                  accept=".json"
                  onChange={onImportData}
                  className="hidden"
                />
              </label>

              {onClearData && (
                <button
                  onClick={onClearData}
                  className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Limpar Todos os Dados (Zerar)"
                  id="clear-data-btn"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={onResetData}
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                title="Carregar Dados de Exemplo"
                id="reset-data-btn"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
