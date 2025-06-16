
export interface CasaDeAposta {
  id: string;
  nome: string;
  createdAt: Date;
  meta?: number; // Meta de saldo para a casa
}

export interface RegistroSaldo {
  id: string;
  casaDeApostaId: string;
  data: string;
  saldo: number;
  createdAt: Date;
}

export interface CasaComSaldo {
  casa: CasaDeAposta;
  saldoAtual: number;
  ultimaAtualizacao: string;
  variacao: number;
  variacaoPercentual: number;
  distanciaDaMeta: number;
}

export interface MovimentacaoHistorico {
  id: string;
  data: string;
  casaDeAposta: string;
  saldoAtual: number;
  diferenca: number;
  diferencaPercentual: number;
  tipo: 'ganho' | 'perda' | 'neutro';
}

export interface RelatorioMensal {
  mes: string;
  ano: number;
  saldoInicial: number;
  saldoFinal: number;
  totalGanhos: number;
  totalPerdas: number;
  variacaoLiquida: number;
  variacaoPercentual: number;
}

export interface AlertaVariacao {
  id: string;
  tipo: 'perda_alta' | 'ganho_expressivo';
  casaDeAposta: string;
  valor: number;
  percentual: number;
  data: string;
  lido: boolean;
}

export interface ConfiguracaoAlertas {
  percentualPerdaAlerta: number;
  percentualGanhoAlerta: number;
  alertasAtivos: boolean;
}
