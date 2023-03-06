export const EMENDA_002 = {
  dataUltimaModificacao: '2023-03-05T00:03:36.604Z',
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
            tipo: 'Secao',
            id: 'cap1_sec1',
            rotulo: 'Seção Única',
            texto: 'Adicionando seção depois a partir do capítulo I',
            idPosicaoAgrupador: 'cap1',
          },
          {
            tipo: 'Subsecao',
            id: 'cap1_sec1_sub1',
            rotulo: 'Subseção I',
            texto: 'Adicionando subseção I da subseção II da seção única do capítulo I',
            idPosicaoAgrupador: 'cap1_sec1',
          },
          {
            tipo: 'Subsecao',
            id: 'cap1_sec1_sub2',
            rotulo: 'Subseção II',
            texto: 'Adicionando subseção única a partir da seção única do capítulo I',
            idPosicaoAgrupador: 'cap1_sec1_sub1',
          },
          {
            tipo: 'Secao',
            id: 'cap2_sec1',
            rotulo: 'Seção Única',
            texto: 'Adicionando seção única do capítulo II',
            idPosicaoAgrupador: 'cap2',
          },
          {
            tipo: 'Subsecao',
            id: 'cap2_sec1_sub1',
            rotulo: 'Subseção I',
            texto: 'Adicionando subseção I da subseção II do capítulo II',
            idPosicaoAgrupador: 'cap2_sec1',
          },
          {
            tipo: 'Subsecao',
            id: 'cap2_sec1_sub2',
            rotulo: 'Subseção II',
            texto: 'Adicionando subseção única da seção única do capítulo II',
            idPosicaoAgrupador: 'cap2_sec1_sub1',
          },
        ],
      },
    },
  ],
  comandoEmenda: {
    comandos: [
      {
        cabecalho: 'Acrescentem-se Seção Única antes do art. 1º e Seção Única antes do art. 19 da Medida Provisória, com a seguinte redação:',
        citacao:
          '<p class="agrupador">“<Rotulo>Seção Única</Rotulo></p><p class="agrupador"> Adicionando seção depois a partir do capítulo I</p><p class="agrupador"><Rotulo>Subseção I</Rotulo></p><p class="agrupador"> Adicionando subseção I da subseção II da seção única do capítulo I</p><p class="agrupador"><Rotulo>Subseção II</Rotulo></p><p class="agrupador"> Adicionando subseção única a partir da seção única do capítulo I”</p><p class="agrupador">“<Rotulo>Seção Única</Rotulo></p><p class="agrupador"> Adicionando seção única do capítulo II</p><p class="agrupador"><Rotulo>Subseção I</Rotulo></p><p class="agrupador"> Adicionando subseção I da subseção II do capítulo II</p><p class="agrupador"><Rotulo>Subseção II</Rotulo></p><p class="agrupador"> Adicionando subseção única da seção única do capítulo II”</p>',
      },
    ],
  },
  justificativa: '',
  local: 'Sala da comissão',
  data: '2023-03-04',
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
