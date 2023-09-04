export default class TableModule {
  static register(): void;
  static tableOptions(): string[];
  static removeNodeChildren(node: any): void;
  static keyboardHandler(quill: any, key: any, range: any, keycontext: any): boolean;
  constructor(quill: any, options: any);
}
