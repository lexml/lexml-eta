class NotaRodape {
  id;
  numero;
  texto;

  constructor({ id, numero, texto }) {
    this.id = id;
    this.numero = numero;
    this.texto = texto;
  }
}

const NOTA_RODAPE_INPUT_EVENT = 'lexml-eta-nota-rodape:input';
const NOTA_RODAPE_CHANGE_EVENT = 'lexml-eta-nota-rodape:change';
const NOTA_RODAPE_REMOVE_EVENT = 'lexml-eta-nota-rodape:remove';

export { NotaRodape, NOTA_RODAPE_INPUT_EVENT, NOTA_RODAPE_CHANGE_EVENT, NOTA_RODAPE_REMOVE_EVENT };
