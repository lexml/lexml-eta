import { Articulacao, Artigo, Dispositivo } from '../model/dispositivo/dispositivo';
import { TEXTO_OMISSIS } from '../model/lexml/conteudo/textoOmissis';
import { getDispositivoPosterior, percorreHierarquiaDispositivos } from '../model/lexml/hierarquia/hierarquiaUtil';
import { DescricaoSituacao } from './../model/dispositivo/situacao';
import { isAgrupador, isArtigo, isCaput, isOmissis, isParagrafo } from './../model/dispositivo/tipo';
import { isArticulacaoAlteracao, isDispositivoAlteracao } from './../model/lexml/hierarquia/hierarquiaUtil';
import { SequenciaRangeDispositivos } from './sequencia-range-dispositivos';

export class CmdEmdUtil {
  static getDispositivosNaoOriginais(articulacao: Articulacao): Dispositivo[] {
    const ret: Dispositivo[] = [];
    percorreHierarquiaDispositivos(articulacao, d => {
      if (d.pai && d.situacao.descricaoSituacao !== DescricaoSituacao.DISPOSITIVO_ORIGINAL) {
        ret.push(d);
      }
    });
    return ret;
  }

  static getDispositivosComando(dispositivosEmenda: Dispositivo[]): Dispositivo[] {
    const dispositivos = new Array<Dispositivo>();

    for (const d of dispositivosEmenda) {
      if (d.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ORIGINAL || isDispositivoAlteracao(d) || isArticulacaoAlteracao(d)) {
        continue;
      }
      const dispositivoAfetado = CmdEmdUtil.getDispositivoAfetado(d);
      if (dispositivoAfetado && !dispositivos.includes(dispositivoAfetado)) {
        dispositivos.push(dispositivoAfetado);
      }
    }

    return dispositivos;
  }

  private static getDispositivoAfetado(d: Dispositivo): Dispositivo {
    if (isAgrupador(d) || isArtigo(d)) {
      return d;
    }

    const pai = d.pai!;

    // Verifica alteração integral de caput
    if (isCaput(pai) && pai.pai!.situacao.descricaoSituacao !== DescricaoSituacao.DISPOSITIVO_ORIGINAL) {
      if (pai.filhos.find(f => f.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ORIGINAL)) {
        return d;
      }
      return pai.pai!;
    }

    // Se o pai for uma alteração integral
    if (CmdEmdUtil.isAlteracaoIntegral(pai)) {
      // Chama recursivamente para o pai
      return CmdEmdUtil.getDispositivoAfetado(pai);
    }

    return d;
  }

  // private static Dispositivo getDispositivoAfetadoEmAlteracao(final Dispositivo d) {

  //     if (d.isTipo(Omissis.class)) {
  //         if (CmdEmdUtil.isOmissisAdjacenteADispositivoDeEmenda(d)) {
  //             return null;
  //         }
  //     }
  //     else if (d.isSituacao(DispositivoNovo.class) && CmdEmdUtil.isTextoOmitido(d)) {
  //         return null;
  //     }

  //     Dispositivo pai = d.getPai();
  //     // Se o pai for uma alteração integral
  //     if (CmdEmdUtil.isAlteracaoIntegralEmAlteracao(pai)) {
  //         // Chama recursivamente para o pai
  //         return CmdEmdUtil.getDispositivoAfetado(pai);
  //     }

  //     return d;
  // }

  // Considero texto omitido do Artigo se o seu caput tiver o texto omitido.
  static isTextoOmitido(d: Dispositivo): boolean {
    return isOmissis(d) || d.texto.startsWith(TEXTO_OMISSIS) || (isAgrupador(d) && !!(d as Artigo).caput?.texto.startsWith(TEXTO_OMISSIS));
  }

  static isAlteracaoIntegral(d: Dispositivo): boolean {
    if (d.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ORIGINAL) {
      return false;
    }

    if (d.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_SUPRIMIDO || d.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO) {
      return true;
    }

    if (!d.filhos.length) {
      if (isArtigo(d)) {
        return d.situacao.descricaoSituacao !== DescricaoSituacao.DISPOSITIVO_ORIGINAL;
      }
      return true;
    }

    for (const filho of d.filhos) {
      if (!CmdEmdUtil.isAlteracaoIntegral(filho)) {
        return false;
      }
    }

    return true;
  }

  // private static boolean isAlteracaoIntegralEmAlteracao(final Dispositivo d) {

  //     if (d.isTipo(Alteracao.class)) {
  //         return false;
  //     }

  //     return d.isSituacao(DispositivoNovo.class) && !CmdEmdUtil.isTextoOmitido(d);
  // }

  // public static Map<Dispositivo , Map> getArvoreDispositivos(final List<Dispositivo> dispositivos) {

  //     Map<Dispositivo , Map> mapa = new HashMap<Dispositivo , Map>();

  //     if (dispositivos == null || dispositivos.isEmpty()) {
  //         return mapa;
  //     }

  //     for (Dispositivo dispositivo : dispositivos) {
  //         EmendaUtil.atualizaMapa(dispositivo, mapa);
  //     }

  //     return mapa;
  // }

  // public static Map<Dispositivo , Map> getArvoreDispositivosDeAlteracaoDeNorma(final List<Dispositivo> dispositivos) {

  //     Map<Dispositivo , Map> mapa = new HashMap<Dispositivo , Map>();

  //     if (dispositivos == null || dispositivos.isEmpty()) {
  //         return mapa;
  //     }

  //     for (Dispositivo dispositivo : dispositivos) {
  //         EmendaUtil.atualizaMapaDeAlteracaoDeNorma(dispositivo, mapa);
  //     }

  //     return mapa;
  // }

  // public static List<Dispositivo> filtraDispositivosModificados(final List<Dispositivo> dispositivos) {

  //     List<Dispositivo> ret = new ArrayList<Dispositivo>();

  //     // No caso de dispositivo modificado pode ocorrer o caso de alteração integral de artigo,
  //     // onde o próprio artigo não está marcado como modificado.
  //     for (Dispositivo d : dispositivos) {
  //         if (d.isSituacao(DispositivoModificado.class) || d.isSituacao(DispositivoOriginal.class)
  //             && CmdEmdUtil.isAlteracaoIntegral(d)) {
  //             ret.add(d);
  //         }
  //     }

  //     return ret;
  // }

  static isSequenciasPlural(sequencias: SequenciaRangeDispositivos[]): boolean {
    const qtdSequencias = sequencias.length;
    if (qtdSequencias === 0) {
      return false;
    }
    return qtdSequencias > 1 || CmdEmdUtil.isSequenciaPlural(sequencias[0]);
  }

  static isSequenciaPlural(sequencia: SequenciaRangeDispositivos): boolean {
    const qtdRanges = sequencia.getQuantidadeRanges();
    if (qtdRanges === 0) {
      return false;
    }
    return qtdRanges > 1 || sequencia.getPrimeiroRange().getQuantidadeDispositivos() > 1;
  }

  static getProximoAgrupador(disp: Dispositivo): Dispositivo | undefined {
    let ret: Dispositivo | undefined = disp;
    do {
      ret = getDispositivoPosterior(ret as Dispositivo);
    } while (ret && !isAgrupador(ret));
    return ret;
  }

  static getDispositivoIrmaoPosterior(dispositivo: Dispositivo): Dispositivo | undefined {
    if (isArtigo(dispositivo) || isAgrupador(dispositivo)) {
      return this.getArtigoPosterior(dispositivo);
    }
    if (!this.isUltimoDispositivoDoMesmoTipo(dispositivo)) {
      const pai = dispositivo.pai as Dispositivo;
      const index = pai.filhos.indexOf(dispositivo) + 1;
      return pai.filhos[index];
    }
    return undefined;
  }

  private static getArtigoPosterior(dispositivo: Dispositivo): Dispositivo | undefined {
    const pai = dispositivo.pai as Dispositivo;
    if (pai.filhos.length) {
      const iFilho = pai.filhos.indexOf(dispositivo);
      for (let i = iFilho + 1; i < pai.filhos.length; i++) {
        const d = pai.filhos[i];
        if (isArtigo(d)) {
          return d;
        } else if (isAgrupador(d)) {
          const atual = this.buscaProximoArtigo(d);
          if (atual) {
            return atual;
          }
        }
      }
      if (pai.pai) {
        return this.getArtigoPosterior(pai);
      }
    }

    return undefined;
  }

  private static buscaProximoArtigo(dispositivo: Dispositivo): Dispositivo | undefined {
    const filhos = dispositivo.filhos;
    for (const d of filhos) {
      if (isArtigo(d)) {
        return d;
      }
      if (isAgrupador(d)) {
        return this.buscaProximoArtigo(d);
      }
    }
    return undefined;
  }

  public static isUltimoDispositivoDoMesmoTipo(dispositivo: Dispositivo): boolean {
    if (!dispositivo.pai) {
      return true;
    }
    const pai = dispositivo.pai as Dispositivo;
    const index = pai.filhos.indexOf(dispositivo);
    if (pai.filhos.length === index + 1) {
      return true;
    }
    if (pai.filhos[index + 1].tipo === dispositivo.tipo) {
      return false;
    }
    return true;
  }

  static getFilhosEstiloLexML(d: Dispositivo): Dispositivo[] {
    if (isArtigo(d)) {
      const artigo = d as Artigo;
      return [artigo.caput as Dispositivo, ...artigo.filhos.filter(f => isParagrafo(f))];
    }
    return d.filhos;
  }

  static getDispositivoAnteriorDireto(d: Dispositivo): Dispositivo {
    const pai = d.pai as Dispositivo;
    const irmaos = this.getFilhosEstiloLexML(pai);
    const i = irmaos.indexOf(d);
    if (i > 0) {
      d = irmaos[i - 1];
    } else {
      return pai;
    }
    while (d.filhos.length) {
      d = d.filhos[d.filhos.length - 1];
    }
    return d;
  }

  static getDispositivoPosteriorDireto(d: Dispositivo): Dispositivo | undefined {
    // primeiro o primeiro filho ou o primeiro irmão do pai (recursivamente)
    const filhos = this.getFilhosEstiloLexML(d);
    if (filhos.length) {
      return filhos[0];
    } else {
      return this.getProximoIrmaoRecursivo(d);
    }
  }

  private static getProximoIrmaoRecursivo(d: Dispositivo | undefined): Dispositivo | undefined {
    if (!d) return;

    const irmao = getDispositivoPosterior(d);

    if (irmao) {
      return irmao;
    } else {
      const pai = d.pai;
      return pai ? undefined : this.getProximoIrmaoRecursivo(pai);
    }
  }

  // /**
  //  * Retorna rótulo do dispositivo gerado pelo numerador. Não confia no rótulo informado pelo
  //  * dispositivo original.
  //  */
  // public static String getRotulo(final Dispositivo d) {
  //     return d.getNumeradorDispositivo().getRotulo(d);
  // }

  // public static String getRotuloPais(Dispositivo disp) {
  //     StringBuilder sb = new StringBuilder();

  //     Dispositivo pai;
  //     while (disp != null && !disp.isTipo(Artigo.class)) {
  //         pai = disp.getPai();

  //         sb.append(pai.getGenero().getPronomePossessivoSingular());
  //         sb.append(pai.getNumeracaoComRotuloParaComandoEmenda());

  //         disp = pai;
  //     }

  //     return sb.toString();
  // }

  // public static List<Dispositivo> getDispositivosNaAlteracaoParaComando(final Dispositivo alteracao) {

  //     List<Dispositivo> dispositivosAlterados = DispositivoUtil.filtraFilhos(alteracao, new DispositivoFilter() {

  //         @Override
  //         public boolean accept(final Dispositivo d) {
  //             return !d.isSituacao(DispositivoOriginal.class);
  //         }

  //     });

  //     List<Dispositivo> dispositivos = new ArrayList<Dispositivo>(dispositivosAlterados.size());

  //     for (Dispositivo d : dispositivosAlterados) {
  //         Dispositivo dispositivoAfetado = CmdEmdUtil.getDispositivoAfetadoEmAlteracao(d);
  //         if (dispositivoAfetado != null && !dispositivos.contains(dispositivoAfetado)) {
  //             dispositivos.add(dispositivoAfetado);
  //         }
  //     }

  //     Collections.sort(dispositivos);

  //     return dispositivos;
  // }

  // public static boolean isOmissisAdjacenteADispositivoDeEmenda(final Dispositivo d) {
  //     if (!d.isTipo(Omissis.class)) {
  //         return false;
  //     }
  //     Dispositivo anterior = d.getDispositivoAnteriorDireto();
  //     if (anterior != null && !anterior.isSituacao(DispositivoOriginal.class)) {
  //         return true;
  //     }
  //     Dispositivo posterior = d.getDispositivoPosteriorDireto();
  //     if (posterior != null && !posterior.isSituacao(DispositivoOriginal.class)) {
  //         return true;
  //     }
  //     return false;
  // }

  static isMesmoTipoParaComandoEmenda(d1: Dispositivo, d2: Dispositivo): boolean {
    if (d1.tipo !== d2.tipo) {
      return false;
    }
    if (isArtigo(d1) && CmdEmdUtil.isAlteracaoIntegral(d1) !== CmdEmdUtil.isAlteracaoIntegral(d2)) {
      return false;
    }
    return true;
  }

  static getTextoParaCitacao(d: Dispositivo): string {
    return d.texto.replace(/^\s*<p>\s*/i, '').replace(/\s*<\/p>\s*$/i, '');
  }
}
