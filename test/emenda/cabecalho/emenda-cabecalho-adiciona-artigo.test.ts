import { expect } from '@open-wc/testing';

import { ComandoEmendaBuilder } from '../../../src/emenda/comando-emenda-builder';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { ProjetoNorma } from '../../../src/model/lexml/documento/projetoNorma';
import { State } from '../../../src/redux/state';
import { TesteCmdEmdUtil } from '../teste-cmd-emd-util';
import { DefaultState } from './../../../src/redux/state';
import { PLC_ARTIGOS_AGRUPADOS } from './../../doc/parser/plc_artigos_agrupados';

let documento: ProjetoNorma;
const state: State = new DefaultState();
// let eventos: StateEvent[];

describe('Cabeçalho de comando de emenda com inclusão de artigos', () => {
  beforeEach(function () {
    documento = buildProjetoNormaFromJsonix(PLC_ARTIGOS_AGRUPADOS, true);
    documento.articulacao?.renumeraArtigos();
    state.articulacao = documento.articulacao;
  });

  it('Deveria possuir 9 artigos', () => {
    expect(state.articulacao?.artigos.length).to.equal(9);
  });

  it('Inclusão de um artigo', () => {
    const artigo = TesteCmdEmdUtil.incluiArtigoDepois(state, 'art1');
    expect(artigo.rotulo).to.equal('Art. 1º-A');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandos()[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se art. 1º-A ao Projeto, com a seguinte redação:');
  });

  it('Inclusão de dois artigos consecutivos', () => {
    const artigo1 = TesteCmdEmdUtil.incluiArtigoDepois(state, 'art1');
    expect(artigo1.rotulo).to.equal('Art. 1º-A');
    const artigo2 = TesteCmdEmdUtil.incluiArtigoDepois(state, 'art1-1');
    expect(artigo2.rotulo).to.equal('Art. 1º-B');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandos()[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescentem-se arts. 1º-A e 1º-B ao Projeto, com a seguinte redação:');
  });

  it('Inclusão de três artigos consecutivos', () => {
    TesteCmdEmdUtil.incluiArtigoDepois(state, 'art1');
    TesteCmdEmdUtil.incluiArtigoDepois(state, 'art1');
    TesteCmdEmdUtil.incluiArtigoDepois(state, 'art1');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandos()[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescentem-se arts. 1º-A a 1º-C ao Projeto, com a seguinte redação:');
  });

  it('Inclusão de quatro artigos com um separado', () => {
    TesteCmdEmdUtil.incluiArtigoDepois(state, 'art1');
    TesteCmdEmdUtil.incluiArtigoDepois(state, 'art1');
    TesteCmdEmdUtil.incluiArtigoDepois(state, 'art1');
    TesteCmdEmdUtil.incluiArtigoDepois(state, 'art5');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandos()[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescentem-se arts. 1º-A a 1º-C e 5º-A ao Projeto, com a seguinte redação:');
  });

  // describe('Supressão de um artigo', () => {
  //   beforeEach(() => {
  //     const artigo = state.articulacao.artigos[0];
  //     state = suprimeElemento(state, {
  //       type: SUPRIMIR_ELEMENTO,
  //       atual: { tipo: TipoDispositivo.artigo.tipo, uuid: artigo.uuid },
  //     });
  //     //eventos = getEventosQuePossuemElementos(state.ui.events);
  //   });
  //   it('Deveria possuir 53 artigos', () => {
  //     expect(state.articulacao.artigos.length).to.equal(53);
  //   });
  //   it('Suprimiu artigo 1º', () => {
  //     const artigo = state.articulacao.artigos[0] as Artigo;
  //     expect(artigo.rotulo).to.equal('Art. 1º');
  //     expect(artigo.situacao.descricaoSituacao).to.equal(DescricaoSituacao.DISPOSITIVO_SUPRIMIDO);
  //   });
  //   describe('Testando os eventos resultantes da ação de supressão do artigo', () => {
  //     it('Deveria apresentar 6 elementos suprimidos', () => {
  //       const suprimido = getEvento(state.ui.events, StateType.ElementoSuprimido);
  //       expect(suprimido.elementos!.length).equal(6);
  //       expect(suprimido.elementos![0].rotulo).equal('Art. 1º');
  //       expect(suprimido.elementos![1].rotulo).equal('Parágrafo único.');
  //       expect(suprimido.elementos![2].rotulo).equal('I –');
  //       expect(suprimido.elementos![3].rotulo).equal('II –');
  //       expect(suprimido.elementos![4].rotulo).equal('III –');
  //       expect(suprimido.elementos![5].rotulo).equal('IV –');
  //     });
  //   });
  // });
});
