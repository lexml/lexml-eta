import { expect } from '@open-wc/testing';
import { State } from '../../../src/redux/state';
import { criaStateComNArtigos } from '../../helpers/dispositivo-helper';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { removerElementoAction } from '../../../src/model/lexml/acao/removerElementoAction';
import { UNDO } from '../../../src/model/lexml/acao/undoAction';
import { REDO } from '../../../src/model/lexml/acao/redoAction';
import { MOVER_ELEMENTO_ACIMA } from '../../../src/model/lexml/acao/moverElementoAcimaAction';
import { ATIVAR_DESATIVAR_REVISAO } from '../../../src/model/lexml/acao/ativarDesativarRevisaoAction';
import { REJEITAR_REVISAO } from '../../../src/model/lexml/acao/rejeitarRevisaoAction';
import { ADICIONAR_ELEMENTOS_FROM_CLIPBOARD } from '../../../src/model/lexml/acao/AdicionarElementosFromClipboardAction';
import { buscaDispositivoById, percorreHierarquiaDispositivos } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { openArticulacaoAction } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { MPV_905_2019 } from '../../doc/mpv_905_2019';
import { TEXTO_001 } from '../../doc/textos-colar/texto_001';
import { isRevisaoPrincipal } from '../../../src/redux/elemento/util/revisaoUtil';
import { Articulacao, Artigo, Dispositivo } from '../../../src/model/dispositivo/dispositivo';
import { criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { updateIdDispositivoAndFilhos } from '../../../src/model/lexml/util/idUtil';
import { buscarDispositivoPorUuid } from '../../../src/model/remissao/sincronizarRemissoes';
import { RemissaoInternaValue } from '../../../src/model/remissao/remissao';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { adicionarArtigoAntes } from '../../../src/model/lexml/acao/adicionarElementoAction';
import { inicializaRemissoesAoAbrir } from '../../../src/redux/elemento/reducer/inicializaRemissoesAoAbrir';
import { completarRegistroRemissoes } from '../../../src/redux/elemento/reducer/adicionaRemissaoInterna';
import { buildJsonixFromProjetoNorma } from '../../../src/model/lexml/documento/conversor/buildJsonixFromProjetoNorma';

const PREFIXO = 'Conforme o ';

const criaEntrada = (origem: Dispositivo, alvo: Dispositivo, textoRef: string, inicio = PREFIXO.length, refId = `ref_${alvo.uuid}`): RemissaoInternaValue => ({
  refId,
  sourceUuid: origem.uuid,
  targetUuid: alvo.uuid,
  targetLexmlId: alvo.id,
  textoRef,
  inicio,
});

const remover = (s: State, d: Dispositivo): State => {
  const el = createElemento(d, true);
  return elementoReducer(s, removerElementoAction.execute(el, el));
};

const moverAcima = (s: State, d: Dispositivo): State => elementoReducer(s, { type: MOVER_ELEMENTO_ACIMA, atual: createElemento(d) });

const entradaDe = (s: State, origem: Dispositivo, indice = 0): RemissaoInternaValue => s.remissoes![origem.uuid!][indice];

const destinoDe = (s: State, entrada: RemissaoInternaValue): Dispositivo | undefined => buscarDispositivoPorUuid(s.articulacao!, entrada.targetUuid!);

const contaDispositivosComUuid = (articulacao: Articulacao, uuid: number): number => {
  let total = 0;
  percorreHierarquiaDispositivos(articulacao as unknown as Dispositivo, d => {
    if (d.uuid === uuid) total++;
  });
  return total;
};

describe('Remissão para o caput em ações que recriam o artigo', () => {
  let state: State;
  let art1: Artigo;
  let art2: Artigo;
  let art3: Artigo;

  beforeEach(() => {
    state = criaStateComNArtigos(3).state;
    [art1, art2, art3] = state.articulacao!.artigos as Artigo[];
  });

  const referenciaCaput = (alvo: Artigo): void => {
    art1.texto = `${PREFIXO}caput do art. ${alvo.numero}º, aplica-se.`;
    state.remissoes = { [art1.uuid!]: [criaEntrada(art1, alvo.caput!, `caput do art. ${alvo.numero}º`)] };
  };

  it('mover (sem undo) mantém o caput resolvível', () => {
    referenciaCaput(art3);

    const result = moverAcima(state, art3);

    expect(destinoDe(result, entradaDe(result, art1))?.id).to.equal('art2_cpt');
  });

  it('remover o artigo invalida a remissão para o seu caput', () => {
    referenciaCaput(art2);

    const result = remover(state, art2);

    expect(entradaDe(result, art1).valida).to.equal(false);
  });

  it('remover + undo mantém o caput resolvível, com o mesmo uuid2 e texto', () => {
    referenciaCaput(art2);
    const uuid2Caput = art2.caput!.uuid2;

    let result = remover(state, art2);
    result = elementoReducer(result, { type: UNDO });

    const entrada = entradaDe(result, art1);
    const destino = destinoDe(result, entrada);
    expect(destino, 'caput deve continuar resolvível').to.exist;
    expect(destino!.uuid2).to.equal(uuid2Caput);
    expect(destino!.pai!.texto).to.equal('Artigo 2.');
    expect(entrada.valida).to.not.equal(false);
  });

  it('undo da remoção restaura a remissão para inciso do artigo removido', () => {
    const inciso = criaDispositivo(art2, 'Inciso');
    inciso.texto = 'inciso um;';
    art2.renumeraFilhos();
    updateIdDispositivoAndFilhos(state.articulacao!);
    art1.texto = `${PREFIXO}inciso I do art. 2º, aplica-se.`;
    state.remissoes = { [art1.uuid!]: [criaEntrada(art1, inciso, 'inciso I do art. 2º')] };

    let result = remover(state, art2);
    expect(entradaDe(result, art1).valida).to.equal(false);

    result = elementoReducer(result, { type: UNDO });

    expect(entradaDe(result, art1).valida).to.not.equal(false);
  });

  it('rejeitar revisão de movimentação mantém o caput resolvível', () => {
    referenciaCaput(art3);

    let result = moverAcima(elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO }), art3);
    const principal = (result.revisoes ?? []).filter(isRevisaoPrincipal)[0];
    expect(principal, 'mover em revisão deveria gerar revisão principal').to.exist;
    result = elementoReducer(result, { type: REJEITAR_REVISAO, revisao: principal });

    const entrada = entradaDe(result, art1);
    expect(destinoDe(result, entrada), 'caput deve continuar resolvível').to.exist;
    expect(entrada.targetLexmlId).to.equal('art3_cpt');
  });

  it('undo de mover mantém o caput resolvível na posição restaurada', () => {
    referenciaCaput(art3);

    let result = moverAcima(state, art3);
    result = elementoReducer(result, { type: UNDO });

    const entrada = entradaDe(result, art1);
    expect(destinoDe(result, entrada), 'caput deve continuar resolvível').to.exist;
    expect(entrada.targetLexmlId).to.equal('art3_cpt');
    expect(entrada.textoRef).to.equal('caput do art. 3º');
  });

  it('undo + redo de mover mantém o caput resolvível', () => {
    referenciaCaput(art3);

    let result = moverAcima(state, art3);
    result = elementoReducer(result, { type: UNDO });
    result = elementoReducer(result, { type: REDO });

    const entrada = entradaDe(result, art1);
    expect(destinoDe(result, entrada), 'caput deve continuar resolvível').to.exist;
    expect(entrada.targetLexmlId).to.equal('art2_cpt');
  });

  it('remover + undo + redo + undo mantém o caput resolvível', () => {
    referenciaCaput(art2);

    let result = remover(state, art2);
    result = elementoReducer(result, { type: UNDO });
    result = elementoReducer(result, { type: REDO });
    result = elementoReducer(result, { type: UNDO });

    expect(destinoDe(result, entradaDe(result, art1)), 'caput deve continuar resolvível').to.exist;
  });

  it('undo de colar substituindo não duplica o uuid do caput', () => {
    // Colar exige o conteúdo já convertido para JSONIX; reaproveita o cenário de reducer-colar-dispositivo.test.ts.
    const s = openArticulacaoAction(buildProjetoNormaFromJsonix(MPV_905_2019).articulacao!);
    s.ui = {} as any;
    const artigo1 = buscaDispositivoById(s.articulacao!, 'art1') as Artigo;
    const artigo3 = buscaDispositivoById(s.articulacao!, 'art3') as Artigo;
    const uuidCaput = artigo1.caput!.uuid!;
    s.remissoes = { [artigo3.uuid!]: [criaEntrada(artigo3, artigo1.caput!, 'caput do art. 1º', 0)] };

    let result = elementoReducer(s, {
      type: ADICIONAR_ELEMENTOS_FROM_CLIPBOARD,
      atual: createElemento(artigo1),
      isColarSubstituindo: true,
      posicao: 'depois',
      novo: { isDispositivoAlteracao: false, conteudo: { texto: TEXTO_001 } },
    });
    result = elementoReducer(result, { type: UNDO });

    expect(contaDispositivosComUuid(result.articulacao!, uuidCaput)).to.be.at.most(1);
    expect(destinoDe(result, entradaDe(result, artigo3)), 'caput deve continuar resolvível').to.exist;
  });

  it('salvar após remover + undo + renumeração grava a remissão apontando para o caput', () => {
    art1.texto = `Ver o <a href="art2_cpt" data-lexml-ref="art2_cpt" class="lexml-remissao-interna" target="_self">caput do art. 2º</a> desta lei.`;
    state.remissoes = inicializaRemissoesAoAbrir(state.articulacao!);
    expect(entradaDe(state, art1).targetUuid).to.equal(art2.caput!.uuid);

    let result = remover(state, art2);
    result = elementoReducer(result, { type: UNDO });
    // Sem renumeração o save manteria o último id conhecido (art2_cpt) mesmo com o caput perdido; ela expõe a diferença.
    result = elementoReducer(result, adicionarArtigoAntes.execute(createElemento(art1, true)));

    const registroCompleto = completarRegistroRemissoes(result.articulacao!, result.remissoes ?? {});
    const projetoNorma = {
      classificacao: ClassificacaoDocumento.NORMA,
      epigrafe: { texto: 'TESTE' },
      ementa: { texto: 'Ementa' } as any,
      preambulo: { texto: '' },
      articulacao: result.articulacao!,
    };
    const jsonix = buildJsonixFromProjetoNorma(projetoNorma, 'urn:teste', registroCompleto);

    // Após inserir antes: [novo art. 1º, art. 2º (origem), art. 3º (destino)].
    const caputOrigem = jsonix.value.projetoNorma.norma.articulacao.lXhier[1].value.lXcontainersOmissis[0].value.p[0].content;
    const remissao = caputOrigem.find((c: any) => c?.name?.localPart === 'Remissao');
    expect(remissao, 'a serialização deve conter um nó Remissao').to.exist;
    expect(remissao.value.href).to.equal('art3_cpt');
  });

  describe('Remissões simultâneas para o artigo removido, seu inciso e seu caput', () => {
    let inciso: Dispositivo;
    let entradaAlheia: RemissaoInternaValue;

    beforeEach(() => {
      inciso = criaDispositivo(art2, 'Inciso');
      inciso.texto = 'inciso um;';
      art2.renumeraFilhos();
      updateIdDispositivoAndFilhos(state.articulacao!);

      art1.texto = 'Ver art. 2º, inciso I do art. 2º e caput do art. 2º.';
      // Invalidada por outra ação: mesmo id textual do art. 2º, destino inexistente — o undo não deve restaurá-la.
      entradaAlheia = { refId: 'ref_alheia', sourceUuid: art3.uuid, targetUuid: 999999, targetLexmlId: 'art2', textoRef: 'art. 2º', inicio: 0, valida: false };
      art3.texto = 'art. 2º antigo.';
      state.remissoes = {
        [art1.uuid!]: [criaEntrada(art1, art2, 'art. 2º', 4), criaEntrada(art1, inciso, 'inciso I do art. 2º', 13), criaEntrada(art1, art2.caput!, 'caput do art. 2º', 35)],
        [art3.uuid!]: [entradaAlheia],
      };
    });

    it('remover invalida as três', () => {
      const result = remover(state, art2);

      expect(result.remissoes![art1.uuid!].map(e => e.valida)).to.deep.equal([false, false, false]);
    });

    it('undo restaura as três, remove o alerta da origem e mantém inválida a entrada alheia', () => {
      let result = remover(state, art2);
      result = elementoReducer(result, { type: UNDO });

      const entradas = result.remissoes![art1.uuid!];
      expect(entradas.map(e => e.valida)).to.deep.equal([undefined, undefined, undefined]);
      entradas.forEach(e => expect(destinoDe(result, e), `${e.textoRef} resolvível`).to.exist);
      expect((result.ui?.alertas ?? []).map(a => a.id)).to.not.include(`alerta-remissao-invalida-${art1.uuid}`);
      expect(result.remissoes![art3.uuid!][0].valida).to.equal(false);
    });
  });
});
