import { expect, fixture } from '@open-wc/testing';
import '../../../src';
import type { LexmlEtaComponent } from '../../../src';
import { novoDocumentoArticulado } from '../../doc/documentoArticulado';

// #1091: controles da barra da justificação sem dica (link e os dois menus de tabela).
describe('ETA — dicas da barra de ferramentas da justificação', () => {
  let barra: HTMLElement;

  const dica = (seletor: string, indice = 0): string | null => barra.querySelectorAll(seletor)[indice]?.getAttribute('title') ?? null;

  beforeEach(async () => {
    const component = await fixture<LexmlEtaComponent>('<lexml-eta></lexml-eta>');
    (component as any).getParlamentares = async (): Promise<[]> => [];
    await component.abrirDocumentoArticulado(novoDocumentoArticulado());
    const editor: any = component.querySelector('#lexml-eta-editor-texto-rico-justificativa');
    barra = editor.quill.getModule('toolbar').container;
  });

  it('inserir link, inserir tabela e formatar tabela têm dica', () => {
    expect(dica('button.ql-link')).to.equal('Inserir link');
    expect(dica('.ql-picker.ql-table .ql-picker-label', 0)).to.equal('Inserir tabela');
    expect(dica('.ql-picker.ql-table .ql-picker-label', 1)).to.equal('Formatar tabela');
  });

  it('alinhamento e estilo do parágrafo têm dica', () => {
    expect(dica('.ql-picker.ql-align .ql-picker-label')).to.equal('Alinhamento');
    expect(dica('.ql-picker.ql-estilo .ql-picker-label')).to.equal('Estilo do parágrafo');
  });

  it('todo botão e rótulo de menu da barra tem dica', () => {
    const semDica = Array.from(barra.querySelectorAll('button, .ql-picker-label'))
      .filter(el => !el.getAttribute('title')?.trim())
      .map(el => el.className || el.tagName);
    expect(semDica).to.deep.equal([]);
  });

  it('os itens dos menus de tabela não ganham a dica do rótulo', () => {
    const comDica = Array.from(barra.querySelectorAll('.ql-picker.ql-table, .ql-picker.ql-table .ql-picker-item')).filter(el => el.hasAttribute('title'));
    expect(comDica.length).to.equal(0);
  });
});
