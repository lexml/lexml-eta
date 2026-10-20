import { expect } from '@open-wc/testing';
import { State } from '../../../src/redux/state';
import { MPV_905_2019 } from '../../doc/mpv_905_2019';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { ABRIR_ARTICULACAO } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { ATIVAR_DESATIVAR_REVISAO } from '../../../src/model/lexml/acao/ativarDesativarRevisaoAction';
import { ADICIONAR_ELEMENTO } from '../../../src/model/lexml/acao/adicionarElementoAction';
import { REMOVER_ELEMENTO } from '../../../src/model/lexml/acao/removerElementoAction';
import { ATUALIZAR_TEXTO_ELEMENTO } from '../../../src/model/lexml/acao/atualizarTextoElementoAction';
import { MOVER_ELEMENTO_ABAIXO } from '../../../src/model/lexml/acao/moverElementoAbaixoAction';
import { MOVER_ELEMENTO_ACIMA } from '../../../src/model/lexml/acao/moverElementoAcimaAction';
import { TAB } from '../../../src/model/lexml/acao/tabAction';
import { UNDO } from '../../../src/model/lexml/acao/undoAction';
import { REDO } from '../../../src/model/lexml/acao/redoAction';
import { REJEITAR_REVISAO } from '../../../src/model/lexml/acao/rejeitarRevisaoAction';
import { ACEITAR_REVISAO } from '../../../src/model/lexml/acao/aceitarRevisaoAction';
import { buscaDispositivoById } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { isRevisaoPrincipal } from '../../../src/redux/elemento/util/revisaoUtil';
import { RevisaoElemento } from '../../../src/model/revisao/revisao';

let state: State;

const principais = (): RevisaoElemento[] => state.revisoes!.filter(isRevisaoPrincipal) as RevisaoElemento[];

const operacoesPrincipais = (): string[] => principais().map(r => r.revisao ?? '(sem atributo)');

const elementoDe = (id: string): ReturnType<typeof createElemento> => createElemento(buscaDispositivoById(state.articulacao!, id)!);

const alteraTexto = (id: string, texto: string): void => {
  const e = elementoDe(id);
  e.conteudo!.texto = texto;
  state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
};

describe('Atributo "revisao" mantido por atualizaRevisao (MPV 905/2019)', () => {
  beforeEach(function () {
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_905_2019);
    state = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: projetoNorma.articulacao!, classificacao: ClassificacaoDocumento.PROJETO });
    state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });
  });

  describe('Operações isoladas', () => {
    it('inclusão de dispositivo registra "adicionado"', () => {
      state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: elementoDe('art1_par1u_inc1'), novo: { tipo: 'Inciso' } });
      expect(operacoesPrincipais()).to.deep.equal(['adicionado']);
    });

    it('exclusão de dispositivo registra "excluido"', () => {
      state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: elementoDe('art1_par1u_inc2') });
      expect(operacoesPrincipais()).to.deep.equal(['excluido']);
    });

    it('alteração de texto registra "alterado"', () => {
      alteraTexto('art1_par1u_inc1', 'texto alterado;');
      expect(operacoesPrincipais()).to.deep.equal(['alterado']);
    });

    it('movimentação de inciso registra "movido" com a posição original entre os irmãos (iniciando em 1)', () => {
      state = elementoReducer(state, { type: MOVER_ELEMENTO_ABAIXO, atual: elementoDe('art1_par1u_inc1') });
      expect(operacoesPrincipais()).to.deep.equal(['movido;1']);
    });

    it('movimentação de artigo registra "movido" com o sequencial entre todos os artigos', () => {
      state = elementoReducer(state, { type: MOVER_ELEMENTO_ABAIXO, atual: elementoDe('art3') });
      expect(operacoesPrincipais()).to.deep.equal(['movido;3']);
    });

    it('movimentação de artigo para outro agrupador registra o sequencial global, não a posição no pai', () => {
      const pai = buscaDispositivoById(state.articulacao!, 'art18')!.pai!;
      const ultimo = pai.filhos[pai.filhos.length - 1];
      state = elementoReducer(state, { type: MOVER_ELEMENTO_ABAIXO, atual: createElemento(ultimo) });
      expect(buscaDispositivoById(state.articulacao!, 'art18')!.pai).to.not.equal(pai);
      expect(operacoesPrincipais()).to.deep.equal(['movido;18']);
    });

    it('transformação de tipo registra "transformado" com o tipo original em minúsculas', () => {
      state = elementoReducer(state, { type: TAB, atual: elementoDe('art1_par1u_inc2') });
      expect(operacoesPrincipais()).to.deep.equal(['transformado;inciso']);
    });
  });

  describe('Operações combinadas', () => {
    it('movido e depois alterado registra "movido;1,alterado"', () => {
      state = elementoReducer(state, { type: MOVER_ELEMENTO_ABAIXO, atual: elementoDe('art1_par1u_inc1') });
      alteraTexto('art1_par1u_inc2', 'texto do movido alterado;');
      expect(operacoesPrincipais()).to.deep.equal(['movido;1,alterado']);
    });

    it('alterado e depois movido registra "alterado,movido;1" (ordem das operações)', () => {
      alteraTexto('art1_par1u_inc1', 'texto alterado antes de mover;');
      state = elementoReducer(state, { type: MOVER_ELEMENTO_ABAIXO, atual: elementoDe('art1_par1u_inc1') });
      expect(operacoesPrincipais()).to.deep.equal(['alterado,movido;1']);
    });

    it('transformado e depois alterado registra "transformado;inciso,alterado"', () => {
      state = elementoReducer(state, { type: TAB, atual: elementoDe('art1_par1u_inc2') });
      alteraTexto('art1_par1u_inc1_ali1', 'texto da alinea;');
      expect(operacoesPrincipais()).to.deep.equal(['transformado;inciso,alterado']);
    });

    it('movido duas vezes mantém uma única operação com a posição de antes da primeira movimentação', () => {
      state = elementoReducer(state, { type: MOVER_ELEMENTO_ABAIXO, atual: elementoDe('art1_par1u_inc1') });
      state = elementoReducer(state, { type: MOVER_ELEMENTO_ABAIXO, atual: elementoDe('art1_par1u_inc2') });
      expect(operacoesPrincipais()).to.deep.equal(['movido;1']);
    });

    it('adicionado e depois alterado permanece só "adicionado"', () => {
      state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: elementoDe('art1_par1u_inc1'), novo: { tipo: 'Inciso' } });
      alteraTexto('art1_par1u_inc2', 'texto do inciso novo;');
      expect(operacoesPrincipais()).to.deep.equal(['adicionado']);
    });
  });

  describe('Exclusão de dispositivo com filhos', () => {
    it('gera uma única revisão principal "excluido"; as demais revisões do grupo são de filhos', () => {
      state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: elementoDe('art1_par1u') });
      expect(operacoesPrincipais()).to.deep.equal(['excluido']);
      expect(state.revisoes!.length).to.be.greaterThan(1);
      state.revisoes!.forEach(r => expect((r as RevisaoElemento).revisao).to.equal('excluido'));
    });
  });

  describe('Reversões (reconciliação)', () => {
    it('desfazer a alteração de um dispositivo movido descarta "alterado" e mantém "movido"', () => {
      state = elementoReducer(state, { type: MOVER_ELEMENTO_ABAIXO, atual: elementoDe('art1_par1u_inc1') });
      alteraTexto('art1_par1u_inc2', 'texto do movido alterado;');
      state = elementoReducer(state, { type: UNDO });
      expect(operacoesPrincipais()).to.deep.equal(['movido;1']);
    });

    it('refazer a alteração volta a registrar "alterado" depois de "movido"', () => {
      state = elementoReducer(state, { type: MOVER_ELEMENTO_ABAIXO, atual: elementoDe('art1_par1u_inc1') });
      alteraTexto('art1_par1u_inc2', 'texto do movido alterado;');
      state = elementoReducer(state, { type: UNDO });
      state = elementoReducer(state, { type: REDO });
      expect(operacoesPrincipais()).to.deep.equal(['movido;1,alterado']);
    });

    it('desfazer a alteração de um dispositivo transformado mantém "transformado"', () => {
      state = elementoReducer(state, { type: TAB, atual: elementoDe('art1_par1u_inc2') });
      alteraTexto('art1_par1u_inc1_ali1', 'texto da alinea;');
      state = elementoReducer(state, { type: UNDO });
      expect(operacoesPrincipais()).to.deep.equal(['transformado;inciso']);
    });

    it('desfazer a movimentação elimina a revisão', () => {
      state = elementoReducer(state, { type: MOVER_ELEMENTO_ABAIXO, atual: elementoDe('art1_par1u_inc1') });
      state = elementoReducer(state, { type: UNDO });
      expect(state.revisoes!.length).to.equal(0);
    });

    it('desfazer a alteração de um dispositivo só alterado elimina a revisão', () => {
      alteraTexto('art1_par1u_inc1', 'texto alterado;');
      state = elementoReducer(state, { type: UNDO });
      expect(state.revisoes!.length).to.equal(0);
    });

    it('revisão que perdeu todas as operações (movido de volta e texto restaurado) é removida', () => {
      const textoOriginal = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!.texto;
      state = elementoReducer(state, { type: MOVER_ELEMENTO_ABAIXO, atual: elementoDe('art1_par1u_inc1') });
      alteraTexto('art1_par1u_inc2', 'texto do movido alterado;');
      state = elementoReducer(state, { type: MOVER_ELEMENTO_ACIMA, atual: elementoDe('art1_par1u_inc2') });
      expect(operacoesPrincipais()).to.deep.equal(['alterado']);
      alteraTexto('art1_par1u_inc1', textoOriginal!);
      expect(state.revisoes!.length).to.equal(0);
    });
  });

  describe('Aceitar e rejeitar', () => {
    it('aceitar a revisão a remove e mantém o texto alterado', () => {
      state = elementoReducer(state, { type: MOVER_ELEMENTO_ABAIXO, atual: elementoDe('art1_par1u_inc1') });
      alteraTexto('art1_par1u_inc2', 'texto do movido alterado;');
      state = elementoReducer(state, { type: ACEITAR_REVISAO, revisao: principais()[0] });
      expect(state.revisoes!.length).to.equal(0);
      expect(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!.texto).to.equal('texto do movido alterado;');
    });

    it('rejeitar a revisão a remove sem deixar operações pendentes', () => {
      state = elementoReducer(state, { type: MOVER_ELEMENTO_ABAIXO, atual: elementoDe('art1_par1u_inc1') });
      alteraTexto('art1_par1u_inc2', 'texto do movido alterado;');
      state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao: principais()[0] });
      expect(state.revisoes!.length).to.equal(0);
      expect(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!.texto).to.not.equal('texto do movido alterado;');
    });
  });
});
