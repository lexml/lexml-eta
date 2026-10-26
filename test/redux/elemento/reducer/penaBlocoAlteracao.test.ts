import { expect } from '@open-wc/testing';
import { Articulacao, Artigo, Dispositivo } from '../../../../src/model/dispositivo/dispositivo';
import { isPena } from '../../../../src/model/dispositivo/tipo';
import { createElemento } from '../../../../src/model/elemento/elementoUtil';
import { adicionarIncisoDepois, adicionarElementoAction } from '../../../../src/model/lexml/acao/adicionarElementoAction';
import { adicionarTextoOmissisAction } from '../../../../src/model/lexml/acao/adicionarTextoOmissisAction';
import { iniciarBlocoAlteracao } from '../../../../src/model/lexml/acao/blocoAlteracaoAction';
import { atualizarNotaAlteracaoAction } from '../../../../src/model/lexml/acao/atualizarNotaAlteracaoAction';
import { considerarElementoExistenteNaNorma, considerarElementoNovoNaNorma } from '../../../../src/model/lexml/acao/informarExistenciaDoElementoNaNormaAction';
import { openArticulacaoAction } from '../../../../src/model/lexml/acao/openArticulacaoAction';
import { adicionarPenaAction } from '../../../../src/model/lexml/acao/penaAction';
import { removerElementoAction } from '../../../../src/model/lexml/acao/removerElementoAction';
import { redoAction } from '../../../../src/model/lexml/acao/redoAction';
import { UndoAction } from '../../../../src/model/lexml/acao/undoAction';
import { TEXTO_OMISSIS } from '../../../../src/model/lexml/conteudo/textoOmissis';
import { createAlteracao, createArticulacao, criaDispositivo, criaDispositivoCabecaAlteracao } from '../../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { validaDispositivo } from '../../../../src/model/lexml/dispositivo/dispositivoValidator';
import { buildJsonixFromProjetoNorma } from '../../../../src/model/lexml/documento/conversor/buildJsonixFromProjetoNorma';
import { buildProjetoNormaFromJsonix } from '../../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { aplicarSituacaoNaNormaVigente, coletarSituacaoNaNormaVigente } from '../../../../src/model/lexml/documento/conversor/situacaoNaNormaVigente';
import { buscaDispositivoById, getDispositivoAndFilhosAsLista } from '../../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { TipoDispositivo } from '../../../../src/model/lexml/tipo/tipoDispositivo';
import { updateIdDispositivoAndFilhos } from '../../../../src/model/lexml/util/idUtil';
import { elementoReducer } from '../../../../src/redux/elemento/reducer/elementoReducer';
import { State, StateType } from '../../../../src/redux/state';

let state: State;

const ADICIONAR = 'Adicionar pena, medida administrativa e outros';

const novo = (pai: Dispositivo, tipo: string, texto: string, numero?: string): Dispositivo => {
  const d = criaDispositivo(pai, tipo);
  (d as any).texto = texto;
  d.isDispositivoAlteracao = true;
  if (isPena(d)) d.rotulo = 'Pena –';
  if (numero) {
    d.numero = numero;
    d.createRotulo(d);
  }
  return d;
};

const novoArtigoNoBloco = (art1: Artigo, numero: string, textoCaput: string): Artigo => {
  const a = criaDispositivoCabecaAlteracao(TipoDispositivo.artigo.tipo, art1.alteracoes!) as Artigo;
  a.isDispositivoAlteracao = true;
  a.numero = numero;
  a.createRotulo(a);
  (a.caput as any).texto = textoCaput;
  return a;
};

// Art. 1º com bloco de alteração (arts. 213 e 214, existentes); o art. 2º fica fora do bloco.
const monta = (textoCaput213 = 'Constranger alguém:'): Articulacao => {
  const articulacao = createArticulacao();
  const art1 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
  (art1.caput as any).texto = 'O Código Penal passa a vigorar com as seguintes alterações:';
  createAlteracao(art1);
  const art213 = novoArtigoNoBloco(art1, '213', textoCaput213);
  art213.existeNaNormaAlterada = true;
  const par = novo(art213, TipoDispositivo.paragrafo.tipo, 'Se o crime é grave:', '1');
  par.existeNaNormaAlterada = true;
  const art214 = novoArtigoNoBloco(art1, '214', 'Atentar contra o pudor:');
  art214.existeNaNormaAlterada = true;
  const art2 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
  (art2.caput as any).texto = 'Esta Lei entra em vigor.';
  getDispositivoAndFilhosAsLista(articulacao).forEach(d => d.renumeraFilhos());
  articulacao.renumeraFilhos();
  updateIdDispositivoAndFilhos(articulacao);
  return articulacao;
};

const ID_213 = 'art1_cpt_alt1_art213';
const ID_214 = 'art1_cpt_alt1_art214';

const dispositivo = (id: string): any => buscaDispositivoById(state.articulacao!, id)!;
const nomesDasAcoes = (id: string): string[] =>
  dispositivo(id)
    .getAcoesPossiveis(dispositivo(id))
    .map((a: any) => a.descricao);
const executa = (acao: any, id: string, extra?: any): void => {
  state = elementoReducer(state, acao.execute(createElemento(dispositivo(id)), extra));
};
const penas = (): Dispositivo[] => getDispositivoAndFilhosAsLista(state.articulacao!).filter(isPena);

describe('Pena em bloco de alteração: menu e criação', () => {
  beforeEach(() => {
    state = openArticulacaoAction(monta());
    state.ui = { events: [] } as any;
  });

  it('oferece adicionar pena no artigo, no parágrafo e no inciso do bloco, e não no artigo que carrega o bloco', () => {
    expect(nomesDasAcoes(ID_213)).to.include(ADICIONAR);
    expect(nomesDasAcoes(`${ID_213}_par1`)).to.include(ADICIONAR);
    expect(nomesDasAcoes('art1')).not.to.include(ADICIONAR);
  });

  it('cria a pena no caput do artigo do bloco, existente como o dono, com o rótulo informado', () => {
    executa(adicionarPenaAction, ID_213, 'Pena');
    expect(dispositivo(`${ID_213}_cpt_pena`).rotulo).to.equal('Pena –');
    const pena = dispositivo(`${ID_213}_cpt_pena`);
    expect(pena.pai.tipo).to.equal('Caput');
    expect(pena.existeNaNormaAlterada).to.equal(true);
    expect(nomesDasAcoes(ID_213)).not.to.include(ADICIONAR);
  });

  it('dono novo na norma alterada: a pena nasce nova', () => {
    dispositivo(ID_213).existeNaNormaAlterada = false;
    executa(adicionarPenaAction, ID_213, 'Pena');
    expect(dispositivo(`${ID_213}_cpt_pena`).existeNaNormaAlterada).to.equal(false);
  });

  it('caput omissis: a pena entra depois do omissis do caput', () => {
    state = openArticulacaoAction(monta(TEXTO_OMISSIS));
    state.ui = { events: [] } as any;
    expect(nomesDasAcoes(ID_213)).to.include(ADICIONAR);
    executa(adicionarPenaAction, ID_213, 'Pena');
    expect(dispositivo(ID_213).caput.filhos.map((f: Dispositivo) => f.id)).to.deep.equal([`${ID_213}_cpt_pena`]);
  });

  it('a ação chegando por outro caminho no artigo que carrega o bloco não cria pena', () => {
    const antes = penas().length;
    executa(adicionarPenaAction, 'art1', 'Pena');
    expect(penas().length).to.equal(antes);
  });

  it('desfazer e refazer', () => {
    executa(adicionarPenaAction, ID_213, 'Pena');
    state = elementoReducer(state, UndoAction());
    expect(penas().length).to.equal(0);
    state = elementoReducer(state, redoAction());
    expect(penas().length).to.equal(1);
    expect(dispositivo(`${ID_213}_cpt_pena`).existeNaNormaAlterada).to.equal(true);
  });
});

describe('Pena em bloco de alteração: menu da pena', () => {
  beforeEach(() => {
    state = openArticulacaoAction(monta());
    state.ui = { events: [] } as any;
    executa(adicionarPenaAction, ID_213, 'Pena');
  });

  it('oferece Existente/Novo, e não omissis nem mover', () => {
    const nomes = nomesDasAcoes(`${ID_213}_cpt_pena`);
    expect(nomes).to.include('Considerar novo na norma');
    expect(nomes).to.include('Remover');
    expect(nomes).to.include('Alterar rótulo');
    expect(nomes.filter(n => /omissis|^Mover|Renumerar/i.test(n))).to.deep.equal([]);
  });

  it('marcar a pena como nova e de volta como existente', () => {
    executa(considerarElementoNovoNaNorma, `${ID_213}_cpt_pena`);
    expect(dispositivo(`${ID_213}_cpt_pena`).existeNaNormaAlterada).to.equal(false);
    executa(considerarElementoExistenteNaNorma, `${ID_213}_cpt_pena`);
    expect(dispositivo(`${ID_213}_cpt_pena`).existeNaNormaAlterada).to.equal(true);
  });

  it('o dono com pena pode passar de existente para novo (a pena não tem numeração)', () => {
    executa(considerarElementoNovoNaNorma, ID_213);
    expect(dispositivo(ID_213).existeNaNormaAlterada).to.equal(false);
    expect(dispositivo(`${ID_213}_cpt_pena`).existeNaNormaAlterada).to.equal(false);
  });

  it('a pena não recebe mensagem de rótulo nem de numeração', () => {
    const mensagens = validaDispositivo(dispositivo(`${ID_213}_cpt_pena`)).map(m => m.descricao);
    expect(mensagens.filter(m => /rótulo|numer|omissis|linha pontilhada/i.test(m ?? ''))).to.deep.equal([]);
  });

  it('remover a pena do bloco', () => {
    executa(removerElementoAction, `${ID_213}_cpt_pena`, undefined);
    expect(penas().length).to.equal(0);
  });
});

describe('Pena em bloco de alteração: aspas e nota de alteração', () => {
  beforeEach(() => {
    state = openArticulacaoAction(monta());
    state.ui = { events: [] } as any;
  });

  it('a pena do último artigo do bloco fecha as aspas e leva a nota; o caput não', () => {
    executa(adicionarPenaAction, ID_214, 'Pena');
    const pena = createElemento(dispositivo(`${ID_214}_cpt_pena`));
    expect(pena.fechaAspas).to.equal(true);
    expect(pena.notaAlteracao).to.equal('NR');
    expect(pena.podeEditarNotaAlteracao).to.equal(true);
    expect(!!createElemento(dispositivo(ID_214)).fechaAspas).to.equal(false);
    expect(!!createElemento(dispositivo(`${ID_214}_cpt`)).fechaAspas).to.equal(false);
    expect(nomesDasAcoes(`${ID_214}_cpt_pena`).some(n => /nota/i.test(n))).to.equal(true);
  });

  it('a nota de alteração é editada pela linha da pena e vale para o artigo do bloco', () => {
    executa(adicionarPenaAction, ID_214, 'Pena');
    executa(atualizarNotaAlteracaoAction, `${ID_214}_cpt_pena`, 'NR');
    executa(atualizarNotaAlteracaoAction, `${ID_214}_cpt_pena`, 'AC');
    expect(dispositivo(ID_214).notaAlteracao).to.equal('AC');
    expect(createElemento(dispositivo(`${ID_214}_cpt_pena`)).notaAlteracao).to.equal('AC');
  });

  it('a pena que não é a última do bloco não fecha as aspas', () => {
    executa(adicionarPenaAction, ID_213, 'Pena');
    expect(!!createElemento(dispositivo(`${ID_213}_cpt_pena`)).fechaAspas).to.equal(false);
    expect(nomesDasAcoes(`${ID_213}_cpt_pena`).some(n => /nota/i.test(n))).to.equal(false);
  });

  it('com a pena do caput e a do parágrafo, só a do parágrafo (último do artigo) fecha as aspas', () => {
    executa(adicionarPenaAction, ID_213, 'Pena');
    executa(adicionarPenaAction, `${ID_213}_par1`, 'Pena');
    expect(!!createElemento(dispositivo(`${ID_213}_cpt_pena`)).fechaAspas).to.equal(false);
    expect(!!createElemento(dispositivo(`${ID_213}_par1_pena`)).fechaAspas).to.equal(true);
  });

  it('a linha anterior à pena do último artigo deixa de fechar as aspas', () => {
    expect(createElemento(dispositivo(`${ID_214}_cpt`)).fechaAspas ?? false).to.equal(true);
    executa(adicionarPenaAction, ID_214, 'Pena');
    expect(createElemento(dispositivo(`${ID_214}_cpt`)).fechaAspas ?? false).to.equal(false);
    expect(createElemento(dispositivo(ID_214)).fechaAspas ?? false).to.equal(false);
  });

  it('a pena no último artigo com caput omissis fecha as aspas', () => {
    state = openArticulacaoAction(monta());
    dispositivo(ID_214).caput.texto = TEXTO_OMISSIS;
    state.ui = { events: [] } as any;
    executa(adicionarPenaAction, ID_214, 'Pena');
    expect(createElemento(dispositivo(`${ID_214}_cpt_pena`)).fechaAspas).to.equal(true);
  });

  it('o evento de inclusão da pena já traz as aspas', () => {
    executa(adicionarPenaAction, ID_214, 'Pena');
    const incluido = state.ui!.events.find(e => e.stateType === StateType.ElementoIncluido)!.elementos![0];
    expect(incluido.fechaAspas).to.equal(true);
  });
});

describe('Pena em bloco de alteração: Enter, inciso e remoção', () => {
  beforeEach(() => {
    state = openArticulacaoAction(monta());
    state.ui = { events: [] } as any;
  });

  it('Enter na pena do artigo do bloco cria o parágrafo do bloco, com rótulo a informar e situação definida', () => {
    executa(adicionarPenaAction, ID_214, 'Pena');
    state.ui = { events: [] } as any;
    executa(adicionarElementoAction, `${ID_214}_cpt_pena`, '');
    const par = dispositivo(ID_214).filhos.find((f: Dispositivo) => f.tipo === 'Paragrafo');
    expect(!!par).to.equal(true);
    expect(par.existeNaNormaAlterada !== undefined).to.equal(true);
    expect(!!par.mensagens?.some((m: any) => /rótulo/i.test(m.descricao))).to.equal(true);
  });

  it('incluir inciso depois de dono com pena no bloco entra antes da pena', () => {
    novo(dispositivo(`${ID_213}_par1`), TipoDispositivo.inciso.tipo, 'primeiro:', '1').existeNaNormaAlterada = true;
    updateIdDispositivoAndFilhos(state.articulacao!);
    executa(adicionarPenaAction, `${ID_213}_par1`, 'Pena');
    executa(adicionarIncisoDepois, `${ID_213}_par1_inc1`, '');
    const filhos = dispositivo(`${ID_213}_par1`).filhos.map((f: Dispositivo) => f.tipo);
    expect(filhos).to.deep.equal(['Inciso', 'Inciso', 'Pena']);
  });
});

describe('Pena em bloco de alteração: gravação', () => {
  const projeto = (articulacao: Articulacao): any => ({ classificacao: 'projeto', epigrafe: { texto: '' }, ementa: { texto: '' }, preambulo: { texto: '' } as any, articulacao });

  // Percorre o JSONIX e devolve os valores sob a chave (value.pena) ou os elementos com o nome (Caput).
  const acha = (obj: any, chave: string, achados: any[] = []): any[] => {
    if (Array.isArray(obj)) obj.forEach(o => acha(o, chave, achados));
    else if (obj && typeof obj === 'object') {
      if (obj.name?.localPart === chave) achados.push(obj.value);
      Object.entries(obj).forEach(([k, o]) => {
        if (k === chave) achados.push(o);
        acha(o, chave, achados);
      });
    }
    return achados;
  };

  beforeEach(() => {
    state = openArticulacaoAction(monta());
    state.ui = { events: [] } as any;
    executa(adicionarPenaAction, ID_214, 'Pena');
  });

  it('a pena de último dispositivo do bloco grava fechaAspas e notaAlteracao, e só ela', () => {
    const jsonix = buildJsonixFromProjetoNorma(projeto(state.articulacao!), 'urn:lex:br:federal:lei:2026-10-19;1');
    const penas = acha(jsonix, 'pena');
    expect(penas.length).to.equal(1);
    expect(penas[0].fechaAspas).to.equal('s');
    expect(penas[0].notaAlteracao).to.equal('NR');
    const caputs = acha(jsonix, 'Caput').filter((c: any) => c.fechaAspas);
    expect(caputs.length).to.equal(0);
  });

  it('ida e volta: a pena volta no bloco, última do artigo, e a nota de alteração fica no artigo', () => {
    executa(atualizarNotaAlteracaoAction, `${ID_214}_cpt_pena`, 'AC');
    const jsonix = buildJsonixFromProjetoNorma(projeto(state.articulacao!), 'urn:lex:br:federal:lei:2026-10-19;1');
    const carregado = buildProjetoNormaFromJsonix(jsonix);
    const lista = getDispositivoAndFilhosAsLista(carregado.articulacao!);
    const pena = lista.find(isPena)!;
    expect(pena.id).to.equal(`${ID_214}_cpt_pena`);
    expect(pena.pai!.tipo).to.equal('Caput');
    expect(pena.isDispositivoAlteracao || !!pena.pai!.isDispositivoAlteracao).to.equal(true);
    expect(buscaDispositivoById(carregado.articulacao!, ID_214)!.notaAlteracao).to.equal('AC');
    expect(createElemento(pena).fechaAspas).to.equal(true);
  });

  it('a situação da pena entra em SituacaoNaNormaVigente e é reaplicada por id', () => {
    executa(considerarElementoNovoNaNorma, `${ID_214}_cpt_pena`);
    const situacao = coletarSituacaoNaNormaVigente(state.articulacao);
    expect(situacao.novos).to.include(`${ID_214}_cpt_pena`);
    expect(situacao.existentes).not.to.include(`${ID_214}_cpt_pena`);

    dispositivo(`${ID_214}_cpt_pena`).existeNaNormaAlterada = undefined;
    aplicarSituacaoNaNormaVigente(state.articulacao, situacao);
    expect(dispositivo(`${ID_214}_cpt_pena`).existeNaNormaAlterada).to.equal(false);
  });
});

describe('Pena em bloco de alteração: omissis', () => {
  it('o dono com pena deixa de oferecer converter em omissis', () => {
    state = openArticulacaoAction(monta());
    state.ui = { events: [] } as any;
    expect(nomesDasAcoes(`${ID_213}_par1`)).to.include('Omitir Parágrafos');
    executa(adicionarPenaAction, `${ID_213}_par1`, 'Pena');
    expect(nomesDasAcoes(`${ID_213}_par1`).filter(n => /omitir/i.test(n))).to.deep.equal([]);
    expect(nomesDasAcoes(`${ID_213}_par1_pena`).filter(n => /omitir|pontilhada|omissis/i.test(n))).to.deep.equal([]);
  });
});

describe('Pena em bloco de alteração: sair do bloco e omissis', () => {
  beforeEach(() => {
    state = openArticulacaoAction(monta());
    state.ui = { events: [] } as any;
  });

  it('última pena do bloco com ” (NR) e Enter cria o artigo seguinte fora do bloco', () => {
    executa(adicionarPenaAction, ID_214, 'Pena');
    const elemento = createElemento(dispositivo(`${ID_214}_cpt_pena`));
    elemento.conteudo!.texto = 'reclusão, de seis a dez anos.” (NR)';
    state = elementoReducer(state, adicionarElementoAction.execute(elemento, ''));
    const artigos = state.articulacao!.filhos.map(f => f.tipo);
    expect(artigos).to.deep.equal(['Artigo', 'Artigo', 'Artigo']);
    const novoArtigo = state.articulacao!.filhos[1];
    expect(!!novoArtigo.isDispositivoAlteracao).to.equal(false);
    expect(novoArtigo.id).to.equal('art2');
    expect(dispositivo(ID_214).filhos.every((f: Dispositivo) => f.tipo === 'Pena')).to.equal(true);
    expect(dispositivo(`${ID_214}_cpt_pena`).texto).to.contain('(NR)');
  });

  it('sem o indicador, o Enter na pena continua criando o irmão do dono dentro do bloco', () => {
    executa(adicionarPenaAction, ID_214, 'Pena');
    executa(adicionarElementoAction, `${ID_214}_cpt_pena`, '');
    expect(state.articulacao!.filhos.length).to.equal(2);
    expect(dispositivo(ID_214).filhos.some((f: Dispositivo) => f.tipo === 'Paragrafo')).to.equal(true);
  });

  it('"Adicionar alteração de norma" é oferecido na última pena e cria novo artigo-cabeça da alteração', () => {
    executa(adicionarPenaAction, ID_214, 'Pena');
    const nomes = nomesDasAcoes(`${ID_214}_cpt_pena`);
    expect(nomes).to.include('Adicionar alteração de norma');
    executa(iniciarBlocoAlteracao, `${ID_214}_cpt_pena`);
    const bloco = dispositivo('art1').alteracoes.filhos;
    expect(bloco.map((f: Dispositivo) => f.tipo)).to.deep.equal(['Artigo', 'Artigo', 'Artigo']);
    expect(state.articulacao!.filhos.length).to.equal(2);
  });

  it('a pena que não é a última do artigo não oferece "Adicionar alteração de norma"', () => {
    executa(adicionarPenaAction, ID_213, 'Pena');
    expect(nomesDasAcoes(`${ID_213}_cpt_pena`)).not.to.include('Adicionar alteração de norma');
  });

  it('omissis depois da pena: Enter na pena e "Linha pontilhada" no novo dispositivo', () => {
    executa(adicionarPenaAction, `${ID_213}_par1`, 'Pena');
    executa(adicionarElementoAction, `${ID_213}_par1_pena`, '');
    const novoPar = dispositivo(ID_213).filhos.find((f: Dispositivo) => f.id !== `${ID_213}_par1` && f.tipo === 'Paragrafo');
    expect(!!novoPar).to.equal(true);
    state = elementoReducer(state, adicionarTextoOmissisAction.execute(createElemento(novoPar)));
    const ordem = getDispositivoAndFilhosAsLista(state.articulacao!).map(d => d.id);
    expect(ordem.indexOf(`${ID_213}_par1_pena`)).to.equal(ordem.indexOf(`${ID_213}_par1`) + 1);
    expect(ordem.indexOf(novoPar.id)).to.equal(ordem.indexOf(`${ID_213}_par1_pena`) + 1);
    expect(novoPar.texto).to.equal(TEXTO_OMISSIS);
    expect(dispositivo(`${ID_213}_par1`).filhos.map((f: Dispositivo) => f.tipo)).to.deep.equal(['Pena']);
  });
});

describe('Pena em bloco de alteração: a linha que perde ou ganha as aspas é atualizada', () => {
  const elementosDeSituacao = (): any[] => state.ui!.events.filter(e => e.stateType === StateType.SituacaoElementoModificada).flatMap(e => e.elementos ?? []);
  const daPena = (): any => elementosDeSituacao().find(e => e.lexmlId === `${ID_213}_cpt_pena`);

  beforeEach(() => {
    state = openArticulacaoAction(monta());
    executa(removerElementoAction, `${ID_213}_par1`, undefined);
    executa(adicionarPenaAction, ID_213, 'Pena');
    state.ui = { events: [] } as any;
  });

  it('adicionar parágrafo pelo menu do artigo leva a pena nos eventos, sem aspas', () => {
    const dono = dispositivo(ID_213);
    const acao = dono.getAcoesPossiveis(dono).find((a: any) => a.descricao.trim().startsWith('Adicionar parágrafo'));
    state = elementoReducer(state, acao.execute(createElemento(dono), ''));
    expect(!!daPena()).to.equal(true);
    expect(!!daPena().fechaAspas).to.equal(false);
    const incluido = state.ui!.events.find(e => e.stateType === StateType.ElementoIncluido)!.elementos![0];
    expect(incluido.fechaAspas).to.equal(true);
  });

  it('remover o parágrafo que fechava o artigo devolve as aspas à pena nos eventos', () => {
    const dono = dispositivo(ID_213);
    const acao = dono.getAcoesPossiveis(dono).find((a: any) => a.descricao.trim().startsWith('Adicionar parágrafo'));
    state = elementoReducer(state, acao.execute(createElemento(dono), ''));
    const par = dono.filhos.find((f: Dispositivo) => f.tipo === 'Paragrafo');
    state.ui = { events: [] } as any;
    state = elementoReducer(state, removerElementoAction.execute(createElemento(par), undefined));
    expect(daPena().fechaAspas).to.equal(true);
    expect(daPena().notaAlteracao).to.equal('NR');
  });

  describe('desfazer e refazer', () => {
    const adicionaParagrafo = (): void => {
      const dono = dispositivo(ID_213);
      const acao = dono.getAcoesPossiveis(dono).find((a: any) => a.descricao.trim().startsWith('Adicionar parágrafo'));
      state = elementoReducer(state, acao.execute(createElemento(dono), ''));
    };
    // Último estado da pena informado pelos eventos da operação (nenhum evento = undefined).
    const penaNosEventos = (): any => {
      const todos = state.ui!.events.flatMap(e => e.elementos ?? []).filter(e => e.lexmlId === `${ID_213}_cpt_pena`);
      return todos[todos.length - 1];
    };
    const fechaComNota = (el: any): boolean => !!el?.fechaAspas && el.notaAlteracao === 'NR';

    it('desfazer a inclusão do parágrafo devolve aspas e (NR) à pena; refazer tira de novo', () => {
      adicionaParagrafo();
      state.ui = { events: [] } as any;
      state = elementoReducer(state, UndoAction());
      expect(fechaComNota(penaNosEventos())).to.equal(true);
      state.ui = { events: [] } as any;
      state = elementoReducer(state, redoAction());
      expect(!!penaNosEventos()).to.equal(true);
      expect(!!penaNosEventos().fechaAspas).to.equal(false);
    });

    it('desfazer a remoção do parágrafo tira as aspas da pena; refazer devolve', () => {
      adicionaParagrafo();
      const par = dispositivo(ID_213).filhos.find((f: Dispositivo) => f.tipo === 'Paragrafo');
      state = elementoReducer(state, removerElementoAction.execute(createElemento(par), undefined));
      state.ui = { events: [] } as any;
      state = elementoReducer(state, UndoAction());
      expect(!!penaNosEventos()).to.equal(true);
      expect(!!penaNosEventos().fechaAspas).to.equal(false);
      state.ui = { events: [] } as any;
      state = elementoReducer(state, redoAction());
      expect(fechaComNota(penaNosEventos())).to.equal(true);
    });
  });
});
