import { expect } from '@open-wc/testing';
import { Artigo, Dispositivo } from '../../../src/model/dispositivo/dispositivo';
import { buildJsonixFromProjetoNorma } from '../../../src/model/lexml/documento/conversor/buildJsonixFromProjetoNorma';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { criaDispositivo, createArticulacao } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { getDispositivoAndFilhosAsLista, isDispositivoAlteracao } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { MEDIDA_PROVISORIA_COM_ALTERACAO_SEM_AGRUPADOR } from '../../doc/parser/mpv_885_20190617';
import { configurarNumero, configurarRotulo } from './buildJsonixFromProjetoNorma/buildJsonixHelpers';

const URN = 'urn:lex:br:federal:medida.provisoria:2019-06-17;885';

const salvaECarrega = (projetoNorma: any): any => buildProjetoNormaFromJsonix(buildJsonixFromProjetoNorma(projetoNorma, URN));

const dispositivosDe = (projetoNorma: any): Dispositivo[] => getDispositivoAndFilhosAsLista(projetoNorma.articulacao);

describe('Round-trip save→load do título de dispositivo', () => {
  describe('Dispositivos da norma', () => {
    const rotulos: Record<string, string> = { Paragrafo: '§ 1º', Inciso: 'I –', Alinea: 'a)', Item: '1.' };
    const tipos = [TipoDispositivo.paragrafo.tipo, TipoDispositivo.inciso.tipo, TipoDispositivo.alinea.tipo, TipoDispositivo.item.tipo];

    it('preserva título formatado em artigo, parágrafo, inciso, alínea e item', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
      configurarNumero(artigo, 1);
      configurarRotulo(artigo, 'Art. 1º');
      (artigo as any).tituloDispositivo = '<i>Plano</i> <u>Especial</u> H<sub>2</sub>O m<sup>2</sup>';
      (artigo.caput as any).texto = 'Texto do artigo.';

      const projetoNorma = { classificacao: 'projeto', epigrafe: { texto: '' }, ementa: { texto: '' }, preambulo: { texto: '' }, articulacao };
      const titulos: Record<string, string> = {};
      let pai: Dispositivo = artigo.caput!;
      tipos.forEach(tipo => {
        const filho = criaDispositivo(tipo === TipoDispositivo.paragrafo.tipo ? artigo : pai, tipo);
        configurarNumero(filho, 1);
        configurarRotulo(filho, rotulos[tipo]);
        (filho as any).texto = `Texto ${tipo}.`;
        (filho as any).tituloDispositivo = `Título <i>${tipo}</i>`;
        titulos[tipo] = (filho as any).tituloDispositivo;
        if (tipo !== TipoDispositivo.paragrafo.tipo) pai = filho;
      });

      const carregado = salvaECarrega(projetoNorma);
      const lista = dispositivosDe(carregado);

      expect((lista.find(d => d.tipo === TipoDispositivo.artigo.tipo) as any).tituloDispositivo).to.equal('<i>Plano</i> <u>Especial</u> H<sub>2</sub>O m<sup>2</sup>');
      tipos.forEach(tipo => {
        expect((lista.find(d => d.tipo === tipo) as any)?.tituloDispositivo, tipo).to.equal(titulos[tipo]);
      });
    });

    it('não grava título vazio nem só com tags e espaços', () => {
      const articulacao = createArticulacao();
      const art1 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
      const art2 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
      [art1, art2].forEach((a, i) => {
        configurarNumero(a, i + 1);
        configurarRotulo(a, `Art. ${i + 1}º`);
        (a.caput as any).texto = 'Texto.';
      });
      (art1 as any).tituloDispositivo = '';
      (art2 as any).tituloDispositivo = '<i> </i>&nbsp;';

      const projetoNorma = { classificacao: 'projeto', epigrafe: { texto: '' }, ementa: { texto: '' }, preambulo: { texto: '' }, articulacao };
      const jsonix = buildJsonixFromProjetoNorma(projetoNorma as any, URN);
      const artigos = JSON.stringify(jsonix);

      expect(artigos).not.to.include('tituloDispositivo');
      dispositivosDe(buildProjetoNormaFromJsonix(jsonix))
        .filter(d => d.tipo === TipoDispositivo.artigo.tipo)
        .forEach(d => expect((d as any).tituloDispositivo).to.be.undefined);
    });
  });

  describe('Dispositivos dentro de bloco de alteração', () => {
    it('preserva título de dispositivos do bloco de alteração', () => {
      const projetoNorma: any = buildProjetoNormaFromJsonix(MEDIDA_PROVISORIA_COM_ALTERACAO_SEM_AGRUPADOR);
      const emAlteracao = dispositivosDe(projetoNorma).filter(d => isDispositivoAlteracao(d) && [TipoDispositivo.artigo.tipo, TipoDispositivo.inciso.tipo].includes(d.tipo));
      const artigoAlteracao = emAlteracao.find(d => d.tipo === TipoDispositivo.artigo.tipo)!;
      const incisoAlteracao = emAlteracao.find(d => d.tipo === TipoDispositivo.inciso.tipo);
      expect(artigoAlteracao, 'artigo em alteração').to.not.be.undefined;

      (artigoAlteracao as any).tituloDispositivo = 'Título <i>do artigo</i> alterado';
      if (incisoAlteracao) (incisoAlteracao as any).tituloDispositivo = 'Título do inciso alterado';

      const carregado = salvaECarrega(projetoNorma);
      const lista = dispositivosDe(carregado);

      const titulos = lista.filter(d => isDispositivoAlteracao(d)).map(d => (d as any).tituloDispositivo);
      expect(titulos).to.include('Título <i>do artigo</i> alterado');
      if (incisoAlteracao) expect(titulos).to.include('Título do inciso alterado');
    });
  });
});
