
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingUp, X } from "lucide-react";
import { AlertaVariacao } from "@/types";

interface AlertasVariacaoProps {
  alertas: AlertaVariacao[];
  onMarcarComoLido: (id: string) => void;
  onRemoverAlerta: (id: string) => void;
}

export const AlertasVariacao: React.FC<AlertasVariacaoProps> = ({
  alertas,
  onMarcarComoLido,
  onRemoverAlerta
}) => {
  const alertasNaoLidos = alertas.filter(a => !a.lido);

  if (alertasNaoLidos.length === 0) {
    return null;
  }

  return (
    <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-orange-800 dark:text-orange-200">
          <AlertTriangle className="h-5 w-5" />
          <span>Alertas de Variação ({alertasNaoLidos.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alertasNaoLidos.map((alerta) => (
          <Alert 
            key={alerta.id} 
            className={`${
              alerta.tipo === 'perda_alta' 
                ? 'border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800' 
                : 'border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {alerta.tipo === 'perda_alta' ? (
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                )}
                <AlertDescription className={
                  alerta.tipo === 'perda_alta' 
                    ? 'text-red-800 dark:text-red-200' 
                    : 'text-green-800 dark:text-green-200'
                }>
                  <strong>{alerta.casaDeAposta}</strong> teve{' '}
                  {alerta.tipo === 'perda_alta' ? 'perda de' : 'ganho de'}{' '}
                  <strong>{alerta.percentual.toFixed(1)}%</strong>{' '}
                  (R$ {alerta.valor > 0 ? '+' : ''}{alerta.valor.toFixed(2)}) em{' '}
                  {new Date(alerta.data).toLocaleDateString('pt-BR')}
                </AlertDescription>
              </div>
              
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMarcarComoLido(alerta.id)}
                  className="text-xs"
                >
                  Marcar como lido
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoverAlerta(alerta.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
};
