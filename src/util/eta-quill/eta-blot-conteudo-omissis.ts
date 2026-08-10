import PrivateQuill from '../../internal/quill/private-quill';

const Inline = PrivateQuill.import('blots/inline');

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
