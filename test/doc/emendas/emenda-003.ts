// para teste de agrupadores
export const EMENDA_003 = {
  dataUltimaModificacao: '2023-03-05T01:20:35.670Z',
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
    identificacaoTexto: 'Texto da MPV',
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
            tipo: 'Livro',
            id: 'liv1',
            rotulo: 'LIVRO I',
            texto: 'Adicionando livro antes a partir do título único do capítulo I',
          },
          {
            tipo: 'Titulo',
            id: 'liv1_tit1',
            rotulo: 'TÍTULO ÚNICO',
            texto: 'Adicionando título antes a partir do capítulo I',
            idPosicaoAgrupador: 'liv1',
          },
          {
            tipo: 'Livro',
            id: 'liv2',
            rotulo: 'LIVRO II',
            texto: 'Adicionando livro antes a partir do título único do capítulo II',
            idPosicaoAgrupador: 'art18',
          },
          {
            tipo: 'Titulo',
            id: 'liv2_tit1',
            rotulo: 'TÍTULO ÚNICO',
            texto: 'Adicionando título antes a partir do capítulo II',
            idPosicaoAgrupador: 'liv2',
          },
          {
            tipo: 'Livro',
            id: 'liv3',
            rotulo: 'LIVRO III',
            texto: 'Adicionando livro antes a partir do título único do capítulo II',
            idPosicaoAgrupador: 'liv2_tit1_cap2',
          },
          {
            tipo: 'Titulo',
            id: 'liv3_tit1',
            rotulo: 'TÍTULO ÚNICO',
            texto: 'Adicionando título depois a partir do capítulo II',
            idPosicaoAgrupador: 'liv3',
          },
        ],
      },
    },
  ],
  comandoEmenda: {
    comandos: [
      {
        cabecalho:
          'Acrescentem-se Livro I antes do Capítulo I do Título Único do Livro I, Livro II antes do Capítulo II do Título Único do Livro II e Livro III antes do art. 19 da Medida Provisória, com a seguinte redação:',
        citacao:
          '<p class="agrupador">“<Rotulo>LIVRO I</Rotulo></p><p class="agrupador"> Adicionando livro antes a partir do título único do capítulo I</p><p class="agrupador"><Rotulo>TÍTULO ÚNICO</Rotulo></p><p class="agrupador"> Adicionando título antes a partir do capítulo I”</p><p class="agrupador">“<Rotulo>LIVRO II</Rotulo></p><p class="agrupador"> Adicionando livro antes a partir do título único do capítulo II</p><p class="agrupador"><Rotulo>TÍTULO ÚNICO</Rotulo></p><p class="agrupador"> Adicionando título antes a partir do capítulo II”</p><p class="agrupador">“<Rotulo>LIVRO III</Rotulo></p><p class="agrupador"> Adicionando livro antes a partir do título único do capítulo II</p><p class="agrupador"><Rotulo>TÍTULO ÚNICO</Rotulo></p><p class="agrupador"> Adicionando título depois a partir do capítulo II”</p>',
      },
    ],
  },
  justificativa: '',
  local: 'Sala da comissão',
  data: '2023-03-05',
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
  },
};
