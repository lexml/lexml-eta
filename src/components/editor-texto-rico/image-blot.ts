import Quill from '../../internal/quill/private-quill';

const BlockEmbed = Quill.import('blots/block/embed');
const Image = Quill.import('formats/image');
const ATTRIBUTES = ['alt', 'height', 'width'];

export class ImageBlot extends BlockEmbed {
  static blotName = 'image';
  static tagName = 'IMG';

  static create = Image.create;
  static formats = Image.formats;
  static match = Image.match;
  static sanitize = Image.sanitize;
  static value = Image.value;

  format(name: string, value: string | false): void {
    if (ATTRIBUTES.includes(name)) {
      if (value) {
        this.domNode.setAttribute(name, value);
      } else {
        this.domNode.removeAttribute(name);
      }
    } else {
      super.format(name, value);
    }
  }
}
