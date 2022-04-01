import { LitElement, html, TemplateResult, PropertyValues } from 'lit';
import { customElement } from 'lit/decorators.js';

import { Autoria } from '../../src/model/autoria/autoria';
import { Parlamentar } from '../../src/model/autoria/parlamentar';

const listaParlamentares: Parlamentar[] = [
  {
    id: '1',
    nome: 'Erivânio Vasconcelos',
    siglaPartido: 'PX',
    siglaUF: 'DF',
    siglaCasa: 'CD',
    cargo: '',
    indSexo: 'M',
  },
  {
    id: '2',
    nome: 'João Holanda',
    siglaPartido: 'PX',
    siglaUF: 'DF',
    siglaCasa: 'SF',
    cargo: '',
    indSexo: 'M',
  },
  {
    id: '3',
    nome: 'Marcos Fragomeni',
    siglaPartido: 'PX',
    siglaUF: 'DF',
    siglaCasa: 'SF',
    cargo: '',
    indSexo: 'M',
  },
  {
    id: '4',
    nome: 'Robson Barros',
    siglaPartido: 'PX',
    siglaUF: 'DF',
    siglaCasa: 'CD',
    cargo: '',
    indSexo: 'M',
  },
];

@customElement('lexml-autoria-dialog')
export class AutoriaDialog extends LitElement {
  autoria?: Autoria;
  parlamentares: Parlamentar[] = [];

  getParlamentares(): PromiseLike<Parlamentar[]> {
    return Promise.resolve(listaParlamentares);
  }

  update(changedProperties: PropertyValues): void {
    this.getParlamentares().then(dados => {
      this.parlamentares = dados;
      this.autoria = {
        tipo: 'Parlamentar',
        parlamentares: dados,
        indImprimirPartidoUF: true,
        qtdAssinaturasAdicionaisDeputados: 0,
        qtdAssinaturasAdicionaisSenadores: 0,
      };
      super.update(changedProperties);
    });
  }

  open(): void {
    this.getDialog()?.open();
  }

  close(): void {
    this.getDialog()?.close();
  }

  exibirDados(): void {
    console.log(11111, 'EXIBIR AUTORIA', this.autoria);
  }

  id = 'autoriaDialog';
  private getDialog(): any {
    return this.shadowRoot?.getElementById(this.id) as any;
  }

  render(): TemplateResult {
    return html`
      <elix-dialog id=${this.id}>
        <lexml-autoria .parlamentares=${this.parlamentares} .autoria=${this.autoria}></lexml-autoria>
        <div>
          <button @click=${this.close}>OK</button>
          <button @click=${this.close}>Cancelar</button>
          <button @click=${this.exibirDados}>Exibir dados</button>
        </div>
      </elix-dialog>
    `;
  }
}
