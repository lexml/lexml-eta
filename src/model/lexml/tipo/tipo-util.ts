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
      isArtigo(destino) && TipoDispositivo.inciso.name === destino.tipoProvavelFilho! ? (destino as Artigo).caput! : destino,
      destino.tipoProvavelFilho!
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
    case 'transformarAlineaEmItem':
    case 'transformarIncisoEmAlinea':
    case 'transformarParagrafoEmIncisoParagrafo':
      paiNovo = getDispositivoAnterior(atual)!;
      novo = DispositivoLexmlFactory.create(paiNovo, action.novo.tipo);
      break;
    case 'transformarDispositivoGenericoEmInciso':
    case 'transformarDispositivoGenericoEmAlinea':
    case 'transformarDispositivoGenericoEmItem':
    case 'transformarOmissisEmAlinea':
    case 'transformarOmissisEmArtigo':
    case 'transformarOmissisEmIncisoParagrafo':
    case 'transformarOmissisEmItem':
    case 'transformarOmissisEmParagrafo':
    case 'transformarEmOmissisAlinea':
    case 'transformarEmOmissisItem':
    case 'transformarEmOmissisParagrafo':
    case 'transformarEmOmissisIncisoParagrafo':
      paiNovo = paiAtual!;
      novo = DispositivoLexmlFactory.create(paiAtual!, action.novo.tipo, undefined, paiAtual?.indexOf(atual));
      break;
    case 'transformarOmissisEmIncisoCaput':
    case 'transformarParagrafoEmIncisoCaput':
      paiNovo = paiAtual!;
      novo = DispositivoLexmlFactory.create((paiNovo as Artigo).caput!, action.novo.tipo);
      break;
    case 'transformarArtigoEmParagrafo':
      paiNovo = getDispositivoAnterior(atual)!;
      novo = DispositivoLexmlFactory.create(paiNovo, action.novo.tipo);
      break;
    default:
      paiNovo = atual.pai!.pai!;
      novo = DispositivoLexmlFactory.create(paiNovo, action.novo.tipo, atual.pai!);
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
    const novo = DispositivoLexmlFactory.create(isArtigo(destino) && isCaput(filho.pai!) ? (destino as Artigo).caput! : destino, filho.tipo);
    novo.texto = filho.texto;
    atual.removeFilho(filho);
    filho.filhos ? converteFilhos(filho, novo) : undefined;

    atual.filhos.length === 0 ? destino.renumeraFilhos() : undefined;
  });
};
