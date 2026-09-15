import { DOCUMENTO_PADRAO } from '../../src/model/lexml/documento/modelo/documentoPadrao';

export const novoDocumentoArticulado = (): any => {
  const documento = JSON.parse(JSON.stringify(DOCUMENTO_PADRAO));
  documento.value.metadado.identificacao.urn = 'urn:lex:br:senado.federal:projeto.lei;pls:9999;999999';
  const inicial = documento.value.projetoNorma.norma.parteInicial;
  const inline = (tipo: string, texto: string): any => ({
    name: { namespaceURI: 'http://www.lexml.gov.br/1.0', localPart: tipo },
    value: { TYPE_NAME: 'br_gov_lexml__1.GenInline', content: [texto] },
  });
  inicial.epigrafe.content = ['PROJETO ', inline('b', 'DE LEI')];
  inicial.ementa.content = [inline('b', 'Dispõe'), ' ', inline('i', 'sobre'), ' educação e saúde.'];
  inicial.preambulo.p = [
    { TYPE_NAME: 'br_gov_lexml__1.GenInline', content: ['O Congresso Nacional ', inline('b', 'decreta'), ':'] },
    { TYPE_NAME: 'br_gov_lexml__1.GenInline', content: ['Segundo parágrafo ', inline('i', 'do preâmbulo'), '.'] },
  ];
  const artigo = documento.value.projetoNorma.norma.articulacao.lXhier[0];
  artigo.value.lXcontainersOmissis[0].value.p[0].content = ['Esta lei dispõe sobre educação e saúde.'];
  artigo.value.lXcontainersOmissis.push({
    name: { namespaceURI: 'http://www.lexml.gov.br/1.0', localPart: 'Paragrafo' },
    value: {
      TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
      id: 'art1_par1u',
      rotulo: 'Parágrafo único.',
      p: [{ TYPE_NAME: 'br_gov_lexml__1.GenInline', content: ['Aplica-se em todo o território nacional.'] }],
    },
  });
  return documento;
};

export const TEXTO_LITERAL = 'Texto "entre aspas": A & B, 1 < 2 > 0, <b>literal</b> e &amp; escrito.';

export const novoDocumentoComTextoLiteral = (): any => {
  const documento = novoDocumentoArticulado();
  const norma = documento.value.projetoNorma.norma;
  norma.parteInicial.epigrafe.content = [TEXTO_LITERAL];
  norma.parteInicial.ementa.content = [TEXTO_LITERAL];
  norma.parteInicial.preambulo.p[0].content = [TEXTO_LITERAL];
  norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.p[0].content = [TEXTO_LITERAL];
  return documento;
};
