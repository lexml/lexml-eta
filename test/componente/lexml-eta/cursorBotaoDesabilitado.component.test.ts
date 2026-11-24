import { expect, fixture } from '@open-wc/testing';
import '../../../src';
import type { LexmlEtaComponent } from '../../../src';
import { novoDocumentoArticulado } from '../../doc/documentoArticulado';

// #1098: botão desabilitado da barra mostrava a mão, como se o clique fizesse alguma coisa.
describe('ETA — cursor dos botões desabilitados das barras de ferramentas', () => {
  let component: LexmlEtaComponent;

  const cursor = (el: Element): string => getComputedStyle(el).cursor;
  const nome = (b: HTMLButtonElement): string => b.title || b.className;

  // Mede o cursor no estado desabilitado e devolve o botão ao estado em que estava.
  const cursorDesabilitado = (b: HTMLButtonElement): string => {
    const antes = b.disabled;
    b.disabled = true;
    const valor = cursor(b);
    b.disabled = antes;
    return valor;
  };
  const comMaoQuandoDesabilitados = (barra: Element): string[] =>
    (Array.from(barra.querySelectorAll('button')) as HTMLButtonElement[]).filter(b => cursorDesabilitado(b) !== 'default').map(nome);

  const barraArticulacao = (): Element => component.querySelector('lexml-eta-proposicao-editor #lx-eta-barra-ferramenta')!;
  const justificacao = (): Element => Array.from(component.querySelectorAll('lexml-eta-editor-texto-rico')).find(e => e.querySelector('.ql-lexml-eta-comentario'))!;
  const barraJustificacao = (): Element => justificacao().querySelector('.ql-toolbar')!;

  beforeEach(async () => {
    component = await fixture<LexmlEtaComponent>('<lexml-eta></lexml-eta>');
    (component as any).getParlamentares = async (): Promise<[]> => [];
    await component.abrirDocumentoArticulado(novoDocumentoArticulado());
    const editor: any = component.querySelector('lexml-eta-proposicao-editor');
    await editor.aguardarCarregamentoDasLinhas();
    await new Promise(resolve => setTimeout(resolve, 50));
  });

  afterEach(() => {
    (component?.querySelector('lexml-eta-proposicao-editor') as any)?.cancelarTimerOnChangePendente?.();
  });

  describe('barra do texto articulado', () => {
    it('"Adicionar remissão" sem texto selecionado está desabilitado e mostra a seta', () => {
      const remissao = barraArticulacao().querySelector('.btn-remissao-interna') as HTMLButtonElement;
      expect(remissao.disabled, 'desabilitado').to.be.true;
      expect(cursor(remissao)).to.equal('default');
    });

    it('todo botão desabilitado mostra a seta', () => {
      expect(comMaoQuandoDesabilitados(barraArticulacao())).to.deep.equal([]);
    });

    it('botão habilitado continua mostrando a mão', () => {
      expect(cursor(barraArticulacao().querySelector('.ql-bold')!)).to.equal('pointer');
    });
  });

  describe('barra da justificação', () => {
    it('"Adicionar comentário" sem texto selecionado está desabilitado e mostra a seta', () => {
      const comentario = barraJustificacao().querySelector('.ql-lexml-eta-comentario') as HTMLButtonElement;
      expect(comentario.disabled, 'desabilitado').to.be.true;
      expect(cursor(comentario)).to.equal('default');
    });

    it('todo botão desabilitado mostra a seta', () => {
      expect(comMaoQuandoDesabilitados(barraJustificacao())).to.deep.equal([]);
    });

    it('botão habilitado continua mostrando a mão', () => {
      expect(cursor(barraJustificacao().querySelector('.ql-bold')!)).to.equal('pointer');
    });

    it('"Aceitar revisões" e "Rejeitar revisões" sem revisão mantêm o cursor de proibido', () => {
      ['.aceitar-revisao', '.rejeitar-revisao'].forEach(seletor => {
        const botao = justificacao().querySelector(seletor) as any;
        expect(botao.disabled, `${seletor} desabilitado`).to.be.true;
        expect(cursor(botao.shadowRoot.querySelector('[part="base"]')), seletor).to.equal('not-allowed');
      });
    });
  });
});
