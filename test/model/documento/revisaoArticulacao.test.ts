import { expect } from '@open-wc/testing';
import { State } from '../../../src/redux/state';
import { MPV_905_2019 } from '../../doc/mpv_905_2019';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { montaRevisoesArticulacao } from '../../../src/model/lexml/documento/conversor/revisaoArticulacao';
import { criarDocumentoArticulado } from '../../../src/model/lexml/documento/documentoArticulado';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { ABRIR_ARTICULACAO } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { ATIVAR_DESATIVAR_REVISAO } from '../../../src/model/lexml/acao/ativarDesativarRevisaoAction';
import { ATUALIZAR_USUARIO } from '../../../src/model/lexml/acao/atualizarUsuarioAction';
import { ADICIONAR_ELEMENTO } from '../../../src/model/lexml/acao/adicionarElementoAction';
import { REMOVER_ELEMENTO } from '../../../src/model/lexml/acao/removerElementoAction';
import { ATUALIZAR_TEXTO_ELEMENTO } from '../../../src/model/lexml/acao/atualizarTextoElementoAction';
import { MOVER_ELEMENTO_ABAIXO } from '../../../src/model/lexml/acao/moverElementoAbaixoAction';
import { TAB } from '../../../src/model/lexml/acao/tabAction';
import { buscaDispositivoById, getDispositivoAndFilhosAsLista } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { formatDateTimeToIso, parseIsoToDateTime } from '../../../src/util/date-util';

let state: State;

const abre = (): State => {
  const projetoNorma = buildProjetoNormaFromJsonix(MPV_905_2019);
  const s = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: projetoNorma.articulacao!, classificacao: ClassificacaoDocumento.PROJETO });
  return elementoReducer(s, { type: ATIVAR_DESATIVAR_REVISAO });
};

const elementoDe = (id: string): ReturnType<typeof createElemento> => createElemento(buscaDispositivoById(state.articulacao!, id)!);

const exclui = (id: string): void => {
  state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: elementoDe(id) });
};

const alteraTexto = (id: string, texto: string): void => {
  const e = elementoDe(id);
  e.conteudo!.texto = texto;
  state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
};

const revisoes = (): any[] => montaRevisoesArticulacao(state)!.revisoesArticulacao.revisaoArticulacao;

const coletaIds = (valor: any, ids: string[] = []): string[] => {
  if (Array.isArray(valor)) valor.forEach(v => coletaIds(v, ids));
  else if (valor && typeof valor === 'object') {
    if (typeof valor.id === 'string') ids.push(valor.id);
    Object.values(valor).forEach(v => coletaIds(v, ids));
  }
  return ids;
};

const estadoDoModelo = (): string => JSON.stringify(getDispositivoAndFilhosAsLista(state.articulacao!).map(d => [d.uuid, d.id, d.numero, d.rotulo, d.filhos?.length]));

describe('montaRevisoesArticulacao (MPV 905/2019)', () => {
  beforeEach(() => {
    state = abre();
  });

  it('não gera o grupo quando não há revisão', () => {
    expect(montaRevisoesArticulacao(state)).to.be.undefined;
  });

  describe('Revisões que não são exclusão', () => {
    it('inclusão: refIdDispositivo é o id atual e não há conteúdo anterior', () => {
      state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: elementoDe('art1_par1u_inc1'), novo: { tipo: 'Inciso' } });
      const [r] = revisoes();
      expect(r.refIdDispositivo).to.equal('art1_par1u_inc2');
      expect(r.revisao).to.equal('adicionado');
      expect(r.p).to.be.undefined;
    });

    it('alteração de texto: o texto original vai em p', () => {
      const original = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!.texto;
      alteraTexto('art1_par1u_inc1', 'texto revisado;');
      const [r] = revisoes();
      expect(r.refIdDispositivo).to.equal('art1_par1u_inc1');
      expect(r.revisao).to.equal('alterado');
      expect(r.p.content).to.deep.equal([original]);
    });

    it('movimentação de inciso: posição original e id na nova posição', () => {
      state = elementoReducer(state, { type: MOVER_ELEMENTO_ABAIXO, atual: elementoDe('art1_par1u_inc1') });
      const [r] = revisoes();
      expect(r.refIdDispositivo).to.equal('art1_par1u_inc2');
      expect(r.revisao).to.equal('movido;1');
    });

    it('movido e depois alterado: operações em ordem e conteúdo anterior', () => {
      const original = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!.texto;
      state = elementoReducer(state, { type: MOVER_ELEMENTO_ABAIXO, atual: elementoDe('art1_par1u_inc1') });
      alteraTexto('art1_par1u_inc2', 'texto do movido alterado;');
      const [r] = revisoes();
      expect(r.revisao).to.equal('movido;1,alterado');
      expect(r.p.content).to.deep.equal([original]);
    });

    it('transformação de inciso em alínea', () => {
      state = elementoReducer(state, { type: TAB, atual: elementoDe('art1_par1u_inc2') });
      const [r] = revisoes();
      expect(r.refIdDispositivo).to.equal('art1_par1u_inc1_ali1');
      expect(r.revisao).to.equal('transformado;inciso');
    });

    it('data em ISO 8601 com fuso', () => {
      alteraTexto('art1_par1u_inc1', 'texto revisado;');
      expect(revisoes()[0].data).to.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/);
    });

    it('revisões seguem a ordem de leitura da articulação', () => {
      alteraTexto('art1_par1u_inc3', 'terceiro alterado;');
      alteraTexto('art1_par1u_inc1', 'primeiro alterado;');
      expect(revisoes().map(r => r.refIdDispositivo)).to.deep.equal(['art1_par1u_inc1', 'art1_par1u_inc3']);
    });
  });

  describe('Usuários', () => {
    it('usa o id do host em refIdUsuario e registra o usuário uma única vez', () => {
      state = elementoReducer(state, { type: ATUALIZAR_USUARIO, usuario: { nome: 'Fulano de Tal', id: 'sf:fulano', sigla: 'FT' } });
      alteraTexto('art1_par1u_inc1', 'primeiro alterado;');
      alteraTexto('art1_par1u_inc2', 'segundo alterado;');
      const grupo = montaRevisoesArticulacao(state)!;
      expect(grupo.revisoesArticulacao.revisaoArticulacao.map(r => r.refIdUsuario)).to.deep.equal(['sf:fulano', 'sf:fulano']);
      expect(grupo.usuarios.usuario).to.have.length(1);
      expect(grupo.usuarios.usuario[0]).to.include({ idUsuario: 'sf:fulano', nome: 'Fulano de Tal', sigla: 'FT' });
    });

    it('sem id, usa o nome como identificador', () => {
      state = elementoReducer(state, { type: ATUALIZAR_USUARIO, usuario: { nome: 'Anônimo' } });
      alteraTexto('art1_par1u_inc1', 'primeiro alterado;');
      const grupo = montaRevisoesArticulacao(state)!;
      expect(grupo.revisoesArticulacao.revisaoArticulacao[0].refIdUsuario).to.equal('Anônimo');
      expect(grupo.usuarios.usuario[0].idUsuario).to.equal('Anônimo');
    });
  });

  describe('Exclusões', () => {
    it('artigo excluído: sem refIdDispositivo, com a subárvore e ids prefixados', () => {
      exclui('art2');
      const r = revisoes().find(x => x.revisao === 'excluido');
      expect(r.refIdDispositivo).to.be.undefined;
      expect(r.artigo.id).to.equal('_art2-exc1');
      expect(r.artigo.rotulo).to.equal('Art. 2º');
      expect(coletaIds(r.artigo)).to.include('_art2-exc1_cpt');
    });

    it('o excluído não aparece na articulação e o modelo não é alterado pela serialização', () => {
      exclui('art2');
      const antes = estadoDoModelo();
      montaRevisoesArticulacao(state);
      expect(estadoDoModelo()).to.equal(antes);
    });

    it('art2 e depois o novo art2: _art2-exc1 e _art2-exc2', () => {
      exclui('art2');
      exclui('art2');
      expect(revisoes().map(r => r.artigo.id)).to.deep.equal(['_art2-exc1', '_art2-exc2']);
    });

    it('art2 e depois art1: o id do primeiro excluído acompanha a nova exclusão', () => {
      exclui('art2');
      exclui('art1');
      const ids = revisoes().map(r => ({ id: r.artigo.id, rotulo: r.artigo.rotulo }));
      expect(ids).to.deep.equal([
        { id: '_art1-exc1', rotulo: 'Art. 1º' },
        { id: '_art1-exc2', rotulo: 'Art. 2º' },
      ]);
    });

    it('artigo com incisos e parágrafos: subárvore completa com prefixo do excluído', () => {
      exclui('art6');
      const ids = coletaIds(revisoes()[0].artigo);
      ['_art6-exc1', '_art6-exc1_cpt', '_art6-exc1_cpt_inc1', '_art6-exc1_cpt_inc3', '_art6-exc1_par1', '_art6-exc1_par2'].forEach(id => expect(ids).to.include(id));
    });

    it('artigo com alíneas: todos os níveis', () => {
      exclui('art9');
      const ids = coletaIds(revisoes()[0].artigo);
      expect(ids).to.include('_art9-exc1_cpt_inc3_ali10');
    });

    it('inciso excluído usa a propriedade inciso e a base do id do inciso', () => {
      exclui('art6_cpt_inc1');
      const r = revisoes()[0];
      expect(r.inciso.id).to.equal('_art6_cpt_inc1-exc1');
    });

    it('parágrafo único excluído', () => {
      exclui('art1_par1u');
      const r = revisoes()[0];
      expect(r.paragrafo.id).to.equal('_art1_par1u-exc1');
      expect(r.paragrafo.rotulo).to.equal('Parágrafo único.');
    });

    it('dispositivo excluído em bloco de alteração de norma', () => {
      exclui('art25_cpt_alt1_art1');
      const r = revisoes()[0];
      expect(r.artigo.id).to.equal('_art25_cpt_alt1_art1-exc1');
      expect(r.artigo.rotulo).to.equal('Art. 1º');
    });

    it('agrupador excluído usa a propriedade do tipo e o rótulo original', () => {
      exclui('cap1');
      const r = revisoes().find(x => x.revisao === 'excluido');
      expect(r.capitulo.id).to.equal('_cap1-exc1');
      expect(r.capitulo.rotulo).to.equal('CAPÍTULO I');
    });

    it('revisões não excluídas vêm antes das exclusões', () => {
      exclui('art2');
      alteraTexto('art1_par1u_inc1', 'primeiro alterado;');
      expect(revisoes().map(r => r.revisao)).to.deep.equal(['alterado', 'excluido']);
    });
  });

  describe('Documento salvo', () => {
    const urn = 'urn:lex:br:senado.federal:projeto.lei:2026;1';

    it('inclui revisões, usuários e a pendência', () => {
      alteraTexto('art1_par1u_inc1', 'primeiro alterado;');
      const documento = criarDocumentoArticulado(state.articulacao!.projetoNorma!, urn, {}, {}, { revisoes: montaRevisoesArticulacao(state) });
      const lexedit = documento.value.metadado.metadadoProprietario![0].any[0].value;
      expect(lexedit.revisoesArticulacao!.revisaoArticulacao).to.have.length(1);
      expect(lexedit.usuarios!.usuario).to.have.length(1);
      expect(lexedit.pendencias!.pendencia).to.include('Resolver marcas de revisão na articulação.');
    });

    it('sem revisões não inclui o grupo, os usuários nem a pendência', () => {
      const documento = criarDocumentoArticulado(state.articulacao!.projetoNorma!, urn, {}, {}, {});
      expect(documento.value.metadado.metadadoProprietario).to.be.undefined;
    });
  });
});

describe('Data da revisão: formato interno <-> ISO 8601 com fuso', () => {
  it('converte para ISO com fuso e volta ao mesmo valor', () => {
    const iso = formatDateTimeToIso('2026-05-11 15:51:00');
    expect(iso).to.match(/^2026-05-11T15:51:00[+-]\d{2}:\d{2}$/);
    expect(parseIsoToDateTime(iso)).to.equal('2026-05-11 15:51:00');
  });

  it('lê uma data com fuso diferente no horário local da máquina', () => {
    expect(parseIsoToDateTime('2026-05-11T18:51:00Z')).to.equal(parseIsoToDateTime('2026-05-11T15:51:00-03:00'));
  });

  it('data inválida devolve undefined e valor fora do padrão é mantido', () => {
    expect(parseIsoToDateTime('ontem')).to.be.undefined;
    expect(formatDateTimeToIso('ontem')).to.equal('ontem');
  });
});
