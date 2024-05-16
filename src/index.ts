// ---------------------------------------------------
// DEPENDÊNCIAS
// ---------------------------------------------------
// import 'quill/dist/quill.snow.css';
// import 'font-awesome/css/font-awesome.css';

import 'quill/dist/quill';

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
import { ModuloAspasCurvas } from './components/editor-texto-rico/moduloAspasCurvas';
import { ModuloRevisao } from './components/editor-texto-rico/moduloRevisao';
import { ModuloNotaRodape } from './components/editor-texto-rico/moduloNotaRodape';

// ---------------------------------------------------

export { ArticulacaoComponent } from './components/articulacao.component';
export { ComandoEmendaComponent } from './components/comandoEmenda/comandoEmenda.component';
export { EditorComponent } from './components/editor/editor.component';
export { ElementoComponent } from './components/elemento/elemento.component';
export { AtalhosComponent as HelpComponent } from './components/ajuda/atalhos.component';
export { EditorTextoRicoComponent } from './components/editor-texto-rico/editor-texto-rico.component';
export { AlterarLarguraTabelaColunaModalComponent } from './components/editor-texto-rico/alterar-largura-tabela-coluna-modal';
export { AlterarLarguraImagemModalComponent } from './components/editor-texto-rico/alterar-largura-imagem-modal';
export { LexmlEtaComponent } from './components/lexml-eta.component';
export { AutoriaComponent } from './components/autoria/autoria.component';
export { DestinoComponent } from './components/destino/destino.component';
export { LexmlAutocomplete } from './components/lexml-autocomplete';
export { DataComponent } from './components/data/data.component';
export { LexmlEmendaComponent, LexmlEmendaParametrosEdicao } from './components/lexml-emenda.component';
export { LexmlEmendaConfig } from './model/lexmlEmendaConfig';
export { AlertasComponent } from './components/alertas/alertas.component';
export { AjudaComponent } from './components/ajuda/ajuda.component';
export { AjudaModalComponent } from './components/ajuda/ajuda.modal.component';
export { SufixosModalComponent } from './components/sufixos/sufixos.modal.componet';
export { ComandoEmendaModalComponent } from './components/comandoEmenda/comandoEmenda.modal.component';
export { AtalhosModalComponent } from './components/ajuda/atalhos.modal.component';
export { OpcoesImpressaoComponent } from './components/opcoesImpressao/opcoesImpressao.component';
export { SwitchRevisaoComponent } from './components/switchRevisao/switch-revisao.component';
export { SubstituicaoTermoComponent } from './components/substituicao-termo/substituicao-termo.component';
export { Usuario } from './model/revisao/usuario';

Quill.register('modules/aspasCurvas', ModuloAspasCurvas, true);
Quill.register('modules/revisao', ModuloRevisao, true);
Quill.register('modules/notaRodape', ModuloNotaRodape, true);
