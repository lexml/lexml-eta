import { Parlamentar } from './../../model/autoria/parlamentar';
import { Autoria } from './../../model/autoria/autoria';
import { customElement, LitElement, property, PropertyValues } from 'lit-element';
import { html, TemplateResult } from 'lit-html';
import { autoriaCss } from '../../assets/css/autoria.css';

@customElement('lexml-autoria')
export class AutoriaComponent extends LitElement {
  @property({ type: Object }) autoria = {};
  @property({ type: Array }) parlamentares = [];

  parlamentar: Parlamentar = {
    id: '',
    nome: '',
    siglaPartido: '',
    siglaUF: '',
    indSexo: '',
    siglaCasa: '',
    cargo: '',
  };

  private _autoria: Autoria = {
    tipo: '',
    parlamentares: [this.parlamentar],
    indImprimirPartidoUF: true,
    qtdAssinaturasAdicionaisDeputados: 0,
    qtdAssinaturasAdicionaisSenadores: 0,
  };

  static styles = [autoriaCss];

  update(changedProperties: PropertyValues): void {
    // TODO: atribuir dados para "_autoria"
    super.update(changedProperties);
  }

  private montarParlamentarAutocomplete(parlamentar: Parlamentar): TemplateResult {
    return html`<lexml-parlamentar-autocomplete .parlamentar=${parlamentar}></lexml-parlamentar-autocomplete>`;
  }

  render(): TemplateResult {
    return html`
      <div class="lexml-autoria">
        <lexml-tipo-autoria></lexml-tipo-autoria>
        ${this._autoria.parlamentares.map(this.montarParlamentarAutocomplete)}
      </div>
    `;
  }
}
