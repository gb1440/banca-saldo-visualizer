
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Trophy, Medal, Award } from "lucide-react";
import { CasaComSaldo } from "@/types";

interface ComparativoCasasProps {
  casasComSaldo: CasaComSaldo[];
}

export const ComparativoCasas: React.FC<ComparativoCasasProps> = ({ casasComSaldo }) => {
  const casasOrdenadas = [...casasComSaldo]
    .filter(c => c.saldoAtual > 0)
    .sort((a, b) => b.saldoAtual - a.saldoAtual);

  const chartData = casasOrdenadas.map((casa, index) => ({
    nome: casa.casa.nome,
    saldo: casa.saldoAtual,
    variacao: casa.variacao,
    posicao: index + 1,
    isPositive: casa.variacao >= 0
  }));

  const getIconePosicao = (posicao: number) => {
    switch (posicao) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="h-5 w-5 flex items-center justify-center text-xs font-bold text-gray-500">#{posicao}</span>;
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border rounded-lg shadow-md">
          <p className="font-medium">{data.nome}</p>
          <p className="text-blue-600">Saldo: R$ {data.saldo.toFixed(2)}</p>
          <p className={data.isPositive ? 'text-green-600' : 'text-red-600'}>
            Variação: {data.variacao > 0 ? '+' : ''}R$ {data.variacao.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (casasOrdenadas.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Comparativo entre Casas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Trophy className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p>Nenhuma casa com saldo para comparar</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparativo entre Casas - Ranking</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ranking em Lista */}
          <div className="space-y-3">
            <h4 className="font-medium mb-4">Ranking por Saldo</h4>
            {casasOrdenadas.slice(0, 5).map((casa, index) => (
              <div key={casa.casa.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getIconePosicao(index + 1)}
                  <div>
                    <p className="font-medium">{casa.casa.nome}</p>
                    <p className="text-sm text-gray-500">
                      R$ {casa.saldoAtual.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-medium ${
                    casa.variacao >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {casa.variacao >= 0 ? '+' : ''}R$ {casa.variacao.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Gráfico de Barras */}
          <div>
            <h4 className="font-medium mb-4">Comparativo Visual</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.slice(0, 5)} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    tickFormatter={(value) => `R$ ${value.toFixed(0)}`}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="nome" 
                    width={80}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="saldo" radius={[0, 4, 4, 0]}>
                    {chartData.slice(0, 5).map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={
                          index === 0 ? "#FFD700" : // Ouro
                          index === 1 ? "#C0C0C0" : // Prata
                          index === 2 ? "#CD7F32" : // Bronze
                          "#3B82F6" // Azul padrão
                        } 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
