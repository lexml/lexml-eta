import { ClassificacaoDocumento } from '../../documento/classificacao';
import { ProjetoNorma } from './projetoNorma';
import { buildJsonixFromProjetoNorma } from './conversor/buildJsonixFromProjetoNorma';
import { buildProjetoNormaFromJsonix } from './conversor/buildProjetoNormaFromJsonix';
import { RemissaoExternaValue, RemissaoInternaValue } from '../../remissao';
import { getAno, getNumero, getSigla } from './urnUtil';
import { OpcoesImpressao } from '../../proposicao/proposicao';

const NAMESPACE_LEXML = 'http://www.lexml.gov.br/1.0';

/** Ponto de extensão `MetadadoProprietario` do LexML, ocupado pelo LexEdit — ver especificação 00. */
export interface MetadadoLexEdit {
  // Atributos opcionais no arquivo: a ausência significa o padrão da aplicação (especificação 02).
  opcoesImpressao?: Partial<OpcoesImpressao>;
  remissoesInternasInvalidas?: { refIdsRemissoesInternas: string[] };
  pendencias?: string[];
}

/** Dados de formulário do editor gravados em `lexedit` — um campo por grupo de metadados. */
export interface DadosLexEdit {
  opcoesImpressao?: OpcoesImpressao;
}

export interface MetadadoProprietarioLexEdit {
  TYPE_NAME: string;
  fonte: string;
  lexedit: MetadadoLexEdit;
}

/** Documento de intercâmbio. O modelo de edição ProjetoNorma é um contrato distinto. */
export interface DocumentoArticulado {
  name: { namespaceURI: string; localPart: string; [key: string]: unknown };
  value: {
    TYPE_NAME: string;
    metadado: {
      identificacao: { urn: string; [key: string]: unknown };
      metadadoProprietario?: MetadadoProprietarioLexEdit[];
      [key: string]: unknown;
    };
    projetoNorma: { norma: { parteInicial?: any; articulacao: any; [key: string]: unknown }; [key: string]: unknown };
    [key: string]: unknown;
  };
}

export const validarIdentificacaoDocumento = (urn: unknown): void => {
  // A validação XSD usa anyURI; a posição do ano e do número precisa ser verificada aqui.
  if (typeof urn !== 'string' || !/^urn:lex:br:[^:\s]+:[^:\s]+:\d{4}(?:-\d{2}-\d{2})?;\d+(?:@[^!\s]+)?$/.test(urn)) {
    throw new Error('A identificação deve conter uma URN LexML com ano e número, nesta ordem.');
  }
};

const tiposDispositivo = new Set([
  'Parte',
  'Livro',
  'Titulo',
  'Subtitulo',
  'Capitulo',
  'Secao',
  'Subsecao',
  'Artigo',
  'Caput',
  'Paragrafo',
  'Inciso',
  'Alinea',
  'Item',
  'Omissis',
  'Agrupamento',
]);

export const validarDocumentoArticulado = (entrada: unknown): DocumentoArticulado => {
  const doc = entrada as DocumentoArticulado;
  if (doc?.name?.namespaceURI !== NAMESPACE_LEXML || doc?.name?.localPart !== 'LexML' || !doc?.value?.projetoNorma?.norma) {
    throw new Error('O arquivo deve conter um documento LexML em JSON (documento-articulado.json).');
  }
  validarIdentificacaoDocumento(doc.value.metadado?.identificacao?.urn);
  const norma = doc.value.projetoNorma.norma;
  if (!Array.isArray(norma.articulacao?.lXhier) || !norma.articulacao.lXhier.length) {
    throw new Error('O documento não contém uma articulação LexML válida.');
  }

  const ids = new Set<string>();
  const visitar = (valor: any): void => {
    if (!valor || typeof valor !== 'object') return;
    if (Array.isArray(valor)) {
      valor.forEach(visitar);
      return;
    }
    if (valor.id !== undefined) {
      if (typeof valor.id !== 'string' || !valor.id || /\s/.test(valor.id) || ids.has(valor.id)) {
        throw new Error('O documento contém identificadores de elementos inválidos ou repetidos.');
      }
      ids.add(valor.id);
    }
    for (const [campo, conteudo] of Object.entries(valor)) {
      if (['content', 'p', 'lXhier', 'lXcontainersOmissis'].includes(campo) && !Array.isArray(conteudo)) {
        throw new Error('O documento contém uma estrutura de texto ou dispositivos inválida.');
      }
      if (campo === 'lXhier' || campo === 'lXcontainersOmissis') {
        for (const dispositivo of conteudo as any[]) {
          if (!tiposDispositivo.has(dispositivo?.name?.localPart) || dispositivo.name.namespaceURI !== NAMESPACE_LEXML || !dispositivo.value) {
            throw new Error('O documento contém um tipo de dispositivo não reconhecido.');
          }
        }
      }
      visitar(conteudo);
    }
  };
  visitar(norma);
  return doc;
};

/** Valida e prepara uma cópia independente antes de qualquer alteração no editor. */
export const lerDocumentoArticulado = (entrada: unknown): DocumentoArticulado => {
  let doc: unknown = entrada;
  if (typeof entrada === 'string') {
    try {
      doc = JSON.parse(entrada.replace(/^\uFEFF/, ''));
    } catch {
      throw new Error('Não foi possível abrir o arquivo: o conteúdo não é um JSON válido.');
    }
  }
  const validado = validarDocumentoArticulado(doc);
  const copia = JSON.parse(JSON.stringify(validado)) as DocumentoArticulado;
  // Exercita o leitor antes de permitir que a interface substitua seu estado.
  try {
    buildProjetoNormaFromJsonix(copia, true);
  } catch {
    throw new Error('Não foi possível interpretar a parte inicial ou a articulação do documento.');
  }
  return copia;
};

export const criarDocumentoArticulado = (
  projetoNorma: ProjetoNorma,
  urn: string,
  remissoes?: Record<number, RemissaoInternaValue[]>,
  remissoesExternas?: Record<string, RemissaoExternaValue>,
  dados?: DadosLexEdit
): DocumentoArticulado => {
  validarIdentificacaoDocumento(urn);
  // No XSD LexML, ProjetoNorma contém Norma, inclusive para proposições em elaboração.
  const modelo = { ...projetoNorma, classificacao: ClassificacaoDocumento.NORMA } as ProjetoNorma;
  const documento = buildJsonixFromProjetoNorma(modelo, urn, remissoes, remissoesExternas, dados);
  decodificarTextoJsonix(documento);
  preservarEspacosJsonix(documento);
  validarDocumentoArticulado(documento);
  return documento;
};

/** O modelo usa HTML; o texto do Jsonix precisa conter os caracteres literais. */
const decodificarTextoJsonix = (valor: any): void => {
  if (!valor || typeof valor !== 'object') return;
  for (const [chave, conteudo] of Object.entries(valor)) {
    if (chave === 'content' && Array.isArray(conteudo)) {
      valor[chave] = conteudo.map(item => {
        if (typeof item !== 'string') return item;
        const textarea = document.createElement('textarea');
        textarea.innerHTML = item.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return textarea.value;
      });
    }
    if (Array.isArray(valor[chave])) valor[chave].forEach(decodificarTextoJsonix);
    else decodificarTextoJsonix(valor[chave]);
  }
};

/** O unmarshaller Jsonix ignora nós de texto contendo somente espaços.
 * Anexa esses espaços ao texto vizinho, mantendo o texto apresentado no XML.
 */
const preservarEspacosJsonix = (valor: any): void => {
  if (!valor || typeof valor !== 'object') return;
  Object.values(valor).forEach(filho => {
    if (Array.isArray(filho)) filho.forEach(preservarEspacosJsonix);
    else preservarEspacosJsonix(filho);
  });
  if (!Array.isArray(valor.content)) return;
  const acrescentar = (conteudo: any[], espaco: string): boolean => {
    if (!conteudo.length) return false;
    const ultimo = conteudo[conteudo.length - 1];
    if (typeof ultimo === 'string') {
      conteudo[conteudo.length - 1] += espaco;
      return true;
    }
    return Array.isArray(ultimo?.value?.content) && acrescentar(ultimo.value.content, espaco);
  };
  const conteudo: any[] = [];
  for (const item of valor.content) {
    if (typeof item === 'string' && /^\s+$/.test(item) && acrescentar(conteudo, item)) continue;
    conteudo.push(item);
  }
  valor.content = conteudo;
};

export const serializarDocumentoArticulado = (documento: DocumentoArticulado): string => JSON.stringify(validarDocumentoArticulado(documento), null, 2) + '\n';

export const nomeArquivoDocumentoArticulado = (documento: DocumentoArticulado): string => {
  const urn = documento.value.metadado.identificacao.urn;
  return `documento-articulado - ${getSigla(urn)} nº ${getNumero(urn)}, de ${getAno(urn)}.json`;
};
