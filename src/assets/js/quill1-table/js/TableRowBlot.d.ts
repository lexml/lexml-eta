export default TableRow;
declare class TableRow extends ContainBlot {
  format(): void;
  optimize(context: any): void;
  insertBefore(childBlot: any, refBlot: any): void;
  replace(target: any): void;
  createDefaultChild(refBlot: any): any;
}
declare namespace TableRow {
  const blotName: string;
  const tagName: string;
  const scope: any;
  const defaultChild: string;
  const allowedChildren: typeof TableCell[];
}
import ContainBlot from './ContainBlot';
import TableCell from './TableCellBlot';
