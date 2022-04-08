import { REGEX_ACCENTS } from './../../util/string-util';
import { LitElement, html, TemplateResult, PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('lexml-autocomplete')
export class LexmlAutocomplete extends LitElement {
  @property({ type: Array })
  items: string[] = [];

  @property({ type: Boolean, reflect: true })
  opened = false;

  @property({ type: Number })
  maxSuggestions = 10;

  @property({ type: String })
  text = '';

  _suggestions: string[] = [];

  _bound: any = {};

  _inputEl: any;

  _suggestionEl: any;

  _highlightedEl: any;

  _blur = false;

  _mouseEnter = false;

  render(): TemplateResult {
    return html`
      <style>
        :host {
          --nega-autocomplete-container: {
          }
          --nega-autocomplete-item: {
          }
          --nega-autocomplete-highlight: {
          }
        }
        ul {
          position: absolute;
          display: block;
          list-style-type: none;
          margin: 0;
          padding: 0;
          z-index: 10000;
          border: 1px solid grey;
          background: white;
          @apply --nega-autocomplete-container;
        }
        li {
          padding: 4px;
          @apply --nega-autocomplete-item;
        }
        li.active {
          background: whitesmoke;
          @apply --nega-autocomplete-highlight;
        }
        [hidden] {
          display: none;
        }

        .lexml-autocomplete-input {
          width: 180px;
        }

        @media (max-width: 576px) {
          .lexml-autocomplete-label {
            width: calc(100% - 10px);
            display: block;
          }
          .lexml-autocomplete-input {
            width: calc(100% - 10px);
          }
        }
      </style>
      <slot id="dropdown-input"><input id="defaultInput" class="lexml-autocomplete-input" type="text" placeholder="Parlamentar" .value=${this.text} /></slot>
      <ul id="suggestions" ?hidden=${!this.opened} @mouseenter=${this._handleItemMouseEnter} @mouseleave=${this._handleItemMouseLeave}>
        ${this._suggestions.map(item => html`<li @click=${(): void => this.autocomplete(item)}>${item}</li>`)}
      </ul>
    `;
  }

  /**
   * Input element getter
   */
  get contentElement(): any {
    if (this._inputEl) return this._inputEl; // Cache
    if (!this.hasUpdated) return undefined; // No shadow root, no element to use

    const slotElement = this.shadowRoot!.getElementById('dropdown-input') as HTMLSlotElement;
    const slotInputList = slotElement.assignedElements();
    this._inputEl = slotInputList.length ? slotInputList[0] : this.shadowRoot!.getElementById('defaultInput');
    return this._inputEl;
  }

  /**
   * Value getter from input element.
   */
  get value(): any {
    return this.contentElement && this.contentElement.value;
  }

  /**
   * Value setter to input element.
   */
  set value(value) {
    if (!this.contentElement) return;

    this.contentElement.value = value;
  }

  firstUpdated(): void {
    this._suggestionEl = this.shadowRoot!.getElementById('suggestions');
    this._suggestionEl.style.width = `${this.contentElement.getBoundingClientRect().width}px`;

    this._bound.onKeyDown = this._handleKeyDown.bind(this);
    this._bound.onKeyUp = this._handleKeyUp.bind(this);
    this._bound.onFocus = this._handleFocus.bind(this);
    this._bound.onBlur = this._handleBlur.bind(this);

    this.contentElement.addEventListener('keydown', this._bound.onKeyDown);
    this.contentElement.addEventListener('keyup', this._bound.onKeyUp);
    this.contentElement.addEventListener('focus', this._bound.onFocus);
    this.contentElement.addEventListener('blur', this._bound.onBlur);
  }

  disconnectedCallback(): void {
    if (!this.contentElement) return; // no events to remove
    this.contentElement.removeEventListener('keydown', this._bound.onKeyDown);
    this.contentElement.removeEventListener('keyup', this._bound.onKeyUp);
    this.contentElement.removeEventListener('focus', this._bound.onFocus);
    this.contentElement.removeEventListener('blur', this._bound.onBlur);
  }

  focus(options?: FocusOptions): void {
    if (this.contentElement) {
      this.contentElement.focus(options);
    }
  }

  updated(changed: PropertyValues): void {
    if (changed.has('opened') && this.opened && this._suggestionEl.childElementCount) {
      // Highlight the first when there are suggestions
      // eslint-disable-next-line prefer-destructuring
      this._highlightedEl = this._suggestionEl.children[0];
      this._highlightedEl.classList.add('active');
    }
  }

  /**
   * Open suggestions.
   */
  open(): void {
    if (this._suggestionEl.style.width === '0px') {
      this._suggestionEl.style.width = `${this.contentElement.getBoundingClientRect().width}px`;
    }

    if (this._suggestions.length) {
      this.opened = true;
    }
  }

  /**
   * Close suggestions.
   */
  close(): void {
    this.opened = false;
    this._highlightedEl = null;
  }

  /**
   * Suggest autocomplete items.
   * @param {Array<String>} suggestions
   */
  suggest(suggestions: string[]): void {
    this._suggestions = suggestions || [];
    // eslint-disable-next-line no-unused-expressions
    this._suggestions.length > 1 || (this._suggestions.length === 1 && this._suggestions[0] !== this.contentElement.value) ? this.open() : this.close();
    this.requestUpdate();
  }

  /**
   * Autocomplete input with `value`.
   * @param {String} value
   */
  autocomplete(value: string): void {
    this.contentElement.value = value;
    this.close();
    this.dispatchEvent(
      new CustomEvent('autocomplete', {
        detail: { value },
        composed: true,
        bubbles: true,
      })
    );
  }

  _highlightPrev(): void {
    if (!this._highlightedEl || !this._highlightedEl.previousElementSibling) return;

    this._highlightedEl.classList.remove('active');
    this._highlightedEl = this._highlightedEl.previousElementSibling;
    this._highlightedEl.classList.add('active');
  }

  _highlightNext(): void {
    if (!this._highlightedEl || !this._highlightedEl.nextElementSibling) return;

    this._highlightedEl.classList.remove('active');
    this._highlightedEl = this._highlightedEl.nextElementSibling;
    this._highlightedEl.classList.add('active');
  }

  // eslint-disable-next-line class-methods-use-this
  _handleKeyDown(ev: KeyboardEvent): void {
    // Prevent up and down from behaving as home and end on some browsers
    if (ev.key === 'ArrowUp' || ev.key === 'ArrowDown') {
      ev.preventDefault();
      ev.stopPropagation();
    }
  }

  _handleKeyUp(ev: KeyboardEvent): void {
    switch (ev.key) {
      case 'ArrowUp':
        ev.preventDefault();
        ev.stopPropagation();
        this._highlightPrev();
        break;
      case 'ArrowDown':
        ev.preventDefault();
        ev.stopPropagation();
        this._highlightNext();
        break;
      case 'Enter':
        // Select
        // eslint-disable-next-line no-unused-expressions
        this._highlightedEl && this._highlightedEl.click();
        break;
      default:
        // TODO debounce
        if (this.items.length) {
          const { value } = this.contentElement;
          const normalizedValue = value.normalize('NFD').replace(REGEX_ACCENTS, '');
          this.suggest(this._findSuggetions(normalizedValue));
        }
    }
  }

  _findSuggetions(value?: string, nItemsResult = this.maxSuggestions): string[] {
    if (!value) {
      return [];
    }
    let suggestions = this._filterStartWith(value, nItemsResult);
    if (suggestions.length < this.maxSuggestions) {
      suggestions = [...suggestions, ...this._filterContains(value, this.maxSuggestions - suggestions.length).filter(item => !suggestions.includes(item))];
    }
    return suggestions;
  }

  _filterStartWith(value: string, itemsResult = this.maxSuggestions): string[] {
    const regexStartWith = new RegExp('^' + value, 'gi');
    return (
      (value &&
        this.items
          .filter(item =>
            item
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .match(regexStartWith)
          )
          .slice(0, itemsResult)) ||
      []
    );
  }

  _filterContains(value: string, itemsResult = this.maxSuggestions): string[] {
    const regexContains = new RegExp(value, 'gi');
    return (
      (value &&
        this.items
          .filter(item =>
            item
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .match(regexContains)
          )
          .slice(0, itemsResult)) ||
      []
    );
  }

  _handleFocus(): void {
    this._blur = false;
    // eslint-disable-next-line no-unused-expressions
    this._suggestions.length > 1 && this.open();
  }

  _handleBlur(): void {
    this._blur = true;
    // eslint-disable-next-line no-unused-expressions
    // !this._mouseEnter && this.close();
    setTimeout(() => this.close(), 200);
    this._suggestions = [];
  }

  // Handle mouse change focus to suggestions
  _handleItemMouseEnter(): void {
    this._mouseEnter = true;
  }

  _handleItemMouseLeave(): void {
    this._mouseEnter = false;
    // eslint-disable-next-line no-unused-expressions
    this._blur && setTimeout(() => this.close(), 500); // Give user some slack before closing
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lexml-autocomplete': LexmlAutocomplete;
  }
}
