import { html, TemplateResult } from 'lit-html';
import { LitElement, customElement, PropertyValues } from 'lit-element';

@customElement('lexml-tipo-autoria')
export class TipoAutoria extends LitElement {
  update(changedProperties: PropertyValues): void {
    super.update(changedProperties);
  }

  render(): TemplateResult {
    return html`
      <div>
        <div>
          <p><strong>Tipo de autoria</strong></p>

          <input type="radio" id="opt-parlamentar" />
          <label for="opt-parlamentar">Parlamentar</label>

          <input type="radio" id="opt-comissao" />
          <label for="opt-comissao">Comissão</label>
        </div>
      </div>
    `;
  }
}
