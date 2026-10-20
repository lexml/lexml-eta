import { ComAutoridade, Vocabulario, VocabularioAutoridade, VocabularioComum } from './tipos';

const carimbar = <T>(itens: T[] | undefined, urnAutoridade: string): ComAutoridade<T>[] => (itens ?? []).map(i => ({ ...i, urnAutoridade }));

// A ordem de `autoridades` define quem vence quando duas autoridades declaram o mesmo item.
export const mesclar = (comum: VocabularioComum, autoridades: VocabularioAutoridade[]): Vocabulario => ({
  autoridades: autoridades.map(a => a.autoridade),
  tiposDocumento: autoridades.flatMap(a => carimbar(a.tiposDocumento, a.autoridade.urn)),
  siglas: autoridades.flatMap(a => carimbar(a.siglas, a.autoridade.urn)),
  fakeUrns: autoridades.flatMap(a => carimbar(a.fakeUrns, a.autoridade.urn)),
  preambulosPadrao: autoridades.flatMap(a => carimbar(a.preambulosPadrao, a.autoridade.urn)),
  atalhosUrn: comum.atalhosUrn,
  eventos: comum.eventos,
});
