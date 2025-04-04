const Inline = Quill.import('blots/inline');

export class EtaBlotConteudoOmissis extends Inline {
  static blotName = 'EtaBlotConteudoOmissis';
  static tagName = 'span';
  static className = 'texto__omissis';

  get instanceBlotName(): string {
    return EtaBlotConteudoOmissis.blotName;
  }

  static formats(): boolean {
    return true;
  }
}
