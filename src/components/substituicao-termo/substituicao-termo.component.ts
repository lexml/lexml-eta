import { LitElement, TemplateResult, css, html } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { ComandoEmenda, SubstituicaoTermo } from '../../model/emenda/emenda';
import { ComandoEmendaBuilder } from '../../emenda/comando-emenda-builder';

@customElement('lexml-substituicao-termo')
export class SubstituicaoTermoComponent extends LitElement {
  static styles = css`
    span.alerta {
      color: red;
    }

    fieldset {
      display: flex;
      flex-direction: column;
      gap: 1em;
      background-color: var(--sl-color-gray-100);
      box-shadow: var(--sl-shadow-x-large);
      flex-wrap: wrap;
      padding: 20px 20px;
      margin: 10px;
      border: solid var(--sl-panel-border-width) var(--sl-panel-border-color);
      border-radius: var(--sl-border-radius-medium);
    }

    legend {
      background-color: var(--sl-color-gray-200);
      font-weight: bold;
      border-radius: 5px;
      border: 1px solid var(--sl-color-gray-300);
      padding: 2px 5px;
      box-shadow: var(--sl-shadow-small);
    }

    sl-radio-group::part(base) {
      display: flex;
      flex-direction: row;
      gap: 20px;
    }
    #flexaoGenero {
      margin-left: 20px;
    }
  `;

  @query('#tipoSubstituicaoTermo')
  elTipoSubstituicaoTermo!: HTMLInputElement;

  @query('#termoASerSubstituido')
  elTermoASerSubstituido!: HTMLInputElement;

  @query('#novoTermo')
  elNovoTermo!: HTMLInputElement;

  @query('#alertaTermoASerSubstituido')
  elAlertaTermoASerSubstituido!: HTMLSpanElement;

  @query('#alertaNovoTermo')
  elAlertaNovoTermo!: HTMLSpanElement;

  @query('#flexaoGenero')
  elFlexaoGenero!: HTMLInputElement;

  @query('#flexaoNumero')
  elFlexaoNumero!: HTMLInputElement;

  private timerEmitirEventoOnChange = 0;

  private onDadosAlterados(evt?: Event): void {
    const el = evt?.target as HTMLInputElement;
    el === this.elTermoASerSubstituido && this.elAlertaTermoASerSubstituido.style.setProperty('visibility', el.value ? 'hidden' : 'unset');
    el === this.elNovoTermo && this.elAlertaNovoTermo.style.setProperty('visibility', el.value ? 'hidden' : 'unset');
    this.agendarEmissaoEventoOnChange();
  }

  private agendarEmissaoEventoOnChange(origemEvento = 'substituicao-termo'): void {
    clearInterval(this.timerEmitirEventoOnChange);
    this.timerEmitirEventoOnChange = window.setTimeout(() => this.emitirEventoOnChange(origemEvento), 500);
  }

  private emitirEventoOnChange(origemEvento: string): void {
    this.dispatchEvent(
      new CustomEvent('onchange', {
        bubbles: true,
        composed: true,
        detail: {
          origemEvento,
        },
      })
    );
  }

  getComandoEmenda(urn: string): ComandoEmenda {
    return new ComandoEmendaBuilder(urn, this.getSubstituicaoTermo()).getComandoEmenda();
  }

  getSubstituicaoTermo(): SubstituicaoTermo {
    const ret = new SubstituicaoTermo();
    ret.tipo = (this.elTipoSubstituicaoTermo.querySelector('sl-radio[checked]') as any)?.value || 'Expressão';
    ret.termo = this.elTermoASerSubstituido.value || '(termo a ser substituído)';
    ret.novoTermo = this.elNovoTermo.value || '(novo termo)';
    ret.flexaoGenero = this.elFlexaoGenero.checked;
    ret.flexaoNumero = this.elFlexaoNumero.checked;
    return ret;
  }

  setSubstituicaoTermo(substituicaoTermo: SubstituicaoTermo): void {
    this.elTermoASerSubstituido.value = substituicaoTermo.tipo;
    this.elTermoASerSubstituido.value = substituicaoTermo.termo;
    this.elNovoTermo.value = substituicaoTermo.novoTermo;
    this.elFlexaoGenero.checked = substituicaoTermo.flexaoGenero;
    this.elFlexaoNumero.checked = substituicaoTermo.flexaoNumero;
    (this.shadowRoot?.querySelector(`sl-radio[value="${substituicaoTermo.tipo}"]`) as HTMLElement)?.click();
    this.agendarEmissaoEventoOnChange();

    if (this.elTermoASerSubstituido.value !== '') {
      this.elAlertaTermoASerSubstituido.style.setProperty('visibility', 'hidden');
    }

    if (this.elNovoTermo.value !== '') {
      this.elAlertaNovoTermo.style.setProperty('visibility', 'hidden');
    }
  }

  render(): TemplateResult {
    return html`
      <fieldset @input=${this.onDadosAlterados}>
        <legend>Substituição de termo em todo o texto</legend>
        <sl-radio-group id="tipoSubstituicaoTermo" value="Expressão" @sl-change=${this.onDadosAlterados}>
          <sl-radio value="Expressão">Expressão</sl-radio>
          <sl-radio value="Palavra">Palavra</sl-radio>
          <sl-radio value="Número">Número</sl-radio>
        </sl-radio-group>
        <div>
          <sl-input id="termoASerSubstituido" type="text" required label="Termo a ser substituído: *"></sl-input>
          <span id="alertaTermoASerSubstituido" class="alerta">Este campo deve ser preenchido</span>
        </div>
        <div>
          <sl-input id="novoTermo" type="text" required label="Novo termo: *"></sl-input>
          <span id="alertaNovoTermo" class="alerta">Este campo deve ser preenchido</span>
        </div>
        <div>
          <span>Propor fazer flexões de:</span>
          <sl-checkbox id="flexaoGenero">Gênero</sl-checkbox>
          <sl-checkbox id="flexaoNumero">Número</sl-checkbox>
        </div>
      </fieldset>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lexml-substituicao-termo': SubstituicaoTermoComponent;
  }
}
