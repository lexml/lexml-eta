import { AutoriaComponent } from './../../src/components/autoria/autoria.component';
import { LitElement, html, TemplateResult, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { Autoria, Parlamentar } from '../../src/model/emenda/emenda';
@customElement('lexml-autoria-dialog')
export class AutoriaDialog extends LitElement {
  static styles = css`
    lexml-data,
    lexml-autoria {
      border: 1px solid #ccc;
      margin: 0 10px;
      padding: 5px 10px;
    }

    lexml-data {
      margin-top: 10px;
    }
  `;
  @state()
  autoria = new Autoria();

  @state()
  parlamentares: Parlamentar[] = [];

  async getParlamentares(): Promise<Parlamentar[]> {
    const _parlamentares = await (await fetch('https://emendas-api.herokuapp.com/parlamentares')).json();
    return _parlamentares.map(p => ({
      identificacao: p.id,
      nome: p.nome,
      sexo: p.sexo,
      siglaPartido: p.siglaPartido,
      siglaUF: p.siglaUF,
      siglaCasaLegislativa: p.siglaCasa,
    }));
  }

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

  exibirDados(original?: boolean): void {
    const el = this.shadowRoot?.querySelector('lexml-autoria') as AutoriaComponent;
    console.log(11111, 'EXIBIR AUTORIA', original ? el.autoria : el.getAutoriaAtualizada());
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
          <!-- <button @click=${(): void => this.exibirDados(true)}>Exibir Autoria Original</button> -->
          <!-- <button @click=${(): void => this.exibirDados(false)}>Exibir Autoria Atualizada</button> -->
        </div>
      </elix-dialog>
    `;
  }
}
