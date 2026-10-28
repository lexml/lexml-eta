import { DOCUMENTO_PADRAO } from './documentoPadrao';

const TYPE_GEN_INLINE = 'br_gov_lexml__1.GenInline';

const paragrafosDoPreambulo = (preambulo: string): string[] => {
  const paragrafos = [...preambulo.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)].map(m => m[1]);
  return paragrafos.length ? paragrafos : [preambulo];
};

/** Monta o Jsonix de uma nova proposição; do modelo (se houver) só entram a articulação e a ementa. */
export const montaDocumentoNovaProposicao = (urn: string, epigrafe: string, preambulo: string, modelo?: any): any => {
  const documento = JSON.parse(JSON.stringify(modelo ?? DOCUMENTO_PADRAO));
  const valor = documento.value;
  valor.metadado.identificacao.urn = urn;
  delete valor.metadadoProprietario;

  const estrutura = valor.projetoNorma.norma ?? valor.projetoNorma.projeto;
  const ementa = estrutura.parteInicial?.ementa;
  estrutura.parteInicial = {
    TYPE_NAME: 'br_gov_lexml__1.ParteInicial',
    epigrafe: { TYPE_NAME: TYPE_GEN_INLINE, id: 'epigrafe', content: [epigrafe] },
    ...(ementa && { ementa }),
    preambulo: {
      TYPE_NAME: 'br_gov_lexml__1.TextoType',
      id: 'preambulo',
      p: paragrafosDoPreambulo(preambulo).map(texto => ({ TYPE_NAME: TYPE_GEN_INLINE, content: [texto] })),
    },
  };
  delete estrutura.parteFinal;
  return documento;
};
