/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable eqeqeq */

import { generateUUID } from '../../util/uuid';

/* eslint-disable prefer-const */
const Delta = Quill.import('delta');
const Parchment = Quill.import('parchment');
const Module = Quill.import('core/module');
const Inline = Quill.import('blots/inline');
const Clipboard = Quill.import('modules/clipboard');
const Keyboard = Quill.import('modules/keyboard');

// --------------------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------

class RevisaoUtil {
  static valueToAttributes(value, domNode) {
    if (!value) return;
    const partes = value.split('|');
    domNode.setAttribute('usuario', partes[0]);
    domNode.setAttribute('date', partes[1]);
    domNode.setAttribute('title', 'Revisão de ' + partes[0] + ' em ' + this.formatDDMMYYYYAndTime(new Date(partes[1])));
    domNode.setAttribute('id-revisao', partes[2]);
  }

  static formats(domNode) {
    if (domNode?.hasAttribute('usuario') && domNode?.hasAttribute('date')) {
      return [domNode.getAttribute('usuario'), domNode.getAttribute('date'), domNode.getAttribute('id-revisao')].join('|');
    }
  }

  static padTo2Digits(num) {
    return num.toString().padStart(2, '0');
  }

  static formatDate(date) {
    return (
      [date.getFullYear(), RevisaoUtil.padTo2Digits(date.getMonth() + 1), RevisaoUtil.padTo2Digits(date.getDate())].join('-') +
      ' ' +
      [
        RevisaoUtil.padTo2Digits(date.getHours()),
        RevisaoUtil.padTo2Digits(date.getMinutes()),
        // RevisaoUtil.padTo2Digits(date.getSeconds()),
        '00',
      ].join(':')
    );
  }

  static formatDDMMYYYYAndTime(date: Date): string {
    const data = [this.padTo2Digits(date.getDate()), this.padTo2Digits(date.getMonth() + 1), date.getFullYear()].join('/');
    const hora = [this.padTo2Digits(date.getHours()), this.padTo2Digits(date.getMinutes())].join(':');
    return `${data} ${hora}`;
  }
}

// --------------------------------------------------------------------------------------------------------------------
// Fornatos de revisão inline

class InlineRevisionBaseFormat extends Inline {
  static blotName = 'revisionBaseFormat';
  static tagName = '';

  static create(value) {
    let node = super.create();
    RevisaoUtil.valueToAttributes(value, node);
    return node;
  }

  static formats(domNode) {
    return RevisaoUtil.formats(domNode);
  }

  format(name, value) {
    if (name !== this.statics.blotName || !value) return super.format(name, value);
    RevisaoUtil.valueToAttributes(value, this.domNode);
  }

  optimize(context) {
    const blotName = this.statics.blotName;

    if (blotName === this.next?.statics?.blotName) {
      const formatoAtual = this.formats();
      this.next.domNode.setAttribute('date', this.domNode.getAttribute('date'));
      this.next.domNode.setAttribute('usuario', this.domNode.getAttribute('usuario'));
      this.next.format(blotName, formatoAtual[blotName]);
    }

    super.optimize(context);
  }
}

class InsBlot extends InlineRevisionBaseFormat {}
InsBlot.blotName = 'added';
InsBlot.tagName = 'ins';

class DelBlot extends InlineRevisionBaseFormat {}
DelBlot.blotName = 'removed';
DelBlot.tagName = 'del';

const cursorEstaSobreBlotDel = quill => {
  const range = quill.getSelection();
  const blot = range && quill.getLeaf(range.index)[0];
  return blot?.statics.blotName === DelBlot.blotName || blot?.parent?.statics.blotName === DelBlot.blotName;
};

// --------------------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------

// --------------------------------------------------------------------------------------------------------------------
// Módulo de revisão

// A classe abaixo adiciona um listener para o evento keydown para ser executado antes do listener padrão do Quill
class CustomKeyboard extends Keyboard {
  listen() {
    this.quill.root.addEventListener('keydown', this.onKeyDown.bind(this));
    this.quill.root.addEventListener('keypress', this.onKeyPress.bind(this));
    super.listen();
  }

  onKeyDown(e) {
    if (this.quill?.revisao?.gerenciarKeydown && this.quill?.revisao?.emRevisao) {
      this.quill.revisao.handleKeyDown(e);
    }
  }

  onKeyPress(e) {
    if (cursorEstaSobreBlotDel(this.quill)) {
      e.preventDefault();
      e.stopPropagation();
    }
  }
}

class CustomClipboard extends Clipboard {
  constructor(quill, options) {
    super(quill, options);
    this.quill.root.addEventListener('cut', this.onCut.bind(this));
  }

  onCut(e) {
    if (this.quill?.revisao?.emRevisao) {
      e.preventDefault();
      e.stopPropagation();

      const range = this.quill.getSelection();
      if (range?.length) {
        this.copiarSelecaoParaClipboard();
        this.quill?.revisao?.handleRemove(range, null, null);
      }
    }
  }

  onPaste(e) {
    if (cursorEstaSobreBlotDel(this.quill)) {
      e.preventDefault();
      e.stopPropagation();
    }
    super.onPaste(e);
  }

  copiarSelecaoParaClipboard() {
    const selection = window.getSelection();

    if (selection) {
      // Cria um elemento div temporário para armazenar a seleção
      const tempElement = document.createElement('div');

      // Clona a seleção e a insere no elemento div temporário
      for (let i = 0; i < selection.rangeCount; i++) {
        tempElement.appendChild(selection.getRangeAt(i).cloneContents());
      }

      // Copia o conteúdo do elemento div temporário para a área de transferência
      if (navigator.clipboard) {
        navigator.clipboard
          .write([
            new ClipboardItem({
              'text/plain': new Blob([tempElement.innerText], { type: 'text/plain' }),
              'text/html': new Blob([tempElement.outerHTML], { type: 'text/html' }),
            }),
          ])
          .finally(() => tempElement.remove());
      } else {
        console.log('Clipboard API não suportada');
        document.execCommand('copy'); // Alternativa para o caso de não suportar a Clipboard API
      }
    }
  }
}

class ModuloRevisao extends Module {
  quill;
  options;
  ignorarEventoTextChange = false;
  emRevisao = false;
  gerenciarKeydown = true;
  usuario;
  tableModule;
  tableTrick;
  isAbrindoTexto = false;

  static register() {
    Quill.register('modules/keyboard', CustomKeyboard, true);
    Quill.register('modules/clipboard', CustomClipboard, true);
    Quill.register(InsBlot, true);
    Quill.register(DelBlot, true);
  }

  constructor(quill, options) {
    super(quill, options);
    this.quill = quill;
    this.options = options;

    if (!options || !Object.keys(options).length) return;

    // this.quill.options.formats.push(...['added', 'removed']);

    this.usuario = options.usuario;
    this.emRevisao = options.emRevisao ?? false;
    this.gerenciarKeydown = options.gerenciarKeydown ?? true;
    this.tableModule = options.tableModule;
    this.tableTrick = options.tableTrick;

    this.quill.revisao = this;

    this.addClipboardMatcher();
    this.addKeyboardBindings(this.quill);

    this.quill.on('text-change', this.onTextChange.bind(this));

    this.quill.root.addEventListener('click', this.tratarClick.bind(this));

    if (this.tableModule) {
      const toolbar = this.quill?.getModule('toolbar');

      toolbar.addHandler('table', (value: any): any => {
        const quill = this.quill as any;
        const isInsertTable = (value = ''): any => value.includes('newtable_');
        const isInTable = (quill: any): any => quill && quill.getSelection(true) && quill.getFormat(quill.getSelection(true)).td;

        if (isInsertTable(value) && isInTable(quill)) {
          return false;
        }
        quill?.revisao?.setIgnorarEventoTextChange(true);
        return this.tableTrick.table_handler(value, quill);
      });
    }
  }

  isTagRevisao(param: HTMLElement | string) {
    const tagName = typeof param === 'string' ? param : param?.tagName;
    return ['INS', 'DEL'].includes(tagName);
  }

  getTagRevisaoMaisProxima(elemento: any) {
    if (!elemento || ['BODY', 'HTML'].includes(elemento.tagName)) return null;
    if (this.isTagRevisao(elemento)) return elemento;
    return this.getTagRevisaoMaisProxima(elemento.parentNode);
  }

  tratarClick(event: any) {
    const elRevisao = this.getTagRevisaoMaisProxima(event.target);
    elRevisao && this.mostrarTooltipRevisao(elRevisao);
  }

  revisarTodos(aceitar: boolean) {
    this.revisar(this.getRevisoes(), aceitar, true);
  }

  revisar(elementosRevisao: HTMLElement[], aceitar: boolean, todos = false) {
    if (!this.emRevisao) return;

    elementosRevisao
      .filter(el => this.isTagRevisao(el))
      .forEach(elRevisao => {
        const isTagIns = elRevisao.tagName === 'INS';
        const blot = Quill.find(elRevisao);
        this.ignorarEventoTextChange = true;

        if (blot !== null) {
          if ((aceitar && !isTagIns) || (!aceitar && isTagIns)) {
            const index = this.quill.getIndex(blot);
            const length = blot.length();
            this.quill.updateContents(new Delta().retain(index).delete(length), 'user');
          } else {
            blot.format(isTagIns ? 'added' : 'removed', false, 'user');
          }
        }
      });

    //força o revisar quando é "todos" e ainda sobrou revisões no quill
    if (todos && this.getRevisoes().length > 0) {
      this.revisar(this.getRevisoes(), aceitar);
    }
  }

  padTo2Digits(num: number): string {
    return num.toString().padStart(2, '0');
  }

  private mostrarTooltipRevisao(elRevisao: HTMLElement): void {
    if (!elRevisao) return;

    const tooltip = document.createElement('div');
    tooltip.classList.add('tooltip-revisao');

    const data = new Date(elRevisao.getAttribute('date') || '');

    tooltip.innerHTML = `
        <style>
        .tooltip-revisao {
          position: absolute;
          border: 1px solid black;
          background-color: white;
          padding: 10px;
          border-radius: 4px;
          z-index: 9999;
          font-size: 0.9rem;
          box-shadow: 0 2px 10px rgba(0,0,0,0.3);
          max-width: 300px;
          transition: all 0.3s ease-in-out;
        }
        .tooltip-revisao__actions {
          display: flex;
          flex-direction: row;
          gap: 0.5rem;
          align-items: center;
          justify-content: center;
        }
        .tooltip-revisao__actions button {
          display: flex;
          justify-content: center;
          align-items: center;
          border: 1px solid #ccc;
          border-radius: 15px;
          background-color: #eee;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
        }
        .tooltip-revisao__actions svg {
          fill: currentColor;
          width: 24px;
          height: 24px;
        }
        .tooltip-revisao button:hover {
          background-color: #ddd;
        }
        .tooltip-revisao button:active {
          background-color: #ccc;
        }
        .tooltip-revisao__body {
          display: flex;
          flex-direction: row;
          gap: 1rem;
        }
        .tooltip-revisao__autor {
          font-weight: bold;
        }
        .tooltip-revisao__data {
          font-size: 0.8rem;
          color: #666;
        }
      </style>
      <div class="tooltip-revisao__body" role="tooltip">
        <div>
          <div class="tooltip-revisao__autor">${elRevisao.getAttribute('usuario')}</div>
          <div class="tooltip-revisao__data">${RevisaoUtil.formatDDMMYYYYAndTime(data)}</div>
        </div>
        <div class="tooltip-revisao__actions">
          <button id="button-rejeitar-revisao" aria-label="Rejeitar revisão" title="Rejeitar revisão">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
            </svg>
          </button>
          <button id="button-aceitar-revisao" aria-label="Aceitar revisão" title="Aceitar revisão">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check" viewBox="0 0 16 16">
              <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
            </svg>
          </button>
        </div>
      </div>
      `;

    tooltip.style.opacity = '0';
    document.body.appendChild(tooltip);

    const fnActionRevisao = (event: any, aceitar: boolean) => {
      const elementos = [...this.quill.root.querySelectorAll(`${elRevisao.tagName}[id-revisao="${elRevisao.getAttribute('id-revisao')}"]`)];
      this.revisar(elementos, aceitar);
      closeTooltip(event);
    };

    tooltip.querySelector('#button-rejeitar-revisao')!.addEventListener('click', (event: any) => fnActionRevisao(event, false));
    tooltip.querySelector('#button-aceitar-revisao')!.addEventListener('click', (event: any) => fnActionRevisao(event, true));

    this.ajustaPosicaoTooltip(tooltip, elRevisao);

    const closeTooltip = (e: Event) => {
      if (e.type === 'click') {
        limpaTooltip();
      } else if (e.type === 'keydown' && (e as KeyboardEvent).key === 'Escape') {
        limpaTooltip();
      }
      setTimeout(() => this.quill.root.focus(), 0);
    };

    const limpaTooltip = () => {
      tooltip.style.opacity = '0';
      setTimeout(() => {
        tooltip.remove();
        document.removeEventListener('click', closeTooltip);
        document.removeEventListener('keydown', closeTooltip);
      }, 300);
    };

    setTimeout(() => {
      document.addEventListener('click', closeTooltip);
      document.addEventListener('keydown', closeTooltip);
      tooltip.style.opacity = '1';
    }, 0);

    window.addEventListener('resize', () => this.ajustaPosicaoTooltip(tooltip, elRevisao));
  }

  private ajustaPosicaoTooltip(tooltip: HTMLElement, button: HTMLElement): void {
    const rect = button.getBoundingClientRect();
    const offset = 10;

    // Abrir para cima por padrão, a menos que não haja espaço suficiente
    let topOffset = rect.top - tooltip.clientHeight - offset;
    if (topOffset < window.scrollY) {
      topOffset = rect.bottom + offset;
    }
    tooltip.style.top = `${topOffset + window.scrollY}px`;

    // Ajustar horizontalmente se estiver muito próximo à borda direita
    let leftOffset = rect.left + rect.width / 2 - tooltip.clientWidth / 2;
    if (leftOffset + tooltip.clientWidth > window.innerWidth) {
      leftOffset = window.innerWidth - tooltip.clientWidth - offset;
    } else if (leftOffset < 0) {
      leftOffset = offset;
    }
    tooltip.style.left = `${leftOffset + window.scrollX}px`;
  }

  createTooltip() {
    Array.from(this.querySelectorAll('#tooltipAcceptRefuse')).forEach(el => this.removeChild(el));

    const tooltipElem = document.createElement('tooltip');
    tooltipElem.id = 'tooltipAcceptRefuse';

    document.body.appendChild(tooltipElem);

    const content = document.createRange().createContextualFragment(`
    <style>
    .tooltip {
      position: relative;
      display: inline-block;
      cursor: pointer;
    }

    .tooltip .tooltiptext {
      display: none;
      width: 120px;
      background-color: #333;
      color: #fff;
      text-align: center;
      border-radius: 6px;
      padding: 5px;
      position: absolute;
      z-index: 1;
      top: calc(100% + 5px);
      left: 50%;
      margin-left: -60px;
    }

    </style>
    <div class="tooltip" id="tooltip">
      Hover sobre mim
      <span class="tooltiptext" id="tooltipContent">
        <button onclick="botaoClicado(1)">Botão 1</button>
        <button onclick="botaoClicado(2)">Botão 2</button>
      </span>
    </div>

    <sl-button slot="footer" variant="primary">Fechar</sl-button>
  `);
  }

  handleKeyDown(e) {
    // Não implementado
  }

  addClipboardMatcher() {
    // Handle para tratar colagem de trechos com tag <del>
    this.quill.clipboard.addMatcher('DEL', (node, delta) => {
      if (this.isAbrindoTexto) {
        return delta;
      } else {
        let match = Parchment.query(node);
        if (match == null || match.blotName !== 'removed') {
          return delta;
        }

        const id = generateUUID();
        const ops = delta.ops.reduce((acc, op) => {
          if (op.insert) {
            delete op.attributes.background;
            delete op.attributes.removed;
            if (this.emRevisao) {
              op.attributes.added = this.buildAttributes(id);
            }
            acc.push(op);
          }
          return acc;
        }, []);

        return new Delta(ops);
      }
    });
  }

  addKeyboardBindings(quill) {
    function addBindingOnTop(keyBinding, context, handler) {
      quill.keyboard.addBinding(keyBinding, context, handler);
      const key = Object.keys(quill.keyboard.bindings)
        .map(k => quill.keyboard.bindings[k])
        .flat()
        .find(binding => binding.handler === handler).key;
      const newBinding = (quill.keyboard.bindings[key] || []).pop();
      quill.keyboard.bindings[key].unshift(newBinding);
    }

    addBindingOnTop({ key: 'Backspace' }, null, (range, context) => this.handleRemove(range, context, 'Backspace'));
    addBindingOnTop({ key: 'Delete' }, null, (range, context) => this.handleRemove(range, context, 'Delete'));

    // Undo
    addBindingOnTop({ key: 'z', shortKey: true }, null, (range, context) => this.handleUndo(range, context));

    // Redo
    addBindingOnTop({ key: 'z', shortKey: true, shiftKey: true }, null, (range, context) => this.handleRedo(range, context));
    addBindingOnTop({ key: 'y', shortKey: true }, null, (range, context) => this.handleRedo(range, context));
  }

  handleUndo(range, context) {
    const hasModuloTabela = this.quill.getModule('table') && this.tableModule;

    if (this.emRevisao) {
      this.ignorarEventoTextChange = true;
    }

    if (hasModuloTabela) {
      return this.tableModule.keyboardHandler(this.quill, 'undo', range, context);
    } else {
      this.quill.history.undo();
    }
  }

  handleRedo(range, context) {
    const hasModuloTabela = this.quill.getModule('table') && this.tableModule;

    if (this.emRevisao) {
      this.ignorarEventoTextChange = true;
    }

    if (hasModuloTabela) {
      return this.tableModule.keyboardHandler(this.quill, 'redo', range, context);
    } else {
      this.quill.history.redo();
    }
  }

  buildAttributes(id = '') {
    return this.usuario + '|' + RevisaoUtil.formatDate(new Date()) + ' |' + id;
  }

  handleRemove(range, context, key) {
    const deslocamento = key === 'Delete' ? 1 : -1;
    const quill = this.quill;
    if (this.emRevisao) {
      const blot = quill.getLeaf(range.index)[0];
      const isEmbedBlot = ['image'].includes(blot.statics.blotName);
      const index = (blot.text || isEmbedBlot) && deslocamento === -1 && !range.length ? range.index - 1 : range.index;
      let posicao = index;

      if (index < 0 || index >= quill.getLength()) return true;
      const delta = quill.getContents(index, range.length || 1);
      const id = generateUUID();
      const ops = delta.ops.reduce((acc, op) => {
        const numChars = typeof op.insert === 'string' ? op.insert.length : 1;
        if (op.attributes?.added) {
          acc.push({ delete: numChars });
        } else {
          if (op.attributes?.list && !blot.text) {
            acc.push({ retain: numChars, attributes: { list: false } });
          } else if (!blot.text && !isEmbedBlot) {
            acc.push({ delete: numChars });
          } else {
            acc.push({
              retain: numChars,
              attributes: { ...(op.attributes || {}), removed: this.buildAttributes(id) },
            });

            if (deslocamento === 1) {
              posicao += numChars;
            }
          }
        }
        return acc;
      }, []);
      index && ops.unshift({ retain: index });

      this.ignorarEventoTextChange = true;

      quill.updateContents({ ops }, 'user');
      quill.setSelection(posicao);
      return false;
    }

    return true;
  }

  onTextChange(delta, oldContent, source) {
    const isInsertJaFormatadoEmModoDeRevisao = delta.ops.find(op => op.insert)?.attributes?.added;
    const apenasNovaLinha = delta.ops.length === 2 && delta.ops[0].retain && delta.ops[1].insert === '\n';
    const quill = this.quill;
    if (this.ignorarEventoTextChange || !this.emRevisao || isInsertJaFormatadoEmModoDeRevisao || !delta.ops.length || apenasNovaLinha) {
      this.ignorarEventoTextChange = false;
      return;
    }

    if (quill.history.stack.undo.length === 0) return;

    let numCaracteresRemovidos = 0;

    this.ignorarEventoTextChange = true;

    let itemUndo = quill.history.stack.undo.pop();

    const redo = JSON.parse(JSON.stringify(itemUndo.redo));

    quill.history.cutoff();
    quill.history.ignoreChange = true;
    quill.updateContents(itemUndo.undo, 'silent');
    quill.history.ignoreChange = false;

    if (!quill.history.options?.userOnly) quill.history.stack.undo.pop();

    this.ignorarEventoTextChange = true;

    let rev = { ops: [] };
    let idx = 0;
    const id = generateUUID();
    rev = redo.ops.reduce((acc, op) => {
      const length = op.retain || op.delete || (typeof op.insert === 'string' ? op.insert.length : 1);
      if (op.retain && op.attributes?.list) {
        // idx += 1;
        acc.ops.push({ retain: op.retain, attributes: { ...(op.attributes || {}) } });
        idx += op.retain;
      } else if (op.retain) {
        acc.ops.push({ retain: op.retain, attributes: { ...(op.attributes || {}) } });
        idx += op.retain;
      } else if (op.delete) {
        // Para refazer trechos removidos em modo de revisão é preciso identificar o que está sendo removido
        const contentDeletedRange = quill.getContents(idx, op.delete);
        contentDeletedRange.ops.forEach(op2 => {
          if (op2.insert && op2.attributes?.added) {
            // Deixa remover conteúdo adicionado em modo de revisão
            acc.ops.push({ delete: op2.insert.length });
          } else if (op2.insert && !op2.attributes?.added) {
            // Não deixa remover conteúdo adicionado FORA modo de revisão
            // Formata como removido em modo de revisão
            acc.ops.push({ retain: op2.insert.length, attributes: { removed: this.buildAttributes(id) } });
            idx += op2.insert.length;
            numCaracteresRemovidos += op2.insert.length;
          } else {
            acc.ops.push({ retain: op2.retain || op2.delete, attributes: { removed: this.buildAttributes(id) } });
            idx += op2.retain || op2.delete;
          }
        });
      } else if (op.insert && !op.attributes?.added) {
        op.attributes = { ...(op.attributes || {}), added: this.buildAttributes(id), removed: false };
        acc.ops.push(op);
        idx += length;
      }
      return acc;
    }, rev);

    quill.history.cutoff();
    quill.updateContents(rev, 'user');

    setTimeout(() => {
      quill.setSelection(idx - numCaracteresRemovidos, 0);
      this.ignorarEventoTextChange = false;
    }, 0);
  }

  setUsuario(usuario) {
    this.usuario = usuario;
  }

  setEmRevisao(emRevisao) {
    this.emRevisao = emRevisao;
  }

  setIgnorarEventoTextChange(ignorarEventoTextChange) {
    this.ignorarEventoTextChange = ignorarEventoTextChange;
  }

  getQuantidadeRevisoes() {
    return this.getRevisoesSemDuplicidade(this.getRevisoes()).length;
  }

  getRevisoes() {
    const cursorCode = 65279;
    return [...this.quill.root.querySelectorAll('ins, del')].filter(el => el.innerText?.charCodeAt(0) !== cursorCode);
  }

  private getRevisoesSemDuplicidade(listElements: any[]) {
    const revisoesSemDuplicidade = [] as any;

    listElements.forEach(element => {
      if (!revisoesSemDuplicidade.find(r => r.getAttribute('id-revisao') === element.getAttribute('id-revisao') && r.nodeName === element.nodeName)) {
        revisoesSemDuplicidade.push(element);
      }
    });

    return revisoesSemDuplicidade;
  }
}

// --------------------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------

Quill.register('modules/revisao', ModuloRevisao, true);

// --------------------------------------------------------------------------------------------------------------------

export { ModuloRevisao };
