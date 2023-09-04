export default class TableToolbar {
  static get(quill: any): any;
  static toggle(quill: any, actions?: any[], enable?: boolean): void;
  static enable(quill: any, actions: any): void;
  static disable(quill: any, actions: any): void;
  static disableAll(quill: any): boolean;
  static isEnabled(quill: any, action: any): any;
}
