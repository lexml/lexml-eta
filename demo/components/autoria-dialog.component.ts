import { AutoriaComponent } from './../../src/components/autoria/autoria.component';
import { LitElement, html, TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { Autoria } from '../../src/model/autoria/autoria';
import { Parlamentar } from '../../src/model/autoria/parlamentar';

@customElement('lexml-autoria-dialog')
export class AutoriaDialog extends LitElement {
  @state()
  autoria: Autoria = {
    tipo: 'Parlamentar',
    parlamentares: [],
    indImprimirPartidoUF: false,
    qtdAssinaturasAdicionaisDeputados: 0,
    qtdAssinaturasAdicionaisSenadores: 0,
  };

  @state()
  parlamentares: Parlamentar[] = [];

  async getParlamentares(): Promise<Parlamentar[]> {
    return (await fetch('https://emendas-api.herokuapp.com/parlamentares')).json();
  }

  // update(changedProperties: PropertyValues): void {
  //   this.getParlamentares().then(dados => {
  //     this.parlamentares = dados;
  //     this.autoria = {
  //       tipo: 'Parlamentar',
  //       parlamentares: dados,
  //       indImprimirPartidoUF: true,
  //       qtdAssinaturasAdicionaisDeputados: 0,
  //       qtdAssinaturasAdicionaisSenadores: 0,
  //     };
  //     super.update(changedProperties);
  //   });
  // }

  constructor() {
    super();
    this.getParlamentares().then(parlamentares => (this.parlamentares = parlamentares));
  }

  open(): void {
    this.getDialog()?.open();
  }

  close(): void {
    this.getDialog()?.close();
  }

  exibirDados(): void {
    const el = this.shadowRoot?.querySelector('lexml-autoria') as AutoriaComponent;
    console.log(11111, 'EXIBIR AUTORIA', el.autoria);
  }

  id = 'autoriaDialog';
  private getDialog(): any {
    return this.shadowRoot?.getElementById(this.id) as any;
  }

  render(): TemplateResult {
    return html`
      <style>
        .lexml-dialog-footer {
          padding: 10px;
        }
      </style>
      <elix-dialog id=${this.id}>
        <lexml-data></lexml-data>
        <hr />
        <lexml-autoria .parlamentares=${this.parlamentares} .autoria=${this.autoria}></lexml-autoria>
        <div class="lexml-dialog-footer">
          <button @click=${this.close}>OK</button>
          <button @click=${this.close}>Cancelar</button>
          <!-- <button @click=${this.exibirDados}>Exibir dados</button> -->
        </div>
      </elix-dialog>
    `;
  }
}
