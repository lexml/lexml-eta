import { LitElement, html, TemplateResult } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { Option, AutocompleteAsync } from './autocomplete-async';
import { Norma } from '../../model/emenda/norma';

@customElement('autocomplete-norma')
export class AutocompleteNorma extends LitElement {
  @property({ type: String })
  urnInicial = '';

  @property({ type: Function })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  onSelect = (value: Norma): void => {};
  //onSelect = (value: Norma): void => console.log('Norma selecionado:', value);

  @state()
  _selectedNorma: Norma = new Norma();

  @state()
  _optionsNorma: Option[] = [];

  _normas: Norma[] = [];

  @query('#auto-complete-async')
  _autoCompleteAsync!: AutocompleteAsync;

  async _searchNormas(query: string): Promise<Norma[]> {
    try {
      const _response = await fetch(`api/autocomplete-norma?query=${query}`);
      const _normas = await _response.json();
      return _normas.map(n => new Norma(n.urn, n.nomePreferido, n.nomePorExtenso, n.nomes, n.nomesAlternativos, n.ementa));
    } catch (err) {
      console.log(err);
      window.alert('Erro inesperado ao consultar as normas');
    }
    return Promise.resolve([]);
  }

  _updateNormas(paramQuery: string): void {
    const query = paramQuery
      .replace(/[,;]| nº /gi, ' ')
      .replaceAll('.', '')
      .toLowerCase();
    this._searchNormas(query).then(normas => {
      this._normas = normas;
      this._optionsNorma = normas.map(n => new Option(n.urn, n.nomePreferido));
    });
  }

  _handleSearch(value: string): void {
    this._updateNormas(value);
  }

  _handleSelect(option: Option): void {
    const norma = this._normas.find(norma => norma.urn === option.value);
    if (norma) {
      this._selectedNorma = norma as Norma;
      this.onSelect(this._selectedNorma);
    }
  }

  _getNormaByURN(urn: string): void {
    const norma = new Norma(urn);
    const query = `${norma.sData()} ${norma.numero()}`;
    this._searchNormas(query).then(normas => {
      this._selectedNorma = normas.find(n => n.urn === urn) as Norma;
      this.onSelect(this._selectedNorma);
      this._autoCompleteAsync.value = this._selectedNorma.nomePreferido;
    });
  }

  firstUpdated(): void {
    if (this.urnInicial) {
      this._getNormaByURN(this.urnInicial);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _handleChange(value: string): void {
    // console.log('_handleChange', value);
    this._selectedNorma = new Norma();
    this.onSelect(this._selectedNorma);
  }

  render(): TemplateResult {
    return html`<style>
        .ajuda,
        .sp-ementa {
          font-size: var(--sl-font-size-small);
          font-weight: normal;
        }
        .wp-ementa {
          height: 85px;
          margin-top: 10px;
          overflow-y: auto;
        }
        .wp-ementa p {
          margin: 0;
        }
        .lb-ementa {
          display: block;
          margin-top: 10px;
        }
      </style>
      <div>
        <autocomplete-async
          id="auto-complete-async"
          label="Identificação da norma"
          placeholder="ex: Lei 10406 ou Código Civil"
          .items=${this._optionsNorma}
          .onSearch=${value => this._handleSearch(value)}
          .onSelect=${value => this._handleSelect(value)}
          .onChange=${value => this._handleChange(value)}
        ></autocomplete-async>
        <span class="ajuda">Informar a identificação da norma com tipo e número ou o apelido da norma. São aceitas abreviações como LCP e MPV.</span>
        <label class="lb-ementa">Ementa:</label>
        <div class="wp-ementa"><span class="sp-ementa">${(this._selectedNorma.ementa || '').slice(0, 450)}</span></div>
      </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'autocomplete-norma': AutocompleteNorma;
  }
}
