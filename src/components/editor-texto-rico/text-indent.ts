import PrivateQuill from '../../internal/quill/private-quill';

const Parchment: any = PrivateQuill.import('parchment');

const config = {
  scope: Parchment.Scope.BLOCK,
  whitelist: ['0px'],
};

// const NoIndentStyle = new Parchment.Attributor.Style('text-indent', 'text-indent', config);
const NoIndentClass = new Parchment.Attributor.Class('text-indent', 'ql-text-indent', config);
export { NoIndentClass };
