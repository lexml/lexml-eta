import { expect } from '@open-wc/testing';
import { Artigo, Dispositivo } from '../../../../src/model/dispositivo/dispositivo';
import { createElemento, createElementoValidado } from '../../../../src/model/elemento/elementoUtil';
import { ClassificacaoDocumento } from '../../../../src/model/documento/classificacao';
import { ATIVAR_DESATIVAR_REVISAO } from '../../../../src/model/lexml/acao/ativarDesativarRevisaoAction';
import { ATUALIZAR_USUARIO } from '../../../../src/model/lexml/acao/atualizarUsuarioAction';
import { autofixAction } from '../../../../src/model/lexml/acao/autoFixAction';
import { atualizarTextoElementoAction } from '../../../../src/model/lexml/acao/atualizarTextoElementoAction';
import { ABRIR_ARTICULACAO } from '../../../../src/model/lexml/acao/openArticulacaoAction';
import { redoAction } from '../../../../src/model/lexml/acao/redoAction';
import { UndoAction } from '../../../../src/model/lexml/acao/undoAction';
import { buildProjetoNormaFromJsonix } from '../../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { lerDocumentoArticulado } from '../../../../src/model/lexml/documento/documentoArticulado';
import { createAlteracao, createArticulacao, criaDispositivo, criaDispositivoCabecaAlteracao } from '../../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { TipoDispositivo } from '../../../../src/model/lexml/tipo/tipoDispositivo';
import { buildId } from '../../../../src/model/lexml/util/idUtil';
import { validarArticulacaAction } from '../../../../src/model/lexml/acao/validarArticulacaoAction';
import { registraValidacaoNumeracao } from '../../../../src/model/lexml/numeracao/validacaoNumeracao';
import { AutoFix, TipoMensagem } from '../../../../src/model/lexml/util/mensagem';
import { elementoReducer } from '../../../../src/redux/elemento/reducer/elementoReducer';
import { ALERTA_NUMERACAO_REPETIDA } from '../../../../src/redux/elemento/reducer/sincronizarNumeracaoRepetida';
import { State } from '../../../../src/redux/state';
import { novoDocumentoArticulado } from '../../../doc/documentoArticulado';

const NS = 'http://www.lexml.gov.br/1.0';
const TIPO = 'br_gov_lexml__1.DispositivoType';
const inline = (content: any[]): any => ({ TYPE_NAME: 'br_gov_lexml__1.GenInline', content });

const artigoJson = (numero: number, conteudo: any[], incisos = false): any => ({
  name: { namespaceURI: NS, localPart: 'Artigo' },
  value: {
    TYPE_NAME: TIPO,
    id: `art${numero}`,
    rotulo: `Art. ${numero}º`,
    lXcontainersOmissis: [
      {
        name: { namespaceURI: NS, localPart: 'Caput' },
        value: {
          TYPE_NAME: TIPO,
          id: `art${numero}_cpt`,
          p: [inline(conteudo)],
          ...(incisos && {
            lXcontainersOmissis: [
              { name: { namespaceURI: NS, localPart: 'Inciso' }, value: { TYPE_NAME: TIPO, id: `art${numero}_cpt_inc1`, rotulo: 'I –', p: [inline(['texto;'])] } },
            ],
          }),
        },
      },
    ],
  },
});

const remissao = (href: string, texto: string): any => ({
  name: { namespaceURI: NS, localPart: 'Remissao' },
  value: { TYPE_NAME: 'br_gov_lexml__1.Remissao', href, content: [texto] },
});

// Art. 1º (com remissão para o art. 2º), Art. 1º repetido (com inciso) e Art. 2º.
const documento = (): any => {
  const entrada = novoDocumentoArticulado();
  entrada.value.projetoNorma.norma.articulacao.lXhier = [
    artigoJson(1, ['Veja o ', remissao('art2', 'art. 2º'), '.']),
    artigoJson(1, ['Repetido.'], true),
    artigoJson(2, ['Segundo.']),
  ];
  return entrada;
};

let state: State;
const despacha = (acao: any): void => {
  state = elementoReducer(state, acao);
};
const abre = (): void => {
  const modelo = buildProjetoNormaFromJsonix(lerDocumentoArticulado(documento(), { validacaoNumeracao: 'flexivel' }), true);
  state = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: modelo.articulacao!, classificacao: ClassificacaoDocumento.NORMA });
};
const artigo = (i: number): Artigo => state.articulacao!.artigos[i] as Artigo;
const rotulos = (): string[] => state.articulacao!.artigos.map(a => a.rotulo!);
const alerta = (): boolean => !!state.ui!.alertas?.some(a => a.id === ALERTA_NUMERACAO_REPETIDA);
const MENSAGEM: any = { tipo: TipoMensagem.ERROR, descricao: AutoFix.NUMERACAO_REPETIDA, fix: true };
const corrige = (indice: number): void => despacha(autofixAction.execute(createElemento(artigo(indice)), MENSAGEM));

describe('Corrigir numeração repetida (autofix)', () => {
  beforeEach(() => registraValidacaoNumeracao('flexivel'));
  afterEach(() => registraValidacaoNumeracao(undefined));

  it('abre com a repetição e o segundo artigo repetido oferece a correção', () => {
    abre();

    expect(rotulos()).to.deep.equal(['Art. 1º', 'Art. 1º', 'Art. 2º']);
    expect(alerta()).to.equal(true);
    expect(createElementoValidado(artigo(0)).mensagens?.some(m => m.descricao === AutoFix.NUMERACAO_REPETIDA)).to.equal(false);
    expect(createElementoValidado(artigo(1)).mensagens?.find(m => m.descricao === AutoFix.NUMERACAO_REPETIDA)?.fix).to.equal(true);
  });

  it('renumera o grupo, recalcula os ids dos descendentes e retira o alerta', () => {
    abre();

    corrige(1);

    expect(rotulos()).to.deep.equal(['Art. 1º', 'Art. 2º', 'Art. 3º']);
    expect(artigo(1).id).to.equal('art2');
    expect(artigo(1).caput!.filhos[0].id).to.equal('art2_cpt_inc1');
    expect(artigo(2).id).to.equal('art3');
    expect(state.numeracaoRepetida).to.deep.equal([]);
    expect(alerta()).to.equal(false);
  });

  it('a remissão para o antigo "Art. 2º" passa a referir o "Art. 3º"', () => {
    abre();

    corrige(1);

    expect(artigo(0).caput!.texto).to.include('art. 3º');
    const alvos = Object.values(state.remissoes ?? {})
      .flat()
      .map(e => e.targetLexmlId);
    expect(alvos).to.deep.equal(['art3']);
  });

  it('desfazer devolve os dois "Art. 1º", os ids, a remissão e o alerta; refazer corrige de novo', () => {
    abre();
    corrige(1);

    despacha(UndoAction());

    expect(rotulos()).to.deep.equal(['Art. 1º', 'Art. 1º', 'Art. 2º']);
    expect(artigo(1).caput!.filhos[0].id).to.equal('art1_cpt_inc1');
    expect(artigo(2).id).to.equal('art2');
    expect(artigo(0).caput!.texto).to.include('art. 2º');
    expect(state.numeracaoRepetida).to.have.length(1);
    expect(alerta()).to.equal(true);

    despacha(redoAction());

    expect(rotulos()).to.deep.equal(['Art. 1º', 'Art. 2º', 'Art. 3º']);
    expect(artigo(1).caput!.filhos[0].id).to.equal('art2_cpt_inc1');
    expect(state.numeracaoRepetida).to.deep.equal([]);
    expect(alerta()).to.equal(false);
  });

  it('sem repetição no dispositivo, a ação não altera nada', () => {
    abre();
    const antes = rotulos();

    corrige(0);

    expect(rotulos()).to.deep.equal(antes);
    expect(alerta()).to.equal(true);
  });

  describe('em modo de revisão', () => {
    const revisoesDe = (): any[] => state.revisoes ?? [];

    it('a correção não gera revisão de alteração nos dispositivos renumerados', () => {
      abre();
      // Como no uso real, há histórico antes de ativar a revisão (desfazer até esvaziá-lo em modo de revisão já falha hoje).
      despacha(atualizarTextoElementoAction.execute({ ...createElemento(artigo(2)), conteudo: { texto: 'Segundo, editado.' } } as any));
      despacha({ type: ATUALIZAR_USUARIO, usuario: { nome: 'Fulano de Tal', id: 'sf:fulano', sigla: 'FT' } });
      despacha({ type: ATIVAR_DESATIVAR_REVISAO });
      expect(state.emRevisao).to.equal(true);

      corrige(1);
      expect(rotulos()).to.deep.equal(['Art. 1º', 'Art. 2º', 'Art. 3º']);
      expect(revisoesDe().map(r => r.revisao)).to.deep.equal([]);

      despacha(UndoAction());
      expect(rotulos()).to.deep.equal(['Art. 1º', 'Art. 1º', 'Art. 2º']);
      expect(revisoesDe().map(r => r.revisao)).to.deep.equal([]);

      despacha(redoAction());
      expect(rotulos()).to.deep.equal(['Art. 1º', 'Art. 2º', 'Art. 3º']);
      expect(revisoesDe().map(r => r.revisao)).to.deep.equal([]);
    });
  });
});

describe('Corrigir numeração repetida (autofix) em dispositivo que não é artigo', () => {
  const USUARIO = { nome: 'Fulano de Tal', id: 'sf:fulano', sigla: 'FT' };
  const alinea = (id: string): any => ({ name: { namespaceURI: NS, localPart: 'Alinea' }, value: { TYPE_NAME: TIPO, id, rotulo: 'a)', p: [inline(['alínea.'])] } });
  const incisoII = (alineas: any[] = []): any => ({
    name: { namespaceURI: NS, localPart: 'Inciso' },
    value: { TYPE_NAME: TIPO, id: 'art1_cpt_inc2', rotulo: 'II –', p: [inline(['inciso;'])], ...(alineas.length && { lXcontainersOmissis: alineas }) },
  });

  // Um artigo com três incisos "II" no caput; só o terceiro tem alínea.
  const abreComIncisos = (): void => {
    const entrada = novoDocumentoArticulado();
    const art = artigoJson(1, ['Caput:']);
    art.value.lXcontainersOmissis[0].value.lXcontainersOmissis = [incisoII(), incisoII(), incisoII([alinea('art1_cpt_inc2_ali1')])];
    entrada.value.projetoNorma.norma.articulacao.lXhier = [art];
    const modelo = buildProjetoNormaFromJsonix(lerDocumentoArticulado(entrada, { validacaoNumeracao: 'flexivel' }), true);
    state = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: modelo.articulacao!, classificacao: ClassificacaoDocumento.NORMA });
  };
  const incisos = (): Dispositivo[] => artigo(0).caput!.filhos;
  const corrigeDispositivo = (d: Dispositivo): void => despacha(autofixAction.execute(createElemento(d), MENSAGEM));

  // Artigo "Novo" num bloco de alteração, com dois parágrafos de mesmo número.
  const abreComParagrafosEmAlteracao = (): { cabeca: Artigo; paragrafos: Dispositivo[] } => {
    const articulacao = createArticulacao();
    const hospedeiro = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
    createAlteracao(hospedeiro);
    const cabeca = criaDispositivoCabecaAlteracao(TipoDispositivo.artigo.tipo, hospedeiro.alteracoes!, undefined, 0) as Artigo;
    cabeca.existeNaNormaAlterada = false;
    const paragrafos = [criaDispositivo(cabeca, TipoDispositivo.paragrafo.tipo), criaDispositivo(cabeca, TipoDispositivo.paragrafo.tipo)];
    paragrafos.forEach(p => {
      p.numero = '1';
      p.createRotulo(p);
      p.id = buildId(p);
    });
    state = { articulacao, past: [], present: [], future: [], ui: { events: [] } } as any;
    despacha(validarArticulacaAction.execute());
    return { cabeca, paragrafos };
  };

  beforeEach(() => registraValidacaoNumeracao('flexivel'));
  afterEach(() => registraValidacaoNumeracao(undefined));

  it('incisos repetidos: renumera I, II e III, recalcula a alínea descendente e desfazer devolve os três "II"', () => {
    abreComIncisos();
    expect(incisos().map(i => i.rotulo)).to.deep.equal(['II –', 'II –', 'II –']);
    expect(state.numeracaoRepetida).to.have.length(2);

    corrigeDispositivo(incisos()[1]);

    expect(incisos().map(i => i.rotulo)).to.deep.equal(['I –', 'II –', 'III –']);
    expect(incisos()[2].filhos[0].id).to.equal('art1_cpt_inc3_ali1');
    expect(state.numeracaoRepetida).to.deep.equal([]);
    expect(alerta()).to.equal(false);

    despacha(UndoAction());

    expect(incisos().map(i => i.rotulo)).to.deep.equal(['II –', 'II –', 'II –']);
    expect(incisos()[2].filhos[0].id).to.equal('art1_cpt_inc2_ali1');
    expect(state.numeracaoRepetida).to.have.length(2);
    expect(alerta()).to.equal(true);
  });

  it('parágrafos repetidos de artigo "Novo" em bloco de alteração: renumera os irmãos e desfazer restaura a repetição', () => {
    const { paragrafos } = abreComParagrafosEmAlteracao();
    expect(paragrafos.map(p => p.rotulo)).to.deep.equal(['§ 1º', '§ 1º']);
    expect(alerta()).to.equal(true);

    corrigeDispositivo(paragrafos[1]);

    expect(paragrafos.map(p => p.rotulo)).to.deep.equal(['§ 1º', '§ 2º']);
    expect(paragrafos.map(p => p.id?.slice(-4))).to.deep.equal(['par1', 'par2']);
    expect(state.numeracaoRepetida).to.deep.equal([]);
    expect(alerta()).to.equal(false);

    despacha(UndoAction());

    expect(paragrafos.map(p => p.rotulo)).to.deep.equal(['§ 1º', '§ 1º']);
    expect(state.numeracaoRepetida).to.have.length(1);
    expect(alerta()).to.equal(true);
  });

  describe('em modo de revisão', () => {
    const ativaRevisao = (): void => {
      despacha(atualizarTextoElementoAction.execute({ ...createElemento(artigo(0)), conteudo: { texto: 'Editado.' } } as any));
      despacha({ type: ATUALIZAR_USUARIO, usuario: USUARIO });
      despacha({ type: ATIVAR_DESATIVAR_REVISAO });
    };
    const marcas = (): any[] => (state.revisoes ?? []).map((r: any) => r.revisao);

    it('a correção de incisos, o desfazer e o refazer não geram revisão', () => {
      abreComIncisos();
      ativaRevisao();
      expect(state.emRevisao).to.equal(true);

      corrigeDispositivo(incisos()[1]);
      expect(marcas()).to.deep.equal([]);

      despacha(UndoAction());
      expect(marcas()).to.deep.equal([]);
      despacha(redoAction());
      expect(incisos().map(i => i.rotulo)).to.deep.equal(['I –', 'II –', 'III –']);
      expect(marcas()).to.deep.equal([]);
    });
  });
});
