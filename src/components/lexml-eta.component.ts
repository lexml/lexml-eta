import { html, LitElement, PropertyValues, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { connect } from 'pwa-helpers';

import { ComandoEmendaBuilder } from '../emenda/comando-emenda-builder';
import { DispositivosEmendaBuilder } from '../emenda/dispositivos-emenda-builder';
import { ClassificacaoDocumento } from '../model/documento/classificacao';
import { ComandoEmenda, ModoEdicaoEmenda } from '../model/emenda/emenda';
import { aplicarAlteracoesEmendaAction } from '../model/lexml/acao/aplicarAlteracoesEmenda';
import { openArticulacaoAction } from '../model/lexml/acao/openArticulacaoAction';
import { buildJsonixArticulacaoFromProjetoNorma } from '../model/lexml/documento/conversor/buildJsonixFromProjetoNorma';
import { buildProjetoNormaFromJsonix, getUrn } from '../model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { DOCUMENTO_PADRAO } from '../model/lexml/documento/modelo/documentoPadrao';
import { DispositivoAdicionado } from '../model/lexml/situacao/dispositivoAdicionado';
import { rootStore } from '../redux/store';
import { DispositivosEmenda } from './../model/emenda/emenda';
import { CmdEmdUtil } from '../emenda/comando-emenda-util';
import { Dispositivo } from '../model/dispositivo/dispositivo';

import { shoelaceLightThemeStyles } from '../assets/css/shoelace.theme.light.css';
import { adicionarAlerta } from '../model/alerta/acao/adicionarAlerta';

@customElement('lexml-eta')
export class LexmlEtaComponent extends connect(rootStore)(LitElement) {
  @property({ type: String }) modo = '';
  @property({ type: Object }) projetoNorma = {};
  @property({ type: Object }) dispositivosEmenda: DispositivosEmenda | undefined;

  createRenderRoot(): LitElement {
    return this;
  }

  getDispositivosEmenda(): DispositivosEmenda | undefined {
    const classificacao = this.modo;
    if (classificacao !== ClassificacaoDocumento.EMENDA && classificacao !== ClassificacaoDocumento.EMENDA_ARTIGO_ONDE_COUBER) {
      return undefined;
    }
    const urn = (this.projetoNorma as any).value.metadado.identificacao.urn!;
    const articulacao = rootStore.getState().elementoReducer.articulacao;
    return new DispositivosEmendaBuilder(classificacao as unknown as ModoEdicaoEmenda, urn, articulacao).getDispositivosEmenda();
  }

  getComandoEmenda(): ComandoEmenda {
    const urn = (this.projetoNorma as any).value.metadado.identificacao.urn!;
    const articulacao = rootStore.getState().elementoReducer.articulacao;
    return new ComandoEmendaBuilder(urn, articulacao).getComandoEmenda();
  }

  getProjetoAtualizado(): any {
    const out = { ...this.projetoNorma };
    const articulacaoAtualizada = buildJsonixArticulacaoFromProjetoNorma(rootStore.getState().elementoReducer.articulacao);
    (out as any).value.projetoNorma[(out as any).value.projetoNorma.norma ? 'norma' : 'projeto'].articulacao.lXhier = articulacaoAtualizada.lXhier;
    return out;
  }

  update(changedProperties: PropertyValues): void {
    if (this.hasChangedProjetoNorma(changedProperties) || this.hasChangedModo(changedProperties)) {
      this.loadProjetoNorma();
      document.querySelector('lexml-eta-articulacao')!['style'].display = 'block';
    }
    if (this.dispositivosEmenda && this.hasChangedEmenda(changedProperties)) {
      this.loadEmenda();
    }
    super.update(changedProperties);
  }

  private hasChangedProjetoNorma(changedProperties: PropertyValues): boolean {
    return changedProperties.has('projetoNorma') && changedProperties.get('projetoNorma') !== undefined;
  }

  private hasChangedModo(changedProperties: PropertyValues): boolean {
    return changedProperties.has('modo') && changedProperties.get('modo') !== undefined;
  }

  private hasChangedEmenda(changedProperties: PropertyValues): boolean {
    return changedProperties.has('dispositivosEmenda') && changedProperties.get('dispositivosEmenda');
  }

  private loadProjetoNorma(): void {
    let documento;

    if (!this.projetoNorma || !(this.projetoNorma as any).value) {
      this.projetoNorma = DOCUMENTO_PADRAO;
    }

    if (this.modo === ClassificacaoDocumento.EMENDA_ARTIGO_ONDE_COUBER) {
      const urn = getUrn(this.projetoNorma) ?? '';
      documento = buildProjetoNormaFromJsonix(DOCUMENTO_PADRAO, true);
      documento.urn = urn;
      const artigo = documento.articulacao!.artigos[0]!;
      artigo.rotulo = 'Art.';
      artigo.numero = '1';
      artigo.id = 'art1';
      const situacao = new DispositivoAdicionado();
      situacao.tipoEmenda = ClassificacaoDocumento.EMENDA_ARTIGO_ONDE_COUBER;
      artigo.situacao = situacao;

      // Se estiver abrindo emenda, remove artigo inicial do documento padrão
      if (this.dispositivosEmenda?.dispositivosAdicionados?.length) {
        documento.articulacao.removeFilho(documento.articulacao.filhos[0]);
      }
    } else {
      documento = buildProjetoNormaFromJsonix(this.projetoNorma, this.modo === ClassificacaoDocumento.EMENDA);
    }

    document.querySelector('lexml-emenda')?.querySelector('sl-tab')?.click();
    rootStore.dispatch(openArticulacaoAction(documento.articulacao!, this.modo));
  }

  private _timerLoadEmenda = 0;
  private loadEmenda(): void {
    if (this.dispositivosEmenda) {
      clearInterval(this._timerLoadEmenda);
      this._timerLoadEmenda = window.setTimeout(() => {
        rootStore.dispatch(aplicarAlteracoesEmendaAction.execute(this.dispositivosEmenda!));
      }, 1000);
      if (CmdEmdUtil.verificaNecessidadeRenumeracaoRedacaoFinal(this.dispositivosEmenda?.dispositivosAdicionados as Dispositivo[])) {
        const alerta = {
          id: 'alerta-global-renumeracao',
          tipo: 'warning',
          mensagem:
            'Os rótulos apresentados servem apenas para o posicionamento correto do novo dispositivo no texto. Serão feitas as renumerações necessárias no momento da consolidação das emendas.',
          podeFechar: true,
        };
        rootStore.dispatch(adicionarAlerta(alerta));
      }
    }
  }

  render(): TemplateResult {
    return html`
      ${shoelaceLightThemeStyles}
      <style>
        #gtx-trans {
          display: block;
        }

        lexml-eta-articulacao {
          display: none;
          height: 100%;
        }

        lexml-eta-articulacao:focus {
          outline: 0;
          border: 0px solid #f1f1f1;
          -webkit-box-shadow: 0px;
          box-shadow: none;
        }
      </style>

      <lexml-eta-articulacao></lexml-eta-articulacao>
    `;
  }
}
