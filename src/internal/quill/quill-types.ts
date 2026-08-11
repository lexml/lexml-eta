export type QuillSource = 'api' | 'user' | 'silent';

export interface QuillRange {
  index: number;
  length: number;
}

export interface QuillStringMap {
  [key: string]: any;
}

export type QuillDeltaOperation = { insert?: any; delete?: number; retain?: number; attributes?: QuillStringMap };

export interface QuillDelta {
  ops?: QuillDeltaOperation[];
  retain(length: number, attributes?: QuillStringMap): QuillDelta;
  delete(length: number): QuillDelta;
  insert(text: any, attributes?: QuillStringMap): QuillDelta;
  length(): number;
  slice(start?: number, end?: number): QuillDelta;
  compose(other: QuillDelta): QuillDelta;
  concat(other: QuillDelta): QuillDelta;
  diff(other: QuillDelta, index?: number): QuillDelta;
}

export interface QuillOptions {
  debug?: string;
  modules?: QuillStringMap;
  placeholder?: string;
  readOnly?: boolean;
  theme?: string;
  formats?: string[];
  bounds?: HTMLElement | string;
  scrollingContainer?: HTMLElement | string;
  strict?: boolean;
}

export type QuillTextChangeHandler = (delta: QuillDelta, oldContents: QuillDelta, source: QuillSource) => any;
export type QuillSelectionChangeHandler = (range: QuillRange, oldRange: QuillRange, source: QuillSource) => any;

export declare class QuillRuntime {
  [key: string]: any;

  static sources: Record<string, QuillSource>;
  static debug(level: string | boolean): void;
  static import(path: string): any;
  static register(path: string | QuillStringMap | any, definitionOrWarning?: any, suppressWarning?: boolean): void;
  static find(domNode: Node, bubble?: boolean): any;

  constructor(element: HTMLElement, options?: QuillOptions);

  root: HTMLDivElement;
  clipboard: any;
  scroll: any;
  keyboard: any;
  history: any;

  focus(): void;
  blur(): void;
  getSelection(focus: true): QuillRange;
  getSelection(focus?: false): QuillRange | null;
  setSelection(index: number, length?: number | QuillSource, source?: QuillSource): void;
  setSelection(range: QuillRange, source?: QuillSource): void;
  setContents(delta: QuillDelta, source?: QuillSource): unknown;
  getContents(index?: number, length?: number): QuillDelta;
  setText(text: string, source?: QuillSource): QuillDelta;
  getText(index?: number, length?: number): string;
  updateContents(delta: QuillDelta, source?: QuillSource): QuillDelta;
  deleteText(index: number, length: number, source?: QuillSource): QuillDelta;
  insertText(index: number, text: string, source?: QuillSource): QuillDelta;
  insertText(index: number, text: string, formats: QuillStringMap, source?: QuillSource): QuillDelta;
  format(name: string, value: any, source?: QuillSource): QuillDelta;
  getIndex(blot: any): number;
  getLeaf(index: number): any;
  getLine(index: number): [any, number];
  on(eventName: string, handler: (...args: any[]) => any): this;
  off(eventName: string, handler: (...args: any[]) => any): this;
}

export declare class QuillExtension {
  [key: string]: any;
  constructor(...args: any[]);
  quill: QuillRuntime;
  domNode: HTMLElement;
  statics: any;
  next: any;
  formats(): QuillStringMap;
}
