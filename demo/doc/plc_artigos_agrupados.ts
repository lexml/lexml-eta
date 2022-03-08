export const PLC_ARTIGOS_AGRUPADOS = {
  name: {
    namespaceURI: 'http://www.lexml.gov.br/1.0',
    localPart: 'LexML',
    prefix: '',
    key: '{http://www.lexml.gov.br/1.0}LexML',
    string: '{http://www.lexml.gov.br/1.0}LexML',
  },
  value: {
    TYPE_NAME: 'br_gov_lexml__1.LexML',
    metadado: {
      TYPE_NAME: 'br_gov_lexml__1.Metadado',
      identificacao: {
        TYPE_NAME: 'br_gov_lexml__1.Identificacao',
        urn: 'urn:lex:br:senado.federal:projeto.lei;plc:2010;00007',
      },
    },
    projetoNorma: {
      TYPE_NAME: 'br_gov_lexml__1.ProjetoNorma',
      norma: {
        TYPE_NAME: 'br_gov_lexml__1.HierarchicalStructure',
        parteInicial: {
          TYPE_NAME: 'br_gov_lexml__1.ParteInicial',
          epigrafe: {
            TYPE_NAME: 'br_gov_lexml__1.GenInline',
            id: 'epigrafe',
            content: ['Substitutivo do Senado ao Projeto de Lei da Câmara nº 7, de 2010.'],
          },
          ementa: {
            TYPE_NAME: 'br_gov_lexml__1.GenInline',
            id: 'ementa',
            content: [
              {
                name: {
                  namespaceURI: 'http://www.lexml.gov.br/1.0',
                  localPart: 'p',
                  prefix: '',
                  key: '{http://www.lexml.gov.br/1.0}p',
                  string: '{http://www.lexml.gov.br/1.0}p',
                },
                value: {
                  TYPE_NAME: 'br_gov_lexml__1.GenInline',
                  content: [
                    'Dispõe sobre a exploração e a produção de petróleo, de gás natural, e de outros hidrocarbonetos fluidos, sob o regime de partilha de produção, em áreas do pré-sal e em áreas estratégicas; altera dispositivos da Lei nº 9.478, de 6 de agosto de 1997; cria o Fundo Social - FS, dispõe sobre sua estrutura e fontes de recursos; e dá outras providências.',
                  ],
                },
              },
            ],
          },
          preambulo: {
            TYPE_NAME: 'br_gov_lexml__1.TextoType',
            id: 'preambulo',
            p: [
              {
                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                content: ['O CONGRESSO NACIONAL decreta:'],
              },
            ],
          },
        },
        articulacao: {
          TYPE_NAME: 'br_gov_lexml__1.Articulacao',
          lXhier: [
            {
              name: {
                namespaceURI: 'http://www.lexml.gov.br/1.0',
                localPart: 'Artigo',
                prefix: '',
                key: '{http://www.lexml.gov.br/1.0}Artigo',
                string: '{http://www.lexml.gov.br/1.0}Artigo',
              },
              value: {
                TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                id: 'art1',
                rotulo: 'Art. 1º',
                lXcontainersOmissis: [
                  {
                    name: {
                      namespaceURI: 'http://www.lexml.gov.br/1.0',
                      localPart: 'Caput',
                      prefix: '',
                      key: '{http://www.lexml.gov.br/1.0}Caput',
                      string: '{http://www.lexml.gov.br/1.0}Caput',
                    },
                    value: {
                      TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                      id: 'art1_cpt',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: [
                            'Esta Lei dispõe sobre a exploração e a produção de petróleo, de gás natural e de outros hidrocarbonetos fluidos em áreas do pré-sal e em áreas estratégicas, cria o Fundo Social - FS, dispõe sobre sua estrutura e fontes de recursos, e altera a Lei nº 9.478, de 6 de agosto de 1997. ',
                          ],
                        },
                      ],
                    },
                  },
                ],
              },
            },
            {
              name: {
                namespaceURI: 'http://www.lexml.gov.br/1.0',
                localPart: 'Artigo',
                prefix: '',
                key: '{http://www.lexml.gov.br/1.0}Artigo',
                string: '{http://www.lexml.gov.br/1.0}Artigo',
              },
              value: {
                TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                id: 'art2',
                rotulo: 'Art. 2º',
                lXcontainersOmissis: [
                  {
                    name: {
                      namespaceURI: 'http://www.lexml.gov.br/1.0',
                      localPart: 'Caput',
                      prefix: '',
                      key: '{http://www.lexml.gov.br/1.0}Caput',
                      string: '{http://www.lexml.gov.br/1.0}Caput',
                    },
                    value: {
                      TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                      id: 'art2_cpt',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: ['Para os fins desta Lei, ficam estabelecidas as seguintes definições:'],
                        },
                      ],
                      lXcontainersOmissis: [
                        {
                          name: {
                            namespaceURI: 'http://www.lexml.gov.br/1.0',
                            localPart: 'Inciso',
                            prefix: '',
                            key: '{http://www.lexml.gov.br/1.0}Inciso',
                            string: '{http://www.lexml.gov.br/1.0}Inciso',
                          },
                          value: {
                            TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                            id: 'art2_cpt_inc1',
                            rotulo: ' I - ',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  'partilha de produção: regime de exploração e produção de petróleo, de gás natural e de outros hidrocarbonetos fluidos no qual o contratado exerce, por sua conta e risco, as atividades de exploração, avaliação, desenvolvimento e produção e, em caso de descoberta comercial, adquire o direito à apropriação do custo em óleo, do volume da produção correspondente aos royalties devidos, bem como de parcela do excedente em óleo, na proporção, condições e prazos estabelecidos em contrato;',
                                ],
                              },
                            ],
                          },
                        },
                        {
                          name: {
                            namespaceURI: 'http://www.lexml.gov.br/1.0',
                            localPart: 'Inciso',
                            prefix: '',
                            key: '{http://www.lexml.gov.br/1.0}Inciso',
                            string: '{http://www.lexml.gov.br/1.0}Inciso',
                          },
                          value: {
                            TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                            id: 'art2_cpt_inc2',
                            rotulo: ' II - ',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  'custo em óleo: parcela da produção de petróleo, de gás natural e de outros hidrocarbonetos fluidos, exigível unicamente em caso de descoberta comercial, correspondente aos custos e aos investimentos realizados pelo contratado na execução das atividades de exploração, avaliação, desenvolvimento, produção e desativação das instalações, sujeita a limites, prazos e condições estabelecidos em contrato;',
                                ],
                              },
                            ],
                          },
                        },
                        {
                          name: {
                            namespaceURI: 'http://www.lexml.gov.br/1.0',
                            localPart: 'Inciso',
                            prefix: '',
                            key: '{http://www.lexml.gov.br/1.0}Inciso',
                            string: '{http://www.lexml.gov.br/1.0}Inciso',
                          },
                          value: {
                            TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                            id: 'art2_cpt_inc3',
                            rotulo: ' III - ',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  'excedente em óleo: parcela da produção de petróleo, de gás natural e de outros hidrocarbonetos fluidos a ser repartida entre a União e o contratado, segundo critérios definidos em contrato, resultante da diferença entre o volume total da produção e as parcelas relativas ao custo em óleo, aos royalties devidos e, quando exigível, à participação de que trata o art. 43;',
                                ],
                              },
                            ],
                          },
                        },
                        {
                          name: {
                            namespaceURI: 'http://www.lexml.gov.br/1.0',
                            localPart: 'Inciso',
                            prefix: '',
                            key: '{http://www.lexml.gov.br/1.0}Inciso',
                            string: '{http://www.lexml.gov.br/1.0}Inciso',
                          },
                          value: {
                            TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                            id: 'art2_cpt_inc4',
                            rotulo: ' IV - ',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  'área do pré-sal: região do subsolo formada por um prisma vertical de profundidade indeterminada, com superfície poligonal definida pelas coordenadas geográficas de seus vértices estabelecidas no Anexo desta Lei, bem como outras regiões que venham a ser delimitadas, em ato do Poder Executivo, de acordo com a evolução do conhecimento geológico;',
                                ],
                              },
                            ],
                          },
                        },
                        {
                          name: {
                            namespaceURI: 'http://www.lexml.gov.br/1.0',
                            localPart: 'Inciso',
                            prefix: '',
                            key: '{http://www.lexml.gov.br/1.0}Inciso',
                            string: '{http://www.lexml.gov.br/1.0}Inciso',
                          },
                          value: {
                            TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                            id: 'art2_cpt_inc5',
                            rotulo: ' V - ',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  'área estratégica: região de interesse para o desenvolvimento nacional, delimitada em ato do Poder Executivo, caracterizada pelo baixo risco exploratório e elevado potencial de produção de petróleo, de gás natural e de outros hidrocarbonetos fluidos;',
                                ],
                              },
                            ],
                          },
                        },
                        {
                          name: {
                            namespaceURI: 'http://www.lexml.gov.br/1.0',
                            localPart: 'Inciso',
                            prefix: '',
                            key: '{http://www.lexml.gov.br/1.0}Inciso',
                            string: '{http://www.lexml.gov.br/1.0}Inciso',
                          },
                          value: {
                            TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                            id: 'art2_cpt_inc6',
                            rotulo: ' VI - ',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  'operador: a Petróleo Brasileiro S.A. - PETROBRAS, responsável pela condução e execução, direta ou indireta, de todas as atividades de exploração, avaliação, desenvolvimento, produção e desativação das instalações de exploração e produção;',
                                ],
                              },
                            ],
                          },
                        },
                        {
                          name: {
                            namespaceURI: 'http://www.lexml.gov.br/1.0',
                            localPart: 'Inciso',
                            prefix: '',
                            key: '{http://www.lexml.gov.br/1.0}Inciso',
                            string: '{http://www.lexml.gov.br/1.0}Inciso',
                          },
                          value: {
                            TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                            id: 'art2_cpt_inc7',
                            rotulo: ' VII - ',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  'contratado: a PETROBRAS ou, quando for o caso, o consórcio por ela constituído com o vencedor da licitação para a exploração e produção de petróleo, de gás natural e de outros hidrocarbonetos fluidos em regime de partilha de produção;',
                                ],
                              },
                            ],
                            alteracao: {
                              TYPE_NAME: 'br_gov_lexml__1.Alteracao',
                              id: 'art2_cpt_inc7_alt1',
                              base: 'urn:lex:br:federal:lei:2006-08-07;11340',
                              content: [
                                {
                                  name: {
                                    namespaceURI: 'http://www.lexml.gov.br/1.0',
                                    localPart: 'Artigo',
                                    prefix: '',
                                    key: '{http://www.lexml.gov.br/1.0}Artigo',
                                    string: '{http://www.lexml.gov.br/1.0}Artigo',
                                  },
                                  value: {
                                    TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                    id: 'art2_cpt_inc7_alt1_art1',
                                    abreAspas: 's',
                                    fechaAspas: 's',
                                    notaAlteracao: 'NR',
                                    rotulo: 'Art. 1º',
                                    lXcontainersOmissis: [
                                      {
                                        name: {
                                          namespaceURI: 'http://www.lexml.gov.br/1.0',
                                          localPart: 'Caput',
                                          prefix: '',
                                          key: '{http://www.lexml.gov.br/1.0}Caput',
                                          string: '{http://www.lexml.gov.br/1.0}Caput',
                                        },
                                        value: {
                                          TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                          id: 'art2_cpt_inc7_alt1_art1_cpt',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: ['Sem prejuízo das demais normas em vigor ...'],
                                            },
                                          ],
                                          lXcontainersOmissis: [
                                            {
                                              name: {
                                                namespaceURI: 'http://www.lexml.gov.br/1.0',
                                                localPart: 'Inciso',
                                                prefix: '',
                                                key: '{http://www.lexml.gov.br/1.0}Inciso',
                                                string: '{http://www.lexml.gov.br/1.0}Inciso',
                                              },
                                              value: {
                                                TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                                id: 'art2_cpt_inc7_alt1_art1_cpt_inc1',
                                                rotulo: 'I - ',
                                                p: [
                                                  {
                                                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                    content: ['Nono nono nono'],
                                                  },
                                                ],
                                              },
                                            },
                                            {
                                              name: {
                                                namespaceURI: 'http://www.lexml.gov.br/1.0',
                                                localPart: 'Inciso',
                                                prefix: '',
                                                key: '{http://www.lexml.gov.br/1.0}Inciso',
                                                string: '{http://www.lexml.gov.br/1.0}Inciso',
                                              },
                                              value: {
                                                TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                                id: 'art2_cpt_inc7_alt1_art1_cpt_inc2',
                                                rotulo: 'II - ',
                                                p: [
                                                  {
                                                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                    content: ['Nono nono nono'],
                                                  },
                                                ],
                                              },
                                            },
                                          ],
                                        },
                                      },
                                    ],
                                  },
                                },
                                {
                                  name: {
                                    namespaceURI: 'http://www.lexml.gov.br/1.0',
                                    localPart: 'Artigo',
                                    prefix: '',
                                    key: '{http://www.lexml.gov.br/1.0}Artigo',
                                    string: '{http://www.lexml.gov.br/1.0}Artigo',
                                  },
                                  value: {
                                    TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                    id: 'art2_cpt_inc7_alt1_art7',
                                    abreAspas: 's',
                                    fechaAspas: 's',
                                    notaAlteracao: 'NR',
                                    rotulo: 'Art. 7º',
                                    lXcontainersOmissis: [
                                      {
                                        name: {
                                          namespaceURI: 'http://www.lexml.gov.br/1.0',
                                          localPart: 'Caput',
                                          prefix: '',
                                          key: '{http://www.lexml.gov.br/1.0}Caput',
                                          string: '{http://www.lexml.gov.br/1.0}Caput',
                                        },
                                        value: {
                                          TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                          id: 'art2_cpt_inc7_alt1_art7_cpt',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: ['Sem prejuízo das demais normas em vigor ...'],
                                            },
                                          ],
                                          lXcontainersOmissis: [
                                            {
                                              name: {
                                                namespaceURI: 'http://www.lexml.gov.br/1.0',
                                                localPart: 'Inciso',
                                                prefix: '',
                                                key: '{http://www.lexml.gov.br/1.0}Inciso',
                                                string: '{http://www.lexml.gov.br/1.0}Inciso',
                                              },
                                              value: {
                                                TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                                id: 'art2_cpt_inc7_alt1_art7_cpt_inc1',
                                                rotulo: 'I - ',
                                                p: [
                                                  {
                                                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                    content: ['Nono nono nono'],
                                                  },
                                                ],
                                              },
                                            },
                                            {
                                              name: {
                                                namespaceURI: 'http://www.lexml.gov.br/1.0',
                                                localPart: 'Omissis',
                                                prefix: '',
                                                key: '{http://www.lexml.gov.br/1.0}Omissis',
                                                string: '{http://www.lexml.gov.br/1.0}Omissis',
                                              },
                                              value: {
                                                TYPE_NAME: 'br_gov_lexml__1.Omissis',
                                                id: 'art2_cpt_inc7_alt1_art7_cpt_omi1',
                                              },
                                            },
                                            {
                                              name: {
                                                namespaceURI: 'http://www.lexml.gov.br/1.0',
                                                localPart: 'Inciso',
                                                prefix: '',
                                                key: '{http://www.lexml.gov.br/1.0}Inciso',
                                                string: '{http://www.lexml.gov.br/1.0}Inciso',
                                              },
                                              value: {
                                                TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                                id: 'art2_cpt_inc7_alt1_art7_cpt_inc3',
                                                rotulo: 'III - ',
                                                p: [
                                                  {
                                                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                    content: ['Nono nono nono'],
                                                  },
                                                ],
                                              },
                                            },
                                            {
                                              name: {
                                                namespaceURI: 'http://www.lexml.gov.br/1.0',
                                                localPart: 'Inciso',
                                                prefix: '',
                                                key: '{http://www.lexml.gov.br/1.0}Inciso',
                                                string: '{http://www.lexml.gov.br/1.0}Inciso',
                                              },
                                              value: {
                                                TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                                id: 'art2_cpt_inc7_alt1_art7_cpt_inc4',
                                                rotulo: 'IV - ',
                                                p: [
                                                  {
                                                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                    content: ['Nono nono nono'],
                                                  },
                                                ],
                                              },
                                            },
                                            {
                                              name: {
                                                namespaceURI: 'http://www.lexml.gov.br/1.0',
                                                localPart: 'Inciso',
                                                prefix: '',
                                                key: '{http://www.lexml.gov.br/1.0}Inciso',
                                                string: '{http://www.lexml.gov.br/1.0}Inciso',
                                              },
                                              value: {
                                                TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                                id: 'art2_cpt_inc7_alt1_art7_cpt_inc5',
                                                rotulo: 'V - ',
                                                p: [
                                                  {
                                                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                    content: ['Nono nono nono'],
                                                  },
                                                ],
                                              },
                                            },
                                          ],
                                        },
                                      },
                                      {
                                        name: {
                                          namespaceURI: 'http://www.lexml.gov.br/1.0',
                                          localPart: 'Omissis',
                                          prefix: '',
                                          key: '{http://www.lexml.gov.br/1.0}Omissis',
                                          string: '{http://www.lexml.gov.br/1.0}Omissis',
                                        },
                                        value: {
                                          TYPE_NAME: 'br_gov_lexml__1.Omissis',
                                          id: 'art2_cpt_inc7_alt1_art7_omi1',
                                        },
                                      },
                                    ],
                                  },
                                },
                              ],
                            },
                          },
                        },
                        {
                          name: {
                            namespaceURI: 'http://www.lexml.gov.br/1.0',
                            localPart: 'Inciso',
                            prefix: '',
                            key: '{http://www.lexml.gov.br/1.0}Inciso',
                            string: '{http://www.lexml.gov.br/1.0}Inciso',
                          },
                          value: {
                            TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                            id: 'art2_cpt_inc8',
                            rotulo: ' VIII - ',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  'conteúdo local: proporção entre o valor dos bens produzidos e dos serviços prestados no País para execução do contrato e o valor total dos bens utilizados e dos serviços prestados para essa finalidade;',
                                ],
                              },
                            ],
                          },
                        },
                        {
                          name: {
                            namespaceURI: 'http://www.lexml.gov.br/1.0',
                            localPart: 'Inciso',
                            prefix: '',
                            key: '{http://www.lexml.gov.br/1.0}Inciso',
                            string: '{http://www.lexml.gov.br/1.0}Inciso',
                          },
                          value: {
                            TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                            id: 'art2_cpt_inc9',
                            rotulo: ' IX - ',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  'individualização da produção: procedimento que visa à divisão do resultado da produção e ao aproveitamento racional dos recursos naturais da União por meio da unificação do desenvolvimento e da produção relativos à jazida que se estenda além de bloco concedido ou contratado sob o regime de partilha de produção;',
                                ],
                              },
                            ],
                          },
                        },
                        {
                          name: {
                            namespaceURI: 'http://www.lexml.gov.br/1.0',
                            localPart: 'Inciso',
                            prefix: '',
                            key: '{http://www.lexml.gov.br/1.0}Inciso',
                            string: '{http://www.lexml.gov.br/1.0}Inciso',
                          },
                          value: {
                            TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                            id: 'art2_cpt_inc10',
                            rotulo: ' X - ',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  'ponto de medição: local definido no plano de desenvolvimento de cada campo onde é realizada a medição volumétrica do petróleo ou do gás natural produzido, conforme regulação da Agência Nacional do Petróleo, Gás Natural e Biocombustíveis - ANP;',
                                ],
                              },
                            ],
                          },
                        },
                        {
                          name: {
                            namespaceURI: 'http://www.lexml.gov.br/1.0',
                            localPart: 'Inciso',
                            prefix: '',
                            key: '{http://www.lexml.gov.br/1.0}Inciso',
                            string: '{http://www.lexml.gov.br/1.0}Inciso',
                          },
                          value: {
                            TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                            id: 'art2_cpt_inc11',
                            rotulo: ' XI - ',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  'ponto de partilha: local em que há divisão entre a União e o contratado do petróleo, de gás natural e de outros hidrocarbonetos fluidos produzidos, nos termos do respectivo contrato de partilha de produção;',
                                ],
                              },
                            ],
                          },
                        },
                        {
                          name: {
                            namespaceURI: 'http://www.lexml.gov.br/1.0',
                            localPart: 'Inciso',
                            prefix: '',
                            key: '{http://www.lexml.gov.br/1.0}Inciso',
                            string: '{http://www.lexml.gov.br/1.0}Inciso',
                          },
                          value: {
                            TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                            id: 'art2_cpt_inc12',
                            rotulo: ' XII - ',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  'bônus de assinatura: valor fixo devido à União pelo contratado, a ser pago no ato da celebração e nos termos do respectivo contrato de partilha de produção; e',
                                ],
                              },
                            ],
                          },
                        },
                        {
                          name: {
                            namespaceURI: 'http://www.lexml.gov.br/1.0',
                            localPart: 'Inciso',
                            prefix: '',
                            key: '{http://www.lexml.gov.br/1.0}Inciso',
                            string: '{http://www.lexml.gov.br/1.0}Inciso',
                          },
                          value: {
                            TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                            id: 'art2_cpt_inc13',
                            rotulo: ' XIII - ',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  'royalties: compensação financeira devida aos Estados, ao Distrito Federal e aos Municípios, bem como a órgãos da administração direta da União, em função da produção de petróleo, de gás natural e de outros hidrocarbonetos fluidos sob o regime de partilha de produção, nos termos do § 1º do art. 20 da Constituição Federal.',
                                ],
                              },
                            ],
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
            {
              name: {
                namespaceURI: 'http://www.lexml.gov.br/1.0',
                localPart: 'Artigo',
                prefix: '',
                key: '{http://www.lexml.gov.br/1.0}Artigo',
                string: '{http://www.lexml.gov.br/1.0}Artigo',
              },
              value: {
                TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                id: 'art3',
                rotulo: 'Art. 3º',
                lXcontainersOmissis: [
                  {
                    name: {
                      namespaceURI: 'http://www.lexml.gov.br/1.0',
                      localPart: 'Caput',
                      prefix: '',
                      key: '{http://www.lexml.gov.br/1.0}Caput',
                      string: '{http://www.lexml.gov.br/1.0}Caput',
                    },
                    value: {
                      TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                      id: 'art3_cpt',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: [
                            'A exploração e a produção de petróleo, de gás natural e de outros hidrocarbonetos fluidos na área do pré-sal e em áreas estratégicas serão contratadas pela União no regime de partilha de produção, na forma desta Lei.',
                          ],
                        },
                      ],
                    },
                  },
                ],
              },
            },
            {
              name: {
                namespaceURI: 'http://www.lexml.gov.br/1.0',
                localPart: 'Titulo',
                prefix: '',
                key: '{http://www.lexml.gov.br/1.0}Titulo',
                string: '{http://www.lexml.gov.br/1.0}Titulo',
              },
              value: {
                TYPE_NAME: 'br_gov_lexml__1.Hierarchy',
                id: 'tit1',
                rotulo: 'TÍTULO I',
                nomeAgrupador: {
                  TYPE_NAME: 'br_gov_lexml__1.GenInline',
                  content: ['DAS DEFINIÇÕES...'],
                },
                lXhier: [
                  {
                    name: {
                      namespaceURI: 'http://www.lexml.gov.br/1.0',
                      localPart: 'Capitulo',
                      prefix: '',
                      key: '{http://www.lexml.gov.br/1.0}Capitulo',
                      string: '{http://www.lexml.gov.br/1.0}Capitulo',
                    },
                    value: {
                      TYPE_NAME: 'br_gov_lexml__1.Hierarchy',
                      id: 'cap1',
                      rotulo: 'CAPÍTULO I',
                      nomeAgrupador: {
                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                        content: ['DAS DEFINIÇÕES TÉCNICAS '],
                      },
                      lXhier: [
                        {
                          name: {
                            namespaceURI: 'http://www.lexml.gov.br/1.0',
                            localPart: 'Artigo',
                            prefix: '',
                            key: '{http://www.lexml.gov.br/1.0}Artigo',
                            string: '{http://www.lexml.gov.br/1.0}Artigo',
                          },
                          value: {
                            TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                            id: 'art4',
                            rotulo: 'Art. 4º',
                            lXcontainersOmissis: [
                              {
                                name: {
                                  namespaceURI: 'http://www.lexml.gov.br/1.0',
                                  localPart: 'Caput',
                                  prefix: '',
                                  key: '{http://www.lexml.gov.br/1.0}Caput',
                                  string: '{http://www.lexml.gov.br/1.0}Caput',
                                },
                                value: {
                                  TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                  id: 'art4_cpt',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: [
                                        'A PETROBRAS será a operadora de todos os blocos contratados sob o regime de partilha de produção, sendo-lhe assegurado, a este título, participação mínima no consórcio previsto no art. 20.',
                                      ],
                                    },
                                  ],
                                },
                              },
                            ],
                          },
                        },
                        {
                          name: {
                            namespaceURI: 'http://www.lexml.gov.br/1.0',
                            localPart: 'Artigo',
                            prefix: '',
                            key: '{http://www.lexml.gov.br/1.0}Artigo',
                            string: '{http://www.lexml.gov.br/1.0}Artigo',
                          },
                          value: {
                            TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                            id: 'art5',
                            rotulo: 'Art. 5º',
                            lXcontainersOmissis: [
                              {
                                name: {
                                  namespaceURI: 'http://www.lexml.gov.br/1.0',
                                  localPart: 'Caput',
                                  prefix: '',
                                  key: '{http://www.lexml.gov.br/1.0}Caput',
                                  string: '{http://www.lexml.gov.br/1.0}Caput',
                                },
                                value: {
                                  TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                  id: 'art5_cpt',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: [
                                        'A União não assumirá os riscos das atividades de exploração, avaliação, desenvolvimento e produção decorrentes dos contratos de partilha de produção.',
                                      ],
                                    },
                                  ],
                                },
                              },
                            ],
                          },
                        },
                        {
                          name: {
                            namespaceURI: 'http://www.lexml.gov.br/1.0',
                            localPart: 'Artigo',
                            prefix: '',
                            key: '{http://www.lexml.gov.br/1.0}Artigo',
                            string: '{http://www.lexml.gov.br/1.0}Artigo',
                          },
                          value: {
                            TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                            id: 'art6',
                            rotulo: 'Art. 6º',
                            lXcontainersOmissis: [
                              {
                                name: {
                                  namespaceURI: 'http://www.lexml.gov.br/1.0',
                                  localPart: 'Caput',
                                  prefix: '',
                                  key: '{http://www.lexml.gov.br/1.0}Caput',
                                  string: '{http://www.lexml.gov.br/1.0}Caput',
                                },
                                value: {
                                  TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                  id: 'art6_cpt',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: ['O art. 1º da Lei nº 11.340, de 7 de agosto de 2006, passa a vigorar com a seguinte redação:'],
                                    },
                                  ],
                                  alteracao: {
                                    TYPE_NAME: 'br_gov_lexml__1.Alteracao',
                                    id: 'art6_cpt_alt1',
                                    base: 'urn:lex:br:federal:lei:2006-08-07;11340',
                                    content: [
                                      {
                                        name: {
                                          namespaceURI: 'http://www.lexml.gov.br/1.0',
                                          localPart: 'Artigo',
                                          prefix: '',
                                          key: '{http://www.lexml.gov.br/1.0}Artigo',
                                          string: '{http://www.lexml.gov.br/1.0}Artigo',
                                        },
                                        value: {
                                          TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                          id: 'art6_cpt_alt1_art1',
                                          abreAspas: 's',
                                          fechaAspas: 's',
                                          notaAlteracao: 'NR',
                                          rotulo: 'Art. 1º',
                                          lXcontainersOmissis: [
                                            {
                                              name: {
                                                namespaceURI: 'http://www.lexml.gov.br/1.0',
                                                localPart: 'Caput',
                                                prefix: '',
                                                key: '{http://www.lexml.gov.br/1.0}Caput',
                                                string: '{http://www.lexml.gov.br/1.0}Caput',
                                              },
                                              value: {
                                                TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                                id: 'art6_cpt_alt1_art1_cpt',
                                                p: [
                                                  {
                                                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                    content: ['Sem prejuízo das demais normas em vigor ...'],
                                                  },
                                                ],
                                                lXcontainersOmissis: [
                                                  {
                                                    name: {
                                                      namespaceURI: 'http://www.lexml.gov.br/1.0',
                                                      localPart: 'Omissis',
                                                      prefix: '',
                                                      key: '{http://www.lexml.gov.br/1.0}Omissis',
                                                      string: '{http://www.lexml.gov.br/1.0}Omissis',
                                                    },
                                                    value: {
                                                      TYPE_NAME: 'br_gov_lexml__1.Omissis',
                                                      id: 'art6_cpt_alt1_art1_cpt_omi1',
                                                    },
                                                  },
                                                  {
                                                    name: {
                                                      namespaceURI: 'http://www.lexml.gov.br/1.0',
                                                      localPart: 'Inciso',
                                                      prefix: '',
                                                      key: '{http://www.lexml.gov.br/1.0}Inciso',
                                                      string: '{http://www.lexml.gov.br/1.0}Inciso',
                                                    },
                                                    value: {
                                                      TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                                      id: 'art6_cpt_alt1_art1_cpt_inc3',
                                                      rotulo: 'III - ',
                                                      p: [
                                                        {
                                                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                          content: ['Atividades de exploração, avaliação ...'],
                                                        },
                                                      ],
                                                    },
                                                  },
                                                  {
                                                    name: {
                                                      namespaceURI: 'http://www.lexml.gov.br/1.0',
                                                      localPart: 'Omissis',
                                                      prefix: '',
                                                      key: '{http://www.lexml.gov.br/1.0}Omissis',
                                                      string: '{http://www.lexml.gov.br/1.0}Omissis',
                                                    },
                                                    value: {
                                                      TYPE_NAME: 'br_gov_lexml__1.Omissis',
                                                      id: 'art6_cpt_alt1_art1_cpt_omi2',
                                                    },
                                                  },
                                                ],
                                              },
                                            },
                                          ],
                                        },
                                      },
                                    ],
                                  },
                                },
                              },
                            ],
                          },
                        },
                        {
                          name: {
                            namespaceURI: 'http://www.lexml.gov.br/1.0',
                            localPart: 'Artigo',
                            prefix: '',
                            key: '{http://www.lexml.gov.br/1.0}Artigo',
                            string: '{http://www.lexml.gov.br/1.0}Artigo',
                          },
                          value: {
                            TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                            id: 'art7',
                            rotulo: 'Art. 7º',
                            lXcontainersOmissis: [
                              {
                                name: {
                                  namespaceURI: 'http://www.lexml.gov.br/1.0',
                                  localPart: 'Caput',
                                  prefix: '',
                                  key: '{http://www.lexml.gov.br/1.0}Caput',
                                  string: '{http://www.lexml.gov.br/1.0}Caput',
                                },
                                value: {
                                  TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                  id: 'art7_cpt',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: [
                                        'Os custos e os investimentos necessários à execução do contrato de partilha de produção serão integralmente suportados pelo contratado, cabendo-lhe, no caso de descoberta comercial, a sua restituição nos termos do inciso II do art. 2º.',
                                      ],
                                    },
                                  ],
                                },
                              },
                            ],
                          },
                        },
                      ],
                    },
                  },
                  {
                    name: {
                      namespaceURI: 'http://www.lexml.gov.br/1.0',
                      localPart: 'Capitulo',
                      prefix: '',
                      key: '{http://www.lexml.gov.br/1.0}Capitulo',
                      string: '{http://www.lexml.gov.br/1.0}Capitulo',
                    },
                    value: {
                      TYPE_NAME: 'br_gov_lexml__1.Hierarchy',
                      id: 'cap2',
                      rotulo: 'CAPÍTULO II',
                      nomeAgrupador: {
                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                        content: ['DAS OUTRAS DEFINIÇÕES '],
                      },
                      lXhier: [
                        {
                          name: {
                            namespaceURI: 'http://www.lexml.gov.br/1.0',
                            localPart: 'Artigo',
                            prefix: '',
                            key: '{http://www.lexml.gov.br/1.0}Artigo',
                            string: '{http://www.lexml.gov.br/1.0}Artigo',
                          },
                          value: {
                            TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                            id: 'art8',
                            rotulo: 'Art. 8º',
                            lXcontainersOmissis: [
                              {
                                name: {
                                  namespaceURI: 'http://www.lexml.gov.br/1.0',
                                  localPart: 'Caput',
                                  prefix: '',
                                  key: '{http://www.lexml.gov.br/1.0}Caput',
                                  string: '{http://www.lexml.gov.br/1.0}Caput',
                                },
                                value: {
                                  TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                  id: 'art8_cpt',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: [
                                        'Os custos e os investimentos necessários à execução do contrato de partilha de produção serão integralmente suportados pelo contratado, cabendo-lhe, no caso de descoberta comercial, a sua restituição nos termos do inciso II do art. 2º.',
                                      ],
                                    },
                                  ],
                                  lXcontainersOmissis: [
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art8_cpt_inc1',
                                        rotulo: ' I - ',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: ['xpto;'],
                                          },
                                        ],
                                      },
                                    },
                                  ],
                                },
                              },
                              {
                                name: {
                                  namespaceURI: 'http://www.lexml.gov.br/1.0',
                                  localPart: 'Paragrafo',
                                  prefix: '',
                                  key: '{http://www.lexml.gov.br/1.0}Paragrafo',
                                  string: '{http://www.lexml.gov.br/1.0}Paragrafo',
                                },
                                value: {
                                  TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                  id: 'art8_par1',
                                  rotulo: 'Parágrafo único.',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: ['Nas hipóteses previstas neste Código e nas demais leis, pode ser autorizada somente a presença das partes ou de seus advogados.'],
                                    },
                                  ],
                                },
                              },
                            ],
                          },
                        },
                        {
                          name: {
                            namespaceURI: 'http://www.lexml.gov.br/1.0',
                            localPart: 'Artigo',
                            prefix: '',
                            key: '{http://www.lexml.gov.br/1.0}Artigo',
                            string: '{http://www.lexml.gov.br/1.0}Artigo',
                          },
                          value: {
                            TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                            id: 'art9',
                            rotulo: 'Art. 9º',
                            lXcontainersOmissis: [
                              {
                                name: {
                                  namespaceURI: 'http://www.lexml.gov.br/1.0',
                                  localPart: 'Caput',
                                  prefix: '',
                                  key: '{http://www.lexml.gov.br/1.0}Caput',
                                  string: '{http://www.lexml.gov.br/1.0}Caput',
                                },
                                value: {
                                  TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                  id: 'art9_cpt',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: [
                                        'Os custos e os investimentos necessários à execução do contrato de partilha de produção serão integralmente suportados pelo contratado, cabendo-lhe, no caso de descoberta comercial, a sua restituição nos termos do inciso II do art. 2º.',
                                      ],
                                    },
                                  ],
                                },
                              },
                              {
                                name: {
                                  namespaceURI: 'http://www.lexml.gov.br/1.0',
                                  localPart: 'Paragrafo',
                                  prefix: '',
                                  key: '{http://www.lexml.gov.br/1.0}Paragrafo',
                                  string: '{http://www.lexml.gov.br/1.0}Paragrafo',
                                },
                                value: {
                                  TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                  id: 'art9_par1',
                                  rotulo: 'Parágrafo 1º.',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: ['Nas hipóteses previstas neste Código e nas demais leis, pode ser autorizada somente a presença das partes ou de seus advogados.'],
                                    },
                                  ],
                                },
                              },
                              {
                                name: {
                                  namespaceURI: 'http://www.lexml.gov.br/1.0',
                                  localPart: 'Paragrafo',
                                  prefix: '',
                                  key: '{http://www.lexml.gov.br/1.0}Paragrafo',
                                  string: '{http://www.lexml.gov.br/1.0}Paragrafo',
                                },
                                value: {
                                  TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                  id: 'art9_par2',
                                  rotulo: 'Parágrafo 2º.',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: ['Nas hipóteses previstas neste Código e nas demais leis, pode ser autorizada somente a presença das partes ou de seus advogados.'],
                                    },
                                  ],
                                },
                              },
                              {
                                name: {
                                  namespaceURI: 'http://www.lexml.gov.br/1.0',
                                  localPart: 'Paragrafo',
                                  prefix: '',
                                  key: '{http://www.lexml.gov.br/1.0}Paragrafo',
                                  string: '{http://www.lexml.gov.br/1.0}Paragrafo',
                                },
                                value: {
                                  TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                  id: 'art9_par3',
                                  rotulo: 'Parágrafo 3º.',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: ['Nas hipóteses previstas neste Código e nas demais leis, pode ser autorizada somente a presença das partes ou de seus advogados.'],
                                    },
                                  ],
                                },
                              },
                              {
                                name: {
                                  namespaceURI: 'http://www.lexml.gov.br/1.0',
                                  localPart: 'Paragrafo',
                                  prefix: '',
                                  key: '{http://www.lexml.gov.br/1.0}Paragrafo',
                                  string: '{http://www.lexml.gov.br/1.0}Paragrafo',
                                },
                                value: {
                                  TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                  id: 'art9_par4',
                                  rotulo: 'Parágrafo 4º.',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: ['Nas hipóteses previstas neste Código e nas demais leis, pode ser autorizada somente a presença das partes ou de seus advogados.'],
                                    },
                                  ],
                                },
                              },
                              {
                                name: {
                                  namespaceURI: 'http://www.lexml.gov.br/1.0',
                                  localPart: 'Paragrafo',
                                  prefix: '',
                                  key: '{http://www.lexml.gov.br/1.0}Paragrafo',
                                  string: '{http://www.lexml.gov.br/1.0}Paragrafo',
                                },
                                value: {
                                  TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                  id: 'art9_par5',
                                  rotulo: 'Parágrafo 5º.',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: ['Nas hipóteses previstas neste Código e nas demais leis, pode ser autorizada somente a presença das partes ou de seus advogados.'],
                                    },
                                  ],
                                },
                              },
                              {
                                name: {
                                  namespaceURI: 'http://www.lexml.gov.br/1.0',
                                  localPart: 'Paragrafo',
                                  prefix: '',
                                  key: '{http://www.lexml.gov.br/1.0}Paragrafo',
                                  string: '{http://www.lexml.gov.br/1.0}Paragrafo',
                                },
                                value: {
                                  TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                  id: 'art9_par6',
                                  rotulo: 'Parágrafo 6º.',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: ['Nas hipóteses previstas neste Código e nas demais leis, pode ser autorizada somente a presença das partes ou de seus advogados.'],
                                    },
                                  ],
                                  lXcontainersOmissis: [
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art9_par6_inc1',
                                        rotulo: ' I - ',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: ['abcd;'],
                                          },
                                        ],
                                        lXcontainersOmissis: [
                                          {
                                            name: {
                                              namespaceURI: 'http://www.lexml.gov.br/1.0',
                                              localPart: 'Alinea',
                                              prefix: '',
                                              key: '{http://www.lexml.gov.br/1.0}Alinea',
                                              string: '{http://www.lexml.gov.br/1.0}Alinea',
                                            },
                                            value: {
                                              TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                              id: 'art9_par6_inc1_ali1',
                                              rotulo: ' a) ',
                                              p: [
                                                {
                                                  TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                  content: ['abcd;'],
                                                },
                                              ],
                                              lXcontainersOmissis: [
                                                {
                                                  name: {
                                                    namespaceURI: 'http://www.lexml.gov.br/1.0',
                                                    localPart: 'Item',
                                                    prefix: '',
                                                    key: '{http://www.lexml.gov.br/1.0}Item',
                                                    string: '{http://www.lexml.gov.br/1.0}Item',
                                                  },
                                                  value: {
                                                    TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                                    id: 'art9_par6_inc1_ali1_ite1',
                                                    rotulo: ' 1 - ',
                                                    p: [
                                                      {
                                                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                        content: ['abcd;'],
                                                      },
                                                    ],
                                                  },
                                                },
                                                {
                                                  name: {
                                                    namespaceURI: 'http://www.lexml.gov.br/1.0',
                                                    localPart: 'Item',
                                                    prefix: '',
                                                    key: '{http://www.lexml.gov.br/1.0}Item',
                                                    string: '{http://www.lexml.gov.br/1.0}Item',
                                                  },
                                                  value: {
                                                    TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                                    id: 'art9_par6_inc1_ali1_ite2',
                                                    rotulo: ' 2 - ',
                                                    p: [
                                                      {
                                                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                        content: ['abcd;'],
                                                      },
                                                    ],
                                                  },
                                                },
                                              ],
                                            },
                                          },
                                          {
                                            name: {
                                              namespaceURI: 'http://www.lexml.gov.br/1.0',
                                              localPart: 'Alinea',
                                              prefix: '',
                                              key: '{http://www.lexml.gov.br/1.0}Alinea',
                                              string: '{http://www.lexml.gov.br/1.0}Alinea',
                                            },
                                            value: {
                                              TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                              id: 'art9_par6_inc1_ali2',
                                              rotulo: ' b) ',
                                              p: [
                                                {
                                                  TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                                  content: ['abcd;'],
                                                },
                                              ],
                                            },
                                          },
                                        ],
                                      },
                                    },
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art9_par6_inc2',
                                        rotulo: ' II - ',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: ['xpto;'],
                                          },
                                        ],
                                      },
                                    },
                                  ],
                                },
                              },
                              {
                                name: {
                                  namespaceURI: 'http://www.lexml.gov.br/1.0',
                                  localPart: 'Paragrafo',
                                  prefix: '',
                                  key: '{http://www.lexml.gov.br/1.0}Paragrafo',
                                  string: '{http://www.lexml.gov.br/1.0}Paragrafo',
                                },
                                value: {
                                  TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                  id: 'art9_par7',
                                  rotulo: 'Parágrafo 7º.',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: ['Nas hipóteses previstas neste Código e nas demais leis, pode ser autorizada somente a presença das partes ou de seus advogados.'],
                                    },
                                  ],
                                  lXcontainersOmissis: [
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art9_par7_inc1',
                                        rotulo: ' I - ',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: ['abcd;'],
                                          },
                                        ],
                                      },
                                    },
                                    {
                                      name: {
                                        namespaceURI: 'http://www.lexml.gov.br/1.0',
                                        localPart: 'Inciso',
                                        prefix: '',
                                        key: '{http://www.lexml.gov.br/1.0}Inciso',
                                        string: '{http://www.lexml.gov.br/1.0}Inciso',
                                      },
                                      value: {
                                        TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
                                        id: 'art9_par7_inc2',
                                        rotulo: ' II - ',
                                        p: [
                                          {
                                            TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                            content: ['xpto;'],
                                          },
                                        ],
                                      },
                                    },
                                  ],
                                },
                              },
                            ],
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    },
  },
};
