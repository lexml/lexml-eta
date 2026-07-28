// No build largo (**/*.ts), o Shoelace augmenta HTMLElementTagNameMap ao ser importado pelos
// componentes. O harness Node compila só um recorte do domínio, então declaramos aqui o mínimo
// que revisaoUtil (puxado via Elemento → Revisao) referencia, para type-checar sem executá-lo.
interface SlDialogLike extends HTMLElement {
  label: string;
  show(): void;
  hide(): void;
}

interface HTMLElementTagNameMap {
  'sl-dialog': SlDialogLike;
}
