import { expect } from '@open-wc/testing';
import { MPV_1234_2024 } from '../../doc/mpv_1234_2024';
import { State, StateType } from '../../../src/redux/state';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { ABRIR_ARTICULACAO } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { ATIVAR_DESATIVAR_REVISAO } from '../../../src/model/lexml/acao/ativarDesativarRevisaoAction';
import { ADICIONAR_ELEMENTO } from '../../../src/model/lexml/acao/adicionarElementoAction';
import { ATUALIZAR_TEXTO_ELEMENTO } from '../../../src/model/lexml/acao/atualizarTextoElementoAction';
import { RENUMERAR_ELEMENTO } from '../../../src/model/lexml/acao/renumerarElementoAction';
import { MOVER_ELEMENTO_ACIMA } from '../../../src/model/lexml/acao/moverElementoAcimaAction';
import { UNDO } from '../../../src/model/lexml/acao/undoAction';
import { REDO } from '../../../src/model/lexml/acao/redoAction';
import { REJEITAR_REVISAO } from '../../../src/model/lexml/acao/rejeitarRevisaoAction';
import { ACEITAR_REVISAO } from '../../../src/model/lexml/acao/aceitarRevisaoAction';
import { buscaDispositivoById } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { isRevisaoPrincipal } from '../../../src/redux/elemento/util/revisaoUtil';
import { RevisaoElemento } from '../../../src/model/revisao/revisao';

const ART4 = 'art1_cpt_alt1_art4';
const PAR = `${ART4}_par4-1`;
const PAR_EXISTENTE = `${ART4}_par4`;

let state: State;

const principais = (): RevisaoElemento[] => state.revisoes!.filter(isRevisaoPrincipal) as RevisaoElemento[];

const operacoes = (): string[] => principais().map(r => r.revisao ?? '(sem atributo)');

const renumera = (id: string, numero: string): void => {
  state = elementoReducer(state, { type: RENUMERAR_ELEMENTO, atual: createElemento(buscaDispositivoById(state.articulacao!, id)!), novo: { numero } });
};

const alteraTexto = (id: string, texto: string): void => {
  const e = createElemento(buscaDispositivoById(state.articulacao!, id)!);
  e.conteudo!.texto = texto;
  state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
};

// Parágrafo "§ 4º-A" (criado antes do modo de revisão) com um inciso filho, em alteração de norma.
const abreDocumento = (): void => {
  const projetoNorma = buildProjetoNormaFromJsonix(MPV_1234_2024);
  state = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: projetoNorma.articulacao!, classificacao: ClassificacaoDocumento.PROJETO });
  const art4 = buscaDispositivoById(state.articulacao!, ART4)!;
  state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: createElemento(art4.filhos[1]), novo: { tipo: 'Paragrafo' } });
  const par = art4.filhos[2];
  const e = createElemento(par);
  state = elementoReducer(state, { type: RENUMERAR_ELEMENTO, atual: e, novo: { numero: '4-A' } });
  e.conteudo!.texto = 'Parágrafo A:';
  state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
  state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: createElemento(par), novo: { tipo: 'Inciso' } });
  const inciso = createElemento(par.filhos[0]);
  inciso.conteudo!.texto = 'dispositivo novo.';
  state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: inciso });
};

describe('Revisão alteracaoRotulo produzida por atualizaRevisao (MPV 1234/2024)', () => {
  beforeEach(() => {
    abreDocumento();
    state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });
  });

  it('renumeração isolada registra alteracaoRotulo com o id anterior, sem alterado', () => {
    renumera(PAR, '4-B');

    expect(operacoes()).to.deep.equal([`alteracaoRotulo;${PAR}`]);
    expect(principais()[0].descricao).to.equal('Rótulo do dispositivo foi alterado (rótulo antes era "§ 4º-A.")');
  });

  it('segunda renumeração mantém o id anterior à primeira', () => {
    renumera(PAR, '4-B');
    renumera(`${ART4}_par4-2`, '4-C');

    expect(operacoes()).to.deep.equal([`alteracaoRotulo;${PAR}`]);
  });

  it('renumerar de volta ao original remove a revisão', () => {
    renumera(PAR, '4-B');
    renumera(`${ART4}_par4-2`, '4-A');

    expect(operacoes()).to.deep.equal([]);
  });

  it('renumerar e depois alterar o texto registra alteracaoRotulo e alterado', () => {
    renumera(PAR, '4-B');
    alteraTexto(`${ART4}_par4-2`, 'Texto novo:');

    expect(operacoes()).to.deep.equal([`alteracaoRotulo;${PAR},alterado`]);
    expect(principais()[0].descricao).to.equal('Rótulo e texto do dispositivo foram alterados (rótulo antes era "§ 4º-A.")');
  });

  it('alterar o texto e depois renumerar registra alterado e alteracaoRotulo', () => {
    alteraTexto(PAR, 'Texto novo:');
    renumera(PAR, '4-B');

    expect(operacoes()).to.deep.equal([`alterado,alteracaoRotulo;${PAR}`]);
  });

  it('renumerar de volta mantém o alterado quando o texto continua diferente', () => {
    renumera(PAR, '4-B');
    alteraTexto(`${ART4}_par4-2`, 'Texto novo:');
    renumera(`${ART4}_par4-2`, '4-A');

    expect(operacoes()).to.deep.equal(['alterado']);
  });

  it('dispositivo existente na norma alterada renumerado registra alteracaoRotulo', () => {
    renumera(PAR_EXISTENTE, '9');

    expect(operacoes()).to.deep.equal([`alteracaoRotulo;${PAR_EXISTENTE}`]);
  });

  it('dispositivo criado na sessão de revisão permanece apenas adicionado', () => {
    const art4 = buscaDispositivoById(state.articulacao!, ART4)!;
    state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: createElemento(art4.filhos[1]), novo: { tipo: 'Paragrafo' } });
    const novo = art4.filhos[2];
    renumera(novo.id!, '5');

    expect(operacoes()).to.deep.equal(['adicionado']);
  });

  it('dispositivo movido e depois renumerado acumula movido e alteracaoRotulo', () => {
    state = elementoReducer(state, { type: MOVER_ELEMENTO_ACIMA, atual: createElemento(buscaDispositivoById(state.articulacao!, PAR)!) });
    const par = buscaDispositivoById(state.articulacao!, ART4)!.filhos.find(f => f.rotulo === '§ 4º-A.')!;
    renumera(par.id!, '4-B');

    expect(operacoes()).to.have.length(1);
    expect(operacoes()[0]).to.match(/^movido;\d+,alteracaoRotulo;.+$/);
  });

  it('desfazer a renumeração remove a revisão', () => {
    renumera(PAR, '4-B');
    expect(operacoes()).to.have.length(1);

    state = elementoReducer(state, { type: UNDO });

    expect(operacoes()).to.deep.equal([]);
    expect(buscaDispositivoById(state.articulacao!, PAR)!.rotulo).to.equal('§ 4º-A.');
  });

  it('refazer a renumeração recria a revisão com o id original', () => {
    renumera(PAR, '4-B');
    state = elementoReducer(state, { type: UNDO });

    state = elementoReducer(state, { type: REDO });

    expect(operacoes()).to.deep.equal([`alteracaoRotulo;${PAR}`]);
  });

  it('atualiza o lexmlId atual do snapshot depois da renumeração', () => {
    renumera(PAR, '4-B');

    expect(principais()[0].elementoAposRevisao.lexmlId).to.equal(`${ART4}_par4-2`);
  });
});

describe('Renumeração fora do modo de revisão', () => {
  it('não gera revisão', () => {
    abreDocumento();

    renumera(PAR, '4-B');

    expect(state.revisoes ?? []).to.have.length(0);
  });
});

describe('Aceitar e rejeitar a revisão alteracaoRotulo (MPV 1234/2024)', () => {
  const idDoInciso = (idParagrafo: string): string => buscaDispositivoById(state.articulacao!, idParagrafo)!.filhos[0].id!;

  const rejeita = (): void => {
    state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao: principais()[0] });
  };

  beforeEach(() => {
    abreDocumento();
    state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });
  });

  it('rejeição isolada devolve número, rótulo e id, e o id do inciso volta ao prefixo original', () => {
    const idInciso = idDoInciso(PAR);
    renumera(PAR, '4-B');
    expect(idDoInciso(`${ART4}_par4-2`)).to.match(/^art1_cpt_alt1_art4_par4-2_inc/);

    rejeita();

    const par = buscaDispositivoById(state.articulacao!, PAR)!;
    expect(par, 'parágrafo com o id original').to.not.be.undefined;
    expect(par.rotulo).to.equal('§ 4º-A.');
    expect(par.numero).to.equal('4-1');
    expect(par.filhos[0].id).to.equal(idInciso);
    expect(buscaDispositivoById(state.articulacao!, `${ART4}_par4-2`)).to.be.undefined;
    expect(operacoes()).to.deep.equal([]);
  });

  it('rejeição de alteracaoRotulo e alterado devolve rótulo e texto originais', () => {
    const textoOriginal = buscaDispositivoById(state.articulacao!, PAR)!.texto;
    renumera(PAR, '4-B');
    alteraTexto(`${ART4}_par4-2`, 'Texto novo:');
    expect(operacoes()).to.deep.equal([`alteracaoRotulo;${PAR},alterado`]);

    rejeita();

    const par = buscaDispositivoById(state.articulacao!, PAR)!;
    expect(par, 'parágrafo com o id original').to.not.be.undefined;
    expect(par.rotulo).to.equal('§ 4º-A.');
    expect(par.texto).to.equal(textoOriginal);
  });

  it('rejeição de dispositivo existente na norma devolve o rótulo anterior', () => {
    renumera(PAR_EXISTENTE, '9');
    expect(buscaDispositivoById(state.articulacao!, `${ART4}_par9`)).to.not.be.undefined;

    rejeita();

    expect(buscaDispositivoById(state.articulacao!, PAR_EXISTENTE)).to.not.be.undefined;
    expect(buscaDispositivoById(state.articulacao!, `${ART4}_par9`)).to.be.undefined;
  });

  it('rejeição emite o parágrafo em Modificado e o inciso em Situação, para o editor redesenhar', () => {
    renumera(PAR, '4-B');

    rejeita();

    const eventos = state.ui!.events;
    const modificados = eventos.filter(ev => ev.stateType === StateType.ElementoModificado).flatMap(ev => ev.elementos ?? []);
    const situacao = eventos.filter(ev => ev.stateType === StateType.SituacaoElementoModificada).flatMap(ev => ev.elementos ?? []);
    expect(modificados.map(e => e.lexmlId)).to.include(PAR);
    expect(situacao.some(e => e.lexmlId?.startsWith(`${PAR}_inc`))).to.be.true;
  });

  it('desfazer e refazer a rejeição alternam o rótulo', () => {
    renumera(PAR, '4-B');
    rejeita();

    state = elementoReducer(state, { type: UNDO });
    expect(buscaDispositivoById(state.articulacao!, `${ART4}_par4-2`)?.rotulo, 'depois de desfazer a rejeição').to.equal('§ 4º-B.');

    state = elementoReducer(state, { type: REDO });
    expect(buscaDispositivoById(state.articulacao!, PAR)?.rotulo, 'depois de refazer a rejeição').to.equal('§ 4º-A.');
  });

  it('aceitar mantém o rótulo e os ids atuais e remove a marca', () => {
    renumera(PAR, '4-B');
    const idInciso = idDoInciso(`${ART4}_par4-2`);

    state = elementoReducer(state, { type: ACEITAR_REVISAO, revisao: principais()[0] });

    const par = buscaDispositivoById(state.articulacao!, `${ART4}_par4-2`)!;
    expect(par.rotulo).to.equal('§ 4º-B.');
    expect(par.filhos[0].id).to.equal(idInciso);
    expect(operacoes()).to.deep.equal([]);
  });

  it('atualiza a remissão ao dispositivo renumerado ao rejeitar', () => {
    const par = buscaDispositivoById(state.articulacao!, PAR)!;
    const origem = buscaDispositivoById(state.articulacao!, `${ART4}_par4`)!;
    origem.texto = 'Conforme o § 4º-A deste artigo.';
    state.remissoes = {
      [origem.uuid!]: [{ refId: `ref_${par.uuid}`, sourceUuid: origem.uuid, targetUuid: par.uuid, targetLexmlId: par.id, textoRef: '§ 4º-A', inicio: 12 }],
    };
    renumera(PAR, '4-B');
    expect(state.remissoes![origem.uuid!][0].targetLexmlId).to.equal(`${ART4}_par4-2`);

    rejeita();

    expect(state.remissoes![origem.uuid!][0].targetLexmlId).to.equal(PAR);
  });
});
