import { expect } from '@open-wc/testing';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { ADICIONAR_ELEMENTO } from '../../../src/model/lexml/acao/adicionarElementoAction';
import { ABRIR_ARTICULACAO } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { buscaDispositivoById } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { getEvento } from '../../../src/redux/elemento/evento/eventosUtil';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { StateType } from '../../../src/redux/state';
import { ArticulacaoParser } from '../../../src/model/lexml/parser/articulacaoParser';
import { adicionaElemento } from '../../../src/redux/elemento/reducer/adicionaElemento';
import { EXEMPLO_PARAGRAFOS } from '../../doc/exemplo-paragrafos';
import { MPV_885_2019 } from '../../doc/mpv_885_2019';

const UNDO = 'UNDO';
const REDO = 'REDO';

let state: any;

const incluir = (id: string, tipo: string, posicao: string, manterFocoNoAtual?: boolean): string => {
  const dispositivo = buscaDispositivoById(state.articulacao, id)!;
  const uuid = dispositivo.uuid!;
  state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: createElemento(dispositivo), novo: { tipo, conteudo: { texto: '' } }, posicao, manterFocoNoAtual });
  return uuid as any;
};

const marcados = (): any[] => getEvento(state.ui.events, StateType.ElementoMarcado).elementos!;

describe('Cursor depois do Enter no início do texto (ElementoMarcado)', () => {
  beforeEach(function () {
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_885_2019);
    state = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: projetoNorma.articulacao!, classificacao: ClassificacaoDocumento.PROJETO });
  });

  describe('Artigo', () => {
    it('com manterFocoNoAtual, marca primeiro o artigo que manteve o texto', () => {
      const uuidAtual = incluir('art2', 'Artigo', 'antes', true);
      expect(marcados()[0].uuid).to.equal(uuidAtual);
      expect(marcados()[0].conteudo?.texto).to.not.be.empty;
      expect(marcados()[0].rotulo).to.equal('Art. 3º');
      expect(marcados()[1].conteudo?.texto).to.equal('');
    });

    it('sem manterFocoNoAtual (menu), marca primeiro o artigo novo', () => {
      const uuidAtual = incluir('art2', 'Artigo', 'antes');
      expect(marcados()[0].uuid).to.not.equal(uuidAtual);
      expect(marcados()[1].uuid).to.equal(uuidAtual);
    });

    it('com manterFocoNoAtual fora da posição "antes", marca primeiro o artigo novo', () => {
      const uuidAtual = incluir('art2', 'Artigo', 'depois', true);
      expect(marcados()[0].uuid).to.not.equal(uuidAtual);
      expect(marcados()[1].uuid).to.equal(uuidAtual);
    });
  });

  describe('Parágrafo', () => {
    let paragrafo: any;

    beforeEach(function () {
      const articulacao = ArticulacaoParser.load(EXEMPLO_PARAGRAFOS);
      articulacao.renumeraArtigos();
      state = { articulacao };
      paragrafo = articulacao.artigos[1].filhos.find((f: any) => f.tipo === 'Paragrafo');
    });

    const incluirParagrafo = (manterFocoNoAtual?: boolean): void => {
      state = adicionaElemento(state, {
        type: ADICIONAR_ELEMENTO,
        atual: createElemento(paragrafo),
        novo: { tipo: 'Paragrafo', conteudo: { texto: '' } },
        posicao: 'antes',
        manterFocoNoAtual,
      });
    };

    it('com manterFocoNoAtual, marca primeiro o parágrafo que manteve o texto', () => {
      incluirParagrafo(true);
      expect(marcados()[0].uuid).to.equal(paragrafo.uuid);
      expect(marcados()[0].rotulo).to.equal('§ 2º');
    });

    it('sem manterFocoNoAtual (menu), marca primeiro o parágrafo novo', () => {
      incluirParagrafo();
      expect(marcados()[0].uuid).to.not.equal(paragrafo.uuid);
    });
  });

  describe('Desfazer e refazer', () => {
    let uuidAtual: string;

    beforeEach(function () {
      uuidAtual = incluir('art2', 'Artigo', 'antes', true);
      state = elementoReducer(state, { type: UNDO });
    });

    it('depois de desfazer, marca o artigo original', () => {
      expect(marcados().map(e => e.uuid)).to.deep.equal([uuidAtual]);
    });

    it('depois de refazer, marca e seleciona o artigo que manteve o texto', () => {
      state = elementoReducer(state, { type: REDO });
      expect(marcados()[0].uuid).to.equal(uuidAtual);
      expect(getEvento(state.ui.events, StateType.ElementoSelecionado).elementos![0].uuid).to.equal(uuidAtual);
    });
  });
});
