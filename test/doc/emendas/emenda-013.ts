/*
Art. 18-1. Teste:
I – 1;
II – 2.
*/
export const EMENDA_013 = {
  dataUltimaModificacao: '2024-08-12T02:05:02.607Z',
  aplicacao: '',
  versaoAplicacao: '',
  modoEdicao: 'emenda',
  metadados: {},
  pendenciasPreenchimento: ['Não foi informado um texto de justificação.'],
  proposicao: {
    urn: 'urn:lex:br:federal:medida.provisoria:2019-11-11;905',
    sigla: 'MPV',
    numero: '905',
    ano: '2019',
    ementa: 'Institui o Contrato de Trabalho Verde e Amarelo, altera a legislação trabalhista, e dá outras providências.\n',
    identificacaoTexto: 'Texto inicial',
    emendarTextoSubstitutivo: false,
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
            id: 'art18-1',
            rotulo: 'Art. 18-1.',
            idPai: 'cap2',
            filhos: [
              {
                tipo: 'Caput',
                id: 'art18-1_cpt',
                texto: 'Teste:',
                filhos: [
                  {
                    tipo: 'Inciso',
                    id: 'art18-1_cpt_inc1',
                    rotulo: 'I –',
                    texto: '1;',
                  },
                  {
                    tipo: 'Inciso',
                    id: 'art18-1_cpt_inc2',
                    rotulo: 'II –',
                    texto: '2.',
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  ],
  comandoEmendaTextoLivre: {
    texto: '',
  },
  comandoEmenda: {
    comandos: [
      {
        cabecalho: 'Acrescente-se art. 18-1 ao Capítulo II da Medida Provisória, com a seguinte redação:',
        citacao: '<p class="artigo">“<Rotulo>Art. 18-1.</Rotulo> Teste:</p><p class="inciso"><Rotulo>I –</Rotulo> 1;</p><p class="inciso"><Rotulo>II –</Rotulo> 2.”</p>',
        complemento:
          'Os dispositivos acima propostos e adjacentes deverão ser devidamente renumerados no momento da consolidação das emendas ao texto da proposição pela Redação Final.',
      },
    ],
  },
  anexos: [],
  justificativa: '<p class="align-justify"><br></p>',
  local: 'Sala da comissão',
  data: '2024-08-12',
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
  revisoes: [],
  colegiadoApreciador: {
    siglaCasaLegislativa: 'CN',
    tipoColegiado: 'Comissão',
    siglaComissao: 'CMMPV 905/2019',
  },
  notasRodape: [],
};
