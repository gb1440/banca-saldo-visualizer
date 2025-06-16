
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Target, Edit } from "lucide-react";
import { CasaComSaldo } from "@/types";

interface MetasSaldoProps {
  casasComSaldo: CasaComSaldo[];
  onDefinirMeta: (casaId: string, meta: number) => void;
}

export const MetasSaldo: React.FC<MetasSaldoProps> = ({ casasComSaldo, onDefinirMeta }) => {
  const [modalAberto, setModalAberto] = useState(false);
  const [casaSelecionada, setCasaSelecionada] = useState<string>('');
  const [valorMeta, setValorMeta] = useState<number>(0);

  const casasComMetas = casasComSaldo.filter(c => c.casa.meta && c.casa.meta > 0);

  const handleDefinirMeta = (casaId: string, metaAtual?: number) => {
    setCasaSelecionada(casaId);
    setValorMeta(metaAtual || 0);
    setModalAberto(true);
  };

  const handleSalvarMeta = () => {
    if (casaSelecionada && valorMeta > 0) {
      onDefinirMeta(casaSelecionada, valorMeta);
      setModalAberto(false);
      setCasaSelecionada('');
      setValorMeta(0);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Metas de Saldo</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {casasComMetas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Target className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p className="text-lg font-medium mb-2">Nenhuma meta definida</p>
              <p className="text-sm mb-4">Defina metas para suas casas de apostas para acompanhar o progresso.</p>
              <Button onClick={() => setModalAberto(true)}>
                Definir primeira meta
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {casasComMetas.map(({ casa, saldoAtual, distanciaDaMeta }) => {
                const progressoPercentual = casa.meta ? Math.min((saldoAtual / casa.meta) * 100, 100) : 0;
                const metaAtingida = saldoAtual >= (casa.meta || 0);
                
                return (
                  <div key={casa.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{casa.nome}</h4>
                        <p className="text-sm text-gray-500">
                          R$ {saldoAtual.toFixed(2)} / R$ {casa.meta?.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDefinirMeta(casa.id, casa.meta)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <Progress 
                      value={progressoPercentual} 
                      className={`h-2 ${metaAtingida ? 'bg-green-100' : ''}`}
                    />
                    
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{progressoPercentual.toFixed(1)}% concluído</span>
                      <span>
                        {metaAtingida ? (
                          <span className="text-green-600 font-medium">✓ Meta atingida!</span>
                        ) : (
                          `Faltam R$ ${Math.abs(distanciaDaMeta).toFixed(2)}`
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
              
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => setModalAberto(true)}
              >
                <Target className="mr-2 h-4 w-4" />
                Definir nova meta
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Definir Meta de Saldo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="casa">Casa de Apostas</Label>
              <select
                id="casa"
                value={casaSelecionada}
                onChange={(e) => setCasaSelecionada(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Selecione uma casa</option>
                {casasComSaldo.map(({ casa }) => (
                  <option key={casa.id} value={casa.id}>
                    {casa.nome}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="meta">Meta de Saldo (R$)</Label>
              <Input
                id="meta"
                type="number"
                step="0.01"
                placeholder="Ex: 5000.00"
                value={valorMeta || ''}
                onChange={(e) => setValorMeta(Number(e.target.value))}
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setModalAberto(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSalvarMeta}>
                Salvar Meta
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
