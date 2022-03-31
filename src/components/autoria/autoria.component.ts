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
    if (this.autoria && !this.autoria.parlamentares.length) {
      this.incluirNovoParlamentar();
    }
    super.update(changedProperties);
  }

  incluirNovoParlamentar(): void {
    this.autoria?.parlamentares.push({
      id: this.autoria.parlamentares.length + 1 + '',
      nome: 'Parlamentar ' + (this.autoria.parlamentares.length + 1),
      siglaPartido: '',
      siglaUF: '',
      indSexo: '',
      siglaCasa: '',
      cargo: '',
    });

    this.requestUpdate();
  }

  moverParlamentar(parlamentar: Parlamentar, deslocamento: number): void {
    const parlamentares = this.autoria!.parlamentares;
    const index = parlamentares.findIndex(p => p.id === parlamentar.id);
    const newIndex = index + deslocamento;

    if (newIndex < 0 || newIndex >= parlamentares.length) {
      return;
    }

    parlamentares.splice(newIndex, 0, parlamentares.splice(index, 1)[0]);
    this.autoria!.parlamentares = parlamentares;
    this.requestUpdate();
  }

  moverParaBaixo(ev: CustomEvent): void {
    this.moverParlamentar(ev.detail.parlamentar as Parlamentar, 1);
  }

  moverParaCima(ev: CustomEvent): void {
    this.moverParlamentar(ev.detail.parlamentar as Parlamentar, -1);
  }

  excluir(ev: CustomEvent): void {
    const parlamentar = ev.detail.parlamentar as Parlamentar;
    this.autoria!.parlamentares = this.autoria!.parlamentares.filter(p => p.id !== parlamentar.id);
    this.requestUpdate();
  }

  private montarParlamentarAutocomplete(parlamentar: Parlamentar, parlamentares: any): TemplateResult {
    return html`<lexml-parlamentar-autocomplete
      .parlamentar=${parlamentar}
      .parlamentares=${parlamentares}
      @paraBaixo=${this.moverParaBaixo}
      @paraCima=${this.moverParaCima}
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
