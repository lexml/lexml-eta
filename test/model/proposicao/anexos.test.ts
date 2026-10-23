import { expect } from '@open-wc/testing';
import { LexmlEtaConfig } from '../../../src';
import { normalizarTiposAnexos } from '../../../src/model/proposicao/tipoAnexo';

describe('Configuração de anexos', () => {
  it('não limita o tamanho do anexo por padrão', () => {
    expect(new LexmlEtaConfig().tamanhoMaximoAnexo).to.be.undefined;
  });

  it('não define callbacks nem tipos por padrão', () => {
    const config = new LexmlEtaConfig();
    expect(config.onUploadAnexo).to.be.undefined;
    expect(config.onDeleteAnexo).to.be.undefined;
    expect(config.onObterAnexoBlob).to.be.undefined;
    expect(config.onVisualizarAnexo).to.be.undefined;
    expect(config.tiposAnexos).to.be.undefined;
  });
});

describe('normalizarTiposAnexos', () => {
  const outro = { codigo: 'outro', nome: 'Outro' };

  it('sem lista oferece somente "Outro"', () => {
    expect(normalizarTiposAnexos()).to.deep.equal([outro]);
    expect(normalizarTiposAnexos(null)).to.deep.equal([outro]);
    expect(normalizarTiposAnexos([])).to.deep.equal([outro]);
  });

  it('com lista válida mantém a ordem e acrescenta "Outro" no fim', () => {
    const tipos = normalizarTiposAnexos([
      { codigo: 'substitutivo', nome: 'Substitutivo' },
      { codigo: 'emenda', nome: 'Emenda' },
    ]);
    expect(tipos).to.deep.equal([{ codigo: 'substitutivo', nome: 'Substitutivo' }, { codigo: 'emenda', nome: 'Emenda' }, outro]);
  });

  it('ignora entradas sem código ou nome, e com código repetido', () => {
    const tipos = normalizarTiposAnexos([
      { codigo: '', nome: 'Sem código' },
      { codigo: 'sem-nome', nome: ' ' },
      null as any,
      { codigo: 1 as any, nome: 'Código não textual' },
      { codigo: ' emenda ', nome: ' Emenda ' },
      { codigo: 'emenda', nome: 'Emenda repetida' },
    ]);
    expect(tipos).to.deep.equal([{ codigo: 'emenda', nome: 'Emenda' }, outro]);
  });

  it('descarta o "outro" vindo do host e não o repete', () => {
    const tipos = normalizarTiposAnexos([
      { codigo: 'outro', nome: 'Diversos' },
      { codigo: 'emenda', nome: 'Emenda' },
    ]);
    expect(tipos).to.deep.equal([{ codigo: 'emenda', nome: 'Emenda' }, outro]);
  });

  it('não altera a lista recebida nem compartilha o objeto "Outro"', () => {
    const entrada = [{ codigo: 'emenda', nome: 'Emenda' }];
    const resultado = normalizarTiposAnexos(entrada);
    expect(entrada).to.have.length(1);
    resultado[resultado.length - 1].nome = 'Alterado';
    expect(normalizarTiposAnexos().pop()).to.deep.equal(outro);
  });
});
