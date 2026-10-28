import { expect } from '@open-wc/testing';
import { Articulacao, Artigo } from '../../../src/model/dispositivo/dispositivo';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { ATIVAR_DESATIVAR_REVISAO } from '../../../src/model/lexml/acao/ativarDesativarRevisaoAction';
import { aplicarRevisoesAction } from '../../../src/model/lexml/acao/aplicarRevisoes';
import { ATUALIZAR_TEXTO_ELEMENTO } from '../../../src/model/lexml/acao/atualizarTextoElementoAction';
import { ATUALIZAR_USUARIO } from '../../../src/model/lexml/acao/atualizarUsuarioAction';
import { openArticulacaoAction } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { adicionarPenaAction, alterarRotuloPenaAction } from '../../../src/model/lexml/acao/penaAction';
import { REJEITAR_REVISAO } from '../../../src/model/lexml/acao/rejeitarRevisaoAction';
import { removerElementoAction } from '../../../src/model/lexml/acao/removerElementoAction';
import { createAlteracao, createArticulacao, criaDispositivo, criaDispositivoCabecaAlteracao } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { buildJsonixFromProjetoNorma } from '../../../src/model/lexml/documento/conversor/buildJsonixFromProjetoNorma';
import { buildProjetoNormaFromJsonix, lerRevisoesArticulacao } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { reconstroiRevisoes } from '../../../src/model/lexml/documento/conversor/reconstroiRevisoes';
import { montaRevisoesArticulacao } from '../../../src/model/lexml/documento/conversor/revisaoArticulacao';
import { buscaDispositivoById, getDispositivoAndFilhosAsLista } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { updateIdDispositivoAndFilhos } from '../../../src/model/lexml/util/idUtil';
import { RevisaoElemento } from '../../../src/model/revisao/revisao';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { State, StateType } from '../../../src/redux/state';

const URN = 'urn:lex:br:federal:lei:2026-10-19;1';
const ID_PENA = 'art1_cpt_pena';
const TEXTO_PENA = 'reclusão, de seis a vinte anos.';

let a: State;
let idPena = ID_PENA;

const monta = (): Articulacao => {
  const articulacao = createArticulacao();
  const art1 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
  (art1.caput as any).texto = 'Matar alguém:';
  const pena = criaDispositivo(art1, TipoDispositivo.pena.tipo);
  pena.rotulo = 'Pena –';
  (pena as any).texto = TEXTO_PENA;
  const art2 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
  (art2.caput as any).texto = 'Esta Lei entra em vigor na data de sua publicação.';
  getDispositivoAndFilhosAsLista(articulacao).forEach(d => d.renumeraFilhos());
  articulacao.renumeraFilhos();
  updateIdDispositivoAndFilhos(articulacao);
  return articulacao;
};

// Art. 1º com bloco de alteração (art. 213, existente, com pena no caput); o art. 2º fica fora do bloco.
const montaComBloco = (): Articulacao => {
  const articulacao = createArticulacao();
  const art1 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
  (art1.caput as any).texto = 'O Código Penal passa a vigorar com as seguintes alterações:';
  createAlteracao(art1);
  const art213 = criaDispositivoCabecaAlteracao(TipoDispositivo.artigo.tipo, art1.alteracoes!) as Artigo;
  art213.isDispositivoAlteracao = true;
  art213.numero = '213';
  art213.createRotulo(art213);
  art213.existeNaNormaAlterada = true;
  (art213.caput as any).texto = 'Constranger alguém:';
  const pena = criaDispositivo(art213, TipoDispositivo.pena.tipo);
  pena.isDispositivoAlteracao = true;
  pena.rotulo = 'Pena –';
  (pena as any).texto = TEXTO_PENA;
  pena.existeNaNormaAlterada = true;
  const art2 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
  (art2.caput as any).texto = 'Esta Lei entra em vigor.';
  getDispositivoAndFilhosAsLista(articulacao).forEach(d => d.renumeraFilhos());
  articulacao.renumeraFilhos();
  updateIdDispositivoAndFilhos(articulacao);
  return articulacao;
};

const projeto = (articulacao: Articulacao): any => ({ classificacao: 'projeto', epigrafe: { texto: '' }, ementa: { texto: '' }, preambulo: { texto: '' } as any, articulacao });

const abre = (articulacao: Articulacao): State => {
  const s = openArticulacaoAction(articulacao);
  return elementoReducer(s, { type: ATUALIZAR_USUARIO, usuario: { nome: 'Fulano de Tal', id: 'sf:fulano', sigla: 'FT' } });
};

const pena = (s: State): any => buscaDispositivoById(s.articulacao!, idPena);

const alteraTexto = (texto: string): void => {
  const e = createElemento(pena(a));
  e.conteudo!.texto = texto;
  a = elementoReducer(a, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
};

const alteraRotulo = (rotulo: string): void => {
  a = elementoReducer(a, alterarRotuloPenaAction.execute(createElemento(pena(a)), rotulo));
};

// O que vai para o arquivo passa por JSON, como no salvamento.
const salvaRevisoes = (s: State): any => JSON.parse(JSON.stringify(montaRevisoesArticulacao(s)));

// Estado B: a articulação salva de A, aberta de novo, com as revisões lidas do arquivo e reaplicadas.
const reabre = (origem: State): State => {
  const aberto = abre(buildProjetoNormaFromJsonix(buildJsonixFromProjetoNorma(projeto(origem.articulacao!), URN), true).articulacao!);
  const lidas = lerRevisoesArticulacao(salvaRevisoes(origem));
  return elementoReducer(aberto, aplicarRevisoesAction.execute(reconstroiRevisoes(aberto.articulacao!, lidas)));
};

const principais = (s: State): RevisaoElemento[] => (s.revisoes ?? []).filter(r => !(r as RevisaoElemento).idRevisaoElementoPrincipal) as RevisaoElemento[];

describe('Revisão da pena: ida e volta pelo JSONIX', () => {
  beforeEach(() => {
    a = abre(monta());
    a = elementoReducer(a, { type: ATIVAR_DESATIVAR_REVISAO });
  });

  describe('alterado', () => {
    it('grava o estado anterior da pena com rótulo e texto quando os dois mudam', () => {
      alteraRotulo('Infração –');
      alteraTexto('multa.');
      const [r] = salvaRevisoes(a).revisoesArticulacao.revisaoArticulacao;
      expect(r.refIdDispositivo).to.equal(ID_PENA);
      expect(r.revisao).to.equal('alterado');
      expect(r.pena).to.not.have.property('id');
      expect(r.pena.rotulo).to.equal('Pena –');
      expect(r.pena.p[0].content).to.deep.equal([TEXTO_PENA]);
    });

    it('só o texto mudou: o rótulo é omitido (igual ao atual)', () => {
      alteraTexto('multa.');
      const [r] = salvaRevisoes(a).revisoesArticulacao.revisaoArticulacao;
      expect(r.pena).to.not.have.property('rotulo');
      expect(r.pena.p[0].content).to.deep.equal([TEXTO_PENA]);
    });

    it('só o rótulo mudou: grava o rótulo e o texto atual', () => {
      alteraRotulo('Infração –');
      const [r] = salvaRevisoes(a).revisoesArticulacao.revisaoArticulacao;
      expect(r.revisao).to.equal('alterado');
      expect(r.pena.rotulo).to.equal('Pena –');
      expect(r.pena.p[0].content).to.deep.equal([TEXTO_PENA]);
    });

    it('lê o estado anterior da pena', () => {
      alteraRotulo('Infração –');
      alteraTexto('multa.');
      const [lida] = lerRevisoesArticulacao(salvaRevisoes(a));
      expect(lida.refIdDispositivo).to.equal(ID_PENA);
      expect(lida.rotuloAnterior).to.equal('Pena –');
      expect(lida.textoAnterior).to.equal(TEXTO_PENA);
    });

    it('lê o rótulo anterior com hífen, normalizando o separador', () => {
      alteraRotulo('Infração –');
      const revisoes = salvaRevisoes(a);
      revisoes.revisoesArticulacao.revisaoArticulacao[0].pena.rotulo = 'Medida administrativa -';
      expect(lerRevisoesArticulacao(revisoes)[0].rotuloAnterior).to.equal('Medida administrativa –');
    });

    it('reabre com a mesma revisão e a mesma descrição (rótulo e texto)', () => {
      alteraRotulo('Infração –');
      alteraTexto('multa.');
      const antes = principais(a)[0];
      const b = reabre(a);
      const depois = principais(b)[0];
      expect(principais(b)).to.have.length(1);
      expect(depois.stateType).to.equal(StateType.ElementoModificado);
      expect(depois.elementoAntesRevisao?.rotulo).to.equal('Pena –');
      expect(depois.elementoAposRevisao.rotulo).to.equal('Infração –');
      expect(depois.descricao).to.equal(antes.descricao);
      expect(depois.descricao).to.equal('Texto e rótulo do dispositivo foram alterados');
    });

    it('reabre com a descrição de só rótulo e de só texto', () => {
      alteraRotulo('Infração –');
      expect(principais(reabre(a))[0].descricao).to.equal('Rótulo do dispositivo foi alterado');

      a = abre(monta());
      a = elementoReducer(a, { type: ATIVAR_DESATIVAR_REVISAO });
      alteraTexto('multa.');
      expect(principais(reabre(a))[0].descricao).to.equal('Texto do dispositivo foi alterado');
    });

    it('rejeitar depois de reaberto restaura rótulo e texto', () => {
      alteraRotulo('Infração –');
      alteraTexto('multa.');
      let b = reabre(a);
      expect(pena(b).rotulo).to.equal('Infração –');
      b = elementoReducer(b, { type: REJEITAR_REVISAO, revisao: principais(b)[0] });
      expect(pena(b).rotulo).to.equal('Pena –');
      expect(pena(b).texto).to.equal(TEXTO_PENA);
      expect(principais(b)).to.be.empty;
    });
  });

  describe('excluido', () => {
    const excluiPena = (): void => {
      a = elementoReducer(a, removerElementoAction.execute(createElemento(pena(a)), undefined));
    };

    it('grava a pena excluída com rótulo e texto', () => {
      excluiPena();
      const [r] = salvaRevisoes(a).revisoesArticulacao.revisaoArticulacao;
      expect(r.revisao).to.equal('excluido');
      expect(r.pena.rotulo).to.equal('Pena –');
      expect(r.pena.p[0].content).to.deep.equal([TEXTO_PENA]);
      expect(r.pena.id).to.match(/^_.+-exc\d+$/);
    });

    it('lê a revisão de exclusão da pena', () => {
      excluiPena();
      const [lida] = lerRevisoesArticulacao(salvaRevisoes(a));
      expect(lida.excluido?.name.localPart).to.equal('Pena');
      expect(lida.operacoes.map(o => o.nome)).to.deep.equal(['excluido']);
    });

    it('reabre com a exclusão da pena e a descrição "Dispositivo removido"', () => {
      excluiPena();
      const b = reabre(a);
      expect(pena(b)).to.equal(undefined);
      expect(principais(b)).to.have.length(1);
      expect(principais(b)[0].stateType).to.equal(StateType.ElementoRemovido);
      expect(principais(b)[0].descricao).to.equal('Dispositivo removido');
    });

    it('rejeitar a exclusão depois de reaberto devolve a pena, com rótulo e texto, no caput do artigo', () => {
      excluiPena();
      let b = reabre(a);
      b = elementoReducer(b, { type: REJEITAR_REVISAO, revisao: principais(b)[0] });
      expect(pena(b)?.rotulo).to.equal('Pena –');
      expect(pena(b)?.texto).to.equal(TEXTO_PENA);
      expect(pena(b).pai.tipo).to.equal('Caput');
      expect(principais(b)).to.be.empty;
    });

    it('rótulo alterado fora de revisão: a pena excluída mantém o rótulo que tinha', () => {
      a = elementoReducer(a, { type: ATIVAR_DESATIVAR_REVISAO });
      alteraRotulo('Infração –');
      a = elementoReducer(a, { type: ATIVAR_DESATIVAR_REVISAO });
      excluiPena();
      let b = reabre(a);
      b = elementoReducer(b, { type: REJEITAR_REVISAO, revisao: principais(b)[0] });
      expect(pena(b)?.rotulo).to.equal('Infração –');
    });
  });

  describe('pena em bloco de alteração', () => {
    beforeEach(() => {
      idPena = 'art1_cpt_alt1_art213_cpt_pena';
      a = abre(montaComBloco());
      a = elementoReducer(a, { type: ATIVAR_DESATIVAR_REVISAO });
    });

    afterEach(() => {
      idPena = ID_PENA;
    });

    it('alterado: reabre com rótulo e texto anteriores e rejeita (a exclusão em bloco não é reconstruída: ver design.md)', () => {
      alteraRotulo('Infração –');
      alteraTexto('multa.');
      let b = reabre(a);
      expect(principais(b)).to.have.length(1);
      expect(principais(b)[0].elementoAntesRevisao?.rotulo).to.equal('Pena –');
      expect(principais(b)[0].descricao).to.equal('Texto e rótulo do dispositivo foram alterados');
      b = elementoReducer(b, { type: REJEITAR_REVISAO, revisao: principais(b)[0] });
      expect(pena(b).rotulo).to.equal('Pena –');
      expect(pena(b).texto).to.equal(TEXTO_PENA);
    });
  });
});

describe('Revisão da pena excluída do caput em artigo com parágrafos', () => {
  const montaComParagrafos = (): Articulacao => {
    const articulacao = createArticulacao();
    const art1 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
    (art1.caput as any).texto = 'Matar alguém:';
    const pena = criaDispositivo(art1, TipoDispositivo.pena.tipo);
    pena.rotulo = 'Pena –';
    (pena as any).texto = TEXTO_PENA;
    ['Se o crime é cometido:', 'Se o crime é culposo:'].forEach(texto => ((criaDispositivo(art1, TipoDispositivo.paragrafo.tipo) as any).texto = texto));
    getDispositivoAndFilhosAsLista(articulacao).forEach(d => d.renumeraFilhos());
    articulacao.renumeraFilhos();
    updateIdDispositivoAndFilhos(articulacao);
    return articulacao;
  };

  it('reaberta, a exclusão tem o mesmo anterior da sessão e não fica depois da pena adicionada no último parágrafo', () => {
    let origem = abre(montaComParagrafos());
    origem = elementoReducer(origem, { type: ATIVAR_DESATIVAR_REVISAO });
    origem = elementoReducer(origem, removerElementoAction.execute(createElemento(buscaDispositivoById(origem.articulacao!, ID_PENA)!), undefined));
    origem = elementoReducer(origem, adicionarPenaAction.execute(createElemento(buscaDispositivoById(origem.articulacao!, 'art1_par2')!), 'Pena'));

    const reaberto = reabre(origem);
    const exclusao = (reaberto.revisoes as RevisaoElemento[]).find(r => r.stateType === StateType.ElementoRemovido)!;
    const naSessao = (origem.revisoes as RevisaoElemento[]).find(r => r.stateType === StateType.ElementoRemovido)!;

    expect(exclusao.elementoAposRevisao.lexmlId).to.equal(ID_PENA);
    expect(exclusao.elementoAposRevisao.elementoAnteriorNaSequenciaDeLeitura?.lexmlId).to.equal(naSessao.elementoAposRevisao.elementoAnteriorNaSequenciaDeLeitura?.lexmlId);
    expect(
      getDispositivoAndFilhosAsLista(reaberto.articulacao!)
        .filter(d => d.tipo === 'Pena')
        .map(d => d.id)
    ).to.deep.equal(['art1_par2_pena']);
  });
});
