import { expect } from '@open-wc/testing';
import { ADICIONAR_AGRUPADOR_ARTIGO } from '../../../src/model/lexml/acao/adicionarAgrupadorArtigoAction';
import { acoesMenu, ElementoAction } from '../../../src/model/lexml/acao';
import { Dispositivo } from '../../../src/model/dispositivo/dispositivo';
import { DescricaoSituacao } from '../../../src/model/dispositivo/situacao';
import { ArticulacaoParser } from '../../../src/model/lexml/parser/articulacaoParser';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { agrupaElemento } from '../../../src/redux/elemento/reducer/agrupaElemento';
import { EXEMPLO_AGRUPADORES_ARTIGOS_SEM_AGRUPADORES } from '../../doc/exemplo-agrupadores-artigos-sem-agrupadores';

const DOCUMENTO_COM_CAPITULO = {
  Articulacao: {
    Capitulo: [
      {
        '@id': 'cap1',
        Rotulo: 'CAPÍTULO I',
        NomeAgrupador: 'DISPOSIÇÕES PRELIMINARES',
        Artigo: [
          {
            '@id': 'art1',
            Rotulo: 'Art. 1º',
            Caput: { '@id': 'art1_cpt', p: 'Toda pessoa é capaz de direitos e deveres na ordem civil.' },
          },
          {
            '@id': 'art2',
            Rotulo: 'Art. 2º',
            Caput: { '@id': 'art2_cpt', p: 'A personalidade civil da pessoa começa do nascimento com vida.' },
          },
        ],
      },
    ],
  },
};

const OPCAO_UNICA_DE_AGRUPAMENTO = 'Adicionar Título, Capítulo, Seção e outros';

// Havia um item por tipo de agrupador; a opção única os substitui e ainda permite escolher a posição.
const OPCOES_POR_TIPO = ['Adicionar Parte', 'Adicionar Livro', 'Adicionar Título', 'Adicionar Capítulo', 'Adicionar Seção', 'Adicionar Subseção'];

const descricoesDasAcoes = (dispositivo: Dispositivo): string[] => dispositivo.getAcoesPossiveis(dispositivo).map((a: ElementoAction) => a.descricao!);

let state: any;

describe('Testando as ações de agrupamento oferecidas para agrupadores', () => {
  it('Não deveria registrar nenhuma ação de agrupamento por tipo entre as ações de menu', () => {
    expect(acoesMenu.map((a: ElementoAction) => a.descricao)).to.not.have.any.members(OPCOES_POR_TIPO);
  });

  describe('Capítulo carregado do documento', () => {
    let capitulo: Dispositivo;

    beforeEach(function () {
      const articulacao = ArticulacaoParser.load(DOCUMENTO_COM_CAPITULO);
      articulacao.renumeraArtigos();
      capitulo = articulacao.filhos[0];
    });

    it('Deveria nascer com a situação "Dispositivo Novo"', () => {
      expect(capitulo.tipo).to.equal('Capitulo');
      expect(capitulo.situacao.descricaoSituacao).to.equal(DescricaoSituacao.DISPOSITIVO_NOVO);
    });

    it('Deveria oferecer apenas a opção única de agrupamento', () => {
      const descricoes = descricoesDasAcoes(capitulo);
      expect(descricoes).to.include(OPCAO_UNICA_DE_AGRUPAMENTO);
      expect(descricoes).to.not.have.any.members(OPCOES_POR_TIPO);
    });
  });

  describe('Capítulo criado durante a edição', () => {
    let capitulo: Dispositivo;

    beforeEach(function () {
      const articulacao = ArticulacaoParser.load(EXEMPLO_AGRUPADORES_ARTIGOS_SEM_AGRUPADORES);
      articulacao.renumeraArtigos();
      state = { articulacao };

      const artigo = createElemento(state.articulacao.artigos[1]);
      state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual: artigo, novo: { tipo: TipoDispositivo.capitulo.tipo, posicao: 'antes' } });

      capitulo = state.articulacao.filhos[1];
    });

    it('Deveria nascer com a situação "Dispositivo Adicionado"', () => {
      expect(capitulo.tipo).to.equal('Capitulo');
      expect(capitulo.situacao.descricaoSituacao).to.equal(DescricaoSituacao.DISPOSITIVO_ADICIONADO);
    });

    it('Deveria oferecer as mesmas ações de agrupamento do capítulo carregado', () => {
      const descricoes = descricoesDasAcoes(capitulo);
      expect(descricoes).to.include(OPCAO_UNICA_DE_AGRUPAMENTO);
      expect(descricoes).to.not.have.any.members(OPCOES_POR_TIPO);
    });
  });
});
