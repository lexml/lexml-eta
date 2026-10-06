import { expect } from '@open-wc/testing';
import { Artigo, Dispositivo } from '../../../../src/model/dispositivo/dispositivo';
import {
  adicionarTituloDispositivoAction,
  AtualizarTituloDispositivo,
  editarTituloDispositivoAction,
  removerTituloDispositivoAction,
} from '../../../../src/model/lexml/acao/atualizarTituloDispositivoAction';
import { criaDispositivo, createArticulacao } from '../../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { TipoDispositivo } from '../../../../src/model/lexml/tipo/tipoDispositivo';

const acoesDeTitulo = (d: Dispositivo): any[] => d.getAcoesPossiveis(d).filter(a => a instanceof AtualizarTituloDispositivo);

const montaHierarquia = (): Record<string, Dispositivo> => {
  const articulacao = createArticulacao();
  const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
  const paragrafo = criaDispositivo(artigo, TipoDispositivo.paragrafo.tipo);
  const inciso = criaDispositivo(artigo.caput!, TipoDispositivo.inciso.tipo);
  const alinea = criaDispositivo(inciso, TipoDispositivo.alinea.tipo);
  const item = criaDispositivo(alinea, TipoDispositivo.item.tipo);
  return { artigo, paragrafo, inciso, alinea, item };
};

describe('Ações de título no menu do dispositivo', () => {
  ['artigo', 'paragrafo', 'inciso', 'alinea', 'item'].forEach(nome => {
    describe(nome, () => {
      it('oferece "Adicionar título" quando não há título', () => {
        const d = montaHierarquia()[nome];

        expect(acoesDeTitulo(d)).to.have.members([adicionarTituloDispositivoAction]);
      });

      it('oferece "Editar título" e "Remover título" quando há título', () => {
        const d = montaHierarquia()[nome];
        d.tituloDispositivo = 'Título';

        expect(acoesDeTitulo(d)).to.have.members([editarTituloDispositivoAction, removerTituloDispositivoAction]);
      });

      it('trata título vazio como existente', () => {
        const d = montaHierarquia()[nome];
        d.tituloDispositivo = '';

        expect(acoesDeTitulo(d)).to.have.members([editarTituloDispositivoAction, removerTituloDispositivoAction]);
      });

      it('não oferece quando o dispositivo é bloqueado', () => {
        const d = montaHierarquia()[nome];
        d.bloqueado = true;

        expect(acoesDeTitulo(d)).to.be.empty;
      });
    });
  });

  it('não oferece em agrupadores, caput e omissis', () => {
    const articulacao = createArticulacao();
    const capitulo = criaDispositivo(articulacao, TipoDispositivo.capitulo.tipo);
    const artigo = criaDispositivo(capitulo, TipoDispositivo.artigo.tipo) as Artigo;
    const omissis = criaDispositivo(articulacao, TipoDispositivo.omissis.tipo);

    [capitulo, artigo.caput!, omissis].forEach(d => expect(acoesDeTitulo(d), d.tipo).to.be.empty);
  });

  it('os rótulos das ações correspondem ao pedido', () => {
    expect(adicionarTituloDispositivoAction.descricao).to.equal('Adicionar título');
    expect(editarTituloDispositivoAction.descricao).to.equal('Editar título');
    expect(removerTituloDispositivoAction.descricao).to.equal('Remover título');
  });
});
