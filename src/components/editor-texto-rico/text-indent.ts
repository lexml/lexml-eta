const Parchment: any = Quill.import('parchment');

const config = {
  scope: Parchment.Scope.BLOCK,
  whitelist: ['0px'],
};

// const NoIndentStyle = new Parchment.Attributor.Style('text-indent', 'text-indent', config);
const NoIndentClass = new Parchment.Attributor.Class('text-indent', 'ql-text-indent', config);
export { NoIndentClass };
