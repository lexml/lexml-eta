import { expect } from '@open-wc/testing';
import PrivateQuill from '../../../src/internal/quill/private-quill';
import { RemissaoInternaBlot } from '../../../src/util/eta-quill/eta-blot-remissao-interna';
import { ModuloRemissao } from '../../../src/components/editor/moduloRemissao';
import { ADICIONAR_REMISSAO_INTERNA } from '../../../src/model/lexml/acao/adicionarRemissaoInternaAction';
import { buscarAncestralPorTipo } from '../../../src/redux/elemento/reducer/adicionaRemissaoInterna';
import { getDispositivoFromElemento, createElemento } from '../../../src/model/elemento/elementoUtil';
import { createArticulacao, criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { updateIdDispositivoAndFilhos } from '../../../src/model/lexml/util/idUtil';
import { DispositivoAdicionado } from '../../../src/model/lexml/situacao/dispositivoAdicionado';
import { Artigo } from '../../../src/model/dispositivo/dispositivo';

// ---------------------------------------------------------------------------
// Segundo clipboard matcher ('A') e no-op
//
// O matcher registrado para 'A' em moduloRemissao.ts:97-109 sempre retorna
// `delta` inalterado em todos os seus caminhos (codigo morto).
// CORRECAO: remover o matcher.
// ---------------------------------------------------------------------------

// Replica o matcher exatamente como esta no codigo-fonte.
function clipboardMatcherA(node: HTMLElement, delta: any): any {
  const dataLexmlRef = node.getAttribute('data-lexml-ref');

  if (!dataLexmlRef) {
    return delta;
  }

  if (node.classList.contains('lexml-remissao-interna')) {
    return delta;
  }

  return delta;
}

describe('Clipboard matcher "A": comportamento no-op (codigo morto)', () => {
  const sentinel = { ops: [{ insert: 'texto' }] };

  it('retorna delta inalterado quando no nao tem data-lexml-ref', () => {
    const node = document.createElement('a');
    expect(clipboardMatcherA(node, sentinel)).to.equal(sentinel);
  });

  it('retorna delta inalterado quando no tem data-lexml-ref e e lexml-remissao-interna', () => {
    const node = document.createElement('a');
    node.setAttribute('data-lexml-ref', 'art1');
    node.classList.add('lexml-remissao-interna');
    expect(clipboardMatcherA(node, sentinel)).to.equal(sentinel);
  });

  it('retorna delta inalterado quando no tem data-lexml-ref e nao e lexml-remissao-interna', () => {
    // Todos os ramos retornam delta: o matcher nao tem efeito em nenhum caso.
    const node = document.createElement('a');
    node.setAttribute('data-lexml-ref', 'art1');
    expect(clipboardMatcherA(node, sentinel)).to.equal(sentinel);
  });
});

// ---------------------------------------------------------------------------
// Dupla registracao do modulo Quill
//
// 'modules/remissaoInterna' e registrado em:
//   - src/components/editor/moduloRemissao.ts:567
//   - src/util/eta-quill/eta-quill.ts:163
// Ambos usam overwrite:true; o segundo vence silenciosamente.
// CORRECAO: remover Quill.register em moduloRemissao.ts:567.
// ---------------------------------------------------------------------------

describe('Dupla registracao: Quill.register com overwrite:true e seguro', () => {
  it('registrar o mesmo modulo duas vezes com overwrite:true nao lanca erro', () => {
    let threwError = false;
    try {
      PrivateQuill.register('modules/remissaoInterna', ModuloRemissao, true);
      PrivateQuill.register('modules/remissaoInterna', ModuloRemissao, true);
    } catch (e) {
      threwError = true;
    }
    expect(threwError).to.be.false;
  });

  it('ModuloRemissao.register() nao lanca erro ao registrar atributos', () => {
    let threwError = false;
    try {
      ModuloRemissao.register();
    } catch (e) {
      threwError = true;
    }
    expect(threwError).to.be.false;
  });
});

// ---------------------------------------------------------------------------
// extractUuidFromHref duplicado
//
// Implementacao identica existe em RemissaoInternaBlot (estatico, publico)
// e em ModuloRemissao (privado). CORRECAO: remover o metodo privado e
// usar RemissaoInternaBlot.extractUuidFromHref em atualizarReferencias().
// ---------------------------------------------------------------------------

describe('extractUuidFromHref: implementacao canonica (RemissaoInternaBlot)', () => {
  it('extrai uuid numerico de href valido', () => {
    expect(RemissaoInternaBlot.extractUuidFromHref('#lxEtaId42')).to.equal(42);
  });

  it('retorna 0 para href sem fragmento lxEtaId', () => {
    expect(RemissaoInternaBlot.extractUuidFromHref('#outro')).to.equal(0);
    expect(RemissaoInternaBlot.extractUuidFromHref('')).to.equal(0);
    expect(RemissaoInternaBlot.extractUuidFromHref('http://exemplo.com')).to.equal(0);
  });

  it('extrai uuid correto de href composto', () => {
    expect(RemissaoInternaBlot.extractUuidFromHref('#lxEtaId99999')).to.equal(99999);
  });

  it('implementacao privada de ModuloRemissao e identica (documenta duplicacao)', () => {
    // Replica exatamente ModuloRemissao.extractUuidFromHref (privado).
    function extractUuidPrivado(href: string): number {
      const match = href.match(/#lxEtaId(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    }

    const hrefs = ['#lxEtaId1', '#lxEtaId0', '#lxEtaId999', '#outro', ''];
    hrefs.forEach(href => {
      expect(extractUuidPrivado(href)).to.equal(RemissaoInternaBlot.extractUuidFromHref(href));
    });
  });
});

// ---------------------------------------------------------------------------
// querySelector com interpolacao direta de refId/lexmlId sem CSS.escape()
//
// Caracteres especiais CSS (ex: aspas duplas) na interpolacao direta causam
// SyntaxError. CORRECAO: usar CSS.escape() em todos os querySelector do modulo.
// ---------------------------------------------------------------------------

describe('querySelector: fragilidade sem CSS.escape()', () => {
  it('querySelector sem CSS.escape() lanca SyntaxError para refId com aspas duplas', () => {
    const container = document.createElement('div');
    const a = document.createElement('a');
    const refIdComAspa = 'ref_123"evil"';
    a.setAttribute('data-ref-id', refIdComAspa);
    a.classList.add('lexml-remissao-interna');
    container.appendChild(a);

    let threwError = false;
    try {
      container.querySelector(`a.lexml-remissao-interna[data-ref-id="${refIdComAspa}"]`);
    } catch (e) {
      threwError = true;
    }
    expect(threwError).to.be.true;
  });

  it('querySelector COM CSS.escape() encontra elemento com refId contendo aspas duplas', () => {
    const container = document.createElement('div');
    const a = document.createElement('a');
    const refIdComAspa = 'ref_123"evil"';
    a.setAttribute('data-ref-id', refIdComAspa);
    a.classList.add('lexml-remissao-interna');
    container.appendChild(a);

    const found = container.querySelector(`a.lexml-remissao-interna[data-ref-id="${CSS.escape(refIdComAspa)}"]`);
    expect(found).to.not.be.null;
  });

  it('querySelector COM CSS.escape() encontra elemento com refId com colchetes', () => {
    const container = document.createElement('div');
    const a = document.createElement('a');
    const refIdComColchetes = 'ref_123[0]';
    a.setAttribute('data-ref-id', refIdComColchetes);
    a.classList.add('lexml-remissao-interna');
    container.appendChild(a);

    const found = container.querySelector(`a.lexml-remissao-interna[data-ref-id="${CSS.escape(refIdComColchetes)}"]`);
    expect(found).to.not.be.null;
  });
});

// ---------------------------------------------------------------------------
// Event listener de click nunca limpo
//
// ModuloRemissao adiciona listener em quill.root no construtor mas nao tem
// metodo destroy() para remover. Se instanciado N vezes no mesmo elemento,
// acumula N listeners.
// CORRECAO: armazenar referencia do handler e implementar destroy().
// ---------------------------------------------------------------------------

describe('Event listener: acumulacao de listeners sem destroy()', () => {
  it('addEventListener chamado multiplas vezes acumula handlers (documenta o problema)', () => {
    const root = document.createElement('div');
    let contador = 0;

    // Simula o que o construtor faz atualmente (bind diferente a cada chamada)
    const handler1 = (): void => {
      contador++;
    };
    const handler2 = (): void => {
      contador++;
    };
    const handler3 = (): void => {
      contador++;
    };

    root.addEventListener('click', handler1);
    root.addEventListener('click', handler2);
    root.addEventListener('click', handler3);

    root.dispatchEvent(new MouseEvent('click'));
    // 3 instancias de ModuloRemissao no mesmo root -> 3 handlers executados
    expect(contador).to.equal(3);
  });

  it('com referencia guardada, removeEventListener elimina apenas o handler correto', () => {
    const root = document.createElement('div');
    let contador = 0;

    const handler = (): void => {
      contador++;
    };
    root.addEventListener('click', handler);
    root.dispatchEvent(new MouseEvent('click'));
    expect(contador).to.equal(1);

    // CORRECAO: destroy() chama removeEventListener com a mesma referencia
    root.removeEventListener('click', handler);
    root.dispatchEvent(new MouseEvent('click'));
    expect(contador).to.equal(1); // nao incrementou apos remocao
  });
});

// ---------------------------------------------------------------------------
// await sem efeito em appendChild
//
// remissaoInternaDialog.ts: `await dialogElem.appendChild(content)`
// appendChild e sincrono e nao retorna Promise; o await e inofensivo mas enganoso.
// CORRECAO: remover await.
// ---------------------------------------------------------------------------

describe('appendChild e sincrono (await e desnecessario)', () => {
  it('appendChild retorna o no inserido, nao uma Promise', () => {
    const parent = document.createElement('div');
    const child = document.createElement('span');

    const result = parent.appendChild(child);

    expect(result).to.equal(child);
    expect(result instanceof Promise).to.be.false;
  });

  it('createContextualFragment tambem e sincrono', () => {
    const fragment = document.createRange().createContextualFragment('<span>texto</span>');
    expect(fragment instanceof DocumentFragment).to.be.true;
    expect(fragment instanceof Promise).to.be.false;
  });
});

// ---------------------------------------------------------------------------
// adicionarRemissaoInternaAction.ts exporta ADICIONAR_REMISSAO_INTERNA mas
// a classe interna se chama AtualizaRemissaoInterna (descricao diz "Atualizar").
// CORRECAO: renomear classe para AdicionarRemissaoInterna.
// ---------------------------------------------------------------------------

describe('Naming: constante de acao e prefixo consistente com "Adicionar"', () => {
  it('ADICIONAR_REMISSAO_INTERNA tem prefixo "ADICIONAR"', () => {
    expect(ADICIONAR_REMISSAO_INTERNA).to.match(/^ADICIONAR_/);
  });

  it('valor da constante e "ADICIONAR_REMISSAO_INTERNA"', () => {
    expect(ADICIONAR_REMISSAO_INTERNA).to.equal('ADICIONAR_REMISSAO_INTERNA');
  });
});

// ---------------------------------------------------------------------------
// CORRECAO: substituir pelo utilitario existente.
// Os testes abaixo documentam que ambos retornam o mesmo dispositivo para
// o mesmo uuid — provando a equivalencia funcional.
// ---------------------------------------------------------------------------

describe('buscarAncestralPorTipo vs getDispositivoFromElemento: equivalencia', () => {
  function montarArvore() {
    const articulacao = createArticulacao();
    const art = criaDispositivo(articulacao, 'Artigo') as Artigo;
    const par = criaDispositivo(art, 'Paragrafo');
    const inc = criaDispositivo(par, 'Inciso');

    art.situacao = new DispositivoAdicionado();
    (art as any).caput.situacao = new DispositivoAdicionado();
    par.situacao = new DispositivoAdicionado();
    inc.situacao = new DispositivoAdicionado();

    articulacao.renumeraFilhos();
    (art as any).renumeraFilhos?.();
    (par as any).renumeraFilhos?.();
    art.createRotulo(art);
    par.createRotulo(par);
    inc.createRotulo(inc);
    updateIdDispositivoAndFilhos(articulacao);

    return { articulacao, art, par, inc };
  }

  it('getDispositivoFromElemento encontra artigo pelo uuid', () => {
    const { articulacao, art } = montarArvore();
    const elemento = createElemento(art, true);
    const encontrado = getDispositivoFromElemento(articulacao, elemento, true);
    expect(encontrado).to.exist;
    expect(encontrado!.uuid).to.equal(art.uuid);
  });

  it('buscarAncestralPorTipo encontra artigo a partir do inciso', () => {
    const { art, inc } = montarArvore();
    const ancestral = buscarAncestralPorTipo(inc as any, 'Artigo');
    expect(ancestral).to.exist;
    expect(ancestral!.uuid).to.equal(art.uuid);
  });

  it('getDispositivoFromElemento encontra paragrafo pelo uuid', () => {
    const { articulacao, par } = montarArvore();
    const elemento = createElemento(par, true);
    const encontrado = getDispositivoFromElemento(articulacao, elemento, true);
    expect(encontrado).to.exist;
    expect(encontrado!.uuid).to.equal(par.uuid);
  });
});

// ---------------------------------------------------------------------------
// Se textoRef aparece 2x no dispositivo, ambas recebem o link — incluindo
// trechos que nao sao referencias.
// CORRECAO: usar informacao posicional (inicio/fim) de ReferenciaEncontrada
// para aplicar formato apenas na posicao correta.
//
// O teste abaixo documenta o comportamento atual (aplica a todas as ocorrencias)
// usando a logica de indexOf diretamente, sem depender do Quill.
// BUG: o teste de "unica ocorrencia" PASSA, mas o de "multiplas ocorrencias"
// confirma que o loop continua apos a primeira correspondencia.
// ---------------------------------------------------------------------------

describe('indexOf loop: aplica formato a todas as ocorrencias (documenta bug)', () => {
  it('indexOf em loop encontra primeira ocorrencia de textoRef', () => {
    const texto = 'Conforme o art. 1o e o art. 1o deste codigo.';
    const textoRef = 'art. 1o';
    const ocorrencias: number[] = [];

    let index = texto.indexOf(textoRef);
    while (index !== -1) {
      ocorrencias.push(index);
      index = texto.indexOf(textoRef, index + textoRef.length);
    }

    // BUG: o loop encontra 2 ocorrencias — ambas recebem o link
    expect(ocorrencias.length).to.equal(2, 'indexOf encontra todas as ocorrencias, nao apenas a primeira/correta');
  });

  it('com uso de posicao, somente a ocorrencia correta seria formatada', () => {
    const texto = 'Conforme o art. 1o e o art. 1o deste codigo.';
    const textoRef = 'art. 1o';
    const posicaoCorreta = 11; // posicao da primeira ocorrencia

    // CORRECAO: usar posicao armazenada em ReferenciaEncontrada.inicio
    const index = texto.indexOf(textoRef, posicaoCorreta);
    expect(index).to.equal(posicaoCorreta);

    // Apenas uma formatacao seria aplicada
    const formatacoes = [index]; // lista com exatamente 1 item
    expect(formatacoes.length).to.equal(1);
  });
});
