import { expect, fixture } from '@open-wc/testing';
// Import de efeito colateral: sem ele o TypeScript remove o import (só de tipo) e <lexml-eta> e seus filhos não são registrados.
import '../../../src';
import type { LexmlEtaComponent } from '../../../src';
import { novoDocumentoArticulado } from '../../doc/documentoArticulado';

describe('ETA — destruição do editor com seleção inicial pendente', () => {
  it('não lança erro não capturado quando o editor é removido antes dos timers da seleção da ementa', async () => {
    const erros: string[] = [];
    const registrarErro = (event: ErrorEvent): void => {
      erros.push(event.message);
    };
    window.addEventListener('error', registrarErro);

    try {
      const component = await fixture<LexmlEtaComponent>('<lexml-eta></lexml-eta>');
      (component as any).getParlamentares = async (): Promise<[]> => [];
      await component.abrirDocumentoArticulado(novoDocumentoArticulado());
      await (component.querySelector('lexml-eta-proposicao-editor') as any).aguardarCarregamentoDasLinhas();

      // Depois do timer do foco inicial (que marca a ementa) e antes do notify (1 ms) e da rolagem.
      await new Promise<void>(resolve =>
        setTimeout(() => {
          component.remove();
          resolve();
        }, 0)
      );
      await new Promise<void>(resolve => setTimeout(resolve, 50));
    } finally {
      window.removeEventListener('error', registrarErro);
    }

    expect(erros).to.deep.equal([]);
  });
});
