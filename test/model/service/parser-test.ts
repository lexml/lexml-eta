import { EXEMPLO_CC } from '../../../demo/doc/codigocivil-eta';
import { ArticulacaoParser } from '../../../src/model/lexml/service/articulacao-parser';

describe('ArticulacaoParser', () => {
  describe('Testando a criacão da Articulacao', () => {
    it('reconhece uma Articulacao quando informada a tag no início do documento', () => {
      ArticulacaoParser.load(EXEMPLO_CC);
    });
  });
});
