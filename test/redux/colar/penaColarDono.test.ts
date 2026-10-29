import { expect } from '@open-wc/testing';
import { Articulacao, Artigo, Dispositivo } from '../../../src/model/dispositivo/dispositivo';
import { isPena } from '../../../src/model/dispositivo/tipo';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { ADICIONAR_ELEMENTOS_FROM_CLIPBOARD } from '../../../src/model/lexml/acao/AdicionarElementosFromClipboardAction';
import { openArticulacaoAction } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { createArticulacao, criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { buscaDispositivoById, getDispositivoAndFilhosAsLista } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { updateIdDispositivoAndFilhos } from '../../../src/model/lexml/util/idUtil';
import { adicionaElementosNaProposicaoFromClipboard } from '../../../src/redux/elemento/reducer/adicionaElementosNaProposicaoFromClipboard';
import { State, StateType } from '../../../src/redux/state';
import { TEXTO_004 } from '../../doc/textos-colar/texto_004';

let state: State;

const novo = (pai: Dispositivo, tipo: string, texto: string): Dispositivo => {
  const d = criaDispositivo(pai, tipo);
  (d as any).texto = texto;
  if (isPena(d)) d.rotulo = 'Pena –';
  return d;
};

// Art. 1º com os incisos I (com pena) e II, e o § 1º que só tem a pena.
const monta = (): Articulacao => {
  const articulacao = createArticulacao();
  const art1 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
  (art1.caput as any).texto = 'Matar alguém:';
  const inc1 = novo(art1, TipoDispositivo.inciso.tipo, 'por motivo fútil:');
  novo(art1, TipoDispositivo.inciso.tipo, 'contra criança;');
  const par1 = novo(art1, TipoDispositivo.paragrafo.tipo, 'Se o crime é culposo:');
  novo(inc1, TipoDispositivo.pena.tipo, 'multa (I).');
  novo(par1, TipoDispositivo.pena.tipo, 'prisão (§ 1º).');
  getDispositivoAndFilhosAsLista(articulacao).forEach(d => d.renumeraFilhos());
  articulacao.renumeraFilhos();
  updateIdDispositivoAndFilhos(articulacao);
  return articulacao;
};

// Reaproveita a resposta real do conversor trocando o artigo colado por um inciso.
const textoComInciso = (): any => {
  const texto = JSON.parse(JSON.stringify(TEXTO_004));
  const artigo = texto.value.projetoNorma.norma.articulacao.lXhier[0];
  artigo.name = { ...artigo.name, localPart: 'Inciso', key: '{http://www.lexml.gov.br/1.0}Inciso', string: '{http://www.lexml.gov.br/1.0}Inciso' };
  artigo.value = {
    TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
    id: 'inc1',
    rotulo: 'I –',
    p: [{ TYPE_NAME: 'br_gov_lexml__1.GenInline', content: ['colado;'] }],
  };
  return texto;
};

const cola = (id: string, texto: any, posicao = 'depois'): void => {
  const disp = buscaDispositivoById(state.articulacao!, id)!;
  state = adicionaElementosNaProposicaoFromClipboard(state, {
    type: ADICIONAR_ELEMENTOS_FROM_CLIPBOARD,
    atual: createElemento(disp),
    novo: { isDispositivoAlteracao: false, conteudo: { texto } },
    isColarSubstituindo: false,
    posicao,
  });
};

const idsDosFilhos = (id: string): string[] => buscaDispositivoById(state.articulacao!, id)!.filhos.map(f => f.id!);

describe('Colar em dono que tem pena', () => {
  beforeEach(() => {
    state = openArticulacaoAction(monta());
    state.ui = {} as any;
  });

  it('colar um inciso no parágrafo que só tem a pena cria o inciso antes da pena', () => {
    cola('art1_par1u', textoComInciso());
    expect(state.ui!.message?.descricao).to.be.undefined;
    expect(idsDosFilhos('art1_par1u')).to.deep.equal(['art1_par1u_inc1', 'art1_par1u_pena']);
    const incluidos = state.ui!.events.find(e => e.stateType === StateType.ElementoIncluido)!;
    expect(incluidos.referencia!.lexmlId).to.equal('art1_par1u');
  });

  it('colar um inciso depois do inciso que tem pena cria o irmão depois da pena do dono', () => {
    cola('art1_cpt_inc1', textoComInciso());
    expect(state.ui!.message?.descricao).to.be.undefined;
    expect(idsDosFilhos('art1_cpt_inc1')).to.deep.equal(['art1_cpt_inc1_pena']);
    expect(idsDosFilhos('art1').slice(0, 3)).to.deep.equal(['art1_cpt_inc1', 'art1_cpt_inc2', 'art1_cpt_inc3']);
    const incluidos = state.ui!.events.find(e => e.stateType === StateType.ElementoIncluido)!;
    expect(incluidos.referencia!.lexmlId).to.equal('art1_cpt_inc1_pena');
  });
});
