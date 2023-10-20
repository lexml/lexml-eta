// import Quill from 'quill';
// import Delta from 'quill-delta';
// import './css/quill.table.css';
import TableCell from './js/TableCellBlot';
import TableRow from './js/TableRowBlot';
import TableHistory from './js/TableHistory';
import Table from './js/TableBlot';
import Contain from './js/ContainBlot';
import TableTrick from './js/TableTrick';
import TableSelection from './js/TableSelection';
import TableToolbar from './js/TableToolbar';

const Container = Quill.import('blots/container');
const Parchment = Quill.import('parchment');
const Delta = Quill.import("delta");

const nodeListToArray = collection => {
  const elementsIndex = [];
  for (let i = 0; i < collection.length; i++) {
    elementsIndex.push(i);
  }
  return elementsIndex.map(i => collection.item(i));
};

Container.order = [
  'list', 'contain',   // Must be lower
  'td', 'tr', 'table'  // Must be higher
];

const emitirEventoTableInTable = (quill) => {
  quill.container.dispatchEvent(
    new CustomEvent('onTableInTable', {
      bubbles: true,
      composed: true,
    })
  );
};

export default class TableModule {
  static register() {
    Quill.register(TableCell, true);
    Quill.register(TableRow, true);
    Quill.register(Table, true);
    Quill.register(Contain, true);
  }

  constructor(quill, options) {
    quill.history.tableStack = {};
    quill.table = {
      isInTable: false,
      tables: {}
    };

    // selection mouse events
    quill.container.addEventListener('mousedown', (e) => TableSelection.mouseDown(quill, e, options.cellSelectionOnClick));
    quill.container.addEventListener('mousemove', (e) => TableSelection.mouseMove(quill, e));
    quill.container.addEventListener('mouseup', (e) => TableSelection.mouseUp(quill, e));
    quill.on('selection-change', (range, oldRange) => TableSelection.selectionChange(quill, range, oldRange));

    const toolbar = quill.getModule('toolbar');

    toolbar.addHandler('table', function (value) {
      TableModule.configToolbar(quill, value);
    });

    const clipboard = quill.getModule('clipboard');
    clipboard.addMatcher('TABLE', function (node, delta) {
      if (isInTable(quill)) {
        emitirEventoTableInTable(quill);
        return new Delta();
      }

      const is_pasted_data = node.closest('.ql-editor') === null;
      const table_id = node.getAttribute('table_id');
      if (table_id) {
        quill.table.tables[table_id] = {
          pasted: is_pasted_data,
          row_counter: node.querySelectorAll('tr').length,
          cell_counter: node.querySelectorAll('td').length
        };
      }
      return delta;
    });
    clipboard.addMatcher('TR', function (node, delta) {
      return delta;
    });
    clipboard.addMatcher('TD, TH', function (node, delta) {
      if (delta.length() === 0) {
        // fix https://github.com/dclement8/quill1-table/issues/7 (empty td removed)
        delta.ops = [
          {insert: '\n'}
        ];
      } else if (delta.ops && delta.ops.length) {
        // fix https://github.com/dclement8/quill1-table/issues/7 (td with no child node)
        const lastIndex = delta.ops.reduce((lastIndex, op, idx) => typeof op.insert !== 'undefined' ? idx : lastIndex, -1);
        if (lastIndex >= 0 && !delta.ops[lastIndex].insert.endsWith('\n')) {
          delta.ops[lastIndex].insert += '\n';
        }
      }

      const tableNode = node.closest('table');
      if (!node.getAttribute('table_id') && tableNode) {
        if (!tableNode.getAttribute('table_id')) {
          tableNode.setAttribute('table_id', TableTrick.random_id());
        }
        node.setAttribute('table_id', tableNode.getAttribute('table_id'));
      }

      if (!node.getAttribute('row_id')) {
        const rowNode = node.closest('tr');
        if (rowNode) {
          if (!rowNode.getAttribute('row_id')) {
            rowNode.setAttribute('row_id', TableTrick.random_id());
          }
          node.setAttribute('row_id', rowNode.getAttribute('row_id'));
        }
      }

      if (!node.getAttribute('cell_id')) {
        node.setAttribute('cell_id', TableTrick.random_id());
      }

      const newDelta = delta.compose(new Delta().retain(delta.length(), {
        td: [
          node.getAttribute('table_id'),
          node.getAttribute('row_id'),
          node.getAttribute('cell_id'),
          node.getAttribute('merge_id'),
          node.getAttribute('colspan'),
          node.getAttribute('rowspan')
        ].join('|')
      }));
      return newDelta;
    });

    TableToolbar.enable(quill, ['newtable_*', 'insert', 'undo', 'redo']);
  }

  static tableOptions() {
    const maxRows = 5;
    const maxCols = 5;
    const tableOptions = [];
    for (let r = 1; r <= maxRows; r++) {
      for (let c = 1; c <= maxCols; c++) {
        tableOptions.push('newtable_' + r + '_' + c);
      }
    }
    return tableOptions;
  }

  static configToolbar(quill, value) {
    if (isInsertTable(value) && isInTable(quill)) {
      emitirEventoTableInTable(quill);
      return false;
    }
    return TableTrick.table_handler(value, quill);
  }


  static removeNodeChildren(node) {
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  }

  static keyboardHandler(quill, key, range, keycontext) {
    const format_start = quill.getFormat(range.index - 1);
    const format_end = quill.getFormat(range.index + range.length);

    if (key === 'undo' || key === 'redo' || key === 'copy') {
      return TableTrick.table_handler(key, quill);
    }

    // If the event is not in a cell, then pass the standard handler
    if (!format_start.td && !keycontext.format.td && !format_end.td) {
      return true;
    }

    if (key === 'backspace') {
      // if the selection is at the cell border
      // BUG: after undo brings back deleted cell when backspace comes in the keycontext offset is 0, which throws it to the end
      if (!keycontext.offset && !range.length) {
        const selection = window.getSelection();
        const nodeList = document.querySelectorAll(".ql-editor p");
        // remove selected content
        const resultNodes = nodeListToArray(nodeList).filter(cell =>
          selection.containsNode(cell, true)
        );

        // deletion does not affect the cell
        if (!resultNodes.length) {
          return true;
        }
        // do not delete if we have a selection (TODO: manage selection deletion)
        if (TableSelection.getSelectionCoords()) {
          return false;
        }

        let nodeRemoved = false;
        resultNodes.forEach((resultNode, i) => {
          if (resultNode.previousSibling) {
            if (resultNode.previousSibling.nodeName === 'TABLE') {
              // remove last cell if we are right after a table
              const cells = resultNode.previousSibling.querySelectorAll('td');
              if (cells.length && TableTrick._removeCell(cells[cells.length - 1])) {
                nodeRemoved = true;
              }
            }
          } else if (resultNode.parentNode.nodeName === 'TD') {
            // remove current cell if we are inside it
            if (TableTrick._removeCell(resultNode.parentNode)) {
              nodeRemoved = true;
            }
          }
        });

        if (nodeRemoved) {
          TableHistory.add(quill);
        }

        // if at least one node has been removed, then return false (do not call standard handler)
        return !nodeRemoved;
      }

      // If we delete not at the cell border, then pass the standard handler
      return true;
    }

    if (key === 'tab') {
      TableSelection.resetSelection();
      const [leaf] = quill.getLeaf(quill.getSelection().index);
      let selectionIndex;
      let blot;
      let unmergedCell;
      if (leaf.parent.domNode.closest('td')) {
        if (leaf.parent.domNode.closest('td').nextSibling) {
          unmergedCell = leaf.parent.domNode.closest('td').nextSibling
          while (unmergedCell && unmergedCell.getAttribute('merge_id')) {
            unmergedCell = unmergedCell.nextSibling
          }
          blot = Quill.find(unmergedCell ? unmergedCell : leaf.parent.domNode.closest('tr').nextSibling) //we truly dont have any more cells
        } else { //we dont need to find the first child here since quill does the right thing
          if (leaf.parent.domNode.closest('tr').nextSibling) { //no more cells, go to the next row
            blot = Quill.find(leaf.parent.domNode.closest('tr').nextSibling)
          } else { //no more rows to the tables next sibling which will be the next quill run p,h1-h4
            if (leaf.parent.domNode.closest('table').nextSibling) {
              blot = Quill.find(leaf.parent.domNode.closest('table').nextSibling)
            }
          }
        }
        //we get the actual editor index when we have the blot aka element in editor
        selectionIndex = blot.offset(quill.scroll);
        quill.setSelection(selectionIndex, 0)

        return false
      }
      return true
    }

    if (key === "shiftTab") {
      //previous cell
      TableSelection.resetSelection();
      const [leaf] = quill.getLeaf(quill.getSelection().index);
      let selectionIndex;
      let blot;
      let unmergedCell;
      if (leaf.parent.domNode.closest('td')) {
        if (leaf.parent.domNode.closest('td').previousSibling) {
          unmergedCell = leaf.parent.domNode.closest('td').previousSibling;
          while (unmergedCell.getAttribute('merge_id')) { //this a merged cell, in dom but styled/css out
            unmergedCell = unmergedCell.previousSibling;
          }
          blot = Quill.find(unmergedCell);
        } else {
          if (leaf.parent.domNode.closest('tr').previousSibling) { //no more cells, go to the next row
            unmergedCell = leaf.parent.domNode.closest('tr').previousSibling.lastChild;
            while (unmergedCell.getAttribute('merge_id')) { //this a merged cell, in dom but styled/css out
              unmergedCell = unmergedCell.previousSibling;
            }
            blot = Quill.find(unmergedCell);
          } else {
            if (leaf.parent.domNode.closest('table').previousSibling) { //no more rows to the tables prev sibling which will just go to electron default.
              return true;
            }
          }
        }
        //we get the actual editor index when we have the blot aka element in editor
        selectionIndex = blot.offset(quill.scroll);
        quill.setSelection(selectionIndex, 0)

        return false;
      }
      return true;
    }

    let node = quill.selection.getNativeRange().start.node;
    if (!node) return false;
    let blot = Parchment.find(node);

    if (
      key === 'delete' && blot &&
      keycontext.offset < (blot.text ? blot.text.length : 0)
    ) {
      return true;
    }

    const [prev] = quill.getLine(range.index - 1);
    const [next] = quill.getLine(range.index + 1);
    // If a cell has multiple rows, you can delete as standard

    if (key === 'selectAll') {
      let [line] = quill.getLine(quill.getSelection().index);
      let blot;
      let nextBlot;
      if (line.parent.domNode.nodeName === "TD") {
        if (line.parent.domNode.nextSibling){
          nextBlot = Quill.find(line.parent.domNode.nextSibling);
        } else { //no next cell to bounce the end to
          if (line.parent.domNode.closest('tr').nextSibling) { //no next row either
            nextBlot = Quill.find(line.parent.domNode.closest('tr').nextSibling);
          } else { //the only other thing is get tables sibling which is the next p in editor
            nextBlot = Quill.find(line.parent.domNode.closest('table').nextSibling);
          }
        }
        blot = Quill.find(line.parent.domNode);
        let selectionIndex = blot.offset(quill.scroll); //index for cell start
        let nextBlotIndex = nextBlot.offset(quill.scroll); //index for cell ending
        quill.setSelection(selectionIndex, nextBlotIndex-selectionIndex-1);
        return false;
      }
      return true;
    }
    if (key === 'backspace' && prev && prev.next) {
      return true;
    }
    if (key === 'delete' && next && next.prev) {
      return true;
    }
  }
}

const isInsertTable = (value = '') => value.includes('newtable_');

const isInTable = (quill) => quill && quill.getSelection(true) && quill.getFormat(quill.getSelection(true)).td;
