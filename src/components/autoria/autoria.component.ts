import { Parlamentar } from './../../model/autoria/parlamentar';
import { Autoria } from './../../model/autoria/autoria';
import { customElement, LitElement, property, PropertyValues } from 'lit-element';
import { html, TemplateResult } from 'lit-html';
import { autoriaCss } from '../../assets/css/autoria.css';

export * from './tipo-autoria.component';
export * from './parlamentar-autocomplete.component';

@customElement('lexml-autoria')
export class AutoriaComponent extends LitElement {
  @property({ type: Object })
  autoria?: Autoria;

  @property({ type: Array })
  parlamentares?: Parlamentar[];

  static styles = [autoriaCss];

  update(changedProperties: PropertyValues): void {
    super.update(changedProperties);
  }

  private montarParlamentarAutocomplete(parlamentar: Parlamentar, parlamentares: any): TemplateResult {
    return html`<lexml-parlamentar-autocomplete .parlamentar=${parlamentar} .parlamentares=${parlamentares}></lexml-parlamentar-autocomplete>`;
  }

  render(): TemplateResult {
    return html`
      <div class="lexml-autoria">
        <h3>Autoria</h3>
        <lexml-tipo-autoria></lexml-tipo-autoria>
        ${this.autoria?.parlamentares.map(parlamentar => this.montarParlamentarAutocomplete(parlamentar, this.parlamentares))}
      </div>
    `;
  }
}
