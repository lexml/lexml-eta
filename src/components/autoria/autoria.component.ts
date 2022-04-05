import { LitElement, html, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { Parlamentar } from './../../model/autoria/parlamentar';
import { Autoria } from './../../model/autoria/autoria';
import { incluirNovoParlamentar, excluirParlamentar, moverParlamentar } from '../../model/autoria/parlamentarUtil';
import { autoriaCss } from '../../assets/css/autoria.css';

import './lexml-autocomplete';

const estadoInicialAutoria: Autoria = {
  tipo: 'Parlamentar',
  parlamentares: [],
  indImprimirPartidoUF: false,
  qtdAssinaturasAdicionaisDeputados: 0,
  qtdAssinaturasAdicionaisSenadores: 0,
};

@customElement('lexml-autoria')
export class AutoriaComponent extends LitElement {
  static styles = [autoriaCss];

  @property({ type: Object })
  autoria: Autoria = { ...estadoInicialAutoria, parlamentares: [] };

  private _parlamentares: Parlamentar[] = [];

  @property({ type: Array })
  set parlamentares(value: Parlamentar[]) {
    // const oldValue = this._parlamentares;
    this._parlamentares = value;
    this.nomes = value.map(p => p.nome);
    // this.requestUpdate('parlamentares', oldValue);
  }

  get parlamentares(): Parlamentar[] {
    return this._parlamentares;
  }

  @state()
  titulo = 'Autoria';

  @state()
  nomes: string[] = [];

  // update(changedProperties: PropertyValues): void {
  //   if (this.autoria && !this.autoria.parlamentares.length) {
  //     this.incluirNovoParlamentar();
  //   }
  //   super.update(changedProperties);
  // }

  incluirNovoParlamentar(): void {
    this.titulo = this.titulo === 'Autoria' ? 'AUTORIA' : 'Autoria';
    this.autoria.parlamentares = incluirNovoParlamentar(this.autoria.parlamentares);
    // this.requestUpdate();
  }

  moverParlamentar(index: number, deslocamento: number): void {
    this.autoria.parlamentares = moverParlamentar(this.autoria.parlamentares, index, deslocamento);
    this.requestUpdate();
  }

  excluirParlamentar(index: number): void {
    this.autoria.parlamentares = excluirParlamentar(this.autoria.parlamentares, index);
    this.requestUpdate();
  }

  render(): TemplateResult {
    return html`
      <div>
        <div class="lexml-autoria">
          <h3>${this.titulo}</h3>
          ${this.getTipoAutoriaTemplate()} ${this.getParlamentaresTemplate()}
        </div>
        <button @click=${this.incluirNovoParlamentar}>Incluir outro parlamentar</button>
        <button @click=${(): void => console.log(11111, 'AUTORIA', this.autoria.parlamentares)}>Exibir AUTORIA</button>
      </div>
    `;
  }

  private getTipoAutoriaTemplate(): TemplateResult {
    return html`
      <div>
        <p><strong>Tipo de autoria</strong></p>
        <input type="radio" id="opt-parlamentar" name="tipoAutoria" value="Parlamentar" ?checked=${this.autoria?.tipo === 'Parlamentar'} />
        <label for="opt-parlamentar">Parlamentar</label>

        <input type="radio" id="opt-comissao" name="tipoAutoria" value="Comissão" ?checked=${this.autoria?.tipo === 'Comissão'} />
        <label for="opt-comissao">Comissão</label>
      </div>
    `;
  }

  private getParlamentaresTemplate(): TemplateResult {
    return html`
      <div class="grid-autoria">
        <div>Parlamentar</div>
        <div>Cargo</div>
        <div></div>
      </div>
      ${this.autoria?.parlamentares.map((_, index) => this.getParlamentarAutocompleteTemplate(index))}
    `;
  }

  private getParlamentarAutocompleteTemplate(index: number): TemplateResult {
    const parlamentar = this.autoria.parlamentares[index];
    return html`
      <div class="grid-autoria">
        <lexml-autocomplete .items=${this.nomes} .text=${parlamentar.nome} @autocomplete=${(ev: CustomEvent): void => this.atualizarParlamentar(ev, index)}></lexml-autocomplete>
        <input
          type="text"
          id="tex-cargo"
          placeholder="ex: Presidente da Comissão ..., Líder do ..."
          .value=${parlamentar.cargo ?? ''}
          @input=${(ev: Event): void => this.atualizarCargo(ev, index)}
        />
        <div>
          <button id="paraBaixo" @click=${(): void => this.moverParlamentar(index, 1)}>Para baixo</button>
          <button id="paraCima" @click=${(): void => this.moverParlamentar(index, -1)}>Para cima</button>
          <button id="excluir" @click=${(): void => this.excluirParlamentar(index)}>Excluir</button>
        </div>
      </div>
    `;
  }

  private atualizarParlamentar(ev: CustomEvent, index: number): void {
    const parlamentarAutocomplete = this.parlamentares.find(p => p.nome === ev.detail.value);
    if (parlamentarAutocomplete) {
      const { cargo } = this.autoria.parlamentares[index];
      this.autoria.parlamentares[index] = {
        ...parlamentarAutocomplete,
        cargo,
      };
    }

    // Sem a linha abaixo a atualização do cargo do último "novo parlamentar" inserido não funciona
    this.requestUpdate();
  }

  private atualizarCargo(ev: Event, index: number): void {
    this.autoria.parlamentares[index].cargo = (ev.target as HTMLInputElement).value;
  }
}
