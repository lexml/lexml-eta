import { Elemento } from '../../model/elemento';
import { adicionarAgrupadorArtigoAction, adicionarAgrupadorArtigoAntesAction } from './../../model/lexml/acao/adicionarAgrupadorArtigoAction';

export const adicionarAgrupadorArtigoDialog = (elemento: Elemento, quill: any, store: any): void => {
  const tipoPai = elemento.hierarquia?.pai?.tipo;
  const defaultValue = elemento.agrupador ? elemento.tipo : tipoPai === 'Articulacao' ? 'Capitulo' : tipoPai;

  const dialogElem = document.createElement('sl-dialog');
  document.body.appendChild(dialogElem);
  dialogElem.label = 'Adicionar agrupador de artigo';

  dialogElem.addEventListener('sl-request-close', (event: any) => {
    if (event.detail.source === 'overlay') {
      event.preventDefault();
    }
  });

  const content = document.createRange().createContextualFragment(`
  <div class="agrupadores">
    <sl-radio-group fieldset label="">
      <sl-radio class="opcao-agrupador" id="Parte" value="Parte">Parte</sl-radio>
      <sl-radio class="opcao-agrupador" id="Livro" value="Livro">Livro</sl-radio>
      <sl-radio class="opcao-agrupador" id="Titulo" value="Titulo">Título</sl-radio>
      <sl-radio class="opcao-agrupador" id="Capitulo" value="Capitulo">Capítulo</sl-radio>
      <sl-radio class="opcao-agrupador" id="Secao" value="Secao">Seção</sl-radio>
      <sl-radio class="opcao-agrupador" id="Subsecao" value="Subsecao">Subseção</sl-radio>
    </sl-radio-group>
  </div>
  <sl-button slot="footer" variant="default">Cancelar</sl-button>
  <sl-button slot="footer" variant="primary">Ok</sl-button>
  `);

  const opcoes = Array.from(content.querySelectorAll('.opcao-agrupador'));
  (opcoes.find(el => (el as any).value === defaultValue) as any).checked = true;

  const botoes = content.querySelectorAll('sl-button');
  const cancelar = botoes[0];
  const ok = botoes[1];

  const action = elemento.tipo === 'Artigo' ? adicionarAgrupadorArtigoAction : adicionarAgrupadorArtigoAntesAction;

  ok.onclick = (): void => {
    const tipo = (document.querySelector('sl-radio.opcao-agrupador[aria-checked="true"]') as any).value;
    if (tipo) {
      store.dispatch(action.execute(elemento, tipo));
    }
    dialogElem?.hide();
    dialogElem?.remove();
  };

  cancelar.onclick = (): void => {
    quill.focus();
    dialogElem?.hide();
    dialogElem?.remove();
  };

  quill.blur();
  dialogElem.appendChild(content);
  dialogElem.show();
  // opcoes[elemento.notaAlteracao || 'VZ'].focus();
};
