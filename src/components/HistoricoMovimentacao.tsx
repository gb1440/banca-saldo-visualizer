
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Download, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { MovimentacaoHistorico } from "@/types";

interface HistoricoMovimentacaoProps {
  movimentacoes: MovimentacaoHistorico[];
  onExportCSV: () => void;
}

export const HistoricoMovimentacao: React.FC<HistoricoMovimentacaoProps> = ({ 
  movimentacoes, 
  onExportCSV 
}) => {
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroCasa, setFiltroCasa] = useState<string>('todas');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');

  const casasUnicas = Array.from(new Set(movimentacoes.map(m => m.casaDeAposta)));

  const movimentacoesFiltradas = movimentacoes.filter(mov => {
    const matchTexto = mov.casaDeAposta.toLowerCase().includes(filtroTexto.toLowerCase()) ||
                      mov.data.includes(filtroTexto);
    const matchCasa = filtroCasa === 'todas' || mov.casaDeAposta === filtroCasa;
    const matchTipo = filtroTipo === 'todos' || mov.tipo === filtroTipo;
    
    return matchTexto && matchCasa && matchTipo;
  });

  const renderIconeVariacao = (tipo: string, diferenca: number) => {
    if (tipo === 'ganho') {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (tipo === 'perda') {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Histórico de Movimentações
          <Button onClick={onExportCSV} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        </CardTitle>
        
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por casa ou data..."
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              className="w-64"
            />
          </div>
          
          <Select value={filtroCasa} onValueChange={setFiltroCasa}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por casa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as casas</SelectItem>
              {casasUnicas.map(casa => (
                <SelectItem key={casa} value={casa}>{casa}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filtroTipo} onValueChange={setFiltroTipo}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os tipos</SelectItem>
              <SelectItem value="ganho">Ganhos</SelectItem>
              <SelectItem value="perda">Perdas</SelectItem>
              <SelectItem value="neutro">Sem variação</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Casa de Apostas</TableHead>
              <TableHead className="text-right">Saldo</TableHead>
              <TableHead className="text-right">Variação</TableHead>
              <TableHead className="text-right">%</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movimentacoesFiltradas.map((mov) => (
              <TableRow key={mov.id}>
                <TableCell>{new Date(mov.data).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell className="font-medium">{mov.casaDeAposta}</TableCell>
                <TableCell className="text-right font-bold">
                  R$ {mov.saldoAtual.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-1">
                    {renderIconeVariacao(mov.tipo, mov.diferenca)}
                    <span className={`font-medium ${
                      mov.tipo === 'ganho' ? 'text-green-600' : 
                      mov.tipo === 'perda' ? 'text-red-600' : 'text-gray-400'
                    }`}>
                      {mov.diferenca > 0 ? '+' : ''}R$ {mov.diferenca.toFixed(2)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className={`font-medium ${
                    mov.tipo === 'ganho' ? 'text-green-600' : 
                    mov.tipo === 'perda' ? 'text-red-600' : 'text-gray-400'
                  }`}>
                    {mov.diferencaPercentual > 0 ? '+' : ''}{mov.diferencaPercentual.toFixed(1)}%
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {movimentacoesFiltradas.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhuma movimentação encontrada com os filtros aplicados.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
