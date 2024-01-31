export class QuillUtil {
  static configurarAcoesLink(quill: Quill): void {
    const theme = (quill as any).theme;

    const div = document.createElement('div');
    div.setAttribute('class', 'tooltip-invalid-message');
    theme.tooltip.root.appendChild(div);

    // Sobrescreve o método de criação do tooltip para adicionar a validação do link
    const originalEditTooltip = theme.tooltip.edit.bind(theme.tooltip);
    theme.tooltip.edit = (mode = 'link', preview = null): void => {
      theme.tooltip.textbox?.setAttribute('pattern', mode === 'link' ? 'https?://.+' : '');
      originalEditTooltip(mode, preview);
    };

    // Sobrescreve o método de salvamento do tooltip para adicionar a validação do link
    const originalSaveTooltip = theme.tooltip.save.bind(theme.tooltip);
    theme.tooltip.save = (): void => {
      const el = quill.root.querySelector('.ql-tooltip[data-mode="link"]') || quill.root.parentNode?.querySelector('.ql-tooltip[data-mode="link"]');
      const url = theme.tooltip.textbox?.value ?? '';
      if (el && !url.match(/https?:\/\//)) {
        el.classList.add('ql-tooltip-invalid');
        return;
      }
      originalSaveTooltip();
    };
  }
}
