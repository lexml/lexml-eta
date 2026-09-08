import { State } from '../../../src/redux/state';
import { MPV_905_2019 } from '../../doc/mpv_905_2019';
import { expect } from '@open-wc/testing';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { ABRIR_ARTICULACAO } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { ATIVAR_DESATIVAR_REVISAO } from '../../../src/model/lexml/acao/ativarDesativarRevisaoAction';
import { buscaDispositivoById, isDispositivoAlteracao } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { UNDO } from '../../../src/model/lexml/acao/undoAction';
import { RevisaoElemento } from '../../../src/model/revisao/revisao';
import { ATUALIZAR_TEXTO_ELEMENTO } from '../../../src/model/lexml/acao/atualizarTextoElementoAction';
import { ADICIONAR_ELEMENTO } from '../../../src/model/lexml/acao/adicionarElementoAction';
import { REMOVER_ELEMENTO } from '../../../src/model/lexml/acao/removerElementoAction';
import { MOVER_ELEMENTO_ABAIXO } from '../../../src/model/lexml/acao/moverElementoAbaixoAction';
import { MOVER_ELEMENTO_ACIMA } from '../../../src/model/lexml/acao/moverElementoAcimaAction';
import { REDO } from '../../../src/model/lexml/acao/redoAction';
import { isRevisaoPrincipal } from '../../../src/redux/elemento/util/revisaoUtil';
import { REJEITAR_REVISAO } from '../../../src/model/lexml/acao/rejeitarRevisaoAction';
import { adicionaElementosNaProposicaoFromClipboard } from '../../../src/redux/elemento/reducer/adicionaElementosNaProposicaoFromClipboard';
import { ADICIONAR_ELEMENTOS_FROM_CLIPBOARD } from '../../../src/model/lexml/acao/AdicionarElementosFromClipboardAction';
import { TEXTO_014 } from '../../doc/textos-colar/texto_014';
import { TEXTO_013 } from '../../doc/textos-colar/texto_013';

let state: State;

describe('Carregando texto da MPV 905/2019', () => {
  beforeEach(function () {
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_905_2019);
    state = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: projetoNorma.articulacao!, classificacao: ClassificacaoDocumento.PROJETO });
  });

  describe('Movendo artigo, com alteração de norma, adicionado fora de revisão', () => {
    beforeEach(function () {
      // adiciona dispositivos
      const disp = buscaDispositivoById(state.articulacao!, 'art1')!;
      const atual = createElemento(disp);
      const isColarSubstituindo = false;
      state = adicionaElementosNaProposicaoFromClipboard(state, {
        type: ADICIONAR_ELEMENTOS_FROM_CLIPBOARD,
        atual,
        novo: {
          isDispositivoAlteracao: isDispositivoAlteracao(disp),
          conteudo: {
            texto: TEXTO_014,
          },
        },
        isColarSubstituindo,
        posicao: 'depois',
      });

      state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });
      state = elementoReducer(state, { type: MOVER_ELEMENTO_ACIMA, atual: createElemento(buscaDispositivoById(state.articulacao!, 'art2')!) });
    });

    it('Artigo 1 deveria possuir alteração de norma', () => {
      const d = buscaDispositivoById(state.articulacao!, 'art1')!;
      const alteracoes = d.alteracoes!;
      expect(alteracoes).to.not.be.undefined;
      expect(alteracoes.filhos.length).to.be.equal(1);
    });

    it('Todos os dispositivos movidos deveriam possuir id iniciando com "art1"', () => {
      const dispositivos = buscaDispositivoById(state.articulacao!, 'art1')!.filhos;
      dispositivos.forEach(d => {
        expect(d.id).to.match(/^art1/);
      });
    });

    it('Deveria possuir 4 revisões sendo 1 principal', () => {
      expect(state.revisoes?.length).to.be.equal(4);
      expect(state.revisoes?.filter(isRevisaoPrincipal).length).to.be.equal(1);
    });

    describe('Fazendo UNDO', () => {
      beforeEach(function () {
        state = elementoReducer(state, { type: UNDO });
      });

      it('Art. 2 deveria ser o artigo que foi colado', () => {
        const dispositivo = buscaDispositivoById(state.articulacao!, 'art2');
        expect(dispositivo).to.not.be.undefined;
        expect(dispositivo?.texto).to.be.includes('Lei nº 7.713, de 22 de dezembro de 1988');
      });

      it('Todos os dispositivos movidos deveriam possuir id iniciando com "art2"', () => {
        const dispositivos = buscaDispositivoById(state.articulacao!, 'art2')!.filhos;
        dispositivos.forEach(d => {
          expect(d.id).to.match(/^art2/);
        });
      });

      it('Deveria não possuir revisões', () => {
        expect(state.revisoes?.length).to.be.equal(0);
      });

      describe('Fazendo REDO', () => {
        beforeEach(function () {
          state = elementoReducer(state, { type: REDO });
        });

        it('Art. 1 deveria ser o artigo que foi colado', () => {
          const dispositivo = buscaDispositivoById(state.articulacao!, 'art1');
          expect(dispositivo).to.not.be.undefined;
          expect(dispositivo?.texto).to.be.includes('Lei nº 7.713, de 22 de dezembro de 1988');
        });

        it('Art. 1 deveria possuir alteração de norma', () => {
          const alteracoes = buscaDispositivoById(state.articulacao!, 'art1')!.alteracoes!;
          expect(alteracoes).to.not.be.undefined;
          expect(alteracoes.filhos.length).to.be.equal(1);
        });

        it('Todos os dispositivos movidos deveriam possuir id iniciando com "art1"', () => {
          const dispositivos = buscaDispositivoById(state.articulacao!, 'art1')!.filhos;
          dispositivos.forEach(d => {
            expect(d.id).to.match(/^art1/);
          });
        });

        it('Deveria possuir 4 revisões sendo 1 principal', () => {
          expect(state.revisoes?.length).to.be.equal(4);
          expect(state.revisoes?.filter(isRevisaoPrincipal).length).to.be.equal(1);
        });
      });
    });
  });

  describe('Movendo (2 vezes para baixo) dispositivo adicionado fora de revisão', () => {
    beforeEach(function () {
      // adiciona dispositivos
      const disp = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
      const atual = createElemento(disp);
      const isColarSubstituindo = false;
      state = adicionaElementosNaProposicaoFromClipboard(state, {
        type: ADICIONAR_ELEMENTOS_FROM_CLIPBOARD,
        atual,
        novo: {
          isDispositivoAlteracao: isDispositivoAlteracao(disp),
          conteudo: {
            texto: TEXTO_013,
          },
        },
        isColarSubstituindo,
        posicao: 'depois',
      });

      state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });

      state = elementoReducer(state, { type: MOVER_ELEMENTO_ABAIXO, atual: createElemento(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!) });
      state = elementoReducer(state, { type: MOVER_ELEMENTO_ABAIXO, atual: createElemento(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc3')!) });
    });

    it('Deveria possuir 3 revisões sendo 1 principal', () => {
      expect(state.revisoes?.length).to.be.equal(3);
      expect(state.revisoes?.filter(isRevisaoPrincipal).length).to.be.equal(1);
    });

    it('Atual inciso IV deveria possuir texto "teste A:"', () => {
      const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc4')!;
      expect(d.texto).to.be.equal('teste A:');
    });

    describe('Rejeitando revisão e fazendo UNDO', () => {
      beforeEach(function () {
        state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao: state.revisoes![0] });
        state = elementoReducer(state, { type: UNDO });
      });

      it('Deveria possuir 3 revisões sendo 1 principal', () => {
        expect(state.revisoes?.length).to.be.equal(3);
        expect(state.revisoes?.filter(isRevisaoPrincipal).length).to.be.equal(1);
      });

      it('Atual inciso IV deveria possuir texto "teste A:"', () => {
        const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc4')!;
        expect(d.texto).to.be.equal('teste A:');
      });
    });
  });

  describe('Movendo dispositivo adicionado fora de revisão, alterando texto de dispositivo subordinado e fazendo UNDO da alteração', () => {
    beforeEach(function () {
      // adiciona dispositivos
      const disp = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
      const atual = createElemento(disp);
      const isColarSubstituindo = false;
      state = adicionaElementosNaProposicaoFromClipboard(state, {
        type: ADICIONAR_ELEMENTOS_FROM_CLIPBOARD,
        atual,
        novo: {
          isDispositivoAlteracao: isDispositivoAlteracao(disp),
          conteudo: {
            texto: TEXTO_013,
          },
        },
        isColarSubstituindo,
        posicao: 'depois',
      });

      state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });

      const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!;
      state = elementoReducer(state, { type: MOVER_ELEMENTO_ABAIXO, atual: createElemento(d) });

      const e = createElemento(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc3_ali2')!);
      e.conteudo!.texto = 'novo texto da alínea 2 do atual inciso "III";';
      state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });

      state = elementoReducer(state, { type: UNDO });
    });

    it('Deveria possuir 3 revisões sendo 1 principal', () => {
      expect(state.revisoes?.length).to.be.equal(3);
      expect(state.revisoes?.filter(isRevisaoPrincipal).length).to.be.equal(1);
    });
  });

  describe('Movendo dispositivo adicionado fora de revisão (caso 2)', () => {
    beforeEach(function () {
      const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
      state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: createElemento(d), novo: { tipo: 'Inciso' } });
      const e = createElemento(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!);
      e.conteudo!.texto = 'texto inciso novo;';
      state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
    });

    it('Deveria possuir novo inciso', () => {
      const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!;
      expect(d).not.to.be.undefined;
      expect(d.texto).to.be.equal('texto inciso novo;');
    });

    describe('Ativa revisão', () => {
      beforeEach(function () {
        state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });
      });

      it('Deveria estar em revisão', () => {
        expect(state.emRevisao).to.be.true;
      });

      describe('Modificando texto do dispositivo adicionado', () => {
        it('Deveria possuir uma revisão', () => {
          let d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!;
          const e = createElemento(d);
          e.conteudo!.texto = 'texto inciso novo modificado;';
          state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
          d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!;
          expect(state.revisoes?.length).to.be.equal(1);
          expect((state.revisoes![0] as RevisaoElemento).elementoAntesRevisao?.conteudo?.texto).to.be.equal('texto inciso novo;');
        });
      });

      describe('Movendo dispositivo adicionado para baixo', () => {
        it('Deveria possuir uma revisão', () => {
          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!;
          state = elementoReducer(state, { type: MOVER_ELEMENTO_ABAIXO, atual: createElemento(d) });
          expect(state.revisoes?.length).to.be.equal(1);
          expect((state.revisoes![0] as RevisaoElemento).elementoAntesRevisao?.conteudo?.texto).to.be.equal('texto inciso novo;');
        });
      });

      describe('Movendo dispositivo adicionado para baixo e movendo de volta para cima', () => {
        it('Deveria não possuir revisão', () => {
          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!;
          state = elementoReducer(state, { type: MOVER_ELEMENTO_ABAIXO, atual: createElemento(d) });
          expect(state.revisoes?.length).to.be.equal(1);
          expect((state.revisoes![0] as RevisaoElemento).elementoAntesRevisao?.conteudo?.texto).to.be.equal('texto inciso novo;');

          state = elementoReducer(state, { type: MOVER_ELEMENTO_ACIMA, atual: createElemento(d) });
          expect(state.revisoes?.length).to.be.equal(0);
        });
      });

      describe('Movendo dispositivo adicionado para baixo e fazendo UNDO', () => {
        it('Deveria não possuir revisão', () => {
          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!;
          state = elementoReducer(state, { type: MOVER_ELEMENTO_ABAIXO, atual: createElemento(d) });
          expect(state.revisoes?.length).to.be.equal(1);
          expect((state.revisoes![0] as RevisaoElemento).elementoAntesRevisao?.conteudo?.texto).to.be.equal('texto inciso novo;');

          state = elementoReducer(state, { type: UNDO });
          expect(state.revisoes?.length).to.be.equal(0);
        });
      });

      describe('Movendo dispositivo adicionado para baixo, fazendo UNDO e fazendo REDO', () => {
        it('Deveria possuir uma revisão', () => {
          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!;
          state = elementoReducer(state, { type: MOVER_ELEMENTO_ABAIXO, atual: createElemento(d) });
          expect(state.revisoes?.length).to.be.equal(1);
          expect((state.revisoes![0] as RevisaoElemento).elementoAntesRevisao?.conteudo?.texto).to.be.equal('texto inciso novo;');

          state = elementoReducer(state, { type: UNDO });
          expect(state.revisoes?.length).to.be.equal(0);

          state = elementoReducer(state, { type: REDO });
          expect(state.revisoes?.length).to.be.equal(1);
          expect((state.revisoes![0] as RevisaoElemento).elementoAntesRevisao?.conteudo?.texto).to.be.equal('texto inciso novo;');
        });
      });
    });
  });

  describe('Movendo dispositivo adicionado em revisão', () => {
    beforeEach(function () {
      state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });
    });

    it('Deveria estar em revisão', () => {
      expect(state.emRevisao).to.be.true;
    });

    describe('Adicionando dispositivo', () => {
      beforeEach(function () {
        const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
        state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: createElemento(d), novo: { tipo: 'Inciso' } });
        const e = createElemento(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!);
        e.conteudo!.texto = 'texto inciso novo;';
        state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
      });

      it('Deveria possuir uma revisão', () => {
        expect(state.revisoes?.length).to.be.equal(1);
        expect((state.revisoes![0] as RevisaoElemento).elementoAntesRevisao).to.be.undefined;
      });

      describe('Movendo dispositivo adicionado para baixo', () => {
        it('Deveria possuir uma revisão', () => {
          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!;
          state = elementoReducer(state, { type: MOVER_ELEMENTO_ABAIXO, atual: createElemento(d) });
          expect(state.revisoes?.length).to.be.equal(1);
          expect((state.revisoes![0] as RevisaoElemento).elementoAntesRevisao).to.be.undefined;
          const d2 = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc3')!;
          expect(d2.texto).to.be.equal('texto inciso novo;');
        });
      });

      describe('Movendo dispositivo adicionado para baixo e removendo dispositivo', () => {
        it('Deveria não possuir revisão', () => {
          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!;
          state = elementoReducer(state, { type: MOVER_ELEMENTO_ABAIXO, atual: createElemento(d) });
          expect(state.revisoes?.length).to.be.equal(1);
          expect((state.revisoes![0] as RevisaoElemento).elementoAntesRevisao).to.be.undefined;

          state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: createElemento(d) });
          expect(state.revisoes?.length).to.be.equal(0);
        });
      });
    });
  });
});
