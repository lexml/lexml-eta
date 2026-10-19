import { expect } from '@open-wc/testing';
import { Articulacao, Artigo, Dispositivo } from '../../../src/model/dispositivo/dispositivo';
import { createAlteracao, criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { buildProjetoNormaFromJsonix, lerMetadadoLexEdit, lerSituacaoNaNormaVigente } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { aplicarSituacaoNaNormaVigente, coletarSituacaoNaNormaVigente } from '../../../src/model/lexml/documento/conversor/situacaoNaNormaVigente';
import { criarDocumentoArticulado, lerDocumentoArticulado, serializarDocumentoArticulado } from '../../../src/model/lexml/documento/documentoArticulado';
import { lexeditSalvo, metadadoProprietarioLexEdit, novoDocumentoArticulado } from '../../doc/documentoArticulado';

const TYPE_NAME_SITUACAO = 'br_gov_lexml_lexedit__1.SituacaoNaNormaVigente';

// Sem o parágrafo único: artigo com bloco de alteração não tem outros filhos (a leitura os descarta).
const novoModelo = (): any => {
  const documento = novoDocumentoArticulado();
  documento.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis.pop();
  return buildProjetoNormaFromJsonix(lerDocumentoArticulado(documento), true);
};

/** Artigo do documento com um bloco de alteração de dois artigos (art5 e art6), com ids próprios. */
const comBlocoDeAlteracao = (modelo: any): { artigo: Artigo; art5: Artigo; art6: Artigo } => {
  const artigo = modelo.articulacao.filhos[0] as Artigo;
  createAlteracao(artigo);
  const novoArtigoNoBloco = (id: string): Artigo => {
    const a = criaDispositivo(artigo.alteracoes!, TipoDispositivo.artigo.tipo) as Artigo;
    a.isDispositivoAlteracao = true;
    a.id = id;
    a.rotulo = `Art. ${id.slice(-1)}º`;
    a.createNumeroFromRotulo(a.rotulo);
    a.caput!.texto = 'Texto do artigo.';
    return a;
  };
  return { artigo, art5: novoArtigoNoBloco('art1_cpt_alt1_art5'), art6: novoArtigoNoBloco('art1_cpt_alt1_art6') };
};

describe('Situação na norma vigente — coletar', () => {
  it('separa existentes e novos na ordem da articulação', () => {
    const modelo = novoModelo();
    const { art5, art6 } = comBlocoDeAlteracao(modelo);
    art5.existeNaNormaAlterada = true;
    art6.existeNaNormaAlterada = false;

    expect(coletarSituacaoNaNormaVigente(modelo.articulacao)).to.deep.equal({ existentes: ['art1_cpt_alt1_art5'], novos: ['art1_cpt_alt1_art6'] });
  });

  it('agrupa vários dispositivos na mesma lista', () => {
    const modelo = novoModelo();
    const { art5, art6 } = comBlocoDeAlteracao(modelo);
    art5.existeNaNormaAlterada = true;
    art6.existeNaNormaAlterada = true;

    expect(coletarSituacaoNaNormaVigente(modelo.articulacao)).to.deep.equal({ existentes: ['art1_cpt_alt1_art5', 'art1_cpt_alt1_art6'], novos: [] });
  });

  it('ignora dispositivo sem situação informada e sem id', () => {
    const modelo = novoModelo();
    const { art5, art6 } = comBlocoDeAlteracao(modelo);
    art5.existeNaNormaAlterada = undefined;
    art6.existeNaNormaAlterada = true;
    art6.id = undefined;

    expect(coletarSituacaoNaNormaVigente(modelo.articulacao)).to.deep.equal({ existentes: [], novos: [] });
  });

  it('ignora dispositivo fora de bloco de alteração e o caput', () => {
    const modelo = novoModelo();
    const { art5 } = comBlocoDeAlteracao(modelo);
    (modelo.articulacao.filhos[0] as Dispositivo).existeNaNormaAlterada = true;
    art5.caput!.existeNaNormaAlterada = true;
    art5.caput!.id = 'art1_cpt_alt1_art5_cpt';

    expect(coletarSituacaoNaNormaVigente(modelo.articulacao)).to.deep.equal({ existentes: [], novos: [] });
  });

  it('articulação sem bloco de alteração resulta em listas vazias', () => {
    expect(coletarSituacaoNaNormaVigente(novoModelo().articulacao)).to.deep.equal({ existentes: [], novos: [] });
    expect(coletarSituacaoNaNormaVigente(undefined)).to.deep.equal({ existentes: [], novos: [] });
  });
});

describe('Situação na norma vigente — salvar (especificação 13)', () => {
  it('grava as duas listas como texto separado por espaço', () => {
    const modelo = novoModelo();
    const { art5, art6 } = comBlocoDeAlteracao(modelo);
    art5.existeNaNormaAlterada = true;
    art6.existeNaNormaAlterada = false;

    const documento = criarDocumentoArticulado(modelo, modelo.urn);

    expect(lexeditSalvo(documento).situacaoNaNormaVigente).to.deep.equal({
      TYPE_NAME: TYPE_NAME_SITUACAO,
      refIdsDispositivosExistentes: 'art1_cpt_alt1_art5',
      refIdsDispositivosNovos: 'art1_cpt_alt1_art6',
    });
  });

  it('omite o atributo da lista vazia', () => {
    const modelo = novoModelo();
    const { art5, art6 } = comBlocoDeAlteracao(modelo);
    art5.existeNaNormaAlterada = true;
    art6.existeNaNormaAlterada = true;

    const situacao = lexeditSalvo(criarDocumentoArticulado(modelo, modelo.urn)).situacaoNaNormaVigente;

    expect(situacao.refIdsDispositivosExistentes).to.equal('art1_cpt_alt1_art5 art1_cpt_alt1_art6');
    expect(situacao).not.to.have.property('refIdsDispositivosNovos');
  });

  it('sem bloco de alteração não grava o elemento nem MetadadoProprietario', () => {
    const modelo = novoModelo();

    const documento = criarDocumentoArticulado(modelo, modelo.urn);

    expect(documento.value.metadado.metadadoProprietario).to.be.undefined;
  });

  it('bloco de alteração sem situação informada não grava o elemento', () => {
    const modelo = novoModelo();
    comBlocoDeAlteracao(modelo);

    const documento = criarDocumentoArticulado(modelo, modelo.urn);

    expect(documento.value.metadado.metadadoProprietario).to.be.undefined;
  });
});

describe('Situação na norma vigente — ler e aplicar (especificação 13)', () => {
  const documentoComSituacao = (situacao: unknown): any => {
    const documento = novoDocumentoArticulado();
    documento.value.metadado.metadadoProprietario = [metadadoProprietarioLexEdit({ situacaoNaNormaVigente: situacao })];
    return documento;
  };

  it('lê as duas listas', () => {
    const documento = documentoComSituacao({ refIdsDispositivosExistentes: 'a b', refIdsDispositivosNovos: 'c' });

    expect(lerSituacaoNaNormaVigente(documento)).to.deep.equal({ existentes: ['a', 'b'], novos: ['c'] });
  });

  it('lista vazia, ausente ou com tipo inesperado equivale a nenhum id', () => {
    expect(lerSituacaoNaNormaVigente(documentoComSituacao({ refIdsDispositivosExistentes: '', refIdsDispositivosNovos: 5 }))).to.deep.equal({ existentes: [], novos: [] });
    expect(lerSituacaoNaNormaVigente(documentoComSituacao({}))).to.deep.equal({ existentes: [], novos: [] });
    expect(lerSituacaoNaNormaVigente(novoDocumentoArticulado())).to.deep.equal({ existentes: [], novos: [] });
  });

  it('remove id duplicado e espaços extras', () => {
    const documento = documentoComSituacao({ refIdsDispositivosExistentes: ' a  a b ' });

    expect(lerSituacaoNaNormaVigente(documento).existentes).to.deep.equal(['a', 'b']);
  });

  it('o leitor do formulário ignora o grupo, sem erro', () => {
    expect(() => lerMetadadoLexEdit(documentoComSituacao({ refIdsDispositivosNovos: 'c' }))).not.to.throw();
  });

  it('aplica a situação aos dispositivos do bloco e ignora id inexistente', () => {
    const modelo = novoModelo();
    const { art5, art6 } = comBlocoDeAlteracao(modelo);

    aplicarSituacaoNaNormaVigente(modelo.articulacao as Articulacao, { existentes: ['art1_cpt_alt1_art5', 'inexistente'], novos: ['art1_cpt_alt1_art6'] });

    expect(art5.existeNaNormaAlterada).to.equal(true);
    expect(art6.existeNaNormaAlterada).to.equal(false);
  });

  it('não altera dispositivo fora de bloco de alteração, mesmo com id listado', () => {
    const modelo = novoModelo();
    const artigo = modelo.articulacao.filhos[0] as Artigo;

    aplicarSituacaoNaNormaVigente(modelo.articulacao as Articulacao, { existentes: [artigo.id!], novos: [] });

    expect(artigo.existeNaNormaAlterada).to.be.undefined;
  });

  it('sem situação mantém o estado atual', () => {
    const modelo = novoModelo();
    const { art5 } = comBlocoDeAlteracao(modelo);
    art5.existeNaNormaAlterada = true;

    aplicarSituacaoNaNormaVigente(modelo.articulacao as Articulacao, { existentes: [], novos: [] });

    expect(art5.existeNaNormaAlterada).to.equal(true);
  });
});

describe('Situação na norma vigente — ida e volta', () => {
  it('salvar, abrir e salvar de novo gera o mesmo arquivo', () => {
    const modelo = novoModelo();
    const { art5, art6 } = comBlocoDeAlteracao(modelo);
    art5.existeNaNormaAlterada = true;
    art6.existeNaNormaAlterada = false;
    const primeiro = serializarDocumentoArticulado(criarDocumentoArticulado(modelo, modelo.urn));

    const aberto: any = buildProjetoNormaFromJsonix(lerDocumentoArticulado(primeiro), true);
    aplicarSituacaoNaNormaVigente(aberto.articulacao, lerSituacaoNaNormaVigente(lerDocumentoArticulado(primeiro)));
    const segundo = serializarDocumentoArticulado(criarDocumentoArticulado(aberto, aberto.urn));

    expect(segundo).to.equal(primeiro);
    expect(coletarSituacaoNaNormaVigente(aberto.articulacao)).to.deep.equal({ existentes: ['art1_cpt_alt1_art5'], novos: ['art1_cpt_alt1_art6'] });
  });
});
