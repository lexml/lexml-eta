import { adicionarAgrupadorArtigoAction, adicionarAgrupadorArtigoAntesAction } from './../../model/lexml/acao/adicionarAgrupadorArtigoAction';
import { Elemento } from '../../model/elemento';

export const adicionarAgrupadorArtigoDialog = (elemento: Elemento, quill: any, store: any): void => {
  const dialogElem = document.createElement('sl-dialog');
  document.body.appendChild(dialogElem);
  dialogElem.label = 'Adicionar agrupador de artigo';

  dialogElem.addEventListener('sl-request-close', (event: any) => {
    if (event.detail.source === 'overlay') {
      event.preventDefault();
    }
  });

  const content = document.createRange().createContextualFragment(`
  <style>
    .agrupadores {
      min-height: 300px;
    }
  </style>
  <div class="agrupadores">
    <sl-select name="tipoAgrupador" id="tipoAgrupador" label="Agrupador" clearable>
      <sl-menu-item value="Parte">Parte</sl-menu-item>
      <sl-menu-item value="Livro">Livro</sl-menu-item>
      <sl-menu-item value="Titulo">Título</sl-menu-item>
      <sl-menu-item value="Capitulo">Capítulo</sl-menu-item>
      <sl-menu-item value="Secao"">Seção</sl-menu-item>
      <sl-menu-item value="Subsecao"">Subseção</sl-menu-item>
    </sl-select>
  </div>
  <sl-button slot="footer" variant="default">Cancelar</sl-button>
  <sl-button slot="footer" variant="primary">Ok</sl-button>
  `);

  const botoes = content.querySelectorAll('sl-button');
  const cancelar = botoes[0];
  const ok = botoes[1];

  const tipoAgrupador = content.querySelector('#tipoAgrupador');

  const action = elemento.tipo === 'Artigo' ? adicionarAgrupadorArtigoAction : adicionarAgrupadorArtigoAntesAction;

  ok.onclick = (): void => {
    const tipo = (tipoAgrupador as any).value;
    if (tipo) {
      console.log(11111, 'tipo agrupador', tipo);
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
