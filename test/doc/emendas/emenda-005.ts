/*
CAPÍTULO I
Art. 1º .....
  Parágrafo único. .....
    I – .....

    I-1 - teste A:
      a) teste B:
        1. teste C;
        2. teste D;
      b) teste E;
      c) teste F;
    I-2 - teste G;

    II – .....
    .....
*/
export const EMENDA_005 = {
  dataUltimaModificacao: '2023-06-13T23:44:55.580Z',
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
            tipo: 'Inciso',
            id: 'art1_par1u_inc1-1',
            uuid2: '8593d95a-6880-428b-a33b-85ff274ef617',
            rotulo: 'I-1 –',
            texto: 'teste A :',
            idIrmaoAnterior: 'art1_par1u_inc1',
            filhos: [
              {
                tipo: 'Alinea',
                id: 'art1_par1u_inc1-1_ali1',
                uuid2: 'b2754303-2fae-45a0-9d53-c76266c60abb',
                rotulo: 'a)',
                texto: 'teste B:',
                filhos: [
                  {
                    tipo: 'Item',
                    id: 'art1_par1u_inc1-1_ali1_ite1',
                    uuid2: 'b3db3b15-2c2a-4715-950f-56c2292f5063',
                    rotulo: '1.',
                    texto: 'teste C;',
                  },
                  {
                    tipo: 'Item',
                    id: 'art1_par1u_inc1-1_ali1_ite2',
                    uuid2: '5bced458-a089-48a3-a90e-864d68849f49',
                    rotulo: '2.',
                    texto: 'teste D;',
                  },
                ],
              },
              {
                tipo: 'Alinea',
                id: 'art1_par1u_inc1-1_ali2',
                uuid2: '589ed7cd-4040-449c-8c11-113bf43fc5ac',
                rotulo: 'b)',
                texto: 'teste E;',
              },
              {
                tipo: 'Alinea',
                id: 'art1_par1u_inc1-1_ali3',
                uuid2: 'd47f7530-f7fe-4e1b-80b0-9de876229082',
                rotulo: 'c)',
                texto: 'teste F;',
              },
            ],
          },
          {
            tipo: 'Inciso',
            id: 'art1_par1u_inc1-2',
            uuid2: '269c1df1-a9e9-4ba5-bce9-fd281cedc2f6',
            rotulo: 'I-2 –',
            texto: 'teste G;',
            idIrmaoAnterior: 'art1_par1u_inc1-1',
          },
        ],
      },
    },
  ],
  comandoEmenda: {
    comandos: [
      {
        cabecalho: 'Acrescentem-se incisos I-1 e I-2 ao parágrafo único do art. 1º da Medida Provisória, com a seguinte redação:',
        citacao:
          '<p class="artigo">“<Rotulo>Art. 1º</Rotulo> <Omissis/></p><p class="paragrafo"><Rotulo>Parágrafo único.</Rotulo> <Omissis/></p><p class="omissis"><Omissis/></p><p class="inciso"><Rotulo>I-1 –</Rotulo> teste:</p><p class="alinea"><Rotulo>a)</Rotulo> teste:</p><p class="item"><Rotulo>1.</Rotulo> teste;</p><p class="item"><Rotulo>2.</Rotulo> teste;</p><p class="alinea"><Rotulo>b)</Rotulo> teste;</p><p class="alinea"><Rotulo>c)</Rotulo> teste;</p><p class="inciso"><Rotulo>I-2 –</Rotulo> teste;</p><p class="omissis"><Omissis/>”</p>',
        complemento:
          'Os dispositivos acima propostos e adjacentes deverão ser devidamente renumerados no momento da consolidação das emendas ao texto da proposição pela Redação Final.',
      },
    ],
  },
  justificativa: '',
  local: 'Sala da comissão',
  data: '2023-06-13',
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
};
