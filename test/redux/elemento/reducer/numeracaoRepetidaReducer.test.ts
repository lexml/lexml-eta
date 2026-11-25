import { expect } from '@open-wc/testing';
import { Artigo } from '../../../../src/model/dispositivo/dispositivo';
import { createElemento } from '../../../../src/model/elemento/elementoUtil';
import { ClassificacaoDocumento } from '../../../../src/model/documento/classificacao';
import { adicionarElementoAction } from '../../../../src/model/lexml/acao/adicionarElementoAction';
import { ABRIR_ARTICULACAO } from '../../../../src/model/lexml/acao/openArticulacaoAction';
import { removerElementoAction } from '../../../../src/model/lexml/acao/removerElementoAction';
import { redoAction } from '../../../../src/model/lexml/acao/redoAction';
import { moverElementoAbaixoAction } from '../../../../src/model/lexml/acao/moverElementoAbaixoAction';
import { buscaDispositivoById } from '../../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { criarDocumentoArticulado, lerDocumentoArticulado } from '../../../../src/model/lexml/documento/documentoArticulado';
import { completarRegistroRemissoes } from '../../../../src/redux/elemento/reducer/adicionaRemissaoInterna';
import { UndoAction } from '../../../../src/model/lexml/acao/undoAction';
import { validarArticulacaAction } from '../../../../src/model/lexml/acao/validarArticulacaoAction';
import { buildProjetoNormaFromJsonix } from '../../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { registraValidacaoNumeracao } from '../../../../src/model/lexml/numeracao/validacaoNumeracao';
import { AutoFix } from '../../../../src/model/lexml/util/mensagem';
import { ALERTA_NUMERACAO_REPETIDA } from '../../../../src/redux/elemento/reducer/sincronizarNumeracaoRepetida';
import { elementoReducer } from '../../../../src/redux/elemento/reducer/elementoReducer';
import { State, StateType } from '../../../../src/redux/state';
import { novoDocumentoArticulado } from '../../../doc/documentoArticulado';

const NS = 'http://www.lexml.gov.br/1.0';
const inciso = (id: string): any => ({
  name: { namespaceURI: NS, localPart: 'Inciso' },
  value: { TYPE_NAME: 'br_gov_lexml__1.DispositivoType', id, rotulo: 'I –', p: [{ TYPE_NAME: 'br_gov_lexml__1.GenInline', content: ['texto;'] }] },
});

// Dois artigos "Art. 1º" iguais; com incisos, o caput de cada um também tem dois incisos "I".
const documento = (comIncisos = false): any => {
  const entrada = novoDocumentoArticulado();
  const lXhier = entrada.value.projetoNorma.norma.articulacao.lXhier;
  lXhier[0].value.lXcontainersOmissis = [lXhier[0].value.lXcontainersOmissis[0]];
  if (comIncisos) lXhier[0].value.lXcontainersOmissis[0].value.lXcontainersOmissis = [inciso('art1_cpt_inc1'), inciso('art1_cpt_inc1')];
  lXhier.push(JSON.parse(JSON.stringify(lXhier[0])));
  return entrada;
};

let state: State;

const abre = (comIncisos = false): void => {
  const modelo = buildProjetoNormaFromJsonix(lerDocumentoArticulado(documento(comIncisos), { validacaoNumeracao: 'flexivel' }), true);
  state = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: modelo.articulacao!, classificacao: ClassificacaoDocumento.NORMA });
};

const despacha = (acao: any): void => {
  state = elementoReducer(state, acao);
};

const alertas = (): number => state.ui!.alertas!.filter(a => a.id === ALERTA_NUMERACAO_REPETIDA).length;
const artigo = (i: number): Artigo => state.articulacao!.artigos[i] as Artigo;

describe('Numeração repetida: reavaliação a cada ação (modo flexível)', () => {
  beforeEach(() => registraValidacaoNumeracao('flexivel'));
  afterEach(() => registraValidacaoNumeracao(undefined));

  it('abrir com numeração repetida produz o alerta e o conjunto', () => {
    abre();

    expect(alertas()).to.equal(1);
    expect(state.numeracaoRepetida).to.deep.equal([artigo(1).uuid]);
    expect(state.ui!.alertas!.find(a => a.id === ALERTA_NUMERACAO_REPETIDA)).to.deep.include({
      tipo: 'CRITICAL',
      mensagem: 'Existem dispositivos com numeração repetida.',
      podeFechar: false,
    });
  });

  it('incluir artigo renumera, retira o alerta e revalida o antigo segundo "Art. 1º"', () => {
    abre();
    const segundo = artigo(1).uuid;

    despacha(adicionarElementoAction.execute(createElemento(artigo(0)), ''));

    expect(state.articulacao!.artigos).to.have.length(3);
    expect(alertas()).to.equal(0);
    expect(state.numeracaoRepetida).to.deep.equal([]);
    const revalidado = state.ui!.events.find(e => e.stateType === StateType.ElementoValidado && e.elementos?.some(el => el.uuid === segundo));
    expect(revalidado, 'ElementoValidado do antigo segundo artigo').to.not.equal(undefined);
    expect(revalidado!.elementos![0].mensagens?.some(m => m.descricao === AutoFix.NUMERACAO_REPETIDA)).to.equal(false);
  });

  it('desfazer e refazer mantêm o alerta coerente com a articulação', () => {
    abre();
    despacha(adicionarElementoAction.execute(createElemento(artigo(0)), ''));
    expect(alertas()).to.equal(0);

    for (const acao of [UndoAction(), redoAction(), UndoAction()]) {
      despacha(acao);
      // A renumeração automática não recria a repetição ao desfazer: o alerta só existe com repetição de fato.
      expect(alertas()).to.equal(state.numeracaoRepetida!.length > 0 ? 1 : 0);
      expect(state.numeracaoRepetida!.length).to.equal(0);
    }
  });

  it('várias ações sem corrigir mantêm um único alerta', () => {
    abre();

    despacha(validarArticulacaAction.execute());
    despacha(validarArticulacaAction.execute());

    expect(alertas()).to.equal(1);
  });

  it('correção parcial mantém o alerta e reduz o conjunto', () => {
    abre(true);
    expect(state.numeracaoRepetida).to.have.length(3);
    const incisoRepetido = artigo(0).caput!.filhos[1];

    despacha(removerElementoAction.execute(createElemento(incisoRepetido), undefined));

    expect(state.numeracaoRepetida).to.have.length(2);
    expect(alertas()).to.equal(1);
  });

  it('no modo rígido não há alerta nem conjunto', () => {
    abre();
    registraValidacaoNumeracao('rigida');

    despacha(validarArticulacaAction.execute());

    expect(alertas()).to.equal(0);
    expect(state.numeracaoRepetida).to.deep.equal([]);
  });

  describe('robustez: remissão para artigo repetido e operações de edição', () => {
    const URN = 'urn:lex:br:senado.federal:projeto.lei;pls:9999;999999';
    const FLEXIVEL = { validacaoNumeracao: 'flexivel' as const };

    const abreComRemissao = (): void => {
      const entrada = documento();
      const lXhier = entrada.value.projetoNorma.norma.articulacao.lXhier;
      const caput = lXhier[1].value.lXcontainersOmissis[0].value;
      caput.p[0].content = [
        'Conforme o ',
        { name: { namespaceURI: NS, localPart: 'Remissao' }, value: { TYPE_NAME: 'br_gov_lexml__1.Remissao', href: 'art1', content: ['art. 1º'] } },
        '.',
      ];
      const modelo = buildProjetoNormaFromJsonix(lerDocumentoArticulado(entrada, FLEXIVEL), true);
      state = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: modelo.articulacao!, classificacao: ClassificacaoDocumento.NORMA });
    };

    it('a remissão e a busca por id resolvem para a 1ª ocorrência', () => {
      abreComRemissao();

      expect(buscaDispositivoById(state.articulacao!, 'art1')).to.equal(artigo(0));
      const alvos = Object.values(state.remissoes ?? {})
        .flat()
        .map(e => e.targetUuid);
      expect(alvos.length).to.be.greaterThan(0);
      alvos.forEach(uuid => expect(uuid).to.equal(artigo(0).uuid));
    });

    it('salva os ids repetidos, e incluir, remover, mover, desfazer e refazer não lançam exceção', () => {
      abreComRemissao();
      const salvo = criarDocumentoArticulado(
        state.articulacao!.projetoNorma!,
        URN,
        completarRegistroRemissoes(state.articulacao!, state.remissoes ?? {}),
        undefined,
        undefined,
        FLEXIVEL
      );
      expect(salvo.value.projetoNorma.norma.articulacao.lXhier.map((a: any) => a.value.id)).to.deep.equal(['art1', 'art1']);

      expect(() => {
        despacha(adicionarElementoAction.execute(createElemento(artigo(0)), ''));
        despacha(moverElementoAbaixoAction.execute(createElemento(artigo(0))));
        despacha(removerElementoAction.execute(createElemento(artigo(1)), undefined));
        despacha(UndoAction());
        despacha(UndoAction());
        despacha(redoAction());
        despacha(validarArticulacaAction.execute());
      }).not.to.throw();
      expect(state.articulacao!.artigos.length).to.be.greaterThan(0);
    });
  });
});
