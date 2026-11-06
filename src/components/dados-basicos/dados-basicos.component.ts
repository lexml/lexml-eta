import '@shoelace-style/shoelace/dist/components/button/button';
import { html, LitElement, nothing, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { getAno, getCasaLegislativaResponsavel, isSubstitutivo } from '../../model/lexml/documento/urnUtil';
import { ColegiadoApreciador } from '../../model/proposicao/proposicao';

/** Emitido no clique de "Alterar dados básicos" (não borbulha); o `lexml-eta` monta e emite o evento público. */
export const EVENTO_ALTERAR_DADOS_BASICOS = 'alterar-dados-basicos';

/** Grupo "Dados básicos" da aba "Data, Autoria e Impressão": só exibe os dados recebidos do `lexml-eta`. */
@customElement('lexml-eta-dados-basicos')
export class DadosBasicosComponent extends LitElement {
  @property() urn = '';
  @property() descricao = '';
  @property({ attribute: false }) colegiadoApreciador?: Pick<ColegiadoApreciador, 'tipoColegiado' | 'siglaComissao'>;
  @property({ type: Boolean }) anexoParecer = false;
  // Vazio habilita o botão; senão, é a mensagem exibida abaixo dele.
  @property() motivoBloqueio = '';

  private get colegiadoDescricao(): string {
    if (this.anexoParecer) return 'Não se aplica';
    const colegiado = this.colegiadoApreciador;
    if (colegiado?.tipoColegiado === 'Comissão') return colegiado.siglaComissao ? `Comissão (${colegiado.siglaComissao})` : 'Comissão';
    return colegiado?.tipoColegiado ?? 'Plenário';
  }

  // O substitutivo do Senado não tem ano próprio: o da URN é o da proposição substituída.
  private get exibeAno(): boolean {
    return !(isSubstitutivo(this.urn) && getCasaLegislativaResponsavel(this.urn) === 'SF');
  }

  private solicitarAlteracao(): void {
    if (this.motivoBloqueio) return;
    this.dispatchEvent(new CustomEvent(EVENTO_ALTERAR_DADOS_BASICOS));
  }

  render(): TemplateResult {
    if (!this.urn) return html``;
    return html`
      <style>
        fieldset {
          display: flex;
          flex-direction: column;
          gap: 0.5em;
          background-color: var(--sl-color-gray-100);
          box-shadow: var(--sl-shadow-x-large);
          flex-wrap: wrap;
          padding: 20px 20px;
          border: solid var(--sl-panel-border-width) var(--sl-panel-border-color);
          border-radius: var(--sl-border-radius-medium);
          max-width: 655px;
          margin: 0 0 2em 0;
        }
        legend {
          background-color: var(--sl-color-gray-200);
          font-weight: bold;
          border-radius: 5px;
          border: 1px solid var(--sl-color-gray-300);
          padding: 2px 5px;
          box-shadow: var(--sl-shadow-small);
        }
        /* Rótulo como o label de "Imprimir partido e UF" (Autoria); valor como o "Não informar" (Data). */
        .dados-basicos__valor {
          font-family: var(--sl-input-font-family);
          font-size: var(--sl-input-font-size-medium);
          font-weight: var(--sl-input-font-weight);
          color: var(--sl-input-color);
        }
        .dados-basicos__aviso {
          font-size: var(--sl-font-size-small);
          color: var(--sl-color-red-700);
        }
        sl-button {
          margin-top: 10px;
          width: fit-content;
        }
      </style>
      <fieldset id="dados-basicos">
        <legend>Dados básicos</legend>
        <div id="dados-basicos-descricao">${this.descricao}</div>
        ${this.exibeAno ? html`<div id="dados-basicos-ano">Ano: <span class="dados-basicos__valor">${getAno(this.urn)}</span></div>` : nothing}
        <div id="dados-basicos-colegiado">Colegiado apreciador: <span class="dados-basicos__valor">${this.colegiadoDescricao}</span></div>
        <div id="dados-basicos-parecer">Apresentado em parecer: <span class="dados-basicos__valor">${this.anexoParecer ? 'Sim' : 'Não'}</span></div>
        <sl-button id="botao-alterar-dados-basicos" variant="primary" ?disabled=${!!this.motivoBloqueio} @click=${this.solicitarAlteracao}>Alterar dados básicos</sl-button>
        ${this.motivoBloqueio ? html`<div class="dados-basicos__aviso" id="dados-basicos-aviso" role="status">${this.motivoBloqueio}</div>` : nothing}
      </fieldset>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lexml-eta-dados-basicos': DadosBasicosComponent;
  }
}
