
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BalanceEntry {
  id: string;
  date: string;
  casaDeAposta: string;
  saldo: number;
  createdAt: Date;
}

interface BalanceChartProps {
  balances: BalanceEntry[];
}

export const BalanceChart: React.FC<BalanceChartProps> = ({ balances }) => {
  // Agrupar saldos por data e calcular total diário
  const dailyTotals = balances.reduce((acc, entry) => {
    const date = entry.date;
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date] += entry.saldo;
    return acc;
  }, {} as Record<string, number>);

  // Converter para array e ordenar por data
  const chartData = Object.entries(dailyTotals)
    .map(([date, total]) => ({
      date: new Date(date).toLocaleDateString('pt-BR'),
      total: total,
      originalDate: date
    }))
    .sort((a, b) => new Date(a.originalDate).getTime() - new Date(b.originalDate).getTime())
    .slice(-30); // Últimos 30 dias

  // Calcular variações diárias
  const dataWithVariations = chartData.map((item, index) => {
    const previousDay = index > 0 ? chartData[index - 1] : null;
    const variation = previousDay ? item.total - previousDay.total : 0;
    
    return {
      ...item,
      variation,
      isNegative: variation < 0
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-md">
          <p className="font-medium">{`Data: ${label}`}</p>
          <p className="text-blue-600">
            {`Total: R$ ${data.total.toFixed(2)}`}
          </p>
          {data.variation !== 0 && (
            <p className={data.isNegative ? 'text-red-600' : 'text-green-600'}>
              {`Variação: ${data.variation > 0 ? '+' : ''}R$ ${data.variation.toFixed(2)}`}
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
        <LineChart data={dataWithVariations}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `R$ ${value.toFixed(0)}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="total" 
            stroke="#3B82F6" 
            strokeWidth={2}
            dot={(props) => {
              const { cx, cy, payload } = props;
              return (
                <circle
                  cx={cx}
                  cy={cy}
                  r={4}
                  fill={payload.isNegative ? "#EF4444" : "#10B981"}
                  stroke={payload.isNegative ? "#DC2626" : "#059669"}
                  strokeWidth={2}
                />
              );
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
