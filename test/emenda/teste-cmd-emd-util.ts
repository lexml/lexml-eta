import { expect } from '@open-wc/testing';

import { Artigo } from '../../src/model/dispositivo/dispositivo';
import { ADICIONAR_ELEMENTO } from '../../src/model/lexml/acao/adicionarElementoAction';
import { buscaDispositivoById, getDispositivoPosteriorMesmoTipo } from '../../src/model/lexml/hierarquia/hierarquiaUtil';
import { TipoDispositivo } from '../../src/model/lexml/tipo/tipoDispositivo';
import { adicionaElemento } from '../../src/redux/elemento/reducer/adicionaElemento';
import { State } from '../../src/redux/state';

export class TesteCmdEmdUtil {
  // protected Dispositivo getDispositivo(final String id) {
  //     return ArvoreDispositivosUtil.getDispositivoById(raiz, id);
  // }

  // protected void suprimeDispositivo(final String id) {
  //     Dispositivo art = ArvoreDispositivosUtil.getDispositivoById(raiz, id);
  //     art.setSituacao(new DispositivoSuprimidoDefaultImpl(art));
  //     emenda.addDispositivo(art);
  // }

  // protected void suprimePrimeiroArtigoDoSeparador(final String idSeparador, final int indiceArtigo) {
  //     Dispositivo art = ArvoreDispositivosUtil.getDispositivoById(raiz, idSeparador).getFilho(indiceArtigo);
  //     art.setSituacao(new DispositivoSuprimidoDefaultImpl(art));
  //     emenda.addDispositivo(art);
  // }

  // protected Dispositivo modificaDispositivo(final String id) {
  //     Dispositivo art = ArvoreDispositivosUtil.getDispositivoById(raiz, id);
  //     art.setSituacao(new DispositivoModificadoDefaultImpl(art));
  //     emenda.addDispositivo(art);
  //     return art;
  // }

  // // -----------------------------------------------------------------------------------------
  // // Inclusão de dispositivos

  // protected void incluiArtigoOndeCouber() {

  //     Dispositivo agrupador = getAgrupadorDeArtigoOndeCouber(raiz);

  //     Dispositivo art = agrupador.getParteProposicao().getTipo().getDispositivo("Artigo");
  //     art.setSituacao(new DispositivoNovoDefaultImpl());
  //     art.setParteProposicao(agrupador.getParteProposicao());
  //     agrupador.adicionaFilho(art);
  //     emenda.addDispositivo(art);
  // }

  // protected Dispositivo getAgrupadorDeArtigoOndeCouber(final Dispositivo raiz) {
  //     if (raiz.getFilhos().size() < 4 || !raiz.getFilhos().get(3).isTipo(AgrupadorDeArtigosOndeCouber.class)) {
  //         Dispositivo agrupador = null;
  //         ParteProposicao parteProposicao = raiz.getParteProposicao();
  //         agrupador = parteProposicao.getTipo().getDispositivo("AgrupadorDeArtigosOndeCouber");
  //         agrupador.setParteProposicao(parteProposicao);
  //         agrupador.setSituacao(new DispositivoNovoDefaultImpl());
  //         raiz.adicionaFilho(agrupador, 3);
  //         return agrupador;
  //     }
  //     return raiz.getFilhos().get(3);
  // }

  static incluiArtigoDepois(state: State, idArtigoRef: string): Artigo {
    return this.incluiArtigo(state, idArtigoRef, false);
  }

  // protected Dispositivo incluiArtigoAntes(final String idArtigoRef) {
  //     return incluiArtigo(idArtigoRef, true);
  // }

  static incluiArtigo(state: State, idArtigoRef: string, antes: boolean): Artigo {
    const artigoRef = buscaDispositivoById(state.articulacao!, idArtigoRef);
    // console.log(artigoRef?.rotulo);
    if (!artigoRef) {
      throw new Error(`Dispositivo ${idArtigoRef} não encontrado!`);
    }
    if (antes) {
      throw new Error('Inclusão de artigo antes não implementada!');
    }
    state = adicionaElemento(state, {
      type: ADICIONAR_ELEMENTO,
      atual: { tipo: TipoDispositivo.artigo.tipo, uuid: artigoRef?.uuid },
      novo: { tipo: TipoDispositivo.artigo.tipo },
    });
    const d = getDispositivoPosteriorMesmoTipo(artigoRef);
    // console.log(d?.rotulo);
    expect(d, `Falha na inserção do artigo após ${idArtigoRef}`).to.not.be.undefined;
    return d!;
  }

  // protected Dispositivo incluiParagrafo(final String idDispRef, final boolean antes) {
  //     return incluiDispositivo(idDispRef, antes, "Paragrafo", Artigo.class);
  // }

  // protected Dispositivo incluiInciso(final String idDispRef, final boolean antes) {
  //     return incluiDispositivo(idDispRef, antes, "Inciso", Caput.class, Paragrafo.class);
  // }

  // protected Dispositivo incluiAlinea(final String idDispRef, final boolean antes) {
  //     return incluiDispositivo(idDispRef, antes, "Alinea", Inciso.class);
  // }

  // protected Dispositivo incluiItem(final String idDispRef, final boolean antes) {
  //     return incluiDispositivo(idDispRef, antes, "Item", Alinea.class);
  // }

  // protected void incluiOmissis(final String idDispRef, final boolean antes) {
  //     DispositivoModel dispRef = (DispositivoModel) ArvoreDispositivosUtil.getDispositivoById(raiz, idDispRef);
  //     new ComandoIncluirDispositivo(emenda, "Omissis", dispRef, antes ? Atalho.ANTES : Atalho.DEPOIS).executa();
  // }

  // private Dispositivo incluiDispositivo(final String idDispRef, final boolean antes, final String nomeBean,
  //                                       final Class< ? extends TipoDispositivo>... tiposDispositivoPai) {
  //     Dispositivo dispRef = ArvoreDispositivosUtil.getDispositivoById(raiz, idDispRef);
  //     Dispositivo novo = dispRef.getParteProposicao().getTipo().getDispositivo(nomeBean);
  //     novo.setSituacao(new DispositivoNovoDefaultImpl());
  //     novo.setParteProposicao(dispRef.getParteProposicao());
  //     if (isAlgumTipo(dispRef, tiposDispositivoPai)) {
  //         dispRef.adicionaFilho(novo);
  //     }
  //     else if (dispRef.isDoMesmoTipo(novo)) {
  //         Dispositivo pai = dispRef.getPai();
  //         if (antes) {
  //             pai.adicionaFilho(novo, pai.getIndexDoFilho(dispRef));
  //         }
  //         else {
  //             pai.adicionaFilho(novo, pai.getIndexDoFilho(dispRef) + 1);
  //         }
  //     }
  //     else {
  //         throw new RuntimeException("Dispositivo " + idDispRef + " é inválido para posicionar " + nomeBean);
  //     }
  //     emenda.addDispositivo(novo);

  //     return novo;
  // }

  // private boolean isAlgumTipo(final Dispositivo disp, final Class< ? extends TipoDispositivo>... tipos) {
  //     for (Class< ? extends TipoDispositivo> tipo : tipos) {
  //         if (disp.isTipo(tipo)) {
  //             return true;
  //         }
  //     }
  //     return false;
  // }

  // protected void incluiAlteracaoNormaVigente(final String idAlvo, final String urn, final String idNovo,
  //                                           final boolean novo) {
  //     Dispositivo dAlvo = ArvoreDispositivosUtil.getDispositivoById(raiz, idAlvo);
  //     ComandoIncluirAlteracaoNorma cmd = new ComandoIncluirAlteracaoNorma(emenda, dAlvo, urn, idNovo);
  //     cmd.executa();

  //     Dispositivo d = cmd.getDispositivoAdicionado();
  //     d.setSituacaoNaNormaVigente(novo ? Dispositivo.ACRESCIMO : Dispositivo.NOVA_REDACAO);
  // }

  // protected void suprimeAlteracaoNormaVigente(final String idAlvo) {
  //     Dispositivo dAlvo = ArvoreDispositivosUtil.getDispositivoById(raiz, idAlvo);
  //     new ComandoSuprimirAlteracaoNorma(emenda, dAlvo).executa();
  // }

  // protected Dispositivo incluiDispositivoEmAlteracaoDeNormaVigente(final String id, final boolean novo) {

  //     int i = id.indexOf("alt1");
  //     String idAlteracao = id.substring(0, i + 4);
  //     String idDispositivo = id.substring(i + 5);

  //     Dispositivo alteracao = ArvoreDispositivosUtil.getDispositivoById(raiz, idAlteracao);

  //     ComandoIncluirDispositivoAlteracaoNorma cmd = new ComandoIncluirDispositivoAlteracaoNorma(emenda,
  //                                                                                               alteracao,
  //                                                                                               idDispositivo);
  //     cmd.executa();

  //     Dispositivo d = cmd.getDispositivoAdicionado();
  //     d.setSituacaoNaNormaVigente(novo ? Dispositivo.ACRESCIMO : Dispositivo.NOVA_REDACAO);

  //     return d;
  // }
}
