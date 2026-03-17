import { SlButton, SlInput } from '@shoelace-style/shoelace';
import { RemissaoInternaValue } from '../../model/remissao';
import { getElementos } from '../../model/elemento/elementoUtil';
import { Articulacao } from '../../model/dispositivo/dispositivo';
import { rootStore } from '../../redux/store';
import { escapeHtml } from '../../util/html-util';
import { gerarRefId } from '../../model/remissao/refId';

export interface DispositivoRemissao {
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

  // Filtra dispositivos relevantes (exclui Articulacao e Ementa da lista principal)
  const elementosFiltrados = elementos.filter(el => el.tipo !== 'Articulacao' && el.tipo !== 'Ementa');

  elementosFiltrados.forEach(el => {
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
  if (!filtro || filtro.trim() === '') {
    return dispositivos;
  }

  const termoBusca = filtro.toLowerCase().trim();
  return dispositivos.filter(d => {
    const rotuloMatch = d.rotulo.toLowerCase().includes(termoBusca);
    const tipoMatch = d.tipo.toLowerCase().includes(termoBusca);
    const textoMatch = d.texto?.toLowerCase().includes(termoBusca);
    return rotuloMatch || tipoMatch || textoMatch;
  });
}

export async function remissaoInternaDialog(quill: any, range: { index: number; length: number }, onRemissaoCriada: (value: RemissaoInternaValue) => void): Promise<void> {
  const state = rootStore.getState().elementoReducer;
  const articulacao = state.articulacao;

  if (!articulacao) {
    console.error('Articulação não encontrada');
    return;
  }

  const textoSelecionado = quill.getText(range.index, range.length);

  const dialogElem = document.createElement('sl-dialog');
  document.body.appendChild(dialogElem);

  dialogElem.label = 'Adicionar Remissão Interna';
  dialogElem.style.setProperty('--sl-dialog-width', '550px');
  dialogElem.style.setProperty('--sl-dialog-max-height', '70vh');

  dialogElem.addEventListener('sl-request-close', (event: any) => {
    if (event.detail.source === 'overlay') {
      event.preventDefault();
    }
  });

  const dispositivos = buildListaDispositivos(articulacao);

  const content = document.createRange().createContextualFragment(`
    <style>
      .remissao-dialog-container {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .remissao-dialog-container sl-input {
        width: 100%;
      }

      .remissao-dialog-container .texto-selecionado {
        background-color: var(--sl-color-primary-50);
        padding: 8px 12px;
        border-radius: 4px;
        font-style: italic;
        border-left: 3px solid var(--sl-color-primary-500);
        margin-bottom: 8px;
      }

      .remissao-dialog-container .dispositivo-list {
        border: 1px solid var(--sl-color-neutral-200);
        border-radius: 4px;
        max-height: 300px;
        overflow-y: auto;
        background: var(--sl-color-neutral-0);
      }

      .remissao-dialog-container .dispositivo-item {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        cursor: pointer;
        border-bottom: 1px solid var(--sl-color-neutral-100);
        transition: background-color 0.15s;
      }

      .remissao-dialog-container .dispositivo-item:last-child {
        border-bottom: none;
      }

      .remissao-dialog-container .dispositivo-item:hover {
        background-color: var(--sl-color-neutral-50);
      }

      .remissao-dialog-container .dispositivo-item.selected {
        background-color: var(--sl-color-primary-100);
        border-left: 3px solid var(--sl-color-primary-500);
      }

      .remissao-dialog-container .dispositivo-rotulo {
        font-weight: 600;
        margin-right: 8px;
      }

      .remissao-dialog-container .dispositivo-tipo {
        color: var(--sl-color-neutral-500);
        font-size: 0.85em;
      }

      .remissao-dialog-container .dispositivo-texto {
        color: var(--sl-color-neutral-400);
        font-size: 0.8em;
        margin-left: auto;
        max-width: 150px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .remissao-dialog-container .info-text {
        font-size: 0.85em;
        color: var(--sl-color-neutral-500);
      }

      .remissao-dialog-container .dispositivo-count {
        font-size: 0.85em;
        color: var(--sl-color-neutral-400);
        margin-top: -8px;
      }

      .remissao-dialog-container .empty-state {
        text-align: center;
        padding: 24px;
        color: var(--sl-color-neutral-400);
      }

      .remissao-dialog-container #initial-state {
        text-align: center;
        padding: 40px 24px;
        color: var(--sl-color-neutral-400);
        font-size: 0.9em;
      }
    </style>

    <div class="remissao-dialog-container">
      ${
        textoSelecionado
          ? `
        <div>
          <div class="info-text">Texto selecionado:</div>
          <div class="texto-selecionado">"${escapeHtml(textoSelecionado)}"</div>
        </div>
      `
          : ''
      }

      <sl-input
        id="busca-dispositivo"
        placeholder="Digite para buscar dispositivo (ex: art. 1º, § 2º)"
        clearable
        size="medium"
      >
        <span slot="prefix" style="color: var(--sl-color-neutral-500); cursor: pointer;">🔍</span>
      </sl-input>

      <div class="dispositivo-count" id="dispositivo-count">
        Digite para buscar dispositivos
      </div>

      <div class="dispositivo-list" id="lista-dispositivos">
        <div class="empty-state" id="initial-state">Digite no campo acima para buscar dispositivos</div>
      </div>

      <sl-alert id="alerta-remissao" variant="warning" closable>
        <span slot="icon" style="color: var(--sl-color-warning-500);">⚠</span>
        <span id="mensagem-alerta"></span>
      </sl-alert>
    </div>

    <sl-button slot="footer" variant="default" id="btn-cancelar">Cancelar</sl-button>
    <sl-button slot="footer" variant="primary" id="btn-confirmar" disabled>Confirmar</sl-button>
  `);

  const listaContainer = content.querySelector('#lista-dispositivos') as HTMLElement;
  const inputBusca = content.querySelector('#busca-dispositivo') as SlInput;
  const countDisplay = content.querySelector('#dispositivo-count') as HTMLElement;
  const btnCancelar = content.querySelector('#btn-cancelar') as SlButton;
  const btnConfirmar = content.querySelector('#btn-confirmar') as SlButton;
  const alerta = content.querySelector('#alerta-remissao') as any;
  const mensagemAlerta = content.querySelector('#mensagem-alerta') as HTMLElement;

  let dispositivoSelecionado: DispositivoRemissao | null = null;
  let selectedItemElement: HTMLElement | null = null;

  function criarItemDispositivo(dispositivo: DispositivoRemissao): HTMLElement {
    const item = document.createElement('div');
    item.className = 'dispositivo-item';
    item.setAttribute('data-uuid', dispositivo.uuid.toString());

    const rotuloSpan = document.createElement('span');
    rotuloSpan.className = 'dispositivo-rotulo';
    rotuloSpan.textContent = dispositivo.rotulo;

    const tipoSpan = document.createElement('span');
    tipoSpan.className = 'dispositivo-tipo';
    tipoSpan.textContent = `(${dispositivo.tipo})`;

    item.appendChild(rotuloSpan);
    item.appendChild(tipoSpan);

    if (dispositivo.texto) {
      const textoSpan = document.createElement('span');
      textoSpan.className = 'dispositivo-texto';
      textoSpan.textContent = dispositivo.texto;
      item.appendChild(textoSpan);
    }

    item.addEventListener('click', () => {
      if (selectedItemElement) {
        selectedItemElement.classList.remove('selected');
      }

      item.classList.add('selected');
      selectedItemElement = item;
      dispositivoSelecionado = dispositivo;
      btnConfirmar.disabled = false;
    });

    // Evento de duplo clique para confirmar
    item.addEventListener('dblclick', () => {
      dispositivoSelecionado = dispositivo;
      btnConfirmar.click();
    });

    return item;
  }

  function renderizarDispositivos(lista: DispositivoRemissao[]): void {
    listaContainer.innerHTML = '';

    if (lista.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'empty-state';
      emptyState.textContent = 'Nenhum dispositivo encontrado';
      listaContainer.appendChild(emptyState);
    } else {
      lista.forEach(dispositivo => {
        const item = criarItemDispositivo(dispositivo);
        listaContainer.appendChild(item);
      });
    }

    countDisplay.textContent = `${lista.length} dispositivo${lista.length !== 1 ? 's' : ''} encontrado${lista.length !== 1 ? 's' : ''}`;
  }

  function atualizarLista(): void {
    const filtro = inputBusca.value || '';

    // Se não houver filtro, não exibe a lista
    if (!filtro || filtro.trim() === '') {
      listaContainer.innerHTML = '<div class="empty-state" id="initial-state">Digite no campo acima para buscar dispositivos</div>';
      countDisplay.textContent = 'Digite para buscar dispositivos';
      dispositivoSelecionado = null;
      selectedItemElement = null;
      btnConfirmar.disabled = true;
      return;
    }

    const filtrados = filtrarDispositivos(dispositivos, filtro);
    renderizarDispositivos(filtrados);

    // Limpa seleção ao filtrar
    dispositivoSelecionado = null;
    selectedItemElement = null;
    btnConfirmar.disabled = true;
  }

  // Evento de busca
  inputBusca.addEventListener('sl-input', () => {
    atualizarLista();
  });

  inputBusca.addEventListener('sl-clear', () => {
    atualizarLista();
  });

  function mostrarAlerta(mensagem: string): void {
    mensagemAlerta.textContent = mensagem;
    alerta.show();
  }

  function fecharDialogo(): void {
    dialogElem.hide();
    dialogElem.remove();
  }

  btnCancelar.onclick = (): void => {
    quill.focus();
    fecharDialogo();
  };

  btnConfirmar.onclick = (): void => {
    if (!dispositivoSelecionado) {
      mostrarAlerta('Selecione um dispositivo para criar a remissão.');
      return;
    }

    const refId = gerarRefId();

    const remissaoValue: RemissaoInternaValue = {
      refId,
      targetUuid: dispositivoSelecionado.uuid,
      targetLexmlId: dispositivoSelecionado.lexmlId,
      targetRotulo: dispositivoSelecionado.rotulo,
      textoRef: textoSelecionado || dispositivoSelecionado.rotulo,
      textoFixo: true,
    };

    onRemissaoCriada(remissaoValue);

    quill.focus();
    fecharDialogo();
  };

  // Não renderiza lista inicial - aguarda digitação no campo de busca
  // A lista começa vazia para evitar lentidão em proposições grandes

  quill.blur();
  await dialogElem.appendChild(content);
  await dialogElem.show();

  setTimeout(() => {
    inputBusca.focus();
  }, 100);
}
