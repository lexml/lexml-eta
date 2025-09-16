import { expect } from '@open-wc/testing';
import { getTipo } from '../../../src/model/lexml/documento/urnUtil';
import { VOCABULARIO } from '../../../src/model/lexml/documento/vocabulario';

const _tipo = (chave: string) => {
  return VOCABULARIO.tiposDocumento.find(t => t.urn === chave);
};

describe('Obtém o tipo de uma proposição', () => {
  it('Proposição federal', () => {
    expect(getTipo('urn:lex:br:federal:medida.provisoria:2019-06-17;885')).equals(_tipo('medida.provisoria'));
    expect(getTipo('urn:lex:br:senado.federal:projeto.decreto.legislativo;pdl:2023;00343')).equals(_tipo('projeto.decreto.legislativo;pdl'));
  });
  it('Proposição municipal', () => {
    expect(getTipo('urn:lex:br:municipal:cmbh:projeto.lei;pl:2025;495')).equals(_tipo('projeto.lei;pl'));
  });
});
