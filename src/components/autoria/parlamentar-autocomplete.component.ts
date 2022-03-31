import { html, TemplateResult } from 'lit-html';
import { LitElement, customElement, property, PropertyValues, css } from 'lit-element';
import { Parlamentar } from '../../model/autoria/parlamentar';

@customElement('lexml-parlamentar-autocomplete')
export class ParlamentarAutocomplete extends LitElement {
  static styles = css`
    .arrow {
      border: solid black;
      border-width: 0 3px 3px 0;
      display: inline-block;
      padding: 3px;
    }

    .up {
      transform: rotate(-135deg);
      -webkit-transform: rotate(-135deg);
    }

    .down {
      transform: rotate(45deg);
      -webkit-transform: rotate(45deg);
    }
  `;

  @property({ type: Array })
  parlamentares: Parlamentar[] = [];

  @property({ type: Object })
  parlamentar?: Parlamentar;

  update(changedProperties: PropertyValues): void {
    super.update(changedProperties);
  }

  montarItemAutocomplete(parlamentar: Parlamentar): TemplateResult {
    return html`<div>${parlamentar.nome}</div>`;
  }

  render(): TemplateResult {
    return html`
      <div>
        <label for="tex-parlamentar">Parlamentar</label>
        <elix-auto-complete-combo-box aria-label="parlamentar"> ${this.parlamentares.map(this.montarItemAutocomplete)} </elix-auto-complete-combo-box>

        <label for="tex-cargo">Cargo</label>
        <input type="text" id="tex-cargo" placeholder="ex: Presidente da Comissão ..., Líder do ..." />

        <button class="arrow down"></button>
        <button class="arrow up"></button>
      </div>
    `;
  }
}
