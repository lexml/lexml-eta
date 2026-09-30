// Remissão criada pela detecção de "caput do art. N" acompanha a renumeração do artigo (regra qualificada).
import { expect } from '@open-wc/testing';
import { Artigo } from '../../../src/model/dispositivo/dispositivo';
import { criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { updateIdDispositivoAndFilhos } from '../../../src/model/lexml/util/idUtil';
import { sincronizarRemissoesComEstadoAtual } from '../../../src/model/remissao/sincronizarRemissoes';
import { criaStateComNArtigos, detectaRemissoes } from '../../helpers/dispositivo-helper';

describe('sincronizarRemissoes — remissão detectada por "caput do art. N"', () => {
  it('inserir um artigo antes do alvo atualiza para "caput do art. 3º", mantendo o destino no caput', () => {
    const { state, artigos } = criaStateComNArtigos(3);
    const origem = artigos[2];
    const caputAlvo = (artigos[1] as Artigo).caput!;

    const entradas = detectaRemissoes(state, origem, 'Conforme o caput do art. 2º, aplica-se.');
    expect(entradas).to.have.length(1);
    expect(entradas[0].textoRef).to.equal('caput do art. 2º');

    criaDispositivo(state.articulacao as any, 'Artigo', undefined, 0);
    state.articulacao!.renumeraFilhos();
    updateIdDispositivoAndFilhos(state.articulacao!);

    const [sincronizada] = sincronizarRemissoesComEstadoAtual(state.articulacao!, { [origem.uuid!]: entradas })[origem.uuid!];

    expect(sincronizada.textoRef).to.equal('caput do art. 3º');
    expect(sincronizada.targetUuid).to.equal(caputAlvo.uuid);
    expect(origem.texto).to.contain('caput do art. 3º');
    expect(origem.texto).to.not.contain('caput do art. 2º');
  });
});
