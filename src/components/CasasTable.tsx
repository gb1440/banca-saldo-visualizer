
import React from 'react';
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { CasaComSaldo } from "@/types";

interface CasasTableProps {
  casasComSaldo: CasaComSaldo[];
}

export const CasasTable: React.FC<CasasTableProps> = ({ casasComSaldo }) => {
  if (casasComSaldo.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium mb-2">Nenhuma casa de apostas cadastrada</p>
          <p className="text-sm">Comece adicionando uma casa de apostas para começar o controle.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Casa de Apostas</TableHead>
            <TableHead className="text-right">Saldo Atual</TableHead>
            <TableHead className="text-right">Variação</TableHead>
            <TableHead className="text-right">Última Atualização</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {casasComSaldo.map(({ casa, saldoAtual, variacao, ultimaAtualizacao }) => (
            <TableRow key={casa.id}>
              <TableCell className="font-medium">{casa.nome}</TableCell>
              <TableCell className="text-right font-bold">
                R$ {saldoAtual.toFixed(2)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end space-x-1">
                  {variacao > 0 ? (
                    <>
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-green-600 font-medium">
                        +R$ {variacao.toFixed(2)}
                      </span>
                    </>
                  ) : variacao < 0 ? (
                    <>
                      <TrendingDown className="h-4 w-4 text-red-600" />
                      <span className="text-red-600 font-medium">
                        -R$ {Math.abs(variacao).toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <>
                      <Minus className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-400">
                        R$ 0,00
                      </span>
                    </>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right text-sm text-gray-500">
                {ultimaAtualizacao ? new Date(ultimaAtualizacao).toLocaleDateString('pt-BR') : 'Nunca'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};
