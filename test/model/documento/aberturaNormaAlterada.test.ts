import { expect } from '@open-wc/testing';
import { Artigo } from '../../../src/model/dispositivo/dispositivo';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { avaliarNormaAlteradaDivergente, reunirUrnsCitadas } from '../../../src/model/lexml/conteudo/normaAlteradaDivergente';
import { createAlteracao, createArticulacao, criaDispositivo, criaDispositivoCabecaAlteracao } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { validaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoValidator';
import { getDispositivoAndFilhosAsLista } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { AutoFix } from '../../../src/model/lexml/util/mensagem';
import { RemissaoExternaValue } from '../../../src/model/remissao';
import { inicializaRemissoesExternasAoAbrir } from '../../../src/redux/elemento/reducer/inicializaRemissoesExternasAoAbrir';
import { MPV_1085_2021 } from '../../assets/mpv_1085_2021';

const URN_LEI_14133 = 'urn:lex:br:federal:lei:2021-04-01;14133';
const URN_LEI_8666 = 'urn:lex:br:federal:lei:1993-06-21;8666';

const link = (urn: string): string => `<a class="lexml-remissao-externa" href="#" data-urn="${urn}">Lei</a>`;

const criaArtigoAlteracao = (texto: string, base?: string): Artigo => {
  const articulacao = createArticulacao();
  const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
  createAlteracao(artigo);
  criaDispositivoCabecaAlteracao(TipoDispositivo.artigo.tipo, artigo.alteracoes!);
  artigo.alteracoes!.base = base;
  artigo.texto = texto;
  return artigo;
};

const abre = (artigo: Artigo): RemissaoExternaValue[] => Object.values(inicializaRemissoesExternasAoAbrir(artigo.pai as any) as Record<string, RemissaoExternaValue>);

// Equivale ao que a tela faz ao abrir: links do texto (no DOM) + registro do artigo.
const avisoAoAbrir = (artigo: Artigo, registro: RemissaoExternaValue[]): any => {
  const texto = artigo.texto ?? '';
  const links = Array.from(texto.matchAll(/data-ref-id="([^"]*)"[^>]*data-urn="([^"]*)"|data-urn="([^"]*)"[^>]*data-ref-id="([^"]*)"/g)).map(m => ({
    refId: m[1] ?? m[4],
    urn: m[2] ?? m[3],
  }));
  return avaliarNormaAlteradaDivergente(artigo.alteracoes?.base, reunirUrnsCitadas(links, registro, texto));
};

describe('abertura de documento — norma alterada × remissão externa', () => {
  it('documento divergente mostra o aviso e preserva o base', () => {
    const artigo = criaArtigoAlteracao(`A ${link(URN_LEI_8666)} passa a vigorar:`, URN_LEI_14133);

    const registro = abre(artigo);

    expect(avisoAoAbrir(artigo, registro)?.detalhe?.urn).to.equal(URN_LEI_8666);
    expect(artigo.alteracoes!.base).to.equal(URN_LEI_14133);
  });

  it('sem base e com uma remissão mantém o alerta de norma não informada, sem preencher', () => {
    const artigo = criaArtigoAlteracao(`A ${link(URN_LEI_14133)} passa a vigorar:`);

    const registro = abre(artigo);

    expect(registro).to.have.length(1);
    expect(artigo.alteracoes!.base ?? '').to.equal('');
    expect(validaDispositivo(artigo).some(m => m.descricao === AutoFix.INFORMAR_NORMA)).to.equal(true);
    expect(avisoAoAbrir(artigo, registro)).to.equal(undefined);
  });

  it('documento coerente abre sem aviso', () => {
    const artigo = criaArtigoAlteracao(`A ${link(URN_LEI_14133)} passa a vigorar:`, URN_LEI_14133);

    expect(avisoAoAbrir(artigo, abre(artigo))).to.equal(undefined);
  });

  it('com duas remissões não há aviso', () => {
    const artigo = criaArtigoAlteracao(`A ${link(URN_LEI_8666)}, alterada pela ${link(URN_LEI_14133)}, passa a vigorar:`, URN_LEI_14133);

    expect(avisoAoAbrir(artigo, abre(artigo))).to.equal(undefined);
  });

  it('abrir a MPV 1085/2021 não altera nenhum base', () => {
    const projeto = buildProjetoNormaFromJsonix(MPV_1085_2021 as any);
    const artigos = getDispositivoAndFilhosAsLista(projeto.articulacao!).filter((d: any) => d.alteracoes?.base) as Artigo[];
    const antes = artigos.map(a => a.alteracoes!.base);

    inicializaRemissoesExternasAoAbrir(projeto.articulacao!);

    expect(artigos.length).to.be.greaterThan(0);
    expect(artigos.map(a => a.alteracoes!.base)).to.deep.equal(antes);
  });
});

describe('abertura de fixtures reais — divergência', () => {
  it('MPV 1085/2021 (documento coerente) abre sem nenhum aviso', () => {
    const projeto = buildProjetoNormaFromJsonix(MPV_1085_2021 as any);
    const registro = Object.values(inicializaRemissoesExternasAoAbrir(projeto.articulacao!));
    const artigos = getDispositivoAndFilhosAsLista(projeto.articulacao!).filter((d: any) => d.alteracoes?.base) as Artigo[];
    const avisos = artigos.filter(a =>
      avisoAoAbrir(
        a,
        registro.filter(r => r.sourceUuid === a.uuid)
      )
    );
    expect(artigos.length).to.be.greaterThan(0);
    expect(avisos).to.have.length(0);
  });
});
