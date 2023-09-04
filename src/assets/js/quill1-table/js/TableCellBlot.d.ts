export default TableCell;
declare class TableCell extends ContainBlot {
  format(): void;
  formats(): {
    [x: number]: string;
  };
  optimize(context: any): void;
  insertBefore(childBlot: any, refBlot: any): void;
  replace(target: any): void;
  moveChildren(targetParent: any, refNode: any): void;
}
declare namespace TableCell {
  const blotName: string;
  const tagName: string;
  const className: string;
  const scope: any;
  const allowedChildren: any[];
}
import ContainBlot from './ContainBlot';
