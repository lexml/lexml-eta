import { getDispositivoAndFilhosAsLista } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { State, StateType } from '../../../src/redux/state';
import { expect } from '@open-wc/testing';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { ABRIR_ARTICULACAO } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { moveElementoAcima } from '../../../src/redux/elemento/reducer/moveElementoAcima';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { Dispositivo } from '../../../src/model/dispositivo/dispositivo';
import { MEDIDA_PROVISORIA_COM_ALTERACAO_SEM_AGRUPADOR } from '../../doc/parser/mpv_885_20190617';

let state: State;

interface ItemEstrutura {
  id: string;
  texto: string;
}

// A movimentação renumera e recria os dispositivos, então a identidade é verificada pelo texto e a hierarquia pela troca de prefixo dos ids.
const estruturaDe = (d: Dispositivo): ItemEstrutura[] => getDispositivoAndFilhosAsLista(d).map(x => ({ id: x.id!, texto: x.texto ?? '' }));

const trocaPrefixoDosIds = (estrutura: ItemEstrutura[], de: string, para: string): ItemEstrutura[] => estrutura.map(item => ({ ...item, id: para + item.id.substring(de.length) }));

describe('Testando movimentação de artigo com alteração de norma', () => {
  let idArtigoMovido: string;
  let idArtigoAnterior: string;
  let estruturaArtigoMovido: ItemEstrutura[];
  let estruturaArtigoAnterior: ItemEstrutura[];

  beforeEach(function () {
    const projetoNorma = buildProjetoNormaFromJsonix(MEDIDA_PROVISORIA_COM_ALTERACAO_SEM_AGRUPADOR);
    state = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: projetoNorma.articulacao!, classificacao: ClassificacaoDocumento.PROJETO });

    const artigoMovido = state.articulacao!.artigos.filter((a, i) => i > 0 && a.hasAlteracao())[0];
    const artigoAnterior = state.articulacao!.artigos[state.articulacao!.artigos.indexOf(artigoMovido) - 1];

    idArtigoMovido = artigoMovido.id!;
    idArtigoAnterior = artigoAnterior.id!;
    estruturaArtigoMovido = estruturaDe(artigoMovido);
    estruturaArtigoAnterior = estruturaDe(artigoAnterior);

    state = moveElementoAcima(state, { atual: createElemento(artigoMovido) });
  });

  describe('Testando a estrutura após a movimentação', () => {
    it('O artigo movido deveria assumir a numeração do artigo anterior', () => {
      const artigo = state.articulacao!.artigos.find(a => a.id === idArtigoAnterior)!;
      expect(artigo.texto).to.equal(estruturaArtigoMovido[0].texto);
    });

    it('O artigo movido deveria manter o bloco de alteração', () => {
      const artigo = state.articulacao!.artigos.find(a => a.id === idArtigoAnterior)!;
      expect(artigo.hasAlteracao()).to.be.true;
    });

    it('Toda a hierarquia do artigo movido deveria acompanhar a renumeração dos ids', () => {
      const artigo = state.articulacao!.artigos.find(a => a.id === idArtigoAnterior)!;
      expect(estruturaDe(artigo)).to.deep.equal(trocaPrefixoDosIds(estruturaArtigoMovido, idArtigoMovido, idArtigoAnterior));
    });

    it('O artigo que estava antes deveria assumir a numeração do artigo movido', () => {
      const artigo = state.articulacao!.artigos.find(a => a.id === idArtigoMovido)!;
      expect(artigo.texto).to.equal(estruturaArtigoAnterior[0].texto);
    });

    it('Toda a hierarquia do artigo deslocado deveria acompanhar a renumeração dos ids', () => {
      const artigo = state.articulacao!.artigos.find(a => a.id === idArtigoMovido)!;
      expect(estruturaDe(artigo)).to.deep.equal(trocaPrefixoDosIds(estruturaArtigoAnterior, idArtigoAnterior, idArtigoMovido));
    });
  });

  describe('Testando a ordem dos dispositivos na articulação', () => {
    it('Os artigos deveriam permanecer numerados em sequência', () => {
      const ids = state.articulacao!.artigos.map(a => a.id);
      expect(ids).to.deep.equal(['art1', 'art2', 'art3', 'art4', 'art5']);
    });

    it('Cada artigo deveria ocupar na articulação o índice correspondente à sua numeração', () => {
      state.articulacao!.artigos.forEach((artigo, indice) => {
        expect(state.articulacao!.filhos.indexOf(artigo)).to.equal(indice);
      });
    });
  });

  describe('Testando eventos de atualização do editor', () => {
    it('Deveria possuir evento de exclusão', () => {
      const evExclusao = state.ui!.events.filter(ev => ev.stateType === StateType.ElementoRemovido);
      expect(evExclusao.length).to.be.equal(1);
      expect(evExclusao[0].elementos?.length).to.be.equal(estruturaArtigoMovido.length);
    });

    it('Deveria possuir evento de inclusão com a mesma quantidade de elementos da exclusão', () => {
      const evExclusao = state.ui!.events.filter(ev => ev.stateType === StateType.ElementoRemovido);
      const evInclusao = state.ui!.events.filter(ev => ev.stateType === StateType.ElementoIncluido);
      expect(evInclusao.length).to.be.equal(1);
      expect(evInclusao[0].elementos?.length).to.be.equal(evExclusao[0].elementos?.length);
    });
  });
});
