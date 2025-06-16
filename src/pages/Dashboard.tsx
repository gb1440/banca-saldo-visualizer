
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, TrendingDown } from "lucide-react";
import { AddBalanceModal } from "@/components/AddBalanceModal";
import { BalanceChart } from "@/components/BalanceChart";
import { MonthlyChart } from "@/components/MonthlyChart";
import { BalanceList } from "@/components/BalanceList";
import { toast } from "@/hooks/use-toast";

interface BalanceEntry {
  id: string;
  date: string;
  casaDeAposta: string;
  saldo: number;
  createdAt: Date;
}

const Dashboard = () => {
  const [balances, setBalances] = useState<BalanceEntry[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Carregar dados do localStorage na inicialização
  useEffect(() => {
    const savedBalances = localStorage.getItem('betting-balances');
    if (savedBalances) {
      const parsed = JSON.parse(savedBalances);
      setBalances(parsed.map((b: any) => ({ ...b, createdAt: new Date(b.createdAt) })));
    }
  }, []);

  // Salvar dados no localStorage sempre que houver mudanças
  useEffect(() => {
    localStorage.setItem('betting-balances', JSON.stringify(balances));
  }, [balances]);

  const addBalance = (entry: Omit<BalanceEntry, 'id' | 'createdAt'>) => {
    const newEntry: BalanceEntry = {
      ...entry,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setBalances(prev => [newEntry, ...prev]);
    toast({
      title: "Saldo adicionado",
      description: `Saldo de R$ ${entry.saldo.toFixed(2)} para ${entry.casaDeAposta} foi registrado.`,
    });
  };

  const updateBalance = (id: string, updatedEntry: Partial<BalanceEntry>) => {
    setBalances(prev => prev.map(entry => 
      entry.id === id ? { ...entry, ...updatedEntry } : entry
    ));
    toast({
      title: "Saldo atualizado",
      description: "O registro foi atualizado com sucesso.",
    });
  };

  const deleteBalance = (id: string) => {
    setBalances(prev => prev.filter(entry => entry.id !== id));
    toast({
      title: "Saldo removido",
      description: "O registro foi removido com sucesso.",
    });
  };

  // Calcular saldo total atual
  const totalBalance = balances.reduce((sum, entry) => sum + entry.saldo, 0);

  // Calcular variação do dia anterior
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  const todayTotal = balances
    .filter(entry => entry.date === today)
    .reduce((sum, entry) => sum + entry.saldo, 0);
  
  const yesterdayTotal = balances
    .filter(entry => entry.date === yesterday)
    .reduce((sum, entry) => sum + entry.saldo, 0);

  const dailyVariation = todayTotal - yesterdayTotal;
  const hasLoss = dailyVariation < 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Controle Financeiro - Bancas de Apostas
          </h1>
          <p className="text-gray-600">
            Gerencie seus saldos e acompanhe a evolução dos seus investimentos
          </p>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className={`${hasLoss ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
              {hasLoss ? <TrendingDown className="h-4 w-4 text-red-600" /> : <TrendingUp className="h-4 w-4 text-green-600" />}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${hasLoss ? 'text-red-600' : 'text-green-600'}`}>
                R$ {totalBalance.toFixed(2)}
              </div>
              {dailyVariation !== 0 && (
                <p className={`text-xs ${hasLoss ? 'text-red-600' : 'text-green-600'}`}>
                  {dailyVariation > 0 ? '+' : ''}R$ {dailyVariation.toFixed(2)} desde ontem
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Casas Ativas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(balances.map(b => b.casaDeAposta)).size}
              </div>
              <p className="text-xs text-muted-foreground">
                Casas de apostas cadastradas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Registros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{balances.length}</div>
              <p className="text-xs text-muted-foreground">
                Total de entradas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Botão Adicionar */}
        <div className="mb-8">
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Saldo
          </Button>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Evolução Diária</CardTitle>
            </CardHeader>
            <CardContent>
              <BalanceChart balances={balances} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumo Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <MonthlyChart balances={balances} />
            </CardContent>
          </Card>
        </div>

        {/* Lista de Saldos */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Saldos</CardTitle>
          </CardHeader>
          <CardContent>
            <BalanceList 
              balances={balances}
              onUpdate={updateBalance}
              onDelete={deleteBalance}
            />
          </CardContent>
        </Card>

        {/* Modal Adicionar Saldo */}
        <AddBalanceModal
          open={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={addBalance}
        />
      </div>
    </div>
  );
};

export default Dashboard;
