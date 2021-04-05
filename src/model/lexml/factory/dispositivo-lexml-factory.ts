/* eslint-disable indent */
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

  static createAlteracaoArtigo(artigo: Artigo): void {
    artigo.blocoAlteracao = new ArticulacaoLexml();
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
      }
    }

    dispositivo.uuid = Counter.next();
    dispositivo.name = name;
    dispositivo.pai = parent;
    return dispositivo;
  }

  static createFilhoByReferencia(referencia: Dispositivo): Dispositivo {
    if (isArtigo(referencia)) {
      return DispositivoLexmlFactory.createFilhoWhenReferenciaIsArtigo(referencia);
    } else if (isAgrupador(referencia)) {
      return DispositivoLexmlFactory.createFilhoWhenReferenciaIsAgrupador(referencia);
    }
    return DispositivoLexmlFactory.createFilhoWhenReferenciaDefault(referencia);
  }

  private static createFilhoWhenReferenciaDefault(referencia: Dispositivo): Dispositivo {
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

  private static createFilhoWhenReferenciaIsArtigo(referencia: Dispositivo): Dispositivo {
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

  private static createFilhoWhenReferenciaIsAgrupador(referencia: Dispositivo): Dispositivo {
    return referencia.filhos!.length > 0
      ? DispositivoLexmlFactory.create(TipoDispositivo.ARTIGO.tipo, referencia, undefined, 0)
      : DispositivoLexmlFactory.create(TipoDispositivo.ARTIGO.tipo, referencia);
  }
}
