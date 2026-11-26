import { expect } from '@open-wc/testing';
import { Dispositivo } from '../../../src/model/dispositivo/dispositivo';
import { isAgrupador } from '../../../src/model/dispositivo/tipo';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { ADICIONAR_AGRUPADOR_ARTIGO } from '../../../src/model/lexml/acao/adicionarAgrupadorArtigoAction';
import { openArticulacaoAction } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { isDispositivoCabecaAlteracao } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { ArticulacaoParser } from '../../../src/model/lexml/parser/articulacaoParser';
import { agrupaElemento } from '../../../src/redux/elemento/reducer/agrupaElemento';
import { redo } from '../../../src/redux/elemento/reducer/redo';
import { removeElemento } from '../../../src/redux/elemento/reducer/removeElemento';
import { undo } from '../../../src/redux/elemento/reducer/undo';
import { State } from '../../../src/redux/state';
import { MPV_1234_2024 } from '../../doc/mpv_1234_2024';

// #1078: agrupador sem dispositivo depois dele no pai (ou no documento) volta ao mesmo lugar, sem levar ninguém para dentro.

const artigo = (n: number): any => ({ '@id': `art${n}`, Rotulo: `Art. ${n}º`, Caput: { '@id': `art${n}_cpt`, p: `Texto do artigo ${n}.` } });

const UM_CAPITULO = {
  Articulacao: { Capitulo: [{ '@id': 'cap1', Rotulo: 'CAPÍTULO I', NomeAgrupador: 'DISPOSIÇÕES GERAIS', Artigo: [artigo(1), artigo(2), artigo(3)] }] },
};

const DOIS_CAPITULOS = {
  Articulacao: {
    Capitulo: [
      { '@id': 'cap1', Rotulo: 'CAPÍTULO I', NomeAgrupador: 'DISPOSIÇÕES GERAIS', Artigo: [artigo(1), artigo(2)] },
      { '@id': 'cap2', Rotulo: 'CAPÍTULO II', NomeAgrupador: 'DISPOSIÇÕES FINAIS', Artigo: [artigo(3)] },
    ],
  },
};

let state: State;

const carrega = (documento: any): void => {
  const articulacao = ArticulacaoParser.load(documento);
  articulacao.renumeraArtigos();
  state = { articulacao, ui: {} } as any;
};

const agrupaDepois = (atual: Dispositivo, tipo: string, manterNoMesmoGrupoDeAspas = true): void => {
  state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual: createElemento(atual), novo: { tipo, posicao: 'depois', manterNoMesmoGrupoDeAspas } });
};

const remove = (dispositivo: Dispositivo): void => {
  state = removeElemento(state, { atual: createElemento(dispositivo) });
};

const artigoPorId = (id: string): Dispositivo => state.articulacao!.artigos.find(a => a.id === id)!;
const ids = (d: Dispositivo): string[] => d.filhos.map(f => f.id!);

describe('Desfazer e refazer de agrupador sem dispositivo depois dele (#1078)', () => {
  describe('Capítulo vazio no fim do documento', () => {
    let uuidCapitulo: number;

    beforeEach(() => {
      carrega(UM_CAPITULO);
      agrupaDepois(artigoPorId('art3'), 'Capitulo');
      uuidCapitulo = state.articulacao!.filhos[1].uuid!;
    });

    it('Deveria refazer a inclusão no fim do documento, sem erro', () => {
      state = undo(state);
      expect(state.articulacao!.filhos.length).to.equal(1);

      expect(() => (state = redo(state))).to.not.throw();

      const [cap1, cap2] = state.articulacao!.filhos;
      expect(state.articulacao!.filhos.length).to.equal(2);
      expect(ids(cap1)).to.deep.equal(['art1', 'art2', 'art3']);
      expect(cap2.uuid).to.equal(uuidCapitulo);
      expect(cap2.rotulo).to.equal('CAPÍTULO II');
      expect(cap2.filhos.length).to.equal(0);
    });

    it('Deveria desfazer a remoção devolvendo o capítulo vazio ao fim, com o último artigo no Capítulo I', () => {
      remove(state.articulacao!.filhos[1]);
      expect(state.articulacao!.filhos.length).to.equal(1);

      state = undo(state);

      const [cap1, cap2] = state.articulacao!.filhos;
      expect(state.articulacao!.filhos.length).to.equal(2);
      expect(ids(cap1)).to.deep.equal(['art1', 'art2', 'art3']);
      expect(cap2.uuid).to.equal(uuidCapitulo);
      expect(cap2.rotulo).to.equal('CAPÍTULO II');
      expect(cap2.filhos.length).to.equal(0);
    });
  });

  describe('Seção vazia no fim do Capítulo I, seguido do Capítulo II', () => {
    let uuidSecao: number;

    const confereSecaoVaziaNoFimDoCapitulo1 = (): void => {
      const [cap1, cap2] = state.articulacao!.filhos;
      expect(state.articulacao!.filhos.length).to.equal(2);
      expect(cap1.filhos.map(f => f.tipo)).to.deep.equal(['Artigo', 'Artigo', 'Secao']);
      expect(ids(cap1).slice(0, 2)).to.deep.equal(['art1', 'art2']);
      expect(cap1.filhos[2].uuid).to.equal(uuidSecao);
      expect(cap1.filhos[2].filhos.length).to.equal(0);
      expect(ids(cap2)).to.deep.equal(['art3']);
    };

    beforeEach(() => {
      carrega(DOIS_CAPITULOS);
      agrupaDepois(artigoPorId('art2'), 'Secao');
      uuidSecao = state.articulacao!.filhos[0].filhos[2].uuid!;
    });

    it('Deveria desfazer a remoção devolvendo a seção vazia ao fim do Capítulo I', () => {
      remove(state.articulacao!.filhos[0].filhos[2]);
      expect(state.articulacao!.filhos[0].filhos.map(f => f.tipo)).to.deep.equal(['Artigo', 'Artigo']);

      state = undo(state);

      confereSecaoVaziaNoFimDoCapitulo1();
    });

    it('Deveria refazer a inclusão no fim do Capítulo I (com dispositivo seguinte no documento)', () => {
      state = undo(state);
      expect(state.articulacao!.filhos[0].filhos.map(f => f.tipo)).to.deep.equal(['Artigo', 'Artigo']);

      state = redo(state);

      confereSecaoVaziaNoFimDoCapitulo1();
    });
  });

  describe('Agrupador em grupo de aspas próprio depois do último artigo de alteração do documento (MPV 1.234/2024)', () => {
    beforeEach(() => {
      const projetoNorma = buildProjetoNormaFromJsonix(MPV_1234_2024);
      state = openArticulacaoAction(projetoNorma.articulacao!);
      state.ui = {} as any;
      // Sem o art. 2º, o bloco de alteração do art. 1º fica no fim do documento.
      remove(artigoPorId('art2'));
    });

    it('Deveria refazer a inclusão da cabeça de alteração nova no fim do bloco, sem erro', () => {
      const alteracoes = state.articulacao!.artigos[0].alteracoes!;
      const artigoCabeca = alteracoes.filhos[0];
      agrupaDepois(artigoCabeca, 'Capitulo', false);
      const uuidCapitulo = alteracoes.filhos[1].uuid;

      state = undo(state);
      expect(alteracoes.filhos.length).to.equal(1);

      expect(() => (state = redo(state))).to.not.throw();

      expect(alteracoes.filhos.length).to.equal(2);
      expect(alteracoes.filhos[0]).to.equal(artigoCabeca);
      expect(isAgrupador(alteracoes.filhos[1])).to.equal(true);
      expect(isDispositivoCabecaAlteracao(alteracoes.filhos[1])).to.equal(true);
      expect(alteracoes.filhos[1].uuid).to.equal(uuidCapitulo);
    });
  });
});
