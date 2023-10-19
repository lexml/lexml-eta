import { LitElement, TemplateResult, css, html } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { ComandoEmenda, SubstituicaoTermo, TipoSubstituicaoTermo } from '../../model/emenda/emenda';
import { ComandoEmendaBuilder } from '../../emenda/comando-emenda-builder';

@customElement('lexml-substituicao-termo')
export class SubstituicaoTermoComponent extends LitElement {
  static styles = css`
    span.alerta {
      color: red;
    }
  `;

  @query('#termoASerSubstituido')
  private elTermoASerSubstituido!: HTMLInputElement;

  @query('#novoTermo')
  private elNovoTermo!: HTMLInputElement;

  @query('#alertaTermoASerSubstituido')
  private elAlertaTermoASerSubstituido!: HTMLSpanElement;

  @query('#alertaNovoTermo')
  private elAlertaNovoTermo!: HTMLSpanElement;

  @query('#flexaoGenero')
  private elFlexaoGenero!: HTMLInputElement;

  @query('#flexaoNumero')
  private elFlexaoNumero!: HTMLInputElement;

  private tipoSubstituicaoTermo: TipoSubstituicaoTermo = 'Expressão';

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

  getComandoEmenda(): ComandoEmenda {
    return new ComandoEmendaBuilder('', this.getSubstituicaoTermo()).getComandoEmenda();
  }

  getSubstituicaoTermo(): SubstituicaoTermo {
    const ret = new SubstituicaoTermo();
    ret.tipo = this.tipoSubstituicaoTermo;
    ret.termo = this.elTermoASerSubstituido.value || '(termo a ser substituído)';
    ret.novoTermo = this.elNovoTermo.value || '(novo termo)';
    ret.flexaoGenero = this.elFlexaoGenero.checked;
    ret.flexaoNumero = this.elFlexaoNumero.checked;
    return ret;
  }

  setSubstituicaoTermo(substituicaoTermo: SubstituicaoTermo): void {
    this.tipoSubstituicaoTermo = substituicaoTermo.tipo;
    this.elTermoASerSubstituido.value = substituicaoTermo.termo;
    this.elNovoTermo.value = substituicaoTermo.novoTermo;
    this.elFlexaoGenero.checked = substituicaoTermo.flexaoGenero;
    this.elFlexaoNumero.checked = substituicaoTermo.flexaoNumero;
    (this.shadowRoot?.querySelector(`sl-radio[value="${substituicaoTermo.tipo}"]`) as HTMLElement)?.click();
  }

  private updateTipoSubstituicaoTermo(evt: Event): void {
    this.tipoSubstituicaoTermo = (evt.target as any).value;
    this.onDadosAlterados();
  }

  render(): TemplateResult {
    return html`
      <sl-radio-group label="Substituição de termo em todo o texto" fieldset>
        <div>
          <sl-radio-group id="tipoSubstituicaoTermo" @click=${this.updateTipoSubstituicaoTermo}>
            <sl-radio name="tipoTermo" value="Expressão">Expressão</sl-radio>
            <sl-radio name="tipoTermo" value="Palavra">Palavra</sl-radio>
            <sl-radio name="tipoTermo" value="Número">Número</sl-radio>
          </sl-radio-group>
        </div>
        <div style="width:100%;margin-top:10px">
          <sl-input id="termoASerSubstituido" type="text" required="required" label="Termo a ser substituído:" @input=${this.onDadosAlterados}></sl-input>
          <span id="alertaTermoASerSubstituido" class="alerta">Este campo deve ser preenchido</span>
        </div>
        <div style="width:100%;margin-top:10px">
          <sl-input id="novoTermo" type="text" required="required" label="Novo termo:" @input=${this.onDadosAlterados}></sl-input>
          <span id="alertaNovoTermo" class="alerta">Este campo deve ser preenchido</span>
        </div>
        <div style="width:100%;margin-top:10px">
          Propor fazer flexões de:
          <sl-checkbox id="flexaoGenero" @input=${this.onDadosAlterados}>Gênero</sl-checkbox>
          <sl-checkbox id="flexaoNumero" @input=${this.onDadosAlterados}>Número</sl-checkbox>
        </div>
      </sl-radio-group>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lexml-substituicao-termo': SubstituicaoTermoComponent;
  }
}
