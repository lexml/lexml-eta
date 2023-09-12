export default class TableToolbar {
  static get(quill) {
    if (quill.container.previousSibling && quill.container.previousSibling.classList && quill.container.previousSibling.classList.contains('ql-toolbar')) {
      return quill.container.previousSibling;
    }
    return null;
  }

  static toggle(quill, actions = [], enable = true) {
    const toolbar = TableToolbar.get(quill);
    if (!toolbar) return;
    if (typeof actions === 'string') actions = [actions];

    actions.forEach(action => {
      let selector = `.ql-table .ql-picker-item[data-value="${action}"], .ql-table[value="${action}"]`;
      if (action.startsWith('*') && action.endsWith('*')) {
        selector = `.ql-table .ql-picker-item[data-value*="${action.substring(1, action.length - 1)}"], .ql-table[value*="${action.substring(1, action.length - 1)}"]`;
      } else if (action.startsWith('*')) {
        selector = `.ql-table .ql-picker-item[data-value$="${action.substring(1)}"], .ql-table[value$="${action.substring(1)}"]`;
      } else if (action.endsWith('*')) {
        selector = `.ql-table .ql-picker-item[data-value^="${action.substring(0, action.length - 1)}"], .ql-table[value^="${action.substring(0, action.length - 1)}"]`;
      }

      toolbar.querySelectorAll(selector).forEach(item => {
        item.classList[enable ? 'add' : 'remove']('enabled');
      });
    });
  }

  static enable(quill, actions) {
    TableToolbar.toggle(quill, actions, true);
  }

  static disable(quill, actions) {
    TableToolbar.toggle(quill, actions, false);
  }

  static disableAll(quill) {
    const toolbar = TableToolbar.get(quill);
    if (!toolbar) return false;
    toolbar.querySelectorAll('.ql-table .ql-picker-item.enabled, .ql-table.enabled[value]').forEach(item => item.classList.remove('enabled'));
  }

  static isEnabled(quill, action) {
    const toolbar = TableToolbar.get(quill);
    if (!toolbar) return false;
    const item = toolbar.querySelector(`.ql-table .ql-picker-item[data-value="${action}"], .ql-table[value="${action}"]`);
    return item && item.classList.contains('enabled');
  }
}
