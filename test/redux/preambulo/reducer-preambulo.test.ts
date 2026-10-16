import { expect } from '@open-wc/testing';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { createElemento, createElementoValidado, getDispositivoFromElemento, getElementos } from '../../../src/model/elemento/elementoUtil';
import { ADICIONAR_AGRUPADOR_ARTIGO } from '../../../src/model/lexml/acao/adicionarAgrupadorArtigoAction';
import { ADICIONAR_ELEMENTO } from '../../../src/model/lexml/acao/adicionarElementoAction';
import { ABRIR_ARTICULACAO } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { buscaDispositivoById, getUltimoDispositivoDaParteInicial, hasPreambulo } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { getEvento } from '../../../src/redux/elemento/evento/eventosUtil';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { paginarArticulacao } from '../../../src/redux/elemento/util/paginacaoUtil';
import { StateType } from '../../../src/redux/state';
import { MPV_885_2019 } from '../../doc/mpv_885_2019';

const UNDO = 'UNDO';
const REDO = 'REDO';

const carregar = (documento: any): any => {
  const projetoNorma = buildProjetoNormaFromJsonix(documento);
  return { projetoNorma, state: elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: projetoNorma.articulacao!, classificacao: ClassificacaoDocumento.PROJETO }) };
};

// Lei sem texto padrão e sem preâmbulo: a articulação segue direto depois da ementa.
const documentoSemPreambulo = (): any => {
  const documento = JSON.parse(JSON.stringify(MPV_885_2019));
  documento.value.metadado.identificacao.urn = 'urn:lex:br:federal:lei:2020-01-01;1';
  documento.value.projetoNorma.norma.parteInicial.preambulo.p = [];
  return documento;
};

const tipos = (elementos: { tipo?: string }[]): (string | undefined)[] => elementos.map(e => e.tipo);

describe('Preâmbulo no estado do editor', () => {
  let state: any;
  let projetoNorma: any;

  describe('Documento com preâmbulo', () => {
    beforeEach(() => {
      ({ state, projetoNorma } = carregar(MPV_885_2019));
    });

    it('os elementos listam a ementa, o preâmbulo e então a articulação', () => {
      expect(tipos(getElementos(state.articulacao)).slice(0, 4)).to.deep.equal(['Articulacao', 'Ementa', 'Preambulo', 'Artigo']);
    });

    it('o elemento do preâmbulo é bloqueado, sem ações e sem mensagens de validação', () => {
      const preambulo = createElementoValidado(projetoNorma.preambulo);
      expect(preambulo.bloqueado).to.be.true;
      expect(preambulo.acoesPossiveis).to.deep.equal([]);
      expect(preambulo.lexmlId).to.equal('preambulo');
      expect(preambulo.mensagens).to.deep.equal([]);
    });

    it('o preâmbulo é localizado pelo id e pelo tipo do elemento', () => {
      expect(buscaDispositivoById(state.articulacao, 'preambulo')).to.equal(projetoNorma.preambulo);
      expect(getDispositivoFromElemento(state.articulacao, { tipo: 'Preambulo' })).to.equal(projetoNorma.preambulo);
    });

    it('a última linha da parte inicial é o preâmbulo', () => {
      expect(hasPreambulo(state.articulacao)).to.be.true;
      expect(getUltimoDispositivoDaParteInicial(state.articulacao)).to.equal(projetoNorma.preambulo);
    });

    it('a primeira página começa pela ementa e pelo preâmbulo', () => {
      expect(tipos(paginarArticulacao(state.articulacao)[0]).slice(0, 2)).to.deep.equal(['Ementa', 'Preambulo']);
    });

    describe('Inclusão a partir da ementa', () => {
      it('o artigo é o primeiro da articulação e a referência do evento é o preâmbulo', () => {
        const ementa = createElemento(buscaDispositivoById(state.articulacao, 'ementa')!);
        state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: ementa, novo: { tipo: 'Artigo' }, posicao: 'depois' });

        const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
        expect(state.articulacao.artigos[0].id).to.equal('art1');
        expect(incluido.referencia?.tipo).to.equal('Preambulo');
        expect(incluido.elementos![0].elementoAnteriorNaSequenciaDeLeitura?.tipo).to.equal('Preambulo');
      });

      it('o agrupador é o primeiro da articulação e a referência do evento é o preâmbulo', () => {
        const ementa = createElemento(buscaDispositivoById(state.articulacao, 'ementa')!);
        state = elementoReducer(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual: ementa, novo: { tipo: 'Capitulo', posicao: 'depois' } });

        expect(state.articulacao.filhos[0].tipo).to.equal('Capitulo');
        expect(getEvento(state.ui.events, StateType.ElementoIncluido).referencia?.tipo).to.equal('Preambulo');
      });

      it('desfazer e refazer mantêm o preâmbulo como referência', () => {
        const ementa = createElemento(buscaDispositivoById(state.articulacao, 'ementa')!);
        state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: ementa, novo: { tipo: 'Artigo' }, posicao: 'depois' });

        state = elementoReducer(state, { type: UNDO });
        expect(state.articulacao.artigos[0].id).to.equal('art1');
        expect(state.articulacao.projetoNorma.preambulo).to.equal(projetoNorma.preambulo);

        state = elementoReducer(state, { type: REDO });
        expect(getEvento(state.ui.events, StateType.ElementoIncluido).referencia?.tipo).to.equal('Preambulo');
      });
    });
  });

  describe('Documento sem preâmbulo', () => {
    beforeEach(() => {
      ({ state, projetoNorma } = carregar(documentoSemPreambulo()));
    });

    it('não há dispositivo de preâmbulo nem linha na lista de elementos', () => {
      expect(hasPreambulo(state.articulacao)).to.be.false;
      expect(tipos(getElementos(state.articulacao)).slice(0, 3)).to.deep.equal(['Articulacao', 'Ementa', 'Artigo']);
    });

    it('a última linha da parte inicial é a ementa', () => {
      expect(getUltimoDispositivoDaParteInicial(state.articulacao)).to.equal(projetoNorma.ementa);
    });

    it('a referência do artigo incluído a partir da ementa continua sendo a ementa', () => {
      const ementa = createElemento(buscaDispositivoById(state.articulacao, 'ementa')!);
      state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: ementa, novo: { tipo: 'Artigo' }, posicao: 'depois' });

      expect(getEvento(state.ui.events, StateType.ElementoIncluido).referencia?.tipo).to.equal('Ementa');
    });
  });

  describe('Exibição de preâmbulo com mais de um parágrafo', () => {
    it('o elemento mostra os parágrafos em uma linha e o dispositivo mantém os parágrafos', () => {
      const documento = JSON.parse(JSON.stringify(MPV_885_2019));
      documento.value.projetoNorma.norma.parteInicial.preambulo.p = ['Primeiro:', 'Segundo.'].map(texto => ({ TYPE_NAME: 'br_gov_lexml__1.GenInline', content: [texto] }));
      ({ projetoNorma } = carregar(documento));

      expect(projetoNorma.preambulo.texto).to.equal('<p>Primeiro:</p><p>Segundo.</p>');
      expect(createElemento(projetoNorma.preambulo).conteudo?.texto).to.equal('Primeiro: Segundo.');
    });
  });
});
