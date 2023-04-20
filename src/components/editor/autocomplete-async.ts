import { LitElement, html, TemplateResult, PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('autocomplete-async')
export class AutocompleteAsync extends LitElement {
  @property({ type: String })
  placeholder = '';
  @property({ type: String })
  label = '';
  @property({ type: Array, reflect: true })
  items: Option[] = [];

  @property({ type: Boolean, reflect: true })
  opened = false;

  @property({ type: Number })
  maxSuggestions = 10;

  @property({ type: Function })
  onSearch = (value: string): void => console.log('Texto da pesquisa', value);

  @property({ type: Function })
  onSelect = (value: Option): void => console.log('Item selecionado:', value);

  @property({ type: Function })
  onChange = (value: string): void => console.log('Mudança texto:', value);

  _interval = 1000;

  _timer: any;

  _bound: any = {};

  _inputEl: any;

  _suggestionEl: any;

  _highlightedEl: any;

  _blur = false;

  _mouseEnter = false;

  _search = (): void => {
    const { value } = this.contentElement;
    clearTimeout(this._timer);

    if (value.length >= 5) {
      this._timer = setTimeout(() => {
        this.onSearch(value);
      }, this._interval);
    }
  };

  render(): TemplateResult {
    return html`
      <style>
        .suggest-container {
          position: relative;
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
        }
        li {
          padding: 4px;
          cursor: pointer;
        }
        li.active {
          background: whitesmoke;
        }
        [hidden] {
          display: none;
        }

        .lexml-autocomplete-input {
          width: 100%;
        }

        @media (max-width: 576px) {
          .lexml-autocomplete-label {
            width: calc(100% - 2px);
            display: block;
          }
          .lexml-autocomplete-input {
            width: calc(100% - 2px);
          }
        }
      </style>
      <slot id="dropdown-input">
        <sl-input
          id="defaultInput"
          class="lexml-autocomplete-input"
          type="text"
          label=${this.label}
          placeholder=${this.placeholder}
          .value=${this.value?.description || ''}
          @change=${e => this._handleChange(e.target.value)}
        ></sl-input>
      </slot>
      <div class="suggest-container">
        <ul id="suggestions" ?hidden=${!this.opened} @mouseenter=${this._handleItemMouseEnter} @mouseleave=${this._handleItemMouseLeave}>
          ${this.items.map((item: Option) => html`<li @click=${(): void => this.autocomplete(item)}>${item.description}</li>`)}
        </ul>
      </div>
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

  private _tempValue?: Option;
  /**
   * Value getter from input element.
   */
  get value(): any {
    return this.contentElement && this.contentElement.value;
  }

  /**
   * Value setter to input element.
   */
  @property({ type: String })
  set value(value) {
    if (!this.contentElement) {
      this._tempValue = value;
      return;
    }

    this.contentElement.value = value;
  }

  firstUpdated(): void {
    this._suggestionEl = this.shadowRoot!.getElementById('suggestions');
    this._suggestionEl.style.width = `${this.contentElement.getBoundingClientRect().width}px`;

    this._bound.onKeyDown = this._handleKeyDown.bind(this);
    this._bound.onKeyUp = this._handleKeyUp.bind(this);
    this._bound.onFocus = this._handleFocus.bind(this);
    this._bound.onBlur = this._handleBlur.bind(this);
    this._bound.onChange = this._handleChange.bind(this);

    this.contentElement.addEventListener('keydown', this._bound.onKeyDown);
    this.contentElement.addEventListener('keyup', this._bound.onKeyUp);
    this.contentElement.addEventListener('focus', this._bound.onFocus);
    this.contentElement.addEventListener('blur', this._bound.onBlur);
    this.contentElement.addEventListener('sl-input', this._bound.onChange);

    if (this._tempValue !== undefined) {
      this.contentElement.value = this._tempValue;
    }
  }

  disconnectedCallback(): void {
    if (!this.contentElement) return; // no events to remove
    this.contentElement.removeEventListener('keydown', this._bound.onKeyDown);
    this.contentElement.removeEventListener('keyup', this._bound.onKeyUp);
    this.contentElement.removeEventListener('focus', this._bound.onFocus);
    this.contentElement.removeEventListener('blur', this._bound.onBlur);
    this.contentElement.removeEventListener('sl-input', this._bound.onChange);
  }

  focus(options?: FocusOptions): void {
    if (this.contentElement) {
      this.contentElement.focus(options);
    }
  }

  updated(changed: PropertyValues): void {
    if (changed.has('items')) {
      this.items.length > 1 || (this.items.length === 1 && this.items[0] !== this.contentElement.value) ? this.open() : this.close();
    }

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

    if (this.items.length) {
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
   * Autocomplete input with `value`.
   * @param {String} value
   */
  autocomplete(value: Option): void {
    this.contentElement.value = value;
    this.onSelect(value);
    this.close();
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
  _handleChange(value: string): void {
    this.onChange(value);
  }

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
        if (this._highlightedEl?.previousElementSibling) {
          ev.preventDefault();
          ev.stopPropagation();
          this._highlightPrev();
        }
        break;
      case 'ArrowDown':
        if (this._highlightedEl?.nextElementSibling) {
          ev.preventDefault();
          ev.stopPropagation();
          this._highlightNext();
        }
        break;
      case 'Enter':
        // eslint-disable-next-line no-unused-expressions
        this._highlightedEl && this._highlightedEl.click();
        this.contentElement.blur();
        break;
      default:
        this._search();
    }
  }

  _handleFocus(): void {
    this._blur = false;
    // eslint-disable-next-line no-unused-expressions
    this.items.length > 1 && this.open();
  }

  _handleBlur(): void {
    this._blur = true;
    // eslint-disable-next-line no-unused-expressions
    setTimeout(() => this.close(), 200);
    //this.items = [];
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

export class Option {
  description: string;
  value: string;

  constructor(value, description) {
    this.description = description;
    this.value = value;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'autocomplete-async': AutocompleteAsync;
  }
}
