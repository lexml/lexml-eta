export default TableHistory;
declare class TableHistory {
  static changes: any[];
  static register(type: any, change: any): void;
  static add(quill: any): void;
  static undo(quill: any, id: any): void;
  static redo(quill: any, id: any): void;
  static insert(change: any): boolean;
  static remove(change: any): boolean;
  static split(change: any, revert: any): boolean;
  static merge(change: any, revert: any): boolean;
  static propertyChange(change: any, revert: any): void;
}
