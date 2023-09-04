// import Quill from 'quill';
import TableCell from './TableCellBlot';
import ContainBlot from './ContainBlot';
import TableTrick from './TableTrick';

const Parchment = Quill.import('parchment');

class TableRow extends ContainBlot {
  static create(value) {
    const tagName = 'tr';
    let node = super.create(tagName);
    node.setAttribute('row_id', value ? value : TableTrick.random_id());
    return node;
  }

  format() {}

  optimize(context) {
    if (this.children.length === 0) {
      if (this.statics.defaultChild != null) {
        var child = this.createDefaultChild();
        this.appendChild(child);
        child.optimize(context);
      } else {
        this.remove();
      }
    }
    let next = this.next;
    if (next != null && next.prev === this &&
      next.statics.blotName === this.statics.blotName &&
      next.domNode.tagName === this.domNode.tagName &&
      next.domNode.getAttribute('row_id') === this.domNode.getAttribute('row_id')
    ) {
      next.moveChildren(this);
      next.remove();
    }
  }

  insertBefore(childBlot, refBlot) {
    if (this.statics.allowedChildren != null && !this.statics.allowedChildren.some(function (child) {
      return childBlot instanceof child;
    })) {
      let newChild = this.createDefaultChild(refBlot);
      newChild.appendChild(childBlot);
      childBlot = newChild;
    }
    super.insertBefore(childBlot, refBlot);
  }

  replace(target) {
    if (target.statics.blotName !== this.statics.blotName) {
      let item = this.createDefaultChild();
      target.moveChildren(item, this);
      this.appendChild(item);
    }
    super.replace(target);
  }

  createDefaultChild(refBlot) {
    let table_id = null;
    if (refBlot) {
      table_id = refBlot.domNode.getAttribute('table_id');
    } else if (this.parent) {
      table_id = this.parent.domNode.getAttribute('table_id');
    } else {
      table_id = this.domNode.parent.getAttribute('table_id');
    }

    return Parchment.create(this.statics.defaultChild, [table_id, this.domNode.getAttribute('row_id'), TableTrick.random_id()].join('|'));
  }
}

TableRow.blotName = 'tr';
TableRow.tagName = 'tr';
TableRow.scope = Parchment.Scope.BLOCK_BLOT;
TableRow.defaultChild = 'td';
TableRow.allowedChildren = [TableCell];

export default TableRow;
