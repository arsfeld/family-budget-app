'use client'

import { motion } from 'framer-motion'
import { 
  Check, 
  TrendingUp, 
  TrendingDown, 
  Loader2,
  AlertCircle,
  BarChart3
} from 'lucide-react'
import { ChartDisplay } from './chart-display'

export function ToolResult({ invocation }: { invocation: any }) {
  // Handle the structure from AI SDK v5 tool invocations
  const toolName = invocation.type?.replace('tool-', '') || toolName
  const state = invocation.state
  const result = invocation.output || invocation.result
  
  if (state === 'pending' || state === 'partial') {
    return (
      <motion.div 
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
      >
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
          <Loader2 className="animate-spin" size={16} />
          <span className="text-sm font-medium">
            {getToolActionText(toolName)}...
          </span>
        </div>
      </motion.div>
    )
  }
  
  if (result?.error) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"
      >
        <div className="flex items-start gap-2 text-red-600 dark:text-red-400">
          <AlertCircle size={16} className="mt-0.5" />
          <span className="text-sm">{result.error}</span>
        </div>
      </motion.div>
    )
  }
  
  if (toolName === 'getBudgetOverview') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-3 space-y-3"
      >
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl space-y-3">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <BarChart3 size={16} />
            {result.overviewName}
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg">
              <div className="text-xs text-gray-500 dark:text-gray-400">Income</div>
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                {result.totalIncome}
              </div>
            </div>
            <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg">
              <div className="text-xs text-gray-500 dark:text-gray-400">Expenses</div>
              <div className="text-lg font-bold text-red-600 dark:text-red-400">
                {result.totalExpenses}
              </div>
            </div>
          </div>
          
          <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Net Savings</span>
              <span className={`text-lg font-bold ${
                result.netSavings?.startsWith('-') 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-green-600 dark:text-green-400'
              }`}>
                {result.netSavings}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Savings Rate</span>
              <span className="font-medium">{result.savingsRate}</span>
            </div>
          </div>
          
          {result.topExpenseCategories?.length > 0 && (
            <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Top Expenses</div>
              <div className="space-y-1">
                {result.topExpenseCategories.map((cat: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{cat.category}</span>
                    <span className="font-medium">{cat.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    )
  }
  
  if (toolName === 'generateChart') {
    return <ChartDisplay data={result} />
  }
  
  if (toolName === 'addIncome' || toolName === 'addExpense') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
      >
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
          <Check size={16} />
          <span className="text-sm font-medium">{result.message}</span>
        </div>
        {result.income && (
          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            {result.income.frequency} • {result.income.type}
          </div>
        )}
        {result.expense && (
          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            Category: {result.expense.category}
            {result.expense.isShared && ` • Shared (${result.expense.sharePercentage}%)`}
          </div>
        )}
      </motion.div>
    )
  }
  
  if (toolName === 'compareScenarios') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-3 space-y-2"
      >
        {result.scenarios?.map((scenario: any, i: number) => (
          <div 
            key={i} 
            className={`p-3 rounded-lg ${
              scenario.isActive 
                ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500' 
                : 'bg-gray-50 dark:bg-gray-800/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm">
                {scenario.name}
                {scenario.isActive && (
                  <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </span>
              <span className={`text-sm font-bold ${
                scenario.netSavings?.startsWith('-') 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-green-600 dark:text-green-400'
              }`}>
                {scenario.netSavings}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Income:</span>
                <span className="ml-1 font-medium">{scenario.totalIncome}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Expenses:</span>
                <span className="ml-1 font-medium">{scenario.totalExpenses}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Rate:</span>
                <span className="ml-1 font-medium">{scenario.savingsRate}</span>
              </div>
            </div>
          </div>
        ))}
        
        {result.analysis && (
          <div className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg">
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Analysis</div>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-green-600" />
                <span>Best: {result.analysis.bestScenario.name} ({result.analysis.bestScenario.netSavings})</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingDown size={14} className="text-red-600" />
                <span>Worst: {result.analysis.worstScenario.name} ({result.analysis.worstScenario.netSavings})</span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Difference: {result.analysis.savingsDifference}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    )
  }
  
  if (toolName === 'listIncomes' || toolName === 'listExpenses') {
    const items = result.incomes || result.expenses || []
    const isIncome = toolName === 'listIncomes'
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-3 space-y-2"
      >
        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{result.overviewName}</span>
            <span className="text-sm font-bold">
              {isIncome ? result.totalMonthlyIncome : result.totalExpenses}
            </span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {result.filterApplied || `${items.length} ${isIncome ? 'income sources' : 'expenses'}`}
          </div>
        </div>
        
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {items.map((item: any, i: number) => (
            <div 
              key={i} 
              className="p-2 bg-white dark:bg-gray-800 rounded-lg text-sm flex items-center justify-between"
            >
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {isIncome 
                    ? `${item.type} • ${item.frequency}` 
                    : `${item.category} • ${item.user}`}
                  {item.isShared && ' • Shared'}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold">{isIncome ? item.monthlyAmount : item.amount}</div>
                {isIncome && item.amount !== item.monthlyAmount && (
                  <div className="text-xs text-gray-500">{item.amount}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    )
  }
  
  // Default success message for other tools
  if (result?.success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
      >
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
          <Check size={16} />
          <span className="text-sm">Operation completed successfully</span>
        </div>
      </motion.div>
    )
  }
  
  return null
}

function getToolActionText(toolName: string): string {
  const actions: Record<string, string> = {
    getBudgetOverview: 'Getting budget overview',
    addIncome: 'Adding income',
    addExpense: 'Adding expense',
    compareScenarios: 'Comparing scenarios',
    generateChart: 'Generating chart',
    listIncomes: 'Listing incomes',
    listExpenses: 'Listing expenses',
  }
  
  return actions[toolName] || 'Processing'
}