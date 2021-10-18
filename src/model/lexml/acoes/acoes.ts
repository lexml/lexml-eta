import { Tipo } from '../../dispositivo/tipo';
import { Elemento, Referencia } from '../../elemento';
import { TipoDispositivo } from '../tipo/tipoDispositivo';

export const ABRIR_ARTICULACAO = 'ABRIR_ARTICULACAO';
export const ADICIONAR_ELEMENTO = 'ADICIONAR_ELEMENTO';
export const ATUALIZAR_ELEMENTO = 'ATUALIZAR_ELEMENTO';
export const AGRUPAR_ELEMENTO = 'AGRUPAR_ELEMENTO';
export const INICIAR_BLOCO = 'INICIAR_BLOCO';
export const FINALIZAR_BLOCO = 'FINALIZAR_BLOCO';
export const TRANSFORMAR_TIPO_ELEMENTO = 'TRANSFORMAR_TIPO_ELEMENTO';
export const MOVER_ELEMENTO_ABAIXO = 'MOVER_ELEMENTO_ABAIXO';
export const MOVER_ELEMENTO_ACIMA = 'MOVER_ELEMENTO_ACIMA';
export const NOVA_ARTICULACAO = 'NOVA_ARTICULACAO';
export const RENUMERAR_ELEMENTO = 'RENUMERAR_ELEMENTO';
export const REMOVER_ELEMENTO = 'REMOVER_ELEMENTO';
export const VALIDAR_ARTICULACAO = 'VALIDAR_ARTICULACAO';
export const VALIDAR_ELEMENTO = 'VALIDAR_ELEMENTO';

export const ELEMENTO_SELECIONADO = 'ELEMENTO_SELECIONADO';

export const TAB = 'TAB';
export const SHIFT_TAB = 'SHIFT_TAB';

export const UNDO = 'UNDO';
export const REDO = 'REDO';

export interface ElementoAction {
  descricao?: string;
  tipo?: string;
  execute(atual: Referencia, conteudo?: string, novo?: Referencia): any;
}

abstract class ElementoAbstractAction implements ElementoAction {
  descricao?: string;
  tipo?: string;
  abstract execute(atual: Referencia, conteudo?: string, novo?: Referencia): any;
}

class AddElemento extends ElementoAbstractAction {
  descricao: string;
  tipo?: string;
  isDispositivoAlteracao = false;
  constructor(tipo?: Tipo) {
    super();
    this.descricao = `Adicionar ${tipo?.descricao ?? ''}`;
    this.tipo = tipo?.tipo;
  }

  execute(atual: Referencia, conteudo?: string, tipo?: Referencia, hasDesmembramento = false): any {
    return {
      type: ADICIONAR_ELEMENTO,
      atual,
      novo: {
        tipo,
        isDispositivoAlteracao: this.isDispositivoAlteracao,
        conteudo: {
          texto: conteudo,
        },
      },
      hasDesmembramento,
    };
  }
}

export class agrupaElemento extends ElementoAbstractAction {
  descricao: string;
  tipo: string;

  constructor(tipo: Tipo) {
    super();
    this.descricao = 'Adicionar ' + tipo.descricao;
    this.tipo = tipo.tipo;
  }

  execute(atual: Referencia): any {
    return {
      type: AGRUPAR_ELEMENTO,
      atual,
      novo: {
        tipo: this.tipo,
      },
    };
  }
}

class BlocoAlteracao extends AddElemento {
  isDispositivoAlteracao = true;
  constructor(private tipoAcao: string) {
    super();
    this.descricao = tipoAcao === INICIAR_BLOCO ? `Inserir bloco de alteração` : `Finalizar bloco de alteração`;
  }

  execute(atual: Referencia, conteudo?: string, tipo?: Referencia, hasDesmembramento = false): any {
    return {
      type: ADICIONAR_ELEMENTO,
      subType: this.tipoAcao,
      atual,
      novo: {
        tipo,
        isDispositivoAlteracao: this.isDispositivoAlteracao,
        conteudo: {
          texto: conteudo,
        },
      },
      hasDesmembramento,
    };
  }
}

export class TransformarElemento extends ElementoAbstractAction {
  descricao: string;
  tipo: string;
  nomeAcao?: string;

  constructor(tipo: Tipo, descricao: string, nomeAcao: string) {
    super();
    this.descricao = descricao;
    this.tipo = tipo.tipo;
    this.nomeAcao = nomeAcao;
  }

  execute(atual: Referencia): any {
    return {
      type: TRANSFORMAR_TIPO_ELEMENTO,
      subType: this.nomeAcao,
      atual,
      novo: {
        tipo: this.tipo,
      },
    };
  }
}

export const transformar = (elemento: Elemento, novoTipo: string): any => {
  const action = new TransformarElemento(
    TipoDispositivo[novoTipo.toLowerCase()],
    'Transformar ' + elemento.tipo + 'em ' + TipoDispositivo[novoTipo.toLowerCase()].name,
    'transformar' + elemento.tipo + 'Em' + TipoDispositivo[novoTipo.toLowerCase()].name
  );

  return action.execute(elemento);
};

class RemoverElemento extends ElementoAbstractAction {
  constructor() {
    super();
    this.descricao = 'Remover dispositivo';
  }

  execute(atual: Referencia): any {
    return {
      type: REMOVER_ELEMENTO,
      atual,
    };
  }
}

class ElementoSelecionado extends ElementoAbstractAction {
  constructor() {
    super();
    this.descricao = 'Elemento selecionado';
  }

  execute(atual: Referencia): any {
    return {
      type: ELEMENTO_SELECIONADO,
      atual,
    };
  }
}

class ValidarArticulacao extends ElementoAbstractAction {
  constructor() {
    super();
    this.descricao = 'Articulação validada';
  }

  execute(): any {
    return {
      type: VALIDAR_ARTICULACAO,
    };
  }
}
class ValidarElemento extends ElementoAbstractAction {
  constructor() {
    super();
    this.descricao = 'Elemento validado';
  }

  execute(atual: Referencia): any {
    return {
      type: VALIDAR_ELEMENTO,
      atual,
    };
  }
}

class AtualizarElemento extends ElementoAbstractAction {
  constructor() {
    super();
    this.descricao = 'Atualizar dispositivo';
  }

  execute(atual: Referencia): any {
    this.tipo = atual.tipo;
    return {
      type: ATUALIZAR_ELEMENTO,
      atual,
    };
  }
}

class MoverElementoAbaixo extends ElementoAbstractAction {
  constructor() {
    super();
    this.descricao = 'Mover para baixo';
  }

  execute(atual: Referencia): any {
    return {
      type: MOVER_ELEMENTO_ABAIXO,
      atual,
    };
  }
}

class MoverElementoAcima extends ElementoAbstractAction {
  constructor() {
    super();
    this.descricao = 'Mover para cima';
  }

  execute(atual: Referencia): any {
    return {
      type: MOVER_ELEMENTO_ACIMA,
      atual,
    };
  }
}

export class RenumerarElemento extends ElementoAbstractAction {
  constructor() {
    super();
    this.descricao = 'Numerar e criar rótulo para o dispositivo ';
  }

  execute(atual: Referencia, numero: string): any {
    this.tipo = atual.tipo;
    return {
      type: RENUMERAR_ELEMENTO,
      atual,
      novo: {
        numero,
      },
    };
  }
}

export const shiftTabAction = (atual: Referencia): any => {
  return {
    type: SHIFT_TAB,
    atual,
  };
};

export const tabAction = (atual: Referencia): any => {
  return {
    type: TAB,
    atual,
  };
};

export const UndoAction = (): any => {
  return {
    type: UNDO,
  };
};

export const RedoAction = (): any => {
  return {
    type: REDO,
  };
};

export const openArticulacaoAction = (articulacao: any): any => {
  return {
    type: ABRIR_ARTICULACAO,
    articulacao,
  };
};

export const novaArticulacaoAction = (): any => {
  return {
    type: NOVA_ARTICULACAO,
  };
};

export const adicionarArtigo = new AddElemento(TipoDispositivo.artigo);
export const adicionarAlinea = new AddElemento(TipoDispositivo.alinea);
export const adicionarInciso = new AddElemento(TipoDispositivo.inciso);
export const adicionarItem = new AddElemento(TipoDispositivo.item);
export const omissis = new AddElemento(TipoDispositivo.omissis);
export const adicionarParagrafo = new AddElemento(TipoDispositivo.paragrafo);

export const adicionarParte = new agrupaElemento(TipoDispositivo.parte);
export const adicionarLivro = new agrupaElemento(TipoDispositivo.livro);
export const adicionarTitulo = new agrupaElemento(TipoDispositivo.titulo);
export const adicionarCapitulo = new agrupaElemento(TipoDispositivo.capitulo);
export const adicionarSecao = new agrupaElemento(TipoDispositivo.secao);
export const adicionarSubsecao = new agrupaElemento(TipoDispositivo.subsecao);

export const moverElementoAbaixo = new MoverElementoAbaixo();
export const moverElementoAcima = new MoverElementoAcima();

export const renumerarElemento = new RenumerarElemento();

export const iniciarBlocoAlteracao = new BlocoAlteracao(INICIAR_BLOCO);
export const finalizarBlocoAlteracao = new BlocoAlteracao(FINALIZAR_BLOCO);

export const transformarEmOmissisAlinea = new TransformarElemento(TipoDispositivo.omissis, 'Transformar em Omissis de Alínea', 'transformarAlineaEmOmissisAlinea');
export const transformarEmOmissisIncisoCaput = new TransformarElemento(
  TipoDispositivo.omissis,
  'Transformar em Omissis de Inciso de Caput',
  'transformarIncisoCaputEmOmissisIncisoCaput'
);
export const transformarEmOmissisItem = new TransformarElemento(TipoDispositivo.omissis, 'Transformar em Omissis de Item', 'transformarItemEmOmissisItem');
export const transformarEmOmissisParagrafo = new TransformarElemento(TipoDispositivo.omissis, 'Transformar em Omissis de Parágrafo', 'transformarParagrafoEmOmissisParagrafo');
export const transformarEmOmissisIncisoParagrafo = new TransformarElemento(
  TipoDispositivo.omissis,
  'Transformar em Omissis de Inciso de Parágrafo',
  'transformarIncisoParagrafoEmOmissisIncisoParagrafo'
);

export const transformarAlineaEmIncisoCaput = new TransformarElemento(TipoDispositivo.inciso, 'Transformar Alínea em Inciso', 'transformarAlineaEmIncisoCaput');
export const transformarAlineaEmIncisoParagrafo = new TransformarElemento(TipoDispositivo.inciso, 'Transformar Alínea em Inciso', 'transformarAlineaEmIncisoParagrafo');
export const transformaAlineaEmItem = new TransformarElemento(TipoDispositivo.item, 'Transformar Alínea em Item', 'transformarAlineaEmItem');
export const transformarArtigoEmParagrafo = new TransformarElemento(TipoDispositivo.paragrafo, 'Transformar Artigo em Parágrafo', 'transformarArtigoEmParagrafo');
export const transformarGenericoEmInciso = new TransformarElemento(TipoDispositivo.inciso, 'Transformar em Inciso', 'transformarDispositivoGenericoEmInciso');
export const transformarGenericoEmAlinea = new TransformarElemento(TipoDispositivo.alinea, 'Transformar em Alínea', 'transformarDispositivoGenericoEmAlinea');
export const transformarGenericoEmItem = new TransformarElemento(TipoDispositivo.item, 'Transformar em Item', 'transformarDispositivoGenericoEmItem');
export const transformarIncisoParagrafoEmParagrafo = new TransformarElemento(TipoDispositivo.paragrafo, 'Transformar Inciso em Parágrafo', 'transformarIncisoParagrafoEmParagrafo');
export const transformarIncisoCaputEmParagrafo = new TransformarElemento(TipoDispositivo.paragrafo, 'Transformar Inciso Caput em Parágrafo', 'transformarIncisoCaputEmParagrafo');
export const transformarIncisoCaputEmAlinea = new TransformarElemento(TipoDispositivo.alinea, 'Transformar Inciso de Caput em Alínea', 'transformarIncisoCaputEmAlinea');
export const transformarIncisoParagrafoEmAlinea = new TransformarElemento(TipoDispositivo.alinea, 'Transformar Inciso de Caput em Alínea', 'transformarIncisoParagrafoEmAlinea');

export const transformarOmissisEmAlinea = new TransformarElemento(TipoDispositivo.alinea, 'Transformar Omissis em Alínea', 'transformarOmissisEmAlinea');
export const transformarOmissisEmArtigo = new TransformarElemento(TipoDispositivo.artigo, 'Transformar Omissis em Artigo', 'transformarOmissisEmArtigo');
export const transformarOmissisEmIncisoCaput = new TransformarElemento(TipoDispositivo.inciso, 'Transformar Omissis em Inciso de Caput', 'transformarOmissisEmIncisoCaput');
export const transformarOmissisEmIncisoParagrafo = new TransformarElemento(
  TipoDispositivo.inciso,
  'Transformar Omissis em Inciso de Parágrafo',
  'transformarOmissisEmIncisoParagrafo'
);
export const transformarOmissisEmItem = new TransformarElemento(TipoDispositivo.item, 'Transformar Omissis em Item', 'transformarOmissisEmItem');
export const transformarOmissisEmParagrafo = new TransformarElemento(TipoDispositivo.paragrafo, 'Transformar Omissis em Parágrafo', 'transformarOmissisEmParagrafo');

export const transformarItemEmAlinea = new TransformarElemento(TipoDispositivo.alinea, 'Transformar Item em Alínea', 'transformarItemEmAlinea');
export const transformarParagrafoEmArtigo = new TransformarElemento(TipoDispositivo.artigo, 'Transformar Parágrafo em Artigo', 'transformarParagrafoEmArtigo');
export const transformarParagrafoEmIncisoParagrafo = new TransformarElemento(
  TipoDispositivo.inciso,
  'Transformar Parágrafo em Inciso de Parágrafo',
  'transformarParagrafoEmIncisoParagrafo'
);
export const transformarParagrafoEmIncisoCaput = new TransformarElemento(TipoDispositivo.inciso, 'Transformar Parágrafo em Inciso de Caput', 'transformarParagrafoEmIncisoCaput');

export const elementoSelecionadoAction = new ElementoSelecionado();

export const adicionarElementoAction = new AddElemento();
export const removerElementoAction = new RemoverElemento();
export const atualizarElementoAction = new AtualizarElemento();
export const validarElementoAction = new ValidarElemento();
export const validarArticulacaAction = new ValidarArticulacao();

export const acoesPossiveisDispositivo = [adicionarElementoAction, removerElementoAction, atualizarElementoAction];

const acoesMenu: ElementoAction[] = [];

acoesMenu.push(moverElementoAbaixo);
acoesMenu.push(moverElementoAcima);
acoesMenu.push(renumerarElemento);
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
acoesMenu.push(validarElementoAction);
acoesMenu.push(adicionarParte);
acoesMenu.push(adicionarLivro);
acoesMenu.push(adicionarTitulo);
acoesMenu.push(adicionarCapitulo);
acoesMenu.push(adicionarSecao);
acoesMenu.push(adicionarSubsecao);

const acoesExclusivasEdicao: ElementoAction[] = [];
acoesExclusivasEdicao.push(adicionarElementoAction);
acoesExclusivasEdicao.push(atualizarElementoAction);
acoesExclusivasEdicao.push(adicionarArtigo);
acoesExclusivasEdicao.push(adicionarAlinea);
acoesExclusivasEdicao.push(adicionarInciso);
acoesExclusivasEdicao.push(adicionarItem);
acoesExclusivasEdicao.push(adicionarParagrafo);

export const acoesDisponiveis = [...acoesMenu, ...acoesExclusivasEdicao, validarArticulacaAction];

export const getAcao = (descricao: string): ElementoAction => {
  return acoesDisponiveis.filter(acao => acao.descricao === descricao.trim())[0];
};

export const getAcaoAgrupamento = (tipo: string): ElementoAction => {
  return acoesDisponiveis.filter(acao => acao instanceof agrupaElemento && acao.tipo === tipo)[0];
};

export const isAcaoMenu = (acao: ElementoAction): boolean => {
  return acoesMenu.includes(acao);
};
