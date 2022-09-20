import { Dispositivo } from '../../dispositivo/dispositivo';
import { isAlinea, isArtigo, Tipo } from '../../dispositivo/tipo';
import { ClassificacaoDocumento } from '../../documento/classificacao';
import { createAlteracao, createArticulacao, criaDispositivo, criaDispositivoCabecaAlteracao } from '../dispositivo/dispositivoLexmlFactory';
import { validaDispositivo } from '../dispositivo/dispositivoValidator';
import { DispositivoAdicionado } from '../situacao/dispositivoAdicionado';
import { TipoDispositivo } from '../tipo/tipoDispositivo';
import { buildId } from '../util/idUtil';
import { isLetra, isRomano } from './numeracaoUtil';

export interface ReferenciaDispositivo {
  tipo: Tipo;
  numero?: string;
}

const regex = new Map();
regex.set('Alinea', /(al[ií]nea|ali.?\s)\s*([uú]nica|[a-z]+[)]?(?:-[a-z])?).*/i);
regex.set('Artigo', /(art\.?|artigo)\s*([uú]nico\s*|\d+(?:-[a-z])?).*/i);
regex.set('Inciso', /(inciso|inc.?\s)\s*([uú]nico|[MDCLXVI]+[)]?(?:-[a-z])?).*/i);
regex.set('Item', /(item)\s*([uú]nico\s*|\d+(?:-[a-z])?).*/i);
regex.set('Paragrafo', /(§|par[aá]grafo|par.?\s)\s*([uú]nico\s*|\d+(?:-[a-z])?).*/i);

const processaFilhos = (dispositivo: Dispositivo, referencias: ReferenciaDispositivo[], modo?: ClassificacaoDocumento): void => {
  let parent = dispositivo;
  referencias?.forEach(referencia => {
    if (!parent.tiposPermitidosFilhos?.includes(referencia.tipo?.tipo)) {
      if (referencia.numero && referencia.numero.match(/\d.*/)) {
        parent = criaDispositivo(parent, isArtigo(parent) ? TipoDispositivo.paragrafo.tipo : isAlinea(parent) ? TipoDispositivo.item.tipo : TipoDispositivo.generico.tipo);
        referencia.numero && parent.createNumeroFromRotulo(referencia.numero);
        parent.createRotulo(parent);
      } else {
        parent = criaDispositivo(parent, TipoDispositivo.generico.tipo);
        parent.rotulo = referencia.numero!;
      }
    } else {
      parent = criaDispositivo(parent, referencia.tipo.tipo);
      referencia.numero && parent.createNumeroFromRotulo(referencia.numero);
      parent.createRotulo(parent);
    }
    if (modo) {
      (parent.situacao as DispositivoAdicionado).tipoEmenda = modo;
    }
    parent.isDispositivoAlteracao = true;
    parent.situacao = new DispositivoAdicionado();
    (parent.situacao as DispositivoAdicionado).existeNaNormaAlterada = true;
    parent.id = buildId(parent);
    parent.mensagens = validaDispositivo(parent);
  });
};

const buildCabecaAlteracao = (dispositivo: Dispositivo, referencia: ReferenciaDispositivo, modo): Dispositivo => {
  if (!dispositivo.hasAlteracao()) {
    createAlteracao(dispositivo);
  }
  const cabeca = criaDispositivoCabecaAlteracao(TipoDispositivo.artigo.tipo, dispositivo.alteracoes!, undefined, 0);
  cabeca.isDispositivoAlteracao = true;
  cabeca.situacao = new DispositivoAdicionado();
  (cabeca.situacao as DispositivoAdicionado).tipoEmenda = modo;
  (cabeca.situacao as DispositivoAdicionado).existeNaNormaAlterada = true;
  referencia.numero && cabeca.createNumeroFromRotulo(referencia.numero);
  cabeca.createRotulo(cabeca);
  cabeca.id = buildId(cabeca);

  return cabeca;
};

export const buildDispositivosAssistente = (texto: string, dispositivo: Dispositivo, modo = ClassificacaoDocumento.EMENDA): Dispositivo => {
  const referencias = identificaReferencias(texto);
  let artigoInformado = true;

  if (!referencias || referencias.length === 0) {
    throw new Error('Não foi possível informado o dispositivo');
  }

  if (referencias[0].tipo !== TipoDispositivo.artigo) {
    if (referencias.reverse()[0].tipo !== TipoDispositivo.artigo) {
      artigoInformado = false;
    }
  }
  const c = artigoInformado ? referencias.shift() : undefined;
  const cabeca = buildCabecaAlteracao(dispositivo, c ?? { tipo: TipoDispositivo.artigo }, modo);

  processaFilhos(cabeca, referencias, modo);

  return cabeca;
};

export const validaDispositivoAssistente = (texto: string): Dispositivo => {
  return buildDispositivosAssistente(texto, criaDispositivo(createArticulacao(), TipoDispositivo.artigo.tipo));
};

const identificaTipo = (texto: string): Tipo | undefined => {
  if (texto.trim().match(/ali|al[ií]nea.*/i)) {
    return TipoDispositivo.alinea;
  }
  if (texto.trim().match(/art[igo]?.*/i)) {
    return TipoDispositivo.artigo;
  }

  if (texto.trim().match(/inc|inciso.*/i)) {
    return TipoDispositivo.inciso;
  }

  if (texto.trim().match(/item.*/i)) {
    return TipoDispositivo.item;
  }

  if (texto.trim().match(/§|par[ágrafo]?.*/i)) {
    return TipoDispositivo.paragrafo;
  }

  return TipoDispositivo.generico;
};

export const buildReferencia = (texto: string, tipoDispositivo?: Tipo): ReferenciaDispositivo => {
  const tipo = tipoDispositivo ?? identificaTipo(texto);

  if (!tipo) {
    throw new Error(`Não pude identificar o tipo em ${texto}`);
  }

  const r = regex.get(tipo.tipo);

  if (!r) {
    throw new Error(`Tipo não suportado: ${tipo.descricao}`);
  }

  const matches = texto?.trim().match(r);

  if (matches && matches.length === 3) {
    return { tipo, numero: matches[2] };
  }

  return { tipo, numero: undefined };
};

const normaliza = (p: string[]): string[] => {
  for (let i = 0; i < p.length - 1; i += 2) {
    const tipo = identificaTipo(p[i]);

    if (tipo === TipoDispositivo.generico) {
      if (isRomano(p[i][0].trim())) {
        p.splice(i, 0, 'inciso');
      } else if (isLetra(p[i][0].trim())) {
        p.splice(i, 0, 'alinea');
      } else {
        p.splice(i, 0, 'generico');
      }
      continue;
    }
  }
  return p;
};

export const identificaReferencias = (texto: string): ReferenciaDispositivo[] | undefined => {
  let p = texto
    .replace(',', '')
    .replace('º', '')
    .replace(/\s+d[ao]+\s+/gi, ' ')
    .replace(/\s*caput\s*/, ' ')
    .split(' ')
    .filter(e => e.length !== 0);

  p = normaliza(p);

  const resultado: ReferenciaDispositivo[] = [];

  for (let i = 0, j = 1; i < p.length - 1, j <= p.length - 1; i += 2, j += 2) {
    const tipo = identificaTipo(p[i]);

    if (!tipo) {
      throw new Error(`Não pude identificar o tipo no texto informado: ${p[i]}`);
    }
    const r = regex.get(tipo.tipo);

    if (!r) {
      resultado.push({ tipo, numero: p[j] });
      continue;
    }

    const matches = `${p[i]} ${p[j]}`.match(r);

    if (matches && matches.length === 3) {
      resultado.push({ tipo, numero: matches[2] });
    } else {
      resultado.push({ tipo, numero: undefined });
    }
  }

  return resultado;
};
