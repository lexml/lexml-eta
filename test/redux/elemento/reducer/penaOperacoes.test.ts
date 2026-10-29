import { expect } from '@open-wc/testing';
import { Articulacao, Artigo, Dispositivo } from '../../../../src/model/dispositivo/dispositivo';
import { isPena } from '../../../../src/model/dispositivo/tipo';
import { createElemento } from '../../../../src/model/elemento/elementoUtil';
import { ABRIR_ARTICULACAO, openArticulacaoAction } from '../../../../src/model/lexml/acao/openArticulacaoAction';
import { ATIVAR_DESATIVAR_REVISAO } from '../../../../src/model/lexml/acao/ativarDesativarRevisaoAction';
import { ATUALIZAR_USUARIO } from '../../../../src/model/lexml/acao/atualizarUsuarioAction';
import { REJEITAR_REVISAO } from '../../../../src/model/lexml/acao/rejeitarRevisaoAction';
import { ClassificacaoDocumento } from '../../../../src/model/documento/classificacao';
import { isRevisaoPrincipal } from '../../../../src/redux/elemento/util/revisaoUtil';
import { RevisaoElemento } from '../../../../src/model/revisao/revisao';
import { transformarArtigoEmParagrafo, transformarEmOmissisAlinea, transformarParagrafoEmArtigo } from '../../../../src/model/lexml/acao/transformarElementoAction';
import { RENUMERAR_ELEMENTO } from '../../../../src/model/lexml/acao/renumerarElementoAction';
import { adicionarElementoAction, adicionarIncisoDepois, adicionarIncisoFilho } from '../../../../src/model/lexml/acao/adicionarElementoAction';
import { moverElementoAbaixoAction } from '../../../../src/model/lexml/acao/moverElementoAbaixoAction';
import { moverElementoAcimaAction } from '../../../../src/model/lexml/acao/moverElementoAcimaAction';
import { redoAction } from '../../../../src/model/lexml/acao/redoAction';
import { removerElementoAction } from '../../../../src/model/lexml/acao/removerElementoAction';
import { shiftTabAction } from '../../../../src/model/lexml/acao/shiftTabAction';
import { tabAction } from '../../../../src/model/lexml/acao/tabAction';
import { UndoAction } from '../../../../src/model/lexml/acao/undoAction';
import { createArticulacao, criaDispositivo } from '../../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { buscaDispositivoById, getDispositivoAndFilhosAsLista } from '../../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { TipoDispositivo } from '../../../../src/model/lexml/tipo/tipoDispositivo';
import { updateIdDispositivoAndFilhos } from '../../../../src/model/lexml/util/idUtil';
import { elementoReducer } from '../../../../src/redux/elemento/reducer/elementoReducer';
import { State, StateType } from '../../../../src/redux/state';

let state: State;

const novo = (pai: Dispositivo, tipo: string, texto: string): Dispositivo => {
  const d = criaDispositivo(pai, tipo);
  (d as any).texto = texto;
  if (isPena(d)) d.rotulo = 'Pena –';
  return d;
};

// Art. 1º (caput com os incisos I e II, o II com a alínea a), § 1º com os incisos I e II, § 2º e § 3º.
// Com pena: no inciso I do caput, no § 1º e no § 2º.
const monta = (comPena: boolean): Articulacao => {
  const articulacao = createArticulacao();
  const art1 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
  (art1.caput as any).texto = 'Matar alguém:';
  const inc1 = novo(art1, TipoDispositivo.inciso.tipo, 'por motivo fútil;');
  const inc2 = novo(art1, TipoDispositivo.inciso.tipo, 'contra criança:');
  novo(inc2, TipoDispositivo.alinea.tipo, 'com arma;');
  const par1 = novo(art1, TipoDispositivo.paragrafo.tipo, 'Se o crime é culposo:');
  novo(par1, TipoDispositivo.inciso.tipo, 'no trânsito;');
  novo(par1, TipoDispositivo.inciso.tipo, 'com arma de fogo:');
  const par2 = novo(art1, TipoDispositivo.paragrafo.tipo, 'Se o crime é doloso:');
  novo(art1, TipoDispositivo.paragrafo.tipo, 'Outro texto.');
  if (comPena) {
    novo(inc1, TipoDispositivo.pena.tipo, 'multa (I).');
    novo(par1, TipoDispositivo.pena.tipo, 'prisão (§ 1º).');
    novo(par2, TipoDispositivo.pena.tipo, 'reclusão (§ 2º).');
  }
  getDispositivoAndFilhosAsLista(articulacao).forEach(d => d.renumeraFilhos());
  articulacao.renumeraFilhos();
  updateIdDispositivoAndFilhos(articulacao);
  return articulacao;
};

const dispositivo = (id: string): any => buscaDispositivoById(state.articulacao!, id)!;
const estrutura = (): string[] => getDispositivoAndFilhosAsLista(state.articulacao!).map(d => `${d.id}|${d.rotulo ?? ''}`);
const idsDosFilhos = (id: string): string[] => dispositivo(id).filhos.map((f: Dispositivo) => f.id!);
const el = (id: string): any => createElemento(dispositivo(id));
const despacha = (acao: any): void => {
  state = elementoReducer(state, acao);
};
const desfaz = (): void => {
  state = elementoReducer(state, UndoAction());
};
const refaz = (): void => {
  state = elementoReducer(state, redoAction());
};
const referenciaDoEvento = (): string | undefined => state.ui!.events.find(e => e.stateType === StateType.ElementoIncluido)?.referencia?.lexmlId;
const nomesDasAcoes = (id: string): string[] =>
  dispositivo(id)
    .getAcoesPossiveis(dispositivo(id))
    .map((a: any) => a.descricao);

const abre = (comPena: boolean): void => {
  state = openArticulacaoAction(monta(comPena));
  state.ui = { events: [] } as any;
};

// Desfazer volta exatamente à estrutura anterior e refazer reaplica, ids das penas incluídos.
const verificaDesfazerERefazer = (executa: () => void): void => {
  const antes = estrutura();
  executa();
  const depois = estrutura();
  desfaz();
  expect(estrutura()).to.deep.equal(antes);
  refaz();
  expect(estrutura()).to.deep.equal(depois);
};

describe('Pena: incluir filho no dono (posição "filho" e Enter em dono terminado em ":")', () => {
  [false, true].forEach(comPena => {
    describe(comPena ? 'com pena' : 'sem pena', () => {
      beforeEach(() => abre(comPena));

      it('dono sem incisos: o primeiro inciso é criado antes da pena, e a linha entra depois do dono', () => {
        despacha(adicionarIncisoFilho.execute(el('art1_par2'), ''));
        expect(idsDosFilhos('art1_par2')).to.deep.equal(comPena ? ['art1_par2_inc1', 'art1_par2_pena'] : ['art1_par2_inc1']);
        expect(referenciaDoEvento()).to.equal('art1_par2');
      });

      it('Enter no fim do dono terminado em ":" cria o primeiro filho antes da pena', () => {
        despacha(adicionarElementoAction.execute(el('art1_par2'), ''));
        expect(idsDosFilhos('art1_par2')).to.deep.equal(comPena ? ['art1_par2_inc1', 'art1_par2_pena'] : ['art1_par2_inc1']);
        expect(referenciaDoEvento()).to.equal('art1_par2');
      });

      it('dono com incisos: o novo inciso fica depois do último inciso e antes da pena, com a linha depois do último inciso', () => {
        despacha(adicionarIncisoFilho.execute(el('art1_par1'), ''));
        expect(idsDosFilhos('art1_par1')).to.deep.equal(
          comPena ? ['art1_par1_inc1', 'art1_par1_inc2', 'art1_par1_inc3', 'art1_par1_pena'] : ['art1_par1_inc1', 'art1_par1_inc2', 'art1_par1_inc3']
        );
        expect(referenciaDoEvento()).to.equal('art1_par1_inc2');
      });

      it('artigo cujo caput tem incisos: o novo inciso fica antes da pena do caput', () => {
        despacha(adicionarIncisoFilho.execute(el('art1'), ''));
        expect(idsDosFilhos('art1').slice(0, 3)).to.deep.equal(comPena ? ['art1_cpt_inc1', 'art1_cpt_inc2', 'art1_cpt_inc3'] : ['art1_cpt_inc1', 'art1_cpt_inc2', 'art1_cpt_inc3']);
        expect(referenciaDoEvento()).to.equal('art1_cpt_inc2_ali1');
      });

      it('desfazer e refazer', () => {
        verificaDesfazerERefazer(() => despacha(adicionarIncisoFilho.execute(el('art1_par1'), '')));
        verificaDesfazerERefazer(() => despacha(adicionarElementoAction.execute(el('art1_par2'), '')));
      });
    });
  });

  it('incluir depois do último inciso do dono com pena cria o inciso antes da pena', () => {
    abre(true);
    despacha(adicionarIncisoDepois.execute(el('art1_par1_inc2'), ''));
    expect(idsDosFilhos('art1_par1')).to.deep.equal(['art1_par1_inc1', 'art1_par1_inc2', 'art1_par1_inc3', 'art1_par1_pena']);
    expect(referenciaDoEvento()).to.equal('art1_par1_inc2');
  });
});

describe('Pena: mover', () => {
  beforeEach(() => abre(true));

  it('mover o inciso que tem pena leva a pena junto', () => {
    despacha(moverElementoAbaixoAction.execute(el('art1_cpt_inc1')));
    expect(dispositivo('art1_cpt_inc2').texto).to.equal('por motivo fútil;');
    expect(idsDosFilhos('art1_cpt_inc2')).to.deep.equal(['art1_cpt_inc2_pena']);
    expect(dispositivo('art1_cpt_inc2_pena').texto).to.equal('multa (I).');
  });

  it('mover o parágrafo que tem pena leva a pena junto', () => {
    despacha(moverElementoAbaixoAction.execute(el('art1_par1')));
    expect(dispositivo('art1_par2').texto).to.equal('Se o crime é culposo:');
    expect(dispositivo('art1_par2_pena').texto).to.equal('prisão (§ 1º).');
    expect(dispositivo('art1_par1_pena').texto).to.equal('reclusão (§ 2º).');
  });

  it('o último inciso de dono com pena não oferece mover para baixo e a ação, se forçada, não tem efeito', () => {
    expect(nomesDasAcoes('art1_par1_inc2')).not.to.include('Mover para baixo');
    const antes = estrutura();
    despacha(moverElementoAbaixoAction.execute(el('art1_par1_inc2')));
    expect(estrutura()).to.deep.equal(antes);
  });

  it('o primeiro inciso de dono com pena não oferece mover para cima e o do meio continua movendo dentro do dono', () => {
    expect(nomesDasAcoes('art1_par1_inc1')).not.to.include('Mover para cima');
    expect(nomesDasAcoes('art1_par1_inc2')).to.include('Mover para cima');
    despacha(moverElementoAcimaAction.execute(el('art1_par1_inc2')));
    expect(idsDosFilhos('art1_par1')).to.deep.equal(['art1_par1_inc1', 'art1_par1_inc2', 'art1_par1_pena']);
    expect(dispositivo('art1_par1_inc1').texto).to.equal('com arma de fogo:');
  });

  it('desfazer e refazer', () => {
    verificaDesfazerERefazer(() => despacha(moverElementoAbaixoAction.execute(el('art1_cpt_inc1'))));
    verificaDesfazerERefazer(() => despacha(moverElementoAbaixoAction.execute(el('art1_par1'))));
  });
});

describe('Pena: Tab e Shift+Tab no dono e nos vizinhos', () => {
  beforeEach(() => abre(true));

  it('Tab no inciso II, depois do I que tem pena, cria a alínea antes da pena do I', () => {
    despacha(tabAction(el('art1_cpt_inc2')));
    expect(idsDosFilhos('art1_cpt_inc1')).to.deep.equal(['art1_cpt_inc1_ali1', 'art1_cpt_inc1_pena']);
    expect(dispositivo('art1_cpt_inc1_ali1').texto).to.equal('contra criança:');
    expect(dispositivo('art1_cpt_inc1_pena').texto).to.equal('multa (I).');
  });

  it('Shift+Tab na alínea do inciso que tem pena cria o inciso depois do dono, e a pena fica no dono', () => {
    despacha(tabAction(el('art1_cpt_inc2')));
    despacha(shiftTabAction(el('art1_cpt_inc1_ali1')));
    expect(idsDosFilhos('art1_cpt_inc1')).to.deep.equal(['art1_cpt_inc1_pena']);
    expect(dispositivo('art1_cpt_inc2').texto).to.equal('contra criança:');
  });

  it('Tab no dono que tem pena leva a pena junto (inciso em alínea)', () => {
    despacha(tabAction(el('art1_par1_inc2')));
    expect(idsDosFilhos('art1_par1_inc1')).to.deep.equal(['art1_par1_inc1_ali1']);
    expect(idsDosFilhos('art1_par1')).to.deep.equal(['art1_par1_inc1', 'art1_par1_pena']);
  });

  it('desfazer e refazer', () => {
    verificaDesfazerERefazer(() => despacha(tabAction(el('art1_cpt_inc2'))));
  });
});

describe('Pena: remover o dono', () => {
  beforeEach(() => abre(true));

  it('remover o inciso, o parágrafo ou o artigo leva a pena junto, e desfazer a devolve', () => {
    verificaDesfazerERefazer(() => despacha(removerElementoAction.execute(el('art1_cpt_inc1'), undefined)));
    expect(getDispositivoAndFilhosAsLista(state.articulacao!).filter(isPena).length).to.equal(2);
    verificaDesfazerERefazer(() => despacha(removerElementoAction.execute(el('art1_par1'), undefined)));
    expect(getDispositivoAndFilhosAsLista(state.articulacao!).filter(isPena).length).to.equal(1);
  });
});

describe('Pena: Enter no meio do texto do dono (desmembramento)', () => {
  beforeEach(() => abre(true));

  it('o novo inciso fica com os filhos e a pena do dono desmembrado', () => {
    despacha(adicionarElementoAction.execute(el('art1_cpt_inc1'), 'segunda parte;'));
    expect(dispositivo('art1_cpt_inc2').texto).to.equal('segunda parte;');
    expect(idsDosFilhos('art1_cpt_inc2')).to.deep.equal(['art1_cpt_inc2_pena']);
    expect(idsDosFilhos('art1_cpt_inc1')).to.deep.equal([]);
  });
});

describe('Pena: rejeitar revisão que inclui ou exclui filho do dono com pena', () => {
  const abreEmRevisao = (): void => {
    state = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: monta(true), classificacao: ClassificacaoDocumento.PROJETO });
    state = elementoReducer(state, { type: ATUALIZAR_USUARIO, usuario: { nome: 'Fulano de Tal', id: 'sf:fulano', sigla: 'FT' } });
    state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });
  };
  const principais = (): RevisaoElemento[] => state.revisoes!.filter(isRevisaoPrincipal) as RevisaoElemento[];
  const rejeita = (): void => despacha({ type: REJEITAR_REVISAO, revisao: principais()[0] });

  beforeEach(abreEmRevisao);

  it('inclusão antes da pena: rejeitar remove o inciso e mantém a pena', () => {
    const antes = estrutura();
    despacha(adicionarIncisoFilho.execute(el('art1_par1'), ''));
    expect(idsDosFilhos('art1_par1')).to.deep.equal(['art1_par1_inc1', 'art1_par1_inc2', 'art1_par1_inc3', 'art1_par1_pena']);
    rejeita();
    expect(estrutura()).to.deep.equal(antes);
  });

  it('exclusão de inciso antes da pena: rejeitar o devolve antes da pena', () => {
    const antes = estrutura();
    despacha(removerElementoAction.execute(el('art1_par1_inc2'), undefined));
    expect(idsDosFilhos('art1_par1')).to.deep.equal(['art1_par1_inc1', 'art1_par1_pena']);
    rejeita();
    expect(estrutura()).to.deep.equal(antes);
  });
});

describe('Pena: transformar Parágrafo em Artigo e Artigo em Parágrafo', () => {
  // Art. 1º com um parágrafo único que tem o inciso I e a pena.
  const montaParagrafoComPena = (): Articulacao => {
    const articulacao = createArticulacao();
    const art1 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
    (art1.caput as any).texto = 'Texto.';
    const par = novo(art1, TipoDispositivo.paragrafo.tipo, 'Se o crime é cometido:');
    novo(par, TipoDispositivo.inciso.tipo, 'por motivo fútil:');
    novo(par, TipoDispositivo.pena.tipo, 'reclusão.');
    getDispositivoAndFilhosAsLista(articulacao).forEach(d => d.renumeraFilhos());
    articulacao.renumeraFilhos();
    updateIdDispositivoAndFilhos(articulacao);
    return articulacao;
  };

  beforeEach(() => {
    state = openArticulacaoAction(montaParagrafoComPena());
    state.ui = { events: [] } as any;
  });

  it('Parágrafo em Artigo: a pena passa a ser o último filho do caput do novo artigo', () => {
    despacha(transformarParagrafoEmArtigo.execute(el('art1_par1u')));
    expect(dispositivo('art2')).not.to.be.undefined;
    expect(dispositivo('art2').caput.filhos.map((f: Dispositivo) => f.id)).to.deep.equal(['art2_cpt_inc1', 'art2_cpt_pena']);
    expect(dispositivo('art2_cpt_pena').pai.tipo).to.equal('Caput');
    expect(dispositivo('art2_cpt_pena').texto).to.equal('reclusão.');
  });

  it('Artigo em Parágrafo: a pena passa a ser o último filho do parágrafo', () => {
    despacha(transformarParagrafoEmArtigo.execute(el('art1_par1u')));
    despacha(transformarArtigoEmParagrafo.execute(el('art2')));
    const par = getDispositivoAndFilhosAsLista(state.articulacao!).find(d => d.tipo === 'Paragrafo')!;
    expect(par.filhos.map(f => f.tipo)).to.deep.equal(['Inciso', 'Pena']);
    expect(par.filhos[1].texto).to.equal('reclusão.');
  });

  it('desfazer e refazer, nos dois sentidos', () => {
    verificaDesfazerERefazer(() => despacha(transformarParagrafoEmArtigo.execute(el('art1_par1u'))));
    verificaDesfazerERefazer(() => despacha(transformarArtigoEmParagrafo.execute(el('art2'))));
  });
});

describe('Pena: Tab e Shift+Tab no dono que tem pena (a pena acompanha o dono)', () => {
  // Art. 1º com o inciso I (alíneas a e b) e o inciso II; a pena fica no inciso II ou na alínea b, conforme o caso.
  const montaComPenaNo = (donoDaPena: 'inciso' | 'alinea'): Articulacao => {
    const articulacao = createArticulacao();
    const art1 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
    (art1.caput as any).texto = 'Matar alguém:';
    const inc1 = novo(art1, TipoDispositivo.inciso.tipo, 'primeiro:');
    novo(inc1, TipoDispositivo.alinea.tipo, 'alínea a:');
    const alineaB = novo(inc1, TipoDispositivo.alinea.tipo, 'alínea b:');
    const inc2 = novo(art1, TipoDispositivo.inciso.tipo, 'segundo:');
    novo(donoDaPena === 'inciso' ? inc2 : alineaB, TipoDispositivo.pena.tipo, 'multa.');
    getDispositivoAndFilhosAsLista(articulacao).forEach(d => d.renumeraFilhos());
    articulacao.renumeraFilhos();
    updateIdDispositivoAndFilhos(articulacao);
    return articulacao;
  };
  const abreCom = (donoDaPena: 'inciso' | 'alinea'): void => {
    state = openArticulacaoAction(montaComPenaNo(donoDaPena));
    state.ui = { events: [] } as any;
  };

  it('Tab no inciso que tem pena: a alínea resultante fica com a pena', () => {
    abreCom('inciso');
    despacha(tabAction(el('art1_cpt_inc2')));
    expect(idsDosFilhos('art1_cpt_inc1')).to.deep.equal(['art1_cpt_inc1_ali1', 'art1_cpt_inc1_ali2', 'art1_cpt_inc1_ali3']);
    expect(idsDosFilhos('art1_cpt_inc1_ali3')).to.deep.equal(['art1_cpt_inc1_ali3_pena']);
    expect(dispositivo('art1_cpt_inc1_ali3_pena').texto).to.equal('multa.');
    expect(dispositivo('art1_cpt_inc1_ali3_pena').rotulo).to.equal('Pena –');
  });

  it('Tab na alínea que tem pena: o item resultante (sem tipo provável de filho) mantém a pena', () => {
    abreCom('alinea');
    despacha(tabAction(el('art1_cpt_inc1_ali2')));
    expect(idsDosFilhos('art1_cpt_inc1_ali1')).to.deep.equal(['art1_cpt_inc1_ali1_ite1']);
    expect(idsDosFilhos('art1_cpt_inc1_ali1_ite1')).to.deep.equal(['art1_cpt_inc1_ali1_ite1_pena']);
    expect(dispositivo('art1_cpt_inc1_ali1_ite1_pena').texto).to.equal('multa.');
  });

  it('Shift+Tab na alínea que tem pena: o inciso resultante fica com a pena', () => {
    abreCom('alinea');
    despacha(shiftTabAction(el('art1_cpt_inc1_ali2')));
    expect(idsDosFilhos('art1_cpt_inc2')).to.deep.equal(['art1_cpt_inc2_pena']);
    expect(dispositivo('art1_cpt_inc2_pena').texto).to.equal('multa.');
  });

  it('desfazer e refazer', () => {
    abreCom('inciso');
    verificaDesfazerERefazer(() => despacha(tabAction(el('art1_cpt_inc2'))));
    abreCom('alinea');
    verificaDesfazerERefazer(() => despacha(tabAction(el('art1_cpt_inc1_ali2'))));
    abreCom('alinea');
    verificaDesfazerERefazer(() => despacha(shiftTabAction(el('art1_cpt_inc1_ali2'))));
  });
});

describe('Pena: imóvel (ações forçadas não têm efeito)', () => {
  beforeEach(() => abre(true));

  [
    { nome: 'Tab', acao: (): any => tabAction(el('art1_par1_pena')) },
    { nome: 'Shift+Tab', acao: (): any => shiftTabAction(el('art1_par1_pena')) },
    { nome: 'mover para baixo', acao: (): any => moverElementoAbaixoAction.execute(el('art1_par1_pena')) },
    { nome: 'mover para cima', acao: (): any => moverElementoAcimaAction.execute(el('art1_par1_pena')) },
    { nome: 'converter em omissis', acao: (): any => transformarEmOmissisAlinea.execute(el('art1_par1_pena')) },
    { nome: 'renumerar', acao: (): any => ({ type: RENUMERAR_ELEMENTO, atual: el('art1_par1_pena'), rotulo: 'X' }) },
  ].forEach(({ nome, acao }) => {
    it(nome, () => {
      const antes = estrutura();
      const passos = state.past?.length ?? 0;
      despacha(acao());
      expect(estrutura()).to.deep.equal(antes);
      expect(state.past?.length ?? 0).to.equal(passos);
    });
  });
});

describe('Pena: as operações dão a mesma estrutura com e sem pena (ignorando as penas)', () => {
  const semPenas = (): string[] => estrutura().filter(e => !e.split('|')[0].endsWith('_pena'));
  const operacoes: [string, () => void][] = [
    ['mover inciso do caput para baixo', () => despacha(moverElementoAbaixoAction.execute(el('art1_cpt_inc1')))],
    ['mover parágrafo para baixo', () => despacha(moverElementoAbaixoAction.execute(el('art1_par1')))],
    ['mover inciso de parágrafo para cima', () => despacha(moverElementoAcimaAction.execute(el('art1_par1_inc2')))],
    ['Tab no inciso II do caput', () => despacha(tabAction(el('art1_cpt_inc2')))],
    ['Tab no inciso II do parágrafo', () => despacha(tabAction(el('art1_par1_inc2')))],
    ['remover o inciso I do caput', () => despacha(removerElementoAction.execute(el('art1_cpt_inc1'), undefined))],
    ['remover o parágrafo', () => despacha(removerElementoAction.execute(el('art1_par1'), undefined))],
    ['adicionar inciso filho do parágrafo', () => despacha(adicionarIncisoFilho.execute(el('art1_par1'), ''))],
    ['adicionar inciso depois do último inciso do parágrafo', () => despacha(adicionarIncisoDepois.execute(el('art1_par1_inc2'), ''))],
    ['Enter no fim do parágrafo terminado em dois-pontos', () => despacha(adicionarElementoAction.execute(el('art1_par2'), ''))],
  ];

  operacoes.forEach(([nome, executa]) => {
    it(nome, () => {
      abre(false);
      executa();
      const sem = semPenas();
      abre(true);
      executa();
      expect(semPenas()).to.deep.equal(sem);
    });
  });
});
