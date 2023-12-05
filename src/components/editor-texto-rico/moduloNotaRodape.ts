/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable eqeqeq */
/* eslint-disable prefer-const */
import { NotaRodapeModal } from './nota-rodape-modal';
import { NOTA_RODAPE_CHANGE_EVENT, NOTA_RODAPE_INPUT_EVENT, NotaRodape } from './notaRodape';

const PREFIXO_ID = 'nr-';

const Delta = Quill.import('delta');
const Module = Quill.import('core/module');
const Embed = Quill.import('blots/embed'); // Inline Embed
const Parchment = Quill.import('parchment');

const cfgInline = {
  scope: Parchment.Scope.INLINE_ATTRIBUTE,
};

const IdNotaRodapeAttribute = new Parchment.Attributor.Attribute('id-nota-rodape', 'id-nota-rodape', cfgInline);
const NumeroAttribute = new Parchment.Attributor.Attribute('numero', 'numero', cfgInline);
const TitleAttribute = new Parchment.Attributor.Attribute('title', 'title', cfgInline);

class NotaRodapeBlot extends Embed {
  static create(value) {
    let node = super.create(value);
    node.setAttribute('class', 'nota-rodape');
    node.setAttribute('contenteditable', 'false');
    NotaRodapeBlot.valueToAttributes(value, node);
    return node;
  }

  static value(domNode) {
    return domNode.notaRodape;
  }

  format(name, value) {
    if (name !== this.statics.blotName || !value) return super.format(name, value);
    NotaRodapeBlot.valueToAttributes(value, this.domNode);
  }

  // static formats(domNode) {
  //   return (
  //     domNode.notaRodape || {
  //       // id: domNode.getAttribute('id'),
  //       id: domNode.getAttribute('id-nota-rodape'),
  //       numero: domNode.getAttribute('numero'),
  //       texto: domNode.getAttribute('title'),
  //     }
  //   );
  // }

  static valueToAttributes(value, domNode) {
    if (!value) return;
    // value.id && domNode.setAttribute('id', value.id);
    value.id && domNode.setAttribute('id-nota-rodape', value.id);
    value.numero && domNode.setAttribute('numero', value.numero);
    domNode.notaRodape = value;

    domNode.innerText = value.numero;
    domNode.setAttribute('title', value.texto);
  }
}

NotaRodapeBlot.blotName = 'nota-rodape';
NotaRodapeBlot.tagName = 'nota-rodape';

class ModuloNotaRodape extends Module {
  quill;
  options;

  static register() {
    Quill.register(NotaRodapeBlot);
    Quill.register(IdNotaRodapeAttribute);
    Quill.register(NumeroAttribute);
    Quill.register(TitleAttribute);
  }

  constructor(quill, options) {
    super(quill, options);
    this.quill = quill;
    this.options = options;

    this.options.numeroInicial = this.options.numeroInicial ?? 1;

    this.quill.notasRodape = this;

    const toolbar = this.quill.getModule('toolbar');
    if (toolbar) {
      toolbar.addHandler('nota-rodape', this.solicitarTexto.bind(this));
    }

    this.addClipboardMatcher();
    this.quill.on('text-change', this.onTextChange.bind(this));

    this.quill.root.addEventListener('click', this.onClick.bind(this));
    this.quill.root.addEventListener(NOTA_RODAPE_INPUT_EVENT, this.tratarRespostaModal.bind(this));
  }

  addClipboardMatcher() {
    this.quill.clipboard.addMatcher('nota-rodape', (node, delta) => {
      let match = Parchment.query(node);
      if (match == null || match.blotName !== 'nota-rodape') {
        return delta;
      }

      const ops = delta.ops.reduce((acc, op) => {
        if (op.insert) {
          if (op.attributes?.['id-nota-rodape']) {
            const { 'id-nota-rodape': id, numero, title } = op.attributes || {};
            const notaRodape = new NotaRodape({ id, numero: +numero, texto: title });
            acc.push({ insert: { 'nota-rodape': notaRodape } });
          } else {
            acc.push(op);
          }
        }
        return acc;
      }, []);

      return new Delta(ops);
    });
  }

  onTextChange(delta, oldContent, source) {
    const undo = this.quill.history.stack.undo[this.quill.history.stack.undo.length - 1];
    if (this.hasNotaRodape(delta) || this.hasNotaRodape(undo?.undo) || this.hasNotaRodape(undo?.redo)) {
      this.renumerarTodasNotas();
      this.emitirEventoNotaRodapeChange();
    }
  }

  timerEmitirEventoNotaRodapeChange;
  emitirEventoNotaRodapeChange() {
    clearTimeout(this.timerEmitirEventoNotaRodapeChange);
    this.timerEmitirEventoNotaRodapeChange = setTimeout(() => {
      this.quill.root.dispatchEvent(new CustomEvent(NOTA_RODAPE_CHANGE_EVENT, { bubbles: true }));
    }, 100);
  }

  hasNotaRodape(delta) {
    return delta?.ops?.find(op => op.insert?.['nota-rodape']);
  }

  onClick(e) {
    const el = e.target;
    if (el?.tagName === 'NOTA-RODAPE' || el?.parentElement?.tagName === 'NOTA-RODAPE') {
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
    const blot = Quill.find(elemento);
    blot.format('nota-rodape', { ...notaRodape, texto: novoTexto });
    return blot.domNode.notaRodape;
  }

  adicionar(texto) {
    const quill = this.quill;
    const range = quill.getSelection();
    if (!range) return;

    const id = this.gerarId();
    const notaRodape = new NotaRodape({ id, numero: 0, texto });

    const delta = new Delta().retain(range.index).delete(range.length).insert({ 'nota-rodape': notaRodape });

    quill.updateContents(delta, 'user');
    quill.setSelection(range.index + 1, 0);

    return notaRodape;
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
    return this.quill.root.querySelector(`nota-rodape[id-nota-rodape="${id}"]`);
  }

  findBlotsNotaRodape() {
    return Array.from(this.quill.root.querySelectorAll('nota-rodape')).map(domNode => {
      const blot = Quill.find(domNode as any);
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
      node.notaRodape.numero = numero;
    });
    range && this.quill.setSelection(range.index, range.length);
  }
}

export { ModuloNotaRodape };
