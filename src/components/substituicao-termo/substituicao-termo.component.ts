import { LitElement, TemplateResult, html } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { ComandoEmenda, SubstituicaoTermo, TipoSubstituicaoTermo } from '../../model/emenda/emenda';
import { ComandoEmendaBuilder } from '../../emenda/comando-emenda-builder';
import SlRadioGroup from '@shoelace-style/shoelace/dist/components/radio-group/radio-group.js';

@customElement('lexml-substituicao-termo')
export class SubstituicaoTermoComponent extends LitElement {
  @query('#tipoSubstituicaoTermo')
  private elTipoSubstituicaoTermo!: SlRadioGroup;

  @query('#termoASerSubstituido')
  private elTermoASerSubstituido!: HTMLInputElement;

  @query('#novoTermo')
  private elNovoTermo!: HTMLInputElement;

  @query('#flexaoGenero')
  private elFlexaoGenero!: HTMLInputElement;

  @query('#flexaoNumero')
  private elFlexaoNumero!: HTMLInputElement;

  private tipoSubstituicaoTermo: TipoSubstituicaoTermo = 'Expressão';

  private timerEmitirEventoOnChange = 0;

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
    this.agendarEmissaoEventoOnChange();
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
          <sl-input id="termoASerSubstituido" type="text" label="Termo a ser substituído:" required @input=${(): void => this.agendarEmissaoEventoOnChange()}></sl-input>
          <span class="alerta-preenchimento">Este campo deve ser preenchido</span>
        </div>
        <div style="width:100%;margin-top:10px">
          <sl-input id="novoTermo" type="text" label="Novo termo:" required @input=${(): void => this.agendarEmissaoEventoOnChange()}></sl-input>
          <span class="alerta-preenchimento">Este campo deve ser preenchido</span>
        </div>
        <div style="width:100%;margin-top:10px">
          Propor fazer flexões de:
          <sl-checkbox id="flexaoGenero" @input=${(): void => this.agendarEmissaoEventoOnChange()}>Gênero</sl-checkbox>
          <sl-checkbox id="flexaoNumero" @input=${(): void => this.agendarEmissaoEventoOnChange()}>Número</sl-checkbox>
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
