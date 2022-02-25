import { isAgrupador, isArtigo, isParagrafo, isOmissis } from './../model/dispositivo/tipo';
import { Artigo, Dispositivo } from '../model/dispositivo/dispositivo';
import { Genero, generoFeminino, generoMasculino } from './../model/dispositivo/genero';
import { SequenciaRangeDispositivos } from './sequencia-range-dispositivos';
import { getDispositivoPosterior } from '../model/lexml/hierarquia/hierarquiaUtil';
import { TEXTO_OMISSIS } from '../model/lexml/conteudo/textoOmissis';

export class NomeComGenero {
  constructor(public nome: string, private letraGenero: 'M' | 'F') {}

  getGenero(): Genero {
    return this.letraGenero === 'M' ? generoMasculino : generoFeminino;
  }
}

export class CmdEmdUtil {
  static getDispositivosComando(dispositivosEmenda: Dispositivo[]): Dispositivo[] {
    return dispositivosEmenda;
  }
  // public static List<Dispositivo> getDispositivosComando(final Emenda emenda) {
  //     List<Dispositivo> dispositivos = new ArrayList<Dispositivo>();
  //     List<Dispositivo> dispositivosEmenda = emenda.getDispositivos();

  //     for (Dispositivo d : dispositivosEmenda) {
  //         if (d.isSituacao(DispositivoOriginal.class) || d.isDispositivoDeAlteracao()
  //             || d.isTipo(Alteracao.class)) {
  //             continue;
  //         }
  //         Dispositivo dispositivoAfetado = CmdEmdUtil.getDispositivoAfetado(d);
  //         if (dispositivoAfetado != null && !dispositivos.contains(dispositivoAfetado)) {
  //             dispositivos.add(dispositivoAfetado);
  //         }
  //     }
  //     Collections.sort(dispositivos);
  //     return dispositivos;
  // }

  // private static Dispositivo getDispositivoAfetado(final Dispositivo d) {

  //     if (d.isTipo(DispositivoAgrupadorDeArtigo.class) || d.isTipo(Artigo.class)) {
  //         return d;
  //     }

  //     Dispositivo pai = d.getPai();
  //     // Se o pai for uma alteração integral
  //     if (CmdEmdUtil.isAlteracaoIntegral(pai)) {
  //         // Chama recursivamente para o pai
  //         return CmdEmdUtil.getDispositivoAfetado(pai);
  //     }

  //     return d;
  // }

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

  // private static boolean isAlteracaoIntegral(final Dispositivo d) {

  //     boolean isArtigo = d.isTipo(Artigo.class);

  //     if (d.isSituacao(DispositivoOriginal.class) && !isArtigo) {
  //         return false;
  //     }

  //     if (d.isSituacao(DispositivoSuprimido.class)) {
  //         return true;
  //     }

  //     if (d.getQuantidadeFilhos() == 0) {
  //         if (isArtigo) {
  //             return !d.isSituacao(DispositivoOriginal.class);
  //         }
  //         return true;
  //     }

  //     for (Dispositivo filho : d.getFilhos()) {
  //         if (!CmdEmdUtil.isAlteracaoIntegral(filho)) {
  //             return false;
  //         }
  //     }

  //     return true;
  // }

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

  // public static List<Dispositivo> filtraArtigosOndeCouber(final List<Dispositivo> dispositivos) {
  //     List<Dispositivo> ret = new ArrayList<Dispositivo>();
  //     for (Dispositivo d : dispositivos) {
  //         if (d.getPai().isTipo(AgrupadorDeArtigosOndeCouber.class) && d.isTipo(Artigo.class)
  //             && d.isSituacao(DispositivoNovo.class)) {
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

  static getProximoAgrupador(disp: Dispositivo): Dispositivo {
    let ret: Dispositivo | undefined = disp;
    do {
      ret = getDispositivoPosterior(ret as Dispositivo);
    } while (disp && !isAgrupador(disp));
    return disp;
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
}
