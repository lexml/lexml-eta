import { LitElement, html, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { REGEX_ACCENTS } from './../../util/string-util';
import { Parlamentar } from './../../model/autoria/parlamentar';
import { Autoria } from './../../model/autoria/autoria';
import { incluirNovoParlamentar, excluirParlamentar, moverParlamentar } from '../../model/autoria/parlamentarUtil';
import { autoriaCss } from '../../assets/css/autoria.css';

import './lexml-autocomplete';

const estadoInicialAutoria: Autoria = {
  tipo: 'Parlamentar',
  parlamentares: [],
  indImprimirPartidoUF: false,
  qtdAssinaturasAdicionaisDeputados: 0,
  qtdAssinaturasAdicionaisSenadores: 0,
};

const parlamentarVazio: Parlamentar = {
  id: '',
  nome: '',
  siglaPartido: '',
  siglaUF: '',
  indSexo: '',
  siglaCasa: '',
  cargo: '',
};

@customElement('lexml-autoria')
export class AutoriaComponent extends LitElement {
  static styles = [autoriaCss];

  @property({ type: Object })
  autoria: Autoria = { ...estadoInicialAutoria, parlamentares: [] };

  private _parlamentares: Parlamentar[] = [];

  @property({ type: Array })
  set parlamentares(value: Parlamentar[]) {
    // const oldValue = this._parlamentares;
    this._parlamentares = value;
    this.nomes = value.map(p => p.nome);
    // this.requestUpdate('parlamentares', oldValue);
  }

  get parlamentares(): Parlamentar[] {
    return this._parlamentares;
  }

  @state()
  titulo = 'Autoria';

  @state()
  nomes: string[] = [];

  @state()
  podeIncluirParlamentar = true;

  incluirNovoParlamentar(): void {
    this.autoria.parlamentares = incluirNovoParlamentar(this.autoria.parlamentares);
    this.podeIncluirParlamentar = false;
  }

  validarNomeParlamentar(ev: Event, index: number): void {
    const elParlamentar = ev.target as HTMLInputElement;
    const nome = elParlamentar.value;
    const regex = new RegExp('^' + nome.normalize('NFD').replace(REGEX_ACCENTS, '') + '$', 'i');
    const cargo = this.autoria.parlamentares[index].cargo;

    const parlamentar = this.parlamentares.find(p =>
      p.nome
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .match(regex)
    ) || { ...parlamentarVazio, nome, cargo };

    const parlamentarEhValido = !!parlamentar.id;
    this.podeIncluirParlamentar = parlamentarEhValido && this.autoria.parlamentares.filter((_, _index) => _index !== index).every(p => p.id);

    // A linha abaixo atualiza o parlamentar na lista de autores e reflete a atualização na tela
    this.autoria.parlamentares[index] = { ...parlamentar, cargo };

    if (ev.type === 'blur') {
      // O trecho abaixo está dentro de um setTimeout porque o clique de um nome na lista do autocomplete dispara o evento "blur"
      // e é preciso para dar tempo do @autocomplete ser executado e preencher o input com um nome válido antes da segunda consulta
      setTimeout(() => {
        const nomeAux = elParlamentar.value;
        const parlamentarAux = this.parlamentares.find(p => p.nome === nomeAux);
        if (!parlamentarAux) {
          // A linha abaixo atualiza o parlamentar na lista de autores, mas NÃO reflete a atualização na tela
          this.autoria.parlamentares[index] = { ...parlamentarVazio };

          // TODO: descobrir porque a linha acima não é suficiente para atualizar o "value" dos inputs
          const elCargo = elParlamentar.parentNode!.parentNode!.querySelector('input#tex-cargo')!;
          elParlamentar.value = '';
          (elCargo as HTMLInputElement).value = '';
        }
      }, 200);
    }
  }

  moverParlamentar(index: number, deslocamento: number): void {
    this.autoria.parlamentares = moverParlamentar(this.autoria.parlamentares, index, deslocamento);
    this.requestUpdate();
  }

  excluirParlamentar(index: number): void {
    this.autoria.parlamentares = excluirParlamentar(this.autoria.parlamentares, index);
    this.podeIncluirParlamentar = this.autoria.parlamentares.every(p => p.id);
    this.requestUpdate();
  }

  render(): TemplateResult {
    return html`
      <div class="lexml-autoria">
        <h3>Autoria</h3>
        ${this.getTipoAutoriaTemplate()}
        <div class="autoria-list">${this.getParlamentaresTemplate()}</div>
        <button @click=${this.incluirNovoParlamentar} ?disabled=${!this.podeIncluirParlamentar}>Incluir ${this.autoria.parlamentares.length ? 'outro' : ''} parlamentar</button>
        ${this.getAssinaturasAdicionaisTemplate()}
      </div>
    `;
  }

  _exibirTipoAutoria = false;
  private getTipoAutoriaTemplate(): TemplateResult {
    return !this._exibirTipoAutoria
      ? html`<div></div>`
      : html`
          <fieldset class="autoria-label--tipo-autoria">
            <legend>Tipo de autoria</legend>
            <div class="control">
              <label class="radio">
                <input type="radio" id="opt-parlamentar" name="tipoAutoria" value="Parlamentar" ?checked=${this.autoria?.tipo === 'Parlamentar'} />
                Parlamentar
              </label>
              <label class="radio">
                <input type="radio" id="opt-comissao" name="tipoAutoria" value="Comissão" ?checked=${this.autoria?.tipo === 'Comissão'} />
                Comissão
              </label>
            </div>
          </fieldset>
        `;
  }

  private getParlamentaresTemplate(): TemplateResult {
    return html`
      <div class="autoria-grid autoria-labels">
        <div class="autoria-grid--col1"><div class="autoria-header">Parlamentar</div></div>
        <div class="autoria-grid--col2"><div class="autoria-header">Cargo</div></div>
        <div class="autoria-grid--col3"><div class="autoria-buttons"></div></div>
      </div>
      ${this.autoria?.parlamentares.map((_, index) => this.getParlamentarAutocompleteTemplate(index))}
    `;
  }

  private getParlamentarAutocompleteTemplate(index: number): TemplateResult {
    return html`
      <div class="autoria-grid">
        <div class="autoria-grid--col1">
          <label for="defaultInput" class="autoria-label">Parlamentar</label>
          <lexml-autocomplete
            class="lexml-autocomplete"
            .items=${this.nomes}
            .text=${this.autoria.parlamentares[index].nome}
            @input=${(ev: Event): void => this.validarNomeParlamentar(ev, index)}
            @blur=${(ev: Event): void => this.validarNomeParlamentar(ev, index)}
            @autocomplete=${(ev: CustomEvent): void => this.atualizarParlamentar(ev, index)}
          ></lexml-autocomplete>
          <!-- <input
            .value=${this.autoria.parlamentares[index].nome}
            @input=${(ev: Event): void => this.validarNomeParlamentar(ev, index)}
            @blur=${(ev: Event): void => this.validarNomeParlamentar(ev, index)}
          /> -->
        </div>

        <div class="autoria-grid--col2">
          <label for="tex-cargo" class="autoria-label">Cargo</label>
          <input
            type="text"
            id="tex-cargo"
            placeholder="ex: Presidente da Comissão ..., Líder do ..."
            class="autoria-input"
            aria-label="Cargo"
            .value=${this.autoria.parlamentares[index].cargo ?? ''}
            @input=${(ev: Event): void => this.atualizarCargo(ev, index)}
          />
        </div>

        <div class="autoria-grid--col3">
          <div class="autoria-buttons">
            <button class="autoria-button" id="paraBaixo" aria-label="Para baixo" title="Para baixo" @click=${(): void => this.moverParlamentar(index, 1)}>
              <i class="autoria-icon icon-down"></i>
              <span class="sr-only">Para baixo</span>
            </button>
            <button class="autoria-button" id="paraBaixo" aria-label="Para cima" title="Para cima" @click=${(): void => this.moverParlamentar(index, -1)}>
              <i class="autoria-icon icon-up"></i>
              <span class="sr-only">Para cima</span>
            </button>
            <button class="autoria-button" id="paraBaixo" aria-label="Excluir" title="Excluir" @click=${(): void => this.excluirParlamentar(index)}>
              <i class="autoria-icon icon-delete"></i>
              <span class="sr-only">Exluir</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private getAssinaturasAdicionaisTemplate(): TemplateResult {
    return html`
      <div class="assinaturas-adicionais">
        <div>
          <label for="num-assinaturas-adicionais-senadores" class="assinaturas-adicionais-label">Quantidade de assinaturas adicionais de Senadores</label>
          <input
            type="text"
            id="num-assinaturas-adicionais-senadores"
            class="autoria-input"
            aria-label="Assinaturas Adicionais Senadores"
            .value=${this.autoria.qtdAssinaturasAdicionaisSenadores.toString()}
            @input=${(ev: Event): void => this.atualizarQtdAssinaturasAdicionaisSenadores(ev)}
          />
        </div>

        <div>
          <label for="num-assinaturas-adicionais-deputados" class="assinaturas-adicionais-label">Quantidade de assinaturas adicionais de Deputados Federais</label>
          <input
            type="text"
            id="num-assinaturas-adicionais-deputados"
            class="autoria-input"
            aria-label="Assinaturas Adicionais deputados"
            .value=${this.autoria.qtdAssinaturasAdicionaisDeputados.toString()}
            @input=${(ev: Event): void => this.atualizarQtdAssinaturasAdicionaisDeputados(ev)}
          />
        </div>
      </div>
    `;
  }

  private atualizarParlamentar(ev: CustomEvent, index: number): void {
    const parlamentarAutocomplete = this.parlamentares.find(p => p.nome === ev.detail.value);
    if (parlamentarAutocomplete) {
      const { cargo } = this.autoria.parlamentares[index];
      this.autoria.parlamentares[index] = {
        ...parlamentarAutocomplete,
        cargo,
      };
    }
    this.podeIncluirParlamentar = !!parlamentarAutocomplete;

    // TODO: setar o foco para o input do autocomplete

    // Sem a linha abaixo a atualização do cargo do último "novo parlamentar" inserido não funciona
    this.requestUpdate();
  }

  private atualizarCargo(ev: Event, index: number): void {
    this.autoria.parlamentares[index].cargo = (ev.target as HTMLInputElement).value;
  }

  private atualizarQtdAssinaturasAdicionaisSenadores(ev: Event): void {
    this.autoria.qtdAssinaturasAdicionaisSenadores = Number((ev.target as HTMLInputElement).value);
  }

  private atualizarQtdAssinaturasAdicionaisDeputados(ev: Event): void {
    this.autoria.qtdAssinaturasAdicionaisDeputados = Number((ev.target as HTMLInputElement).value);
  }
}
