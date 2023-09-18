import { AttributorOptions } from 'parchment/dist/src/attributor/attributor';

//import Parchment from 'parchment';
const Parchment: any = Quill.import('parchment');

class NoIndentAttributor extends Parchment.Attributor.Style {
  constructor(attrName: string, keyName: string, options?: AttributorOptions) {
    super(attrName, keyName, options);
  }

  add(node: HTMLElement, value: string): boolean {
    if (!this.value(node)) {
      return super.add(node, value);
    }
    this.remove(node);
    return true;
  }
}

const config = {
  scope: Parchment.Scope.BLOCK,
  whitelist: ['0px'],
};

const NoIndentClass = new NoIndentAttributor('text-indent', 'text-indent', config);
export { NoIndentClass };
