
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { RelatorioMensal as RelatorioMensalType } from "@/types";

interface RelatorioMensalProps {
  relatorios: RelatorioMensalType[];
  mesSelecionado: string;
  onSelecionarMes: (mes: string) => void;
}

export const RelatorioMensal: React.FC<RelatorioMensalProps> = ({
  relatorios,
  mesSelecionado,
  onSelecionarMes
}) => {
  const relatorioAtual = relatorios.find(r => `${r.ano}-${r.mes}` === mesSelecionado);

  if (!relatorioAtual) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Relatório Mensal</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            Nenhum relatório disponível para o período selecionado.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Relatório Mensal</span>
          </div>
          <Select value={mesSelecionado} onValueChange={onSelecionarMes}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {relatorios.map((rel) => (
                <SelectItem key={`${rel.ano}-${rel.mes}`} value={`${rel.ano}-${rel.mes}`}>
                  {rel.mes}/{rel.ano}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Saldo Inicial</span>
            </div>
            <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
              R$ {relatorioAtual.saldoInicial.toFixed(2)}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Saldo Final</span>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
              R$ {relatorioAtual.saldoFinal.toFixed(2)}
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800 dark:text-green-200">Total Ganhos</span>
            </div>
            <p className="text-lg font-bold text-green-900 dark:text-green-100">
              R$ {relatorioAtual.totalGanhos.toFixed(2)}
            </p>
          </div>

          <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-800 dark:text-red-200">Total Perdas</span>
            </div>
            <p className="text-lg font-bold text-red-900 dark:text-red-100">
              R$ {Math.abs(relatorioAtual.totalPerdas).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="font-medium mb-2">Resultado Líquido</h4>
          <div className="flex items-center justify-between">
            <span className={`text-2xl font-bold ${
              relatorioAtual.variacaoLiquida >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {relatorioAtual.variacaoLiquida >= 0 ? '+' : ''}R$ {relatorioAtual.variacaoLiquida.toFixed(2)}
            </span>
            <span className={`text-lg font-medium ${
              relatorioAtual.variacaoPercentual >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              ({relatorioAtual.variacaoPercentual >= 0 ? '+' : ''}{relatorioAtual.variacaoPercentual.toFixed(1)}%)
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
