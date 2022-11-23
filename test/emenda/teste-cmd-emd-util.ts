import { CmdEmdUtil } from './../../src/emenda/comando-emenda-util';
import { DispositivoAdicionado } from './../../src/model/lexml/situacao/dispositivoAdicionado';
import { expect } from '@open-wc/testing';

import { Artigo, Dispositivo } from '../../src/model/dispositivo/dispositivo';
import { createElemento } from '../../src/model/elemento/elementoUtil';
import { ADICIONAR_ELEMENTO, adicionarArtigoAntes, AdicionarElemento } from '../../src/model/lexml/acao/adicionarElementoAction';
import { buscaDispositivoById, getDispositivoPosteriorMesmoTipo, isDispositivoAlteracao } from '../../src/model/lexml/hierarquia/hierarquiaUtil';
import { TipoDispositivo } from '../../src/model/lexml/tipo/tipoDispositivo';
import { adicionaElemento } from '../../src/redux/elemento/reducer/adicionaElemento';
import { suprimeElemento } from '../../src/redux/elemento/reducer/suprimeElemento';
import { transformaTipoElemento } from '../../src/redux/elemento/reducer/transformaTipoElemento';
import { State } from '../../src/redux/state';
import { Tipo } from './../../src/model/dispositivo/tipo';
import { adicionarArtigoDepois } from './../../src/model/lexml/acao/adicionarElementoAction';
import { atualizarTextoElementoAction } from './../../src/model/lexml/acao/atualizarTextoElementoAction';
import { SUPRIMIR_ELEMENTO } from './../../src/model/lexml/acao/suprimirElemento';
import {
  transformaAlineaEmItem,
  transformarArtigoEmParagrafo,
  transformarIncisoParagrafoEmAlinea,
  transformarIncisoParagrafoEmParagrafo,
  transformarParagrafoEmIncisoCaput,
  transformarParagrafoEmIncisoParagrafo,
} from './../../src/model/lexml/acao/transformarElementoAction';
import { getDispositivoAnteriorMesmoTipo } from './../../src/model/lexml/hierarquia/hierarquiaUtil';
import { atualizaTextoElemento } from './../../src/redux/elemento/reducer/atualizaTextoElemento';

export class TesteCmdEmdUtil {
  static readonly URN_LEI = 'urn:lex:br:federal:lei:2006-08-07;11340';

  static readonly URN_DECRETO = 'urn:lex:br:federal:decreto:1966-08-03;58979';

  // protected Dispositivo getDispositivo(final String id) {
  //     return ArvoreDispositivosUtil.getDispositivoById(raiz, id);
  // }

  static suprimeDispositivo(state: State, id: string): void {
    const disp = buscaDispositivoById(state.articulacao!, id);
    expect(disp, `Dispositivo não encontrado para o id ${id}.`).not.be.undefined;
    state = suprimeElemento(state, {
      type: SUPRIMIR_ELEMENTO,
      atual: { tipo: disp!.tipo, uuid: disp!.uuid },
    });
  }

  // protected void suprimePrimeiroArtigoDoSeparador(final String idSeparador, final int indiceArtigo) {
  //     Dispositivo art = ArvoreDispositivosUtil.getDispositivoById(raiz, idSeparador).getFilho(indiceArtigo);
  //     art.setSituacao(new DispositivoSuprimidoDefaultImpl(art));
  //     emenda.addDispositivo(art);
  // }

  static modificaDispositivo(state: State, id: string): Dispositivo {
    const disp = buscaDispositivoById(state.articulacao!, id);
    expect(disp, `Dispositivo não encontrado para o id ${id}.`).not.be.undefined;
    const elem = createElemento(disp!, false);
    elem.conteudo = { texto: ' <p>Texto</p>' };
    const action = atualizarTextoElementoAction.execute(elem);
    state = atualizaTextoElemento(state, action);
    return disp!;
  }

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
    expect(artigoRef, `Dispositivo ${idArtigoRef} não encontrado!`).not.to.be.undefined;
    const action = antes ? adicionarArtigoAntes.execute(artigoRef!, '') : adicionarArtigoDepois.execute(artigoRef!, '');
    state = adicionaElemento(state, action);
    const d = antes ? getDispositivoAnteriorMesmoTipo(artigoRef!) : getDispositivoPosteriorMesmoTipo(artigoRef!);
    expect(d, `Falha na inserção do artigo ${antes ? 'antes do' : 'após'} ${idArtigoRef}`).to.not.be.undefined;
    d!.texto = '<p>Texto</p>';
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

  static incluiItem(state: State, idDispRef: string, antes: boolean, expectedId?: string): Dispositivo {
    return this.incluiDispositivo(state, idDispRef, antes, TipoDispositivo.item.tipo, expectedId);
  }

  // protected void incluiOmissis(final String idDispRef, final boolean antes) {
  //     DispositivoModel dispRef = (DispositivoModel) ArvoreDispositivosUtil.getDispositivoById(raiz, idDispRef);
  //     new ComandoIncluirDispositivo(emenda, "Omissis", dispRef, antes ? Atalho.ANTES : Atalho.DEPOIS).executa();
  // }

  static incluiDispositivo(state: State, idDispRef: string, antes: boolean, tipo: string, expectedId?: string): Dispositivo {
    const dispRef = buscaDispositivoById(state.articulacao!, idDispRef);
    if (antes) {
      throw Error('Inclusão de dispositivo antes ainda não implementada.');
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
    let d;
    if (isDispositivoAlteracao(dispRef!)) {
      d = CmdEmdUtil.getDispositivoPosteriorDireto(dispRef!);
    } else {
      d = buscaDispositivoById(state.articulacao!, expectedId!);
      expect(d, `Falha na inserção do artigo ${antes ? 'antes do' : 'após'} ${idDispRef}. Dispositivo com id ${expectedId} não encontrado.`).to.not.be.undefined;
    }
    d!.texto = '<p> Texto</p> ';
    return d!;
  }

  static incluiParagrafoAlteracao(state: State, idDispRef: string, antes: boolean, rotulo?: string, existeNaNorma?: boolean): Dispositivo {
    return this.incluiDispositivoAlteracao(state, idDispRef, antes, TipoDispositivo.paragrafo, rotulo, existeNaNorma);
  }

  static incluiIncisoAlteracao(state: State, idDispRef: string, antes: boolean, rotulo?: string, existeNaNorma?: boolean): Dispositivo {
    return this.incluiDispositivoAlteracao(state, idDispRef, antes, TipoDispositivo.inciso, rotulo, existeNaNorma);
  }

  static incluiAlineaAlteracao(state: State, idDispRef: string, antes: boolean, rotulo?: string, existeNaNorma?: boolean): Dispositivo {
    return this.incluiDispositivoAlteracao(state, idDispRef, antes, TipoDispositivo.alinea, rotulo, existeNaNorma);
  }

  static incluiItemAlteracao(state: State, idDispRef: string, antes: boolean, rotulo?: string, existeNaNorma?: boolean): Dispositivo {
    return this.incluiDispositivoAlteracao(state, idDispRef, antes, TipoDispositivo.item, rotulo, existeNaNorma);
  }

  static incluiDispositivoAlteracao(state: State, idDispRef: string, antes: boolean, tipo: Tipo, rotulo?: string, existeNaNorma = true): Dispositivo {
    const dispRef = buscaDispositivoById(state.articulacao!, idDispRef);
    expect(dispRef, `Dispositivo ${idDispRef} não encontrado!`).not.to.be.undefined;
    const action = new AdicionarElemento(tipo, antes ? 'antes' : 'depois').execute(dispRef!);
    state = adicionaElemento(state, action);
    const d = antes ? getDispositivoAnteriorMesmoTipo(dispRef!) : getDispositivoPosteriorMesmoTipo(dispRef!);
    expect(d, `Falha na inserção do artigo ${antes ? 'antes do' : 'após'} ${idDispRef}`).to.not.be.undefined;
    d!.texto = '<p>Texto</p>';
    this.numeraECriaRotulo(d!, rotulo, existeNaNorma);
    return d!;
  }

  static numeraECriaRotulo(d: Dispositivo, rotulo?: string, existeNaNorma = true): void {
    if (rotulo) {
      d.rotulo = rotulo;
      d.createNumeroFromRotulo(d.rotulo);
      d.createRotulo(d); // Normaliza rótulo
    }
    (d.situacao as DispositivoAdicionado).existeNaNormaAlterada = existeNaNorma;
  }

  // private boolean isAlgumTipo(final Dispositivo disp, final Class< ? extends TipoDispositivo>... tipos) {
  //     for (Class< ? extends TipoDispositivo> tipo : tipos) {
  //         if (disp.isTipo(tipo)) {
  //             return true;
  //         }
  //     }
  //     return false;
  // }

  // // static incluiAlteracaoNormaVigente(state: State, idAlvo: string, urn: string, idNovo: string, novo: boolean): Dispositivo {
  // static incluiAlteracaoNormaVigente(state: State, idAlvo: string): Dispositivo {
  //   const dispRef = buscaDispositivoById(state.articulacao!, idAlvo);
  //   expect(dispRef, `Dispositivo com id ${idAlvo} não encontrado.`).not.be.undefined;
  //   const elemAtual = createElemento(dispRef!, false);
  //   const elemNovo = {
  //     isDispositivoAlteracao: true,
  //     conteudo: {},
  //   };
  //   iniciarBlocoAlteracao.execute(elemAtual, undefined, elemNovo, false);
  //   const dispAlteracoes = dispRef!.alteracoes;
  //   return dispAlteracoes!;
  //   // dispAlteracoes!.base = urn;
  //   // return dispAlteracoes!.filhos[0];
  //   //  ComandoIncluirAlteracaoNorma cmd = new ComandoIncluirAlteracaoNorma(emenda, dAlvo, urn, idNovo);
  //   //   cmd.executa();
  //   //   Dispositivo d = cmd.getDispositivoAdicionado();
  //   // d.SituacaoNormaVigente = novo ? SituacaoNormaVigente.DISPOSITIVO_NOVO : SituacaoNormaVigente.DISPOSITIVO_EXISTENTE;
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
