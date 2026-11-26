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
import { State, StateType } from '../../../src/redux/state';
import { EXEMPLO_AGRUPADORES_ARTIGOS_SEM_AGRUPADORES } from '../../doc/exemplo-agrupadores-artigos-sem-agrupadores';
import { MPV_1089_2021 } from '../../doc/mpv_1089_2021';

// #1078: agrupador criado "depois" a partir de artigo, com a posição e o grupo de aspas que o modal envia.

const artigo = (n: number, paragrafos = 0): any => ({
  '@id': `art${n}`,
  Rotulo: `Art. ${n}º`,
  Caput: { '@id': `art${n}_cpt`, p: `Texto do artigo ${n}.` },
  ...(paragrafos ? { Paragrafo: Array.from({ length: paragrafos }, (_, i) => ({ '@id': `art${n}_par${i + 1}`, Rotulo: `§ ${i + 1}º`, p: `Texto do parágrafo ${i + 1}.` })) } : {}),
});

const UM_CAPITULO = {
  Articulacao: { Capitulo: [{ '@id': 'cap1', Rotulo: 'CAPÍTULO I', NomeAgrupador: 'DISPOSIÇÕES GERAIS', Artigo: [artigo(1), artigo(2, 2), artigo(3)] }] },
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
  state = { articulacao } as any;
};

const agrupaDepois = (atual: Dispositivo, tipo: string, manterNoMesmoGrupoDeAspas = true): void => {
  state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual: createElemento(atual), novo: { tipo, posicao: 'depois', manterNoMesmoGrupoDeAspas } });
};

const artigoPorId = (id: string): Dispositivo => state.articulacao!.artigos.find(a => a.id === id)!;
const ids = (d: Dispositivo): string[] => d.filhos.map(f => f.id!);

describe('Agrupador depois de artigo (#1078)', () => {
  describe('Capítulo depois de artigo do meio, com parágrafos', () => {
    beforeEach(() => {
      carrega(UM_CAPITULO);
      agrupaDepois(artigoPorId('art2'), 'Capitulo');
    });

    it('Deveria deixar o art. 2º no Capítulo I e levar o art. 3º para o novo Capítulo II', () => {
      const [cap1, cap2] = state.articulacao!.filhos;
      expect(state.articulacao!.filhos.length).to.equal(2);
      expect(ids(cap1)).to.deep.equal(['art1', 'art2']);
      expect(cap2.tipo).to.equal('Capitulo');
      expect(cap2.rotulo).to.equal('CAPÍTULO II');
      expect(ids(cap2)).to.deep.equal(['art3']);
    });

    it('Deveria manter os parágrafos no art. 2º e pôr o capítulo depois do último deles', () => {
      const art2 = artigoPorId('art2');
      expect(art2.filhos.map(f => f.tipo)).to.deep.equal(['Paragrafo', 'Paragrafo']);
      const incluido = state.ui!.events.find(ev => ev.stateType === StateType.ElementoIncluido)!;
      expect(incluido.referencia!.uuid).to.equal(art2.filhos[1].uuid);
    });
  });

  describe('Capítulo depois do último artigo', () => {
    beforeEach(() => {
      carrega(UM_CAPITULO);
      agrupaDepois(artigoPorId('art3'), 'Capitulo');
    });

    it('Deveria criar o Capítulo II vazio no fim, com os três artigos no Capítulo I', () => {
      const [cap1, cap2] = state.articulacao!.filhos;
      expect(state.articulacao!.filhos.length).to.equal(2);
      expect(ids(cap1)).to.deep.equal(['art1', 'art2', 'art3']);
      expect(cap2.rotulo).to.equal('CAPÍTULO II');
      expect(cap2.filhos.length).to.equal(0);
    });
  });

  describe('Seção depois do último artigo de um capítulo seguido de outro', () => {
    beforeEach(() => {
      carrega(DOIS_CAPITULOS);
      agrupaDepois(artigoPorId('art2'), 'Secao');
    });

    it('Deveria criar a seção vazia no fim do Capítulo I, antes do Capítulo II', () => {
      const [cap1, cap2] = state.articulacao!.filhos;
      expect(state.articulacao!.filhos.length).to.equal(2);
      expect(cap1.filhos.map(f => f.tipo)).to.deep.equal(['Artigo', 'Artigo', 'Secao']);
      expect(cap1.filhos[2].filhos.length).to.equal(0);
      expect(ids(cap2)).to.deep.equal(['art3']);
    });
  });

  describe('Documento sem agrupadores', () => {
    beforeEach(() => {
      carrega(EXEMPLO_AGRUPADORES_ARTIGOS_SEM_AGRUPADORES);
      agrupaDepois(artigoPorId('art1'), 'Capitulo');
    });

    it('Deveria deixar o art. 1º fora de agrupador e pôr os demais no novo capítulo', () => {
      const [art1, cap] = state.articulacao!.filhos;
      expect(state.articulacao!.filhos.length).to.equal(2);
      expect(art1.id).to.equal('art1');
      expect(cap.tipo).to.equal('Capitulo');
      expect(ids(cap)).to.deep.equal(['art2', 'art3', 'art4', 'art5']);
    });
  });

  describe('Bloco de alteração (MPV 1.089/2021)', () => {
    beforeEach(() => {
      const projetoNorma = buildProjetoNormaFromJsonix(MPV_1089_2021);
      state = openArticulacaoAction(projetoNorma.articulacao!);
      state.ui = {} as any;
    });

    it('Deveria criar o capítulo em grupo de aspas próprio depois de artigo que abre aspas', () => {
      const alteracoes = state.articulacao!.artigos[0].alteracoes!;
      const artigoCabeca = alteracoes.filhos[1];
      const proximo = alteracoes.filhos[2];
      expect(createElemento(artigoCabeca).abreAspas).to.equal(true);

      // O modal envia "manter" desmarcado a partir de artigo que abre aspas.
      agrupaDepois(artigoCabeca, 'Capitulo', false);

      expect(alteracoes.filhos.length).to.equal(4);
      expect(alteracoes.filhos[1]).to.equal(artigoCabeca);
      expect(isAgrupador(alteracoes.filhos[2])).to.equal(true);
      expect(isDispositivoCabecaAlteracao(alteracoes.filhos[2])).to.equal(true);
      expect(alteracoes.filhos[3]).to.equal(proximo);
    });

    it('Deveria criar a seção no mesmo grupo de aspas depois de artigo dentro de capítulo do bloco', () => {
      const alteracoes = state.articulacao!.artigos[1].alteracoes!;
      const totalAntes = alteracoes.filhos.length;
      const cap3 = alteracoes.filhos[24];
      const secao4 = cap3.filhos[0];
      const art192 = secao4.filhos[0];
      expect(createElemento(art192).abreAspas).to.equal(false);

      // O modal envia "manter" marcado a partir de artigo que não abre aspas.
      agrupaDepois(art192, 'Secao', true);

      expect(alteracoes.filhos.length).to.equal(totalAntes);
      expect(isDispositivoCabecaAlteracao(cap3)).to.equal(true);
      expect(cap3.filhos.length).to.equal(2);
      expect(cap3.filhos[0]).to.equal(secao4);
      expect(secao4.filhos).to.deep.equal([art192]);
      expect(cap3.filhos[1].tipo).to.equal('Secao');
      expect(cap3.filhos[1].pai).to.equal(cap3);
      expect(cap3.filhos[1].filhos.length).to.equal(0);
    });
  });
});
