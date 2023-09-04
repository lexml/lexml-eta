export default TableSelection;
declare class TableSelection {
  static focusedCell: any;
  static isMouseDown: boolean;
  static selectionStartElement: any;
  static selectionEndElement: any;
  static previousSelection: any[];
  static dblClickTimeout: any;
  static clickedCellTimeout: any;
  static preventMouseDown: boolean;
  static cellSelectionOnClick: boolean;
  static mouseDown(quill: any, e: any, inCellSelectionOnClick: any): void;
  static mouseMove(quill: any, e: any): void;
  static mouseUp(quill: any, e: any): void;
  static selectionChange(quill: any, range?: any, oldRange?: any): void;
  static getSelectionCoords(): {
    coords: any[][];
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
  static getCellAt(x: any, y: any): any;
  static getTargetCell(e: any): any;
  static resetSelection(container: any): void;
}
