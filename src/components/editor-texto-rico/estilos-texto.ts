const Parchment: any = Quill.import('parchment');

const config = {
  scope: Parchment.Scope.BLOCK,
  whitelist: ['ementa', 'norma-alterada'],
};

const EstiloTextoClass = new Parchment.Attributor.Class('estilo', 'estilo', config);
export { EstiloTextoClass };
