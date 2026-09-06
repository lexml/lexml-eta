import { expect } from '@open-wc/testing';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { openArticulacaoAction } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { INFORMAR_EXISTENCIA_NA_NORMA } from '../../../src/model/lexml/acao/informarExistenciaDoElementoNaNormaAction';
import { buscaDispositivoById } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { createElemento, podeAdicionarAtributoDeExistencia } from '../../../src/model/elemento/elementoUtil';
import { informaExistenciaDoElementoNaNorma } from '../../../src/redux/elemento/reducer/informaExistenciaDoElementoNaNorma';
import { Dispositivo } from '../../../src/model/dispositivo/dispositivo';
import { ElementoAction } from '../../../src/model/lexml/acao';
import { State } from '../../../src/redux/state';
import { MPV_885_2019 } from '../../doc/mpv_885_2019';

const CONSIDERAR_NOVO = 'Considerar novo na norma';
const CONSIDERAR_EXISTENTE = 'Considerar existente na norma';

let state: State;

const descricoesDasAcoes = (dispositivo: Dispositivo): string[] => dispositivo.getAcoesPossiveis(dispositivo).map((a: ElementoAction) => a.descricao!);

describe('Testando as ações de existência na norma alterada', () => {
  let dispositivo: Dispositivo;

  beforeEach(function () {
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_885_2019);
    state = openArticulacaoAction(projetoNorma.articulacao!);
    state.ui = {} as any;

    dispositivo = buscaDispositivoById(state.articulacao!, 'art2_cpt_alt1_art60-1_par1')!;
  });

  it('Deveria oferecer as duas opções quando a existência na norma não foi informada', () => {
    expect(dispositivo.existeNaNormaAlterada).to.be.undefined;

    const descricoes = descricoesDasAcoes(dispositivo);
    expect(descricoes).to.include(CONSIDERAR_NOVO);
    expect(descricoes).to.include(CONSIDERAR_EXISTENTE);
  });

  it('Deveria oferecer apenas "Considerar novo" quando o dispositivo existe na norma', () => {
    dispositivo.existeNaNormaAlterada = true;

    const descricoes = descricoesDasAcoes(dispositivo);
    expect(descricoes).to.include(CONSIDERAR_NOVO);
    expect(descricoes).to.not.include(CONSIDERAR_EXISTENTE);
  });

  it('Deveria oferecer apenas "Considerar existente" quando o dispositivo é novo na norma', () => {
    dispositivo.existeNaNormaAlterada = false;

    const descricoes = descricoesDasAcoes(dispositivo);
    expect(descricoes).to.include(CONSIDERAR_EXISTENTE);
    expect(descricoes).to.not.include(CONSIDERAR_NOVO);
  });

  it('Não deveria oferecer nenhuma das opções fora de bloco de alteração', () => {
    const artigo = buscaDispositivoById(state.articulacao!, 'art1')!;

    const descricoes = descricoesDasAcoes(artigo);
    expect(descricoes).to.not.include(CONSIDERAR_NOVO);
    expect(descricoes).to.not.include(CONSIDERAR_EXISTENTE);
  });

  describe('Informando a existência na norma pelo reducer', () => {
    const informar = (d: Dispositivo, existeNaNormaAlterada: boolean): void => {
      state = informaExistenciaDoElementoNaNorma(state, {
        type: INFORMAR_EXISTENCIA_NA_NORMA,
        atual: createElemento(d),
        existeNaNormaAlterada,
      });
    };

    it('Deveria marcar como existente um dispositivo sem valor informado', () => {
      informar(dispositivo, true);

      expect(dispositivo.existeNaNormaAlterada).to.be.true;
      expect(podeAdicionarAtributoDeExistencia(createElemento(dispositivo)), 'o selo precisa aparecer').to.be.true;
    });

    it('Deveria marcar como novo um dispositivo sem valor informado', () => {
      informar(dispositivo, false);

      expect(dispositivo.existeNaNormaAlterada).to.be.false;
      expect(podeAdicionarAtributoDeExistencia(createElemento(dispositivo)), 'o selo precisa aparecer').to.be.true;
    });

    it('Deveria permitir trocar de existente para novo', () => {
      informar(dispositivo, true);
      informar(dispositivo, false);

      expect(dispositivo.existeNaNormaAlterada).to.be.false;
    });

    it('Deveria permitir trocar de novo para existente', () => {
      informar(dispositivo, false);
      informar(dispositivo, true);

      expect(dispositivo.existeNaNormaAlterada).to.be.true;
    });
  });
});
