import { expect } from '@open-wc/testing';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { openArticulacaoAction } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { buscaDispositivoById, podeEditarNotaAlteracao } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { podeInformarNumeracao } from '../../../src/util/eta-quill/eta-blot-rotulo';
import { Dispositivo } from '../../../src/model/dispositivo/dispositivo';
import { ElementoAction } from '../../../src/model/lexml/acao';
import { State } from '../../../src/redux/state';
import { MPV_885_2019 } from '../../doc/mpv_885_2019';

const ATUALIZAR_NOTA = 'Atualizar nota de alteração';

// Último dispositivo do bloco de alteração do art. 2º, onde ficam as aspas de fechamento e o "(NR)".
const ID_ULTIMA_ALTERACAO = 'art2_cpt_alt1_art63-4';
const ID_PARAGRAFO_NO_MEIO = 'art2_cpt_alt1_art60-1_par1';

const descricoesDasAcoes = (dispositivo: Dispositivo): string[] => dispositivo.getAcoesPossiveis(dispositivo).map((a: ElementoAction) => a.descricao!);

describe('Testando a edição em bloco de alteração vindo de documento carregado', () => {
  let state: State;
  const busca = (id: string): Dispositivo => buscaDispositivoById(state.articulacao!, id)!;

  beforeEach(function () {
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_885_2019);
    state = openArticulacaoAction(projetoNorma.articulacao!);
    state.ui = {} as any;
  });

  describe('Nota de alteração', () => {
    it('Deveria permitir editar a nota no último dispositivo do bloco', () => {
      const ultimo = busca(ID_ULTIMA_ALTERACAO);

      expect(podeEditarNotaAlteracao(ultimo)).to.be.true;
      expect(createElemento(ultimo).podeEditarNotaAlteracao).to.be.true;
      expect(descricoesDasAcoes(ultimo)).to.include(ATUALIZAR_NOTA);
    });

    it('Não deveria oferecer a edição da nota em dispositivo que não encerra o bloco', () => {
      const paragrafo = busca(ID_PARAGRAFO_NO_MEIO);

      expect(podeEditarNotaAlteracao(paragrafo)).to.be.false;
      expect(createElemento(paragrafo).podeEditarNotaAlteracao).to.be.undefined;
      expect(descricoesDasAcoes(paragrafo)).to.not.include(ATUALIZAR_NOTA);
    });

    it('Não deveria oferecer a edição da nota fora de bloco de alteração', () => {
      const artigo = busca('art1');

      expect(podeEditarNotaAlteracao(artigo)).to.be.false;
      expect(descricoesDasAcoes(artigo)).to.not.include(ATUALIZAR_NOTA);
    });
  });

  describe('Numeração pelo rótulo', () => {
    it('Deveria permitir informar a numeração de artigo do bloco', () => {
      expect(podeInformarNumeracao(createElemento(busca(ID_ULTIMA_ALTERACAO)))).to.be.true;
    });

    it('Deveria permitir informar a numeração de parágrafo cujo pai não é conhecido como existente na norma', () => {
      expect(podeInformarNumeracao(createElemento(busca(ID_PARAGRAFO_NO_MEIO)))).to.be.true;
    });

    it('Não deveria permitir informar a numeração fora de bloco de alteração', () => {
      expect(podeInformarNumeracao(createElemento(busca('art1')))).to.be.false;
    });
  });
});
