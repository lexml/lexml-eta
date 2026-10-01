import { expect } from '@open-wc/testing';
import '../../src';

const registeredCustomElements = [
  'lexml-eta-ajuda',
  'lexml-eta-ajuda-modal',
  'lexml-eta-alertas',
  'lexml-eta-alterar-largura-imagem-modal',
  'lexml-eta-alterar-largura-tabela-coluna-modal',
  'lexml-eta-articulacao',
  'lexml-eta-atalhos',
  'lexml-eta-atalhos-modal',
  'lexml-eta-autocomplete',
  'lexml-eta-autocomplete-async',
  'lexml-eta-autocomplete-norma',
  'lexml-eta-autoria',
  'lexml-eta-data',
  'lexml-eta-destino',
  'lexml-eta-editor-texto-rico',
  'lexml-eta-elemento',
  'lexml-eta-opcoes-impressao',
  'lexml-eta-proposicao',
  'lexml-eta-proposicao-editor',
  'lexml-eta-sufixos-modal',
  'lexml-eta-switch-revisao',
  'lexml-eta',
  'lexml-substituicao-termo',
  'proposicao-dividida-modal',
];

describe('Registros do entrypoint', () => {
  it('registra todos os componentes do pacote', () => {
    for (const tag of registeredCustomElements) {
      expect(customElements.get(tag), `Componente <${tag}> não registrado`).to.not.equal(undefined);
    }
  });
});
