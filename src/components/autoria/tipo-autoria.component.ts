import { html, TemplateResult } from 'lit-html';
import { LitElement, customElement, PropertyValues, property } from 'lit-element';
import { Autoria } from './../../model/autoria/autoria';

@customElement('lexml-tipo-autoria')
export class TipoAutoria extends LitElement {
  @property({ type: Object })
  autoria?: Autoria;

  createRenderRoot(): LitElement {
    return this;
  }

  update(changedProperties: PropertyValues): void {
    super.update(changedProperties);
  }

  atualizarObjeto(e: Event): void {
    this.autoria!.tipo = (e.target as HTMLInputElement).value;
  }

  render(): TemplateResult {
    return html`
      <div @input=${this.atualizarObjeto}>
        <div>
          <p><strong>Tipo de autoria</strong></p>

          <input type="radio" id="opt-parlamentar" name="tipoAutoria" value="Parlamentar" ?checked=${this.autoria?.tipo === 'Parlamentar'} />
          <label for="opt-parlamentar">Parlamentar</label>

          <input type="radio" id="opt-comissao" name="tipoAutoria" value="Comissão" ?checked=${this.autoria?.tipo === 'Comissão'} />
          <label for="opt-comissao">Comissão</label>
        </div>
      </div>
    `;
  }
}
