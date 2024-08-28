import { expect } from '@open-wc/testing';
import { ADICIONAR_ELEMENTO } from '../../../src/model/lexml/acao/adicionarElementoAction';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { ABRIR_ARTICULACAO } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { MPV_885_2019 } from '../../doc/mpv_885_2019';
import { buscaDispositivoById } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { atualizaElemento } from '../../../src/redux/elemento/reducer/atualizaElemento';
import { ATUALIZAR_ELEMENTO } from '../../../src/model/lexml/acao/atualizarElementoAction';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { RENUMERAR_ELEMENTO } from '../../../src/model/lexml/acao/renumerarElementoAction';
import { existInArray } from '../../../src/util/objeto-util';

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
      expect(existInArray(state.mensagensCritical, 'Existem dispositivos sem texto informado.')).to.equal(true);
    });

    it('Deveria existir a mensagem Critical indicando ausência de numeração de dispositivo de alteração de norma.', () => {
      expect(existInArray(state.mensagensCritical, 'Existem dispositivos de norma alterada sem numeração informada.')).to.equal(true);
    });
  });

  describe('Adiciona e renumera inciso', () => {
    beforeEach(function () {
      const d = buscaDispositivoById(state.articulacao, 'art1_cpt_alt1_art1');
      state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: createElemento(d!), novo: { tipo: 'Inciso' } });

      const eNovo = createElemento(d!.filhos[0]);
      state = elementoReducer(state, { type: RENUMERAR_ELEMENTO, atual: eNovo, novo: { numero: 'I' } });
    });

    it('Não deveria mais existir a mensagem Existem dispositivos sem numeração informada.', () => {
      expect(existInArray(state.mensagensCritical, 'Existem dispositivos de norma alterada sem numeração informada.')).to.equal(false);
    });

    describe('Modifica texto inciso', () => {
      beforeEach(function () {
        const d = buscaDispositivoById(state.articulacao!, 'art1_cpt_alt1_art1')!;
        const eNovo = createElemento(d.filhos[0]);
        state = atualizaElemento(state, { type: ATUALIZAR_ELEMENTO, atual: { tipo: TipoDispositivo.artigo.tipo, uuid: eNovo.uuid!, conteudo: { texto: 'novo texto:' } } });
      });

      it('Não deveria mais existir a mensagem Existem dispositivos sem texto informado.', () => {
        expect(existInArray(state.mensagensCritical, 'Existem dispositivos sem texto informado.')).to.equal(false);
      });
    });
  });
});
