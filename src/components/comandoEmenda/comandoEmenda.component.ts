import { customElement, LitElement, property, PropertyValues } from 'lit-element';
import { html, TemplateResult } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';

@customElement('lexml-emenda-comando')
export class ComandoEmendaComponent extends LitElement {
  @property({ type: Object }) emenda;

  update(changedProperties: PropertyValues): void {
    super.update(changedProperties);
  }

  buildTemplateComando(comandos: any[]): TemplateResult {
    const res = comandos?.reduce((acumulador, comando) => acumulador + `<p> ${comando.cabecalho} </p>`, '');
    return html`${res}`;
  }

  buildTemplateCitacao(citacao: any): string {
    // eslint-disable-next-line prettier/prettier
    const corpo = citacao
      .replaceAll('<Rotulo>', '<b>')
      .replaceAll('</Rotulo>', '</b> ')
      .replaceAll('<Omissis/>', ' ..........................................................');

    return corpo;
  }

  render(): TemplateResult {
    const comandos = this.emenda?.comandos;
    return html`
      <style>
        .lexml-emenda-comando {
          display: block;
          border: 1px solid #ccc;
          height: 100%;
          padding: 0 10px;
          margin: 0px 5px;
          font-size: 14px;
        }

        .lexml-emenda-comando:focus {
          outline: 0;
          border: 0px solid #f1f1f1;
          -webkit-box-shadow: 0px;
          box-shadow: none;
        }

        .lexml-emenda-tituloComando {
          margin: 3px 10px;
          text-align: center;
          font-weight: bold;
        }

        .lexml-emenda-cabecalhoComando {
          display: block;
          margin-top: 1em;
          text-align: justify;
          text-indent: 3em;
        }

        .lexml-emenda-citacaoComando {
          display: block;
          margin-top: 1em;
        }

        .lexml-emenda-citacaoComando p {
          text-align: justify;
          text-indent: 3em;
          margin: 0;
        }
      </style>

      <div class="lexml-emenda-comando">
        <p class="lexml-emenda-tituloComando">Comando de emenda</p>
        <p>${(this.emenda as any)?.comandoEmenda?.cabecalhoComum}</p>

        ${comandos?.map(comando => {
          return html`
            ${unsafeHTML(
              '<div class="lexml-emenda-cabecalhoComando">' +
                comando.cabecalho +
                '</div>' +
                '<div class="lexml-emenda-citacaoComando">' +
                this.buildTemplateCitacao(comando.citacao) +
                '</div>'
            )}
          `;
        })}
      </div>
    `;
  }
}
