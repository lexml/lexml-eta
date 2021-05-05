import { Artigo, Dispositivo } from '../../dispositivo/dispositivo';
import { isArtigo, isCaput, TipoDispositivo } from '../../dispositivo/tipo';
import { DispositivoLexmlFactory } from '../factory/dispositivo-lexml-factory';
import { getDispositivoAnterior } from '../hierarquia/hierarquia-util';

export const converteFilhos = (atual: Dispositivo, destino: Dispositivo): void => {
  if (destino.tipoProvavelFilho! === undefined) {
    return;
  }
  atual.filhos.forEach((filho, index) => {
    const novo = DispositivoLexmlFactory.create(
      destino.tipoProvavelFilho!,
      isArtigo(destino) && TipoDispositivo.inciso.name === destino.tipoProvavelFilho! ? (destino as Artigo).caput! : destino
    );
    novo.texto = filho.texto;
    filho.filhos ? converteFilhos(filho, novo) : undefined;
    index === atual.filhos.length - 1 ? destino.renumeraFilhos() : undefined;
  });
};

export const converteDispositivo = (atual: Dispositivo, action: any): Dispositivo => {
  const paiAtual = atual.pai;
  let novo: Dispositivo;
  let paiNovo: Dispositivo;

  switch (action.subType) {
    case 'transformaAlineaEmItem':
    case 'transformaIncisoEmAlinea':
    case 'transformaParagrafoEmInciso':
      paiNovo = getDispositivoAnterior(atual)!;
      novo = DispositivoLexmlFactory.create(action.novo.tipo, paiNovo);
      break;
    case 'transformaParagrafoEmIncisoCaput':
      paiNovo = paiAtual!;
      novo = DispositivoLexmlFactory.create(action.novo.tipo, (paiNovo as Artigo).caput!);
      break;
    case 'transformaArtigoEmParagrafo':
      paiNovo = getDispositivoAnterior(atual)!;
      novo = DispositivoLexmlFactory.create(action.novo.tipo, paiNovo);
      novo.pai?.renumeraFilhos();
      break;
    default:
      paiNovo = atual.pai!.pai!;
      novo = DispositivoLexmlFactory.create(action.novo.tipo, paiNovo, atual.pai!);
      break;
  }
  novo!.texto = action.atual.conteudo?.texto ?? atual.texto;

  paiAtual?.removeFilho(atual);
  paiAtual?.renumeraFilhos();
  paiNovo?.renumeraFilhos();
  converteFilhos(atual, novo!);

  return novo!;
};

export const copiaFilhos = (atual: Dispositivo, destino: Dispositivo): void => {
  if (atual.tipo !== destino.tipo) {
    return;
  }
  atual.filhos.forEach(filho => {
    const novo = DispositivoLexmlFactory.create(filho.tipo, isArtigo(destino) && isCaput(filho.pai!) ? (destino as Artigo).caput! : destino);
    novo.texto = filho.texto;
    atual.removeFilho(filho);
    filho.filhos ? converteFilhos(filho, novo) : undefined;

    atual.filhos.length === 0 ? destino.renumeraFilhos() : undefined;
  });
};
