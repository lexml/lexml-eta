const Delta = Quill.import('delta');

class ModuloAspasCurvas {
  quill: Quill;
  options: any;
  enabled = true;

  constructor(quill: any, options: any) {
    this.quill = quill;
    this.options = options;

    this.quill.root.addEventListener('keydown', (event: any): any => {
      const range = this.quill?.getSelection();
      const key = event.key;
      if (!this.enabled || !range || !['"', "'"].includes(key)) return;

      this.tratarAspas(range, key);
      event.preventDefault();
    });

    // O código abaixo é uma outra forma de fazer a mesma coisa.
    // Se o código abaixo for usado, o código acima (addEventListener e todo o seu conteúdo) deve ser comentado.

    // this.quill.keyboard.addBinding({ key: 192 }, { shiftKey: true }, (range: any, context: any): boolean => this.tratarAspas(range, '"'));
    // this.quill.keyboard.addBinding({ key: 192 }, { shiftKey: false }, (range: any, context: any): boolean => this.tratarAspas(range, "'"));
  }

  // Imita autoformação de aspas curvas do Word
  // Observação: o ctrl + z não transforma as aspas de volta para aspas retas
  tratarAspas(range: any, caracter: string): boolean {
    if (!this.enabled) return true;

    const isAspasDuplas = caracter === '"';
    const abreAspas = isAspasDuplas ? '“' : '‘';
    const fechaAspas = isAspasDuplas ? '”' : '’';

    const texto = this.quill?.getText().substring(0, range.index);

    const aspasTransformada = !texto || texto?.match(/\s$/g) ? abreAspas : fechaAspas;

    const delta = new Delta().retain(range.index).delete(range.length).insert(aspasTransformada, this.quill?.getFormat(range));
    this.quill?.updateContents(delta as any, Quill.sources.USER);
    this.quill?.setSelection(range.index + 1, Quill.sources.SILENT);

    return false;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
}

export { ModuloAspasCurvas };
