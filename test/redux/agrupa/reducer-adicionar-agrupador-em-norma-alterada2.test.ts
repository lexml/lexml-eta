import { getEventosQuePossuemElementos, getEvento } from './../../../src/redux/elemento/evento/eventosUtil';
import { buscaDispositivoById, isDispositivoCabecaAlteracao } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { ADICIONAR_AGRUPADOR_ARTIGO } from '../../../src/model/lexml/acao/adicionarAgrupadorArtigoAction';
import { agrupaElemento } from '../../../src/redux/elemento/reducer/agrupaElemento';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { MPV_885_2019 } from '../../doc/mpv_885_2019';
import { expect } from '@open-wc/testing';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { openArticulacaoAction } from '../../../src/model/lexml/acao/openArticulacaoAction';

import { State, StateEvent, StateType } from '../../../src/redux/state';
import { isAgrupador, isArtigo } from '../../../src/model/dispositivo/tipo';
import { ADICIONAR_ELEMENTOS_FROM_CLIPBOARD } from '../../../src/model/lexml/acao/AdicionarElementosFromClipboardAction';
import { adicionaElementosNaProposicaoFromClipboard } from '../../../src/redux/elemento/reducer/adicionaElementosNaProposicaoFromClipboard';
import { TEXTO_009 } from '../../doc/textos-colar/texto_009';
import { ADICIONAR_ELEMENTO } from '../../../src/model/lexml/acao/adicionarElementoAction';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { adicionaElemento } from '../../../src/redux/elemento/reducer/adicionaElemento';
import { transformaTipoElemento } from '../../../src/redux/elemento/reducer/transformaTipoElemento';
import { transformarArtigoEmParagrafo } from '../../../src/model/lexml/acao/transformarElementoAction';

let state: State;
let eventos: StateEvent[];

describe('Testando a inclusão de agrupadores em alteração de norma', () => {
  beforeEach(function () {
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_885_2019, true);
    state = openArticulacaoAction(projetoNorma.articulacao!);
    state.ui = {} as any;
  });

  describe('Incluindo agrupador Capítulo antes de "art2_cpt_alt1_art60-1"', () => {
    beforeEach(function () {
      const disp = buscaDispositivoById(state.articulacao!, 'art2_cpt_alt1_art60-1')!;
      state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual: createElemento(disp), novo: { tipo: 'Capitulo', posicao: 'antes' } });
    });

    it('Deveria possuir 6 alterações no Art. 2º da MPV', () => {
      const art1 = state.articulacao!.artigos[1];
      expect(art1.alteracoes?.filhos.length).to.equal(6);
    });

    it('Deveria apresentar novo agrupador como cabeça de alteração', () => {
      const disp = state.articulacao!.artigos[1].alteracoes!.filhos[0];
      expect(isAgrupador(disp)).to.equal(true);
      expect(isDispositivoCabecaAlteracao(disp)).to.equal(true);
    });

    describe('Adicionando 2 artigos dentro do Capítulo', () => {
      beforeEach(function () {
        const disp = buscaDispositivoById(state.articulacao!, 'art2_cpt_alt1')!.filhos[0];
        state = adicionaElementosNaProposicaoFromClipboard(state, {
          type: ADICIONAR_ELEMENTOS_FROM_CLIPBOARD,
          atual: createElemento(disp),
          novo: {
            isDispositivoAlteracao: true,
            conteudo: { texto: TEXTO_009 },
          },
          isColarSubstituindo: true,
          posicao: 'depois',
        });
        eventos = getEventosQuePossuemElementos(state.ui!.events);
      });

      it('Deveria possuir artigos dentro do agrupador', () => {
        const cap = buscaDispositivoById(state.articulacao!, 'art2')!.alteracoes!.filhos[0]!;
        expect(isDispositivoCabecaAlteracao(cap)).to.equal(true);
        expect(!isDispositivoCabecaAlteracao(cap.filhos[0])).to.equal(true);
        expect(!isDispositivoCabecaAlteracao(cap.filhos[1])).to.equal(true);
        expect(isArtigo(cap.filhos[0])).to.equal(true);
        expect(isArtigo(cap.filhos[1])).to.equal(true);
      });

      describe('Testando eventos', () => {
        it('Deveria apresentar 2 novos dispositivos', () => {
          const incluidos = getEvento(eventos, StateType.ElementoIncluido);
          expect(incluidos.elementos!.length).to.equal(2);
        });

        it('O primeiro artigo dentro do agrupador não deveria possuir mensagens de validação', () => {
          const incluidos = getEvento(eventos, StateType.ElementoIncluido);
          expect(incluidos.elementos![0].mensagens?.length).to.equal(0);
        });

        it('O segundo artigo dentro do agrupador deveria possuir 1 mensagem de validação (necessidade de linha pontilhada)', () => {
          const incluidos = getEvento(eventos, StateType.ElementoIncluido);
          expect(incluidos.elementos![1].mensagens?.length).to.equal(1);
          expect(incluidos.elementos![1].mensagens![0].descricao).includes('É necessário uma linha pontilhada antes deste dispositivo');
        });
      });
    });

    describe('Adicionando 1 artigo dentro do Capítulo', () => {
      beforeEach(function () {
        const disp = buscaDispositivoById(state.articulacao!, 'art2_cpt_alt1')!.filhos[0];
        state = adicionaElemento(state, {
          type: ADICIONAR_ELEMENTO,
          atual: createElemento(disp),
          novo: { tipo: TipoDispositivo.artigo.tipo },
        });
      });

      it('Deveria possuir artigo dentro do agrupador', () => {
        const cap = buscaDispositivoById(state.articulacao!, 'art2')!.alteracoes!.filhos[0]!;
        expect(isDispositivoCabecaAlteracao(cap)).to.equal(true);
        expect(!isDispositivoCabecaAlteracao(cap.filhos[0])).to.equal(true);
        expect(isArtigo(cap.filhos[0])).to.equal(true);
        expect(cap.filhos.length).to.equal(1);
      });

      describe('Tentando transformar artigo adicionado em parágrafo', () => {
        beforeEach(function () {
          const artigo = buscaDispositivoById(state.articulacao!, 'art2')!.alteracoes!.filhos[0]!.filhos[0];
          const action = transformarArtigoEmParagrafo.execute({ tipo: TipoDispositivo.artigo.tipo, uuid: artigo.uuid! });
          state = transformaTipoElemento(state, action);
          eventos = getEventosQuePossuemElementos(state.ui!.events);
        });

        it('Deveria continuar apresentado artigo dentro do agrupador', () => {
          const cap = buscaDispositivoById(state.articulacao!, 'art2')!.alteracoes!.filhos[0]!;
          expect(isDispositivoCabecaAlteracao(cap)).to.equal(true);
          expect(!isDispositivoCabecaAlteracao(cap.filhos[0])).to.equal(true);
          expect(isArtigo(cap.filhos[0])).to.equal(true);
          expect(cap.filhos.length).to.equal(1);
        });

        describe('Testando eventos', () => {
          it('Deveria apresentar mensagem de erro', () => {
            expect(state.ui?.message).to.be.exist;
            expect(state.ui?.message?.tipo).to.equal('INFO');
            expect(state.ui?.message?.descricao).to.equal('Nessa situação, não é possível transformar o dispositivo');
          });
        });
      });
    });
  });
});
