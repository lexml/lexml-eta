import { SlButton, SlInput, SlTabGroup } from '@shoelace-style/shoelace';
import { RemissaoExternaValue, RemissaoInternaValue } from '../../model/remissao';
import { getElementos } from '../../model/elemento/elementoUtil';
import { Articulacao } from '../../model/dispositivo/dispositivo';
import { rootStore } from '../../redux/store';
import { escapeHtml } from '../../util/html-util';
import { gerarRefId } from '../../model/remissao/refId';
import { textoParaFragmentoLexmlId } from '../../model/lexml/numeracao/parserReferenciaDispositivo';
import { Norma } from '../../model/emenda/norma';
import '../autocomplete/autocomplete-norma';

export type TipoRemissao = 'interna' | 'externa';

export interface ModoEdicaoRemissao {
  tipo: TipoRemissao;
  refId: string;
  valueInterna?: RemissaoInternaValue;
  valueExterna?: RemissaoExternaValue;
}

interface DispositivoRemissao {
  uuid: number;
  lexmlId: string;
  rotulo: string;
  tipo: string;
  nivel: number;
  texto?: string;
}

function buildListaDispositivos(articulacao: Articulacao): DispositivoRemissao[] {
  const dispositivos: DispositivoRemissao[] = [];
  const elementos = getElementos(articulacao);
  elementos
    .filter(el => el.tipo !== 'Articulacao' && el.tipo !== 'Ementa')
    .forEach(el => {
      dispositivos.push({
        uuid: el.uuid!,
        lexmlId: el.lexmlId!,
        rotulo: el.rotulo || el.tipo || '',
        tipo: el.tipo || '',
        nivel: el.nivel || 0,
        texto: el.conteudo?.texto?.substring(0, 50) + (el.conteudo?.texto && el.conteudo.texto.length > 50 ? '...' : ''),
      });
    });
  return dispositivos;
}

function filtrarDispositivos(dispositivos: DispositivoRemissao[], filtro: string): DispositivoRemissao[] {
  if (!filtro || filtro.trim() === '') return dispositivos;
  const termo = filtro.toLowerCase().trim();
  return dispositivos.filter(d => d.rotulo.toLowerCase().includes(termo) || d.tipo.toLowerCase().includes(termo) || d.texto?.toLowerCase().includes(termo));
}

export async function remissaoDialog(
  quill: any,
  range: { index: number; length: number },
  urlAutocomplete: string,
  onRemissaoInternaCriada: (value: RemissaoInternaValue) => void,
  onRemissaoExternaCriada: (value: RemissaoExternaValue) => void,
  modoEdicao?: ModoEdicaoRemissao
): Promise<void> {
  const isEdicao = !!modoEdicao;
  const isEdicaoExterna = modoEdicao?.tipo === 'externa';
  const abaInicial: TipoRemissao = isEdicaoExterna ? 'externa' : 'interna';

  const state = rootStore.getState().elementoReducer;
  const articulacao = state.articulacao as Articulacao | undefined;
  const textoSelecionado = quill.getText(range.index, range.length).trim();
  const urnInicialExt = isEdicaoExterna ? modoEdicao?.valueExterna?.targetUrn ?? '' : '';

  const dialogElem = document.createElement('sl-dialog');
  document.body.appendChild(dialogElem);
  dialogElem.label = isEdicao ? 'Editar Remissão' : 'Adicionar Remissão';
  dialogElem.style.setProperty('--sl-dialog-width', '580px');
  dialogElem.style.setProperty('--sl-dialog-max-height', '75vh');
  dialogElem.addEventListener('sl-request-close', (event: any) => {
    if (event.detail.source === 'overlay') event.preventDefault();
  });

  const dispositivos = articulacao ? buildListaDispositivos(articulacao) : [];

  const content = document.createRange().createContextualFragment(`
    <style>
      .remissao-tab-panel {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding-top: 8px;
      }
      .texto-selecionado-label { font-size: 0.85em; color: var(--sl-color-neutral-500); margin-bottom: -8px; }
      .texto-selecionado-valor {
        background-color: var(--sl-color-primary-50);
        padding: 8px 12px;
        border-radius: 4px;
        font-style: italic;
        border-left: 3px solid var(--sl-color-primary-500);
        font-size: 0.9em;
      }
      .sem-selecao-aviso {
        background-color: var(--sl-color-warning-50);
        border: 1px solid var(--sl-color-warning-200);
        border-radius: 4px;
        padding: 10px 14px;
        font-size: 0.88em;
        color: var(--sl-color-warning-800);
      }
      .dispositivo-list {
        border: 1px solid var(--sl-color-neutral-200);
        border-radius: 4px;
        max-height: 240px;
        overflow-y: auto;
        background: var(--sl-color-neutral-0);
      }
      .dispositivo-item {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        cursor: pointer;
        border-bottom: 1px solid var(--sl-color-neutral-100);
        transition: background-color 0.15s;
      }
      .dispositivo-item:last-child { border-bottom: none; }
      .dispositivo-item:hover { background-color: var(--sl-color-neutral-50); }
      .dispositivo-item.selected {
        background-color: var(--sl-color-primary-100);
        border-left: 3px solid var(--sl-color-primary-500);
      }
      .dispositivo-rotulo { font-weight: 600; margin-right: 8px; }
      .dispositivo-tipo { color: var(--sl-color-neutral-500); font-size: 0.85em; }
      .dispositivo-texto {
        color: var(--sl-color-neutral-400); font-size: 0.8em; margin-left: auto;
        max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      .dispositivo-count { font-size: 0.85em; color: var(--sl-color-neutral-400); margin-top: -8px; }
      .empty-state { text-align: center; padding: 24px; color: var(--sl-color-neutral-400); }
      .ajuda-ext { font-size: var(--sl-font-size-small); color: var(--sl-color-neutral-500); }
      .ajuda-ext ul { margin-block-start: 0.3em; margin-block-end: 0; }
    </style>

    <sl-tab-group id="remissao-tab-group">
      <sl-tab slot="nav" panel="interna">Interna</sl-tab>
      <sl-tab slot="nav" panel="externa">Externa</sl-tab>

      <sl-tab-panel name="interna">
        <div class="remissao-tab-panel">
          ${
            textoSelecionado
              ? `
            <div>
              <div class="texto-selecionado-label">Texto selecionado:</div>
              <div class="texto-selecionado-valor">"${escapeHtml(textoSelecionado)}"</div>
            </div>`
              : ''
          }
          <sl-input id="busca-int" placeholder="Digite para buscar dispositivo (ex: art. 1º, § 2º)" clearable size="medium">
            <span slot="prefix" style="color: var(--sl-color-neutral-500);">🔍</span>
          </sl-input>
          <div class="dispositivo-count" id="count-int">Digite para buscar dispositivos</div>
          <div class="dispositivo-list" id="lista-int">
            <div class="empty-state">Digite no campo acima para buscar dispositivos</div>
          </div>
          <sl-alert id="alerta-int" variant="warning" closable>
            <span slot="icon" style="color: var(--sl-color-warning-500);">⚠</span>
            <span id="msg-alerta-int"></span>
          </sl-alert>
        </div>
      </sl-tab-panel>

      <sl-tab-panel name="externa">
        <div class="remissao-tab-panel">
          ${
            textoSelecionado
              ? `
            <div>
              <div class="texto-selecionado-label">Texto selecionado:</div>
              <div class="texto-selecionado-valor">"${escapeHtml(textoSelecionado)}"</div>
            </div>`
              : `
            <div class="sem-selecao-aviso">
              ⚠ Selecione um trecho do texto no editor antes de criar uma remissão externa.
            </div>`
          }
          <autocomplete-norma id="auto-norma-ext"
            urlAutocomplete="${urlAutocomplete}"
            ${urnInicialExt ? `urnInicial="${urnInicialExt}"` : ''}>
          </autocomplete-norma>
          <sl-input id="dispositivo-ext"
            label="Dispositivo (opcional)"
            placeholder="ex: art. 5º, inciso I do § 3º do art. 12"
            clearable>
          </sl-input>
          <div class="ajuda-ext">
            Exemplos de formatos aceitos:
            <ul>
              <li>art. 5º</li>
              <li>inciso I do § 3º do art. 12</li>
              <li>parágrafo único do art. 7º</li>
              <li>§ 8 art 32</li>
            </ul>
          </div>
          <sl-alert id="alerta-ext" variant="warning" closable>
            <span slot="icon" style="color: var(--sl-color-warning-500);">⚠</span>
            <span id="msg-alerta-ext"></span>
          </sl-alert>
        </div>
      </sl-tab-panel>
    </sl-tab-group>

    <sl-button slot="footer" variant="default" id="btn-cancelar">Cancelar</sl-button>
    <sl-button slot="footer" variant="primary" id="btn-confirmar" disabled>${isEdicao ? 'Salvar' : 'Confirmar'}</sl-button>
  `);

  // --- Refs ---
  const listaInt = content.querySelector('#lista-int') as HTMLElement;
  const inputBuscaInt = content.querySelector('#busca-int') as SlInput;
  const countInt = content.querySelector('#count-int') as HTMLElement;
  const alertaInt = content.querySelector('#alerta-int') as any;
  const msgAlertaInt = content.querySelector('#msg-alerta-int') as HTMLElement;

  const autocompleteNormaExt = content.querySelector('#auto-norma-ext');
  const dispositivoExtInput = content.querySelector('#dispositivo-ext') as SlInput;
  const alertaExt = content.querySelector('#alerta-ext') as any;
  const msgAlertaExt = content.querySelector('#msg-alerta-ext') as HTMLElement;

  const btnCancelar = content.querySelector('#btn-cancelar') as SlButton;
  const btnConfirmar = content.querySelector('#btn-confirmar') as SlButton;
  const tabGroup = content.querySelector('#remissao-tab-group') as SlTabGroup;

  // --- State ---
  let abaAtiva: TipoRemissao = abaInicial;
  let dispositivoInternoSelecionado: DispositivoRemissao | null = null;
  let selectedItemElement: HTMLElement | null = null;
  let normaExternaSelecionada: Norma = new Norma();

  function atualizarEstadoBotao(): void {
    if (abaAtiva === 'interna') {
      btnConfirmar.disabled = !dispositivoInternoSelecionado;
    } else {
      btnConfirmar.disabled = !textoSelecionado || !normaExternaSelecionada.urn;
    }
  }

  // --- Aba interna ---
  function criarItemDispositivo(d: DispositivoRemissao): HTMLElement {
    const item = document.createElement('div');
    item.className = 'dispositivo-item';
    item.setAttribute('data-uuid', d.uuid.toString());

    const rotuloSpan = document.createElement('span');
    rotuloSpan.className = 'dispositivo-rotulo';
    rotuloSpan.textContent = d.rotulo;
    item.appendChild(rotuloSpan);

    const tipoSpan = document.createElement('span');
    tipoSpan.className = 'dispositivo-tipo';
    tipoSpan.textContent = `(${d.tipo})`;
    item.appendChild(tipoSpan);

    if (d.texto) {
      const textoSpan = document.createElement('span');
      textoSpan.className = 'dispositivo-texto';
      textoSpan.textContent = d.texto;
      item.appendChild(textoSpan);
    }

    item.addEventListener('click', () => {
      selectedItemElement?.classList.remove('selected');
      item.classList.add('selected');
      selectedItemElement = item;
      dispositivoInternoSelecionado = d;
      atualizarEstadoBotao();
    });

    item.addEventListener('dblclick', () => {
      dispositivoInternoSelecionado = d;
      btnConfirmar.click();
    });

    return item;
  }

  function renderizarDispositivos(lista: DispositivoRemissao[]): void {
    listaInt.innerHTML = '';
    if (lista.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = 'Nenhum dispositivo encontrado';
      listaInt.appendChild(empty);
    } else {
      lista.forEach(d => listaInt.appendChild(criarItemDispositivo(d)));
    }
    countInt.textContent = `${lista.length} dispositivo${lista.length !== 1 ? 's' : ''} encontrado${lista.length !== 1 ? 's' : ''}`;
  }

  function atualizarListaInt(): void {
    const filtro = inputBuscaInt.value || '';
    if (!filtro.trim()) {
      listaInt.innerHTML = '<div class="empty-state">Digite no campo acima para buscar dispositivos</div>';
      countInt.textContent = 'Digite para buscar dispositivos';
      dispositivoInternoSelecionado = null;
      selectedItemElement = null;
      atualizarEstadoBotao();
      return;
    }
    const filtrados = filtrarDispositivos(dispositivos, filtro);
    renderizarDispositivos(filtrados);
    dispositivoInternoSelecionado = null;
    selectedItemElement = null;
    atualizarEstadoBotao();
  }

  inputBuscaInt.addEventListener('sl-input', () => atualizarListaInt());
  inputBuscaInt.addEventListener('sl-clear', () => atualizarListaInt());

  // --- Aba externa ---
  autocompleteNormaExt!['onSelect'] = (norma: Norma): void => {
    normaExternaSelecionada = norma;
    atualizarEstadoBotao();
  };

  // --- Troca de aba ---
  tabGroup.addEventListener('sl-tab-show', (event: any) => {
    abaAtiva = event.detail.name as TipoRemissao;
    atualizarEstadoBotao();
  });

  // --- Fechar ---
  function fecharDialogo(): void {
    dialogElem.hide();
    dialogElem.remove();
  }

  btnCancelar.onclick = (): void => {
    quill.focus();
    fecharDialogo();
  };

  // --- Confirmar ---
  btnConfirmar.onclick = (): void => {
    if (abaAtiva === 'interna') {
      if (!dispositivoInternoSelecionado) {
        msgAlertaInt.textContent = 'Selecione um dispositivo para criar a remissão.';
        alertaInt.show();
        return;
      }
      alertaInt?.hide();
      const refId = modoEdicao?.tipo === 'interna' ? modoEdicao.refId : gerarRefId();
      const value: RemissaoInternaValue = {
        refId,
        targetUuid: dispositivoInternoSelecionado.uuid,
        targetLexmlId: dispositivoInternoSelecionado.lexmlId,
        targetRotulo: dispositivoInternoSelecionado.rotulo,
        textoRef: textoSelecionado || dispositivoInternoSelecionado.rotulo,
      };
      onRemissaoInternaCriada(value);
    } else {
      if (!textoSelecionado || !normaExternaSelecionada.urn) {
        msgAlertaExt.textContent = !textoSelecionado ? 'Selecione um trecho do texto no editor antes de criar uma remissão externa.' : 'Selecione uma norma antes de confirmar.';
        alertaExt.show();
        return;
      }
      const textoDispositivo = dispositivoExtInput.value?.trim();
      let targetFragmento: string | undefined;
      if (textoDispositivo) {
        targetFragmento = textoParaFragmentoLexmlId(textoDispositivo);
        if (!targetFragmento) {
          msgAlertaExt.textContent = 'Dispositivo não identificado. Informe no formato: "art. 5º", "inciso I do § 3º do art. 12"...';
          alertaExt.show();
          return;
        }
      }
      alertaExt?.hide();
      const refId = modoEdicao?.tipo === 'externa' ? modoEdicao.refId : gerarRefId();
      const value: RemissaoExternaValue = {
        refId,
        targetUrn: normaExternaSelecionada.urn,
        targetNomeNorma: normaExternaSelecionada.nomePreferido,
        targetTextoDispositivo: textoDispositivo || undefined,
        targetFragmento,
        textoRef: textoSelecionado,
      };
      onRemissaoExternaCriada(value);
    }
    quill.focus();
    fecharDialogo();
  };

  // --- Montar e exibir ---
  quill.blur();
  dialogElem.appendChild(content);
  await dialogElem.show();

  // Modo edição — preencher aba interna
  if (modoEdicao?.tipo === 'interna' && modoEdicao.valueInterna) {
    const v = modoEdicao.valueInterna;
    inputBuscaInt.value = v.targetRotulo ?? '';
    const filtrados = filtrarDispositivos(dispositivos, inputBuscaInt.value);
    renderizarDispositivos(filtrados);
    const itemAtual = listaInt.querySelector(`[data-uuid="${v.targetUuid}"]`) as HTMLElement | null;
    if (itemAtual) {
      itemAtual.classList.add('selected');
      selectedItemElement = itemAtual;
      dispositivoInternoSelecionado = filtrados.find(d => d.uuid === v.targetUuid) ?? null;
      atualizarEstadoBotao();
      setTimeout(() => itemAtual.scrollIntoView({ block: 'nearest' }), 50);
    }
  }

  // Modo edição — preencher aba externa
  if (modoEdicao?.tipo === 'externa' && modoEdicao.valueExterna) {
    const v = modoEdicao.valueExterna;
    if (v.targetTextoDispositivo) {
      dispositivoExtInput.value = v.targetTextoDispositivo;
    }
    normaExternaSelecionada = new Norma(v.targetUrn, v.targetNomeNorma);
    atualizarEstadoBotao();
  }

  setTimeout(() => {
    if (abaInicial === 'externa') {
      (tabGroup as any).show('externa');
    } else {
      inputBuscaInt.focus();
    }
  }, 100);
}
