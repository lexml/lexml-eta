const Parchment: any = Quill.import('parchment');

const config = {
  scope: Parchment.Scope.BLOCK,
  whitelist: ['artigo-subordinados', 'agrupador-artigo', 'ementa'],
};

const EstiloTextoClass = new Parchment.Attributor.Class('estilo', 'estilo', config);
export { EstiloTextoClass };
