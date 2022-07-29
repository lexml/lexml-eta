const Inline = Quill.import('blots/inline');

export class EtaBlotConteudoOmissis extends Inline {
  static blotName = 'omissis';
  static tagName = 'span';
  static className = 'texto__omissis';

  static formats(): boolean {
    return true;
  }
}
