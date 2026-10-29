import type { Anexo } from './proposicao/proposicao';
import type { TipoAnexo } from './proposicao/tipoAnexo';
import type { ConfiguracaoPaginacao } from './paginacao/paginacao';
import type { Usuario } from './revisao/usuario';

export interface ObterAnexoBlobResult {
  blob: Blob;
  contentType: string | null;
}

// O host guarda o arquivo e devolve o idArquivo.
export type UploadAnexoCallback = (file: File) => string | Promise<string>;
// Aviso de exclusão: cabe ao host decidir se e quando remove o conteúdo.
export type DeleteAnexoCallback = (anexo: Anexo) => void | Promise<void>;
export type ObterAnexoBlobCallback = (anexo: Anexo) => ObterAnexoBlobResult | Promise<ObterAnexoBlobResult>;
export type VisualizarAnexoCallback = (anexo: Anexo) => void | Promise<void>;

export class LexmlEtaConfig {
  casaLegislativaEditor = 'SF';
  urlConsultaParlamentares = 'api/parlamentares';
  urlAutocomplete = 'api/autocomplete-norma';
  urlPortalNormas = 'https://normas.leg.br';
  urlComissoes?: string;
  // Identificação do usuário para registro de marcas de revisão.
  usuario?: Usuario;
  // Paginação de dispositivos durante a edição.
  configuracaoPaginacao?: ConfiguracaoPaginacao;
  // Valores iniciais de uma nova proposição; não se aplicam ao abrir um documento.
  autoriaPadrao?: { identificacao: string; siglaCasaLegislativa: 'SF' | 'CD' };
  opcoesImpressaoPadrao?: { imprimirBrasao: boolean; textoCabecalho: string; tamanhoFonte: number };
  // Em KB; sem valor (ou não positivo), o tamanho do anexo não é limitado.
  tamanhoMaximoAnexo?: number;
  tiposAnexos?: TipoAnexo[];
  onUploadAnexo?: UploadAnexoCallback;
  onDeleteAnexo?: DeleteAnexoCallback;
  onObterAnexoBlob?: ObterAnexoBlobCallback;
  onVisualizarAnexo?: VisualizarAnexoCallback;
  tamanhoMaximoImagem = 2048; //2MB
}
