/*
CAPÍTULO I
Art. 1º .....
  Parágrafo único. .....
    I – .....

    I-1 - teste:
      a) teste:
        1. teste;
        2. teste;
      b) teste;
      c) teste;
    I-2 - teste;

    II – .....
    .....
*/
export const EMENDA_005 = {
  dataUltimaModificacao: '2023-06-03T14:50:41.004Z',
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
            rotulo: 'I-1 –',
            texto: 'teste inciso I-1:',
            idIrmaoAnterior: 'art1_par1u_inc1',
            filhos: [
              {
                tipo: 'Alinea',
                id: 'art1_par1u_inc1-1_ali1',
                rotulo: 'a)',
                texto: 'teste alínea a:',
                filhos: [
                  {
                    tipo: 'Item',
                    id: 'art1_par1u_inc1-1_ali1_ite1',
                    rotulo: '1.',
                    texto: 'teste item 1;',
                  },
                  {
                    tipo: 'Item',
                    id: 'art1_par1u_inc1-1_ali1_ite2',
                    rotulo: '2.',
                    texto: 'teste item 2;',
                  },
                ],
              },
              {
                tipo: 'Alinea',
                id: 'art1_par1u_inc1-1_ali2',
                rotulo: 'b)',
                texto: 'teste alínea b;',
              },
              {
                tipo: 'Alinea',
                id: 'art1_par1u_inc1-1_ali3',
                rotulo: 'c)',
                texto: 'teste alínea c;',
              },
            ],
          },
          {
            tipo: 'Inciso',
            id: 'art1_par1u_inc1-2',
            rotulo: 'I-2 –',
            texto: 'teste inciso I-2;',
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
  data: '2023-06-03',
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
};
