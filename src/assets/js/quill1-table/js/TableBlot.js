// import Quill from 'quill';
import TableTrick from './TableTrick';
import TableRow from './TableRowBlot';
import TableHistory from './TableHistory';
import ContainBlot from './ContainBlot';

const Parchment = Quill.import('parchment');

class Table extends ContainBlot {
  static create(value) {
    const tagName = 'table';
    let node = super.create(tagName);
    node.setAttribute('table_id', value ? value : TableTrick.random_id());
    return node;
  }

  format() {}

  optimize(context) {
    super.optimize(context);
    let quill = TableTrick.getQuill(this.domNode);
    if (!quill) return;
    let next = this.next;
    const table_id = this.domNode.getAttribute('table_id');

    if (
      next != null && next.prev === this && next.domNode.getAttribute('table_id') === table_id &&
      next.statics.blotName === this.statics.blotName && next.domNode.tagName === this.domNode.tagName
    ) {
      // merge table containing single cell with table
      next.moveChildren(this);
      next.remove();
    }

    if (
      typeof quill.table.tables[table_id] !== 'undefined' &&
      quill.table.tables[table_id].cell_counter === this.domNode.querySelectorAll('td').length &&
      quill.table.tables[table_id].row_counter === this.domNode.querySelectorAll('tr').length
    ) {
      // our table is fully initialized, we can do more optimizations

      // add hidden merged cells
      this.domNode.querySelectorAll('td[cell_id][colspan], td[cell_id][rowspan]').forEach(cell => {
        const index = Array.prototype.indexOf.call(cell.parentNode.children, cell);
        const colSpan = Number.parseInt(cell.getAttribute('colspan') || 1);
        const rowSpan = Number.parseInt(cell.getAttribute('rowspan') || 1);

        if (!this.domNode.querySelector('td[merge_id="' + cell.getAttribute('cell_id') + '"]') && (colSpan > 1 || rowSpan > 1)) {
          let row = cell.parentNode;
          for (let y = 1; y <= rowSpan; y++) {
            if (!row) break;
            // we want to add the cell between cell with colspan/rowspan and next cell
            // for next rows, add the cell before the cell with the same index
            let nextCell = y === 1 ? row.children[index + 1] : row.children[index];
            for (let x = 1; x <= colSpan; x++) {
              if (x === 1 && y === 1) {
                continue; // do not add a cell at the original cell position
              }
              let newCell = document.createElement('td');
              newCell.setAttribute('cell_id', TableTrick.random_id());
              newCell.setAttribute('row_id', row.getAttribute('row_id'));
              newCell.setAttribute('table_id', this.domNode.getAttribute('table_id'));
              newCell.setAttribute('merge_id', cell.getAttribute('cell_id'));
              let p = document.createElement('p');
              let br = document.createElement('br');
              p.appendChild(br);
              newCell.appendChild(p);
              row.insertBefore(newCell, nextCell);
            }
            row = row.nextSibling;
          }
        }
      });

      if (quill.table.tables[table_id].pasted) {
        // add to history
        TableHistory.register('insert', { node: this.domNode, nextNode: this.domNode.nextSibling, parentNode: this.domNode.parentNode });
        TableHistory.add(quill);
      }

      // delete entry for optimizing only once
      delete quill.table.tables[table_id];
    }
  }

  insertBefore(childBlot, refBlot) {
    if (this.statics.allowedChildren != null && !this.statics.allowedChildren.some(function (child) {
      return childBlot instanceof child;
    })) {
      let newChild = Parchment.create(this.statics.defaultChild, TableTrick.random_id());
      newChild.appendChild(childBlot);
      childBlot = newChild;
    }
    super.insertBefore(childBlot, refBlot)
  }
}

Table.blotName = 'table';
Table.tagName = 'table';
Table.scope = Parchment.Scope.BLOCK_BLOT;
Table.defaultChild = 'tr';
Table.allowedChildren = [TableRow];

export default Table;
