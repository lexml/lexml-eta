// #1087: "Omitir Incisos" no inciso I punha o omissis depois do último parágrafo do artigo, e o omissis
// ficava fora do documento (a remoção do inciso, por uuid, levava também o omissis, que herda o uuid).
export {};

const getQuill = (win: any): any => win.document.querySelector('lexml-eta-proposicao-editor').quill;

const linhas = (quill: any): any[] => {
  const lista: any[] = [];
  for (let linha = quill.getPrimeiraLinha(); linha; linha = linha.next) lista.push(linha);
  return lista;
};

// Art. 627 da alteração do mpv_905_2019, com os incisos I a IV no caput.
const indiceDoArtigo627 = (ls: any[]): number => ls.findIndex(l => l.tipo === 'Artigo' && l.elemento?.dispositivoAlteracao && l.elemento?.rotulo === 'Art. 627.');

// Filhos do caput do Art. 627 no documento salvo (JSONIX), na ordem.
const filhosDoCaputSalvo = (documento: any): string[] => {
  let achado: any;
  const procura = (no: any): void => {
    if (achado || !no || typeof no !== 'object') return;
    if (typeof no.value?.id === 'string' && no.value.id.endsWith('_art627_cpt')) {
      achado = no.value;
      return;
    }
    Object.values(no).forEach(procura);
  };
  procura(documento);
  return (achado?.lXcontainersOmissis ?? []).map((f: any) => f.name.localPart);
};

describe('Omitir incisos em alteração de norma (#1087)', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao('mpv_905_2019', { naoMostrarExplicacaoSufixo: true });
    cy.window().should(win => expect(indiceDoArtigo627(linhas(getQuill(win)))).to.be.greaterThan(-1));
    cy.wait(1000);
  });

  it('o omissis fica no lugar do inciso I e é gravado no documento', () => {
    cy.window().then((win: any) => {
      const ls = linhas(getQuill(win));
      const i = indiceDoArtigo627(ls);
      win.__incisoI = ls[i + 1].uuid;
      win.__incisoII = ls[i + 2].uuid;
      expect([ls[i + 1].tipo, ls[i + 2].tipo]).to.deep.equal(['Inciso', 'Inciso']);
      return cy.get(`#${CSS.escape(ls[i + 1].domNode.id)}`).selecionarOpcaoDeMenuDoDispositivo('Omitir Incisos');
    });

    cy.window().should((win: any) => {
      const ls = linhas(getQuill(win));
      const i = indiceDoArtigo627(ls);
      expect(ls.slice(i + 1, i + 3).map(l => `${l.tipo} ${l.uuid}`)).to.deep.equal([`Omissis ${win.__incisoI}`, `Inciso ${win.__incisoII}`]);
    });

    cy.window().then((win: any) => {
      const documento = win.document.querySelector('lexml-eta').getDocumentoArticulado();
      expect(filhosDoCaputSalvo(documento).slice(0, 2)).to.deep.equal(['Omissis', 'Inciso']);
    });
  });
});
