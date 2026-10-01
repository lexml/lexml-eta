import { expect } from '@open-wc/testing';
import { ADICIONAR_AGRUPADOR_ARTIGO } from '../../../src/model/lexml/acao/adicionarAgrupadorArtigoAction';
import { REMOVER_ELEMENTO } from '../../../src/model/lexml/acao/removerElementoAction';
import { openArticulacaoAction } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { ElementoAction } from '../../../src/model/lexml/acao';
import { Dispositivo } from '../../../src/model/dispositivo/dispositivo';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { buscaDispositivoById } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { TipoMensagem } from '../../../src/model/lexml/util/mensagem';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { agrupaElemento } from '../../../src/redux/elemento/reducer/agrupaElemento';
import { removeElemento } from '../../../src/redux/elemento/reducer/removeElemento';
import { State } from '../../../src/redux/state';
import { MPV_885_2019 } from '../../doc/mpv_885_2019';

const ACAO_REMOVER = 'Remover';

let state: State;

const menuOferece = (dispositivo: Dispositivo, descricao: string): boolean => dispositivo.getAcoesPossiveis(dispositivo).some((a: ElementoAction) => a.descricao === descricao);

const agrupar = (idAtual: string, tipo: string, posicao: string): void => {
  const atual = createElemento(buscaDispositivoById(state.articulacao!, idAtual)!);
  state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual, novo: { tipo, posicao } });
};

const remover = (id: string, tipo: string): void => {
  const atual = buscaDispositivoById(state.articulacao!, id)!;
  state = removeElemento(state, { type: REMOVER_ELEMENTO, atual: { tipo, uuid: atual.uuid! } });
};

describe('Testando a coerência entre o menu e o reducer na remoção de agrupadores', () => {
  beforeEach(function () {
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_885_2019);
    state = openArticulacaoAction(projetoNorma.articulacao!);
    state.ui = {} as any;
  });

  it('Não deveria recusar a remoção da articulação, que não possui pai', () => {
    expect(() => menuOferece(state.articulacao!, ACAO_REMOVER)).to.not.throw();
  });

  describe('Título contendo apenas capítulos', () => {
    beforeEach(function () {
      agrupar('ementa', TipoDispositivo.capitulo.tipo, 'depois');
      agrupar('cap1', TipoDispositivo.titulo.tipo, 'antes');
    });

    it('Deveria oferecer a remoção no menu, pois capítulo é permitido na articulação', () => {
      expect(menuOferece(buscaDispositivoById(state.articulacao!, 'tit1')!, ACAO_REMOVER)).to.be.true;
    });

    it('Deveria remover o título e promover o capítulo à articulação', () => {
      remover('tit1', TipoDispositivo.titulo.tipo);

      expect(buscaDispositivoById(state.articulacao!, 'tit1')).to.be.undefined;
      expect(buscaDispositivoById(state.articulacao!, 'cap1')).to.exist;
    });
  });

  describe('Capítulo contendo uma seção, logo abaixo da articulação', () => {
    beforeEach(function () {
      agrupar('ementa', TipoDispositivo.capitulo.tipo, 'depois');
      agrupar('cap1', TipoDispositivo.secao.tipo, 'depois');
    });

    it('Não deveria oferecer a remoção no menu, pois seção não é permitida na articulação', () => {
      expect(menuOferece(buscaDispositivoById(state.articulacao!, 'cap1')!, ACAO_REMOVER)).to.be.false;
    });

    it('Deveria recusar a remoção no reducer, mantendo a articulação intacta', () => {
      remover('cap1', TipoDispositivo.capitulo.tipo);

      expect(buscaDispositivoById(state.articulacao!, 'cap1')).to.exist;
      expect(state.ui!.message!.tipo).to.equal(TipoMensagem.ERROR);
      expect(state.ui!.message!.descricao).to.contain('elas devem ser removidas antes');
    });
  });

  describe('Seção contendo uma subseção, dentro de um capítulo', () => {
    beforeEach(function () {
      agrupar('ementa', TipoDispositivo.capitulo.tipo, 'depois');
      agrupar('cap1', TipoDispositivo.secao.tipo, 'depois');
      agrupar('cap1_sec1', TipoDispositivo.subsecao.tipo, 'depois');
      agrupar('cap1_sec1_sub1', TipoDispositivo.capitulo.tipo, 'depois');
    });

    it('Não deveria oferecer a remoção no menu, pois subseção não pode ficar sob capítulo', () => {
      expect(menuOferece(buscaDispositivoById(state.articulacao!, 'cap1_sec1')!, ACAO_REMOVER)).to.be.false;
    });

    it('Deveria recusar a remoção no reducer, mantendo a articulação intacta', () => {
      remover('cap1_sec1', TipoDispositivo.secao.tipo);

      expect(buscaDispositivoById(state.articulacao!, 'cap1_sec1')).to.exist;
      expect(state.ui!.message!.tipo).to.equal(TipoMensagem.ERROR);
      expect(state.ui!.message!.descricao).to.contain('não poder estar diretamente subordinado');
    });
  });
});
