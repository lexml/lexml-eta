import { State } from '../../../src/redux/state';
import { MPV_905_2019 } from '../../doc/mpv_905_2019';
import { expect } from '@open-wc/testing';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { ABRIR_ARTICULACAO } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { LexmlEmendaParametrosEdicao } from '../../../src';
import {
  buscaDispositivoById,
  getDispositivoAndFilhosAsLista,
  isDispositivoAlteracao,
  isModificado,
  isOriginal,
  isSuprimido,
} from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { isBloqueado } from '../../../src/model/lexml/regras/regrasUtil';
import { ATUALIZAR_TEXTO_ELEMENTO } from '../../../src/model/lexml/acao/atualizarTextoElementoAction';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { SUPRIMIR_ELEMENTO } from '../../../src/model/lexml/acao/suprimirElemento';
import { ADICIONAR_ELEMENTOS_FROM_CLIPBOARD } from '../../../src/model/lexml/acao/AdicionarElementosFromClipboardAction';
import { adicionaElementosNaProposicaoFromClipboard } from '../../../src/redux/elemento/reducer/adicionaElementosNaProposicaoFromClipboard';
import { TEXTO_001 } from '../../doc/textos-colar/texto_001';
import { TEXTO_010 } from '../../doc/textos-colar/texto_010';
import { TEXTO_011 } from '../../doc/textos-colar/texto_011';
import { TEXTO_012 } from '../../doc/textos-colar/texto_012';

let state: State;

const params = new LexmlEmendaParametrosEdicao();
params.dispositivosBloqueados = [
  'art1',
  'art2_par1',
  'art2_par3',
  {
    lexmlId: 'art3',
    bloquearFilhos: false,
  },
  'art4_par1u',
  {
    lexmlId: 'art5',
    bloquearFilhos: true,
  },
  {
    lexmlId: 'art8',
    bloquearFilhos: false,
  },
];

describe('Carregando texto da MPV 905/2019', () => {
  beforeEach(function () {
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_905_2019, true);
    state = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: projetoNorma.articulacao!, classificacao: ClassificacaoDocumento.PROJETO, params });
  });

  it('Art. 1º e todos os seus filhos deveriam estar bloqueados', () => {
    const art1 = buscaDispositivoById(state.articulacao!, 'art1')!;
    expect(getDispositivoAndFilhosAsLista(art1).every(isBloqueado)).to.be.true;
  });

  it('"art2_par1" e todos os seus filhos deveriam estar bloqueados', () => {
    const d = buscaDispositivoById(state.articulacao!, 'art2_par1')!;
    expect(getDispositivoAndFilhosAsLista(d).every(isBloqueado)).to.be.true;
  });

  it('"art2_par3" e todos os seus filhos deveriam estar bloqueados', () => {
    const d = buscaDispositivoById(state.articulacao!, 'art2_par3')!;
    expect(getDispositivoAndFilhosAsLista(d).every(isBloqueado)).to.be.true;
  });

  it('Art. 3º deveria estar bloqueado', () => {
    const d = buscaDispositivoById(state.articulacao!, 'art3')!;
    expect(isBloqueado(d)).to.be.true;
  });

  it('Filhos do art. 3º não deveriam estar bloqueados', () => {
    const d = buscaDispositivoById(state.articulacao!, 'art3')!;
    expect(getDispositivoAndFilhosAsLista(d).slice(1).some(isBloqueado)).to.be.false;
  });

  it('"art4_par1u" e todos os seus filhos deveriam estar bloqueados', () => {
    const d = buscaDispositivoById(state.articulacao!, 'art4_par1u')!;
    expect(getDispositivoAndFilhosAsLista(d).every(isBloqueado)).to.be.true;
  });

  it('Art. 5º e todos os seus filhos deveriam estar bloqueados', () => {
    const d = buscaDispositivoById(state.articulacao!, 'art5')!;
    expect(getDispositivoAndFilhosAsLista(d).every(isBloqueado)).to.be.true;
  });

  describe('Testando ações em dispositivos bloqueados', () => {
    describe('Modificação', () => {
      beforeEach(function () {
        const dArt1 = buscaDispositivoById(state.articulacao!, 'art1')!;
        state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: { tipo: dArt1.tipo, uuid: dArt1.uuid!, conteudo: { texto: 'Novo texto.' } } });
      });

      it('Texto do art. 1º não deveria ter sido modificado', () => {
        expect(state.articulacao?.artigos[0].texto).to.not.equal('Novo texto.');
      });

      it('Estado deveria apresentar mensagem de erro', () => {
        expect(state.ui?.message).to.not.be.undefined;
      });
    });

    describe('Supressão', () => {
      beforeEach(function () {
        state = elementoReducer(state, { type: SUPRIMIR_ELEMENTO, atual: createElemento(buscaDispositivoById(state.articulacao!, 'art1')!) });
      });

      it('Art. 1º não deveria estar suprimido', () => {
        expect(isSuprimido(buscaDispositivoById(state.articulacao!, 'art1')!)).to.be.false;
      });

      it('Estado deveria apresentar mensagem de erro', () => {
        expect(state.ui?.message).to.not.be.undefined;
      });
    });

    describe('Colar', () => {
      describe('Colar modificando dispositivo bloqueado (art. 1º está bloqueado)', () => {
        beforeEach(function () {
          const disp = buscaDispositivoById(state.articulacao!, 'art1')!;
          state = adicionaElementosNaProposicaoFromClipboard(state, {
            type: ADICIONAR_ELEMENTOS_FROM_CLIPBOARD,
            atual: createElemento(disp),
            novo: {
              isDispositivoAlteracao: isDispositivoAlteracao(disp),
              conteudo: {
                texto: TEXTO_001,
              },
            },
            isColarSubstituindo: true,
            posicao: 'depois',
          });
        });

        it('Art. 1º não deveria ter sido modificado', () => {
          expect(state.articulacao?.artigos[0].texto).to.not.equal('Teste 1.');
        });

        it('Estado deveria apresentar mensagem de erro', () => {
          expect(state.ui?.message).to.not.be.undefined;
        });
      });

      describe('Colar estrutura com dispositivos bloqueados e não bloqueados', () => {
        beforeEach(function () {
          const disp = buscaDispositivoById(state.articulacao!, 'art1')!;
          state = adicionaElementosNaProposicaoFromClipboard(state, {
            type: ADICIONAR_ELEMENTOS_FROM_CLIPBOARD,
            atual: createElemento(disp),
            novo: {
              isDispositivoAlteracao: isDispositivoAlteracao(disp),
              conteudo: {
                texto: TEXTO_010,
              },
            },
            isColarSubstituindo: true,
            posicao: 'depois',
          });
        });

        it('Dispositivo "art2_par2" não deveria ter sido modificado (mesmo não estando bloqueado)', () => {
          const disp = buscaDispositivoById(state.articulacao!, 'art2_par2')!;
          expect(disp.texto).to.not.equal('Teste.');
          expect(isOriginal(disp)).to.be.true;
        });

        it('Dispositivo "art2_par3" não deveria ter sido modificado (está bloqueado)', () => {
          const disp = buscaDispositivoById(state.articulacao!, 'art2_par3')!;
          expect(disp.texto).to.not.equal('Teste.');
          expect(isOriginal(disp)).to.be.true;
        });

        it('Estado deveria apresentar mensagem de erro', () => {
          expect(state.ui?.message).to.not.be.undefined;
        });
      });

      describe('Colar alterando dispositivos não bloqueados', () => {
        beforeEach(function () {
          const disp = buscaDispositivoById(state.articulacao!, 'art1')!;
          state = adicionaElementosNaProposicaoFromClipboard(state, {
            type: ADICIONAR_ELEMENTOS_FROM_CLIPBOARD,
            atual: createElemento(disp),
            novo: {
              isDispositivoAlteracao: isDispositivoAlteracao(disp),
              conteudo: {
                texto: TEXTO_011,
              },
            },
            isColarSubstituindo: true,
            posicao: 'depois',
          });
        });

        it('Dispositivo "art2_par2" deveria ter sido modificado', () => {
          const disp = buscaDispositivoById(state.articulacao!, 'art2_par2')!;
          expect(disp.texto).equal('Teste.');
          expect(isModificado(disp)).to.be.true;
        });

        it('Estado não deveria apresentar mensagem de erro', () => {
          expect(state.ui?.message).to.be.undefined;
        });
      });

      describe('Colar alterando dispositivos não bloqueados, filhos de dispositivos bloqueados', () => {
        beforeEach(function () {
          const disp = buscaDispositivoById(state.articulacao!, 'art1')!;
          state = adicionaElementosNaProposicaoFromClipboard(state, {
            type: ADICIONAR_ELEMENTOS_FROM_CLIPBOARD,
            atual: createElemento(disp),
            novo: {
              isDispositivoAlteracao: isDispositivoAlteracao(disp),
              conteudo: {
                texto: TEXTO_012,
              },
            },
            isColarSubstituindo: true,
            posicao: 'depois',
          });
        });

        it('Dispositivo "art8" não deveria ter sido modificado (está bloqueado)', () => {
          const disp = buscaDispositivoById(state.articulacao!, 'art8')!;
          expect(disp.texto).to.not.equal('Teste.');
          expect(isOriginal(disp)).to.be.true;
          expect(isBloqueado(disp)).to.be.true;
        });

        it('Dispositivo "art8_par1" não deveria ter sido modificado', () => {
          const disp = buscaDispositivoById(state.articulacao!, 'art8_par1')!;
          expect(isOriginal(disp)).to.be.true;
          expect(isBloqueado(disp)).to.be.false;
        });

        it('Dispositivo "art8_par2" deveria ter sido modificado', () => {
          const disp = buscaDispositivoById(state.articulacao!, 'art8_par2')!;
          expect(disp.texto).to.equal('Teste.');
          expect(isModificado(disp)).to.be.true;
          expect(isBloqueado(disp)).to.be.false;
        });

        it('Dispositivo "art8_par3" deveria ter sido suprimido', () => {
          const disp = buscaDispositivoById(state.articulacao!, 'art8_par3')!;
          expect(disp.texto).to.not.equal('Teste.');
          expect(isSuprimido(disp)).to.be.true;
          expect(isBloqueado(disp)).to.be.false;
        });

        it('Estado não deveria apresentar mensagem de erro', () => {
          expect(state.ui?.message).to.be.undefined;
        });
      });
    });
  });
});
