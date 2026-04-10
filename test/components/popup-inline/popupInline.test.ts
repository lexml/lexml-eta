import { expect } from '@open-wc/testing';
import { BotaoPopup, ConfiguracaoPopup, criarPopup, esconderPopup, mostrarPopup } from '../../../src/components/popup-inline/popupInline';

const ICONE_TESTE = '<svg><circle/></svg>';

function criarConfigBasica(overrides: Partial<ConfiguracaoPopup> = {}): ConfiguracaoPopup {
  return {
    rotulo: 'Art. 1º',
    botoes: [],
    ...overrides,
  };
}

function criarBotao(overrides: Partial<BotaoPopup> = {}): BotaoPopup {
  return {
    titulo: 'Ação',
    icone: ICONE_TESTE,
    acao: () => {
      //empty
    },
    ...overrides,
  };
}

describe('criarPopup()', () => {
  it('retorna um HTMLDivElement', () => {
    const popup = criarPopup();
    expect(popup).to.be.instanceOf(HTMLDivElement);
  });

  it('contém o elemento de info', () => {
    const popup = criarPopup();
    expect(popup.querySelector('.remissao-popup__info')).to.not.be.null;
  });

  it('contém o elemento de rotulo', () => {
    const popup = criarPopup();
    expect(popup.querySelector('.remissao-popup__rotulo')).to.not.be.null;
  });

  it('contém o elemento de preview', () => {
    const popup = criarPopup();
    expect(popup.querySelector('.remissao-popup__preview')).to.not.be.null;
  });

  it('contém o container de acoes', () => {
    const popup = criarPopup();
    expect(popup.querySelector('.remissao-popup__acoes')).to.not.be.null;
  });

  it('começa com display none', () => {
    const popup = criarPopup();
    expect(popup.style.display).to.equal('none');
  });

  it('injeta estilos no documento apenas uma vez em chamadas repetidas', () => {
    criarPopup();
    criarPopup();
    const tags = document.querySelectorAll('#remissao-popup-styles');
    expect(tags.length).to.equal(1);
  });
});

describe('esconderPopup()', () => {
  it('define display none no popup', () => {
    const popup = criarPopup();
    popup.style.display = 'flex';

    esconderPopup(popup);

    expect(popup.style.display).to.equal('none');
  });
});

describe('mostrarPopup() — conteúdo', () => {
  let popup: HTMLDivElement;
  let anchorEl: HTMLElement;

  beforeEach(() => {
    popup = criarPopup();
    document.body.appendChild(popup);
    anchorEl = document.createElement('span');
    anchorEl.style.position = 'fixed';
    anchorEl.style.top = '200px';
    anchorEl.style.left = '200px';
    anchorEl.style.width = '80px';
    anchorEl.style.height = '16px';
    document.body.appendChild(anchorEl);
  });

  afterEach(() => {
    popup.remove();
    anchorEl.remove();
  });

  it('preenche o rotulo com config.rotulo', () => {
    mostrarPopup(popup, anchorEl, criarConfigBasica({ rotulo: 'Art. 5º' }));

    const rotuloEl = popup.querySelector('.remissao-popup__rotulo') as HTMLElement;
    expect(rotuloEl.textContent).to.equal('Art. 5º');
  });

  it('exibe preview quando config.preview e fornecido', () => {
    mostrarPopup(popup, anchorEl, criarConfigBasica({ preview: 'Texto do dispositivo...' }));

    const previewEl = popup.querySelector('.remissao-popup__preview') as HTMLElement;
    expect(previewEl.textContent).to.equal('Texto do dispositivo...');
    expect(previewEl.style.display).to.not.equal('none');
  });

  it('oculta preview quando config.preview e undefined', () => {
    mostrarPopup(popup, anchorEl, criarConfigBasica({ preview: undefined }));

    const previewEl = popup.querySelector('.remissao-popup__preview') as HTMLElement;
    expect(previewEl.style.display).to.equal('none');
  });

  it('adiciona classe invalido quando config.invalido e true', () => {
    mostrarPopup(popup, anchorEl, criarConfigBasica({ invalido: true }));

    expect(popup.classList.contains('remissao-popup--invalido')).to.be.true;
  });

  it('nao adiciona classe invalido quando config.invalido e false', () => {
    mostrarPopup(popup, anchorEl, criarConfigBasica({ invalido: false }));

    expect(popup.classList.contains('remissao-popup--invalido')).to.be.false;
  });

  it('remove classe invalido em chamada subsequente sem invalido', () => {
    mostrarPopup(popup, anchorEl, criarConfigBasica({ invalido: true }));
    mostrarPopup(popup, anchorEl, criarConfigBasica({ invalido: false }));

    expect(popup.classList.contains('remissao-popup--invalido')).to.be.false;
  });

  it('cria o numero correto de botoes', () => {
    const config = criarConfigBasica({ botoes: [criarBotao(), criarBotao(), criarBotao()] });
    mostrarPopup(popup, anchorEl, config);

    const botoes = popup.querySelectorAll('.remissao-popup__btn');
    expect(botoes.length).to.equal(3);
  });

  it('define title do botao conforme BotaoPopup.titulo', () => {
    const config = criarConfigBasica({ botoes: [criarBotao({ titulo: 'Ir para dispositivo' })] });
    mostrarPopup(popup, anchorEl, config);

    const btn = popup.querySelector('.remissao-popup__btn') as HTMLButtonElement;
    expect(btn.title).to.equal('Ir para dispositivo');
  });

  it('adiciona classe extra quando BotaoPopup.classe e fornecida', () => {
    const config = criarConfigBasica({ botoes: [criarBotao({ classe: 'remissao-popup__btn--excluir' })] });
    mostrarPopup(popup, anchorEl, config);

    const btn = popup.querySelector('.remissao-popup__btn') as HTMLButtonElement;
    expect(btn.classList.contains('remissao-popup__btn--excluir')).to.be.true;
  });

  it('desabilita botao quando BotaoPopup.desabilitado e true', () => {
    const config = criarConfigBasica({ botoes: [criarBotao({ desabilitado: true })] });
    mostrarPopup(popup, anchorEl, config);

    const btn = popup.querySelector('.remissao-popup__btn') as HTMLButtonElement;
    expect(btn.disabled).to.be.true;
  });

  it('reconstroi botoes a cada chamada (callbacks atualizados)', () => {
    mostrarPopup(popup, anchorEl, criarConfigBasica({ botoes: [criarBotao()] }));
    mostrarPopup(popup, anchorEl, criarConfigBasica({ botoes: [criarBotao(), criarBotao()] }));

    const botoes = popup.querySelectorAll('.remissao-popup__btn');
    expect(botoes.length).to.equal(2);
  });
});

describe('mostrarPopup() — visibilidade', () => {
  let popup: HTMLDivElement;
  let anchorEl: HTMLElement;

  beforeEach(() => {
    popup = criarPopup();
    document.body.appendChild(popup);
    anchorEl = document.createElement('span');
    anchorEl.style.position = 'fixed';
    anchorEl.style.top = '200px';
    anchorEl.style.left = '200px';
    document.body.appendChild(anchorEl);
  });

  afterEach(() => {
    popup.remove();
    anchorEl.remove();
  });

  it('define display flex apos mostrar', () => {
    mostrarPopup(popup, anchorEl, criarConfigBasica());

    expect(popup.style.display).to.equal('flex');
  });

  it('nao fica com visibility hidden apos posicionar', () => {
    mostrarPopup(popup, anchorEl, criarConfigBasica());

    expect(popup.style.visibility).to.equal('');
  });
});

describe('mostrarPopup() — interação com botões', () => {
  let popup: HTMLDivElement;
  let anchorEl: HTMLElement;

  beforeEach(() => {
    popup = criarPopup();
    document.body.appendChild(popup);
    anchorEl = document.createElement('span');
    anchorEl.style.position = 'fixed';
    anchorEl.style.top = '200px';
    anchorEl.style.left = '200px';
    document.body.appendChild(anchorEl);
  });

  afterEach(() => {
    popup.remove();
    anchorEl.remove();
  });

  it('chama acao ao clicar no botao habilitado', () => {
    let chamado = false;
    const config = criarConfigBasica({
      botoes: [
        criarBotao({
          acao: () => {
            chamado = true;
          },
        }),
      ],
    });
    mostrarPopup(popup, anchorEl, config);

    const btn = popup.querySelector('.remissao-popup__btn') as HTMLButtonElement;
    btn.click();

    expect(chamado).to.be.true;
  });

  it('esconde popup apos clicar no botao habilitado', () => {
    const config = criarConfigBasica({ botoes: [criarBotao()] });
    mostrarPopup(popup, anchorEl, config);

    const btn = popup.querySelector('.remissao-popup__btn') as HTMLButtonElement;
    btn.click();

    expect(popup.style.display).to.equal('none');
  });

  it('nao chama acao ao clicar no botao desabilitado', () => {
    let chamado = false;
    const config = criarConfigBasica({
      botoes: [
        criarBotao({
          desabilitado: true,
          acao: () => {
            chamado = true;
          },
        }),
      ],
    });
    mostrarPopup(popup, anchorEl, config);

    const btn = popup.querySelector('.remissao-popup__btn') as HTMLButtonElement;
    btn.click();

    expect(chamado).to.be.false;
  });

  it('nao esconde popup ao clicar no botao desabilitado', () => {
    const config = criarConfigBasica({ botoes: [criarBotao({ desabilitado: true })] });
    mostrarPopup(popup, anchorEl, config);

    const btn = popup.querySelector('.remissao-popup__btn') as HTMLButtonElement;
    btn.click();

    expect(popup.style.display).to.equal('flex');
  });

  it('mousedown em botao habilitado cancela o evento', () => {
    const config = criarConfigBasica({ botoes: [criarBotao()] });
    mostrarPopup(popup, anchorEl, config);

    const btn = popup.querySelector('.remissao-popup__btn') as HTMLButtonElement;
    const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    btn.dispatchEvent(event);

    expect(event.defaultPrevented).to.be.true;
  });
});
