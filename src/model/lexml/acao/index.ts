import { adicionarAgrupadorArtigoAction, adicionarAgrupadorArtigoAntesAction } from './adicionarAgrupadorArtigoAction';
import { atualizarNotaAlteracaoAction } from './atualizarNotaAlteracaoAction';
import { Referencia } from '../../elemento';
import {
  adicionarAlinea,
  adicionarAlineaAntes,
  adicionarAlineaDepois,
  adicionarArtigo,
  adicionarArtigoAntes,
  adicionarArtigoDepois,
  adicionarElementoAction,
  adicionarInciso,
  adicionarIncisoAntes,
  adicionarIncisoDepois,
  adicionarItem,
  adicionarItemAntes,
  adicionarItemDepois,
  adicionarParagrafo,
  adicionarParagrafoAntes,
  adicionarParagrafoDepois,
} from './adicionarElementoAction';
import { adicionarCapitulo, adicionarLivro, adicionarParte, adicionarSecao, adicionarSubsecao, adicionarTitulo, AgruparElemento } from './agruparElementoAction';
import { finalizarBlocoAlteracao, iniciarBlocoAlteracao } from './blocoAlteracaoAction';
import { InformarDadosAssistenteAction } from './informarDadosAssistenteAction';
import { considerarElementoExistenteNaNorma, considerarElementoNovoNaNorma } from './informarExistenciaDoElementoNaNormaAction';
import { informarNormaAction } from './informarNormaAction';
import { moverElementoAbaixoAction } from './moverElementoAbaixoAction';
import { moverElementoAcimaAction } from './moverElementoAcimaAction';
import { removerElementoAction } from './removerElementoAction';
import { renumerarElementoAction } from './renumerarElementoAction';
import { restaurarElementoAction } from './restaurarElemento';
import { suprimirAgrupadorAction } from './suprimirAgrupador';
import { suprimirElementoAction } from './suprimirElemento';
import {
  transformaAlineaEmItem,
  transformarAlineaEmIncisoCaput,
  transformarAlineaEmIncisoParagrafo,
  transformarArtigoEmParagrafo,
  transformarEmOmissisAlinea,
  transformarEmOmissisIncisoCaput,
  transformarEmOmissisIncisoParagrafo,
  transformarEmOmissisItem,
  transformarEmOmissisParagrafo,
  transformarGenericoEmAlinea,
  transformarGenericoEmInciso,
  transformarGenericoEmItem,
  transformarIncisoCaputEmAlinea,
  transformarIncisoCaputEmParagrafo,
  transformarIncisoParagrafoEmAlinea,
  transformarIncisoParagrafoEmParagrafo,
  transformarItemEmAlinea,
  transformarOmissisEmAlinea,
  transformarOmissisEmArtigo,
  transformarOmissisEmIncisoCaput,
  transformarOmissisEmIncisoParagrafo,
  transformarOmissisEmItem,
  transformarOmissisEmParagrafo,
  transformarParagrafoEmArtigo,
  transformarParagrafoEmIncisoCaput,
  transformarParagrafoEmIncisoParagrafo,
} from './transformarElementoAction';
import { validarArticulacaAction } from './validarArticulacaoAction';
import { validarElementoAction } from './validarElementoAction';
import { adicionarTextoOmissisAction } from './adicionarTextoOmissisAction';
import { removerTextoOmissisAction } from './removerTextoOmissisAction';

export interface ElementoAction {
  descricao?: string;
  tipo?: string;
  hotkey?: string;
  execute(atual: Referencia, conteudo?: string, novo?: Referencia, ...outros: any): any;
}

export const acoesMenu: ElementoAction[] = [];

acoesMenu.push(informarNormaAction);
acoesMenu.push(InformarDadosAssistenteAction);
acoesMenu.push(considerarElementoExistenteNaNorma);
acoesMenu.push(considerarElementoNovoNaNorma);
acoesMenu.push(atualizarNotaAlteracaoAction);
acoesMenu.push(moverElementoAbaixoAction);
acoesMenu.push(moverElementoAcimaAction);
acoesMenu.push(renumerarElementoAction);
acoesMenu.push(iniciarBlocoAlteracao);
acoesMenu.push(finalizarBlocoAlteracao);
acoesMenu.push(transformarEmOmissisAlinea);
acoesMenu.push(transformarEmOmissisIncisoCaput);
acoesMenu.push(transformarEmOmissisItem);
acoesMenu.push(transformarEmOmissisParagrafo);
acoesMenu.push(transformarEmOmissisIncisoParagrafo);

acoesMenu.push(transformarAlineaEmIncisoCaput);
acoesMenu.push(transformarAlineaEmIncisoParagrafo);
acoesMenu.push(transformaAlineaEmItem);
acoesMenu.push(transformarArtigoEmParagrafo);
acoesMenu.push(transformarGenericoEmInciso);
acoesMenu.push(transformarGenericoEmAlinea);
acoesMenu.push(transformarGenericoEmItem);
acoesMenu.push(transformarIncisoParagrafoEmAlinea);
acoesMenu.push(transformarIncisoParagrafoEmParagrafo);
acoesMenu.push(transformarItemEmAlinea);
acoesMenu.push(transformarIncisoCaputEmParagrafo);
acoesMenu.push(transformarIncisoCaputEmAlinea);

acoesMenu.push(transformarOmissisEmAlinea);
acoesMenu.push(transformarOmissisEmArtigo);
acoesMenu.push(transformarOmissisEmIncisoCaput);
acoesMenu.push(transformarOmissisEmIncisoParagrafo);
acoesMenu.push(transformarOmissisEmItem);
acoesMenu.push(transformarOmissisEmParagrafo);
acoesMenu.push(transformarParagrafoEmArtigo);
acoesMenu.push(transformarParagrafoEmIncisoParagrafo);
acoesMenu.push(transformarParagrafoEmIncisoCaput);
acoesMenu.push(removerElementoAction);
acoesMenu.push(restaurarElementoAction);
acoesMenu.push(suprimirElementoAction);
acoesMenu.push(suprimirAgrupadorAction);
acoesMenu.push(validarElementoAction);
acoesMenu.push(adicionarParte);
acoesMenu.push(adicionarLivro);
acoesMenu.push(adicionarTitulo);
acoesMenu.push(adicionarCapitulo);
acoesMenu.push(adicionarSecao);
acoesMenu.push(adicionarSubsecao);

acoesMenu.push(adicionarArtigoAntes);
acoesMenu.push(adicionarArtigoDepois);
acoesMenu.push(adicionarInciso);
acoesMenu.push(adicionarIncisoAntes);
acoesMenu.push(adicionarIncisoDepois);
acoesMenu.push(adicionarAlinea);
acoesMenu.push(adicionarAlineaAntes);
acoesMenu.push(adicionarAlineaDepois);
acoesMenu.push(adicionarItem);
acoesMenu.push(adicionarItemAntes);
acoesMenu.push(adicionarItemDepois);
acoesMenu.push(adicionarParagrafo);
acoesMenu.push(adicionarParagrafoAntes);
acoesMenu.push(adicionarParagrafoDepois);

acoesMenu.push(adicionarAgrupadorArtigoAction);
acoesMenu.push(adicionarAgrupadorArtigoAntesAction);
acoesMenu.push(adicionarTextoOmissisAction);
acoesMenu.push(removerTextoOmissisAction);

export const acoesExclusivasEdicao: ElementoAction[] = [];
acoesExclusivasEdicao.push(adicionarElementoAction);
acoesExclusivasEdicao.push(adicionarArtigo);

export const isAcaoMenu = (acao: ElementoAction): boolean => {
  return acoesMenu.includes(acao);
};

export const acoesDisponiveis = [...acoesMenu, ...acoesExclusivasEdicao, validarArticulacaAction];

export const getAcao = (descricao: string): ElementoAction => {
  return acoesDisponiveis.filter(acao => acao.descricao === descricao.trim())[0];
};

export const getAcaoAgrupamento = (tipo: string): ElementoAction => {
  return acoesDisponiveis.filter(acao => acao instanceof AgruparElemento && acao.tipo === tipo)[0];
};
