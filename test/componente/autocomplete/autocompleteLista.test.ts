import { expect, fixture, html } from '@open-wc/testing';
import '../../../src/components/autocomplete/autocomplete-lista';
import type { AutocompleteListaComponent, ItemAutocompleteLista } from '../../../src/components/autocomplete/autocomplete-lista';

const ITENS: ItemAutocompleteLista[] = [
  { value: 'pl', label: 'PL' },
  { value: 'plp', label: 'PLP' },
  { value: 'pls', label: 'PLS', inativo: true },
  { value: 'ccj', label: 'CCJ - Comissão de Constituição, Justiça e Cidadania' },
];

describe('lexml-eta-autocomplete-lista', () => {
  let el: AutocompleteListaComponent;
  let eventos: string[];

  const atualizar = async (): Promise<void> => {
    await new Promise(r => setTimeout(r, 0));
    await el.updateComplete;
  };
  const campo = (): any => el.querySelector('sl-input');
  const itens = (): HTMLElement[] => Array.from(el.querySelectorAll<HTMLElement>('.ac-lista li'));
  const textos = (): string[] => itens().map(i => (i.textContent ?? '').trim());
  const abrir = async (): Promise<void> => {
    campo().dispatchEvent(new MouseEvent('click'));
    await atualizar();
  };
  const digitar = async (texto: string): Promise<void> => {
    campo().value = texto;
    campo().dispatchEvent(new CustomEvent('sl-input', { bubbles: true }));
    await atualizar();
  };
  const perderFoco = async (): Promise<void> => {
    campo().dispatchEvent(new CustomEvent('sl-blur', { bubbles: true }));
    await atualizar();
  };

  beforeEach(async () => {
    eventos = [];
    el = await fixture<AutocompleteListaComponent>(html`<lexml-eta-autocomplete-lista .items=${ITENS} placeholder="Sigla"></lexml-eta-autocomplete-lista>`);
    el.addEventListener('autocomplete-change', (e: Event) => eventos.push((e as CustomEvent).detail.value));
    await atualizar();
  });

  it('abre a lista flutuante com todos os itens ao clicar no campo', async () => {
    expect(itens().length).to.equal(0);
    await abrir();
    expect(textos()).to.deep.equal(['PL', 'PLP', 'PLS', 'CCJ - Comissão de Constituição, Justiça e Cidadania']);
    expect(getComputedStyle(el.querySelector('.ac-lista')!).position).to.equal('fixed');
  });

  it('seleciona um item pelo clique, exibe o rótulo e emite o valor', async () => {
    await abrir();
    itens()[1].click();
    await atualizar();

    expect(eventos).to.deep.equal(['plp']);
    expect(el.value).to.equal('plp');
    expect(campo().value).to.equal('PLP');
    expect(itens().length).to.equal(0);
  });

  it('filtra pelo texto digitado, sem acento e sem diferenciar maiúsculas', async () => {
    await abrir();
    await digitar('constituicao');
    expect(textos()).to.deep.equal(['CCJ - Comissão de Constituição, Justiça e Cidadania']);
    await digitar('xyz');
    expect(itens().length).to.equal(0);
  });

  it('não filtra pelo rótulo do item já selecionado ao reabrir', async () => {
    await abrir();
    itens()[0].click();
    await atualizar();
    await abrir();
    expect(itens().length).to.equal(ITENS.length);
  });

  it('digitar depois de selecionar desfaz a seleção', async () => {
    await abrir();
    itens()[0].click();
    await atualizar();
    eventos.length = 0;
    await digitar('PLP');
    expect(eventos).to.deep.equal(['']);
    expect(el.value).to.equal('');
  });

  it('ao perder o foco, texto que não é um item é apagado', async () => {
    await digitar('texto inválido');
    await perderFoco();
    expect(campo().value).to.equal('');
    expect(el.value).to.equal('');
    expect(itens().length).to.equal(0);
  });

  it('ao perder o foco, texto igual a exatamente um item o seleciona', async () => {
    await digitar('plp');
    await perderFoco();
    expect(el.value).to.equal('plp');
    expect(campo().value).to.equal('PLP');
    expect(eventos).to.deep.equal(['plp']);
  });

  it('ao perder o foco, texto parcial que casa vários itens é apagado', async () => {
    await digitar('P');
    await perderFoco();
    expect(campo().value).to.equal('');
    expect(el.value).to.equal('');
  });

  it('ao perder o foco com seleção válida, mantém o rótulo', async () => {
    await abrir();
    itens()[0].click();
    await atualizar();
    await perderFoco();
    expect(campo().value).to.equal('PL');
    expect(el.value).to.equal('pl');
  });

  it('o valor definido pelo pai aparece como rótulo e é limpo quando vazio', async () => {
    el.value = 'ccj';
    await atualizar();
    expect(campo().value).to.equal('CCJ - Comissão de Constituição, Justiça e Cidadania');
    el.value = '';
    await atualizar();
    expect(campo().value).to.equal('');
  });

  it('navega com as setas e escolhe com Enter; Esc fecha', async () => {
    const tecla = async (key: string): Promise<void> => {
      campo().dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
      await atualizar();
    };
    await tecla('ArrowDown');
    expect(itens().length).to.equal(ITENS.length);
    await tecla('ArrowDown');
    await tecla('Enter');
    expect(el.value).to.equal('plp');

    await tecla('ArrowDown');
    await tecla('Escape');
    expect(itens().length).to.equal(0);
  });

  it('item inativo aparece em cinza e continua selecionável', async () => {
    await abrir();
    const inativo = itens()[2];
    expect(getComputedStyle(inativo).color).to.equal('rgb(136, 136, 136)');
    inativo.click();
    await atualizar();
    expect(el.value).to.equal('pls');
  });

  it('a lista respeita a altura máxima, sem rolagem horizontal e com texto excedente omitido', async () => {
    el.alturaMaxima = 60;
    await atualizar();
    await abrir();
    const lista = el.querySelector<HTMLElement>('.ac-lista')!;
    const estilo = getComputedStyle(lista);
    expect([estilo.overflowX, estilo.overflowY, estilo.maxHeight]).to.deep.equal(['hidden', 'auto', '60px']);
    const item = getComputedStyle(itens()[0]);
    expect([item.textOverflow, item.whiteSpace]).to.deep.equal(['ellipsis', 'nowrap']);
    expect(lista.scrollHeight).to.be.greaterThan(lista.clientHeight);
  });

  it('desabilitado não abre a lista', async () => {
    el.disabled = true;
    await atualizar();
    await abrir();
    expect(itens().length).to.equal(0);
  });
});
