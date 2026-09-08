/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable eqeqeq */
/* eslint-disable prefer-const */
import { decodeHtml, encodeHtml } from '../../util/string-util';
import PrivateQuill from '../../internal/quill/private-quill';
import { NotaRodapeModal } from './nota-rodape-modal';
import { NOTA_RODAPE_CHANGE_EVENT, NOTA_RODAPE_INPUT_EVENT, NOTA_RODAPE_REMOVE_EVENT, NotaRodape } from './notaRodape';

const PREFIXO_ID = 'nr';

const Delta = PrivateQuill.import('delta');
const Module = PrivateQuill.import('core/module');
const Embed = PrivateQuill.import('blots/embed'); // Inline Embed
const Text = PrivateQuill.import('blots/text'); // Inline Text
const Parchment = PrivateQuill.import('parchment');

const cfgInline = {
  scope: Parchment.Scope.INLINE_ATTRIBUTE,
};

const IdNotaRodapeAttribute = new Parchment.Attributor.Attribute('id-lexml-eta-nota-rodape', 'id-lexml-eta-nota-rodape', cfgInline);
const NumeroAttribute = new Parchment.Attributor.Attribute('numero', 'numero', cfgInline);
const TextoAttribute = new Parchment.Attributor.Attribute('texto', 'texto', cfgInline);

class NotaRodapeBlot extends Embed {
  static create(value) {
    let node = super.create(value);
    node.setAttribute('class', 'lexml-eta-nota-rodape');
    node.setAttribute('contenteditable', 'false');
    NotaRodapeBlot.valueToAttributes(value, node);
    return node;
  }

  static value(domNode) {
    return domNode.notaRodape || NotaRodapeBlot.buildNotaRodape(domNode);
  }

  format(name, value) {
    if (name !== this.statics.blotName || !value) return super.format(name, value);
    NotaRodapeBlot.valueToAttributes(value, this.domNode);
  }

  // static formats(domNode) {
  //   return { 'lexml-eta-nota-rodape': domNode.notaRodape || NotaRodapeBlot.buildNotaRodape(domNode) };
  // }

  static buildNotaRodape(domNode) {
    return {
      // id: domNode.getAttribute('id'),
      id: domNode.getAttribute('id-lexml-eta-nota-rodape'),
      numero: domNode.getAttribute('numero'),
      texto: decodeHtml(domNode.getAttribute('texto')),
    };
  }

  static valueToAttributes(value, domNode) {
    if (!value || typeof value === 'boolean') return;
    // value.id && domNode.setAttribute('id', value.id);
    value.id && domNode.setAttribute('id-lexml-eta-nota-rodape', value.id);
    value.numero && domNode.setAttribute('numero', value.numero);
    domNode.notaRodape = value;

    domNode.innerText = value.numero;
    domNode.setAttribute('texto', encodeHtml(value.texto));
  }
}

NotaRodapeBlot.blotName = 'lexml-eta-nota-rodape';
NotaRodapeBlot.tagName = 'lexml-eta-nota-rodape';
NotaRodapeBlot.allowedChildren = [Text];

class ModuloNotaRodape extends Module {
  quill;
  options;

  _isAbrindoTexto = false;
  get isAbrindoTexto() {
    return this._isAbrindoTexto;
  }
  set isAbrindoTexto(value) {
    this._isAbrindoTexto = value;
    // if (!value) {
    //   setTimeout(() => {
    //     this.quill.root.innerHTML = this.ajustarConteudoTagsNotaRodape(this.quill.root.innerHTML);
    //   }, 0);
    // }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function -- registro migrado para configure-private-quill.ts
  static register() {}

  constructor(quill, options) {
    super(quill, options);
    this.quill = quill;
    this.options = options;

    this.options.numeroInicial = this.options.numeroInicial ?? 1;

    this.quill.notasRodape = this;

    const toolbar = this.quill.getModule('toolbar');
    if (toolbar) {
      toolbar.addHandler('lexml-eta-nota-rodape', this.solicitarTexto.bind(this));
    }

    this.addClipboardMatcher();
    this.quill.on('text-change', this.onTextChange.bind(this));

    this.quill.root.addEventListener('click', this.onClick.bind(this));
    this.quill.root.addEventListener(NOTA_RODAPE_INPUT_EVENT, this.tratarRespostaModal.bind(this));
  }

  addClipboardMatcher() {
    this.quill.clipboard.addMatcher('lexml-eta-nota-rodape', (node, delta) => {
      let match = Parchment.query(node);
      if (match == null || match.blotName !== 'lexml-eta-nota-rodape') {
        return delta;
      }

      const id = this.isAbrindoTexto ? node.getAttribute('id-lexml-eta-nota-rodape') : this.gerarId();
      const numero = node.getAttribute('numero');
      const texto = decodeHtml(node.getAttribute('texto'));
      const notaRodape = new NotaRodape({ id, numero, texto });

      return new Delta().insert({ 'lexml-eta-nota-rodape': notaRodape });

      // const ops = delta.ops.reduce((acc, op) => {
      //   if (op.insert && op.attributes?.['id-lexml-eta-nota-rodape']) {
      //     const { 'id-lexml-eta-nota-rodape': id, numero, texto } = op.attributes || {};
      //     const notaRodape = new NotaRodape({ id, numero: +numero, texto });
      //     acc.push({ insert: { 'lexml-eta-nota-rodape': notaRodape } });
      //   }
      //   return acc;
      // }, []);

      // return new Delta(ops);
    });
  }

  onTextChange(delta, oldContent, source) {
    const undo = this.quill.history.stack.undo[this.quill.history.stack.undo.length - 1];
    const redo = this.quill.history.stack.redo[this.quill.history.stack.redo.length - 1];
    if (this.hasNotaRodape(delta) || this.hasNotaRodape(undo?.undo) || this.hasNotaRodape(undo?.redo) || this.hasNotaRodape(redo?.redo)) {
      this.renumerarTodasNotas();
      this.emitirEventoNotaRodapeAdicionadaOuRemovida(this.hasNotaRodape(delta));
    }

    if (this.hasNotaRodape(delta)) {
      this.removerEspacosAoRedorNotaRodape();
    }
  }

  removerEspacosAoRedorNotaRodape() {
    // A operação de colar texto que possua nota de rodapé está adicionando \t antes e depois do número da nota
    // O código abaixo remove esses espaços

    const notas = this.findBlotsNotaRodape();
    notas.forEach(item => {
      item.blot.next?.text?.match(/^\t/) && this.quill.deleteText(item.index + 1, 1, 'silent');
      item.blot.prev?.text?.match(/\s$/) && this.quill.deleteText(item.index - 1, 1, 'silent');
    });
  }

  timerEmitirEventoNotaRodapeChange;
  emitirEventoNotaRodapeAdicionadaOuRemovida(isAdicionadaOuAtualizada) {
    clearTimeout(this.timerEmitirEventoNotaRodapeChange);
    this.timerEmitirEventoNotaRodapeChange = setTimeout(() => {
      const eventName = isAdicionadaOuAtualizada ? NOTA_RODAPE_CHANGE_EVENT : NOTA_RODAPE_REMOVE_EVENT;
      this.quill.root.dispatchEvent(new CustomEvent(eventName, { bubbles: true }));
    }, 100);
  }

  hasNotaRodape(delta) {
    return delta?.ops?.find(op => op.insert?.['lexml-eta-nota-rodape']);
  }

  onClick(e) {
    const el = e.target;
    const elRev = el?.closest('ins, del');
    if (!elRev && (el?.tagName === 'LEXML-ETA-NOTA-RODAPE' || el?.parentElement?.tagName === 'LEXML-ETA-NOTA-RODAPE')) {
      e.preventDefault();
      e.stopPropagation();
      this.solicitarTexto(el.notaRodape || el.parentElement.notaRodape);
    }
  }

  tratarRespostaModal(event) {
    event.stopPropagation();
    const { id, texto } = event.detail;
    const el = id && this.findNodeById(id);
    this.quill.focus();
    el ? this.atualizarTexto(el.notaRodape, texto) : this.adicionar(texto);
  }

  solicitarTexto(notaRodape) {
    // const texto = prompt('Texto da nota', notaRodape?.texto);
    // if (!texto) return;
    // typeof notaRodape === 'object' ? this.atualizarTexto(notaRodape, texto) : this.adicionar(texto);

    const notaRodapeModal = new NotaRodapeModal({
      domNodeNotaRodape: this.quill.root,
      idNotaRodape: notaRodape?.id,
      textoInicialNotaRodape: notaRodape?.texto,
      tituloModal: typeof notaRodape === 'object' ? 'Editar nota de rodapé' : 'Adicionar nota de rodapé',
    });
    notaRodapeModal.open();
  }

  atualizarTexto(notaRodape, novoTexto) {
    const elemento = this.findNodeById(notaRodape.id);
    const blot = PrivateQuill.find(elemento);
    blot.format('lexml-eta-nota-rodape', { ...notaRodape, texto: novoTexto });
    return blot.domNode.notaRodape;
  }

  adicionar(texto) {
    const quill = this.quill;
    const range = quill.getSelection();
    if (!range) return;

    const id = this.gerarId();
    const notaRodape = new NotaRodape({ id, numero: 0, texto });

    const delta = new Delta().retain(range.index).delete(range.length).insert({ 'lexml-eta-nota-rodape': notaRodape });

    quill.updateContents(delta, 'user');
    quill.setSelection(range.index + 1, 0);

    return notaRodape;
  }

  remover(idNotaRodape) {
    const elemento = this.findNodeById(idNotaRodape);
    const blot = PrivateQuill.find(elemento);
    blot?.remove();
  }

  editar(idNotaRodape) {
    const notaRodape = this.findNodeById(idNotaRodape)?.notaRodape;
    notaRodape && this.solicitarTexto(notaRodape);
  }

  associar(notasRodape) {
    notasRodape.forEach(nota => {
      const elemento = this.findNodeById(nota.id);
      if (elemento) {
        elemento.notaRodape = nota;
      }
    });
  }

  getNotasRodape() {
    return this.findBlotsNotaRodape().map(item => item.blot.domNode.notaRodape);
  }

  gerarId() {
    return PREFIXO_ID + new Date().getTime();
  }

  findNodeById(id) {
    return this.quill.root.querySelector(`lexml-eta-nota-rodape[id-lexml-eta-nota-rodape="${id}"]`);
  }

  findBlotsNotaRodape() {
    return Array.from(this.quill.root.querySelectorAll('lexml-eta-nota-rodape')).map(domNode => {
      const blot = PrivateQuill.find(domNode as any);
      const index = blot.offset(this.quill.scroll);
      return {
        index,
        blot,
      };
    });
  }

  renumerarTodasNotas() {
    const range = this.quill.getSelection();
    const notas = this.findBlotsNotaRodape();
    notas.forEach((item, idx) => {
      const numero = idx + this.options.numeroInicial;
      const node = item.blot.domNode;
      node.innerText = numero;
      node.setAttribute('numero', numero);
      if (node.notaRodape?.id) {
        node.notaRodape.numero = numero;
      }
    });
    range && this.quill.setSelection(range.index, range.length);
  }

  ajustarConteudoTagsNotaRodape(html) {
    // Ajusta o conteúdo das tags <lexml-eta-nota-rodape> para que o número da nota fique dentro da tag <lexml-eta-nota-rodape>
    return html.replace(/<lexml-eta-nota-rodape.+?<\/lexml-eta-nota-rodape>/g, (texto: string) => texto.replace(/>.?<span[^>]*>(\d+)<\/span>.?</g, '>$1<'));
  }
}

export { IdNotaRodapeAttribute, ModuloNotaRodape, NotaRodapeBlot, NumeroAttribute, TextoAttribute };
