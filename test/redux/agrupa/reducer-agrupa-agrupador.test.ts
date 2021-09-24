import { expect } from '@open-wc/testing';
import { TipoDispositivo } from '../../../src/model/dispositivo/tipo';
import { ArticulacaoParser } from '../../../src/model/lexml/service/articulacao-parser';
import { AGRUPAR_ELEMENTO } from '../../../src/redux/elemento-actions';
import { agruparElemento } from '../../../src/redux/elemento-reducer';
import { getEvento, getEventosQuePossuemElementos } from '../../../src/redux/eventos';
import { StateEvent, StateType } from '../../../src/redux/state';
import { EXEMPLO_AGRUPADORES_ARTIGOS_SEM_AGRUPADORES } from '../../doc/exemplo-agrupadores-artigos-sem-agrupadores';

let state: any;
let eventos: StateEvent[];

describe('Testando a inclusão de agrupadores de agrupadores', () => {
  beforeEach(function () {
    const articulacao = ArticulacaoParser.load(EXEMPLO_AGRUPADORES_ARTIGOS_SEM_AGRUPADORES);
    articulacao.renumeraArtigos();
    state = {
      articulacao,
    };
  });
  describe('Testando a inclusão quando não há agrupadores e se trata do segundo artigo', () => {
    beforeEach(function () {
      const artigo = state.articulacao.artigos[1];
      state = agruparElemento(state, {
        type: AGRUPAR_ELEMENTO,
        atual: { tipo: TipoDispositivo.artigo.tipo, uuid: artigo.uuid },
        novo: {
          tipo: TipoDispositivo.capitulo.tipo,
        },
      });
      const capitulo = state.articulacao.filhos[1];
      state = agruparElemento(state, {
        type: AGRUPAR_ELEMENTO,
        atual: { tipo: TipoDispositivo.capitulo.tipo, uuid: capitulo.uuid },
        novo: {
          tipo: TipoDispositivo.titulo.tipo,
        },
      });
      eventos = getEventosQuePossuemElementos(state.ui.events);
    });
    it('Deveria apresentar apenas o artigo 1 e o novo titulo como filhos da articulação', () => {
      expect(state.articulacao.filhos.length).equals(2);
    });
    it('Deveria apresentar o o capítulo sob o novo título', () => {
      expect(state.articulacao.filhos[1].filhos.length).equals(1);
      expect(state.articulacao.filhos[1].rotulo).equal('TÍTULO I');
    });
    describe('Testando eventos', () => {
      it('Deveria apresentar 2 eventos', () => {
        expect(eventos.length).to.equal(2);
      });
      it('Deveria apresentar o capitulo e os 4 artigos e seus filhos como incluídos', () => {
        expect(eventos[0].elementos!.length).equal(7);
        expect(eventos[0].elementos![0].rotulo).equal('TÍTULO I');
        expect(eventos[0].elementos![1].rotulo).equal('CAPÍTULO I');
        expect(eventos[0].elementos![2].rotulo).equal('Art. 2º');
        expect(eventos[0].elementos![3].rotulo).equal('Art. 3º');
        expect(eventos[0].elementos![4].rotulo).equal('Art. 4º');
        expect(eventos[0].elementos![5].rotulo).equal('Art. 5º');
        expect(eventos[0].elementos![6].rotulo).equal('Parágrafo único.');
      });
      it('Deveria apresentar o capitulo incluído após o artigo 1', () => {
        expect(eventos[0].elementos![0].rotulo).equal('TÍTULO I');
        expect(eventos[0].referencia!.rotulo).equal('Art. 1º');
      });
      it('Deveria apresentar os 4 artigos e seus filhos como removidos', () => {
        const removidos = getEvento(state.ui.events, StateType.ElementoRemovido);
        expect(removidos.elementos!.length).equal(6);
        expect(removidos.elementos![0].rotulo).equal('CAPÍTULO I');
        expect(removidos.elementos![1].rotulo).equal('Art. 2º');
        expect(removidos.elementos![2].rotulo).equal('Art. 3º');
        expect(removidos.elementos![3].rotulo).equal('Art. 4º');
        expect(removidos.elementos![4].rotulo).equal('Art. 5º');
        expect(removidos.elementos![5].rotulo).equal('Parágrafo único.');
      });
    });
  });
});
