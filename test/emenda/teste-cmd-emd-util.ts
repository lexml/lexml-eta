import { expect } from '@open-wc/testing';

import { Artigo, Dispositivo } from '../../src/model/dispositivo/dispositivo';
import { isAgrupador } from '../../src/model/dispositivo/tipo';
import { ADICIONAR_ELEMENTO } from '../../src/model/lexml/acao/adicionarElementoAction';
import { buscaDispositivoById, getDispositivoPosteriorMesmoTipo } from '../../src/model/lexml/hierarquia/hierarquiaUtil';
import { TipoDispositivo } from '../../src/model/lexml/tipo/tipoDispositivo';
import { adicionaElemento } from '../../src/redux/elemento/reducer/adicionaElemento';
import { transformaTipoElemento } from '../../src/redux/elemento/reducer/transformaTipoElemento';
import { State } from '../../src/redux/state';
import {
  transformaAlineaEmItem,
  transformarArtigoEmParagrafo,
  transformarIncisoParagrafoEmAlinea,
  transformarIncisoParagrafoEmParagrafo,
  transformarParagrafoEmIncisoCaput,
  transformarParagrafoEmIncisoParagrafo,
} from './../../src/model/lexml/acao/transformarElementoAction';
import { getDispositivoAnteriorMesmoTipo, isDispositivoRaiz } from './../../src/model/lexml/hierarquia/hierarquiaUtil';

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

  static incluiArtigoAntes(state: State, idArtigoRef: string): Artigo {
    return this.incluiArtigo(state, idArtigoRef, true);
  }

  static incluiArtigo(state: State, idArtigoRef: string, antes: boolean): Artigo {
    const artigoRef = buscaDispositivoById(state.articulacao!, idArtigoRef);
    let dispRef = artigoRef;
    // console.log(artigoRef?.rotulo);
    expect(artigoRef, `Dispositivo ${idArtigoRef} não encontrado!`).not.to.be.undefined;
    if (antes) {
      const pai = artigoRef!.pai!;
      if (!isDispositivoRaiz(pai) && isAgrupador(pai) && pai.filhos[0] === artigoRef) {
        dispRef = pai;
      } else {
        dispRef = getDispositivoAnteriorMesmoTipo(artigoRef!);
        expect(dispRef, `Dispositivo anterior ao ${idArtigoRef} não encontrado!`).not.to.be.undefined;
      }
    }
    state = adicionaElemento(state, {
      type: ADICIONAR_ELEMENTO,
      atual: { tipo: TipoDispositivo.artigo.tipo, uuid: dispRef?.uuid },
      novo: { tipo: TipoDispositivo.artigo.tipo },
    });
    let d: Dispositivo | undefined;
    if (antes) {
      if (dispRef === artigoRef!.pai) {
        d = dispRef?.filhos[0];
      } else {
        d = getDispositivoAnteriorMesmoTipo(artigoRef!);
      }
    } else {
      d = getDispositivoPosteriorMesmoTipo(artigoRef!);
    }
    // console.log(d?.rotulo);
    expect(d, `Falha na inserção do artigo ${antes ? 'antes do' : 'após'} ${idArtigoRef}`).to.not.be.undefined;
    return d!;
  }

  static incluiParagrafo(state: State, idDispRef: string, antes: boolean, expectedId: string): Dispositivo {
    return this.incluiDispositivo(state, idDispRef, antes, TipoDispositivo.paragrafo.tipo, expectedId);
  }

  static incluiInciso(state: State, idDispRef: string, antes: boolean, expectedId: string): Dispositivo {
    return this.incluiDispositivo(state, idDispRef, antes, TipoDispositivo.inciso.tipo, expectedId);
  }

  static incluiAlinea(state: State, idDispRef: string, antes: boolean, expectedId: string): Dispositivo {
    return this.incluiDispositivo(state, idDispRef, antes, TipoDispositivo.alinea.tipo, expectedId);
  }

  static incluiItem(state: State, idDispRef: string, antes: boolean, expectedId: string): Dispositivo {
    return this.incluiDispositivo(state, idDispRef, antes, TipoDispositivo.item.tipo, expectedId);
  }

  // protected void incluiOmissis(final String idDispRef, final boolean antes) {
  //     DispositivoModel dispRef = (DispositivoModel) ArvoreDispositivosUtil.getDispositivoById(raiz, idDispRef);
  //     new ComandoIncluirDispositivo(emenda, "Omissis", dispRef, antes ? Atalho.ANTES : Atalho.DEPOIS).executa();
  // }

  static incluiDispositivo(state: State, idDispRef: string, antes: boolean, tipo: string, expectedId: string): Dispositivo {
    const dispRef = buscaDispositivoById(state.articulacao!, idDispRef);
    // let dispRef = artigoRef;
    // console.log(artigoRef?.rotulo);
    // expect(artigoRef, `Dispositivo ${idArtigoRef} não encontrado!`).not.to.be.undefined;
    if (antes) {
      throw Error('Inclusão de dispositivo antes ainda não implementada.');
      // const pai = artigoRef!.pai!;
      // if (!isDispositivoRaiz(pai) && isAgrupador(pai) && pai.filhos[0] === artigoRef) {
      //   dispRef = pai;
      // } else {
      //   dispRef = getDispositivoAnteriorMesmoTipo(artigoRef!);
      //   expect(dispRef, `Dispositivo anterior ao ${idArtigoRef} não encontrado!`).not.to.be.undefined;
      // }
    }
    state = adicionaElemento(state, {
      type: ADICIONAR_ELEMENTO,
      atual: { tipo: dispRef!.tipo, uuid: dispRef!.uuid },
      novo: { tipo: tipo },
    });
    const elementoIncluido = state.present![0].elementos![0];
    if (elementoIncluido.tipo !== tipo) {
      if (tipo === TipoDispositivo.paragrafo.tipo) {
        if (elementoIncluido.tipo === TipoDispositivo.artigo.tipo) {
          const action = transformarArtigoEmParagrafo.execute({ tipo: TipoDispositivo.artigo.tipo, uuid: elementoIncluido.uuid! });
          state = transformaTipoElemento(state, action);
        } else if (elementoIncluido.tipo === TipoDispositivo.inciso.tipo) {
          const action = transformarIncisoParagrafoEmParagrafo.execute({ tipo: TipoDispositivo.artigo.tipo, uuid: elementoIncluido.uuid! });
          state = transformaTipoElemento(state, action);
        }
      } else if (tipo === TipoDispositivo.inciso.tipo) {
        if (elementoIncluido.tipo === TipoDispositivo.artigo.tipo) {
          const action1 = transformarArtigoEmParagrafo.execute({ tipo: TipoDispositivo.artigo.tipo, uuid: elementoIncluido.uuid! });
          state = transformaTipoElemento(state, action1);
          const action2 = transformarParagrafoEmIncisoCaput.execute({ tipo: TipoDispositivo.paragrafo.tipo, uuid: state.present![0].elementos![0].uuid! });
          state = transformaTipoElemento(state, action2);
        } else if (elementoIncluido.tipo === TipoDispositivo.paragrafo.tipo) {
          const action1 = transformarParagrafoEmIncisoParagrafo.execute({ tipo: TipoDispositivo.paragrafo.tipo, uuid: elementoIncluido.uuid! });
          state = transformaTipoElemento(state, action1);
        }
      } else if (tipo === TipoDispositivo.alinea.tipo) {
        if (elementoIncluido.tipo === TipoDispositivo.inciso.tipo) {
          const action1 = transformarIncisoParagrafoEmAlinea.execute({ tipo: TipoDispositivo.inciso.tipo, uuid: elementoIncluido.uuid! });
          state = transformaTipoElemento(state, action1);
        }
      } else if (tipo === TipoDispositivo.item.tipo) {
        if (elementoIncluido.tipo === TipoDispositivo.alinea.tipo) {
          const action1 = transformaAlineaEmItem.execute({ tipo: TipoDispositivo.alinea.tipo, uuid: elementoIncluido.uuid! });
          state = transformaTipoElemento(state, action1);
        }
      }
    }
    const d = buscaDispositivoById(state.articulacao!, expectedId);
    expect(d, `Falha na inserção do artigo ${antes ? 'antes do' : 'após'} ${idDispRef}. Dispositivo com id ${expectedId} não encontrado.`).to.not.be.undefined;
    return d!;
  }

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
