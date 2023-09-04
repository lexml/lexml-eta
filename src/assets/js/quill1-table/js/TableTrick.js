// import Quill from 'quill';
import TableHistory from './TableHistory';
import TableSelection from './TableSelection';

const Parchment = Quill.import('parchment');
const Container = Quill.import('blots/container');
const Scroll = Quill.import('blots/scroll');

export default class TableTrick {
  static random_id() {
    return Math.random().toString(36).slice(2);
  }

  static getBlot(quill) {
    let blot = null;
    const selection = quill.getSelection();
    if (selection) {
      blot = quill.getLeaf(selection['index'])[0];
    }
    return blot;
  }

  static find_td(quill) {
    let blot = TableTrick.getBlot(quill);
    if (blot) {
      for (; blot != null && blot.statics.blotName !== 'td';) {
        blot = blot.parent;
      }
    }
    return blot; // return TD or NULL
  }

  static getQuill(el) {
    // Get Quill instance from node/element or blot
    let quill = null;
    if (el instanceof Node) {
      if (!el instanceof Element) {
        el = el.parentElement;
      }
    } else if (typeof el === 'object' && typeof el.domNode !== 'undefined') {
      el = el.domNode;
    }

    if (el instanceof Element) {
      const editorNode = el.closest('.ql-container');
      if (editorNode) {
        quill = Quill.find(editorNode);
      }
    }
    return quill;
  }

  static insertTable(quill, col_count, row_count) {
    const table_id = TableTrick.random_id();
    const table = Parchment.create('table', table_id);
    for (let ri = 0; ri < row_count; ri++) {
      const row_id = TableTrick.random_id();
      const tr = Parchment.create('tr', row_id);
      table.appendChild(tr);
      for (let ci = 0; ci < col_count; ci++) {
        const cell_id = TableTrick.random_id();
        const value = [table_id, row_id, cell_id].join('|');
        const td = Parchment.create('td', value);
        tr.appendChild(td);
        const p = Parchment.create('block');
        td.appendChild(p);
        const br = Parchment.create('break');
        p.appendChild(br);
      }
    }
    let blot = TableTrick.getBlot(quill);
    let top_branch = null;
    for (; blot != null && !(blot instanceof Container || blot instanceof Scroll);) {
      top_branch = blot;
      blot = blot.parent;
    }
    blot.insertBefore(table, top_branch);
    TableHistory.register('insert', { node: table.domNode, nextNode: top_branch.domNode });
    TableHistory.add(quill);
  }

  static removeTable(quill) {
    const coords = TableSelection.getSelectionCoords();
    TableSelection.resetSelection(quill.container);
    let table;
    if (coords) {
      const _table = TableSelection.selectionStartElement.closest('table');
      table = Parchment.find(_table);
    } else {
      const td = TableTrick.find_td(quill);
      if (td) {
        table = td.parent.parent;
      }
    }

    if (table) {
      TableHistory.register('remove', { node: table.domNode, nextNode: table.next ? table.next.domNode : null, parentNode: table.parent.domNode });
      TableHistory.add(quill);
      table.remove();
    }
  }

  static addCol(quill, direction = 'after') {
    // direction = before: append col before current cell or before leftmost cell of selection
    // direction = after: append col after current cell or after rightmost cell of selection
    const coords = TableSelection.getSelectionCoords();
    let td = TableTrick.find_td(quill);
    if (coords) {
      const cell = TableSelection.getCellAt(coords.maxX, coords.minY) || TableSelection.getCellAt(coords.maxX, coords.maxY);
      if (cell) {
        td = Parchment.find(cell);
      }
    }

    if (td) {
      if (direction !== 'before' && td.domNode.getAttribute('colspan')) {
        // for direction = after, if the cell is merged, append column at the end of merged cell (not after the first cell)
        const endCell = td.parent.domNode.children[
          Array.prototype.indexOf.call(td.parent.domNode.children, td.domNode) + Number.parseInt(td.domNode.getAttribute('colspan')) - 1
        ];
        if (endCell) {
          td = Parchment.find(endCell);
        }
      }

      // get cell index
      const index = Array.prototype.indexOf.call(td.parent.domNode.children, td.domNode) + (direction === 'before' ? 0 : 1);
      // is this the last cell?
      const last_cell = index === td.parent.domNode.children.length;
      const table = td.parent.parent;
      const table_id = table.domNode.getAttribute('table_id');
      let managed_merged_cells = [];

      table.children.forEach(function (tr) {
        const row_id = tr.domNode.getAttribute('row_id');
        const cell_id = TableTrick.random_id();
        const new_td = Parchment.create('td', [table_id, row_id, cell_id].join('|'));
        // do not add the cell for this row if selected cell is the last cell and if this row has more or less cells
        if (!last_cell || index === tr.domNode.children.length) {
          if (typeof tr.domNode.children[index] === 'undefined') {
            tr.appendChild(new_td);
            TableHistory.register('insert', { node: new_td.domNode, parentNode: tr.domNode });
          } else {
            const td = Parchment.find(tr.domNode.children[index]);
            if (td) {
              // manage merged cells
              if (td.domNode.previousSibling) {
                let merge_id = td.domNode.previousSibling.getAttribute('merge_id');
                const _colSpan = Number.parseInt(td.domNode.previousSibling.getAttribute('colspan') || 1);
                if (_colSpan > 1) {
                  merge_id = td.domNode.previousSibling.getAttribute('cell_id');
                }

                if (merge_id) {
                  new_td.domNode.setAttribute('merge_id', merge_id);
                  if (managed_merged_cells.indexOf(merge_id) === -1) {
                    managed_merged_cells.push(merge_id);
                    const _cell = table.domNode.querySelector('td[cell_id="' + merge_id + '"]');
                    if (_cell) {
                      const colSpan = Number.parseInt(_cell.getAttribute('colspan'));
                      _cell.setAttribute('colspan', colSpan + 1);
                      TableHistory.register('propertyChange', { node: _cell, property: 'colspan', oldValue: colSpan, newValue: colSpan + 1 });
                    }
                  }
                }
              }
              tr.insertBefore(new_td, td);
              TableHistory.register('insert', { node: new_td.domNode, nextNode: td.domNode });
            }
          }
        }
      });
      TableHistory.add(quill);
    }
  }

  static addRow(quill, direction = 'after') {
    // direction = before: append row above current cell or above topmost cell of selection
    // direction = after: append row below current cell or below bottommost cell of selection
    const coords = TableSelection.getSelectionCoords();
    let td = TableTrick.find_td(quill);
    if (coords) {
      const cell = TableSelection.getCellAt(coords.minX, coords.maxY) || TableSelection.getCellAt(coords.maxX, coords.maxY);
      if (cell) {
        td = Parchment.find(cell);
      }
    }

    if (td) {
      const tr = td.parent;
      const col_count = tr.domNode.children.length;
      const table = tr.parent;
      const new_row = tr.clone();
      // get row index
      let index = Array.prototype.indexOf.call(table.domNode.children, tr.domNode) + (direction === 'before' ? 0 : 1);

      let manage_merged_cells = true;
      const rowSpan = Number.parseInt(td.domNode.getAttribute('rowspan') || 1);
      if (rowSpan > 1) {
        manage_merged_cells = false;
        if (direction !== 'before') {
          // add row below merged cell
          index += rowSpan - 1;
        }
      }

      const table_id = table.domNode.getAttribute('table_id');
      const row_id = TableTrick.random_id();
      new_row.domNode.setAttribute('row_id', row_id);
      let managed_merged_cells = [];
      let managed_unmerged_cells = [];

      for (let i = 0; i < col_count; i++) {
        const prev_cell = tr.domNode.children[i];
        const cell_id = TableTrick.random_id();
        const td = Parchment.create('td', [table_id, row_id, cell_id].join('|'));
        if (prev_cell && manage_merged_cells) {
          // manage merged cells
          let merge_id, merged_cell;
          if (prev_cell.getAttribute('rowspan')) {
            merge_id = prev_cell.getAttribute('cell_id');
            merged_cell = prev_cell;
            if (direction === 'before') {
              // do not merge cells if we add a row before a merged cell
              if (managed_unmerged_cells.indexOf(merge_id) === -1) {
                managed_unmerged_cells.push(merge_id);
              }
            }
          } else if (prev_cell.getAttribute('merge_id')) {
            merge_id = prev_cell.getAttribute('merge_id');
            merged_cell = table.domNode.querySelector('td[cell_id="' + merge_id + '"]');
          }

          if (merge_id && merged_cell && managed_unmerged_cells.indexOf(merge_id) === -1 && merged_cell.getAttribute('rowspan')) {
            // merge cells of the new row according to previous row
            let merge_rowspan = Number.parseInt(merged_cell.getAttribute('rowspan'));
            if (merge_rowspan > 1) {
              if (managed_merged_cells.indexOf(merge_id) === -1) {
                managed_merged_cells.push(merge_id);
                merged_cell.setAttribute('rowspan', merge_rowspan + 1);
                TableHistory.register('propertyChange', { node: merged_cell, property: 'rowspan', oldValue: merge_rowspan, newValue: merge_rowspan + 1 });
              }
              td.domNode.setAttribute('merge_id', merge_id);
            }
          }
        }

        new_row.appendChild(td);
        const p = Parchment.create('block');
        td.appendChild(p);
        const br = Parchment.create('break');
        p.appendChild(br);
      }

      if (typeof table.domNode.children[index] === 'undefined') {
        table.appendChild(new_row);
        TableHistory.register('insert', { node: new_row.domNode, parentNode: table.domNode });
      } else {
        const row = Parchment.find(table.domNode.children[index]);
        if (row) {
          table.insertBefore(new_row, row);
          TableHistory.register('insert', { node: new_row.domNode, nextNode: row.domNode });
        }
      }
      TableHistory.add(quill);
    }
  }

  static removeCol(quill) {
    const coords = TableSelection.getSelectionCoords();
    TableSelection.resetSelection(quill.container);
    let table, colIndex, colsToRemove;
    if (coords) {
      // if we have a selection, remove all selected columns
      const _table = TableSelection.selectionStartElement.closest('table');
      table = Parchment.find(_table);
      colIndex = coords.minX;
      colsToRemove = coords.maxX - coords.minX + 1;
    } else {
      // otherwise, remove only the column of current cell
      colsToRemove = 1;
      const currentCell = TableTrick.find_td(quill);
      if (currentCell) {
        table = currentCell.parent.parent;
        colIndex = Array.prototype.indexOf.call(currentCell.parent.domNode.children, currentCell.domNode);
      }
    }

    if (table && typeof colIndex === 'number' && typeof colsToRemove === 'number') {
      // Remove all TDs with the colIndex and repeat it colsToRemove times if there are multiple columns to delete
      for (let i = 0; i < colsToRemove; i++) {
        table.children.forEach(function (tr) {
          const td = tr.domNode.children[colIndex];
          if (td) {
            const merge_id = td.getAttribute('merge_id');
            if (merge_id) {
              // if a cell is merged to another cell, get target cell and decrement colspan
              const cell = table.domNode.querySelector(`td[cell_id="${merge_id}"]`);
              if (cell) {
                const colSpan = Number.parseInt(cell.getAttribute('colspan'));
                cell.setAttribute('colspan', colSpan - 1);
                TableHistory.register('propertyChange', { node: cell, property: 'colspan', oldValue: colSpan, newValue: colSpan - 1 });
              }
            }

            if (td.getAttribute('colspan')) {
              TableTrick._split(td);
            }

            TableHistory.register('remove', { node: td, nextNode: td.nextSibling, parentNode: tr.domNode });
            const _td = Parchment.find(td);
            if (_td) { // remove node this way in order to update delta
              _td.remove();
            }
          }
        });
      }
      TableSelection.selectionStartElement = TableSelection.selectionEndElement = null;
      TableHistory.add(quill);
    }
  }

  static removeRow(quill) {
    const coords = TableSelection.getSelectionCoords();
    TableSelection.resetSelection(quill.container);

    const manageMergedCells = (tr) => {
      let managed_merged_cells = [];
      [...tr.children].forEach(function(td) {
        const merge_id = td.getAttribute('merge_id');
        if (merge_id && managed_merged_cells.indexOf(merge_id) === -1) {
          // if a cell is merged to another cell, get target cell and decrement rowspan
          const cell = tr.parentNode.querySelector(`td[cell_id="${merge_id}"]`);
          managed_merged_cells.push(merge_id);
          if (cell) {
            const rowSpan = Number.parseInt(cell.getAttribute('rowspan'));
            cell.setAttribute('rowspan', rowSpan - 1);
            TableHistory.register('propertyChange', { node: cell, property: 'rowspan', oldValue: rowSpan, newValue: rowSpan - 1 });
          }
        }

        if (td.getAttribute('rowspan')) {
          TableTrick._split(td);
        }
      });
    };

    if (coords) {
      // if we have a selection, remove all selected rows
      const table = TableSelection.selectionStartElement.closest('table');
      const rowIndex = coords.minY;
      const rowsToRemove = coords.maxY - coords.minY + 1;

      for (let i = 0; i < rowsToRemove; i++) {
        const tr = table.children[rowIndex];
        if (tr) {
          manageMergedCells(tr);
          TableHistory.register('remove', { node: tr, nextNode: tr.nextSibling, parentNode: table });
          const _tr = Parchment.find(tr);
          if (_tr) { // remove node this way in order to update delta
            _tr.remove();
          }
        }
      }
    } else {
      // otherwise, remove only the row of current cell
      const td = TableTrick.find_td(quill);
      if (td) {
        const tr = td.parent;
        manageMergedCells(tr.domNode);
        TableHistory.register('remove', { node: tr.domNode, nextNode: tr.next ? tr.next.domNode : null, parentNode: tr.parent.domNode });
        const _tr = Parchment.find(tr.domNode);
        if (_tr) { // remove node this way in order to update delta
          _tr.remove();
        }
      }
    }
    TableSelection.selectionStartElement = TableSelection.selectionEndElement = null;
    TableHistory.add(quill);
  }

  static splitCell(quill) {
    // get cell
    const coords = TableSelection.getSelectionCoords();
    TableSelection.resetSelection(quill.container);
    let td = TableTrick.find_td(quill);
    if (coords && coords.maxX - coords.minX === 0 && coords.maxY - coords.minY === 0) {
      const _td = TableSelection.getCellAt(coords.minX, coords.minY);
      td = Parchment.find(_td);
    }

    if (td && TableTrick._split(td.domNode)) {
      // add changes to history
      // TableTrick._split already register 'split' change to history
      TableSelection.selectionStartElement = TableSelection.selectionEndElement = null;
      // force triggering text-change event
      td.domNode.innerHTML = td.domNode.innerHTML;
      TableHistory.add(quill);
    }
  }

  static mergeSelection(quill) {
    // get selection
    const coords = TableSelection.getSelectionCoords();
    TableSelection.resetSelection(quill.container);
    if (coords) {
      const table = TableSelection.selectionStartElement.closest('table');
      const colSpan = coords.maxX - coords.minX + 1;
      const rowSpan = coords.maxY - coords.minY + 1;
      if (colSpan > 1 || rowSpan > 1) {
        let node = null;
        let oldContent = null;
        let mergedNodes = [];
        let mergedCellContent = [];
        let cell_id;
        // get selected cells
        for (let y = coords.minY; y <= coords.maxY; y++) {
          for (let x = coords.minX; x <= coords.maxX; x++) {
            const cell = table.children[y].children[x];
            if (cell) {
              if (cell.textContent !== '') {
                // merge all contents
                mergedCellContent.push(cell.innerHTML);
              }

              if (!node) {
                // first cell (this cell will be kept)
                cell_id = cell.getAttribute('cell_id');
                node = cell;
                oldContent = node.innerHTML;
              } else {
                // other cells that will be merged
                let _oldContent = cell.innerHTML;
                // update mergedNodes array for history purposes
                mergedNodes.push({ node: cell, oldContent: _oldContent, newContent: '<p><br></p>' });
              }

              if (cell.getAttribute('colspan') || cell.getAttribute('rowspan')) {
                // cannot merge cell already merged
                alert('Cannot merge already merged cell');
                return false;
              }
            }
          }
        }

        if (node && mergedNodes.length) {
          mergedNodes.forEach(mergedNode => {
            mergedNode.node.setAttribute('merge_id', cell_id);
            mergedNode.node.innerHTML = mergedNode.newContent;
          });

          // set colspan and rowspan attributes
          node.setAttribute('colspan', colSpan);
          node.setAttribute('rowspan', rowSpan);
          // set merged content
          node.innerHTML = mergedCellContent.join('');
        }
        // add changes to history
        TableSelection.selectionStartElement = TableSelection.selectionEndElement = null;
        TableHistory.register('merge', { node, mergedNodes, colSpan, rowSpan, oldContent, newContent: node.innerHTML });
        TableHistory.add(quill);
      }
    }
  }

  static removeCell(quill) {
    // get cell
    const coords = TableSelection.getSelectionCoords();
    TableSelection.resetSelection(quill.container);
    let td = TableTrick.find_td(quill);
    if (coords && coords.maxX - coords.minX === 0 && coords.maxY - coords.minY === 0) {
      const _td = TableSelection.getCellAt(coords.minX, coords.minY);
      td = Parchment.find(_td);
    }

    if (td && TableTrick._removeCell(td.domNode)) {
      // add changes to history
      // TableTrick._removeCell already register 'remove' change to history
      TableSelection.selectionStartElement = TableSelection.selectionEndElement = null;
      TableHistory.add(quill);
    }
  }

  static removeSelection(quill) {
    // get selection
    const coords = TableSelection.getSelectionCoords();
    TableSelection.resetSelection(quill.container);
    if (coords) {
      const table = TableSelection.selectionStartElement.closest('table');
      let nodesToRemove = [];
      for (let y = coords.minY; y <= coords.maxY; y++) {
        for (let x = coords.minX; x <= coords.maxX; x++) {
          const cell = table.children[y].children[x];
          if (cell) {
            // if a cell is merged to another cell, split target cell
            const merge_id = cell.getAttribute('merge_id');
            if (merge_id) {
              const targetCell = table.querySelector(`td[cell_id="${merge_id}"]`);
              if (targetCell) {
                TableTrick._split(targetCell);
              }
            }

            if (cell.getAttribute('rowspan') || cell.getAttribute('colspan')) {
              TableTrick._split(cell);
            }

            // remove cell (and row if empty)
            let node = cell;
            let nextNode = cell.nextSibling;
            let parentNode = cell.parentNode;
            if (parentNode.nodeName === 'TR' && parentNode.childNodes.length <= 1) {
              // remove row if only one node (cell to be removed)
              node = parentNode;
              nextNode = node.nextSibling;
              parentNode = node.parentNode;
            }
            nodesToRemove.push(node);
            TableHistory.register('remove', { node, nextNode, parentNode });
          }
        }
      }

      nodesToRemove.forEach(node => {
        const _node = Parchment.find(node);
        if (_node) { // remove node this way in order to update delta
          _node.remove();
        }
      });

      // add changes to history
      TableSelection.selectionStartElement = TableSelection.selectionEndElement = null;
      TableHistory.add(quill);
    }
  }

  static _removeCell(cell, recursive = true) {
    let cell_id = cell.getAttribute('cell_id');
    if (cell.nodeName === 'TD') {
      if (recursive) {
        if (cell.getAttribute('merge_id')) {
          // remove merged cells
          cell = cell.closest('table').querySelector('td[cell_id="' + cell.getAttribute('merge_id') + '"]');
          if (!cell) return false;
          cell_id = cell.getAttribute('cell_id');
        }

        if (cell.getAttribute('colspan') || cell.getAttribute('rowspan')) {
          // remove merged cells
          cell.parentNode.parentNode.querySelectorAll(`td[merge_id="${cell_id}"`).forEach(node => {
            TableTrick._removeCell(node, false);
          });
        }
      }

      let node = cell;
      let nextNode = cell.nextSibling;
      let parentNode = cell.parentNode;
      if (parentNode.nodeName === 'TR' && parentNode.childNodes.length <= 1) {
        // remove row if only one node (cell to be removed)
        node = parentNode;
        nextNode = node.nextSibling;
        parentNode = node.parentNode;
        if (parentNode.nodeName === 'TABLE' && parentNode.childNodes.length <= 1) {
          // remove table if only one node (row to be removed)
          node = parentNode;
          nextNode = node.nextSibling;
          parentNode = node.parentNode;
        }
      }

      const _node = Parchment.find(node);
      if (_node) { // remove node this way in order to update delta
        _node.remove();
      }

      TableHistory.register('remove', { node, nextNode, parentNode });
      return true;
    }
    return false;
  }

  static _split(cell) {
    const cell_id = cell.getAttribute('cell_id');
    // get merged nodes and update mergedNodes array for history purposes, remove merge_id attribute
    let mergedNodes = [];
    cell.parentNode.parentNode.querySelectorAll(`td[merge_id="${cell_id}"`).forEach(node => {
      mergedNodes.push({ node, oldContent: node.innerHTML, newContent: node.innerHTML });
      node.removeAttribute('merge_id');
    });

    const colSpan = Number.parseInt(cell.getAttribute('colspan') || 1);
    const rowSpan = Number.parseInt(cell.getAttribute('rowspan') || 1);
    if (colSpan > 1 || rowSpan > 1) {
      // remove colspan and rowspan attributes
      cell.removeAttribute('colspan');
      cell.removeAttribute('rowspan');
      // register changes to history
      TableHistory.register('split', { node: cell, mergedNodes, colSpan, rowSpan, oldContent: cell.innerHTML, newContent: cell.innerHTML });
      return true;
    }
    return false;
  }

  static emitTextChange(quill, oldDelta, source = 'user') {
    const newDelta = quill.getContents();
    quill.emitter.emit('text-change', oldDelta.diff(newDelta), oldDelta, source);
  }

  static table_handler(value, quill) {
    // Check if the selection is for the same Quill instance, otherwise reset selection
    if (
      (TableSelection.selectionStartElement && !quill.container.contains(TableSelection.selectionStartElement)) ||
      (TableSelection.selectionEndElement && !quill.container.contains(TableSelection.selectionEndElement))
    ) {
      TableSelection.selectionStartElement = TableSelection.selectionEndElement = null;
      TableSelection.resetSelection();
    }

    if (value.includes('newtable_')) {
      const sizes = value.split('_');
      const row_count = Number.parseInt(sizes[1]);
      const col_count = Number.parseInt(sizes[2]);
      TableTrick.insertTable(quill, col_count, row_count);
    } else {
      let append_direction = 'after';
      switch (value) {
        case 'append-col-before':
          append_direction = 'before';
        case 'append-col':
        case 'append-col-after':
          TableTrick.addCol(quill, append_direction);
          break;
        case 'remove-col':
          TableTrick.removeCol(quill);
          break;
        case 'append-row-above':
          append_direction = 'before';
        case 'append-row':
        case 'append-row-below':
          TableTrick.addRow(quill, append_direction);
          break;
        case 'remove-row':
          TableTrick.removeRow(quill);
          break;
        case 'insert':
          TableTrick.insertTable(quill, 1, 1);
          break;
        case 'remove-table':
          TableTrick.removeTable(quill);
          break;
        case 'split-cell':
          TableTrick.splitCell(quill);
          break;
        case 'merge-selection':
          TableTrick.mergeSelection(quill);
          break;
        case 'remove-cell':
          TableTrick.removeCell(quill);
          break;
        case 'remove-selection':
          TableTrick.removeSelection(quill);
          break;
        case 'undo':
          if (quill.history.stack.undo.length) {
            const entry = quill.history.stack.undo[quill.history.stack.undo.length - 1];
            if (typeof entry.type !== 'undefined' && typeof entry.id !== 'undefined' && entry.type === 'tableHistory') {
              // Table history entry
              TableHistory.undo(quill, entry.id);
              return false;
            }
            // Classic history entry
          }
          return true;
        case 'redo':
          if (quill.history.stack.redo.length) {
            const entry = quill.history.stack.redo[quill.history.stack.redo.length - 1];
            if (typeof entry.type !== 'undefined' && typeof entry.id !== 'undefined' && entry.type === 'tableHistory') {
              // Table history entry
              TableHistory.redo(quill, entry.id);
              return false;
            }
            // Classic history entry
          }
          return true;
        case 'copy':
          if (TableSelection.selectionStartElement && TableSelection.selectionEndElement) {
            // Copy text in selection
            // Save previous selection
            let { anchorNode, anchorOffset, focusNode, focusOffset } = window.getSelection();
            // Get table selection position
            // Set selection and copy
            window.getSelection().removeAllRanges();
            let range = document.createRange();
            range.setStart(TableSelection.selectionStartElement, 0);
            range.setEnd(TableSelection.selectionEndElement, TableSelection.selectionEndElement.childNodes.length);
            window.getSelection().addRange(range);
            if (TableSelection.selectionStartElement === TableSelection.selectionEndElement) {
              TableSelection.selectionStartElement.classList.remove('ql-cell-selected');
            }
            document.execCommand('copy');
            if (TableSelection.selectionStartElement === TableSelection.selectionEndElement) {
              TableSelection.selectionStartElement.classList.add('ql-cell-selected');
            }
            // Remove selection and restore previous selection
            window.getSelection().removeAllRanges();
            range.setStart(anchorNode, anchorOffset);
            range.setEnd(focusNode, focusOffset);
            window.getSelection().addRange(range);
            return false;
          }
          return true;
      }
    }
  }
}
