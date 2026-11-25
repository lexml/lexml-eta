import { expect } from '@open-wc/testing';
import { montaDocumentoNovaProposicao } from '../../../src/model/lexml/documento/modelo/montaDocumentoNovaProposicao';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { buildJsonixFromProjetoNorma } from '../../../src/model/lexml/documento/conversor/buildJsonixFromProjetoNorma';
import { abreArticulacao } from '../../../src/redux/elemento/reducer/abreArticulacao';
import { ABRIR_ARTICULACAO } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { ADICIONAR_ELEMENTO } from '../../../src/model/lexml/acao/adicionarElementoAction';
import { adicionaElemento } from '../../../src/redux/elemento/reducer/adicionaElemento';
import { REMOVER_ELEMENTO } from '../../../src/model/lexml/acao/removerElementoAction';
import { removeElemento } from '../../../src/redux/elemento/reducer/removeElemento';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { State } from '../../../src/redux/state';

const URN = 'urn:lex:br:senado.federal:projeto.lei;pl:2026;1';

// #1104: a proposição iniciada com texto vazio mostrava "Art. 1º" até a primeira renumeração.
const abreDocumentoVazio = (): any => buildProjetoNormaFromJsonix(montaDocumentoNovaProposicao(URN, 'PROJETO DE LEI Nº , DE 2026', 'O CONGRESSO NACIONAL decreta:'));

const rotulos = (state: State): string[] => state.articulacao!.artigos.map(artigo => artigo.rotulo!);

describe('Documento vazio com artigo único (#1104)', () => {
  it('abre com o artigo rotulado "Artigo único."', () => {
    const artigos = abreDocumentoVazio().articulacao.artigos;

    expect(artigos).to.have.length(1);
    expect(artigos[0].rotulo).to.equal('Artigo único.');
    expect(artigos[0].numero).to.equal('1');
    expect(artigos[0].id).to.equal('art1');
  });

  it('grava o artigo com o rótulo "Artigo único." e o id art1', () => {
    const salvo = buildJsonixFromProjetoNorma(abreDocumentoVazio(), URN);
    const estrutura = salvo.value.projetoNorma.norma ?? salvo.value.projetoNorma.projeto;
    const artigo = estrutura.articulacao.lXhier[0].value;

    expect(artigo.rotulo).to.equal('Artigo único.');
    expect(artigo.id).to.equal('art1');
  });

  describe('incluir e excluir um segundo artigo', () => {
    let state: State;

    beforeEach(() => {
      state = abreArticulacao({} as State, { type: ABRIR_ARTICULACAO, articulacao: abreDocumentoVazio().articulacao, classificacao: ClassificacaoDocumento.PROJETO });
      state = adicionaElemento(state, {
        type: ADICIONAR_ELEMENTO,
        atual: createElemento(state.articulacao!.artigos[0]),
        novo: { tipo: TipoDispositivo.artigo.tipo },
        posicao: 'depois',
      });
    });

    it('incluir um artigo depois do único dá "Art. 1º" e "Art. 2º"', () => {
      expect(rotulos(state)).to.deep.equal(['Art. 1º', 'Art. 2º']);
    });

    it('excluir o segundo volta a "Artigo único."', () => {
      const segundo = state.articulacao!.artigos[1];
      state = removeElemento(state, { type: REMOVER_ELEMENTO, atual: { tipo: TipoDispositivo.artigo.tipo, uuid: segundo.uuid! } });

      expect(rotulos(state)).to.deep.equal(['Artigo único.']);
    });
  });
});
