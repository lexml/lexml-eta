import { Elemento } from '../../model/elemento';
import { adicionarAgrupadorArtigoAction, adicionarAgrupadorArtigoAntesAction } from './../../model/lexml/acao/adicionarAgrupadorArtigoAction';

export const adicionarAgrupadorArtigoDialog = (elemento: Elemento, quill: any, store: any): void => {
  Array.from(document.querySelectorAll('#slDialogAdicionarAgrupadorArtigo')).forEach(el => document.body.removeChild(el));

  const tipoPai = elemento.hierarquia?.pai?.tipo;
  const defaultValue = elemento.agrupador ? elemento.tipo : tipoPai === 'Articulacao' ? 'Capitulo' : tipoPai;

  const dialogElem = document.createElement('sl-dialog');
  dialogElem.id = 'slDialogAdicionarAgrupadorArtigo';

  document.body.appendChild(dialogElem);
  dialogElem.label = 'Adicionar agrupador de artigo';

  dialogElem.addEventListener('sl-request-close', (event: any) => {
    if (event.detail.source === 'overlay') {
      event.preventDefault();
    }
  });

  const content = document.createRange().createContextualFragment(`
  <style>

    #chkManterNoMesmoGrupoDeAspas {
      margin: 10px;
    }
    #chkManterNoMesmoGrupoDeAspas[disabled] {
      display: none;
    }
    #rdgPosicao {
      margin-top: 20px;
    }

  </style>
  <div class="agrupadores">
    <sl-radio-group fieldset label="Tipo de agrupador" id="rdgTipoAgrupador">
      <sl-radio class="tipo-agrupador" id="Parte" value="Parte">Parte</sl-radio>
      <sl-radio class="tipo-agrupador" id="Livro" value="Livro">Livro</sl-radio>
      <sl-radio class="tipo-agrupador" id="Titulo" value="Titulo">Título</sl-radio>
      <sl-radio class="tipo-agrupador" id="Capitulo" value="Capitulo">Capítulo</sl-radio>
      <sl-radio class="tipo-agrupador" id="Secao" value="Secao">Seção</sl-radio>
      <sl-radio class="tipo-agrupador" id="Subsecao" value="Subsecao">Subseção</sl-radio>
    </sl-radio-group>
  </div>
  <div style="display: ${elemento.tipo === 'Artigo' ? 'none' : 'block'};">
    <sl-radio-group fieldset label="Posicionamento" id="rdgPosicao">
      <sl-radio class="posicao-agrupador" id="posicao-antes" value="antes">Antes</sl-radio>
      <sl-radio class="posicao-agrupador" id="posicao-depois" value="depois" checked>Depois</sl-radio>
    </sl-radio-group>
  </div>
  <div>
    <sl-checkbox id="chkManterNoMesmoGrupoDeAspas">Manter no mesmo grupo de aspas</sl-checkbox>
  </div>
  <sl-button slot="footer" variant="default">Cancelar</sl-button>
  <sl-button slot="footer" variant="primary">Ok</sl-button>
  `);

  const opcoes = Array.from(content.querySelectorAll('.tipo-agrupador'));

  const tiposPermitidos = [...elemento.tiposAgrupadoresQuePodemSerInseridosAntes!];
  if (elemento.tipo !== 'Artigo') {
    tiposPermitidos.push(...elemento.tiposAgrupadoresQuePodemSerInseridosDepois!);
  }

  const defaultAux = tiposPermitidos.length === 1 ? tiposPermitidos[0] : defaultValue;
  (opcoes.find(el => (el as any).value === defaultAux) as any).checked = true;

  opcoes.forEach(el => {
    (el as any).disabled = !tiposPermitidos.includes((el as any).value);
    (el as any).checked = (el as any).disabled ? false : (el as any).checked;
  });

  const botoes = content.querySelectorAll('sl-button');
  const cancelar = botoes[0];
  const ok = botoes[1];
  const optPosicaoAntes = content.querySelector('#posicao-antes')! as any;
  const optPosicaoDepois = content.querySelector('#posicao-depois')! as any;

  const chkManterNoMesmoGrupoDeAspas = content.querySelector('#chkManterNoMesmoGrupoDeAspas')! as HTMLInputElement;

  let ultimoValorDeChkManterNoMesmoGrupoDeAspasSelecionadoPorUsuario = false;
  chkManterNoMesmoGrupoDeAspas.checked = ultimoValorDeChkManterNoMesmoGrupoDeAspasSelecionadoPorUsuario;

  const action = elemento.tipo === 'Artigo' ? adicionarAgrupadorArtigoAction : adicionarAgrupadorArtigoAntesAction;

  const validarStatusChkManterNoMesmoGrupoDeAspas = (): void => {
    const posicao = (document.querySelector('sl-radio.posicao-agrupador[aria-checked="true"]') as any)?.value;
    const isCabecaAlteracao = elemento.abreAspas && elemento.fechaAspas;

    if (elemento.agrupador) {
      if (isCabecaAlteracao) {
        chkManterNoMesmoGrupoDeAspas.disabled = false;
        chkManterNoMesmoGrupoDeAspas.checked = ultimoValorDeChkManterNoMesmoGrupoDeAspasSelecionadoPorUsuario;
      } else if ((!elemento.abreAspas && !elemento.fechaAspas) || (elemento.abreAspas && posicao === 'depois') || (elemento.fechaAspas && posicao === 'antes')) {
        chkManterNoMesmoGrupoDeAspas.disabled = true;
        chkManterNoMesmoGrupoDeAspas.checked = true;
      } else {
        chkManterNoMesmoGrupoDeAspas.disabled = false;
        chkManterNoMesmoGrupoDeAspas.checked = ultimoValorDeChkManterNoMesmoGrupoDeAspasSelecionadoPorUsuario;
      }
    } else {
      chkManterNoMesmoGrupoDeAspas.disabled = true;
      chkManterNoMesmoGrupoDeAspas.checked = !elemento.abreAspas;
    }
  };

  chkManterNoMesmoGrupoDeAspas.onchange = (evt: any): void => {
    ultimoValorDeChkManterNoMesmoGrupoDeAspasSelecionadoPorUsuario = evt.target.checked;
  };

  setTimeout(() => validarStatusChkManterNoMesmoGrupoDeAspas(), 0);

  (content.querySelector('#rdgPosicao')! as any).onclick = (): void => {
    validarStatusChkManterNoMesmoGrupoDeAspas();
  };

  (content.querySelector('#rdgTipoAgrupador')! as any).onclick = (evt: any): void => {
    if (elemento.tipo === 'Artigo' || !tiposPermitidos.includes(evt.target.value)) {
      return;
    }

    optPosicaoAntes.disabled = !elemento.tiposAgrupadoresQuePodemSerInseridosAntes!.includes(evt.target.value);
    optPosicaoDepois.disabled = !elemento.tiposAgrupadoresQuePodemSerInseridosDepois!.includes(evt.target.value);

    if (!optPosicaoAntes.disabled && !optPosicaoDepois.disabled) {
      optPosicaoAntes.checked = false;
      optPosicaoDepois.checked = true;
    } else {
      optPosicaoAntes.checked = !optPosicaoAntes.disabled;
      optPosicaoDepois.checked = !optPosicaoDepois.disabled;
    }

    // optPosicaoDepois.checked = tiposAgrupadorArtigo.indexOf(evt.target.value) >= tiposAgrupadorArtigo.indexOf(elemento.tipo!);
    // optPosicaoAntes.checked = !optPosicaoDepois.checked;

    validarStatusChkManterNoMesmoGrupoDeAspas();
  };

  ok.onclick = (): void => {
    const tipo = (document.querySelector('sl-radio.tipo-agrupador[aria-checked="true"]') as any).value;
    const posicao = elemento.tipo === 'Artigo' ? 'antes' : (document.querySelector('sl-radio.posicao-agrupador[aria-checked="true"]') as any).value;
    const manterNoMesmoGrupoDeAspas = chkManterNoMesmoGrupoDeAspas.checked;
    if (tipo) {
      // const manterNoMesmoGrupoDeAspas = elemento.tipo !== 'Artigo' || elemento.hierarquia?.pai?.tipo !== 'Articulacao';
      store.dispatch(action.execute(elemento, tipo, undefined, posicao, manterNoMesmoGrupoDeAspas));
    }
    dialogElem?.hide();
    document.body.removeChild(dialogElem);
  };

  cancelar.onclick = (): void => {
    quill.focus();
    dialogElem?.hide();
    document.body.removeChild(dialogElem);
  };

  quill.blur();
  dialogElem.appendChild(content);
  dialogElem.show();
};
