import PrivateQuill from '../../internal/quill/private-quill';

const Parchment: any = PrivateQuill.import('parchment');

const config = {
  scope: Parchment.Scope.BLOCK,
  whitelist: ['0px'],
};

// const MarginBottomStyle = new Parchment.Attributor.Style('margin-bottom', 'margin-bottom', config);
const MarginBottomClass = new Parchment.Attributor.Class('margin-bottom', 'ql-margin-bottom', config);
export { MarginBottomClass };
