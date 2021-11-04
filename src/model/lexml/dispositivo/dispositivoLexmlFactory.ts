import { Counter } from '../../../util/counter';
import { Alteracoes } from '../../dispositivo/blocoAlteracao';
import { Articulacao, Artigo, Dispositivo } from '../../dispositivo/dispositivo';
import { GeneroFeminino, GeneroIndefinido, GeneroMasculino } from '../../dispositivo/genero';
import { isAgrupador, isArtigo, isIncisoCaput, isParagrafo } from '../../dispositivo/tipo';
import { ValidacaoDispositivo } from '../../dispositivo/validacao';
import { FINALIZAR_BLOCO, INICIAR_BLOCO } from '../acao/blocoAlteracaoAction';
import { BlocoAlteracaoNaoPermitido } from '../alteracao/blocoAlteracaoNaoPermitido';
import { BlocoAlteracaoPermitido } from '../alteracao/BlocoAlteracaoPermitido';
import { ConteudoDispositivo } from '../conteudo/conteudoDispositivo';
import { ConteudoOmissis } from '../conteudo/conteudoOmissis';
import { hasIndicativoDesdobramento, hasIndicativoFinalSequencia, hasIndicativoInicioAlteracao, normalizaSeForOmissis } from '../conteudo/conteudoUtil';
import { HierarquiaAgrupador } from '../hierarquia/hierarquiaAgrupador';
import { HierarquiaArtigo } from '../hierarquia/hierarquiaArtigo';
import { HierarquiaDispositivo } from '../hierarquia/hierarquiaDispositivo';
import { getArticulacao, hasFilhos, isDispositivoAlteracao } from '../hierarquia/hierarquiaUtil';
import { NumeracaoAgrupador } from '../numeracao/numeracaoAgrupador';
import { NumeracaoAlinea } from '../numeracao/numeracaoAlinea';
import { NumeracaoArtigo } from '../numeracao/numeracaoArtigo';
import { NumeracaoGenerico } from '../numeracao/numeracaoGenerico';
import { NumeracaoInciso } from '../numeracao/numeracaoInciso';
import { NumeracaoIndisponivel } from '../numeracao/numeracaoIndisponivel';
import { NumeracaoItem } from '../numeracao/numeracaoItem';
import { NumeracaoParagrafo } from '../numeracao/numeracaoParagrafo';
import { RegrasAgrupadores } from '../regras/regrasAgrupadores';
import { RegrasAlinea } from '../regras/regrasAlinea';
import { RegrasArtigo } from '../regras/regrasArtigo';
import { RegrasCaput } from '../regras/regrasCaput';
import { RegrasDispositivoGenerico } from '../regras/regrasDispositivoGenerico';
import { RegrasInciso } from '../regras/regrasInciso';
import { RegrasItem } from '../regras/regrasItem';
import { RegrasOmissis } from '../regras/regrasOmissis';
import { RegrasParagrafo } from '../regras/regrasParagrafo';
import { SituacaoDispositivo } from '../situacao/situacaoDispositivo';
import { TipoArticulacao } from '../tipo/tipoArticulacao';
import { TipoArtigo } from '../tipo/tipoArtigo';
import { TipoDispositivo } from '../tipo/tipoDispositivo';
import { TipoLexml } from '../tipo/tipoLexml';
import { TipoMensagem } from '../util/mensagem';
import { podeSerUltimaalteracao } from './dispositivoLexmlUtil';

const AlineaLexml = SituacaoDispositivo(
  RegrasAlinea(ValidacaoDispositivo(GeneroFeminino(BlocoAlteracaoNaoPermitido(ConteudoDispositivo(NumeracaoAlinea(HierarquiaDispositivo(TipoLexml)))))))
);
const ArtigoLexml = SituacaoDispositivo(RegrasArtigo(ValidacaoDispositivo(GeneroMasculino(BlocoAlteracaoPermitido(NumeracaoArtigo(HierarquiaArtigo(TipoArtigo)))))));
const CaputLexml = SituacaoDispositivo(
  RegrasCaput(ValidacaoDispositivo(GeneroMasculino(BlocoAlteracaoNaoPermitido(ConteudoDispositivo(NumeracaoIndisponivel(HierarquiaDispositivo(TipoLexml)))))))
);
const DispositivoGenericoLexml = SituacaoDispositivo(
  RegrasDispositivoGenerico(ValidacaoDispositivo(GeneroIndefinido(BlocoAlteracaoNaoPermitido(ConteudoDispositivo(NumeracaoGenerico(HierarquiaDispositivo(TipoLexml)))))))
);
const IncisoLexml = SituacaoDispositivo(
  RegrasInciso(ValidacaoDispositivo(GeneroMasculino(BlocoAlteracaoNaoPermitido(ConteudoDispositivo(NumeracaoInciso(HierarquiaDispositivo(TipoLexml)))))))
);
const ItemLexml = SituacaoDispositivo(
  RegrasItem(ValidacaoDispositivo(GeneroMasculino(BlocoAlteracaoNaoPermitido(ConteudoDispositivo(NumeracaoItem(HierarquiaDispositivo(TipoLexml)))))))
);
const ParagrafoLexml = SituacaoDispositivo(
  RegrasParagrafo(ValidacaoDispositivo(GeneroMasculino(BlocoAlteracaoNaoPermitido(ConteudoDispositivo(NumeracaoParagrafo(HierarquiaDispositivo(TipoLexml)))))))
);
const ArticulacaoLexml = SituacaoDispositivo(
  RegrasAgrupadores(ValidacaoDispositivo(GeneroIndefinido(BlocoAlteracaoNaoPermitido(ConteudoDispositivo(NumeracaoAgrupador(HierarquiaAgrupador(TipoArticulacao)))))))
);
const CapituloLexml = SituacaoDispositivo(
  RegrasAgrupadores(ValidacaoDispositivo(GeneroMasculino(BlocoAlteracaoNaoPermitido(ConteudoDispositivo(NumeracaoAgrupador(HierarquiaAgrupador(TipoLexml)))))))
);
const DispositivoAgrupadorGenericoLexml = SituacaoDispositivo(
  RegrasAgrupadores(ValidacaoDispositivo(GeneroIndefinido(BlocoAlteracaoNaoPermitido(ConteudoDispositivo(NumeracaoAgrupador(HierarquiaAgrupador(TipoLexml)))))))
);
const LivroLexml = SituacaoDispositivo(
  RegrasAgrupadores(ValidacaoDispositivo(GeneroMasculino(BlocoAlteracaoNaoPermitido(ConteudoDispositivo(NumeracaoAgrupador(HierarquiaAgrupador(TipoLexml)))))))
);
const ParteLexml = SituacaoDispositivo(
  RegrasAgrupadores(ValidacaoDispositivo(GeneroFeminino(BlocoAlteracaoNaoPermitido(ConteudoDispositivo(NumeracaoAgrupador(HierarquiaAgrupador(TipoLexml)))))))
);
const SubsecaoLexml = SituacaoDispositivo(
  RegrasAgrupadores(ValidacaoDispositivo(GeneroFeminino(BlocoAlteracaoNaoPermitido(ConteudoDispositivo(NumeracaoAgrupador(HierarquiaAgrupador(TipoLexml)))))))
);
const SecaoLexml = SituacaoDispositivo(
  RegrasAgrupadores(ValidacaoDispositivo(GeneroFeminino(BlocoAlteracaoNaoPermitido(ConteudoDispositivo(NumeracaoAgrupador(HierarquiaAgrupador(TipoLexml)))))))
);
const TituloLexml = SituacaoDispositivo(
  RegrasAgrupadores(ValidacaoDispositivo(GeneroMasculino(BlocoAlteracaoNaoPermitido(ConteudoDispositivo(NumeracaoAgrupador(HierarquiaAgrupador(TipoLexml)))))))
);

const OmissisLexml = SituacaoDispositivo(RegrasOmissis(GeneroMasculino(BlocoAlteracaoNaoPermitido(ConteudoOmissis(NumeracaoIndisponivel(HierarquiaDispositivo(TipoLexml)))))));

const desativaRotuloAutomaticoSeDispositivoAlteracao = (dispositivo: Dispositivo): void => {
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
};

export const criaDispositivo = (parent: Dispositivo, tipo: string, referencia?: Dispositivo, posicao?: number): Dispositivo => {
  const dispositivo = create(tipo, parent);
  posicao !== undefined && posicao >= 0 ? parent!.addFilhoOnPosition(dispositivo, posicao) : referencia ? parent!.addFilho(dispositivo, referencia) : parent!.addFilho(dispositivo);

  return dispositivo;
};

const create = (name: string, parent: Dispositivo): Dispositivo => {
  let dispositivo: Dispositivo;

  switch (name.toLowerCase()) {
    case 'alinea':
      dispositivo = new AlineaLexml(name.toLowerCase());
      break;
    case 'artigo':
      dispositivo = new ArtigoLexml();
      (dispositivo as Artigo).caput = create(TipoDispositivo.caput.tipo, dispositivo);
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

  desativaRotuloAutomaticoSeDispositivoAlteracao(dispositivo);

  return dispositivo;
};

export const createArticulacao = (): Articulacao => {
  const articulacao = new ArticulacaoLexml();
  articulacao.uuid = Counter.next();
  return articulacao;
};

export const createAlteracao = (atual: Artigo): void => {
  atual.alteracoes = createArticulacao();
  atual.alteracoes.pai = atual;
};

export const createByInferencia = (referencia: Dispositivo, action: any): Dispositivo => {
  let novo;

  if (isDispositivoAlteracao(referencia)) {
    if (action.subType === INICIAR_BLOCO) {
      novo = criaDispositivoCabecaAlteracao(TipoDispositivo.artigo.tipo, getArticulacao(referencia));
      novo.texto = action.novo?.conteudo?.texto?.length > 0 ? action.novo?.conteudo?.texto : '';
    } else if (action.subType === FINALIZAR_BLOCO) {
      const ref = getArticulacao(referencia);
      novo = createFromReferencia(ref.pai!);
      novo!.texto = normalizaSeForOmissis(action.novo?.conteudo?.texto ?? '');
    } else if (podeSerUltimaalteracao(referencia, action)) {
      const ref = getArticulacao(referencia);
      novo = action.subType === INICIAR_BLOCO ? criaDispositivoCabecaAlteracao(TipoDispositivo.artigo.tipo, ref!) : createFromReferencia(ref.pai!);
      novo!.texto = action.subType === INICIAR_BLOCO ? '' : normalizaSeForOmissis(action.novo?.conteudo?.texto ?? '');
    } else {
      novo = createFromReferencia(referencia);
      novo.createRotulo();
      novo!.texto = action.novo?.conteudo?.texto?.length > 0 ? normalizaSeForOmissis(action.novo?.conteudo?.texto ?? '') : '';
    }
  } else {
    if (referencia.alteracoes || hasIndicativoInicioAlteracao(action.atual?.conteudo?.texto) || action.novo?.isDispositivoAlteracao) {
      if (!referencia.hasAlteracao()) {
        createAlteracao(referencia);
      }
      novo = criaDispositivoCabecaAlteracao(referencia.tipo, referencia.alteracoes!);
      novo.texto = action.novo?.conteudo?.texto?.length > 0 ? action.novo?.conteudo?.texto : '';
    } else {
      novo = createFromReferencia(referencia);
      novo!.texto = action.novo?.conteudo?.texto ?? '';
    }
  }
  return novo;
};

export const createFromReferencia = (referencia: Dispositivo): Dispositivo => {
  if (referencia.hasAlteracao()) {
    return createWhenReferenciaBlocoAlteracao(referencia);
  }

  if (isArtigo(referencia)) {
    if (!isDispositivoAlteracao(referencia)) {
      return createWhenReferenciaIsArtigo(referencia);
    }
    return criaDispositivo((referencia as Artigo).caput!, TipoDispositivo.inciso.tipo, undefined, 0);
  }

  if (isAgrupador(referencia)) {
    return createWhenReferenciaIsAgrupador(referencia);
  }

  if (isDispositivoAlteracao(referencia)) {
    return hasFilhos(referencia) || hasIndicativoDesdobramento(referencia)
      ? criaDispositivo(referencia, referencia.tipoProvavelFilho!, referencia)
      : criaDispositivo(referencia.pai!, referencia.tipo === TipoDispositivo.omissis.tipo ? referencia.pai!.tipoProvavelFilho! : referencia.tipo, referencia);
  }

  return createFromReferenciaDefault(referencia);
};

const createWhenReferenciaBlocoAlteracao = (referencia: Dispositivo): Dispositivo => {
  if (referencia.pai!.isLastFilho(referencia) && referencia?.pai?.pai) {
    return criaDispositivo(referencia.pai.pai, referencia.pai.tipo, referencia.pai);
  }
  return criaDispositivo(referencia.pai!, referencia.tipo, referencia);
};

const createFromReferenciaDefault = (referencia: Dispositivo): Dispositivo => {
  if (hasIndicativoDesdobramento(referencia)) {
    const type = referencia.tipoProvavelFilho!;
    return referencia.pai!.filhos!.length > 0 ? criaDispositivo(referencia, type, undefined, 0) : criaDispositivo(referencia, type);
  }
  if (hasIndicativoFinalSequencia(referencia) && referencia.pai!.isLastFilho(referencia)) {
    if (isIncisoCaput(referencia)) {
      const artigo: Artigo = referencia.pai!.pai! as Artigo;
      return artigo!.filhos!.filter(filho => isParagrafo(filho)).length > 0
        ? criaDispositivo(artigo, TipoDispositivo.paragrafo.tipo, undefined, 0)
        : criaDispositivo(artigo, TipoDispositivo.paragrafo.tipo);
    } else {
      return criaDispositivo(referencia!.pai!.pai!, referencia.pai!.tipo, referencia!.pai!);
    }
  }
  return criaDispositivo(referencia.pai!, referencia.tipo, referencia);
};

const createWhenReferenciaIsArtigo = (referencia: Dispositivo): Dispositivo => {
  if (hasIndicativoDesdobramento(referencia)) {
    const type = referencia.tipoProvavelFilho!;

    if (type === TipoDispositivo.inciso.tipo) {
      const parent = (referencia as Artigo).caput;
      return parent!.filhos!.length > 0 ? criaDispositivo(parent!, type, undefined, 0) : criaDispositivo(parent!, type);
    }
    return referencia.pai!.filhos!.length > 0 ? criaDispositivo(referencia, type, undefined, 0) : criaDispositivo(referencia, type);
  }

  if (hasIndicativoFinalSequencia(referencia) && referencia.pai!.isLastFilho(referencia)) {
    return criaDispositivo(referencia!.pai!.pai!, referencia.pai!.tipo, referencia!.pai!);
  }
  return criaDispositivo(referencia.pai!, referencia.tipo, referencia);
};

const createWhenReferenciaIsAgrupador = (referencia: Dispositivo): Dispositivo => {
  return criaDispositivo(referencia, TipoDispositivo.artigo.tipo, undefined, 0);
};

const criaDispositivoCabecaAlteracao = (tipo: string, alteracoes: Alteracoes): Dispositivo => {
  const dispositivo = criaDispositivo(alteracoes!, tipo);
  dispositivo.createRotulo(dispositivo);

  return dispositivo;
};
