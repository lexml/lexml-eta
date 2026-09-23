import { expect } from '@open-wc/testing';
import { formatarLocalDataFecho, getDataPorExtenso, MESES, normalizarDataFecho } from '../../../src/model/lexml/documento/urnUtil';
import { buildProjetoNormaFromJsonix, lerIdsRemissoesInvalidas, lerMetadadoLexEdit } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import {
  criarDocumentoArticulado,
  lerDocumentoArticulado,
  serializarDocumentoArticulado,
  validarDocumentoArticulado,
} from '../../../src/model/lexml/documento/documentoArticulado';
import { OpcoesImpressao } from '../../../src/model/proposicao/proposicao';
import { Artigo } from '../../../src/model/dispositivo/dispositivo';
import { novoDocumentoArticulado } from '../../doc/documentoArticulado';

const novoModelo = (): any => buildProjetoNormaFromJsonix(lerDocumentoArticulado(novoDocumentoArticulado()), true);

const parteFinalCom = (texto: string): any => ({
  TYPE_NAME: 'br_gov_lexml__1.ParteFinal',
  localDataFecho: { TYPE_NAME: 'br_gov_lexml__1.ParsType', p: [{ TYPE_NAME: 'br_gov_lexml__1.GenInline', content: [texto] }] },
});

describe('Local e data do fecho — texto (especificação 03)', () => {
  it('formata local e data por extenso', () => {
    expect(formatarLocalDataFecho('Sala das sessões', '2026-04-24')).to.equal('Sala das sessões, 24 de abril de 2026.');
  });

  it('escreve o primeiro dia do mês como 1º', () => {
    expect(formatarLocalDataFecho('Sala das sessões', '2026-05-01')).to.equal('Sala das sessões, 1º de maio de 2026.');
  });

  it('escreve dias de um dígito sem zero à esquerda', () => {
    expect(formatarLocalDataFecho('Sala da comissão', '2026-03-05')).to.equal('Sala da comissão, 5 de março de 2026.');
  });

  it('usa o nome de cada um dos 12 meses', () => {
    MESES.forEach((nome, i) => {
      const mes = String(i + 1).padStart(2, '0');
      expect(formatarLocalDataFecho('Local', `2026-${mes}-15`)).to.equal(`Local, 15 de ${nome} de 2026.`);
    });
  });

  for (const data of [undefined, '', '24/04/2026', '2026-13-01', '2026-04-00']) {
    it(`sem data válida (${JSON.stringify(data)}) escreve só o local seguido de vírgula`, () => {
      expect(formatarLocalDataFecho('Sala das sessões', data)).to.equal('Sala das sessões,');
    });
  }

  it('não altera a data por extenso da URN', () => {
    expect(getDataPorExtenso('urn:lex:br:federal:lei:2020-10-01;123')).to.equal('01 de outubro de 2020');
  });
});

describe('Local e data do fecho — salvar (especificação 03)', () => {
  it('grava local, data e o texto em ParteFinal/LocalDataFecho', () => {
    const modelo = novoModelo();
    const documento = criarDocumentoArticulado(modelo, modelo.urn, undefined, undefined, { local: 'Sala das sessões', data: '2026-04-24' });

    const lexedit = documento.value.metadado.metadadoProprietario![0].lexedit;
    expect(lexedit.local).to.equal('Sala das sessões');
    expect(lexedit.data).to.equal('2026-04-24');
    expect(documento.value.projetoNorma.norma.parteFinal).to.deep.equal(parteFinalCom('Sala das sessões, 24 de abril de 2026.'));
  });

  for (const data of [undefined, '']) {
    it(`sem data (${JSON.stringify(data)}) omite o atributo e escreve só o local`, () => {
      const modelo = novoModelo();
      const documento = criarDocumentoArticulado(modelo, modelo.urn, undefined, undefined, { local: 'Sala da comissão', data });

      const lexedit = documento.value.metadado.metadadoProprietario![0].lexedit;
      expect(lexedit.local).to.equal('Sala da comissão');
      expect(lexedit).to.not.have.property('data');
      expect(documento.value.projetoNorma.norma.parteFinal).to.deep.equal(parteFinalCom('Sala da comissão,'));
    });
  }

  it('sem local não grava fecho nem MetadadoProprietario', () => {
    const modelo = novoModelo();
    const documento = criarDocumentoArticulado(modelo, modelo.urn, undefined, undefined, { data: '2026-04-24' });

    expect(documento.value.projetoNorma.norma).to.not.have.property('parteFinal');
    expect(documento.value.metadado.metadadoProprietario).to.be.undefined;
  });

  it('convive com opções de impressão e remissões inválidas no mesmo lexedit', () => {
    const modelo = novoModelo();
    const caput = (modelo.articulacao.filhos[0] as Artigo).caput!;
    const textoRef = 'educação';
    const remissoes: Record<number, any[]> = {
      [caput.uuid!]: [{ refId: 'ref_x', targetLexmlId: 'artInexistente', textoRef, inicio: caput.texto!.indexOf(textoRef), valida: false }],
    };

    const documento = criarDocumentoArticulado(modelo, modelo.urn, remissoes, undefined, {
      local: 'Sala das sessões',
      data: '2026-05-01',
      opcoesImpressao: new OpcoesImpressao(),
    });

    const metadadoProprietario = documento.value.metadado.metadadoProprietario!;
    expect(metadadoProprietario).to.have.length(1);
    const lexedit = metadadoProprietario[0].lexedit;
    expect(lexedit.local).to.equal('Sala das sessões');
    expect(lexedit.data).to.equal('2026-05-01');
    expect(lexedit.opcoesImpressao).to.deep.equal({ ...new OpcoesImpressao() });
    expect(lexedit.remissoesInternasInvalidas!.refIdsRemissoesInternas).to.have.length(1);
    expect(lexedit.pendencias).to.deep.equal(['Corrigir remissões internas inválidas.']);
    expect(documento.value.projetoNorma.norma.parteFinal).to.deep.equal(parteFinalCom('Sala das sessões, 1º de maio de 2026.'));
  });

  it('o documento com fecho passa na validação estrutural', () => {
    const modelo = novoModelo();
    const documento = criarDocumentoArticulado(modelo, modelo.urn, undefined, undefined, { local: 'Sala das sessões', data: '2026-04-24' });

    expect(() => validarDocumentoArticulado(documento)).to.not.throw();
    expect(() => lerDocumentoArticulado(JSON.stringify(documento))).to.not.throw();
  });
});

describe('Local e data do fecho — normalização da data do campo', () => {
  const dataLocal = (iso: string): string => {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  it('mantém AAAA-MM-DD', () => {
    expect(normalizarDataFecho('2026-04-24')).to.equal('2026-04-24');
  });

  it('converte timestamp ISO para a data local, e não para a data UTC', () => {
    // 01h47 UTC do dia 23 ainda é dia 22 em fusos negativos, como o de Brasília.
    const timestamp = '2026-09-23T01:47:41.174Z';
    expect(normalizarDataFecho(timestamp)).to.equal(dataLocal(timestamp));
    if (new Date(timestamp).getTimezoneOffset() >= 120) expect(normalizarDataFecho(timestamp)).to.equal('2026-09-22');
  });

  it('converte o padrão de new Date().toISOString() para a data local de hoje', () => {
    expect(normalizarDataFecho(new Date().toISOString())).to.equal(dataLocal(new Date().toISOString()));
  });

  for (const valor of [undefined, '', '24/04/2026', 'hoje', '2026-04-24Tlixo']) {
    it(`trata ${JSON.stringify(valor)} como data não informada`, () => {
      expect(normalizarDataFecho(valor)).to.be.undefined;
    });
  }
});

describe('Local e data do fecho — abrir (especificação 03)', () => {
  const documentoCom = (lexedit: any, parteFinal?: any): any => ({
    value: {
      metadado: {
        ...(lexedit !== undefined && {
          metadadoProprietario: [{ TYPE_NAME: 'br_gov_lexml__1.MetadadoProprietario', fonte: 'http://www.lexml.gov.br/lexedit/1.0', lexedit }],
        }),
      },
      projetoNorma: { norma: { ...(parteFinal && { parteFinal }) } },
    },
  });

  it('lê local e data', () => {
    expect(lerMetadadoLexEdit(documentoCom({ local: 'Sala da comissão', data: '2026-04-24' }))).to.deep.equal({ local: 'Sala da comissão', data: '2026-04-24' });
  });

  it('data ausente não traz data', () => {
    expect(lerMetadadoLexEdit(documentoCom({ local: 'Sala das sessões' }))).to.deep.equal({ local: 'Sala das sessões' });
  });

  for (const data of ['', '24/04/2026', '2026-04-24T10:00:00Z', 20260424]) {
    it(`data ${JSON.stringify(data)} é tratada como não informada`, () => {
      expect(lerMetadadoLexEdit(documentoCom({ local: 'Sala das sessões', data }))).to.deep.equal({ local: 'Sala das sessões' });
    });
  }

  for (const local of ['', '   ', 12]) {
    it(`local ${JSON.stringify(local)} é ignorado`, () => {
      expect(lerMetadadoLexEdit(documentoCom({ local, data: '2026-04-24' }))).to.deep.equal({ data: '2026-04-24' });
    });
  }

  it('sem MetadadoProprietario não lê o texto de LocalDataFecho', () => {
    expect(lerMetadadoLexEdit(documentoCom(undefined, parteFinalCom('Sala da comissão, 24 de abril de 2026.')))).to.deep.equal({});
  });

  it('convive com opções de impressão, remissões inválidas e um grupo desconhecido', () => {
    const documento = documentoCom({
      local: 'Sala das sessões',
      data: '2026-05-01',
      grupoFuturo: { qualquer: true },
      opcoesImpressao: { tamanhoFonte: 16 },
      remissoesInternasInvalidas: { refIdsRemissoesInternas: ['_ri1'] },
      pendencias: ['Corrigir remissões internas inválidas.'],
    });

    const dados = lerMetadadoLexEdit(documento);
    expect(dados.local).to.equal('Sala das sessões');
    expect(dados.data).to.equal('2026-05-01');
    expect(dados.opcoesImpressao!.tamanhoFonte).to.equal(16);
    expect(lerIdsRemissoesInvalidas(documento)).to.deep.equal(['_ri1']);
  });
});

describe('Local e data do fecho — salvar e reabrir pelo código do editor', () => {
  for (const data of ['2026-04-24', undefined]) {
    it(`reabre o mesmo local, a mesma data e o mesmo texto (data ${JSON.stringify(data)})`, () => {
      const modelo = novoModelo();
      const salvo = criarDocumentoArticulado(modelo, modelo.urn, undefined, undefined, { local: 'Sala da comissão', data });

      const reaberto = lerDocumentoArticulado(serializarDocumentoArticulado(salvo));
      const dados = lerMetadadoLexEdit(reaberto);
      expect(dados).to.deep.equal({ local: 'Sala da comissão', ...(data && { data }) });

      const modeloReaberto = buildProjetoNormaFromJsonix(reaberto, true);
      const salvoNovamente = criarDocumentoArticulado(modeloReaberto, modeloReaberto.urn!, undefined, undefined, dados);
      expect(salvoNovamente.value.projetoNorma.norma.parteFinal).to.deep.equal(salvo.value.projetoNorma.norma.parteFinal);
      expect(salvoNovamente).to.deep.equal(salvo);
    });
  }
});
