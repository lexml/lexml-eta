import { DefaultState } from './../../../src/redux/state';
import { expect } from '@open-wc/testing';

import { ADICIONAR_ELEMENTO } from '../../../src/model/lexml/acao/adicionarElementoAction';
import { buildProjetoNormaFromJsonix, getUrn } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { State } from '../../../src/redux/state';
import { MEDIDA_PROVISORIA_SEM_ALTERACAO_COM_AGRUPADOR } from '../../doc/parser/mpv_905_20191111';
import { Artigo, Articulacao } from './../../../src/model/dispositivo/dispositivo';
import { ProjetoNorma } from './../../../src/model/documento';
import { adicionaElemento } from './../../../src/redux/elemento/reducer/adicionaElemento';
import { ComandoEmendaBuilder } from '../../../src/emenda/comando-emenda-builder';

let documento: ProjetoNorma;
let state: State = new DefaultState();
// let eventos: StateEvent[];

describe('Cabeçalho de comando de emenda com inclusão de artigos', () => {
  beforeEach(function () {
    documento = buildProjetoNormaFromJsonix(MEDIDA_PROVISORIA_SEM_ALTERACAO_COM_AGRUPADOR, true);
    documento.articulacao?.renumeraArtigos();
    state.articulacao = documento.articulacao;
  });
  it('Deveria possuir 53 artigos', () => {
    expect(state.articulacao?.artigos.length).to.equal(53);
  });
  describe('Inclusão de um artigo', () => {
    beforeEach(() => {
      const artigo = state.articulacao?.artigos[0];
      state = adicionaElemento(state, {
        type: ADICIONAR_ELEMENTO,
        atual: { tipo: TipoDispositivo.artigo.tipo, uuid: artigo?.uuid },
        novo: { tipo: TipoDispositivo.artigo.tipo },
      });
      // percorreHierarquiaDispositivos(state.articulacao, d => {
      //   console.log(d.rotulo);
      // });
      //eventos = getEventosQuePossuemElementos(state.ui.events);
    });
    it('Deveria possuir 54 artigos', () => {
      expect(state.articulacao?.artigos.length).to.equal(54);
    });
    it('Incluiu artigo 1º-A', () => {
      const artigo = state.articulacao?.artigos[1] as Artigo;
      expect(artigo.rotulo).to.equal('Art. 1º-A');
    });
    it('Cabeçalho comando novo artigo 1º-A', () => {
      // incluiArtigoDepois("art1");
      // ItemComandoEmenda item = new ComandoEmendaBuilder(emenda).getComandos().get(0);
      // Assert.assertEquals("Acrescente-se art. 1º-A ao Projeto, com a seguinte redação:", item.getCabecalho());
      const itemComandoEmenda = new ComandoEmendaBuilder(getUrn(documento), state.articulacao as Articulacao).getComandos()[0];
      expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se art. 1º-A ao Projeto, com a seguinte redação:');
    });
    // describe('Testando os eventos resultantes da ação de inclusão do artigo', () => {
    //   it('Deveria apresentar 1 elemento incluído', () => {
    //     const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
    //     expect(incluido.elementos!.length).equal(1);
    //     expect(incluido.elementos![0].rotulo).equal('Art. 1º-A');
    //     expect(incluido.elementos![0].conteudo?.texto).equal('');
    //   });
    // });
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
