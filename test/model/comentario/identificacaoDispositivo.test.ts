import { expect } from '@open-wc/testing';
import { Artigo } from '../../../src/model/dispositivo/dispositivo';
import { identificarDispositivoComentado, identificarLexmlId } from '../../../src/model/comentario/identificacaoDispositivo';
import { createArticulacao, criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { updateIdDispositivoAndFilhos } from '../../../src/model/lexml/util/idUtil';

describe('identificação do dispositivo comentado', () => {
  describe('pelo id', () => {
    it('artigo e desdobramentos por extenso a partir do artigo', () => {
      expect(identificarLexmlId('art3')).to.equal('art. 3º');
      expect(identificarLexmlId('art3_par2_inc1')).to.equal('inciso I do § 2º do art. 3º');
      expect(identificarLexmlId('art3_cpt_inc1_ali2')).to.equal('alínea “b” do inciso I do art. 3º');
      expect(identificarLexmlId('art12_par1u')).to.equal('parágrafo único do art. 12');
    });

    it('caput, ementa e preâmbulo', () => {
      expect(identificarLexmlId('art3_cpt')).to.equal('caput do art. 3º');
      expect(identificarLexmlId('ementa')).to.equal('ementa');
      expect(identificarLexmlId('preambulo')).to.equal('preâmbulo');
    });

    it('agrupador pelo nome', () => {
      expect(identificarLexmlId('cap2')).to.equal('Capítulo II');
    });

    it('pena pelo dono, com a pena do artigo identificada pelo artigo', () => {
      expect(identificarLexmlId('art1_cpt_pena')).to.equal('pena do art. 1º');
      expect(identificarLexmlId('art1_par1_inc1_pena')).to.equal('pena do inciso I do § 1º do art. 1º');
      expect(identificarLexmlId('art1_par1_inc1_ali1_pena')).to.equal('pena da alínea “a” do inciso I do § 1º do art. 1º');
    });

    it('bloco de alteração: dispositivo da norma alterada citado no artigo do projeto', () => {
      expect(identificarLexmlId('art2_cpt_alt1_art5_cpt_inc1')).to.equal('Inciso I do art. 5º citado no art. 2º');
      expect(identificarLexmlId('art1_cpt_alt1_art13')).to.equal('Art. 13 citado no art. 1º');
    });
  });

  describe('pelo dispositivo atual', () => {
    it('acompanha a renumeração', () => {
      const articulacao = createArticulacao();
      criaDispositivo(articulacao, 'Artigo');
      const art = criaDispositivo(articulacao, 'Artigo') as Artigo;
      const inciso = criaDispositivo(art.caput!, 'Inciso');
      articulacao.renumeraFilhos();
      art.caput!.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);
      expect(identificarDispositivoComentado(inciso)).to.equal('inciso I do art. 2º');

      criaDispositivo(articulacao, 'Artigo', undefined, 0);
      articulacao.renumeraFilhos();
      expect(identificarDispositivoComentado(inciso)).to.equal('inciso I do art. 3º');
    });

    it('agrupador criado na articulação', () => {
      const articulacao = createArticulacao();
      criaDispositivo(articulacao, 'Capitulo');
      const capitulo = criaDispositivo(articulacao, 'Capitulo');
      articulacao.renumeraFilhos();

      expect(identificarDispositivoComentado(capitulo)).to.equal('Capítulo II');
    });

    it('ementa e preâmbulo pelo tipo', () => {
      expect(identificarDispositivoComentado({ tipo: 'Ementa' } as any)).to.equal('ementa');
      expect(identificarDispositivoComentado({ tipo: 'Preambulo' } as any)).to.equal('preâmbulo');
    });
  });
});
