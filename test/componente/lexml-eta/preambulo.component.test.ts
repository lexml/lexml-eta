import { expect, fixture } from '@open-wc/testing';
import { LexmlEtaComponent } from '../../../src';
import { novoDocumentoArticulado } from '../../doc/documentoArticulado';

const tiposDasLinhas = (component: LexmlEtaComponent): (string | undefined)[] =>
  Array.from(component.querySelectorAll('[class*="elemento-tipo-"]')).map(linha => /elemento-tipo-(\w+)/.exec(linha.className)?.[1]);

describe('ETA — exibição do preâmbulo no editor', () => {
  let component: LexmlEtaComponent;
  let editor: any;

  beforeEach(async () => {
    component = await fixture<LexmlEtaComponent>('<lexml-eta></lexml-eta>');
    (component as any).getParlamentares = async (): Promise<[]> => [];
    await component.abrirDocumentoArticulado(novoDocumentoArticulado());
    editor = component.querySelector('lexml-eta-proposicao-editor');
    await editor.aguardarCarregamentoDasLinhas();
  });

  it('exibe a linha do preâmbulo depois da ementa e antes do primeiro artigo', () => {
    const tipos = tiposDasLinhas(component);
    const indice = tipos.indexOf('preambulo');
    expect(indice).to.be.greaterThan(-1);
    expect(tipos[indice - 1]).to.equal('ementa');
    expect(tipos[indice + 1]).to.equal('artigo');
  });

  it('a linha do preâmbulo é bloqueada, com a classe própria e sem recuo', () => {
    const linha = component.querySelector('.elemento-tipo-preambulo') as HTMLElement;
    expect(linha.getAttribute('bloqueado')).to.equal('true');
    expect(linha.classList.contains('preambulo')).to.be.true;
    expect(linha.classList.contains('h-artigo')).to.be.false;
  });

  it('exibe o texto do preâmbulo em uma única linha, sem rótulo visível', () => {
    const linha = component.querySelector('.elemento-tipo-preambulo') as HTMLElement;
    expect(linha.textContent).to.include('O Congresso Nacional decreta:');
    expect(linha.textContent).to.include('Segundo parágrafo do preâmbulo.');
    expect(getComputedStyle(linha.querySelector('.texto__rotulo--preambulo')!).display).to.equal('none');
  });

  it('o preâmbulo não oferece ações de edição', () => {
    const linha = component.querySelector('.elemento-tipo-preambulo') as HTMLElement;
    // Booleanos: um expect falho sobre o elemento tenta serializar o DOM inteiro e trava o navegador.
    expect(!!linha.querySelector('sl-menu-item')).to.be.false;
  });
});
