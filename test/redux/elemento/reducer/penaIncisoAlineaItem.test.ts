import { expect } from '@open-wc/testing';
import { Articulacao, Artigo, Dispositivo } from '../../../../src/model/dispositivo/dispositivo';
import { isPena } from '../../../../src/model/dispositivo/tipo';
import { createElemento, getDispositivoFromElemento } from '../../../../src/model/elemento/elementoUtil';
import { openArticulacaoAction } from '../../../../src/model/lexml/acao/openArticulacaoAction';
import { adicionarElementoAction, adicionarIncisoDepois } from '../../../../src/model/lexml/acao/adicionarElementoAction';
import { adicionarPenaAction, alterarRotuloPenaAction } from '../../../../src/model/lexml/acao/penaAction';
import { redoAction } from '../../../../src/model/lexml/acao/redoAction';
import { removerElementoAction } from '../../../../src/model/lexml/acao/removerElementoAction';
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
  return d;
};

// Art. 1º com os incisos I (alínea a, item 1) e II no caput, e o § 1º com o inciso I.
const monta = (): Articulacao => {
  const articulacao = createArticulacao();
  const art1 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
  (art1.caput as any).texto = 'Constranger alguém, mediante violência:';
  const inc1 = novo(art1, TipoDispositivo.inciso.tipo, 'a não exercer arte:');
  const ali1 = novo(inc1, TipoDispositivo.alinea.tipo, 'em local público:');
  novo(ali1, TipoDispositivo.item.tipo, 'à noite;');
  novo(art1, TipoDispositivo.inciso.tipo, 'a abrir ou fechar o estabelecimento:');
  const par1 = novo(art1, TipoDispositivo.paragrafo.tipo, 'Se o crime é cometido:');
  novo(par1, TipoDispositivo.inciso.tipo, 'com emprego de arma:');
  getDispositivoAndFilhosAsLista(articulacao).forEach(d => d.renumeraFilhos());
  articulacao.renumeraFilhos();
  updateIdDispositivoAndFilhos(articulacao);
  return articulacao;
};

const dispositivo = (id: string): any => buscaDispositivoById(state.articulacao!, id)!;
const penas = (): Dispositivo[] => getDispositivoAndFilhosAsLista(state.articulacao!).filter(isPena);
const idsDosFilhos = (id: string): string[] => dispositivo(id).filhos.map((f: Dispositivo) => f.id!);
const nomesDasAcoes = (id: string): string[] =>
  dispositivo(id)
    .getAcoesPossiveis(dispositivo(id))
    .map((a: any) => a.descricao);
const executa = (acao: any, id: string, rotulo?: string): void => {
  state = elementoReducer(state, acao.execute(createElemento(dispositivo(id)), rotulo));
};
const desfaz = (): void => {
  state = elementoReducer(state, UndoAction());
};
const refaz = (): void => {
  state = elementoReducer(state, redoAction());
};
const referenciaDoEvento = (): string | undefined => state.ui!.events.find(e => e.stateType === StateType.ElementoIncluido)?.referencia?.lexmlId;

const ADICIONAR = 'Adicionar pena, medida administrativa e outros';

// id do dono, id esperado da pena, filhos do dono antes da pena e referência da linha nova
const CASOS = [
  { tipo: 'Inciso', dono: 'art1_cpt_inc2', pena: 'art1_cpt_inc2_pena', filhosAntes: [] as string[], referencia: 'art1_cpt_inc2' },
  { tipo: 'Inciso com alínea', dono: 'art1_cpt_inc1', pena: 'art1_cpt_inc1_pena', filhosAntes: ['art1_cpt_inc1_ali1'], referencia: 'art1_cpt_inc1_ali1_ite1' },
  { tipo: 'Inciso de parágrafo', dono: 'art1_par1u_inc1', pena: 'art1_par1u_inc1_pena', filhosAntes: [] as string[], referencia: 'art1_par1u_inc1' },
  { tipo: 'Alínea', dono: 'art1_cpt_inc1_ali1', pena: 'art1_cpt_inc1_ali1_pena', filhosAntes: ['art1_cpt_inc1_ali1_ite1'], referencia: 'art1_cpt_inc1_ali1_ite1' },
  { tipo: 'Item', dono: 'art1_cpt_inc1_ali1_ite1', pena: 'art1_cpt_inc1_ali1_ite1_pena', filhosAntes: [] as string[], referencia: 'art1_cpt_inc1_ali1_ite1' },
];

describe('Pena de Inciso, Alínea e Item: menu', () => {
  beforeEach(() => {
    state = openArticulacaoAction(monta());
    state.ui = { events: [] } as any;
  });

  CASOS.forEach(({ tipo, dono, pena }) => {
    it(`${tipo}: oferece adicionar pena, e não oferece quando já tem pena nem quando é bloqueado`, () => {
      expect(nomesDasAcoes(dono)).to.include(ADICIONAR);
      executa(adicionarPenaAction, dono);
      expect(dispositivo(pena).rotulo).to.equal('Pena –');
      expect(nomesDasAcoes(dono)).not.to.include(ADICIONAR);
      expect(nomesDasAcoes(pena)).to.deep.equal(['Alterar rótulo', 'Remover']);
    });
  });

  it('não oferece adicionar pena em inciso bloqueado', () => {
    dispositivo('art1_cpt_inc2').bloqueado = true;
    expect(nomesDasAcoes('art1_cpt_inc2')).not.to.include(ADICIONAR);
  });
});

describe('Pena de Inciso, Alínea e Item: reducer', () => {
  beforeEach(() => {
    state = openArticulacaoAction(monta());
    state.ui = { events: [] } as any;
  });

  CASOS.forEach(({ tipo, dono, pena, filhosAntes, referencia }) => {
    describe(tipo, () => {
      it('cria a pena como último filho do dono, com a linha depois do último descendente', () => {
        executa(adicionarPenaAction, dono);
        expect(idsDosFilhos(dono)).to.deep.equal([...filhosAntes, pena]);
        expect(dispositivo(pena).pai.id).to.equal(dono);
        expect(referenciaDoEvento()).to.equal(referencia);
      });

      it('não altera a numeração dos irmãos', () => {
        const rotulosAntes = getDispositivoAndFilhosAsLista(state.articulacao!)
          .filter(d => !isPena(d))
          .map(d => d.rotulo);
        executa(adicionarPenaAction, dono);
        expect(
          getDispositivoAndFilhosAsLista(state.articulacao!)
            .filter(d => !isPena(d))
            .map(d => d.rotulo)
        ).to.deep.equal(rotulosAntes);
      });

      it('desfaz e refaz a adição, a troca de rótulo e a remoção', () => {
        executa(adicionarPenaAction, dono, 'Infração');
        executa(alterarRotuloPenaAction, pena, 'Penalidade');
        desfaz();
        expect(dispositivo(pena).rotulo).to.equal('Infração –');
        desfaz();
        expect(penas().length).to.equal(0);
        refaz();
        refaz();
        expect(dispositivo(pena).rotulo).to.equal('Penalidade –');
        expect(idsDosFilhos(dono)).to.deep.equal([...filhosAntes, pena]);

        state = elementoReducer(state, removerElementoAction.execute(createElemento(dispositivo(pena)), undefined));
        expect(penas().length).to.equal(0);
        expect(idsDosFilhos(dono)).to.deep.equal(filhosAntes);
        desfaz();
        expect(idsDosFilhos(dono)).to.deep.equal([...filhosAntes, pena]);
      });

      it('o dono nunca fica com duas penas', () => {
        executa(adicionarPenaAction, dono);
        const passos = state.past?.length ?? 0;
        executa(adicionarPenaAction, dono);
        expect(penas().length).to.equal(1);
        expect(state.past?.length ?? 0).to.equal(passos);
      });
    });
  });

  it('penas em donos irmãos (art. 197): cada inciso do caput recebe a sua, com o rótulo da primeira', () => {
    executa(adicionarPenaAction, 'art1_cpt_inc1', 'Medida Administrativa');
    executa(adicionarPenaAction, 'art1_cpt_inc2');
    expect(penas().map(p => p.id)).to.deep.equal(['art1_cpt_inc1_pena', 'art1_cpt_inc2_pena']);
    expect(penas().map(p => p.rotulo)).to.deep.equal(['Medida Administrativa –', 'Medida Administrativa –']);
    expect(idsDosFilhos('art1_cpt_inc1')).to.deep.equal(['art1_cpt_inc1_ali1', 'art1_cpt_inc1_pena']);
    expect(idsDosFilhos('art1_cpt_inc2')).to.deep.equal(['art1_cpt_inc2_pena']);
  });
});

// Caput com os incisos I (com pena), II e III (com pena): o caso do Enter no fim de um inciso que tem pena.
const montaIncisosComPenas = (): Articulacao => {
  const articulacao = createArticulacao();
  const art1 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
  (art1.caput as any).texto = 'Matar alguém:';
  const inc1 = novo(art1, TipoDispositivo.inciso.tipo, 'por motivo fútil;');
  novo(art1, TipoDispositivo.inciso.tipo, 'contra criança;');
  const inc3 = novo(art1, TipoDispositivo.inciso.tipo, 'com emprego de arma:');
  novo(inc1, TipoDispositivo.pena.tipo, 'multa (I).').rotulo = 'Pena –';
  novo(inc3, TipoDispositivo.pena.tipo, 'reclusão (III).').rotulo = 'Pena –';
  getDispositivoAndFilhosAsLista(articulacao).forEach(d => d.renumeraFilhos());
  articulacao.renumeraFilhos();
  updateIdDispositivoAndFilhos(articulacao);
  return articulacao;
};

const eventosDoTipo = (tipo: StateType): any[] => state.ui!.events.filter(e => e.stateType === tipo).flatMap(e => e.elementos ?? []);
const idsDosPenas = (): (string | undefined)[] => penas().map(p => p.id);

describe('Pena: incluir inciso depois de um inciso que tem pena', () => {
  const ESTRUTURA_ORIGINAL = ['art1_cpt_inc1', 'art1_cpt_inc2', 'art1_cpt_inc3'];
  const ESTRUTURA_NOVA = ['art1_cpt_inc1', 'art1_cpt_inc2', 'art1_cpt_inc3', 'art1_cpt_inc4'];

  beforeEach(() => {
    state = openArticulacaoAction(montaIncisosComPenas());
    state.ui = { events: [] } as any;
  });

  [
    { nome: 'ação "adicionar depois"', acao: (): void => void (state = elementoReducer(state, adicionarIncisoDepois.execute(createElemento(dispositivo('art1_cpt_inc1')), ''))) },
    { nome: 'Enter no fim do inciso', acao: (): void => void (state = elementoReducer(state, adicionarElementoAction.execute(createElemento(dispositivo('art1_cpt_inc1')), ''))) },
  ].forEach(({ nome, acao }) => {
    describe(nome, () => {
      it('cria o novo inciso II depois da pena do I, como irmão do I', () => {
        acao();
        expect(idsDosFilhos('art1')).to.deep.equal(ESTRUTURA_NOVA);
        expect(idsDosFilhos('art1_cpt_inc1')).to.deep.equal(['art1_cpt_inc1_pena']);
        expect(idsDosFilhos('art1_cpt_inc2')).to.deep.equal([]);
        expect(dispositivo('art1_cpt_inc2').rotulo).to.equal('II –');
        expect(eventosDoTipo(StateType.ElementoIncluido).map(e => e.lexmlId)).to.deep.equal(['art1_cpt_inc2']);
      });

      it('a referência do evento é a pena do I, para a linha entrar depois dela', () => {
        acao();
        expect(state.ui!.events.find(e => e.stateType === StateType.ElementoIncluido)!.referencia!.lexmlId).to.equal('art1_cpt_inc1_pena');
      });

      it('renumera os incisos seguintes e os ids das penas acompanham o dono', () => {
        acao();
        expect(dispositivo('art1_cpt_inc4').rotulo).to.equal('IV –');
        expect(idsDosFilhos('art1_cpt_inc4')).to.deep.equal(['art1_cpt_inc4_pena']);
        expect(idsDosPenas()).to.deep.equal(['art1_cpt_inc1_pena', 'art1_cpt_inc4_pena']);
        expect(dispositivo('art1_cpt_inc4_pena').rotulo).to.equal('Pena –');
        expect(dispositivo('art1_cpt_inc4_pena').texto).to.equal('reclusão (III).');
      });

      // O evento de renumeração só leva os irmãos do mesmo tipo (como já é para alíneas); a linha da pena é achada pelo uuid.
      it('o uuid da pena do antigo III continua resolvendo para ela, com o id novo', () => {
        const uuid = dispositivo('art1_cpt_inc3_pena').uuid;
        acao();
        expect(getDispositivoFromElemento(state.articulacao!, { uuid, tipo: 'Pena' } as any)?.id).to.equal('art1_cpt_inc4_pena');
      });

      it('desfazer devolve a estrutura e os ids das penas; refazer reaplica', () => {
        acao();
        desfaz();
        expect(idsDosFilhos('art1')).to.deep.equal(ESTRUTURA_ORIGINAL);
        expect(idsDosPenas()).to.deep.equal(['art1_cpt_inc1_pena', 'art1_cpt_inc3_pena']);
        expect(idsDosFilhos('art1_cpt_inc3')).to.deep.equal(['art1_cpt_inc3_pena']);
        refaz();
        expect(idsDosFilhos('art1')).to.deep.equal(ESTRUTURA_NOVA);
        expect(idsDosPenas()).to.deep.equal(['art1_cpt_inc1_pena', 'art1_cpt_inc4_pena']);
      });
    });
  });
});
