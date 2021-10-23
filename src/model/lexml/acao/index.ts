import { Referencia } from '../../elemento';
import { adicionarAlinea, adicionarArtigo, adicionarElementoAction, adicionarInciso, adicionarItem, adicionarParagrafo } from './adicionarElementoAction';
import { adicionarCapitulo, adicionarLivro, adicionarParte, adicionarSecao, adicionarSubsecao, adicionarTitulo, AgruparElemento } from './agruparElementoAction';
import { finalizarBlocoAlteracao, iniciarBlocoAlteracao } from './blocoAlteracaoAction';
import { moverElementoAbaixoAction } from './moverElementoAbaixoAction';
import { moverElementoAcimaAction } from './moverElementoAcimaAction';
import { removerElementoAction } from './removerElementoAction';
import { renumerarElementoAction } from './renumerarElementoAction';
import { restaurarElementoAction } from './restaurarElemento';
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
  transformarIncisoCaputEmParagrafo,
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

export interface ElementoAction {
  descricao?: string;
  tipo?: string;
  execute(atual: Referencia, conteudo?: string, novo?: Referencia): any;
}

export const acoesMenu: ElementoAction[] = [];

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
acoesMenu.push(transformarIncisoParagrafoEmParagrafo);
acoesMenu.push(transformarItemEmAlinea);
acoesMenu.push(transformarIncisoCaputEmParagrafo);
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
acoesMenu.push(validarElementoAction);
acoesMenu.push(adicionarParte);
acoesMenu.push(adicionarLivro);
acoesMenu.push(adicionarTitulo);
acoesMenu.push(adicionarCapitulo);
acoesMenu.push(adicionarSecao);
acoesMenu.push(adicionarSubsecao);

export const acoesExclusivasEdicao: ElementoAction[] = [];
acoesExclusivasEdicao.push(adicionarElementoAction);
acoesExclusivasEdicao.push(adicionarArtigo);
acoesExclusivasEdicao.push(adicionarAlinea);
acoesExclusivasEdicao.push(adicionarInciso);
acoesExclusivasEdicao.push(adicionarItem);
acoesExclusivasEdicao.push(adicionarParagrafo);

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
