import { expect } from '@open-wc/testing';
import { buildProjetoNormaFromJsonix, lerMetadadoLexEdit } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import {
  criarDocumentoArticulado,
  lerDocumentoArticulado,
  serializarDocumentoArticulado,
  validarDocumentoArticulado,
} from '../../../src/model/lexml/documento/documentoArticulado';
import { Artigo } from '../../../src/model/dispositivo/dispositivo';
import { Autoria, OpcoesImpressao, Parlamentar, tratamentoParlamentar } from '../../../src/model/proposicao/proposicao';
import { lexeditSalvo, metadadoProprietarioLexEdit, novoDocumentoArticulado, TYPE_NAME_OPCOES_IMPRESSAO } from '../../doc/documentoArticulado';

const novoModelo = (): any => buildProjetoNormaFromJsonix(lerDocumentoArticulado(novoDocumentoArticulado()), true);

const davi = (): Parlamentar => ({
  identificacao: '1111',
  nome: 'Davi Alcolumbre',
  sexo: 'M',
  siglaPartido: 'UNIÃO',
  siglaUF: 'AP',
  siglaCasaLegislativa: 'SF',
  cargo: 'Presidente do Senado Federal',
});

const soraya = (): Parlamentar => ({
  identificacao: '2222',
  nome: 'Soraya Thronicke',
  sexo: 'F',
  siglaPartido: 'PSB',
  siglaUF: 'MS',
  siglaCasaLegislativa: 'SF',
  cargo: '',
});

const autoriaCom = (parlamentares: Parlamentar[], imprimirPartidoUF = true): Autoria => ({ ...new Autoria(), imprimirPartidoUF, parlamentares });

const salvar = (dados: any): any => {
  const modelo = novoModelo();
  return criarDocumentoArticulado(modelo, modelo.urn, undefined, undefined, dados);
};

const parteFinal = (documento: any): any => documento.value.projetoNorma.norma.parteFinal;

// Texto dos parágrafos de um AssinaturaTexto; o negrito aparece como **texto**.
const textos = (assinatura: any): string[] => assinatura.p.map((p: any) => p.content.map((c: any) => (typeof c === 'string' ? c : `**${c.value.content.join('')}**`)).join(''));

const NOME_B = { namespaceURI: 'http://www.lexml.gov.br/1.0', localPart: 'b', prefix: '', key: '{http://www.lexml.gov.br/1.0}b', string: '{http://www.lexml.gov.br/1.0}b' };
const p = (...content: any[]): any => ({ TYPE_NAME: 'br_gov_lexml__1.GenInline', content });
const b = (texto: string): any => ({ name: NOME_B, value: { TYPE_NAME: 'br_gov_lexml__1.GenInline', content: [texto] } });

// Transcrição de parteFinal em docs/extensao-formato-lexml/documento-articulado-exemplo.json (formato do tojson do CLI 2.0.0).
const PARTE_FINAL_EXEMPLO = {
  TYPE_NAME: 'br_gov_lexml__1.ParteFinal',
  localDataFecho: { TYPE_NAME: 'br_gov_lexml__1.ParsType', p: [p('Sala das Sessões, 24 de abril de 2026.')] },
  assinaturaTexto: [
    { TYPE_NAME: 'br_gov_lexml__1.ParsType', p: [p(b('Senador Davi Alcolumbre')), p('(UNIÃO - AP)'), p('Presidente do Senado Federal')] },
    { TYPE_NAME: 'br_gov_lexml__1.ParsType', p: [p(b('Senadora Soraya Thronicke')), p('(PSB - MS)')] },
  ],
};

describe('Autoria de parlamentares — tratamento (especificação 04)', () => {
  const casos: Array<[string, string, string]> = [
    ['M', 'SF', 'Senador'],
    ['F', 'SF', 'Senadora'],
    ['M', 'CD', 'Deputado'],
    ['F', 'CD', 'Deputada'],
    ['F', 'CN', 'Deputada'],
  ];
  for (const [sexo, casa, esperado] of casos) {
    it(`${sexo}/${casa} → ${esperado}`, () => {
      expect(tratamentoParlamentar(sexo, casa)).to.equal(esperado);
    });
  }
});

describe('Autoria de parlamentares — salvar lexedit:Autoria (especificação 04)', () => {
  it('grava os parlamentares na ordem, com os sete atributos e cargo vazio', () => {
    const documento = salvar({ autoria: autoriaCom([davi(), soraya()]) });

    expect(lexeditSalvo(documento).autoria).to.deep.equal({
      TYPE_NAME: 'br_gov_lexml_lexedit__1.Autoria',
      tipo: 'Parlamentar',
      imprimirPartidoUF: true,
      parlamentares: {
        TYPE_NAME: 'br_gov_lexml_lexedit__1.Parlamentares',
        parlamentar: [
          { TYPE_NAME: 'br_gov_lexml_lexedit__1.Parlamentar', ...davi() },
          { TYPE_NAME: 'br_gov_lexml_lexedit__1.Parlamentar', ...soraya() },
        ],
      },
    });
  });

  it('grava imprimirPartidoUF falso', () => {
    expect(lexeditSalvo(salvar({ autoria: autoriaCom([davi()], false) })).autoria.imprimirPartidoUF).to.be.false;
  });

  it('grava só os sete atributos quando o parlamentar do host traz campos extras', () => {
    const doHost = { ...davi(), codigo: 99, foto: 'x.jpg' } as any;
    const gravado = lexeditSalvo(salvar({ autoria: autoriaCom([doHost]) })).autoria.parlamentares.parlamentar[0];

    expect(gravado).to.deep.equal({ TYPE_NAME: 'br_gov_lexml_lexedit__1.Parlamentar', ...davi() });
  });

  it('grava cargo vazio quando o parlamentar não tem cargo definido', () => {
    const semCargo = { ...davi() } as any;
    delete semCargo.cargo;
    expect(lexeditSalvo(salvar({ autoria: autoriaCom([semCargo]) })).autoria.parlamentares.parlamentar[0].cargo).to.equal('');
  });

  it('descarta parlamentares sem identificação', () => {
    const emBranco = { ...new Parlamentar() };
    const gravados = lexeditSalvo(salvar({ autoria: autoriaCom([davi(), emBranco]) })).autoria.parlamentares.parlamentar;

    expect(gravados.map((par: any) => par.identificacao)).to.deep.equal(['1111']);
  });

  for (const [descricao, autoria] of [
    ['lista vazia', autoriaCom([])],
    ['só parlamentares sem identificação', autoriaCom([{ ...new Parlamentar() }])],
  ] as Array<[string, Autoria]>) {
    it(`${descricao}: não grava autoria nem MetadadoProprietario`, () => {
      const documento = salvar({ autoria });
      expect(documento.value.metadado.metadadoProprietario).to.be.undefined;
      expect(parteFinal(documento)).to.be.undefined;
    });
  }

  it('convive com fecho, opções de impressão e remissão inválida no mesmo lexedit', () => {
    const modelo = novoModelo();
    const caput = (modelo.articulacao.filhos[0] as Artigo).caput!;
    const textoRef = 'educação';
    const remissoes: Record<number, any[]> = {
      [caput.uuid!]: [{ refId: 'ref_x', targetLexmlId: 'artInexistente', textoRef, inicio: caput.texto!.indexOf(textoRef), valida: false }],
    };
    const documento = criarDocumentoArticulado(modelo, modelo.urn, remissoes, undefined, {
      local: 'Sala das sessões',
      data: '2026-04-24',
      opcoesImpressao: new OpcoesImpressao(),
      autoria: autoriaCom([davi()]),
    });

    expect(documento.value.metadado.metadadoProprietario).to.have.length(1);
    const lexedit = lexeditSalvo(documento);
    expect(lexedit.local).to.equal('Sala das sessões');
    expect(lexedit.data).to.equal('2026-04-24');
    expect(lexedit.opcoesImpressao.TYPE_NAME).to.equal(TYPE_NAME_OPCOES_IMPRESSAO);
    expect(lexedit.autoria.parlamentares.parlamentar).to.have.length(1);
    expect(lexedit.remissoesInternasInvalidas.refIdsRemissoesInternas).to.equal(remissoes[caput.uuid!][0].idPersistido);
  });
});

describe('Autoria de parlamentares — salvar AssinaturaTexto (especificação 04)', () => {
  it('senador com cargo: nome em negrito, partido/UF e cargo', () => {
    const [assinatura] = parteFinal(salvar({ autoria: autoriaCom([davi()]) })).assinaturaTexto;
    expect(textos(assinatura)).to.deep.equal(['**Senador Davi Alcolumbre**', '(UNIÃO - AP)', 'Presidente do Senado Federal']);
  });

  it('senadora sem cargo: só nome e partido/UF', () => {
    const [assinatura] = parteFinal(salvar({ autoria: autoriaCom([soraya()]) })).assinaturaTexto;
    expect(textos(assinatura)).to.deep.equal(['**Senadora Soraya Thronicke**', '(PSB - MS)']);
  });

  it('deputada', () => {
    const deputada: Parlamentar = { ...soraya(), nome: 'Maria Silva', siglaCasaLegislativa: 'CD', siglaUF: 'SP' };
    const [assinatura] = parteFinal(salvar({ autoria: autoriaCom([deputada]) })).assinaturaTexto;
    expect(textos(assinatura)[0]).to.equal('**Deputada Maria Silva**');
  });

  it('cargo só com espaços não gera parágrafo', () => {
    const [assinatura] = parteFinal(salvar({ autoria: autoriaCom([{ ...davi(), cargo: '   ' }]) })).assinaturaTexto;
    expect(textos(assinatura)).to.deep.equal(['**Senador Davi Alcolumbre**', '(UNIÃO - AP)']);
  });

  it('imprimirPartidoUF falso omite o parágrafo de partido e UF', () => {
    const assinaturas = parteFinal(salvar({ autoria: autoriaCom([davi(), soraya()], false) })).assinaturaTexto;
    expect(assinaturas.map(textos)).to.deep.equal([['**Senador Davi Alcolumbre**', 'Presidente do Senado Federal'], ['**Senadora Soraya Thronicke**']]);
  });

  it('fecho e assinaturas: LocalDataFecho antes dos AssinaturaTexto, na ordem dos parlamentares', () => {
    const final = parteFinal(salvar({ local: 'Sala das sessões', data: '2026-04-24', autoria: autoriaCom([davi(), soraya()]) }));
    expect(Object.keys(final)).to.deep.equal(['TYPE_NAME', 'localDataFecho', 'assinaturaTexto']);
    expect(final.assinaturaTexto.map((a: any) => textos(a)[0])).to.deep.equal(['**Senador Davi Alcolumbre**', '**Senadora Soraya Thronicke**']);
  });

  it('só assinaturas, sem local: ParteFinal sem LocalDataFecho', () => {
    const final = parteFinal(salvar({ autoria: autoriaCom([davi()]) }));
    expect(final).to.not.have.property('localDataFecho');
    expect(final.assinaturaTexto).to.have.length(1);
  });

  it('nem local nem autoria: sem ParteFinal', () => {
    expect(parteFinal(salvar({ opcoesImpressao: new OpcoesImpressao() }))).to.be.undefined;
  });

  it('documento com autoria passa em validarDocumentoArticulado', () => {
    expect(() => validarDocumentoArticulado(salvar({ local: 'Sala das sessões', autoria: autoriaCom([davi(), soraya()]) }))).to.not.throw();
  });

  it('dados do exemplo da especificação geram a mesma ParteFinal do exemplo', () => {
    const documento = salvar({ local: 'Sala das Sessões', data: '2026-04-24', autoria: autoriaCom([davi(), soraya()]) });
    expect(parteFinal(documento)).to.deep.equal(PARTE_FINAL_EXEMPLO);
  });
});

describe('Autoria de parlamentares — abrir (especificação 04)', () => {
  const documentoCom = (grupos: Record<string, unknown> | undefined): any => ({
    value: { metadado: { ...(grupos && { metadadoProprietario: [metadadoProprietarioLexEdit(grupos)] }) } },
  });
  const autoriaLida = (autoria: any): Autoria | undefined => lerMetadadoLexEdit(documentoCom({ autoria })).autoria;
  const gravada = (parlamentar: any, extras: Record<string, unknown> = {}): any => ({
    TYPE_NAME: 'br_gov_lexml_lexedit__1.Autoria',
    tipo: 'Parlamentar',
    imprimirPartidoUF: true,
    parlamentares: { TYPE_NAME: 'br_gov_lexml_lexedit__1.Parlamentares', parlamentar },
    ...extras,
  });

  it('lê dois parlamentares na ordem, com imprimirPartidoUF', () => {
    const autoria = autoriaLida(gravada([davi(), soraya()], { imprimirPartidoUF: false }))!;
    expect(autoria.parlamentares).to.deep.equal([davi(), soraya()]);
    expect(autoria.imprimirPartidoUF).to.be.false;
  });

  it('aceita parlamentar como objeto único', () => {
    expect(autoriaLida(gravada(davi()))!.parlamentares).to.deep.equal([davi()]);
  });

  for (const valor of [undefined, 'false', 0]) {
    it(`imprimirPartidoUF ${JSON.stringify(valor)} assume o padrão (marcado)`, () => {
      expect(autoriaLida(gravada([davi()], { imprimirPartidoUF: valor }))!.imprimirPartidoUF).to.be.true;
    });
  }

  it('sexo e casa legislativa inválidos assumem o padrão de Parlamentar', () => {
    const [lido] = autoriaLida(gravada([{ ...davi(), sexo: 'X', siglaCasaLegislativa: 'CN', siglaPartido: 3 }]))!.parlamentares;
    const padrao = new Parlamentar();
    expect(lido.sexo).to.equal(padrao.sexo);
    expect(lido.siglaCasaLegislativa).to.equal(padrao.siglaCasaLegislativa);
    expect(lido.siglaPartido).to.equal(padrao.siglaPartido);
    expect(lido.nome).to.equal('Davi Alcolumbre');
  });

  it('descarta parlamentar sem identificação ou sem nome', () => {
    const lidos = autoriaLida(
      gravada([
        { ...davi(), identificacao: '' },
        { ...soraya(), nome: '  ' },
        { ...davi(), identificacao: '3333' },
      ])
    )!.parlamentares;
    expect(lidos.map(p => p.identificacao)).to.deep.equal(['3333']);
  });

  it('cargo ausente vira texto vazio', () => {
    const semCargo = { ...davi() } as any;
    delete semCargo.cargo;
    expect(autoriaLida(gravada([semCargo]))!.parlamentares[0].cargo).to.equal('');
  });

  it('assinaturas adicionais ficam em 0', () => {
    const autoria = autoriaLida(gravada([davi()], { quantidadeAssinaturasAdicionaisSenadores: 3 }))!;
    expect(autoria.quantidadeAssinaturasAdicionaisSenadores).to.equal(0);
    expect(autoria.quantidadeAssinaturasAdicionaisDeputados).to.equal(0);
  });

  const semAutoria: Array<[string, any]> = [
    ['nenhum parlamentar válido', gravada([{ ...davi(), identificacao: '' }])],
    ['lista vazia', gravada([])],
    ['sem Parlamentares', { tipo: 'Parlamentar' }],
    ['autoria de comissão', { tipo: 'Comissão', colegiadoAutor: { identificacao: '4444', nome: 'Comissão de Assuntos Econômicos', sigla: 'CAE' } }],
    ['autoria não objeto', 'Parlamentar'],
  ];
  for (const [descricao, autoria] of semAutoria) {
    it(`${descricao}: sem autoria lida`, () => {
      expect(lerMetadadoLexEdit(documentoCom({ autoria }))).to.not.have.property('autoria');
    });
  }

  it('sem MetadadoProprietario: sem autoria lida', () => {
    expect(lerMetadadoLexEdit(documentoCom(undefined))).to.not.have.property('autoria');
  });

  it('convive com os demais grupos e com um grupo desconhecido', () => {
    const dados = lerMetadadoLexEdit(
      documentoCom({
        local: 'Sala das sessões',
        data: '2026-04-24',
        opcoesImpressao: { tamanhoFonte: 16 },
        remissoesInternasInvalidas: { refIdsRemissoesInternas: '_ri1' },
        comentarios: { qualquer: 1 },
        autoria: gravada([davi()]),
      })
    );
    expect(dados.local).to.equal('Sala das sessões');
    expect(dados.opcoesImpressao!.tamanhoFonte).to.equal(16);
    expect(dados.autoria!.parlamentares).to.deep.equal([davi()]);
  });
});

describe('Autoria de parlamentares — ida e volta pelo código do editor (especificação 04)', () => {
  it('criar → serializar → ler devolve a mesma autoria e recriar produz o mesmo lexedit e a mesma ParteFinal', () => {
    const dados = { local: 'Sala das sessões', data: '2026-04-24', autoria: autoriaCom([davi(), { ...soraya(), siglaCasaLegislativa: 'CD' }], false) };
    const primeiro = salvar(dados);

    const lido = lerDocumentoArticulado(serializarDocumentoArticulado(primeiro));
    const dadosLidos = lerMetadadoLexEdit(lido);
    expect(dadosLidos.autoria).to.deep.equal(dados.autoria);

    const modelo = buildProjetoNormaFromJsonix(lido, true);
    const segundo = criarDocumentoArticulado(modelo, modelo.urn!, undefined, undefined, dadosLidos);
    expect(lexeditSalvo(segundo).autoria).to.deep.equal(lexeditSalvo(primeiro).autoria);
    expect(parteFinal(segundo)).to.deep.equal(parteFinal(primeiro));
  });
});
