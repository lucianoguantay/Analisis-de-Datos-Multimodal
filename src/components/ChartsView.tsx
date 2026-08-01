import React from 'react';
import { ChartConfig } from '../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import { BarChart3, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';

interface ChartsViewProps {
  charts: ChartConfig[];
}

const DEFAULT_COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#3b82f6'];

export const ChartsView: React.FC<ChartsViewProps> = ({ charts }) => {
  const validCharts = (charts || []).filter(
    (chart) =>
      chart &&
      Array.isArray(chart.data) &&
      chart.data.length > 0 &&
      Array.isArray(chart.dataKeys) &&
      chart.dataKeys.length > 0 &&
      chart.data.some((d) => typeof d.value === 'number' && !isNaN(d.value))
  );

  if (validCharts.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 pb-2 border-b border-slate-200">
        <BarChart3 className="w-5 h-5 text-indigo-600" />
        <h3 className="text-sm font-bold text-slate-900">
          Visualización Estadísticas y Gráficos Dinámicos
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {validCharts.map((chart, idx) => {
          return (
            <div
              key={idx}
              className={`bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-slate-900 flex flex-col justify-between ${
                charts.length === 1 ? 'lg:col-span-2' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600 rotate-45" />
                  <span>{chart.title}</span>
                </h4>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-semibold">
                  {chart.type}
                </span>
              </div>

              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  {chart.type === 'pie' ? (
                    <PieChart>
                      <Pie
                        data={chart.data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={4}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {(chart.data || []).map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderColor: '#e2e8f0',
                          borderRadius: '0.75rem',
                          color: '#0f172a',
                          fontSize: '12px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                        }}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: '11px', color: '#64748b' }}
                      />
                    </PieChart>
                  ) : chart.type === 'line' ? (
                    <LineChart data={chart.data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderColor: '#e2e8f0',
                          borderRadius: '0.75rem',
                          color: '#0f172a',
                          fontSize: '12px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', color: '#64748b' }} />
                      {(chart.dataKeys || []).map((dk, i) => (
                        <Line
                          key={dk.key}
                          type="monotone"
                          dataKey={dk.key}
                          name={dk.label}
                          stroke={dk.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
                          strokeWidth={2.5}
                          dot={{ r: 4, fill: dk.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length] }}
                        />
                      ))}
                    </LineChart>
                  ) : chart.type === 'area' ? (
                    <AreaChart data={chart.data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderColor: '#e2e8f0',
                          borderRadius: '0.75rem',
                          color: '#0f172a',
                          fontSize: '12px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', color: '#64748b' }} />
                      {(chart.dataKeys || []).map((dk, i) => (
                        <Area
                          key={dk.key}
                          type="monotone"
                          dataKey={dk.key}
                          name={dk.label}
                          fill={dk.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
                          fillOpacity={0.2}
                          stroke={dk.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
                          strokeWidth={2}
                        />
                      ))}
                    </AreaChart>
                  ) : (
                    // Default Bar Chart
                    <BarChart data={chart.data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderColor: '#e2e8f0',
                          borderRadius: '0.75rem',
                          color: '#0f172a',
                          fontSize: '12px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', color: '#64748b' }} />
                      {(chart.dataKeys || []).map((dk, i) => (
                        <Bar
                          key={dk.key}
                          dataKey={dk.key}
                          name={dk.label}
                          fill={dk.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
                          radius={[6, 6, 0, 0]}
                        />
                      ))}
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
