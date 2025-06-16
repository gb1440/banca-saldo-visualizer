
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface BalanceEntry {
  id: string;
  date: string;
  casaDeAposta: string;
  saldo: number;
  createdAt: Date;
}

interface MonthlyChartProps {
  balances: BalanceEntry[];
}

export const MonthlyChart: React.FC<MonthlyChartProps> = ({ balances }) => {
  // Agrupar saldos por mês
  const monthlyTotals = balances.reduce((acc, entry) => {
    const date = new Date(entry.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!acc[monthKey]) {
      acc[monthKey] = { total: 0, entries: [] };
    }
    
    acc[monthKey].entries.push(entry);
    return acc;
  }, {} as Record<string, { total: number; entries: BalanceEntry[] }>);

  // Calcular média mensal (último saldo de cada casa no mês)
  const chartData = Object.entries(monthlyTotals)
    .map(([monthKey, data]) => {
      // Para cada mês, pegar o último saldo de cada casa de apostas
      const lastBalancePerCasa = data.entries.reduce((acc, entry) => {
        const casa = entry.casaDeAposta;
        if (!acc[casa] || entry.date > acc[casa].date) {
          acc[casa] = entry;
        }
        return acc;
      }, {} as Record<string, BalanceEntry>);

      const monthTotal = Object.values(lastBalancePerCasa).reduce((sum, entry) => sum + entry.saldo, 0);
      
      const [year, month] = monthKey.split('-');
      const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('pt-BR', { 
        month: 'short',
        year: '2-digit'
      });

      return {
        month: monthName,
        total: monthTotal,
        originalKey: monthKey
      };
    })
    .sort((a, b) => a.originalKey.localeCompare(b.originalKey))
    .slice(-12); // Últimos 12 meses

  // Calcular variação percentual
  const dataWithVariations = chartData.map((item, index) => {
    const previousMonth = index > 0 ? chartData[index - 1] : null;
    const variation = previousMonth && previousMonth.total > 0 
      ? ((item.total - previousMonth.total) / previousMonth.total) * 100 
      : 0;
    
    return {
      ...item,
      variation: variation,
      isNegative: variation < 0
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-md">
          <p className="font-medium">{`Mês: ${label}`}</p>
          <p className="text-blue-600">
            {`Total: R$ ${data.total.toFixed(2)}`}
          </p>
          {data.variation !== 0 && (
            <p className={data.isNegative ? 'text-red-600' : 'text-green-600'}>
              {`Variação: ${data.variation > 0 ? '+' : ''}${data.variation.toFixed(1)}%`}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (dataWithVariations.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        Nenhum dado disponível para exibir o gráfico
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dataWithVariations}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `R$ ${value.toFixed(0)}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="total" 
            radius={[4, 4, 0, 0]}
          >
            {dataWithVariations.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.isNegative ? "#EF4444" : "#3B82F6"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
