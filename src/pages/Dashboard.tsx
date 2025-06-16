import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Building2, TrendingUp, TrendingDown, BarChart3, Download, Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddCasaModal } from "@/components/AddCasaModal";
import { AddSaldoModal } from "@/components/AddSaldoModal";
import { CasasTable } from "@/components/CasasTable";
import { EvolutionChart } from "@/components/EvolutionChart";
import { MonthlyChart } from "@/components/MonthlyChart";
import { HistoricoMovimentacao } from "@/components/HistoricoMovimentacao";
import { AlertasVariacao } from "@/components/AlertasVariacao";
import { MetasSaldo } from "@/components/MetasSaldo";
import { RelatorioMensal } from "@/components/RelatorioMensal";
import { ComparativoCasas } from "@/components/ComparativoCasas";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "@/hooks/use-toast";
import { 
  CasaDeAposta, 
  RegistroSaldo, 
  CasaComSaldo, 
  MovimentacaoHistorico,
  AlertaVariacao,
  RelatorioMensal as RelatorioMensalType,
  ConfiguracaoAlertas
} from "@/types";
import { exportarCSV, exportarRelatorioCompleto } from "@/utils/dataExport";

const Dashboard = () => {
  const [casas, setCasas] = useState<CasaDeAposta[]>([]);
  const [registros, setRegistros] = useState<RegistroSaldo[]>([]);
  const [alertas, setAlertas] = useState<AlertaVariacao[]>([]);
  const [configuracaoAlertas, setConfiguracaoAlertas] = useState<ConfiguracaoAlertas>({
    percentualPerdaAlerta: 15,
    percentualGanhoAlerta: 20,
    alertasAtivos: true
  });
  const [isAddCasaModalOpen, setIsAddCasaModalOpen] = useState(false);
  const [isAddSaldoModalOpen, setIsAddSaldoModalOpen] = useState(false);
  const [mesSelecionado, setMesSelecionado] = useState(() => {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    const savedCasas = localStorage.getItem('betting-casas');
    const savedRegistros = localStorage.getItem('betting-registros');
    const savedAlertas = localStorage.getItem('betting-alertas');
    const savedConfig = localStorage.getItem('betting-config-alertas');
    
    if (savedCasas) {
      const parsed = JSON.parse(savedCasas);
      setCasas(parsed.map((c: any) => ({ ...c, createdAt: new Date(c.createdAt) })));
    }
    
    if (savedRegistros) {
      const parsed = JSON.parse(savedRegistros);
      setRegistros(parsed.map((r: any) => ({ ...r, createdAt: new Date(r.createdAt) })));
    }

    if (savedAlertas) {
      setAlertas(JSON.parse(savedAlertas));
    }

    if (savedConfig) {
      setConfiguracaoAlertas(JSON.parse(savedConfig));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('betting-casas', JSON.stringify(casas));
  }, [casas]);

  useEffect(() => {
    localStorage.setItem('betting-registros', JSON.stringify(registros));
  }, [registros]);

  useEffect(() => {
    localStorage.setItem('betting-alertas', JSON.stringify(alertas));
  }, [alertas]);

  useEffect(() => {
    localStorage.setItem('betting-config-alertas', JSON.stringify(configuracaoAlertas));
  }, [configuracaoAlertas]);

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
    
    // Verificar alertas
    if (configuracaoAlertas.alertasAtivos) {
      verificarAlertas(registroData.casaDeApostaId, registroData.saldo);
    }
    
    setRegistros(prev => [newRegistro, ...prev]);
    
    const casa = casas.find(c => c.id === registroData.casaDeApostaId);
    toast({
      title: "Saldo registrado",
      description: `Saldo de R$ ${registroData.saldo.toFixed(2)} registrado para ${casa?.nome}.`,
    });
  };

  const verificarAlertas = (casaId: string, novoSaldo: number) => {
    const casa = casas.find(c => c.id === casaId);
    if (!casa) return;

    const registrosCasa = registros.filter(r => r.casaDeApostaId === casaId);
    if (registrosCasa.length === 0) return;

    const ultimoRegistro = registrosCasa.sort(
      (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
    )[0];

    const diferenca = novoSaldo - ultimoRegistro.saldo;
    const percentual = ultimoRegistro.saldo > 0 ? (diferenca / ultimoRegistro.saldo) * 100 : 0;

    if (percentual <= -configuracaoAlertas.percentualPerdaAlerta) {
      criarAlerta('perda_alta', casa.nome, diferenca, percentual);
    } else if (percentual >= configuracaoAlertas.percentualGanhoAlerta) {
      criarAlerta('ganho_expressivo', casa.nome, diferenca, percentual);
    }
  };

  const criarAlerta = (tipo: 'perda_alta' | 'ganho_expressivo', casaDeAposta: string, valor: number, percentual: number) => {
    const novoAlerta: AlertaVariacao = {
      id: Date.now().toString(),
      tipo,
      casaDeAposta,
      valor,
      percentual,
      data: new Date().toISOString().split('T')[0],
      lido: false
    };
    
    setAlertas(prev => [novoAlerta, ...prev]);
  };

  const definirMeta = (casaId: string, meta: number) => {
    setCasas(prev => prev.map(casa => 
      casa.id === casaId ? { ...casa, meta } : casa
    ));
    
    const casa = casas.find(c => c.id === casaId);
    toast({
      title: "Meta definida",
      description: `Meta de R$ ${meta.toFixed(2)} definida para ${casa?.nome}.`,
    });
  };

  const casasComSaldo: CasaComSaldo[] = casas.map(casa => {
    const registrosCasa = registros.filter(r => r.casaDeApostaId === casa.id);
    
    if (registrosCasa.length === 0) {
      return {
        casa,
        saldoAtual: 0,
        ultimaAtualizacao: '',
        variacao: 0,
        variacaoPercentual: 0,
        distanciaDaMeta: casa.meta ? casa.meta : 0
      };
    }

    const registrosOrdenados = registrosCasa.sort(
      (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
    );

    const ultimoRegistro = registrosOrdenados[0];
    const penultimoRegistro = registrosOrdenados[1];
    
    const variacao = penultimoRegistro 
      ? ultimoRegistro.saldo - penultimoRegistro.saldo 
      : 0;
    
    const variacaoPercentual = penultimoRegistro && penultimoRegistro.saldo > 0
      ? (variacao / penultimoRegistro.saldo) * 100
      : 0;

    const distanciaDaMeta = casa.meta ? casa.meta - ultimoRegistro.saldo : 0;

    return {
      casa,
      saldoAtual: ultimoRegistro.saldo,
      ultimaAtualizacao: ultimoRegistro.data,
      variacao,
      variacaoPercentual,
      distanciaDaMeta
    };
  });

  const movimentacoes: MovimentacaoHistorico[] = registros.map(registro => {
    const casa = casas.find(c => c.id === registro.casaDeApostaId);
    const registrosCasa = registros
      .filter(r => r.casaDeApostaId === registro.casaDeApostaId)
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
    
    const indiceAtual = registrosCasa.findIndex(r => r.id === registro.id);
    const registroAnterior = indiceAtual > 0 ? registrosCasa[indiceAtual - 1] : null;
    
    const diferenca = registroAnterior ? registro.saldo - registroAnterior.saldo : 0;
    const diferencaPercentual = registroAnterior && registroAnterior.saldo > 0
      ? (diferenca / registroAnterior.saldo) * 100
      : 0;

    return {
      id: registro.id,
      data: registro.data,
      casaDeAposta: casa?.nome || 'Casa não encontrada',
      saldoAtual: registro.saldo,
      diferenca,
      diferencaPercentual,
      tipo: diferenca > 0 ? 'ganho' : diferenca < 0 ? 'perda' : 'neutro'
    };
  }).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  const relatoriosMensais: RelatorioMensalType[] = React.useMemo(() => {
    const mesesUnicos = Array.from(new Set(
      registros.map(r => {
        const date = new Date(r.data);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      })
    ));

    return mesesUnicos.map(mesAno => {
      const [ano, mes] = mesAno.split('-');
      const registrosDoMes = registros.filter(r => {
        const date = new Date(r.data);
        return date.getFullYear() === parseInt(ano) && 
               date.getMonth() + 1 === parseInt(mes);
      });

      // Saldo inicial (último dia do mês anterior)
      const mesAnterior = new Date(parseInt(ano), parseInt(mes) - 2, 1);
      const registrosMesAnterior = registros.filter(r => {
        const date = new Date(r.data);
        return date.getFullYear() === mesAnterior.getFullYear() && 
               date.getMonth() === mesAnterior.getMonth();
      });

      const saldoInicial = registrosMesAnterior.length > 0
        ? registrosMesAnterior.reduce((sum, r) => sum + r.saldo, 0)
        : 0;

      const saldoFinal = registrosDoMes.reduce((sum, r) => sum + r.saldo, 0);
      const variacaoLiquida = saldoFinal - saldoInicial;
      const variacaoPercentual = saldoInicial > 0 ? (variacaoLiquida / saldoInicial) * 100 : 0;

      // Calcular ganhos e perdas
      const movimentacoesMes = movimentacoes.filter(m => {
        const date = new Date(m.data);
        return date.getFullYear() === parseInt(ano) && 
               date.getMonth() + 1 === parseInt(mes);
      });

      const totalGanhos = movimentacoesMes
        .filter(m => m.diferenca > 0)
        .reduce((sum, m) => sum + m.diferenca, 0);

      const totalPerdas = movimentacoesMes
        .filter(m => m.diferenca < 0)
        .reduce((sum, m) => sum + Math.abs(m.diferenca), 0);

      return {
        mes: mes.padStart(2, '0'),
        ano: parseInt(ano),
        saldoInicial,
        saldoFinal,
        totalGanhos,
        totalPerdas: -totalPerdas,
        variacaoLiquida,
        variacaoPercentual
      };
    });
  }, [registros, movimentacoes]);

  const saldoTotal = casasComSaldo.reduce((sum, c) => sum + c.saldoAtual, 0);
  const variacaoTotal = casasComSaldo.reduce((sum, c) => sum + c.variacao, 0);
  const casasAtivas = casasComSaldo.filter(c => c.saldoAtual > 0).length;
  const totalRegistros = registros.length;
  const hasLoss = variacaoTotal < 0;

  const marcarAlertaComoLido = (id: string) => {
    setAlertas(prev => prev.map(alerta => 
      alerta.id === id ? { ...alerta, lido: true } : alerta
    ));
  };

  const removerAlerta = (id: string) => {
    setAlertas(prev => prev.filter(alerta => alerta.id !== id));
  };

  const handleExportCSV = () => {
    exportarCSV(movimentacoes);
    toast({
      title: "Arquivo exportado",
      description: "O arquivo CSV foi baixado com sucesso.",
    });
  };

  const handleExportCompleto = () => {
    exportarRelatorioCompleto(casasComSaldo, movimentacoes, relatoriosMensais);
    toast({
      title: "Backup exportado",
      description: "O backup completo foi baixado com sucesso.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 transition-colors">
      <ThemeToggle />
      
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Controle Financeiro - Bancas de Apostas
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Gerencie suas casas de apostas e acompanhe a evolução dos seus investimentos
          </p>
        </div>

        {/* Alertas */}
        <div className="mb-6">
          <AlertasVariacao
            alertas={alertas}
            onMarcarComoLido={marcarAlertaComoLido}
            onRemoverAlerta={removerAlerta}
          />
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className={`${hasLoss ? 'border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800' : 'border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800'}`}>
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

          <Button 
            onClick={handleExportCompleto}
            variant="outline"
            size="lg"
          >
            <Download className="mr-2 h-4 w-4" />
            Backup Completo
          </Button>
        </div>

        {/* Tabs com conteúdo */}
        <Tabs defaultValue="visao-geral" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
            <TabsTrigger value="metas">Metas</TabsTrigger>
            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
            <TabsTrigger value="comparativo">Ranking</TabsTrigger>
            <TabsTrigger value="graficos">Gráficos</TabsTrigger>
          </TabsList>

          <TabsContent value="visao-geral">
            <CasasTable casasComSaldo={casasComSaldo} />
          </TabsContent>

          <TabsContent value="historico">
            <HistoricoMovimentacao 
              movimentacoes={movimentacoes}
              onExportCSV={handleExportCSV}
            />
          </TabsContent>

          <TabsContent value="metas">
            <MetasSaldo
              casasComSaldo={casasComSaldo}
              onDefinirMeta={definirMeta}
            />
          </TabsContent>

          <TabsContent value="relatorios">
            <RelatorioMensal
              relatorios={relatoriosMensais}
              mesSelecionado={mesSelecionado}
              onSelecionarMes={setMesSelecionado}
            />
          </TabsContent>

          <TabsContent value="comparativo">
            <ComparativoCasas casasComSaldo={casasComSaldo} />
          </TabsContent>

          <TabsContent value="graficos">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Evolução Diária</CardTitle>
                </CardHeader>
                <CardContent>
                  <EvolutionChart 
                    registros={registros}
                    casas={casas}
                    tipo="total"
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
          </TabsContent>
        </Tabs>

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
