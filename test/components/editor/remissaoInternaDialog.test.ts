import { expect } from '@open-wc/testing';
import { remissaoInternaDialog } from '../../../src/components/editor/remissaoInternaDialog';
import { rootStore } from '../../../src/redux/store';
import { ABRIR_ARTICULACAO } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { MPV_905_2019 } from '../../doc/mpv_905_2019';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';

// SEÇÃO 1 — Testes de unidade da vulnerabilidade do padrão de template
// XSS via interpolação de `textoSelecionado` em template HTML
// (não dependem de rootStore; testam o padrão exato usado no código)

describe('C2 — XSS: padrão de template createContextualFragment com texto do usuário', () => {
  // Verifica o padrão CORRIGIDO: escapeHtml() aplicado antes da interpolação em HTML.
  // Replica o padrão CORRIGIDO do arquivo fonte (usa escapeHtml antes da interpolação)
  function escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function criarFragmentoSeguro(textoSelecionado: string): DocumentFragment {
    return document.createRange().createContextualFragment(`
      <div class="texto-selecionado">"${escapeHtml(textoSelecionado)}"</div>
    `);
  }

  it('payload script createContextualFragment cria elemento script executavel', () => {
    const payload = '<script>window.__xss_c2_script = true;</script>';
    const fragment = criarFragmentoSeguro(payload);

    const scripts = fragment.querySelectorAll('script');

    // BUG ATUAL: scripts.length === 1 — o elemento script é criado.
    // CORRETO:   scripts.length === 0 — o texto deve ser escapado.
    expect(scripts.length).to.equal(0, 'Não deve criar elementos <script> a partir do texto selecionado pelo usuário');
  });

  it('payload img onerror: cria elemento com handler de evento', () => {
    const payload = '<img src=x onerror="window.__xss_c2_img = true">';
    const fragment = criarFragmentoSeguro(payload);

    const imgsComOnerror = Array.from(fragment.querySelectorAll('img')).filter(el => el.getAttribute('onerror'));

    // BUG ATUAL: imgsComOnerror.length === 1 — onerror criado no DOM.
    // CORRETO:   nenhum elemento <img> deve existir.
    expect(imgsComOnerror.length).to.equal(0, 'Não deve criar elementos <img> com onerror');
  });

  it('payload svg onload: cria elemento SVG com handler de evento', () => {
    const payload = '<svg onload="window.__xss_c2_svg = true"><rect/></svg>';
    const fragment = criarFragmentoSeguro(payload);

    const svgsComOnload = Array.from(fragment.querySelectorAll('svg')).filter(el => el.getAttribute('onload'));

    // BUG ATUAL: svgsComOnload.length === 1.
    expect(svgsComOnload.length).to.equal(0, 'Não deve criar elementos <svg> com onload');
  });

  it('payload de quebra de template: injeta elemento irmão fora do div', () => {
    // Fecha o div prematuramente e injeta HTML fora dele
    const payload = '"></div><img src=x onerror="window.__xss_c2_break = true"><div x="';
    const fragment = criarFragmentoSeguro(payload);

    // O payload deveria ser texto; com o bug, cria um <img> irmão do .texto-selecionado
    const imgs = fragment.querySelectorAll('img');

    // BUG ATUAL: imgs.length >= 1 — elemento <img> criado fora do contexto esperado.
    expect(imgs.length).to.equal(0, 'Payload de quebra de template não deve criar elementos HTML');
  });

  it('texto legítimo com caracteres HTML especiais deve ser exibido corretamente', () => {
    // Texto que um usuário real poderia digitar (operadores, expressões)
    const textoLegitimo = '5 > 3 && "texto" < "outro" & ampersand';
    const fragment = criarFragmentoSeguro(textoLegitimo);

    const container = fragment.querySelector('.texto-selecionado');
    expect(container).to.not.be.null;

    // Com a correção (textContent), o texto deve aparecer integralmente
    // como texto, não interpretado como HTML
    expect(container!.textContent).to.include('5 > 3', 'Caracteres > devem aparecer como texto literal');
    expect(container!.textContent).to.include('< "outro"', 'Caracteres < devem aparecer como texto literal');
  });
});

// SEÇÃO 2 — Testes de integração com remissaoInternaDialog (dependem de rootStore configurado com articulação real)
describe('C2 — XSS: integração com remissaoInternaDialog', () => {
  // Mock de Quill: permite controlar exatamente o que getText() retorna
  function criarMockQuill(textoSelecionado: string): any {
    return {
      getText: (): string => textoSelecionado,
      blur: (): void => {
        //empty
      },
      focus: (): void => {
        //empty
      },
    };
  }

  beforeEach(() => {
    // Configura rootStore com uma articulação real para que o dialog não
    // retorne antes de renderizar o conteúdo
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_905_2019, true);
    rootStore.dispatch({
      type: ABRIR_ARTICULACAO,
      articulacao: projetoNorma.articulacao!,
      classificacao: ClassificacaoDocumento.PROJETO,
    });

    // sl-dialog não está registrado como custom element no ambiente de teste,
    // portanto seus métodos show() e hide() não existem. Adicionamos stubs
    // para que o dialog possa ser instanciado sem lançar TypeError.
    if (!(HTMLElement.prototype as any).show) {
      (HTMLElement.prototype as any).show = async (): Promise<void> => {
        //empty
      };
    }
    if (!(HTMLElement.prototype as any).hide) {
      (HTMLElement.prototype as any).hide = async (): Promise<void> => {
        //empty
      };
    }
  });

  afterEach(() => {
    // Remove todos os sl-dialog adicionados ao body durante o teste
    document.querySelectorAll('sl-dialog').forEach(el => el.remove());
  });

  it('não deve criar elemento script no DOM quando textoSelecionado contem payload XSS', async () => {
    const payload = '<script>window.__xss_integration_script = true;</script>';
    const quill = criarMockQuill(payload);

    // range.length > 0 para que textoSelecionado seja processado na template
    await remissaoInternaDialog(quill, { index: 0, length: payload.length }, () => {
      //empty
    });

    const dialog = document.querySelector('sl-dialog');
    expect(dialog).to.not.be.null;

    const scripts = dialog!.querySelectorAll('script');

    // BUG ATUAL: scripts.length === 1 — o payload foi interpretado como HTML.
    // CORRETO:   scripts.length === 0.
    expect(scripts.length).to.equal(0, 'Não deve criar elementos <script> no dialogo');
  });

  it('nao deve criar elemento img com onerror no DOM', async () => {
    const payload = '<img alt="test" src="x" onerror="window.__xss_integration_img = true">';
    const quill = criarMockQuill(payload);

    await remissaoInternaDialog(quill, { index: 0, length: payload.length }, () => {
      //empty
    });

    const dialog = document.querySelector('sl-dialog');
    expect(dialog).to.not.be.null;

    const imgs = Array.from(dialog!.querySelectorAll('img')).filter(el => el.getAttribute('onerror'));

    // BUG ATUAL: imgs.length === 1.
    expect(imgs.length).to.equal(0, 'Não deve criar elementos img com onerror');
  });

  it('deve exibir texto com caracteres HTML como texto literal, não como markup', async () => {
    const textoComHtml = 'art. 1º <que> trata de algo & "outros"';
    const quill = criarMockQuill(textoComHtml);

    await remissaoInternaDialog(quill, { index: 0, length: textoComHtml.length }, () => {
      //empty
    });

    const dialog = document.querySelector('sl-dialog');
    expect(dialog).to.not.be.null;

    const textoSelecionadoDiv = dialog!.querySelector('.texto-selecionado');
    expect(textoSelecionadoDiv).to.not.be.null;

    // O textContent deve conter o texto original integralmente
    expect(textoSelecionadoDiv!.textContent).to.include('art. 1º');
    expect(textoSelecionadoDiv!.textContent).to.include('<que>', 'Os caracteres < e > devem aparecer como texto literal, não criar elementos HTML');
  });

  it('não deve renderizar .texto-selecionado quando textoSelecionado é vazio (range.length === 0)', async () => {
    // Quando o range tem comprimento zero, getText() retorna string vazia.
    // Nenhum div de texto selecionado deve ser exibido — e portanto nenhum
    // risco de injeção por essa via.
    const quill = criarMockQuill('');

    await remissaoInternaDialog(quill, { index: 0, length: 0 }, () => {
      //empty
    });

    const dialog = document.querySelector('sl-dialog');
    expect(dialog).to.not.be.null;

    const textoSelecionadoDiv = dialog!.querySelector('.texto-selecionado');
    expect(textoSelecionadoDiv).to.be.null;
  });
});
