describe('Abrir emenda', () => {
    describe('From lexm-eta', () => {
      it('Emenda padrão', () => {
        cy.abrirEmenda({
          fixtureEmendaJson: 'emenda_2_mpv_1179_2023.json',
          pdfName: 'DOC-EMENDA-2---MPV-11792023-20230711.pdf',
          postAlias: 'postAbrirEmendaPadrao',
          closeModalOrientacoes: true,
        });

      it.only('Emenda texto livre', () => {
          
      });
   });        
 });
});