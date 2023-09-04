export default Table;
declare class Table extends ContainBlot {
  format(): void;
  optimize(context: any): void;
  insertBefore(childBlot: any, refBlot: any): void;
}
declare namespace Table {
  const blotName: string;
  const tagName: string;
  const scope: any;
  const defaultChild: string;
  const allowedChildren: typeof TableRow[];
}
import ContainBlot from './ContainBlot';
import TableRow from './TableRowBlot';
