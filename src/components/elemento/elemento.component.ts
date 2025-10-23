import { LitElement, html, TemplateResult, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { Elemento } from '../../model/elemento';

@customElement('lexml-eta-emenda-elemento')
export class ElementoComponent extends LitElement {
  @property({ type: Object }) elemento!: Elemento;

  static styles = css`
    :host {
      display: block;
      padding: 0px;
      margin: 0px;
      font-family: sans-serif, 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
        'Noto Color Emoji';
      font-size: 1.1em;
      line-height: 1.2;
      color: #646260;
      text-transform: none !important;
    }

    p.rotulo {
      margin: 5px !important;
      color: #373634;
      font-weight: 600;
      text-align: center;
    }

    p.texto {
      margin: 5px !important;
    }

    p.texto-agrupador {
      margin: 5px !important;
      text-align: center;
    }

    span.rotulo {
      color: #373634;
      font-weight: 600;
    }
  `;

  render(): TemplateResult {
    return html`
      <div class="box">
        <div class="conteudo">${this.elemento.agrupador ? this.htmlAgrupador() : this.htmlDispositivo()}</div>
      </div>
    `;
  }

  private htmlAgrupador = (): TemplateResult =>
    html`<p class="rotulo">${this.elemento.rotulo}</p>
      <p class="texto-agrupador">${unsafeHTML(this.elemento?.conteudo?.texto ?? '')}</p>`;

  private htmlDispositivo = (): TemplateResult =>
    html`
      <p class="texto" style="${`padding-left: ${this.elemento.nivel * 20}px;`}">
        <span class="rotulo">${this.elemento.rotulo}</span>
        ${unsafeHTML(this.elemento?.conteudo?.texto ?? '')}
      </p>
    `;
}
