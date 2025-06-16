
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Building2, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AddCasaModal } from "@/components/AddCasaModal";
import { AddSaldoModal } from "@/components/AddSaldoModal";
import { CasasTable } from "@/components/CasasTable";
import { EvolutionChart } from "@/components/EvolutionChart";
import { MonthlyChart } from "@/components/MonthlyChart";
import { toast } from "@/hooks/use-toast";
import { CasaDeAposta, RegistroSaldo, CasaComSaldo } from "@/types";

const Dashboard = () => {
  const [casas, setCasas] = useState<CasaDeAposta[]>([]);
  const [registros, setRegistros] = useState<RegistroSaldo[]>([]);
  const [isAddCasaModalOpen, setIsAddCasaModalOpen] = useState(false);
  const [isAddSaldoModalOpen, setIsAddSaldoModalOpen] = useState(false);
  const [casaSelecionadaGrafico, setCasaSelecionadaGrafico] = useState<string>('total');

  // Carregar dados do localStorage
  useEffect(() => {
    const savedCasas = localStorage.getItem('betting-casas');
    const savedRegistros = localStorage.getItem('betting-registros');
    
    if (savedCasas) {
      const parsed = JSON.parse(savedCasas);
      setCasas(parsed.map((c: any) => ({ ...c, createdAt: new Date(c.createdAt) })));
    }
    
    if (savedRegistros) {
      const parsed = JSON.parse(savedRegistros);
      setRegistros(parsed.map((r: any) => ({ ...r, createdAt: new Date(r.createdAt) })));
    }
  }, []);

  // Salvar dados no localStorage
  useEffect(() => {
    localStorage.setItem('betting-casas', JSON.stringify(casas));
  }, [casas]);

  useEffect(() => {
    localStorage.setItem('betting-registros', JSON.stringify(registros));
  }, [registros]);

  const addCasa = (casaData: Omit<CasaDeAposta, 'id' | 'createdAt'>) => {
    const newCasa: CasaDeAposta = {
      ...casaData,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setCasas(prev => [...prev, newCasa]);
    toast({
      title: "Casa de apostas adicionada",
      description: `${casaData.nome} foi adicionada com sucesso.`,
    });
  };

  const addRegistro = (registroData: Omit<RegistroSaldo, 'id' | 'createdAt'>) => {
    const newRegistro: RegistroSaldo = {
      ...registroData,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setRegistros(prev => [newRegistro, ...prev]);
    
    const casa = casas.find(c => c.id === registroData.casaDeApostaId);
    toast({
      title: "Saldo registrado",
      description: `Saldo de R$ ${registroData.saldo.toFixed(2)} registrado para ${casa?.nome}.`,
    });
  };

  // Calcular dados das casas com saldos atuais
  const casasComSaldo: CasaComSaldo[] = casas.map(casa => {
    const registrosCasa = registros.filter(r => r.casaDeApostaId === casa.id);
    
    if (registrosCasa.length === 0) {
      return {
        casa,
        saldoAtual: 0,
        ultimaAtualizacao: '',
        variacao: 0
      };
    }

    // Ordenar por data
    const registrosOrdenados = registrosCasa.sort(
      (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
    );

    const ultimoRegistro = registrosOrdenados[0];
    const penultimoRegistro = registrosOrdenados[1];
    
    const variacao = penultimoRegistro 
      ? ultimoRegistro.saldo - penultimoRegistro.saldo 
      : 0;

    return {
      casa,
      saldoAtual: ultimoRegistro.saldo,
      ultimaAtualizacao: ultimoRegistro.data,
      variacao
    };
  });

  // Calcular totais
  const saldoTotal = casasComSaldo.reduce((sum, c) => sum + c.saldoAtual, 0);
  const variacaoTotal = casasComSaldo.reduce((sum, c) => sum + c.variacao, 0);
  const casasAtivas = casasComSaldo.filter(c => c.saldoAtual > 0).length;
  const totalRegistros = registros.length;

  const hasLoss = variacaoTotal < 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Controle Financeiro - Bancas de Apostas
          </h1>
          <p className="text-gray-600">
            Gerencie suas casas de apostas e acompanhe a evolução dos seus investimentos
          </p>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className={`${hasLoss ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
              {hasLoss ? <TrendingDown className="h-4 w-4 text-red-600" /> : <TrendingUp className="h-4 w-4 text-green-600" />}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${hasLoss ? 'text-red-600' : 'text-green-600'}`}>
                R$ {saldoTotal.toFixed(2)}
              </div>
              {variacaoTotal !== 0 && (
                <p className={`text-xs ${hasLoss ? 'text-red-600' : 'text-green-600'}`}>
                  {variacaoTotal > 0 ? '+' : ''}R$ {variacaoTotal.toFixed(2)} desde a última atualização
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Casas Ativas</CardTitle>
              <Building2 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{casasAtivas}</div>
              <p className="text-xs text-muted-foreground">
                {casas.length} casas cadastradas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Registros</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRegistros}</div>
              <p className="text-xs text-muted-foreground">
                Entradas de saldo
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Variação Média</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${variacaoTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {variacaoTotal >= 0 ? '+' : ''}{((variacaoTotal / (saldoTotal || 1)) * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Baseado na última movimentação
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button 
            onClick={() => setIsAddCasaModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            <Building2 className="mr-2 h-4 w-4" />
            Adicionar Casa de Apostas
          </Button>
          
          <Button 
            onClick={() => setIsAddSaldoModalOpen(true)}
            className="bg-green-600 hover:bg-green-700"
            size="lg"
            disabled={casas.length === 0}
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Saldo Diário
          </Button>
        </div>

        {/* Tabela de Casas */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Casas de Apostas</CardTitle>
            </CardHeader>
            <CardContent>
              <CasasTable casasComSaldo={casasComSaldo} />
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Evolução Diária
                <Select value={casaSelecionadaGrafico} onValueChange={setCasaSelecionadaGrafico}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="total">Saldo Total</SelectItem>
                    {casas.map(casa => (
                      <SelectItem key={casa.id} value={casa.id}>
                        {casa.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EvolutionChart 
                registros={registros}
                casas={casas}
                tipo={casaSelecionadaGrafico === 'total' ? 'total' : 'individual'}
                casaSelecionada={casaSelecionadaGrafico !== 'total' ? casaSelecionadaGrafico : undefined}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumo Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <MonthlyChart balances={registros.map(r => ({
                id: r.id,
                date: r.data,
                casaDeAposta: casas.find(c => c.id === r.casaDeApostaId)?.nome || '',
                saldo: r.saldo,
                createdAt: r.createdAt
              }))} />
            </CardContent>
          </Card>
        </div>

        {/* Modais */}
        <AddCasaModal
          open={isAddCasaModalOpen}
          onClose={() => setIsAddCasaModalOpen(false)}
          onAdd={addCasa}
          casasExistentes={casas}
        />

        <AddSaldoModal
          open={isAddSaldoModalOpen}
          onClose={() => setIsAddSaldoModalOpen(false)}
          onAdd={addRegistro}
          casas={casas}
        />
      </div>
    </div>
  );
};

export default Dashboard;
