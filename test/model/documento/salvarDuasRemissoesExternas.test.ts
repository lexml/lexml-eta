import { expect } from '@open-wc/testing';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { criarDocumentoArticulado } from '../../../src/model/lexml/documento/documentoArticulado';
import { novoDocumentoArticulado } from '../../doc/documentoArticulado';

const U1 = 'urn:lex:br:federal:lei:2021-04-01;14133';
const U2 = 'urn:lex:br:federal:lei:1993-06-21;8666';
const link = (urn: string, texto: string): string => `<a class="lexml-remissao-externa" href="#" data-ref-id="${texto}" data-urn="${urn}">${texto}</a>`;

// Registro de remissões externas é indexado pelo uuid do artigo; a <p> é montada a partir do caput.
const hrefsSalvos = (texto: string): string[] => {
  const modelo = buildProjetoNormaFromJsonix(novoDocumentoArticulado());
  const artigo: any = modelo.articulacao!.filhos[0];
  artigo.texto = texto;
  const registro: any = {
    a: { refId: 'a', targetUrn: U1, targetNomeNorma: '', textoRef: 'Lei 14.133', sourceUuid: artigo.uuid },
    b: { refId: 'b', targetUrn: U2, targetNomeNorma: '', textoRef: 'Lei 8.666', sourceUuid: artigo.uuid },
  };
  const doc = criarDocumentoArticulado(modelo, modelo.urn!, undefined, registro);
  const conteudo: any[] = doc.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.p[0].content;
  return conteudo.filter(c => typeof c !== 'string').map(c => c.value.href);
};

describe('Salvar artigo com mais de uma remissão externa', () => {
  it('grava as duas quando o texto do estado não tem os links (criadas ao vivo)', () => {
    expect(hrefsSalvos('A Lei 14.133 e a Lei 8.666 passam a vigorar:')).to.deep.equal([U1, U2]);
  });

  it('grava as duas quando o texto já tem os dois links (aberto de arquivo)', () => {
    expect(hrefsSalvos(`A ${link(U1, 'Lei 14.133')} e a ${link(U2, 'Lei 8.666')} passam a vigorar:`)).to.deep.equal([U1, U2]);
  });

  it('grava a que falta quando só uma está no texto', () => {
    expect(hrefsSalvos(`A ${link(U1, 'Lei 14.133')} e a Lei 8.666 passam a vigorar:`)).to.deep.equal([U1, U2]);
  });
});
