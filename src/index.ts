// ---------------------------------------------------
// DEPENDÊNCIAS
// ---------------------------------------------------
// import 'quill/dist/quill.snow.css';
// import 'font-awesome/css/font-awesome.css';

import '@shoelace-style/shoelace/dist/components/radio-group/radio-group.js';
import '@shoelace-style/shoelace/dist/components/radio-button/radio-button';
import '@shoelace-style/shoelace/dist/components/input/input';
import '@shoelace-style/shoelace/dist/components/dialog/dialog';
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item';
import '@shoelace-style/shoelace/dist/components/select/select';
import '@shoelace-style/shoelace/dist/components/button/button';
import '@shoelace-style/shoelace/dist/components/split-panel/split-panel';
import '@shoelace-style/shoelace/dist/components/radio/radio';
import '@shoelace-style/shoelace/dist/components/details/details';
import '@shoelace-style/shoelace/dist/components/checkbox/checkbox';
import '@shoelace-style/shoelace/dist/components/switch/switch';
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip';
import '@shoelace-style/shoelace/dist/components/card/card';
import './model/lexml/util/mixin';
import { configurePrivateQuill } from './internal/quill/configure-private-quill';

// ---------------------------------------------------

export { ArticulacaoComponent } from './components/articulacao.component';
export { EditorComponent } from './components/editor/editor.component';
export { ElementoComponent } from './components/elemento/elemento.component';
export { AtalhosComponent as HelpComponent } from './components/ajuda/atalhos.component';
export { EditorTextoRicoComponent } from './components/editor-texto-rico/editor-texto-rico.component';
export { AlterarLarguraTabelaColunaModalComponent } from './components/editor-texto-rico/alterar-largura-tabela-coluna-modal';
export { AlterarLarguraImagemModalComponent } from './components/editor-texto-rico/alterar-largura-imagem-modal';
export { LexmlEtaProposicaoComponent } from './components/lexml-eta-proposicao.component';
export { AutoriaComponent } from './components/autoria/autoria.component';
export { NovaProposicaoComponent } from './components/nova-proposicao/nova-proposicao.component';
export type { ResultadoNovaProposicao } from './components/nova-proposicao/tiposNovaProposicao';
export type { ConfigNovaProposicao } from './components/nova-proposicao/urlsNovaProposicao';
export { LexmlAutocomplete } from './components/lexml-autocomplete';
export { AutocompleteListaComponent } from './components/autocomplete/autocomplete-lista';
export type { ItemAutocompleteLista } from './components/autocomplete/autocomplete-lista';
export { DataComponent } from './components/data/data.component';
export { LexmlEtaComponent } from './components/lexml-eta.component';
export type { DadosNovaProposicao } from './components/lexml-eta.component';
export { LexmlEtaConfig } from './model/lexmlEtaConfig';
export type { DeleteAnexoCallback, ObterAnexoBlobCallback, ObterAnexoBlobResult, UploadAnexoCallback, VisualizarAnexoCallback } from './model/lexmlEtaConfig';
export { AlertasComponent } from './components/alertas/alertas.component';
export { AjudaComponent } from './components/ajuda/ajuda.component';
export { AjudaModalComponent } from './components/ajuda/ajuda.modal.component';
export { SufixosModalComponent } from './components/sufixos/sufixos.modal.componet';
export { AtalhosModalComponent } from './components/ajuda/atalhos.modal.component';
export { OpcoesImpressaoComponent } from './components/opcoesImpressao/opcoesImpressao.component';
export { AnexosComponent } from './components/anexos/anexos.component';
export { SwitchRevisaoComponent } from './components/switchRevisao/switch-revisao.component';
export { SubstituicaoTermoComponent } from './components/substituicao-termo/substituicao-termo.component';
export { Usuario } from './model/revisao/usuario';
export { ProposicaoDivididaDialog } from './components/editor/proposicaoDivididaDialog';
export { Proposicao, MimeType } from './model/proposicao/proposicao';
export type { Anexo } from './model/proposicao/proposicao';
export type { TipoAnexo } from './model/proposicao/tipoAnexo';

configurePrivateQuill();

export type { DocumentoArticulado } from './model/lexml/documento/documentoArticulado';
export { lerDocumentoArticulado, nomeArquivoDocumentoArticulado, serializarDocumentoArticulado } from './model/lexml/documento/documentoArticulado';
export { abrirArquivoDocumentoArticulado, lerArquivoDocumentoArticulado, salvarArquivoDocumentoArticulado } from './util/arquivoDocumentoArticulado';
