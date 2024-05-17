import { html, LitElement, PropertyValues, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { Alerta } from '../../model/alerta/alerta';
import { rootStore } from '../../redux/store';
import { connect } from 'pwa-helpers';
@customElement('lexml-emenda-comando')
export class ComandoEmendaComponent extends connect(rootStore)(LitElement) {
  @property({ type: Object }) emenda;
  @property({ type: Array }) alertas: Alerta[] = [];

  update(changedProperties: PropertyValues): void {
    super.update(changedProperties);
  }

  stateChanged(state: any): void {
    this.alertas = state.elementoReducer.ui?.alertas || [];
  }

  buildTemplateComando(comandos: any[]): TemplateResult {
    const res = comandos?.reduce((acumulador, comando) => acumulador + `<p> ${comando.cabecalho} </p>`, '');
    return html`${res}`;
  }

  buildTemplateCitacao(citacao: any): string {
    // eslint-disable-next-line prettier/prettier
    const corpo = citacao
      .replaceAll(/<p[^>]*?>((?:(?!<p).)*?<Omissis\/>[^<]*?)<\/p>/gm, '<div class="container-omissis">$1</div>')
      .replaceAll(
        '<Omissis/>',
        '<span>................................................................................................................................................................................................................................................................................................................................................</span>'
      )
      .replaceAll('<Rotulo>', '<b>')
      .replaceAll('</Rotulo>', '</b> ')
      .replaceAll('<Rotulo/>', '')
      .replaceAll('<Alteracao>', '<div class="alteracao">')
      .replaceAll('</Alteracao>', '</div> ');

    return corpo;
  }

  render(): TemplateResult {
    const cabecalhoComum = this.emenda?.cabecalhoComum;
    const comandos = this.emenda?.comandos;
    return html`
      <style>
        :host {
          --lexml-emenda-comando-height: 100%;
          --lexml-emenda-comando-overflow: hidden;
          --lexml-emenda-comando-border: 1px solid #ccc;
        }
        .lexml-emenda-comando {
          display: block;
          height: var(--lexml-emenda-comando-height);
          overflow: var(--lexml-emenda-comando-overflow);
          overflow-y: auto;
          padding: 0px 10px;
          font-size: 18px;
          font-family: 'Times New Roman', Times, serif;
          text-align: justify;
        }
        .lexml-emenda-comando:focus {
          outline: 0;
          border: 0px solid #f1f1f1;
          -webkit-box-shadow: 0px;
          box-shadow: none;
        }

        .lexml-emenda-cabecalhoComando {
          display: block;
          margin-top: 1em;
          text-indent: 3em;
        }

        .lexml-emenda-citacaoComando {
          display: block;
          margin-top: 1em;
        }

        .lexml-emenda-complementoComando {
          margin-top: 1em;
        }

        .lexml-emenda-citacaoComando p {
          /* text-align: justify; */
          text-indent: 3em;
          margin: 0;
        }

        .lexml-emenda-citacaoComando p.ementa {
          text-indent: 0;
          margin-left: 30%;
        }

        .lexml-emenda-citacaoComando p.agrupador {
          text-indent: 0;
          text-align: center;
        }

        .lexml-emenda-citacaoComando p.secao,
        .lexml-emenda-citacaoComando p.subsecao {
          font-weight: bold;
        }

        .lexml-emenda-citacaoComando div.alteracao {
          margin-left: 4em;
        }

        .lexml-emenda-citacaoComando div.alteracao p {
          text-indent: 2em;
        }

        .lexml-emenda-citacaoComando .container-omissis {
          margin-left: 3em;
          display: flex;
          flex-direction: row;
          align-items: flex-start;
        }

        .lexml-emenda-citacaoComando div.alteracao .container-omissis {
          margin-left: 2em;
        }

        .lexml-emenda-citacaoComando .container-omissis b {
          font-weight: bold;
          padding-right: 4px;
        }

        .lexml-emenda-citacaoComando .container-omissis span {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex-grow: 1;
          width: 50px;
          white-space: nowrap;
        }

        .mensagem {
          font-size: 0.8em;
          font-weight: normal;
          text-align: left;
          border: 1px solid;
          padding: 4px 10px;
          margin: 10px 0;
          display: inline-block;
          border-radius: 2px;
          font-family: var(--sl-font-sans);
        }
        .mensagem--warning {
          color: #856404;
          background-color: #fff3cd;
          border-color: #ffeeba;
        }
        .mensagem--danger {
          color: #721c24;
          background-color: #f8d7da;
          border-color: #f5c6cb;
        }
      </style>

      <div class="lexml-emenda-comando">
        ${(this.alertas || [])
          .filter(alerta => alerta.exibirComandoEmenda)
          .map(alerta => html`<div class="lexml-emenda-complementoComando mensagem mensagem--danger">${alerta.mensagem}</div>`)}
        ${cabecalhoComum ? unsafeHTML(`<p class="lexml-emenda-cabecalhoComando">${cabecalhoComum}</p>`) : ''}
        ${comandos?.map(comando => {
          return unsafeHTML(
            '<div class="lexml-emenda-cabecalhoComando">' +
              (comando.rotulo ? `<strong>${comando.rotulo}</strong> ` : '') +
              comando.cabecalho +
              '</div>' +
              '<div class="lexml-emenda-citacaoComando">' +
              this.buildTemplateCitacao(comando.citacao) +
              '</div>' +
              (comando.complemento ? '<div class="lexml-emenda-complementoComando mensagem mensagem--warning">' + comando.complemento + '</div>' : '')
          );
        })}
      </div>
    `;
  }
}
