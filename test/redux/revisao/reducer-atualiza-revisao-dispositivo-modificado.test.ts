import { ATUALIZAR_USUARIO } from './../../../src/model/lexml/acao/atualizarUsuarioAction';
import { StateType } from './../../../src/redux/state';
import { State } from '../../../src/redux/state';
import { MPV_905_2019 } from '../../doc/mpv_905_2019';
import { expect } from '@open-wc/testing';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { ABRIR_ARTICULACAO } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { ATIVAR_DESATIVAR_REVISAO } from '../../../src/model/lexml/acao/ativarDesativarRevisaoAction';
import { buscaDispositivoById } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { UNDO } from '../../../src/model/lexml/acao/undoAction';
import { REDO } from '../../../src/model/lexml/acao/redoAction';
import { ATUALIZAR_TEXTO_ELEMENTO } from '../../../src/model/lexml/acao/atualizarTextoElementoAction';
import { RevisaoElemento } from '../../../src/model/revisao/revisao';
import { ADICIONAR_ELEMENTO } from '../../../src/model/lexml/acao/adicionarElementoAction';
import { REJEITAR_REVISAO } from '../../../src/model/lexml/acao/rejeitarRevisaoAction';

let state: State;

describe('Carregando texto da MPV 905/2019', () => {
  beforeEach(function () {
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_905_2019);
    state = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: projetoNorma.articulacao!, classificacao: ClassificacaoDocumento.PROJETO });
  });

  describe('Testando atualização do nome do usuário em revisão já existente', () => {
    beforeEach(function () {
      state = elementoReducer(state, { type: ATUALIZAR_USUARIO, usuario: { nome: 'Anônimo' } });
      state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });
      const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
      const e = createElemento(d);
      e.conteudo!.texto = 'texto modificado;';
      state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
    });

    it('Deveria possuir 1 revisão', () => {
      expect(state.revisoes?.length).to.be.equal(1);
    });

    it('Dispositivo "art1_par1u_inc1" deveria estar modificado', () => {
      const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
      expect(d.texto).to.be.equal('texto modificado;');
    });

    it('Nome do usuário da revisão deveria ser "Anônimo"', () => {
      expect(state.revisoes![0].usuario.nome).to.be.equal('Anônimo');
    });

    describe('Alterando nome do usuário e alterando texto do dispositivo novamente', () => {
      beforeEach(function () {
        state = elementoReducer(state, { type: ATUALIZAR_USUARIO, usuario: { nome: 'Usuário1' } });

        const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
        const e = createElemento(d);
        e.conteudo!.texto = 'texto modificado novamente;';
        state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
      });

      it('Deveria possuir 1 revisão', () => {
        expect(state.revisoes?.length).to.be.equal(1);
      });

      it('Dispositivo "art1_par1u_inc1" deveria estar modificado', () => {
        const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
        expect(d.texto).to.be.equal('texto modificado novamente;');
      });

      it('Nome do usuário da revisão deveria ser "Usuário1"', () => {
        expect(state.revisoes![0].usuario.nome).to.be.equal('Usuário1');
      });
    });
  });

  describe('Alterar dispositivo, ativar revisão, alterar dispositivo novamente, rejeitar revisão, fazer UNDO da rejeição', () => {
    beforeEach(function () {
      let d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
      let e = createElemento(d);
      e.conteudo!.texto = 'texto modificado;';
      state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });

      state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });

      d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
      e = createElemento(d);
      e.conteudo!.texto = 'texto modificado novamente;';
      state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });

      state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao: state.revisoes![0] });
      state = elementoReducer(state, { type: UNDO });
    });

    it('Deveria possuir 1 revisão', () => {
      expect(state.revisoes?.length).to.be.equal(1);
    });

    it('Deveria possuir inciso "art1_par1u_inc1" com o texto "texto modificado novamente;"', () => {
      const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
      expect(d.texto).to.be.equal('texto modificado novamente;');
    });

    it('State.ui.events deveria possuir todos os elementos "art1_par1u_inc1" com texto "texto modificado novamente;"', () => {
      const elementos = state
        .ui!.events.filter(ev => ev.stateType !== StateType.RevisaoRejeitada)
        .map(e => e.elementos || [])
        .flat()
        .filter(e => e.lexmlId === 'art1_par1u_inc1');
      expect(elementos.length).to.be.greaterThan(0);
      expect(elementos.every(e => e.conteudo?.texto === 'texto modificado novamente;')).to.be.true;
    });

    describe('Fazer REDO da rejeição', () => {
      beforeEach(function () {
        state = elementoReducer(state, { type: REDO });
      });

      it('Deveria não possuir revisão', () => {
        expect(state.revisoes?.length).to.be.equal(0);
      });

      it('Deveria possuir inciso "art1_par1u_inc1" com o texto "texto modificado;"', () => {
        const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
        expect(d.texto).to.be.equal('texto modificado;');
      });

      it('State.ui.events deveria possuir todos os elementos "art1_par1u_inc1" com texto "texto modificado;"', () => {
        const mapTextoElementos: Map<StateType, string> = new Map();
        state
          .ui!.events.filter(ev => ev.stateType !== StateType.RevisaoRejeitada)
          .forEach(ev => ev.elementos?.filter(e => e.lexmlId === 'art1_par1u_inc1').forEach(e => mapTextoElementos.set(ev.stateType, e.conteudo?.texto || '')));
        expect(mapTextoElementos.size).to.be.greaterThan(0);
        expect([...mapTextoElementos.values()].every(t => t === 'texto modificado;')).to.be.true;
      });
    });
  });

  describe('Alterar dispositivo, abandonar modificação, fazer undo 2 vezes', () => {
    beforeEach(function () {
      state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });

      const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
      const e = createElemento(d);
      e.conteudo!.texto = 'texto modificado;';
      state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
      state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao: state.revisoes![0] });
      state = elementoReducer(state, { type: UNDO });
      state = elementoReducer(state, { type: UNDO });
    });

    it('Deveria não possuir revisão', () => {
      expect(state.revisoes?.length).to.be.equal(0);
    });

    it('Deveria possuir inciso "art1_par1u_inc1" com o texto "menor aprendiz;"', () => {
      const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
      expect(d.texto).to.be.equal('menor aprendiz;');
    });

    describe('Testando os eventos', () => {
      it('State.ui deveria apresentar elemento "art1_par1u_inc1" com texto "menor aprendiz;" e sem revisão', () => {
        const elementos = state
          .ui!.events.map(e => e.elementos || [])
          .flat()
          .filter(e => e.lexmlId === 'art1_par1u_inc1');
        expect(elementos.length).to.be.greaterThan(0);
        expect(elementos.every(e => e.conteudo?.texto === 'menor aprendiz;')).to.be.true;
        expect(elementos.every(e => !e.revisao)).to.be.true;
      });
    });
  });

  describe('Alterando texto fora do modo de revisão, ativando revisão, restaurando texto', () => {
    beforeEach(function () {
      const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
      const textoOriginal = d.texto;
      const e = createElemento(d);
      e.conteudo!.texto = 'texto modificado;';
      state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
      state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });
      e.conteudo!.texto = textoOriginal;
      state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
    });

    it('Deveria possuir 1 revisão', () => {
      expect(state.revisoes?.length).to.be.equal(1);
    });

    it('Deveria apresentar inciso "art1_par1u_inc1" com o texto "menor aprendiz;"', () => {
      const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
      expect(d.texto).to.be.equal('menor aprendiz;');
    });

    describe('Rejeitando revisão', () => {
      beforeEach(function () {
        state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao: state.revisoes![0] });
      });

      it('Deveria não possuir revisão', () => {
        expect(state.revisoes?.length).to.be.equal(0);
      });

      it('Deveria apresentar inciso "art1_par1u_inc1" com o texto "texto modificado;"', () => {
        const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
        expect(d.texto).to.be.equal('texto modificado;');
      });

      describe('Fazendo UNDO da rejeição', () => {
        beforeEach(function () {
          state = elementoReducer(state, { type: UNDO });
        });

        it('Deveria possuir 1 revisão', () => {
          expect(state.revisoes?.length).to.be.equal(1);
        });

        it('Deveria apresentar inciso "art1_par1u_inc1" com o texto "menor aprendiz;"', () => {
          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
          expect(d.texto).to.be.equal('menor aprendiz;');
        });

        describe('Fazendo REDO da rejeição', () => {
          beforeEach(function () {
            state = elementoReducer(state, { type: REDO });
          });

          it('Deveria não possuir revisão', () => {
            expect(state.revisoes?.length).to.be.equal(0);
          });

          it('Deveria apresentar inciso "art1_par1u_inc1" com o texto "texto modificado;"', () => {
            const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
            expect(d.texto).to.be.equal('texto modificado;');
          });
        });
      });
    });
  });

  describe('Testando rejeição de modificação de dispositivo com texto alterado antes da revisão', () => {
    beforeEach(function () {
      const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
      const e = createElemento(d);
      e.conteudo!.texto = 'texto modificado;'; // antes era "menor aprendiz;"
      state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
    });

    it('Deveria apresentar inciso "art1_par1u_inc1" com o texto "texto modificado"', () => {
      const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
      expect(d.texto).to.be.equal('texto modificado;');
    });

    describe('Ativando modo de revisão', () => {
      beforeEach(function () {
        state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });
      });

      it('Deveria estar em revisão', () => {
        expect(state.emRevisao).to.be.true;
      });

      describe('Modificando texto do inciso "art1_par1u_inc1"', () => {
        beforeEach(function () {
          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
          const e = createElemento(d);
          e.conteudo!.texto = 'texto modificado 2;';
          state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
        });

        it('Deveria possuir 1 revisão', () => {
          expect(state.revisoes?.length).to.be.equal(1);
        });

        describe('Rejeitando revisão de modificação do inciso "art1_par1u_inc1"', () => {
          beforeEach(function () {
            state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao: state.revisoes![0] });
          });

          it('Deveria não possuir revisões', () => {
            expect(state.revisoes?.length).to.be.equal(0);
          });

          it('Deveria apresentar inciso "art1_par1u_inc1" com o texto "texto modificado;"', () => {
            const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
            expect(d.texto).to.be.equal('texto modificado;');
          });

          it('"State.ui.events" deveria possuir evento "ElementoModificado" com texto "texto modificado;"', () => {
            expect(state.ui?.events[1].elementos![0].conteudo?.texto).to.be.equal('texto modificado;');
          });
        });
      });
    });
  });

  describe('Ativando modo de revisão', () => {
    beforeEach(function () {
      state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });
    });

    it('Deveria estar em revisão', () => {
      expect(state.emRevisao).to.be.true;
    });

    describe('Modificando texto do dispositivo', () => {
      it('Deveria possuir uma revisão', () => {
        let d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
        const e = createElemento(d);
        e.conteudo!.texto = 'Texto modificado';
        state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
        d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
        expect(d.texto).to.be.equal('Texto modificado');
        expect(state.revisoes?.length).to.be.equal(1);
        expect((state.revisoes![0] as RevisaoElemento).elementoAntesRevisao?.conteudo?.texto).not.to.be.equal(e.conteudo!.texto);
      });
    });

    describe('Modificando texto do dispositivo e "redigitando" texto original', () => {
      it('Deveria não possuir revisões', () => {
        let d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
        const textoOriginal = d.texto;
        let e = createElemento(d);
        e.conteudo!.texto = 'Texto modificado';
        state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
        d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
        e = createElemento(d);
        e.conteudo!.texto = textoOriginal;
        state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
        d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
        expect(d.texto).to.be.equal(textoOriginal);
        expect(state.revisoes?.length).to.be.equal(0);
      });
    });
  });

  describe('Modificando dispositivo fora de revisão', () => {
    beforeEach(function () {
      const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
      const e = createElemento(d);
      e.conteudo!.texto = 'Texto modificado';
      state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
    });

    it('Deveria possuir inciso I, do Parágrafo único, do Art. 1º modificado', () => {
      const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
      expect(d.texto).to.be.equal('Texto modificado');
    });

    describe('Ativando revisão', () => {
      beforeEach(function () {
        state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });
      });

      it('Deveria estar em revisão', () => {
        expect(state.emRevisao).to.be.true;
      });

      describe('Testando UNDO da modificação', () => {
        it('Deveria não possuir revisões', () => {
          state = elementoReducer(state, { type: UNDO });
          expect(state.revisoes?.length).to.be.equal(0);
        });
      });

      describe('Nova alteração no texto do dispositivo', () => {
        it('Deveria possuir uma revisão', () => {
          let d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
          const e = createElemento(d);
          e.conteudo!.texto = 'Texto modificado novamente';
          state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
          d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
          expect(d.texto).to.be.equal('Texto modificado novamente');
          expect(state.revisoes?.length).to.be.equal(1);
        });
      });
    });

    describe('Modificando texto de dispositivo adicionado fora de revisão', () => {
      describe('Adicionando dispositivo', () => {
        beforeEach(function () {
          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
          state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: createElemento(d), novo: { tipo: 'Inciso' } });
          const e = createElemento(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!);
          e.conteudo!.texto = 'texto inciso 2;';
          state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
        });

        it('Deveria possuir novo inciso', () => {
          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!;
          expect(d).not.to.be.undefined;
          expect(d.texto).to.be.equal('texto inciso 2;');
        });

        describe('Ativa revisão', () => {
          beforeEach(function () {
            state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });
          });

          describe('Modificando texto do dispositivo adicionado', () => {
            it('Deveria possuir uma revisão', () => {
              let d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!;
              const e = createElemento(d);
              e.conteudo!.texto = 'texto inciso 2 modificado;';
              state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
              d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!;
              expect(state.revisoes?.length).to.be.equal(1);
              expect((state.revisoes![0] as RevisaoElemento).elementoAntesRevisao?.conteudo?.texto).to.be.equal('texto inciso 2;');
            });
          });
        });
      });
    });
  });
});
