
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RegistroSaldo, CasaDeAposta } from "@/types";

interface EvolutionChartProps {
  registros: RegistroSaldo[];
  casas: CasaDeAposta[];
  tipo: 'total' | 'individual';
  casaSelecionada?: string;
}

export const EvolutionChart: React.FC<EvolutionChartProps> = ({ 
  registros, 
  casas, 
  tipo, 
  casaSelecionada 
}) => {
  const processData = () => {
    if (tipo === 'total') {
      // Agrupar por data e calcular total diário
      const dailyTotals = registros.reduce((acc, registro) => {
        const date = registro.data;
        if (!acc[date]) {
          acc[date] = {};
        }
        acc[date][registro.casaDeApostaId] = registro.saldo;
        return acc;
      }, {} as Record<string, Record<string, number>>);

      return Object.entries(dailyTotals)
        .map(([date, casaSaldos]) => {
          const total = Object.values(casaSaldos).reduce((sum, saldo) => sum + saldo, 0);
          return {
            date: new Date(date).toLocaleDateString('pt-BR'),
            total,
            originalDate: date
          };
        })
        .sort((a, b) => new Date(a.originalDate).getTime() - new Date(b.originalDate).getTime())
        .slice(-30);
    } else {
      // Dados de uma casa específica
      if (!casaSelecionada) return [];
      
      return registros
        .filter(r => r.casaDeApostaId === casaSelecionada)
        .map(registro => ({
          date: new Date(registro.data).toLocaleDateString('pt-BR'),
          total: registro.saldo,
          originalDate: registro.data
        }))
        .sort((a, b) => new Date(a.originalDate).getTime() - new Date(b.originalDate).getTime())
        .slice(-30);
    }
  };

  const chartData = processData();

  // Calcular variações
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
            {`${tipo === 'total' ? 'Total' : 'Saldo'}: R$ ${data.total.toFixed(2)}`}
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
