import { expect } from '@open-wc/testing';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { State } from '../../../src/redux/state';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { ABRIR_ARTICULACAO } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { MPV_905_2019 } from '../../doc/mpv_905_2019';
import { ATIVAR_DESATIVAR_REVISAO } from '../../../src/model/lexml/acao/ativarDesativarRevisaoAction';
import { atualizarUsuarioAction } from '../../../src/model/lexml/acao/atualizarUsuarioAction';
import { adicionarArtigoAntes } from '../../../src/model/lexml/acao/adicionarElementoAction';
import { ATUALIZAR_TEXTO_ELEMENTO } from '../../../src/model/lexml/acao/atualizarTextoElementoAction';
import { REMOVER_ELEMENTO } from '../../../src/model/lexml/acao/removerElementoAction';
import { ACEITAR_REVISAO } from '../../../src/model/lexml/acao/aceitarRevisaoAction';
import { REJEITAR_REVISAO } from '../../../src/model/lexml/acao/rejeitarRevisaoAction';
import { Dispositivo } from '../../../src/model/dispositivo/dispositivo';
import { buscaDispositivoById } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { findRevisaoByElementoUuid, isRevisaoPrincipal } from '../../../src/redux/elemento/util/revisaoUtil';
import { RevisaoElemento } from '../../../src/model/revisao/revisao';

let state: State;
let ementa: Dispositivo;
let numeroDeArtigos: number;

const revisoes = (): RevisaoElemento[] => (state.revisoes ?? []) as RevisaoElemento[];

const artigos = (): Dispositivo[] => state.articulacao!.artigos;

const revisaoDaEmenta = (): RevisaoElemento | undefined => findRevisaoByElementoUuid(state.revisoes!, ementa.uuid!);

const revisaoDoArtigoAdicionado = (): RevisaoElemento | undefined => revisoes().find(r => r.stateType === 'ElementoIncluido');

const abreDocumento = (): void => {
  const projetoNorma = buildProjetoNormaFromJsonix(MPV_905_2019);
  ementa = projetoNorma.ementa!;
  state = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: projetoNorma.articulacao!, classificacao: ClassificacaoDocumento.PROJETO });
  numeroDeArtigos = artigos().length;
  state = elementoReducer(state, atualizarUsuarioAction.execute({ nome: 'Fulano' }));
  state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });
};

const adicionaArtigoAntesDoArt1 = (): void => {
  state = elementoReducer(state, adicionarArtigoAntes.execute(createElemento(artigos()[0])));
};

const alteraEmenta = (): void => {
  const e = createElemento(ementa);
  e.conteudo!.texto = `${ementa.texto} Texto acrescentado.`;
  state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
};

const remove = (id: string): void => {
  state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: createElemento(buscaDispositivoById(state.articulacao!, id)!) });
};

const aceitaRevisaoDa = (revisao: RevisaoElemento | undefined): void => {
  state = elementoReducer(state, { type: ACEITAR_REVISAO, revisao });
};

const rejeitaRevisaoDa = (revisao: RevisaoElemento | undefined): void => {
  state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao });
};

describe('Revisão da ementa não impede as demais ações em revisão (MPV 905/2019)', () => {
  beforeEach(() => {
    abreDocumento();
  });

  it('recusar um artigo adicionado depois de alterar a ementa remove o artigo e mantém a revisão da ementa', () => {
    adicionaArtigoAntesDoArt1();
    alteraEmenta();
    expect(revisoes()).to.have.length(2);

    expect(() => rejeitaRevisaoDa(revisaoDoArtigoAdicionado())).not.to.throw();

    expect(artigos()).to.have.length(numeroDeArtigos);
    expect(artigos()[0].rotulo).to.equal('Art. 1º');
    expect(revisoes()).to.have.length(1);
    expect(revisaoDaEmenta()).not.to.be.undefined;
  });

  it('aceitar um artigo adicionado depois de alterar a ementa mantém o artigo e a revisão da ementa', () => {
    adicionaArtigoAntesDoArt1();
    alteraEmenta();

    expect(() => aceitaRevisaoDa(revisaoDoArtigoAdicionado())).not.to.throw();

    expect(artigos()).to.have.length(numeroDeArtigos + 1);
    expect(revisaoDoArtigoAdicionado()).to.be.undefined;
    expect(revisaoDaEmenta()).not.to.be.undefined;
  });

  it('adicionar e remover dispositivos com a ementa alterada gera as duas revisões', () => {
    alteraEmenta();

    expect(() => adicionaArtigoAntesDoArt1()).not.to.throw();
    expect(() => remove('art3')).not.to.throw();

    expect(
      revisoes()
        .filter(isRevisaoPrincipal)
        .map(r => r.revisao)
        .sort()
    ).to.deep.equal(['adicionado', 'alterado', 'excluido']);
  });

  it('aceitar a revisão da ementa e depois recusar o artigo adicionado não deixa marcas', () => {
    adicionaArtigoAntesDoArt1();
    alteraEmenta();
    aceitaRevisaoDa(revisaoDaEmenta());

    expect(() => rejeitaRevisaoDa(revisaoDoArtigoAdicionado())).not.to.throw();

    expect(artigos()).to.have.length(numeroDeArtigos);
    expect(revisoes()).to.have.length(0);
  });

  it('aceitar todas as revisões com a ementa no lote aceita também o artigo adicionado', () => {
    adicionaArtigoAntesDoArt1();
    alteraEmenta();

    expect(() => {
      state = elementoReducer(state, { type: ACEITAR_REVISAO });
    }).not.to.throw();

    expect(artigos()).to.have.length(numeroDeArtigos + 1);
    expect(revisoes()).to.have.length(0);
  });

  it('recusar todas as revisões com a ementa no lote desfaz o artigo e a ementa', () => {
    const textoOriginal = ementa.texto;
    adicionaArtigoAntesDoArt1();
    alteraEmenta();

    expect(() => {
      state = elementoReducer(state, { type: REJEITAR_REVISAO });
    }).not.to.throw();

    expect(artigos()).to.have.length(numeroDeArtigos);
    expect(ementa.texto).to.equal(textoOriginal);
    expect(revisoes()).to.have.length(0);
  });
});
