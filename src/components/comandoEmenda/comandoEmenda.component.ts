import { customElement, LitElement, property, PropertyValues } from 'lit-element';
import { html, TemplateResult } from 'lit-html';

@customElement('lexml-emenda-comando')
export class ComandoEmendaComponent extends LitElement {
  @property({ type: Object }) emenda = {};

  createRenderRoot(): LitElement {
    return this;
  }

  update(changedProperties: PropertyValues): void {
    super.update(changedProperties);
  }

  render(): TemplateResult {
    return html`
      <style>
        #gtx-trans {
          display: none;
        }

        lexml-emenda-comando {
          display: block;
          height: 100%;
          margin: 10px;
          padding: 10px;
        }

        lexml-emenda-comando:focus {
          outline: 0;
          border: 0px solid #f1f1f1;
          -webkit-box-shadow: 0px;
          box-shadow: none;
        }

        .lexml-emenda-tituloComando {
          font-size: 16px;
        }

        .lexml-emenda-corpoComando {
          font-size: 14px;
          padding: 20px;
        }

        .lexml-emenda-cabecalhoComando {
        }

        .lexml-emenda-citacaoComando {
        }
      </style>

      <section class="lexml-emenda-comando">
        <h1 class="lexml-emenda-tituloComando">Comando de emenda</h1>
        <div class="lexml-emenda-corpoComando lexml-emenda-cabecalhoComando">Cabeçalho do comando de emenda</div>
        <div class="lexml-emenda-corpoComando lexml-emenda-citacaoComando">Citação do comando de emenda</div>
      </section>
    `;
  }
}
