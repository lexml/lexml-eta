// import Quill from 'quill';
import TableTrick from './TableTrick';

const Parchment = Quill.import('parchment');

class TableHistory {
  static changes = [];

  // Register DOM change into current table history entry
  static register(type, change) {
    TableHistory.changes.push({ type, ...change });
  }

  // Add table history entry
  static add(quill) {
    if (!TableHistory.changes.length) return;

    const historyChangeStatus = quill.history.ignoreChange;
    // ignore history change and reset last recorded time for adding later changes in a new history entry
    quill.history.ignoreChange = true;
    quill.history.lastRecorded = 0;

    // wait history update
    setTimeout(() => {
      // reset history changes value
      quill.history.ignoreChange = historyChangeStatus;

      // add new entry in table stack
      const id = TableTrick.random_id();
      quill.history.tableStack[id] = TableHistory.changes;

      // set reference to table stack entry in a new history entry
      quill.history.stack.undo.push({ type: 'tableHistory', id: id });

      TableHistory.changes = [];
    }, 0);
  }

  static undo(quill, id) {
    const historyChangeStatus = quill.history.ignoreChange;
    quill.history.ignoreChange = true;

    const entry = quill.history.tableStack[id];
    if (typeof entry !== 'undefined') {
      // apply changes from last change to first change (undo)
      entry.reverse().forEach(change => {
        const oldDelta = quill.getContents();
        switch (change.type) {
          case 'insert':
            // remove node (undo)
            TableHistory.remove(change);
            break;
          case 'remove':
            // add node (undo)
            TableHistory.insert(change);
            break;
          case 'split':
            // merge cell (redo)
            TableHistory.merge(change, true);
            // force triggering text-change event
            TableTrick.emitTextChange(quill, oldDelta);
            break;
          case 'merge':
            // split cell (redo)
            TableHistory.split(change, true);
            break;
          case 'propertyChange':
            // property change (undo)
            TableHistory.propertyChange(change, true);
            break;
        }
      });
    }

    // wait history update
    setTimeout(() => {
      // update history
      const historyEntry = quill.history.stack.undo.pop();
      quill.history.stack.redo.push(historyEntry);
      quill.history.ignoreChange = historyChangeStatus;
    }, 0);
  }

  static redo(quill, id) {
    const historyChangeStatus = quill.history.ignoreChange;
    quill.history.ignoreChange = true;

    const entry = quill.history.tableStack[id];
    if (typeof entry !== 'undefined') {
      // apply changes from first change to last change (redo)
      entry.forEach(change => {
        switch (change.type) {
          case 'insert':
            // add node (redo)
            TableHistory.insert(change);
            break;
          case 'remove':
            // remove node (redo)
            TableHistory.remove(change);
            break;
          case 'split':
            // split cell (redo)
            TableHistory.split(change, false);
            break;
          case 'merge':
            // merge cell (redo)
            TableHistory.merge(change, false);
            break;
          case 'propertyChange':
            // property change (redo)
            TableHistory.propertyChange(change, false);
            break;
        }
      });
    }

    // wait history update
    setTimeout(() => {
      // update history
      const historyEntry = quill.history.stack.redo.pop();
      quill.history.stack.undo.push(historyEntry);
      quill.history.ignoreChange = historyChangeStatus;
    }, 0);
  }

  static insert(change) {
    const parentNode = change.parentNode || change.nextNode.parentNode;
    if (parentNode) {
      const _parentNode = Parchment.find(parentNode);
      if (_parentNode) {
        const _node = Parchment.create(change.node);
        if (change.nextNode) {
          const _nextNode = Parchment.find(change.nextNode);
          if (_nextNode) {
            _parentNode.insertBefore(_node, _nextNode);
          }
        } else {
          _parentNode.appendChild(_node);
        }
      }

      // force re-rendering cells border (Firefox bug)
      const tableNode = change.node.nodeName === 'TABLE' ? change.node : parentNode.closest('table');
      tableNode.style.setProperty('overflow', (window.getComputedStyle(tableNode)['overflow'] || 'visible') === 'visible' ? 'hidden' : 'visible');
      setTimeout(() => {
        tableNode.style.removeProperty('overflow');
      }, 0);

      return true;
    }
    return false;
  }

  static remove(change) {
    change.node.remove();
    return true;
  }

  static split(change, revert) {
    const td = change.node;
    // remove colspan and rowspan attributes
    td.removeAttribute('colspan');
    td.removeAttribute('rowspan');
    // for each merged node, remove merge_id attribute and restore content
    change.mergedNodes.forEach(cell => {
      cell.node.removeAttribute('merge_id');
      cell.node.innerHTML = cell[revert ? 'oldContent' : 'newContent'];
    });
    // restore content
    td.innerHTML = change[revert ? 'oldContent' : 'newContent'];
    return true;
  }

  static merge(change, revert) {
    const td = change.node;
    const cell_id = td.getAttribute('cell_id');
    // set colspan and rowspan attributes
    td.setAttribute('colspan', change.colSpan);
    td.setAttribute('rowspan', change.rowSpan);
    // for each node to merge, set merge_id attribute and restore content
    change.mergedNodes.forEach(cell => {
      cell.node.innerHTML = cell[revert ? 'oldContent' : 'newContent'];
      cell.node.setAttribute('merge_id', cell_id);
    });
    // restore content
    td.innerHTML = change[revert ? 'oldContent' : 'newContent'];
    return true;
  }

  static propertyChange(change, revert) {
    const { node, property, oldValue, newValue } = change;
    const value = revert ? oldValue : newValue;
    if (value !== null) {
      node.setAttribute(property, value);
    } else {
      node.removeAttribute(property);
    }
  }
}

export default TableHistory;
