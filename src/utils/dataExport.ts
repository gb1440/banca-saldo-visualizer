
import { MovimentacaoHistorico, RelatorioMensal, CasaComSaldo } from "@/types";

export const exportarCSV = (movimentacoes: MovimentacaoHistorico[]) => {
  const headers = ['Data', 'Casa de Apostas', 'Saldo Atual', 'Diferença', 'Diferença %', 'Tipo'];
  
  const csvContent = [
    headers.join(','),
    ...movimentacoes.map(mov => [
      new Date(mov.data).toLocaleDateString('pt-BR'),
      `"${mov.casaDeAposta}"`,
      mov.saldoAtual.toFixed(2),
      mov.diferenca.toFixed(2),
      mov.diferencaPercentual.toFixed(2),
      mov.tipo
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `movimentacoes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const exportarRelatorioCompleto = (
  casasComSaldo: CasaComSaldo[],
  movimentacoes: MovimentacaoHistorico[],
  relatorios: RelatorioMensal[]
) => {
  const data = {
    casas: casasComSaldo,
    movimentacoes,
    relatorios,
    exportadoEm: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `backup_completo_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
