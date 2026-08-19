export class LexmlEtaConfig {
  urlConsultaParlamentares = 'api/parlamentares';
  urlAutocomplete = 'api/autocomplete-norma';
  urlComissoes?: string;
  anexoParecer = false;
  justificacaoObrigatoria = true;
  tamanhoMaximoAnexo = 5120; //5MB
  tamanhoMaximoImagem = 2048; //2MB
}
