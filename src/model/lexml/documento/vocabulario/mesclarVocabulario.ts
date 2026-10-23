import { ComAutoridade, TipoDocumento, TipoDocumentoItem, TipoRelacaoSubstitutivo, Vocabulario, VocabularioAutoridade, VocabularioComum } from './tiposVocabulario';

const carimbar = <T>(itens: T[] | undefined, urnAutoridade: string): ComAutoridade<T>[] => (itens ?? []).map(i => ({ ...i, urnAutoridade }));

const calcularUrn = (t: TipoDocumentoItem): string => (t.sigla ? `${t.urnTipoDocumento};${t.sigla.toLowerCase()}` : t.urnTipoDocumento);

const completarTipo = (t: ComAutoridade<TipoDocumentoItem>): TipoDocumento => {
  const base = { ...t, urn: calcularUrn(t) };
  if (!t.sigla) return base;
  return { ...base, ativo: t.ativo ?? true, tipoRelacaoSubstitutivo: t.tipoRelacaoSubstitutivo ?? TipoRelacaoSubstitutivo.NAO_ACEITA_SUBSTITUTIVO };
};

const descreve = (t: TipoDocumento): string => `${t.urnAutoridade}:${t.urn}`;

const aceitaComoReferencia = (t: TipoDocumento): boolean =>
  t.tipoRelacaoSubstitutivo === TipoRelacaoSubstitutivo.ACEITA_SUBSTITUTIVO || t.tipoRelacaoSubstitutivo === TipoRelacaoSubstitutivo.E_SUBSTITUTIVO;

// Falha na montagem: vocabulário inválido é erro de dados, não de uso.
const validar = (tipos: TipoDocumento[], siglaAtivaUnica: boolean): void => {
  const chaves = new Set<string>();
  const siglasAtivas = new Map<string, TipoDocumento>();

  tipos.forEach(t => {
    const chave = descreve(t);
    if (chaves.has(chave)) {
      throw new Error(`Vocabulário inválido: tipo duplicado '${chave}'.`);
    }
    chaves.add(chave);

    if (siglaAtivaUnica && t.sigla && t.ativo) {
      const sigla = t.sigla.toUpperCase();
      const outro = siglasAtivas.get(sigla);
      if (outro) {
        throw new Error(`Vocabulário inválido: sigla '${sigla}' ativa em '${descreve(outro)}' e em '${chave}'.`);
      }
      siglasAtivas.set(sigla, t);
    }
  });

  tipos.forEach(t => {
    (t.tiposReferenciaveis ?? []).forEach(urn => {
      const alvos = tipos.filter(a => a.urn === urn);
      if (!alvos.length) {
        throw new Error(`Vocabulário inválido: '${descreve(t)}' referencia o tipo inexistente '${urn}'.`);
      }
      if (!alvos.some(aceitaComoReferencia)) {
        throw new Error(`Vocabulário inválido: '${descreve(t)}' referencia '${urn}', que não aceita substitutivo.`);
      }
    });
  });
};

// A ordem de `autoridades` define a ordem das listas no vocabulário mesclado.
// Sem `siglaAtivaUnica` (visão completa), siglas ativas podem se repetir entre as casas.
export const mesclar = (comum: VocabularioComum, autoridades: VocabularioAutoridade[], { siglaAtivaUnica = true } = {}): Vocabulario => {
  const tiposDocumento = autoridades.flatMap(a => carimbar(a.tiposDocumento, a.autoridade.urn)).map(completarTipo);
  validar(tiposDocumento, siglaAtivaUnica);

  return {
    autoridades: autoridades.map(a => a.autoridade),
    tiposDocumento,
    tiposDocumentoAtivos: tiposDocumento.filter(t => t.sigla && t.ativo),
    preambulosPadrao: autoridades.flatMap(a => carimbar(a.preambulosPadrao, a.autoridade.urn)),
    atalhosUrn: comum.atalhosUrn,
    eventos: comum.eventos,
  };
};
