export const EMENDA_010 = {
  dataUltimaModificacao: '2023-10-27T17:10:31.728Z',
  aplicacao: '',
  versaoAplicacao: '',
  modoEdicao: 'emenda',
  metadados: {},
  proposicao: {
    urn: 'urn:lex:br:federal:medida.provisoria:2019-11-11;905',
    sigla: 'MPV',
    numero: '905',
    ano: '2019',
    ementa: 'Institui o Contrato de Trabalho Verde e Amarelo, altera a legislação trabalhista, e dá outras providências.\n',
    identificacaoTexto: 'Texto inicial',
  },
  colegiadoApreciador: {
    siglaCasaLegislativa: 'CN',
    tipoColegiado: 'Comissão',
    siglaComissao: 'CMMPV 905/2019',
  },
  epigrafe: {
    texto: 'EMENDA Nº         - CMMPV 905/2019',
    complemento: '(à MPV 905/2019)',
  },
  componentes: [
    {
      urn: 'urn:lex:br:federal:medida.provisoria:2019-11-11;905',
      articulado: true,
      dispositivos: {
        dispositivosSuprimidos: [],
        dispositivosModificados: [],
        dispositivosAdicionados: [
          {
            tipo: 'Artigo',
            id: 'art0',
            rotulo: 'Art. 0.',
            filhos: [
              {
                tipo: 'Caput',
                id: 'art0_cpt',
                texto: 'Adicionando artigo antes da PARTE ÚNICA.',
              },
            ],
          },
          {
            tipo: 'Parte',
            id: 'prt1',
            rotulo: 'PARTE ÚNICA',
            texto: 'adicionando parte única antes do livro único',
            idPosicaoAgrupador: 'art0',
          },
          {
            tipo: 'Artigo',
            id: 'art0-1',
            rotulo: 'Art. 0-1.',
            idPai: 'prt1',
            filhos: [
              {
                tipo: 'Caput',
                id: 'art0-1_cpt',
                texto: 'Adicionando artigo depois da PARTE ÚNICA.',
              },
            ],
          },
          {
            tipo: 'Artigo',
            id: 'art0-2',
            rotulo: 'Art. 0-2.',
            idIrmaoAnterior: 'art0-1',
            filhos: [
              {
                tipo: 'Caput',
                id: 'art0-2_cpt',
                texto: 'Adicionando artigo antes do LIVRO ÚNICO.',
              },
            ],
          },
          {
            tipo: 'Livro',
            id: 'prt1_liv1',
            rotulo: 'LIVRO ÚNICO',
            texto: 'ADICIONANDO LIVRO ÚNICO ANTES DO TÍTULO ÚNICO',
            idPosicaoAgrupador: 'art0-2',
          },
          {
            tipo: 'Artigo',
            id: 'art0-3',
            rotulo: 'Art. 0-3.',
            idPai: 'prt1_liv1',
            filhos: [
              {
                tipo: 'Caput',
                id: 'art0-3_cpt',
                texto: 'Adicionando artigo depois do LIVRO ÚNICO.',
              },
            ],
          },
          {
            tipo: 'Artigo',
            id: 'art0-4',
            rotulo: 'Art. 0-4.',
            idIrmaoAnterior: 'art0-3',
            filhos: [
              {
                tipo: 'Caput',
                id: 'art0-4_cpt',
                texto: 'Adicionando artigo antes do TÍTULO ÚNICO.',
              },
            ],
          },
          {
            tipo: 'Titulo',
            id: 'prt1_liv1_tit1',
            rotulo: 'TÍTULO ÚNICO',
            texto: 'ADICIONANDO TÍTULO ÚNICO ANTES DO CAPÍTULO I',
            idPosicaoAgrupador: 'art0-4',
          },
          {
            tipo: 'Artigo',
            id: 'art0-5',
            rotulo: 'Art. 0-5.',
            idPai: 'prt1_liv1_tit1',
            filhos: [
              {
                tipo: 'Caput',
                id: 'art0-5_cpt',
                texto: 'Adicionando artigo depois do TÍTULO ÚNICO.',
              },
            ],
          },
          {
            tipo: 'Artigo',
            id: 'art0-6',
            rotulo: 'Art. 0-6.',
            idIrmaoAnterior: 'art0-5',
            filhos: [
              {
                tipo: 'Caput',
                id: 'art0-6_cpt',
                texto: 'Adicionando artigo antes do CAPÍTULO I.',
              },
            ],
          },
          {
            tipo: 'Capitulo',
            id: 'prt1_liv1_tit1_cap2-1',
            rotulo: 'CAPÍTULO II-1',
            texto: 'CAPÍTULO ANTES DO ART 21-1',
            idPosicaoAgrupador: 'art21',
          },
          {
            tipo: 'Artigo',
            id: 'art21-1',
            rotulo: 'Art. 21-1.',
            idPai: 'prt1_liv1_tit1_cap2-1',
            filhos: [
              {
                tipo: 'Caput',
                id: 'art21-1_cpt',
                texto: 'Adicionando artigo depois do art 21.',
              },
            ],
          },
          {
            tipo: 'Secao',
            id: 'prt1_liv1_tit1_cap2-1_sec1',
            rotulo: 'Seção Única',
            texto: 'SEÇÃO ANTES DO ART 21-2',
            idPosicaoAgrupador: 'art21-1',
          },
          {
            tipo: 'Artigo',
            id: 'art21-2',
            rotulo: 'Art. 21-2.',
            idPai: 'prt1_liv1_tit1_cap2-1_sec1',
            filhos: [
              {
                tipo: 'Caput',
                id: 'art21-2_cpt',
                texto: 'Adicionando artigo depois do art 21-1.',
              },
            ],
          },
          {
            tipo: 'Artigo',
            id: 'art0-7',
            rotulo: 'Art. 0-7.',
            idPai: 'prt1_liv1_tit1_cap1',
            filhos: [
              {
                tipo: 'Caput',
                id: 'art0-7_cpt',
                texto: 'Adicionando artigo depois do CAPÍTULO I.',
              },
            ],
          },
        ],
      },
    },
  ],
  comandoEmenda: {
    comandos: [
      {
        cabecalho:
          'Acrescentem-se art. 0 antes da Parte Única, Parte Única antes do Capítulo I do Título Único do Livro Único da Parte Única, art. 0-7 ao Capítulo I do Título Único ao Livro Único à Parte Única e Capítulo II-1 antes do art. 22 da Medida Provisória, com a seguinte redação:',
        citacao:
          '<p class="artigo">“<Rotulo>Art. 0.</Rotulo> Adicionando artigo antes da PARTE ÚNICA.”</p><p class="parte agrupador">“<Rotulo>PARTE ÚNICA</Rotulo></p><p class="parte agrupador"> adicionando parte única antes do livro único</p><p class="artigo"><Rotulo>Art. 0-1.</Rotulo> Adicionando artigo depois da PARTE ÚNICA.</p><p class="artigo"><Rotulo>Art. 0-2.</Rotulo> Adicionando artigo antes do LIVRO ÚNICO.</p><p class="livro agrupador"><Rotulo>LIVRO ÚNICO</Rotulo></p><p class="livro agrupador"> ADICIONANDO LIVRO ÚNICO ANTES DO TÍTULO ÚNICO</p><p class="artigo"><Rotulo>Art. 0-3.</Rotulo> Adicionando artigo depois do LIVRO ÚNICO.</p><p class="artigo"><Rotulo>Art. 0-4.</Rotulo> Adicionando artigo antes do TÍTULO ÚNICO.</p><p class="titulo agrupador"><Rotulo>TÍTULO ÚNICO</Rotulo></p><p class="titulo agrupador"> ADICIONANDO TÍTULO ÚNICO ANTES DO CAPÍTULO I</p><p class="artigo"><Rotulo>Art. 0-5.</Rotulo> Adicionando artigo depois do TÍTULO ÚNICO.</p><p class="artigo"><Rotulo>Art. 0-6.</Rotulo> Adicionando artigo antes do CAPÍTULO I.”</p><p class="artigo">“<Rotulo>Art. 0-7.</Rotulo> Adicionando artigo depois do CAPÍTULO I.”</p><p class="capitulo agrupador">“<Rotulo>CAPÍTULO II-1</Rotulo></p><p class="capitulo agrupador"> CAPÍTULO ANTES DO ART 21-1</p><p class="artigo"><Rotulo>Art. 21-1.</Rotulo> Adicionando artigo depois do art 21.</p><p class="secao agrupador"><Rotulo>Seção Única</Rotulo></p><p class="secao agrupador"> SEÇÃO ANTES DO ART 21-2</p><p class="artigo"><Rotulo>Art. 21-2.</Rotulo> Adicionando artigo depois do art 21-1.”</p>',
        complemento:
          'Os dispositivos acima propostos e adjacentes deverão ser devidamente renumerados no momento da consolidação das emendas ao texto da proposição pela Redação Final.',
      },
    ],
  },
  comandoEmendaTextoLivre: {},
  justificativa: '',
  local: 'Sala da comissão',
  data: '2023-10-27',
  autoria: {
    tipo: 'Parlamentar',
    imprimirPartidoUF: true,
    quantidadeAssinaturasAdicionaisSenadores: 0,
    quantidadeAssinaturasAdicionaisDeputados: 0,
    parlamentares: [],
  },
  opcoesImpressao: {
    imprimirBrasao: true,
    textoCabecalho: '',
    reduzirEspacoEntreLinhas: false,
    tamanhoFonte: 14,
  },
  anexos: [],
  revisoes: [],
};
