import { Parlamentar } from './../../model/autoria/parlamentar';
import { Autoria } from './../../model/autoria/autoria';
import { incluirNovoParlamentar, excluirParlamentar, moverParlamentar } from '../../model/autoria/parlamentarUtil';
import { LitElement, html, TemplateResult, PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';

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
    if (this.autoria && !this.autoria.parlamentares.length) {
      this.incluirNovoParlamentar();
    }
    super.update(changedProperties);
  }

  incluirNovoParlamentar(): void {
    this.autoria!.parlamentares = incluirNovoParlamentar(this.autoria!.parlamentares);
    this.requestUpdate();
  }

  moverParlamentar(parlamentar: Parlamentar, deslocamento: number): void {
    this.autoria!.parlamentares = moverParlamentar(this.autoria!.parlamentares, parlamentar, deslocamento);
    this.requestUpdate();
  }

  excluir(ev: CustomEvent): void {
    this.autoria!.parlamentares = excluirParlamentar(this.autoria!.parlamentares, ev.detail.parlamentar as Parlamentar);
    this.requestUpdate();
  }

  private montarParlamentarAutocomplete(parlamentar: Parlamentar, parlamentares: any): TemplateResult {
    return html`<lexml-parlamentar-autocomplete
      .parlamentar=${parlamentar}
      .parlamentares=${parlamentares}
      @paraBaixo=${(ev: CustomEvent): void => this.moverParlamentar(ev.detail.parlamentar as Parlamentar, 1)}
      @paraCima=${(ev: CustomEvent): void => this.moverParlamentar(ev.detail.parlamentar as Parlamentar, -1)}
      @excluir=${this.excluir}
    ></lexml-parlamentar-autocomplete>`;
  }

  render(): TemplateResult {
    return html`
      <div>
        <div class="lexml-autoria">
          <h3>Autoria</h3>
          <lexml-tipo-autoria .autoria=${this.autoria}></lexml-tipo-autoria>
          <div class="grid-autoria">
            <div>Parlamentar</div>
            <div>Cargo</div>
            <div></div>
          </div>
          ${this.autoria?.parlamentares.map(parlamentar => this.montarParlamentarAutocomplete(parlamentar, this.parlamentares))}
        </div>
        <button @click=${this.incluirNovoParlamentar}>Incluir outro parlamentar</button>
      </div>
    `;
  }
}
