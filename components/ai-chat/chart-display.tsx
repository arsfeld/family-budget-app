'use client'

import { motion } from 'framer-motion'
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts'

export function ChartDisplay({ data }: { data: any }) {
  if (!data || data.error) {
    return null
  }
  
  const { type, data: chartData, config, summary } = data
  
  const colors = config.colors || ['#10b981', '#ef4444', '#3b82f6', '#8b5cf6', '#f59e0b']
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm"
    >
      {summary && (
        <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
          {summary}
        </div>
      )}
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart(type, chartData, config, colors)}
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}

function renderChart(type: string, data: any[], config: any, colors: string[]) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-xs font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: ${entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      )
    }
    return null
  }
  
  switch (type) {
    case 'income-expense':
      return (
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 11 }}
            stroke="#6b7280"
          />
          <YAxis 
            tick={{ fontSize: 11 }}
            stroke="#6b7280"
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill || colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      )
    
    case 'category-breakdown':
      return (
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
            outerRadius={60}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      )
    
    case 'scenario-comparison':
      return (
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 11 }}
            stroke="#6b7280"
          />
          <YAxis 
            tick={{ fontSize: 11 }}
            stroke="#6b7280"
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ fontSize: '11px' }}
          />
          <Bar dataKey="income" fill={colors[0]} radius={[4, 4, 0, 0]} />
          <Bar dataKey="expenses" fill={colors[1]} radius={[4, 4, 0, 0]} />
          <Bar dataKey="savings" fill={colors[2]} radius={[4, 4, 0, 0]} />
        </BarChart>
      )
    
    case 'trend':
      return (
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 11 }}
            stroke="#6b7280"
          />
          <YAxis 
            tick={{ fontSize: 11 }}
            stroke="#6b7280"
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ fontSize: '11px' }}
          />
          <Line 
            type="monotone" 
            dataKey="income" 
            stroke={colors[0]} 
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line 
            type="monotone" 
            dataKey="expenses" 
            stroke={colors[1]} 
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line 
            type="monotone" 
            dataKey="savings" 
            stroke={colors[2]} 
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      )
    
    default:
      return (
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey={config.xAxis || 'name'} 
            tick={{ fontSize: 11 }}
            stroke="#6b7280"
          />
          <YAxis 
            tick={{ fontSize: 11 }}
            stroke="#6b7280"
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey={config.yAxis || 'value'} fill={colors[0]} radius={[8, 8, 0, 0]} />
        </BarChart>
      )
  }
}