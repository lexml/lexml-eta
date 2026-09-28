import { expect } from '@open-wc/testing';
import { Artigo } from '../../../src/model/dispositivo/dispositivo';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { criaStateComNArtigos } from '../../helpers/dispositivo-helper';

describe('createElemento: identidade do caput', () => {
  it('artigo carrega uuid e uuid2 do caput', () => {
    const { artigos } = criaStateComNArtigos(1);
    const artigo = artigos[0] as Artigo;

    const elemento = createElemento(artigo);

    expect(elemento.caput).to.deep.equal({ uuid: artigo.caput!.uuid, uuid2: artigo.caput!.uuid2 });
  });

  it('dispositivo que não é artigo não carrega identidade de caput', () => {
    const { artigos } = criaStateComNArtigos(1);
    const inciso = criaDispositivo(artigos[0], 'Inciso');
    const paragrafo = criaDispositivo(artigos[0], 'Paragrafo');

    expect(createElemento(inciso).caput).to.be.undefined;
    expect(createElemento(paragrafo).caput).to.be.undefined;
  });
});
