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
  const naoInformado = { codigo: 'nao.informado', nome: 'Não informado' };

  it('sem lista oferece somente "Não informado"', () => {
    expect(normalizarTiposAnexos()).to.deep.equal([naoInformado]);
    expect(normalizarTiposAnexos(null)).to.deep.equal([naoInformado]);
    expect(normalizarTiposAnexos([])).to.deep.equal([naoInformado]);
  });

  it('com lista válida mantém a ordem e acrescenta "Não informado" no fim', () => {
    const tipos = normalizarTiposAnexos([
      { codigo: 'substitutivo', nome: 'Substitutivo' },
      { codigo: 'emenda', nome: 'Emenda' },
    ]);
    expect(tipos).to.deep.equal([{ codigo: 'substitutivo', nome: 'Substitutivo' }, { codigo: 'emenda', nome: 'Emenda' }, naoInformado]);
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
    expect(tipos).to.deep.equal([{ codigo: 'emenda', nome: 'Emenda' }, naoInformado]);
  });

  it('descarta o "nao.informado" vindo do host e não o repete', () => {
    const tipos = normalizarTiposAnexos([
      { codigo: 'nao.informado', nome: 'Diversos' },
      { codigo: 'emenda', nome: 'Emenda' },
    ]);
    expect(tipos).to.deep.equal([{ codigo: 'emenda', nome: 'Emenda' }, naoInformado]);
  });

  it('não altera a lista recebida nem compartilha o objeto "Não informado"', () => {
    const entrada = [{ codigo: 'emenda', nome: 'Emenda' }];
    const resultado = normalizarTiposAnexos(entrada);
    expect(entrada).to.have.length(1);
    resultado[resultado.length - 1].nome = 'Alterado';
    expect(normalizarTiposAnexos().pop()).to.deep.equal(naoInformado);
  });
});
