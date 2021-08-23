declare type Sources = 'api' | 'user' | 'silent';

declare interface Key {
  key: string;
  shortKey?: boolean;
}

declare interface StringMap {
  [key: string]: any;
}

declare interface OptionalAttributes {
  attributes?: StringMap;
}

declare interface RangeStatic {
  index: number;
  length: number;
}

declare class RangeStatic implements RangeStatic {
  constructor();
  index: number;
  length: number;
}

declare type TextChangeHandler = (delta: DeltaStatic, oldContents: DeltaStatic, source: Sources) => any;
declare type SelectionChangeHandler = (range: RangeStatic, oldRange: RangeStatic, source: Sources) => any;
declare type EditorChangeHandler =
  | ((name: 'text-change', delta: DeltaStatic, oldContents: DeltaStatic, source: Sources) => any)
  | ((name: 'selection-change', range: RangeStatic, oldRange: RangeStatic, source: Sources) => any);

declare interface EventEmitter {
  on(eventName: 'text-change', handler: TextChangeHandler): EventEmitter;
  on(eventName: 'selection-change', handler: SelectionChangeHandler): EventEmitter;
  on(eventName: 'editor-change', handler: EditorChangeHandler): EventEmitter;
  once(eventName: 'text-change', handler: TextChangeHandler): EventEmitter;
  once(eventName: 'selection-change', handler: SelectionChangeHandler): EventEmitter;
  once(eventName: 'editor-change', handler: EditorChangeHandler): EventEmitter;
  off(eventName: 'text-change', handler: TextChangeHandler): EventEmitter;
  off(eventName: 'selection-change', handler: SelectionChangeHandler): EventEmitter;
  off(eventName: 'editor-change', handler: EditorChangeHandler): EventEmitter;
}

declare type DeltaOperation = { insert?: any; delete?: number; retain?: number } & OptionalAttributes;

declare interface DeltaStatic {
  ops?: DeltaOperation[];
  retain(length: number, attributes?: StringMap): DeltaStatic;
  delete(length: number): DeltaStatic;
  filter(predicate: (op: DeltaOperation) => boolean): DeltaOperation[];
  forEach(predicate: (op: DeltaOperation) => void): void;
  insert(text: any, attributes?: StringMap): DeltaStatic;
  map<T>(predicate: (op: DeltaOperation) => T): T[];
  partition(predicate: (op: DeltaOperation) => boolean): [DeltaOperation[], DeltaOperation[]];
  reduce<T>(predicate: (acc: T, curr: DeltaOperation, idx: number, arr: DeltaOperation[]) => T, initial: T): T;
  chop(): DeltaStatic;
  length(): number;
  slice(start?: number, end?: number): DeltaStatic;
  compose(other: DeltaStatic): DeltaStatic;
  concat(other: DeltaStatic): DeltaStatic;
  diff(other: DeltaStatic, index?: number): DeltaStatic;
  eachLine(predicate: (line: DeltaStatic, attributes: StringMap, idx: number) => any, newline?: string): DeltaStatic;
  transform(index: number, priority?: boolean): number;
  transform(other: DeltaStatic, priority: boolean): DeltaStatic;
  transformPosition(index: number, priority?: boolean): number;
}

declare class Delta implements DeltaStatic {
  constructor(ops?: DeltaOperation[] | { ops: DeltaOperation[] });
  ops: DeltaOperation[];
  retain(length: number, attributes?: StringMap): DeltaStatic;
  delete(length: number): DeltaStatic;
  filter(predicate: (op: DeltaOperation) => boolean): DeltaOperation[];
  forEach(predicate: (op: DeltaOperation) => void): void;
  insert(text: any, attributes?: StringMap): DeltaStatic;
  map<T>(predicate: (op: DeltaOperation) => T): T[];
  partition(predicate: (op: DeltaOperation) => boolean): [DeltaOperation[], DeltaOperation[]];
  reduce<T>(predicate: (acc: T, curr: DeltaOperation, idx: number, arr: DeltaOperation[]) => T, initial: T): T;
  chop(): DeltaStatic;
  length(): number;
  slice(start?: number, end?: number): DeltaStatic;
  compose(other: DeltaStatic): DeltaStatic;
  concat(other: DeltaStatic): DeltaStatic;
  diff(other: DeltaStatic, index?: number): DeltaStatic;
  eachLine(predicate: (line: DeltaStatic, attributes: StringMap, idx: number) => any, newline?: string): DeltaStatic;
  transform(index: number): number;
  transform(other: DeltaStatic, priority: boolean): DeltaStatic;
  transformPosition(index: number): number;
}

declare interface Attributes {
  underline?: boolean;
  strike?: boolean;
  italic?: boolean;
  bold?: boolean;
  script?: undefined | null | 'sub' | 'super';
}

declare interface BoundsStatic {
  bottom: number;
  left: number;
  right: number;
  top: number;
  height: number;
  width: number;
}

declare interface KeyboardStatic {
  addBinding(key: Key, callback: (range: RangeStatic, context: any) => void): void;
  addBinding(key: Key, context: any, callback: (range: RangeStatic, context: any) => void): void;
  bindings: any;
  operacaoTecladoInvalida: any;
  adicionaElementoTeclaEnter: any;
  criaAlteracao: any;
  moveElemento: any;
  removeElemento: any;
  transformaElemento: any;
  renumeraElemento: any;
  verificarOperacaoTecladoPermitida: any;
  onBold: any;
  onItalic: any;
  onScript: any;
}

declare interface ClipboardStatic {
  convert(html?: string): DeltaStatic;
  addMatcher(selectorOrNodeType: string | number, callback: (node: any, delta: DeltaStatic) => DeltaStatic): void;
  dangerouslyPasteHTML(html: string, source?: Sources): void;
  dangerouslyPasteHTML(index: number, html: string, source?: Sources): void;
}

declare interface QuillOptionsStatic {
  debug?: string;
  modules?: StringMap;
  placeholder?: string;
  readOnly?: boolean;
  theme?: string;
  formats?: string[];
  bounds?: HTMLElement | string;
  scrollingContainer?: HTMLElement | string;
  strict?: boolean;
}

declare interface LinkedNode {
  prev: LinkedNode | null;
  next: LinkedNode | null;
  length(): number;
}

declare class LinkedList<T extends LinkedNode> {
  head: T | null;
  tail: T | null;
  length: number;
  constructor();
  append(...nodes: T[]): void;
  contains(node: T): boolean;
  insertBefore(node: T | null, refNode: T | null): void;
  offset(target: T): number;
  remove(node: T): void;
  iterator(curNode?: T | null): () => T | null;
  find(index: number, inclusive?: boolean): [T | null, number];
  forEach(callback: (cur: T) => void): void;
  forEachAt(index: number, length: number, callback: (cur: T, offset: number, length: number) => void): void;
  map(callback: (cur: T | null) => any): any[];
  reduce<M>(callback: (memo: M, cur: T) => M, memo: M): M;
}

declare interface Blot extends LinkedNode {
  scroll: Parent;
  parent: Parent;
  prev: Blot;
  next: Blot;
  domNode: Node;
  attach(): void;
  clone(): Blot;
  detach(): void;
  insertInto(parentBlot: Parent, refBlot?: Blot): void;
  isolate(index: number, length: number): Blot;
  offset(root?: Blot): number;
  remove(): void;
  replace(target: Blot): void;
  replaceWith(name: string, value: any): Blot;
  replaceWith(replacement: Blot): Blot;
  split(index: number, force?: boolean): Blot;
  wrap(name: string, value: any): Parent;
  wrap(wrapper: Parent): Parent;
  deleteAt(index: number, length: number): void;
  formatAt(index: number, length: number, name: string, value: any): void;
  insertAt(index: number, value: string, def?: any): void;
  optimize(context: { [key: string]: any }): void;
  optimize(
    mutations: MutationRecord[],
    context: {
      [key: string]: any;
    }
  ): void;
  update(
    mutations: MutationRecord[],
    context: {
      [key: string]: any;
    }
  ): void;
}

declare interface Parent extends Blot {
  children: LinkedList<Blot>;
  domNode: HTMLElement;
  appendChild(child: Blot): void;
  descendant<T>(
    type: {
      new (): T;
    },
    index: number
  ): [T, number];
  descendant<T>(matcher: (blot: Blot) => boolean, index: number): [T, number];
  descendants<T>(
    type: {
      new (): T;
    },
    index: number,
    length: number
  ): T[];
  descendants<T>(matcher: (blot: Blot) => boolean, index: number, length: number): T[];
  insertBefore(child: Blot, refNode?: Blot): void;
  moveChildren(parent: Parent, refNode?: Blot): void;
  path(index: number, inclusive?: boolean): [Blot, number][];
  removeChild(child: Blot): void;
  unwrap(): void;
}

declare interface Formattable extends Blot {
  format(name: string, value: any): void;
  formats(): {
    [index: string]: any;
  };
}

declare interface Leaf extends Blot {
  index(node: Node, offset: number): number;
  position(index: number, inclusive: boolean): [Node, number];
  value(): any;
}

declare class Quill {
  root: HTMLDivElement;
  clipboard: ClipboardStatic;
  scroll: any;
  keyboard: KeyboardStatic;
  history: any;

  static sources: any;

  constructor(el: HTMLElement, op: QuillOptionsStatic);

  focus(): void;
  blur(): void;
  hasFocus(): boolean;

  enable(enabled?: boolean): void;
  disable(): void;

  setSelection(index: number, length: number, source?: Sources): void;
  setSelection(range: RangeStatic, source?: Sources): void;

  setContents(deltas: any, source?: Sources): unknown;
  getContents(index?: number, length?: number): DeltaStatic;

  setText(text: string, source?: Sources): DeltaStatic;
  getText(index: number, length: number): string;
  getText(): string;

  updateContents(delta: DeltaStatic, source?: Sources): DeltaStatic;
  update(source?: Sources): void;

  getLength(): number;

  getBounds(index: number, length?: number): BoundsStatic;
  getSelection(focus: true): RangeStatic;
  getSelection(focus?: false): RangeStatic | null;

  deleteText(index: number, length: number, source?: Sources): DeltaStatic;

  insertEmbed(index: number, type: string, value: any, source?: Sources): DeltaStatic;
  insertText(index: number, text: string, source?: Sources): DeltaStatic;
  insertText(index: number, text: string, format: string, value: any, source?: Sources): DeltaStatic;
  insertText(index: number, text: string, formats: StringMap, source?: Sources): DeltaStatic;

  format(name: string, value: any, source?: Sources): DeltaStatic;
  formatLine(index: number, length: number, source?: Sources): DeltaStatic;
  formatLine(index: number, length: number, format: string, value: any, source?: Sources): DeltaStatic;
  formatLine(index: number, length: number, formats: StringMap, source?: Sources): DeltaStatic;
  formatText(index: number, length: number, source?: Sources): DeltaStatic;
  formatText(index: number, length: number, format: string, value: any, source?: Sources): DeltaStatic;
  formatText(index: number, length: number, formats: StringMap, source?: Sources): DeltaStatic;
  formatText(range: RangeStatic, format: string, value: any, source?: Sources): DeltaStatic;
  formatText(range: RangeStatic, formats: StringMap, source?: Sources): DeltaStatic;

  getFormat(range?: RangeStatic): StringMap;
  getFormat(index: number, length?: number): StringMap;
  removeFormat(index: number, length: number, source?: Sources): DeltaStatic;

  static debug(level: string | boolean): void;
  static import(path: string): any;
  static register(path: string, def: any, suppressWarning?: boolean): void;
  static register(defs: StringMap, suppressWarning?: boolean): void;
  static find(domNode: Node, bubble?: boolean): Quill | any;

  addContainer(classNameOrDomNode: string | Node, refNode?: Node): any;
  getModule(name: string): any;

  getIndex(blot: any): number;
  getLeaf(index: number): any;
  getLine(index: number): [any, number];
  getLines(index?: number, length?: number): any[];
  getLines(range: RangeStatic): any[];

  on(eventName: 'text-change', handler: TextChangeHandler): EventEmitter;
  on(eventName: 'selection-change', handler: SelectionChangeHandler): EventEmitter;
  on(eventName: 'editor-change', handler: EditorChangeHandler): EventEmitter;
  once(eventName: 'text-change', handler: TextChangeHandler): EventEmitter;
  once(eventName: 'selection-change', handler: SelectionChangeHandler): EventEmitter;
  once(eventName: 'editor-change', handler: EditorChangeHandler): EventEmitter;
  off(eventName: 'text-change', handler: TextChangeHandler): EventEmitter;
  off(eventName: 'selection-change', handler: SelectionChangeHandler): EventEmitter;
  off(eventName: 'editor-change', handler: EditorChangeHandler): EventEmitter;
}
