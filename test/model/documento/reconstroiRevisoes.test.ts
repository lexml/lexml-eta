import { expect } from '@open-wc/testing';
import { State } from '../../../src/redux/state';
import { MPV_905_2019 } from '../../doc/mpv_905_2019';
import { buildProjetoNormaFromJsonix, lerRevisoesArticulacao } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { buildJsonixArticulacaoFromProjetoNorma } from '../../../src/model/lexml/documento/conversor/buildJsonixFromProjetoNorma';
import { montaRevisoesArticulacao } from '../../../src/model/lexml/documento/conversor/revisaoArticulacao';
import { reconstroiRevisoes } from '../../../src/model/lexml/documento/conversor/reconstroiRevisoes';
import { criarDocumentoArticulado } from '../../../src/model/lexml/documento/documentoArticulado';
import { aplicarRevisoesAction } from '../../../src/model/lexml/acao/aplicarRevisoes';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { ABRIR_ARTICULACAO } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { ATUALIZAR_USUARIO } from '../../../src/model/lexml/acao/atualizarUsuarioAction';
import { ATIVAR_DESATIVAR_REVISAO } from '../../../src/model/lexml/acao/ativarDesativarRevisaoAction';
import { ADICIONAR_ELEMENTO } from '../../../src/model/lexml/acao/adicionarElementoAction';
import { REMOVER_ELEMENTO } from '../../../src/model/lexml/acao/removerElementoAction';
import { ATUALIZAR_TEXTO_ELEMENTO } from '../../../src/model/lexml/acao/atualizarTextoElementoAction';
import { MOVER_ELEMENTO_ABAIXO } from '../../../src/model/lexml/acao/moverElementoAbaixoAction';
import { TAB } from '../../../src/model/lexml/acao/tabAction';
import { SHIFT_TAB } from '../../../src/model/lexml/acao/shiftTabAction';
import { MOVER_ELEMENTO_ACIMA } from '../../../src/model/lexml/acao/moverElementoAcimaAction';
import { REJEITAR_REVISAO } from '../../../src/model/lexml/acao/rejeitarRevisaoAction';
import { ACEITAR_REVISAO } from '../../../src/model/lexml/acao/aceitarRevisaoAction';
import { buscaDispositivoById } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { isRevisaoPrincipal } from '../../../src/redux/elemento/util/revisaoUtil';
import { RevisaoElemento } from '../../../src/model/revisao/revisao';

const URN = 'urn:lex:br:senado.federal:projeto.lei:2026;1';

let a: State;

const abre = (): State => {
  const projetoNorma = buildProjetoNormaFromJsonix(MPV_905_2019);
  const s = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: projetoNorma.articulacao!, classificacao: ClassificacaoDocumento.PROJETO });
  const comUsuario = elementoReducer(s, { type: ATUALIZAR_USUARIO, usuario: { nome: 'Fulano de Tal', id: 'sf:fulano', sigla: 'FT' } });
  return elementoReducer(comUsuario, { type: ATIVAR_DESATIVAR_REVISAO });
};

const elemento = (s: State, id: string): ReturnType<typeof createElemento> => createElemento(buscaDispositivoById(s.articulacao!, id)!);

const altera = (s: State, id: string, texto: string): State => {
  const e = elemento(s, id);
  e.conteudo!.texto = texto;
  return elementoReducer(s, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
};

const principais = (s: State): RevisaoElemento[] => s.revisoes!.filter(isRevisaoPrincipal) as RevisaoElemento[];

const json = (s: State): string => JSON.stringify(buildJsonixArticulacaoFromProjetoNorma(s.articulacao!));

// Estado B: a articulação salva de A, aberta de novo, com as revisões lidas do arquivo e reaplicadas.
const abreComRevisoes = (origem: State): State => {
  const documento = criarDocumentoArticulado(origem.articulacao!.projetoNorma!, URN, {}, {}, {});
  const projetoNorma = buildProjetoNormaFromJsonix(documento, true);
  const aberto = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: projetoNorma.articulacao!, classificacao: ClassificacaoDocumento.PROJETO });
  const lidas = lerRevisoesArticulacao(montaRevisoesArticulacao(origem)!);
  return elementoReducer(aberto, aplicarRevisoesAction.execute(reconstroiRevisoes(aberto.articulacao!, lidas)));
};

const resumo = (s: State): any[] => principais(s).map(r => ({ operacoes: r.revisao, stateType: r.stateType, tipo: r.elementoAposRevisao.tipo, usuario: r.usuario?.nome }));

describe('reconstroiRevisoes — revisões reabertas equivalem às da sessão (MPV 905/2019)', () => {
  beforeEach(() => {
    a = abre();
  });

  const cenarios: Array<[string, () => void]> = [
    ['dispositivo adicionado', () => (a = elementoReducer(a, { type: ADICIONAR_ELEMENTO, atual: elemento(a, 'art1_par1u_inc1'), novo: { tipo: 'Inciso' } }))],
    ['texto alterado', () => (a = altera(a, 'art1_par1u_inc1', 'texto revisado;'))],
    ['inciso movido', () => (a = elementoReducer(a, { type: MOVER_ELEMENTO_ABAIXO, atual: elemento(a, 'art1_par1u_inc1') }))],
    [
      'inciso movido e alterado',
      () => {
        a = elementoReducer(a, { type: MOVER_ELEMENTO_ABAIXO, atual: elemento(a, 'art1_par1u_inc1') });
        a = altera(a, 'art1_par1u_inc2', 'texto do movido alterado;');
      },
    ],
    ['artigo movido', () => (a = elementoReducer(a, { type: MOVER_ELEMENTO_ABAIXO, atual: elemento(a, 'art3') }))],
    ['artigo excluído', () => (a = elementoReducer(a, { type: REMOVER_ELEMENTO, atual: elemento(a, 'art2') }))],
    ['artigo com filhos excluído', () => (a = elementoReducer(a, { type: REMOVER_ELEMENTO, atual: elemento(a, 'art6') }))],
    ['inciso excluído', () => (a = elementoReducer(a, { type: REMOVER_ELEMENTO, atual: elemento(a, 'art6_cpt_inc1') }))],
    [
      'dois artigos excluídos no mesmo lugar',
      () => {
        a = elementoReducer(a, { type: REMOVER_ELEMENTO, atual: elemento(a, 'art2') });
        a = elementoReducer(a, { type: REMOVER_ELEMENTO, atual: elemento(a, 'art2') });
      },
    ],
    ['inciso transformado em alínea', () => (a = elementoReducer(a, { type: TAB, atual: elemento(a, 'art1_par1u_inc2') }))],
    ['inciso com alíneas transformado em alínea', () => (a = elementoReducer(a, { type: TAB, atual: elemento(a, 'art9_cpt_inc3') }))],
    ['alínea transformada em inciso', () => (a = elementoReducer(a, { type: SHIFT_TAB, atual: elemento(a, 'art9_cpt_inc3_ali2') }))],
    ['inciso movido para cima', () => (a = elementoReducer(a, { type: MOVER_ELEMENTO_ACIMA, atual: elemento(a, 'art1_par1u_inc3') }))],
    ['artigo da alteração excluído', () => (a = elementoReducer(a, { type: REMOVER_ELEMENTO, atual: elemento(a, 'art25_cpt_alt1_art1') }))],
  ];

  cenarios.forEach(([nome, prepara]) => {
    describe(nome, () => {
      let b: State;

      beforeEach(() => {
        prepara();
        b = abreComRevisoes(a);
      });

      it('reconstrói as mesmas revisões principais, com as mesmas operações e o mesmo usuário', () => {
        expect(resumo(b)).to.deep.equal(resumo(a));
      });

      it('mantém a mesma articulação', () => {
        expect(json(b)).to.equal(json(a));
      });

      it('rejeitar a revisão dá o mesmo resultado que na sessão original', () => {
        const rejeitadaA = elementoReducer(a, { type: REJEITAR_REVISAO, revisao: principais(a)[0] });
        const rejeitadaB = elementoReducer(b, { type: REJEITAR_REVISAO, revisao: principais(b)[0] });
        expect(json(rejeitadaB)).to.equal(json(rejeitadaA));
      });

      it('aceitar a revisão dá o mesmo resultado que na sessão original', () => {
        const aceitaA = elementoReducer(a, { type: ACEITAR_REVISAO, revisao: principais(a)[0] });
        const aceitaB = elementoReducer(b, { type: ACEITAR_REVISAO, revisao: principais(b)[0] });
        expect(json(aceitaB)).to.equal(json(aceitaA));
        expect(aceitaB.revisoes!.filter(isRevisaoPrincipal)).to.have.length(aceitaA.revisoes!.filter(isRevisaoPrincipal).length);
      });
    });
  });
});
