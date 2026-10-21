export class LexmlEtaConfig {
  casaLegislativaEditor = 'SF';
  urlConsultaParlamentares = 'api/parlamentares';
  urlAutocomplete = 'api/autocomplete-norma';
  urlPortalNormas = 'https://normas.leg.br';
  urlComissoes?: string;
  anexoParecer = false;
  tamanhoMaximoAnexo = 5120; //5MB
  tamanhoMaximoImagem = 2048; //2MB
}
