import { expect } from '@open-wc/testing';
import { Articulacao, Artigo, Dispositivo } from '../../../src/model/dispositivo/dispositivo';
import { isPena } from '../../../src/model/dispositivo/tipo';
import { buildJsonixFromProjetoNorma } from '../../../src/model/lexml/documento/conversor/buildJsonixFromProjetoNorma';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { createArticulacao, criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { getDispositivoAndFilhosAsLista } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { configurarNumero, configurarRotulo } from './buildJsonixFromProjetoNorma/buildJsonixHelpers';

const URN = 'urn:lex:br:federal:lei:2026-10-19;1';

const projeto = (articulacao: Articulacao): any => ({ classificacao: 'projeto', epigrafe: { texto: '' }, ementa: { texto: '' }, preambulo: { texto: '' } as any, articulacao });

const salva = (articulacao: Articulacao): any => buildJsonixFromProjetoNorma(projeto(articulacao), URN);

const dispositivosDe = (projetoNorma: any): Dispositivo[] => getDispositivoAndFilhosAsLista(projetoNorma.articulacao);

const raizArticulacao = (jsonix: any): any[] => (jsonix.value.projetoNorma.norma ?? jsonix.value.projetoNorma.projeto).articulacao.lXhier;

const novo = (pai: Dispositivo, tipo: string, rotulo: string, texto: string, numero = 1): Dispositivo => {
  const d = criaDispositivo(pai, tipo);
  if (tipo === TipoDispositivo.pena.tipo) {
    d.rotulo = rotulo;
  } else {
    configurarNumero(d, numero);
    configurarRotulo(d, rotulo);
  }
  (d as any).texto = texto;
  return d;
};

// art. 1 (caput com pena, § 1º com incisos e pena) e art. 2
const montaArticulacao = (rotuloPena = 'Pena –'): Articulacao => {
  const articulacao = createArticulacao();
  const art1 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
  configurarNumero(art1, 1);
  configurarRotulo(art1, 'Art. 1º');
  (art1.caput as any).texto = 'Matar alguém:';
  novo(art1, TipoDispositivo.pena.tipo, rotuloPena, 'reclusão, de seis a vinte anos.');
  const par1 = novo(art1, TipoDispositivo.paragrafo.tipo, '§ 1º', 'Se o crime é cometido:');
  const inc1 = novo(par1, TipoDispositivo.inciso.tipo, 'I –', 'por motivo fútil;');
  novo(par1, TipoDispositivo.inciso.tipo, 'II –', 'contra criança:', 2);
  novo(inc1, TipoDispositivo.pena.tipo, 'Infração -', 'multa.');
  novo(par1, TipoDispositivo.pena.tipo, 'Pena –', 'reclusão, de doze a trinta anos.');
  const art2 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
  configurarNumero(art2, 2);
  configurarRotulo(art2, 'Art. 2º');
  (art2.caput as any).texto = 'Esta Lei entra em vigor na data de sua publicação.';
  return articulacao;
};

// Art. 1º com incisos no caput, pena do caput e dois parágrafos.
const montaArtigoComIncisosPenaEParagrafos = (): Articulacao => {
  const articulacao = createArticulacao();
  const art1 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
  configurarNumero(art1, 1);
  configurarRotulo(art1, 'Art. 1º');
  (art1.caput as any).texto = 'Matar alguém:';
  novo(art1, TipoDispositivo.inciso.tipo, 'I –', 'aqui é um inciso;');
  novo(art1, TipoDispositivo.inciso.tipo, 'II –', 'outro inciso:', 2);
  novo(art1, TipoDispositivo.pena.tipo, 'Pena –', 'três anos de reclusão.');
  novo(art1, TipoDispositivo.paragrafo.tipo, '§ 1º', 'Teste.');
  novo(art1, TipoDispositivo.paragrafo.tipo, '§ 2º', 'Mais um teste.', 2);
  return articulacao;
};

describe('Conversão da pena para e do JSONIX', () => {
  describe('Gravação', () => {
    it('grava a pena em value.pena, fora de lXcontainersOmissis', () => {
      const jsonix = salva(montaArticulacao());
      const art1 = raizArticulacao(jsonix)[0];
      const caput = art1.value.lXcontainersOmissis.find((n: any) => n.name.localPart === 'Caput');
      expect(caput.value.pena.id).to.equal('art1_cpt_pena');
      expect(caput.value.pena.rotulo).to.equal('Pena –');
      expect(caput.value.pena.p[0].content).to.deep.equal(['reclusão, de seis a vinte anos.']);

      const par1 = art1.value.lXcontainersOmissis.find((n: any) => n.name.localPart === 'Paragrafo');
      expect(par1.value.pena.id).to.equal('art1_par1_pena');
      expect(par1.value.lXcontainersOmissis.map((n: any) => n.name.localPart)).to.deep.equal(['Inciso', 'Inciso']);
      expect(par1.value.lXcontainersOmissis[0].value.pena.id).to.equal('art1_par1_inc1_pena');
      expect(JSON.stringify(jsonix)).not.to.include('"localPart":"Pena"');
    });

    it('a pena do artigo é gravada no Caput, não no Artigo', () => {
      const art1 = raizArticulacao(salva(montaArticulacao()))[0];
      expect(art1.value.pena).to.be.undefined;
    });

    it('grava o rótulo com o separador normalizado', () => {
      const par1 = raizArticulacao(salva(montaArticulacao()))[0].value.lXcontainersOmissis.find((n: any) => n.name.localPart === 'Paragrafo');
      expect(par1.value.lXcontainersOmissis[0].value.pena.rotulo).to.equal('Infração –');
    });

    it('não grava pena quando o dono não tem', () => {
      const articulacao = createArticulacao();
      const art1 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
      configurarNumero(art1, 1);
      configurarRotulo(art1, 'Art. 1º');
      (art1.caput as any).texto = 'Texto.';
      expect(JSON.stringify(salva(articulacao))).not.to.include('"pena"');
    });
  });

  describe('Pena do caput em artigo com incisos e parágrafos', () => {
    // A pena antes dos incisos do caput é inválida no XSD (controle negativo da task 1.1, registrado em design.md).
    it('grava a pena em value.pena do Caput, depois dos incisos, e os parágrafos no Artigo', () => {
      const art1 = raizArticulacao(salva(montaArtigoComIncisosPenaEParagrafos()))[0];
      expect(art1.value.lXcontainersOmissis.map((n: any) => n.name.localPart)).to.deep.equal(['Caput', 'Paragrafo', 'Paragrafo']);
      expect(art1.value.pena).to.be.undefined;
      const caput = art1.value.lXcontainersOmissis[0];
      expect(caput.value.lXcontainersOmissis.map((n: any) => n.name.localPart)).to.deep.equal(['Inciso', 'Inciso']);
      expect(caput.value.pena.id).to.equal('art1_cpt_pena');
      expect(caput.value.pena.p[0].content).to.deep.equal(['três anos de reclusão.']);
      expect(JSON.stringify(art1.value.lXcontainersOmissis)).not.to.include('"localPart":"Pena"');
    });

    it('mantém a ordem na ida e volta', () => {
      const carregado = buildProjetoNormaFromJsonix(salva(montaArtigoComIncisosPenaEParagrafos()));
      const art1 = carregado.articulacao!.filhos[0] as Artigo;
      expect(art1.filhos.map(f => f.id)).to.deep.equal(['art1_cpt_inc1', 'art1_cpt_inc2', 'art1_cpt_pena', 'art1_par1', 'art1_par2']);
      expect(art1.caput!.filhos.map(f => f.tipo)).to.deep.equal(['Inciso', 'Inciso', 'Pena']);
    });
  });

  describe('Ida e volta', () => {
    it('preserva a pena de caput, parágrafo e inciso, como último filho do dono', () => {
      const carregado = buildProjetoNormaFromJsonix(salva(montaArticulacao()));
      const lista = dispositivosDe(carregado);
      const penas = lista.filter(isPena);
      expect(penas.map(p => p.id)).to.deep.equal(['art1_cpt_pena', 'art1_par1_inc1_pena', 'art1_par1_pena']);
      expect(penas.map(p => p.rotulo)).to.deep.equal(['Pena –', 'Infração –', 'Pena –']);
      expect(penas.map(p => p.texto)).to.deep.equal(['reclusão, de seis a vinte anos.', 'multa.', 'reclusão, de doze a trinta anos.']);

      const art1 = carregado.articulacao!.filhos[0] as Artigo;
      expect(art1.caput!.filhos.map(f => f.tipo)).to.deep.equal(['Pena']);
      const par1 = art1.filhos.find(f => f.tipo === 'Paragrafo')!;
      expect(par1.filhos.map(f => f.tipo)).to.deep.equal(['Inciso', 'Inciso', 'Pena']);
      expect(art1.filhos.map(f => f.id)).to.deep.equal(['art1_cpt_pena', 'art1_par1']);
    });

    it('preserva a pena depois de salvar o documento já carregado', () => {
      const duasVezes = buildProjetoNormaFromJsonix(salva(buildProjetoNormaFromJsonix(salva(montaArticulacao())).articulacao!));
      expect(
        dispositivosDe(duasVezes)
          .filter(isPena)
          .map(p => p.id)
      ).to.deep.equal(['art1_cpt_pena', 'art1_par1_inc1_pena', 'art1_par1_pena']);
    });
  });

  describe('Leitura de rótulos', () => {
    const rotuloLido = (rotulo: string): string | undefined => {
      const jsonix = salva(montaArticulacao());
      raizArticulacao(jsonix)[0].value.lXcontainersOmissis.find((n: any) => n.name.localPart === 'Caput').value.pena.rotulo = rotulo;
      return dispositivosDe(buildProjetoNormaFromJsonix(jsonix)).find(isPena)!.rotulo;
    };

    it('normaliza o separador de qualquer origem para " –"', () => {
      expect(rotuloLido('Pena -')).to.equal('Pena –');
      expect(rotuloLido('Pena –')).to.equal('Pena –');
      expect(rotuloLido('Pena \u0096')).to.equal('Pena –');
      expect(rotuloLido('Pena —')).to.equal('Pena –');
    });

    it('mantém rótulo fora da lista', () => {
      expect(rotuloLido('Sanção -')).to.equal('Sanção –');
    });

    it('usa o rótulo padrão quando o arquivo não traz rótulo', () => {
      expect(rotuloLido('')).to.equal('Pena –');
    });
  });
});
