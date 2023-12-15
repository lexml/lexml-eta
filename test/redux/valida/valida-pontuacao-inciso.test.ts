import { buscaDispositivoById } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { State } from '../../../src/redux/state';
import { MPV_885_2019 } from '../../doc/mpv_885_2019';
import { expect } from '@open-wc/testing';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { openArticulacaoAction } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { validaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoValidator';
import { ADICIONAR_ELEMENTO } from '../../../src/model/lexml/acao/adicionarElementoAction';
import { ATUALIZAR_TEXTO_ELEMENTO } from '../../../src/model/lexml/acao/atualizarTextoElementoAction';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { RENUMERAR_ELEMENTO } from '../../../src/model/lexml/acao/renumerarElementoAction';

let state: State;

describe('Testando carregamento da MPV 905/2019', () => {
  beforeEach(function () {
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_885_2019, true);
    state = openArticulacaoAction(projetoNorma.articulacao!);
    state.ui = {} as any;
  });

  it('Deveria possuir articulação com 5 artigos', () => {
    expect(state.articulacao?.filhos.length).to.equal(5);
    expect(state.articulacao?.filhos.every(f => f.tipo === 'Artigo')).to.be.true;
  });

  // Adiciona inciso em um artigo (em alteração de norma)
  describe('Adicionando inciso ao artigo "art1_cpt_alt1_art1" (em alteração de norma)', () => {
    beforeEach(function () {
      const d = buscaDispositivoById(state.articulacao!, 'art1_cpt_alt1_art1')!;

      // Adiciona inciso
      state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: createElemento(d), novo: { tipo: 'Inciso' } });

      // Rnumera inciso
      let e = createElemento(d.filhos[0]);
      state = elementoReducer(state, { type: RENUMERAR_ELEMENTO, atual: e, novo: { numero: 'I' } });

      // Altera texto do inciso
      e = createElemento(buscaDispositivoById(state.articulacao!, 'art1_cpt_alt1_art1_cpt_inc1')!);
      e.conteudo!.texto = 'teste';
      state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
    });

    it('Deveria encontrar novo inciso (art1_cpt_alt1_art1_cpt_inc1)', () => {
      const d = buscaDispositivoById(state.articulacao!, 'art1_cpt_alt1_art1_cpt_inc1')!;
      expect(d).to.be.exist;
    });

    it('Inciso deveria possuir número "1"', () => {
      const d = buscaDispositivoById(state.articulacao!, 'art1_cpt_alt1_art1_cpt_inc1')!;
      expect(d.numero).to.equal('1');
    });

    it('Inciso deveria possuir rótulo "I –"', () => {
      const d = buscaDispositivoById(state.articulacao!, 'art1_cpt_alt1_art1_cpt_inc1')!;
      expect(d.rotulo).to.equal('I –');
    });

    it('Inciso deveria possuir texto "teste"', () => {
      const d = buscaDispositivoById(state.articulacao!, 'art1_cpt_alt1_art1_cpt_inc1')!;
      expect(d.texto).to.equal('teste');
    });

    describe('Testando validação de pontuação', () => {
      it('Inciso deveria apresentar 1 mensagem de validação de pontuação', () => {
        const mensagens = validaDispositivo(buscaDispositivoById(state.articulacao!, 'art1_cpt_alt1_art1_cpt_inc1')!);
        expect(mensagens.length).to.equal(1);
      });

      it('Mensagem de validação de pontuação deveria ser: "Último dispositivo de uma sequência deveria terminar com ponto."', () => {
        const mensagens = validaDispositivo(buscaDispositivoById(state.articulacao!, 'art1_cpt_alt1_art1_cpt_inc1')!);
        expect(mensagens[0].descricao).to.equal('Último dispositivo de uma sequência deveria terminar com ponto.');
      });
    });
  });

  // Adiciona inciso em um parágrafo (em alteração de norma)
  describe('Adicionando inciso ao parágrafo "art1_cpt_alt1_art5_par2" (em alteração de norma)', () => {
    beforeEach(function () {
      const d = buscaDispositivoById(state.articulacao!, 'art1_cpt_alt1_art5_par2')!;

      // Adiciona inciso
      state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: createElemento(d), novo: { tipo: 'Inciso' } });

      // Rnumera inciso
      let e = createElemento(d.filhos[0]);
      state = elementoReducer(state, { type: RENUMERAR_ELEMENTO, atual: e, novo: { numero: 'I' } });

      // Altera texto do inciso
      e = createElemento(buscaDispositivoById(state.articulacao!, 'art1_cpt_alt1_art5_par2_inc1')!);
      e.conteudo!.texto = 'teste';
      state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
    });

    it('Deveria encontrar novo inciso (art1_cpt_alt1_art5_par2_inc1)', () => {
      const d = buscaDispositivoById(state.articulacao!, 'art1_cpt_alt1_art5_par2_inc1')!;
      expect(d).to.be.exist;
    });

    it('Inciso deveria possuir número "1"', () => {
      const d = buscaDispositivoById(state.articulacao!, 'art1_cpt_alt1_art5_par2_inc1')!;
      expect(d.numero).to.equal('1');
    });

    it('Inciso deveria possuir rótulo "I –"', () => {
      const d = buscaDispositivoById(state.articulacao!, 'art1_cpt_alt1_art5_par2_inc1')!;
      expect(d.rotulo).to.equal('I –');
    });

    it('Inciso deveria possuir texto "teste"', () => {
      const d = buscaDispositivoById(state.articulacao!, 'art1_cpt_alt1_art5_par2_inc1')!;
      expect(d.texto).to.equal('teste');
    });

    describe('Testando validação de pontuação', () => {
      it('Inciso deveria apresentar 1 mensagem de validação de pontuação', () => {
        const mensagens = validaDispositivo(buscaDispositivoById(state.articulacao!, 'art1_cpt_alt1_art5_par2_inc1')!);
        expect(mensagens.length).to.equal(1);
      });

      it('Mensagem de validação de pontuação deveria ser: "Último dispositivo de uma sequência deveria terminar com ponto."', () => {
        const mensagens = validaDispositivo(buscaDispositivoById(state.articulacao!, 'art1_cpt_alt1_art5_par2_inc1')!);
        expect(mensagens[0].descricao).to.equal('Último dispositivo de uma sequência deveria terminar com ponto.');
      });
    });
  });
});
