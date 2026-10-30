import '@shoelace-style/shoelace/dist/components/input/input';
import { html, LitElement, nothing, PropertyValues, TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';

export interface ItemAutocompleteLista {
  value: string;
  label: string;
  // Exibido em cinza (ex.: sigla inativa); continua selecionável.
  inativo?: boolean;
}

export const EVENTO_AUTOCOMPLETE_CHANGE = 'autocomplete-change';

const normalizar = (texto: string): string => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/**
 * Seleção de um item de uma lista fechada, com busca pelo texto digitado e lista flutuante (como a do select).
 * Valor digitado que não corresponde a um item é apagado ao perder o foco. Emite `autocomplete-change` com `detail.value`
 * ('' quando a seleção é desfeita).
 */
@customElement('lexml-eta-autocomplete-lista')
export class AutocompleteListaComponent extends LitElement {
  @property({ type: Array }) items: ItemAutocompleteLista[] = [];
  @property({ type: String }) value = '';
  @property({ type: String }) placeholder = '';
  @property({ type: String }) label = '';
  // Altura máxima da lista, em px; acima disso há rolagem vertical (nunca horizontal).
  @property({ type: Number }) alturaMaxima = 192;
  @property({ type: Boolean }) disabled = false;

  @state() private texto = '';
  @state() private aberta = false;
  @state() private destaque = 0;
  @state() private estiloLista = '';

  // Texto em edição: enquanto o usuário digita, o valor vindo do pai não sobrescreve o campo.
  private digitando = false;
  private filtrando = false;

  @query('sl-input') private campo?: HTMLElement;

  private readonly aoRolarOuRedimensionar = (): void => {
    if (this.aberta) this.posicionarLista();
  };

  createRenderRoot(): LitElement {
    return this;
  }

  connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener('resize', this.aoRolarOuRedimensionar);
    window.addEventListener('scroll', this.aoRolarOuRedimensionar, true);
  }

  disconnectedCallback(): void {
    window.removeEventListener('resize', this.aoRolarOuRedimensionar);
    window.removeEventListener('scroll', this.aoRolarOuRedimensionar, true);
    super.disconnectedCallback();
  }

  protected willUpdate(alterados: PropertyValues): void {
    if ((alterados.has('value') || alterados.has('items')) && !this.digitando) {
      this.texto = this.itemDoValor(this.value)?.label ?? '';
    }
  }

  private itemDoValor(valor: string): ItemAutocompleteLista | undefined {
    return valor ? this.items.find(i => i.value === valor) : undefined;
  }

  // Sem digitação, todos os itens; com texto, os que o contêm (sem acento e sem diferenciar maiúsculas).
  private get itensSugeridos(): ItemAutocompleteLista[] {
    const busca = this.filtrando ? normalizar(this.texto.trim()) : '';
    return busca ? this.items.filter(i => normalizar(i.label).includes(busca)) : this.items;
  }

  private emitir(valor: string): void {
    this.value = valor;
    this.dispatchEvent(new CustomEvent(EVENTO_AUTOCOMPLETE_CHANGE, { detail: { value: valor }, bubbles: true, composed: true }));
  }

  private abrir(): void {
    if (this.disabled) return;
    this.aberta = true;
    this.posicionarLista();
  }

  // A lista é fixa na janela (escapa do corte de modais e de áreas com rolagem); abre acima se faltar espaço abaixo.
  private posicionarLista(): void {
    if (!this.campo) return;
    const r = this.campo.getBoundingClientRect();
    const altura = Math.min(this.alturaMaxima, Math.max(this.itensSugeridos.length, 1) * 26);
    const abaixo = window.innerHeight - r.bottom;
    const acima = r.top;
    const posicaoVertical = abaixo >= altura || abaixo >= acima ? `top:${r.bottom + 2}px` : `bottom:${window.innerHeight - r.top + 2}px`;
    this.estiloLista = `${posicaoVertical};left:${r.left}px;width:${r.width}px;max-height:${this.alturaMaxima}px`;
  }

  private selecionar(item: ItemAutocompleteLista): void {
    this.digitando = false;
    this.filtrando = false;
    this.texto = item.label;
    this.aberta = false;
    if (item.value !== this.value) this.emitir(item.value);
  }

  private aoDigitar(texto: string): void {
    if (texto === this.texto) return;
    this.texto = texto;
    this.digitando = true;
    this.filtrando = true;
    this.destaque = 0;
    if (this.value) this.emitir('');
    this.abrir();
  }

  // Perde o foco: texto que não é um item é apagado; texto igual a exatamente um item o seleciona.
  private aoPerderFoco(): void {
    this.aberta = false;
    this.filtrando = false;
    if (!this.value) {
      const iguais = this.items.filter(i => normalizar(i.label) === normalizar(this.texto.trim()));
      if (this.texto.trim() && iguais.length === 1) {
        this.selecionar(iguais[0]);
        return;
      }
      this.texto = '';
    } else {
      this.texto = this.itemDoValor(this.value)?.label ?? '';
    }
    this.digitando = false;
  }

  private aoTeclar(e: KeyboardEvent): void {
    const sugeridos = this.itensSugeridos;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!this.aberta) {
        this.abrir();
        return;
      }
      const passo = e.key === 'ArrowDown' ? 1 : -1;
      this.destaque = Math.min(Math.max(this.destaque + passo, 0), Math.max(sugeridos.length - 1, 0));
    } else if (e.key === 'Enter' && this.aberta && sugeridos[this.destaque]) {
      e.preventDefault();
      this.selecionar(sugeridos[this.destaque]);
    } else if (e.key === 'Escape' && this.aberta) {
      e.stopPropagation();
      this.aberta = false;
    }
  }

  protected updated(alterados: PropertyValues): void {
    if (this.aberta && (alterados.has('aberta') || alterados.has('texto'))) this.posicionarLista();
  }

  render(): TemplateResult {
    const sugeridos = this.itensSugeridos;
    return html`
      <style>
        lexml-eta-autocomplete-lista {
          display: block;
        }
        lexml-eta-autocomplete-lista .ac-lista {
          position: fixed;
          z-index: 1000;
          box-sizing: border-box;
          list-style: none;
          margin: 0;
          padding: 4px 0;
          overflow-x: hidden;
          overflow-y: auto;
          background: #fff;
          border: 1px solid var(--sl-color-gray-300, #ccc);
          border-radius: 4px;
          box-shadow: var(--sl-shadow-large, 0 2px 8px rgba(0, 0, 0, 0.25));
        }
        lexml-eta-autocomplete-lista .ac-lista li {
          padding: 4px 12px;
          cursor: pointer;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        lexml-eta-autocomplete-lista .ac-lista li.ac-ativa {
          background: var(--sl-color-gray-100, #f5f5f5);
        }
        lexml-eta-autocomplete-lista .ac-lista li.ac-inativo {
          color: #888;
        }
      </style>
      <sl-input
        label=${this.label}
        placeholder=${this.placeholder}
        autocomplete="off"
        ?disabled=${this.disabled}
        .value=${this.texto}
        @sl-input=${(e: Event): void => this.aoDigitar((e.target as HTMLInputElement).value ?? '')}
        @sl-focus=${(): void => this.abrir()}
        @click=${(): void => this.abrir()}
        @sl-blur=${(): void => this.aoPerderFoco()}
        @keydown=${(e: KeyboardEvent): void => this.aoTeclar(e)}
      ></sl-input>
      ${this.aberta && sugeridos.length
        ? html`<ul class="ac-lista" style=${this.estiloLista} @mousedown=${(e: Event): void => e.preventDefault()}>
            ${sugeridos.map(
              (item, i) =>
                html`<li
                  class="${i === this.destaque ? 'ac-ativa' : ''} ${item.inativo ? 'ac-inativo' : ''}"
                  data-value=${item.value}
                  title=${item.label}
                  @click=${(): void => this.selecionar(item)}
                >
                  ${item.label}
                </li>`
            )}
          </ul>`
        : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lexml-eta-autocomplete-lista': AutocompleteListaComponent;
  }
}
