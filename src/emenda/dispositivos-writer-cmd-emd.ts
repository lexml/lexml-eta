import { RangeDispositivos } from './range-dispositivos';
import { Dispositivo } from '../model/dispositivo/dispositivo';
import { Genero } from '../model/dispositivo/genero';
import { isAgrupador, isAgrupadorNaoArticulacao, isArtigo, isOmissis, isParagrafo } from '../model/dispositivo/tipo';
import { isDispositivoAlteracao, isDispositivoRaiz } from '../model/lexml/hierarquia/hierarquiaUtil';
import { TipoDispositivo } from '../model/lexml/tipo/tipoDispositivo';
import { primeiraLetraMaiuscula, StringBuilder } from '../util/string-util';
import { generoMasculino, generoFeminino } from './../model/dispositivo/genero';
import { DescricaoSituacao } from './../model/dispositivo/situacao';
import { isArticulacao, isCaput } from './../model/dispositivo/tipo';
import { isArticulacaoAlteracao, getDispositivoAnteriorNaSequenciaDeLeitura, getDispositivoPosteriorNaSequenciaDeLeitura } from './../model/lexml/hierarquia/hierarquiaUtil';
import { CmdEmdUtil } from './comando-emenda-util';
import { DispositivoEmendaUtil } from './dispositivo-emenda-util';
import { SequenciaRangeDispositivos } from './sequencia-range-dispositivos';

export enum ArtigoAntesDispositivo {
  NENHUM,
  DEFINIDO,
  DEFINIDO_COM_PREPOSICAO_A,
}

export enum TipoReferenciaAgrupador {
  APENAS_ROTULO,
  DENOMINACAO_DO_AGRUPADOR, // 'a denominação do/a'
  TODO_AGRUPADOR, // 'todo/a o/a'
  O_AGRUPADOR, // 'o agrupador '
  ADICAO, // Sessão X ' ao ' Capítulo Y
}

export class DispositivosWriterCmdEmd {
  public artigoAntesDispositivo = ArtigoAntesDispositivo.NENHUM;

  public tipoReferenciaAgrupador = TipoReferenciaAgrupador.APENAS_ROTULO;

  getTexto(sequencias: SequenciaRangeDispositivos[], citarPais = true): string {
    const sb = new StringBuilder();

    const qtdSequencias = sequencias.length;
    let posSequencia = 1;
    for (const sequencia of sequencias) {
      // Conector (, ou e)
      if (posSequencia > 1) {
        if (posSequencia === qtdSequencias) {
          sb.append(' e ');
        } else {
          sb.append(', ');
        }
      }

      const primeiroDispSeq = sequencia.getPrimeiroDispositivo();
      const primeiroEhAgrupador = isAgrupadorNaoArticulacao(primeiroDispSeq);
      const referenciarDenominacao = this.tipoReferenciaAgrupador === TipoReferenciaAgrupador.DENOMINACAO_DO_AGRUPADOR && primeiroEhAgrupador;
      const referenciarTodoAgrupador = this.tipoReferenciaAgrupador === TipoReferenciaAgrupador.TODO_AGRUPADOR && primeiroEhAgrupador;
      const referenciarOAgrupador = this.tipoReferenciaAgrupador === TipoReferenciaAgrupador.O_AGRUPADOR && primeiroEhAgrupador && !!primeiroDispSeq.filhos.length;

      if (sequencia.informarCaputDoDispositivo) {
        sb.append(this.getReferenciaCaputDoDispositivo(sequencia));
      } else {
        // Artigo antes do dispositivo
        sb.append(this.getTextoArtigoAntesSequencia(sequencia, referenciarDenominacao, referenciarTodoAgrupador, referenciarOAgrupador));
      }

      // Rótulo do tipo do dispositivo ou denominação
      if (referenciarDenominacao) {
        sb.append('denominação ' + primeiroDispSeq.pronomePossessivoSingular + ' ');
      } else if (referenciarOAgrupador) {
        sb.append('agrupador ');
      }
      sb.append(this.getRotuloTipoDispositivo(sequencia, primeiroEhAgrupador));

      sb.append(' ');

      // Dispositivos
      sb.append(sequencia.getTextoListaDeDispositivos());

      // Pai dos dispositivos
      if (citarPais) {
        sb.append(this.getRotuloPaisSequencia(sequencia));
      }

      posSequencia++;
    }

    return sb.toString().replace('ementa ', 'ementa');
  }

  private getReferenciaCaputDoDispositivo(sequencia: SequenciaRangeDispositivos): string {
    const sb = new StringBuilder();

    const disp = sequencia.getPrimeiroDispositivo();

    if (disp.tipo === TipoDispositivo.caput.tipo) {
      return this.getTextoArtigoAntesSequencia(sequencia);
    }

    const plural = CmdEmdUtil.isSequenciaPlural(sequencia);

    sb.append(this.getTextoArtigoAntesDispositivo(this.artigoAntesDispositivo, generoMasculino, plural));

    sb.append(' caput ');

    if (sequencia.getRange(0).getQuantidadeDispositivos() === 1) {
      sb.append(disp.pronomePossessivoSingular);
    } else {
      sb.append(disp.pronomePossessivoPlural);
    }

    return sb.toString();
  }

  private getTextoArtigoAntesSequencia(
    sequencia: SequenciaRangeDispositivos,
    referenciarDenominacao = false,
    referenciarTodoAgrupador = false,
    referenciarOAgrupador = false
  ): string {
    const primeiro = sequencia.getPrimeiroDispositivo();
    const genero = referenciarDenominacao ? generoFeminino : referenciarOAgrupador ? generoMasculino : primeiro;
    const plural = CmdEmdUtil.isSequenciaPlural(sequencia);

    const textoTodo = referenciarTodoAgrupador ? (primeiro.tipoGenero === 'feminino' ? 'toda ' : 'todo ') : '';

    return textoTodo + this.getTextoArtigoAntesDispositivo(this.artigoAntesDispositivo, genero, plural);
  }

  private getTextoArtigoAntesDispositivo(tipo: ArtigoAntesDispositivo, genero: Genero, plural: boolean): string {
    switch (tipo) {
      case ArtigoAntesDispositivo.DEFINIDO:
        if (plural) {
          return genero.artigoDefinidoPlural;
        }
        return genero.artigoDefinidoSingular;
      case ArtigoAntesDispositivo.DEFINIDO_COM_PREPOSICAO_A:
        if (plural) {
          return genero.artigoDefinidoPrecedidoPreposicaoAPlural;
        }
        return genero.artigoDefinidoPrecedidoPreposicaoASingular;
      default:
        return '';
    }
  }

  private getRotuloTipoDispositivo(sequencia: SequenciaRangeDispositivos, iniciarComMaiuscula: boolean): string {
    const disp = sequencia.getPrimeiroDispositivo();
    const rotulo = DispositivosWriterCmdEmd.getRotuloTipoDispositivo(disp, CmdEmdUtil.isSequenciaPlural(sequencia));
    return iniciarComMaiuscula ? primeiraLetraMaiuscula(rotulo) : rotulo;
  }

  static getRotuloTipoDispositivo(disp: Dispositivo, plural: boolean): string {
    // TODO Verificar melhor forma de identificar que não deve ser impresso o rótulo
    // do tipo do dispositivo antes do parágrafo único e do artigo único.
    if (disp.getNumeracaoParaComandoEmenda(disp).indexOf('único') >= 0) {
      return '';
    }

    if (plural) {
      // Plural
      if (isArtigo(disp)) {
        return 'arts.';
      } else if (isParagrafo(disp)) {
        return '§§';
      }

      return String(disp.descricaoPlural).toLocaleLowerCase();
    }

    // Singular
    if (isArtigo(disp)) {
      if (disp.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_MODIFICADO && !CmdEmdUtil.isAlteracaoIntegral(disp)) {
        return 'caput do art.';
      }
      return 'art.';
    } else if (isParagrafo(disp)) {
      return '§';
    }

    return String(disp.descricao).toLowerCase();
  }

  private getRotuloPaisSequencia(sequencia: SequenciaRangeDispositivos): string {
    return this.getRotuloPais(sequencia.getPrimeiroDispositivo(), sequencia.localizarEmAgrupador);
  }

  private getRotuloPais(disp: Dispositivo, localizarEmAgrupador: boolean): string {
    let pai: Dispositivo | undefined;

    if (isAgrupador(disp)) {
      return DispositivosWriterCmdEmd.getRotuloPaisAgrupador(disp, this.tipoReferenciaAgrupador);
    }

    const sb = new StringBuilder();

    while (!isDispositivoRaiz(disp)) {
      pai = disp.pai;

      if (pai && isArticulacaoAlteracao(pai)) {
        if (disp.tipo === TipoDispositivo.omissis.tipo) {
          const anterior = CmdEmdUtil.getDispositivoAnteriorDireto(disp);
          if (anterior.tipo !== TipoDispositivo.alteracao.tipo) {
            sb.append('após ');
            sb.append(anterior.artigoDefinidoSingular);
            sb.append(anterior.getNumeracaoComRotuloParaComandoEmenda(anterior));
            sb.append(this.getRotuloPais(anterior, localizarEmAgrupador));
            return sb.toString();
          }
        }
        break;
      }

      if (pai && !isDispositivoRaiz(pai) && (!isAgrupador(pai) || (isArtigo(disp) && localizarEmAgrupador))) {
        const dispAlteracao = isDispositivoAlteracao(disp);
        const dispositivoNovoForaDeAlteracao = !dispAlteracao && disp.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO;
        const dispositivoNovoEmAlteracao =
          dispAlteracao &&
          !CmdEmdUtil.isTextoOmitido(disp) &&
          disp.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO &&
          !DispositivoEmendaUtil.existeNaNormaAlterada(disp);
        // TODO Tratar diferentes situações na norma vigente
        // && StringUtils
        //         .defaultString(disp.getSituacaoNaNormaVigente())
        //         .equals(Dispositivo.ACRESCIMO);
        if (dispositivoNovoForaDeAlteracao || dispositivoNovoEmAlteracao) {
          sb.append(pai.artigoDefinidoPrecedidoPreposicaoASingular);
        } else if (isOmissis(disp)) {
          const anterior = CmdEmdUtil.getDispositivoAnteriorDireto(disp);
          const posterior = CmdEmdUtil.getDispositivoPosteriorDireto(disp);

          if (anterior === pai && posterior && posterior.pai === pai) {
            // Entre pai e irmão
            const refIrmao = posterior.pronomePossessivoSingular + ' ' + posterior.descricao?.toLowerCase() + ' ' + posterior.getNumeracaoParaComandoEmenda(posterior);
            sb.append('antes ' + refIrmao);
            sb.append(pai.pronomePossessivoSingular);
          } else if (!(isArticulacao(anterior) && anterior.pai)) {
            sb.append('após ');
            sb.append(anterior.artigoDefinidoSingular);
            sb.append(anterior.getNumeracaoComRotuloParaComandoEmenda(anterior));
            sb.append(this.getRotuloPais(anterior, localizarEmAgrupador));
            return sb.toString();
          }
        } else {
          sb.append(pai.pronomePossessivoSingular);
        }
        sb.append(pai.getNumeracaoComRotuloParaComandoEmenda(pai));
      } else if (isArtigo(disp) && isDispositivoRaiz(pai!) && localizarEmAgrupador) {
        const agrupador = CmdEmdUtil.getProximoAgrupador(disp);
        if (agrupador) {
          sb.append(' antes ');
          sb.append(agrupador.pronomePossessivoSingular);
          sb.append(agrupador.getNumeracaoComRotuloParaComandoEmenda(agrupador));
        }
      }

      if (!pai) break;
      disp = pai;
    }

    return sb.toString();
  }

  static getRotuloPaisAgrupador(disp: Dispositivo, tipoReferenciaAgrupador: TipoReferenciaAgrupador): string {
    const sb = new StringBuilder();
    let pai = disp.pai;
    let primeiro = true;
    while (pai && !isDispositivoRaiz(pai) && !isArticulacao(pai)) {
      sb.append(' ');
      if (primeiro && tipoReferenciaAgrupador === TipoReferenciaAgrupador.ADICAO) {
        sb.append(pai.artigoDefinidoPrecedidoPreposicaoASingular);
      } else {
        sb.append(pai.pronomePossessivoSingular);
      }
      primeiro = false;
      sb.append(' ');
      sb.append(pai.getNumeracaoComRotuloParaComandoEmenda(pai));
      pai = pai.pai;
    }
    return sb.toString();
  }

  static getLocalizacaoAgrupadores(ranges: RangeDispositivos[]): string {
    const ultimoAgrupador = ranges[ranges.length - 1].getUltimo();
    const dispositivoSeguinte = getDispositivoPosteriorNaSequenciaDeLeitura(
      ultimoAgrupador,
      d => d.situacao.descricaoSituacao !== DescricaoSituacao.DISPOSITIVO_ADICIONADO && !isCaput(d) && !isArticulacaoAlteracao(d)
    );
    const sb = new StringBuilder();
    if (dispositivoSeguinte) {
      sb.append('antes ');
      sb.append(dispositivoSeguinte.pronomePossessivoSingular);
      sb.append(' ');
      sb.append(dispositivoSeguinte.getNumeracaoComRotuloParaComandoEmenda(dispositivoSeguinte));
      if (isAgrupadorNaoArticulacao(dispositivoSeguinte)) {
        sb.append(DispositivosWriterCmdEmd.getRotuloPaisAgrupador(dispositivoSeguinte, TipoReferenciaAgrupador.APENAS_ROTULO));
      }
    } else {
      const primeiroAgrupador = ranges[0].getPrimeiro();
      const dispositvoAnterior = getDispositivoAnteriorNaSequenciaDeLeitura(primeiroAgrupador, d => isArtigo(d) || isAgrupadorNaoArticulacao(d));
      if (dispositvoAnterior) {
        sb.append('após ');
        sb.append(dispositvoAnterior.artigoDefinido);
        sb.append(' ');
        sb.append(dispositvoAnterior.getNumeracaoComRotuloParaComandoEmenda(dispositvoAnterior));
        if (isAgrupadorNaoArticulacao(dispositvoAnterior)) {
          sb.append(DispositivosWriterCmdEmd.getRotuloPaisAgrupador(dispositvoAnterior, TipoReferenciaAgrupador.APENAS_ROTULO));
        }
      } else {
        sb.append('!!! localização não encontrada !!!');
      }
    }
    return sb.toString();
  }
}
