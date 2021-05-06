import { css, customElement, html, LitElement, property, TemplateResult } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { Elemento } from '../../model/elemento';

@customElement('lexml-eta-elemento')
export class ElementoComponent extends LitElement {
  @property({ type: Object }) elemento!: Elemento;

  static styles = css`
    :host {
      display: block;
      padding: 0px;
      margin: 0px;
      font-family: Arial, sans-serif, 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
        'Noto Color Emoji';
      font-size: 1.1em;
      line-height: 1.2;
      color: #9d9d9d;
      text-transform: none !important;
    }

    p.rotulo {
      margin: 5px !important;
      color: #4a4a4a;
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
      color: #4a4a4a;
      font-weight: bolder;
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
