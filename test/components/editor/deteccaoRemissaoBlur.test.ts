import { expect } from '@open-wc/testing';
import { EditorComponent } from '../../../src/components/editor/editor.component';
import { rootStore } from '../../../src/redux/store';
import { ATUALIZAR_TEXTO_ELEMENTO } from '../../../src/model/lexml/acao/atualizarTextoElementoAction';
import { ADICIONAR_REMISSAO_INTERNA } from '../../../src/model/lexml/acao/adicionarRemissaoInternaAction';
import { REMOVER_REMISSAO_INVALIDA } from '../../../src/model/lexml/acao/removerRemissaoInvalidaAction';
import { openArticulacaoAction } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { criaStateComNArtigos } from '../../helpers/dispositivo-helper';

// Object.create(EditorComponent.prototype) em vez de document.createElement/fixture: o construtor seta this.tabIndex = -1, o que viola a regra de Custom Elements de não mutar atributos na construção.

function criarQuillFake(linhaAtual?: any): any {
  return {
    linhaAtual,
    getModule: (nome: string) => (nome === 'remissaoInterna' ? { getRemissoes: () => [] } : null),
  };
}

function criarLinhaFake(overrides: { alterado?: boolean; html?: string } = {}): any {
  return {
    uuid: 1,
    uuid2: 'u2',
    lexmlId: 'art1',
    tipo: 'Artigo',
    numero: '1',
    hierarquia: {},
    blotConteudo: {
      alterado: overrides.alterado ?? true,
      html: overrides.html ?? 'conforme o art. 2º',
    },
  };
}

describe('EditorComponent — detecção híbrida de remissão (blur do dispositivo)', () => {
  let editor: any;
  let dispatched: any[];
  let dispatchOriginal: typeof rootStore.dispatch;

  beforeEach(() => {
    editor = Object.create(EditorComponent.prototype);
    editor._quill = criarQuillFake();

    dispatched = [];
    dispatchOriginal = rootStore.dispatch;
    (rootStore as any).dispatch = (action: any): any => {
      dispatched.push(action);
      return action;
    };
  });

  afterEach(() => {
    (rootStore as any).dispatch = dispatchOriginal;
  });

  function tipos(): string[] {
    return dispatched.map(a => a.type);
  }

  describe('atualizarTextoElemento — caminho de debounce/keystroke', () => {
    it('atualiza o texto no Redux mas não cria remissão', () => {
      editor.atualizarTextoElemento(criarLinhaFake());

      expect(tipos()).to.include(ATUALIZAR_TEXTO_ELEMENTO);
      expect(tipos()).to.include(REMOVER_REMISSAO_INVALIDA);
      expect(tipos()).to.not.include(ADICIONAR_REMISSAO_INTERNA);
    });

    it('não despacha nada quando a linha não foi alterada', () => {
      editor.atualizarTextoElemento(criarLinhaFake({ alterado: false }));

      expect(dispatched).to.have.length(0);
    });
  });

  describe('detectarRemissoesAoSairDaLinha — caminho de saída da linha (Gatilho A)', () => {
    it('dispara a criação/re-detecção de remissão quando somenteFormatoMudou é false', () => {
      editor.detectarRemissoesAoSairDaLinha(criarLinhaFake(), false);

      expect(tipos()).to.include(ADICIONAR_REMISSAO_INTERNA);
    });

    it('não despacha nada quando somenteFormatoMudou é true', () => {
      editor.detectarRemissoesAoSairDaLinha(criarLinhaFake(), true);

      expect(dispatched).to.have.length(0);
    });

    it('não duplica a atualização de texto (responsabilidade exclusiva de atualizarTextoElemento)', () => {
      editor.detectarRemissoesAoSairDaLinha(criarLinhaFake(), false);

      expect(tipos()).to.not.include(ATUALIZAR_TEXTO_ELEMENTO);
    });
  });

  describe('somenteFormatoMudouNaLinha', () => {
    it('retorna true quando a linha não foi alterada', () => {
      expect(editor.somenteFormatoMudouNaLinha(criarLinhaFake({ alterado: false }))).to.be.true;
    });

    it('retorna false quando o texto difere do que está no Redux (sem articulacao carregada)', () => {
      expect(editor.somenteFormatoMudouNaLinha(criarLinhaFake())).to.be.false;
    });
  });

  describe('flushEdicaoPendente — rede de segurança determinística (usada por getProjetoAtualizado)', () => {
    it('sincroniza texto e remissão da linha atual, mesmo sem troca de linha', () => {
      editor._quill = criarQuillFake(criarLinhaFake());

      editor.flushEdicaoPendente();

      expect(tipos()).to.include(ATUALIZAR_TEXTO_ELEMENTO);
      expect(tipos()).to.include(ADICIONAR_REMISSAO_INTERNA);
    });

    it('cancela o debounce de keystroke pendente', () => {
      editor._quill = criarQuillFake(criarLinhaFake());
      editor.timerOnChange = setTimeout(() => {
        throw new Error('debounce não deveria disparar após o flush');
      }, 0);

      editor.flushEdicaoPendente();

      expect(editor.timerOnChange).to.be.null;
    });

    it('não faz nada (nem lança erro) quando não há linha atual', () => {
      editor._quill = criarQuillFake(undefined);

      expect(() => editor.flushEdicaoPendente()).to.not.throw();
      expect(dispatched).to.have.length(0);
    });

    it('é idempotente quando não há edição pendente na linha atual', () => {
      editor._quill = criarQuillFake(criarLinhaFake({ alterado: false }));

      editor.flushEdicaoPendente();

      expect(dispatched).to.have.length(0);
    });
  });

  describe('onFocusoutEditor — Gatilho B (foco sai do editor inteiro)', () => {
    let flushCalls: number;

    beforeEach(() => {
      flushCalls = 0;
      editor.flushEdicaoPendente = (): void => {
        flushCalls++;
      };
    });

    function criarLinhaComDom(): any {
      return { blotConteudo: { domNode: document.createElement('p') } };
    }

    // onFocusoutEditor adia o flush via setTimeout(0) — ver comentário no código-fonte (evita
    // corromper seleção síncrona de handlers de click que rodam logo após o focusout).
    function aguardarProximoTick(): Promise<void> {
      return new Promise(resolve => setTimeout(resolve, 0));
    }

    it('não chama o flush quando o novo foco permanece dentro do blotConteudo da linha ativa', async () => {
      const linha = criarLinhaComDom();
      const spanDentroDoTexto = document.createElement('span');
      linha.blotConteudo.domNode.appendChild(spanDentroDoTexto);
      editor._quill = criarQuillFake(linha);

      editor.onFocusoutEditor({ relatedTarget: spanDentroDoTexto } as unknown as FocusEvent);
      await aguardarProximoTick();

      expect(flushCalls).to.equal(0);
    });

    it('chama o flush quando o novo foco está fora do blotConteudo (ex.: botão de menu de outro dispositivo)', async () => {
      const botaoDeMenu = document.createElement('button');
      editor._quill = criarQuillFake(criarLinhaComDom());

      editor.onFocusoutEditor({ relatedTarget: botaoDeMenu } as unknown as FocusEvent);
      await aguardarProximoTick();

      expect(flushCalls).to.equal(1);
    });

    it('chama o flush quando relatedTarget é null (foco saiu do documento)', async () => {
      editor._quill = criarQuillFake(criarLinhaComDom());

      editor.onFocusoutEditor({ relatedTarget: null } as unknown as FocusEvent);
      await aguardarProximoTick();

      expect(flushCalls).to.equal(1);
    });

    it('chama o flush quando não há linha atual', async () => {
      editor._quill = criarQuillFake(undefined);

      editor.onFocusoutEditor({ relatedTarget: document.createElement('button') } as unknown as FocusEvent);
      await aguardarProximoTick();

      expect(flushCalls).to.equal(1);
    });
  });

  // Último bloco do arquivo de propósito: dispatch real (sem stub) muta o rootStore global de
  // forma permanente, o que poluiria os testes acima se rodasse antes deles.
  describe('sequência real (dispatch sem stub) — regressão do bug de ordenação do guard', () => {
    it('cria a remissão mesmo com atualizarTextoElemento já tendo sincronizado o texto no Redux', () => {
      (rootStore as any).dispatch = dispatchOriginal;

      const { state, artigos } = criaStateComNArtigos(2);
      rootStore.dispatch(openArticulacaoAction(state.articulacao));

      const artigo1 = artigos[0];
      const linha = criarLinhaFake({ html: 'Conforme o art. 2º.' });
      linha.uuid = artigo1.uuid;
      linha.uuid2 = artigo1.uuid2;
      linha.lexmlId = artigo1.id;
      linha.tipo = artigo1.tipo;
      linha.numero = artigo1.numero;
      linha.hierarquia = artigo1.hierarquia;

      // Mesma sequência de editor.component.ts: guard calculado ANTES do dispatch de texto.
      const somenteFormatoMudou = editor.somenteFormatoMudouNaLinha(linha);
      editor.atualizarTextoElemento(linha);
      editor.detectarRemissoesAoSairDaLinha(linha, somenteFormatoMudou);

      const remissoesDoArtigo1 = rootStore.getState().elementoReducer.remissoes?.[artigo1.uuid!] ?? [];
      expect(remissoesDoArtigo1).to.have.length(1);
    });
  });
});
