import { LitElement, customElement, property, PropertyValues } from 'lit-element';

@customElement('lexml-parlamentar-autocomplete')
export class ParlamentarAutocomplete extends LitElement {
  @property({ type: Object }) parlamentar = {};

  update(changedProperties: PropertyValues): void {
    super.update(changedProperties);
  }
}
