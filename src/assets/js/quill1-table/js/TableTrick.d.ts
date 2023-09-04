export default class TableTrick {
  static random_id(): string;
  static getBlot(quill: any): any;
  static find_td(quill: any): any;
  static getQuill(el: any): any;
  static insertTable(quill: any, col_count: any, row_count: any): void;
  static removeTable(quill: any): void;
  static addCol(quill: any, direction?: string): void;
  static addRow(quill: any, direction?: string): void;
  static removeCol(quill: any): void;
  static removeRow(quill: any): void;
  static splitCell(quill: any): void;
  static mergeSelection(quill: any): boolean;
  static removeCell(quill: any): void;
  static removeSelection(quill: any): void;
  static _removeCell(cell: any, recursive?: boolean): boolean;
  static _split(cell: any): boolean;
  static emitTextChange(quill: any, oldDelta: any, source?: string): void;
  static table_handler(value: any, quill: any): boolean;
}
