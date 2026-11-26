import { Elemento } from '../../model/elemento';
import { adicionarAgrupadorArtigoAction } from './../../model/lexml/acao/adicionarAgrupadorArtigoAction';

export const adicionarAgrupadorArtigoDialog = (elemento: Elemento, quill: any, store: any): void => {
  Array.from(document.querySelectorAll('#slDialogAdicionarAgrupadorArtigo')).forEach(el => document.body.removeChild(el));

  const tipoPai = elemento.hierarquia?.pai?.tipo;
  const defaultValue = elemento.agrupador ? elemento.tipo : tipoPai === 'Articulacao' ? 'Capitulo' : tipoPai;
  // No artigo, "antes" mantém o resultado de quem confirmava direto antes da #1078.
  const posicaoPadrao = elemento.tipo === 'Artigo' ? 'antes' : 'depois';

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
  <div>
    <sl-radio-group fieldset label="Posicionamento" id="rdgPosicao">
      <sl-radio class="posicao-agrupador" id="posicao-antes" value="antes" ${posicaoPadrao === 'antes' ? 'checked' : ''}>Antes</sl-radio>
      <sl-radio class="posicao-agrupador" id="posicao-depois" value="depois" ${posicaoPadrao === 'depois' ? 'checked' : ''}>Depois</sl-radio>
    </sl-radio-group>
  </div>
  <div>
    <sl-checkbox id="chkManterNoMesmoGrupoDeAspas">Manter no mesmo grupo de aspas</sl-checkbox>
  </div>
  <sl-button slot="footer" variant="default">Cancelar</sl-button>
  <sl-button slot="footer" variant="primary">Ok</sl-button>
  `);

  const opcoes = Array.from(content.querySelectorAll('.tipo-agrupador'));

  const tiposPermitidos = [...elemento.tiposAgrupadoresQuePodemSerInseridosAntes!, ...elemento.tiposAgrupadoresQuePodemSerInseridosDepois!];

  const defaultAux = tiposPermitidos.length === 1 ? tiposPermitidos[0] : defaultValue;
  const elTipoAgrupadorDefault = opcoes.find(el => (el as any).value === defaultAux) as any;
  elTipoAgrupadorDefault.checked = true;

  opcoes.forEach(el => {
    const element = el as HTMLInputElement;
    element.disabled = !tiposPermitidos.includes(element.value);
    element.checked = element.disabled ? false : element.checked;
    if (element.checked) {
      setTimeout(() => {
        element.focus();
      }, 0);
    }
  });

  const botoes = content.querySelectorAll('sl-button');
  const cancelar = botoes[0];
  const ok = botoes[1];
  const optPosicaoAntes = content.querySelector('#posicao-antes')! as any;
  const optPosicaoDepois = content.querySelector('#posicao-depois')! as any;

  const chkManterNoMesmoGrupoDeAspas = content.querySelector('#chkManterNoMesmoGrupoDeAspas')! as HTMLInputElement;

  let ultimoValorDeChkManterNoMesmoGrupoDeAspasSelecionadoPorUsuario = false;
  chkManterNoMesmoGrupoDeAspas.checked = ultimoValorDeChkManterNoMesmoGrupoDeAspasSelecionadoPorUsuario;

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
    if (!tiposPermitidos.includes(evt.target.value)) {
      return;
    }

    optPosicaoAntes.disabled = !elemento.tiposAgrupadoresQuePodemSerInseridosAntes!.includes(evt.target.value);
    optPosicaoDepois.disabled = !elemento.tiposAgrupadoresQuePodemSerInseridosDepois!.includes(evt.target.value);

    if (!optPosicaoAntes.disabled && !optPosicaoDepois.disabled) {
      optPosicaoAntes.checked = posicaoPadrao === 'antes';
      optPosicaoDepois.checked = posicaoPadrao === 'depois';
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
    const posicao = (document.querySelector('sl-radio.posicao-agrupador[aria-checked="true"]') as any).value;
    const manterNoMesmoGrupoDeAspas = chkManterNoMesmoGrupoDeAspas.checked;
    if (tipo) {
      // const manterNoMesmoGrupoDeAspas = elemento.tipo !== 'Artigo' || elemento.hierarquia?.pai?.tipo !== 'Articulacao';
      store.dispatch(adicionarAgrupadorArtigoAction.execute(elemento, tipo, undefined, posicao, manterNoMesmoGrupoDeAspas));
    }
    dialogElem?.hide();
    document.body.removeChild(dialogElem);
  };

  cancelar.onclick = (): void => {
    quill.focus();
    dialogElem?.hide();
    document.body.removeChild(dialogElem);
  };

  setTimeout(() => elTipoAgrupadorDefault.click(), 0);

  quill.blur();
  dialogElem.appendChild(content);
  dialogElem.show();
};
