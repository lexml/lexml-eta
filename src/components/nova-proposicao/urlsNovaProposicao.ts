import { semZerosAEsquerda } from './montaUrnNovaProposicao';

export interface ConfigNovaProposicao {
  casaLegislativaEditor?: string;
  urlVerificacaoProposicao?: string;
  urlTextoEstruturado?: string;
  urlComissoes?: string;
}

const URLS_OBRIGATORIAS: (keyof ConfigNovaProposicao)[] = ['urlVerificacaoProposicao', 'urlTextoEstruturado', 'urlComissoes'];

/** As três URLs são obrigatórias; só a casa tem padrão. */
export const validarConfigNovaProposicao = (config?: ConfigNovaProposicao): void => {
  URLS_OBRIGATORIAS.forEach(nome => {
    if (!config?.[nome]?.trim()) throw new Error(`Configuração da nova proposição inválida: '${nome}' não informada.`);
  });
};

/** Sigla em maiúsculas e número sem zeros à esquerda. */
export const montaUrlProposicao = (modelo: string, sigla: string, numero: string, ano: string): string =>
  modelo
    .replace(/\{sigla\}/g, encodeURIComponent(sigla.trim().toUpperCase()))
    .replace(/\{numero\}/g, encodeURIComponent(semZerosAEsquerda(numero)))
    .replace(/\{ano\}/g, encodeURIComponent(ano.trim()));

export const montaUrlComissoes = (modelo: string, casa: string): string => modelo.replace(/\{casa\}/g, encodeURIComponent(casa));
