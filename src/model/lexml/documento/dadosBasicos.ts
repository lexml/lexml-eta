import { ColegiadoApreciador } from '../../proposicao/proposicao';
import { montaColegiadoApreciador, montaMetadadoProprietario, montaOutrosMetadados, montaParteInicial } from './conversor/buildJsonixFromProjetoNorma';
import { decodificarTextoJsonix, DocumentoArticulado, getEstruturaNorma, MetadadoLexEdit } from './documentoArticulado';
import { getCasaLegislativaResponsavel } from './urnUtil';

/** Dados básicos da proposição (tipo/URN, referência, colegiado, forma de apresentação, epígrafe, preâmbulo e outros metadados). */
export interface DadosBasicos {
  urn: string;
  urnDocumentoReferenciado?: string;
  epigrafe: string;
  preambulo: string;
  colegiadoApreciador?: ColegiadoApreciador;
  outrosMetadados?: Record<string, string>;
  anexoParecer?: boolean;
}

export interface ContextoDadosBasicos {
  urnAtual: string;
  anexoParecerAtual: boolean;
  // Mantida no documento no lugar da data do instante da serialização.
  dataUltimaModificacao?: string;
}

const getLexEdit = (documento: DocumentoArticulado): MetadadoLexEdit => {
  const metadado = documento.value.metadado;
  const existente = metadado.metadadoProprietario?.[0]?.any?.[0]?.value;
  if (existente) return existente;
  const criado: MetadadoLexEdit = { TYPE_NAME: 'br_gov_lexml_lexedit__1.Metadado' };
  metadado.metadadoProprietario = [montaMetadadoProprietario(criado)];
  return metadado.metadadoProprietario[0].any[0].value;
};

// Metadado sem nenhum grupo vira ausência de `MetadadoProprietario`, como no montador.
const removerLexEditVazio = (documento: DocumentoArticulado): void => {
  const lexedit = documento.value.metadado.metadadoProprietario?.[0]?.any?.[0]?.value;
  if (lexedit && Object.keys(lexedit).length <= 1) delete documento.value.metadado.metadadoProprietario;
};

/** Aplica os dados básicos a uma cópia do documento serializado (design D2); não altera o original. */
export const aplicarDadosBasicos = (original: DocumentoArticulado, dados: DadosBasicos, contexto: ContextoDadosBasicos): DocumentoArticulado => {
  const documento = JSON.parse(JSON.stringify(original)) as DocumentoArticulado;
  const lexedit = getLexEdit(documento);
  const norma = getEstruturaNorma(documento);
  const anexoParecer = !!dados.anexoParecer;

  documento.value.metadado.identificacao.urn = dados.urn;

  if (dados.urnDocumentoReferenciado?.trim()) lexedit.urnDocumentoReferenciado = dados.urnDocumentoReferenciado.trim();
  else delete lexedit.urnDocumentoReferenciado;

  lexedit.anexoParecer = anexoParecer;

  // O anexo de parecer não tem colegiado apreciador.
  const colegiado = anexoParecer ? undefined : montaColegiadoApreciador(dados.colegiadoApreciador);
  if (colegiado) lexedit.colegiadoApreciador = colegiado;
  else delete lexedit.colegiadoApreciador;

  const outros = montaOutrosMetadados(dados.outrosMetadados);
  if (outros) lexedit.outrosMetadados = outros;
  else delete lexedit.outrosMetadados;

  const { epigrafe, preambulo } = montaParteInicial({ epigrafe: { texto: dados.epigrafe }, preambulo: { texto: dados.preambulo } });
  decodificarTextoJsonix(epigrafe);
  decodificarTextoJsonix(preambulo);
  norma.parteInicial = { ...norma.parteInicial, epigrafe, preambulo };

  // A justificação (com as notas) só some quando o documento passa a ser anexo de parecer.
  if (!contexto.anexoParecerAtual && anexoParecer) {
    delete documento.value.projetoNorma['justificacao'];
    delete lexedit.revisoesTextuais;
  }

  // Autoria vale para a casa em que foi informada.
  if (getCasaLegislativaResponsavel(dados.urn) !== getCasaLegislativaResponsavel(contexto.urnAtual)) {
    delete lexedit.autoria;
    if (norma.parteFinal) delete norma.parteFinal.assinaturaTexto;
  }

  // O local volta a ser derivado do colegiado ao abrir; a data do fecho é mantida.
  delete lexedit.local;
  if (norma.parteFinal) delete norma.parteFinal.localDataFecho;
  if (norma.parteFinal && !norma.parteFinal.localDataFecho && !norma.parteFinal.assinaturaTexto) delete norma.parteFinal;

  if (contexto.dataUltimaModificacao) lexedit.dataUltimaModificacao = contexto.dataUltimaModificacao;
  else delete lexedit.dataUltimaModificacao;

  removerLexEditVazio(documento);
  return documento;
};
