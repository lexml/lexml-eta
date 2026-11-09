import PrivateQuill from '../../internal/quill/private-quill';

const Parchment = PrivateQuill.import('parchment');

// Quebra de linha dentro da epígrafe (#1053). O Break do Quill se remove quando a linha tem conteúdo; este é casado pela classe.
export class EtaBlotQuebraLinhaEpigrafe extends Parchment.Embed {
  static blotName = 'EtaBlotQuebraLinhaEpigrafe';
  static tagName = 'BR';
  static className = 'eta-quebra-linha';
}
