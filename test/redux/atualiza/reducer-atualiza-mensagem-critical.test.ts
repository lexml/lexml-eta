import { expect } from '@open-wc/testing';
import { ADICIONAR_ELEMENTO } from '../../../src/model/lexml/acao/adicionarElementoAction';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { ABRIR_ARTICULACAO } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { MPV_885_2019 } from '../../doc/mpv_885_2019';
import { buscaDispositivoById } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { createElemento } from '../../../src/model/elemento/elementoUtil';

let state: any;

describe('Testando situações de mensagem Critical na articulação.', () => {
  beforeEach(function () {
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_885_2019, true);
    state = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: projetoNorma.articulacao!, classificacao: ClassificacaoDocumento.EMENDA });
  });

  describe('Inclui artigo para valida mensagem critical.', () => {
    beforeEach(function () {
      const e = createElemento(buscaDispositivoById(state.articulacao, 'art1_cpt_alt1_art1')!);
      state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: e, novo: { tipo: 'Artigo' }, posicao: 'depois' });
    });

    it('Deveria existir a mensagem Critical indicando ausência de texto no dispositivo.', () => {
      expect(state.mensagensCritical[0]).to.equal('Existem dispositivos sem texto informado.');
    });

    it('Deveria existir a mensagem Critical indicando ausência de numeração de dispositivo de alteração de norma.', () => {
      expect(state.mensagensCritical[1]).to.equal('Existem dispositivos de norma alterada sem numeração informada.');
    });
  });
});
