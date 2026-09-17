import { expect } from '@open-wc/testing';
import { executeServerCommand } from '@web/test-runner-commands';
import { criarDocumentoArticulado, lerDocumentoArticulado } from '../../src/model/lexml/documento/documentoArticulado';
import { buildProjetoNormaFromJsonix } from '../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { novoDocumentoArticulado, novoDocumentoComTextoLiteral } from '../doc/documentoArticulado';
import { MPV_885_2019 } from '../assets/mpv_885_2019';
import { Artigo } from '../../src/model/dispositivo/dispositivo';

describe('Documento articulado — conversor Jsonix real e XSD LexML', () => {
  for (const [nome, entrada] of [
    ['proposição provisória', novoDocumentoArticulado()],
    ['norma com alterações e remissões', MPV_885_2019],
    ['texto literal', novoDocumentoComTextoLiteral()],
  ] as const) {
    it('valida e reabre ' + nome, async () => {
      const modelo = buildProjetoNormaFromJsonix(entrada, true);
      const salvo = criarDocumentoArticulado(modelo, modelo.urn!);
      const retorno = await executeServerCommand<{ xml: string; jsonix: unknown }, unknown>('validar-documento-lexml', salvo);
      expect(retorno.xml).to.include('<LexML');
      const reaberto = buildProjetoNormaFromJsonix(lerDocumentoArticulado(retorno.jsonix), true);
      expect(criarDocumentoArticulado(reaberto, reaberto.urn!)).to.deep.equal(salvo);
    });
  }

  it('comprova que o XSD rejeita um documento estruturalmente inválido', async () => {
    const entrada = novoDocumentoArticulado();
    delete entrada.value.metadado.identificacao;
    const retorno = await executeServerCommand<{ valido: boolean; erro: string }, unknown>('validar-documento-lexml', entrada);
    expect(retorno.valido).to.equal(false);
    expect(retorno.erro).to.include('Identificacao');
  });

  // Round-trip completo (tojson + deep.equal) não é exigido aqui: o CLI real não transporta
  // MetadadoProprietario (xsd:any) de volta a JSON — ver design.md, Decisão 5.
  it('valida contra o XSD real um documento com remissão interna inválida e MetadadoProprietario', async () => {
    const entrada = novoDocumentoArticulado();
    const modelo = buildProjetoNormaFromJsonix(entrada, true);
    const caput = (modelo.articulacao!.filhos[0] as Artigo).caput!;
    const textoRef = 'educação';

    const remissoes: Record<number, any[]> = {
      [caput.uuid!]: [{ refId: 'ref_x', targetLexmlId: 'artInexistente', textoRef, inicio: caput.texto!.indexOf(textoRef), valida: false }],
    };

    const salvo = criarDocumentoArticulado(modelo, modelo.urn!, remissoes);
    const idPersistido = remissoes[caput.uuid!][0].idPersistido;

    const retorno = await executeServerCommand<{ valido: boolean; xml: string; erro?: string }, unknown>('toxml-e-validar-lexml', salvo);

    expect(retorno.valido, retorno.erro).to.equal(true);
    // O elemento em si (fora do wildcard xsd:any) o CLI real emite normalmente.
    expect(retorno.xml).to.include('<MetadadoProprietario fonte="http://www.lexml.gov.br/lexedit/1.0"');
    // O id do <Remissao> é um atributo LexML comum (fora do wildcard) — sobrevive ao CLI real.
    expect(retorno.xml).to.match(new RegExp(`<Remissao[^>]*xlink:href="artInexistente"[^>]*id="${idPersistido}"`));
    // RemissoesInternasInvalidas fica DENTRO do wildcard xsd:any de MetadadoProprietario: o CLI
    // real descarta esse conteúdo ao converter para XML (achado empírico, design.md Decisão 5) —
    // não é possível comprovar aqui, apenas que o elemento-contêiner em si é válido pelo XSD.
  });
});
