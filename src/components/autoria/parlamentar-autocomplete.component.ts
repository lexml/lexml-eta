import { LitElement, html, TemplateResult, PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { Parlamentar } from '../../model/autoria/parlamentar';
import { autoriaCss } from '../../assets/css/autoria.css';

@customElement('lexml-parlamentar-autocomplete')
export class ParlamentarAutocomplete extends LitElement {
  static styles = [autoriaCss];

  @property({ type: Array })
  parlamentares: Parlamentar[] = [];

  @property({ type: Object })
  parlamentar?: Parlamentar;

  createRenderRoot(): LitElement {
    return this;
  }

  update(changedProperties: PropertyValues): void {
    super.update(changedProperties);
  }

  montarItemAutocomplete(parlamentar: Parlamentar): TemplateResult {
    return html`<div>${parlamentar.nome}</div>`;
  }

  emitEvent(tipo: string): void {
    const ev = new CustomEvent(tipo, {
      detail: {
        parlamentar: this.parlamentar,
      },
    });
    this.dispatchEvent(ev);
  }

  atualizarObjeto(): void {
    const inputs = this.getElementsByTagName('input');
    this.parlamentar!.nome = inputs[0].value;
    this.parlamentar!.cargo = inputs[1].value;
  }

  render(): TemplateResult {
    return html`
      <div class="grid-autoria" @input=${this.atualizarObjeto}>
        <!-- <label for="tex-parlamentar">Parlamentar</label> -->
        <!-- <elix-auto-complete-combo-box aria-label="parlamentar"> ${this.parlamentares.map(this.montarItemAutocomplete)} </elix-auto-complete-combo-box> -->
        <input type="text" aria-label="parlamentar" placeholder="Digite o nome..." value=${this.parlamentar?.nome || ''} />

        <!-- <label for="tex-cargo">Cargo</label> -->
        <input type="text" id="tex-cargo" placeholder="ex: Presidente da Comissão ..., Líder do ..." />

        <div>
          <button id="paraBaixo" @click=${(): void => this.emitEvent('paraBaixo')}>Para baixo</button>
          <button id="paraCima" @click=${(): void => this.emitEvent('paraCima')}>Para cima</button>
          <button id="excluir" @click=${(): void => this.emitEvent('excluir')}>Excluir</button>
        </div>
      </div>
    `;
  }
}
