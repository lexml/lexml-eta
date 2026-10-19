import { expect } from '@open-wc/testing';
import { avaliarNormaAlteradaDivergente, reunirUrnsCitadas } from '../../../../src/model/lexml/conteudo/normaAlteradaDivergente';
import { AutoFix, TipoMensagem } from '../../../../src/model/lexml/util/mensagem';
import { RemissaoExternaValue } from '../../../../src/model/remissao';

const URN_LEI_14133 = 'urn:lex:br:federal:lei:2021-04-01;14133';
const URN_LEI_8666 = 'urn:lex:br:federal:lei:1993-06-21;8666';

const entrada = (refId: string, targetUrn: string, textoRef?: string): RemissaoExternaValue => ({ refId, targetUrn, targetNomeNorma: '', textoRef, sourceUuid: 1 });

describe('avaliarNormaAlteradaDivergente', () => {
  it('gera WARNING com as duas normas e a URN alvo quando o base difere da única remissão', () => {
    const m = avaliarNormaAlteradaDivergente(URN_LEI_8666, [URN_LEI_14133]);

    expect(m?.tipo).to.equal(TipoMensagem.WARNING);
    expect(m?.fix).to.equal(true);
    expect(m?.descricao).to.contain('8.666').and.to.contain('14.133');
    expect(m?.detalhe).to.deep.equal({ autoFix: AutoFix.NORMA_ALTERADA_DIVERGENTE, urn: URN_LEI_14133 });
  });

  it('não gera aviso com normas iguais', () => {
    expect(avaliarNormaAlteradaDivergente(URN_LEI_14133, [URN_LEI_14133])).to.equal(undefined);
  });

  it('não gera aviso sem remissão', () => {
    expect(avaliarNormaAlteradaDivergente(URN_LEI_8666, [])).to.equal(undefined);
  });

  it('não gera aviso com duas remissões, ainda que nenhuma seja o base', () => {
    expect(avaliarNormaAlteradaDivergente(URN_LEI_8666, [URN_LEI_14133, URN_LEI_14133])).to.equal(undefined);
  });

  it('não gera aviso sem base', () => {
    expect(avaliarNormaAlteradaDivergente(undefined, [URN_LEI_14133])).to.equal(undefined);
    expect(avaliarNormaAlteradaDivergente('', [URN_LEI_14133])).to.equal(undefined);
  });

  it('não quebra com URN fora do padrão', () => {
    expect(avaliarNormaAlteradaDivergente('urn:invalida', [URN_LEI_14133])?.descricao).to.contain('urn:invalida');
  });
});

describe('reunirUrnsCitadas', () => {
  it('usa os links do DOM', () => {
    expect(reunirUrnsCitadas([{ refId: 'r1', urn: URN_LEI_14133 }], [entrada('r1', URN_LEI_14133, 'Lei 14.133')], 'A Lei 14.133')).to.deep.equal([URN_LEI_14133]);
  });

  it('inclui remissão ainda não desenhada (sem link, com textoRef no texto)', () => {
    expect(reunirUrnsCitadas([], [entrada('r1', URN_LEI_8666, 'Lei nº 8.666')], 'A Lei nº 8.666, passa a vigorar')).to.deep.equal([URN_LEI_8666]);
  });

  it('ignora entrada órfã (sem link e com textoRef fora do texto)', () => {
    const registro = [entrada('velha', URN_LEI_14133, 'Lei nº 14.133'), entrada('r2', URN_LEI_8666, 'Lei nº 8.666')];

    expect(reunirUrnsCitadas([], registro, 'A Lei nº 8.666, passa a vigorar')).to.deep.equal([URN_LEI_8666]);
  });

  it('ignora entrada sem textoRef quando não há link', () => {
    expect(reunirUrnsCitadas([], [entrada('r1', URN_LEI_14133)], 'qualquer texto')).to.deep.equal([]);
  });

  it('remissão manual sem textoRef conta pelo link do DOM', () => {
    expect(reunirUrnsCitadas([{ refId: 'r1', urn: URN_LEI_14133 }], [entrada('r1', URN_LEI_14133)], 'texto')).to.deep.equal([URN_LEI_14133]);
  });

  it('não conta duas vezes a remissão que tem link e registro', () => {
    const urns = reunirUrnsCitadas([{ refId: 'r1', urn: URN_LEI_14133 }], [entrada('r1', URN_LEI_14133, 'Lei 14.133')], 'Lei 14.133');

    expect(urns).to.have.length(1);
  });

  it('conta duas citações da mesma norma como duas', () => {
    const urns = reunirUrnsCitadas(
      [
        { refId: 'r1', urn: URN_LEI_14133 },
        { refId: 'r2', urn: URN_LEI_14133 },
      ],
      [],
      ''
    );

    expect(urns).to.have.length(2);
  });
});
