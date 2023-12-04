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

const NOTA_RODAPE_INPUT_EVENT = 'nota-rodape:input';
const NOTA_RODAPE_CHANGE_EVENT = 'nota-rodape:change';

export { NotaRodape, NOTA_RODAPE_INPUT_EVENT, NOTA_RODAPE_CHANGE_EVENT };
