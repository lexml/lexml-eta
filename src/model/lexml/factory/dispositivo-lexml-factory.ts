/* eslint-disable indent */
import { isDispositivoAlteracao } from '../../../redux/elemento-reducer-util';
import { Counter } from '../../../util/counter';
import { Articulacao, Artigo, Dispositivo } from '../../dispositivo/dispositivo';
import { isAgrupador, isArtigo, isIncisoCaput, isParagrafo, TipoDispositivo } from '../../dispositivo/tipo';
import { hasIndicativoDesdobramento, hasIndicativoFinalSequencia } from '../conteudo/conteudo-util';
import {
  AlineaLexml,
  ArticulacaoLexml,
  ArtigoLexml,
  CapituloLexml,
  CaputLexml,
  DispositivoAgrupadorGenericoLexml,
  DispositivoGenericoLexml,
  IncisoLexml,
  ItemLexml,
  LivroLexml,
  OmissisLexml,
  ParagrafoLexml,
  ParteLexml,
  SecaoLexml,
  SubsecaoLexml,
  TituloLexml,
} from '../dispositivo/dispositivo-lexml';
import { getArticulacao } from '../hierarquia/hierarquia-util';
import { TipoMensagem } from '../util/mensagem';

export class DispositivoLexmlFactory {
  static createArticulacao(): Articulacao {
    return new ArticulacaoLexml();
  }

  static create(tipo: string, parent: Dispositivo, referencia?: Dispositivo, posicao?: number): Dispositivo {
    const dispositivo = DispositivoLexmlFactory.createDispositivo(tipo, parent);
    posicao !== undefined && posicao >= 0
      ? parent!.addFilhoOnPosition(dispositivo, posicao)
      : referencia
      ? parent!.addFilho(dispositivo, referencia)
      : parent!.addFilho(dispositivo);

    return dispositivo;
  }

  static createAlteracao(atual: Artigo): void {
    const articulacao = new ArticulacaoLexml();
    articulacao.pai = atual;
    const alteracao = this.createArticulacao();
    alteracao.pai = atual;
    atual.addAlteracao(alteracao);
  }

  private static desativaRotuloAutomaticoSeDispositivoAlteracao(dispositivo: Dispositivo): void {
    dispositivo.isDispositivoAlteracao = isDispositivoAlteracao(dispositivo);

    if (isDispositivoAlteracao(dispositivo)) {
      dispositivo.renumeraFilhos = (): void => {
        dispositivo.filhos?.forEach(f => f.createRotulo(f));
      };
      if (isArtigo(dispositivo)) {
        (dispositivo as Artigo).caput!.renumeraFilhos = (): void => {
          dispositivo.filhos?.forEach(f => f.createRotulo(f));
        };
      }
      getArticulacao(dispositivo).renumeraFilhos = (): void => {
        getArticulacao(dispositivo)?.filhos?.forEach(f => f.createRotulo(f));
      };
      getArticulacao(dispositivo).renumeraArtigos = (): void => {
        getArticulacao(dispositivo)?.filhos?.forEach(f => f.createRotulo(f));
      };
    }
  }

  private static createDispositivo(name: string, parent: Dispositivo): Dispositivo {
    let dispositivo: Dispositivo;

    switch (name.toLowerCase()) {
      case 'alinea':
        dispositivo = new AlineaLexml(name.toLowerCase());
        break;
      case 'artigo':
        dispositivo = new ArtigoLexml();
        (dispositivo as Artigo).caput = DispositivoLexmlFactory.createDispositivo(TipoDispositivo.caput.tipo, dispositivo);
        break;
      case 'capitulo':
        dispositivo = new CapituloLexml(name.toLowerCase());
        break;
      case 'caput':
        dispositivo = new CaputLexml(name.toLowerCase());
        break;
      case 'inciso':
        dispositivo = new IncisoLexml(name.toLowerCase());
        break;
      case 'item':
        dispositivo = new ItemLexml(name.toLowerCase());
        break;
      case 'livro':
        dispositivo = new LivroLexml(name.toLowerCase());
        break;
      case 'omissis':
        dispositivo = new OmissisLexml(name.toLowerCase());
        break;
      case 'paragrafo':
        dispositivo = new ParagrafoLexml(name.toLowerCase());
        break;
      case 'parte':
        dispositivo = new ParteLexml(name.toLowerCase());
        break;
      case 'secao':
        dispositivo = new SecaoLexml(name.toLowerCase());
        break;
      case 'subsecao':
        dispositivo = new SubsecaoLexml(name.toLowerCase());
        break;
      case 'titulo':
        dispositivo = new TituloLexml(name.toLowerCase());
        break;
      default: {
        dispositivo = parent && isAgrupador(parent) ? new DispositivoAgrupadorGenericoLexml('agrupadorGenerico') : new DispositivoGenericoLexml('generico');
        dispositivo.mensagens = [];
        dispositivo.mensagens.push({ tipo: TipoMensagem.WARNING, descricao: 'Não foi possível validar a natureza deste dispositivo com base na legislação vigente' });
      }
    }

    dispositivo.uuid = Counter.next();
    dispositivo.name = name;
    dispositivo.pai = parent;

    DispositivoLexmlFactory.desativaRotuloAutomaticoSeDispositivoAlteracao(dispositivo);

    return dispositivo;
  }

  static createFromReferencia(referencia: Dispositivo): Dispositivo {
    if (referencia.hasAlteracao()) {
      return DispositivoLexmlFactory.createWhenReferenciaBlocoAlteracao(referencia);
    }
    if (isArtigo(referencia)) {
      return DispositivoLexmlFactory.createWhenReferenciaIsArtigo(referencia);
    }
    if (isAgrupador(referencia)) {
      return DispositivoLexmlFactory.createWhenReferenciaIsAgrupador(referencia);
    }
    return isDispositivoAlteracao(referencia)
      ? DispositivoLexmlFactory.create(referencia.tipo, referencia.pai!, referencia)
      : DispositivoLexmlFactory.createFromReferenciaDefault(referencia);
  }

  private static createWhenReferenciaBlocoAlteracao(referencia: Dispositivo): Dispositivo {
    if (referencia.pai!.isLastFilho(referencia) && referencia?.pai?.pai) {
      return DispositivoLexmlFactory.create(referencia.pai.tipo, referencia.pai.pai, referencia.pai);
    }
    return DispositivoLexmlFactory.create(referencia.tipo, referencia.pai!, referencia);
  }

  private static createFromReferenciaDefault(referencia: Dispositivo): Dispositivo {
    if (hasIndicativoDesdobramento(referencia)) {
      const type = referencia.tipoProvavelFilho!;
      return referencia.pai!.filhos!.length > 0 ? DispositivoLexmlFactory.create(type, referencia, undefined, 0) : DispositivoLexmlFactory.create(type, referencia);
    }
    if (hasIndicativoFinalSequencia(referencia) && referencia.pai!.isLastFilho(referencia)) {
      if (isIncisoCaput(referencia)) {
        const artigo: Artigo = referencia.pai!.pai! as Artigo;
        return artigo!.filhos!.filter(filho => isParagrafo(filho)).length > 0
          ? DispositivoLexmlFactory.create(TipoDispositivo.paragrafo.tipo, artigo!, undefined, 0)
          : DispositivoLexmlFactory.create(TipoDispositivo.paragrafo.tipo, artigo);
      } else {
        return DispositivoLexmlFactory.create(referencia.pai!.tipo, referencia!.pai!.pai!, referencia!.pai!);
      }
    }
    return DispositivoLexmlFactory.create(referencia.tipo, referencia.pai!, referencia);
  }

  private static createWhenReferenciaIsArtigo(referencia: Dispositivo): Dispositivo {
    if (hasIndicativoDesdobramento(referencia)) {
      const type = referencia.tipoProvavelFilho!;

      if (type === TipoDispositivo.inciso.tipo) {
        const parent = (referencia as Artigo).caput;
        return parent!.filhos!.length > 0 ? DispositivoLexmlFactory.create(type, parent!, undefined, 0) : DispositivoLexmlFactory.create(type, parent!);
      }
      return referencia.pai!.filhos!.length > 0 ? DispositivoLexmlFactory.create(type, referencia, undefined, 0) : DispositivoLexmlFactory.create(type, referencia);
    }

    if (hasIndicativoFinalSequencia(referencia) && referencia.pai!.isLastFilho(referencia)) {
      return DispositivoLexmlFactory.create(referencia.pai!.tipo, referencia!.pai!.pai!, referencia!.pai!);
    }
    return DispositivoLexmlFactory.create(referencia.tipo, referencia.pai!, referencia);
  }

  private static createWhenReferenciaIsAgrupador(referencia: Dispositivo): Dispositivo {
    return referencia.filhos!.length > 0
      ? DispositivoLexmlFactory.create(TipoDispositivo.ARTIGO.tipo, referencia, undefined, 0)
      : DispositivoLexmlFactory.create(TipoDispositivo.ARTIGO.tipo, referencia);
  }
}
