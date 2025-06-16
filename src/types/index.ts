
export interface CasaDeAposta {
  id: string;
  nome: string;
  createdAt: Date;
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
}
