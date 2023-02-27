/*
Cria os agrupadores abaixo:

CAPÍTULO ÚNICO
  Seção Única
    Subseção Única
      Art. 1º
      ...

*/
export const EMENDA_001 = {
  dataUltimaModificacao: '2023-02-24T21:44:57.815Z',
  aplicacao: '',
  versaoAplicacao: '',
  modoEdicao: 'emenda',
  metadados: {},
  proposicao: {
    urn: 'urn:lex:br:federal:medida.provisoria:2019-06-17;885',
    sigla: 'MPV',
    numero: '885',
    ano: '2019',
    ementa:
      'Altera a <a href="urn:lex:br:federal:lei:1986-12-19;7560"> Lei nº 7.560, de 19 de dezembro de 1986 </a>, para alterar disposições acerca do Fundo Nacional Antidrogas, a <a href="urn:lex:br:federal:lei:2006-08-23;11343"> Lei nº 11.343, de 23 de agosto de 2006 </a>, que estabelece normas para repressão à produção não autorizada e ao tráfico ilícito de drogas, e a <a href="urn:lex:br:federal:lei:1993-12-09;8745"> Lei nº 8.745, de 9 de dezembro de 1993 </a>, que dispõe sobre a contratação por tempo determinado para atender a necessidade temporária de excepcional interesse público.',
    identificacaoTexto: 'Texto da MPV',
  },
  colegiadoApreciador: {
    siglaCasaLegislativa: 'CN',
    tipoColegiado: 'Comissão',
    siglaComissao: 'CMMPV 885/2019',
  },
  epigrafe: {
    texto: 'EMENDA Nº         - CMMPV 885/2019',
    complemento: '(à MPV 885/2019)',
  },
  componentes: [
    {
      urn: 'urn:lex:br:federal:medida.provisoria:2019-06-17;885',
      articulado: true,
      dispositivos: {
        dispositivosSuprimidos: [],
        dispositivosModificados: [],
        dispositivosAdicionados: [
          {
            tipo: 'Capitulo',
            id: 'cap1',
            rotulo: 'CAPÍTULO ÚNICO',
            texto: 'CAP 1',
          },
          {
            tipo: 'Secao',
            id: 'cap1_sec1',
            rotulo: 'Seção Única',
            texto: 'SEC 1',
            idPosicaoAgrupador: 'cap1',
          },
          {
            tipo: 'Subsecao',
            id: 'cap1_sec1_sub1',
            rotulo: 'Subseção Única',
            texto: 'SUB 1',
            idPosicaoAgrupador: 'cap1_sec1',
          },
        ],
      },
    },
  ],
  comandoEmenda: {
    comandos: [
      {
        cabecalho: 'Acrescente-se Capítulo Único da Medida Provisória, com a seguinte redação:',
        citacao:
          '<p class="agrupador">“<Rotulo>CAPÍTULO ÚNICO</Rotulo></p><p class="agrupador"> CAP 1”</p><p class="agrupador">“<Rotulo>Seção Única</Rotulo></p><p class="agrupador"> SEC 1”</p><p class="agrupador">“<Rotulo>Subseção Única</Rotulo></p><p class="agrupador"> SUB 1”</p>',
      },
    ],
  },
  justificativa: '',
  local: 'Sala da comissão',
  data: '2023-02-24',
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
