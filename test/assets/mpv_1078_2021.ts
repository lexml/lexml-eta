export const MPV_1078_2021 = {
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
        urn: 'urn:lex:br:federal:medida.provisoria:2021-12-13;1078',
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
            content: ['MEDIDA PROVISÓRIA Nº 1.078, DE 13 DE DEZEMBRO DE 2021 '],
          },
          ementa: {
            TYPE_NAME: 'br_gov_lexml__1.GenInline',
            id: 'ementa',
            content: ['Dispõe sobre as medidas destinadas ao enfrentamento dos impactos financeiros no setor elétrico decorrentes da situação de escassez hídrica.\n'],
          },
          preambulo: {
            TYPE_NAME: 'br_gov_lexml__1.TextoType',
            id: 'preambulo',
            p: [
              {
                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                content: [
                  '\n    O PRESIDENTE DA REPÚBLICA, no uso da atribuição que lhe confere o art. 62 da Constituição, adota a seguinte Medida Provisória, com força de lei:\n  ',
                ],
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
                            '\n    A ',
                            {
                              name: {
                                namespaceURI: 'http://www.lexml.gov.br/1.0',
                                localPart: 'span',
                                prefix: '',
                                key: '{http://www.lexml.gov.br/1.0}span',
                                string: '{http://www.lexml.gov.br/1.0}span',
                              },
                              value: {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                href: 'urn:lex:br:federal:lei:2002-04-26;10438',
                                content: ['Lei nº 10.438, de 26 de abril de 2002'],
                              },
                            },
                            ', passa a vigorar com as seguintes alterações:\n\n  ',
                          ],
                        },
                      ],
                      alteracao: {
                        TYPE_NAME: 'br_gov_lexml__1.Alteracao',
                        base: 'urn:lex:br:federal:lei:2002-04-26;10438',
                        id: 'art1_cpt_alt1',
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
                              href: 'art13',
                              id: 'art1_cpt_alt1_art13',
                              abreAspas: 's',
                              rotulo: 'Art. 13.',
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
                                    href: 'art13_cpt',
                                    id: 'art1_cpt_alt1_art13_cpt',
                                    textoOmitido: 's',
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
                                          id: 'art1_cpt_alt1_art13_cpt_omi1',
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
                                          href: 'art13_cpt_inc17',
                                          id: 'art1_cpt_alt1_art13_cpt_inc17',
                                          rotulo: 'XVII –',
                                          p: [
                                            {
                                              TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                              content: [
                                                '\n    prover recursos, arrecadados exclusivamente por meio de encargo tarifário, para a amortização de operações financeiras vinculadas a medidas de enfrentamento aos impactos financeiros no setor elétrico decorrentes da situação de escassez hídrica e dos diferimentos aplicados no processo tarifário anterior à liberação dos recursos da operação financeira, conforme definido em regulamento.\n\n  ',
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
                                    localPart: 'Omissis',
                                    prefix: '',
                                    key: '{http://www.lexml.gov.br/1.0}Omissis',
                                    string: '{http://www.lexml.gov.br/1.0}Omissis',
                                  },
                                  value: {
                                    TYPE_NAME: 'br_gov_lexml__1.Omissis',
                                    id: 'art1_cpt_alt1_art13_omi1',
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
                                    href: 'art13_par1-8',
                                    id: 'art1_cpt_alt1_art13_par1-8',
                                    rotulo: '§ 1º-H.',
                                    p: [
                                      {
                                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                        content: [
                                          '\n    O Poder Executivo federal poderá estabelecer condições e requisitos para a estruturação das operações financeiras e para a disponibilização e o recolhimento dos recursos de que trata o inciso XVII do caput.\n\n  ',
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
                                    href: 'art13_par1-9',
                                    id: 'art1_cpt_alt1_art13_par1-9',
                                    rotulo: '§ 1º-I.',
                                    p: [
                                      {
                                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                        content: [
                                          '\n    Os montantes a serem captados por meio das operações financeiras de que trata o § 1º-H deverão observar os custos adicionais decorrentes da situação de escassez hídrica e dos diferimentos aplicados no processo tarifário anterior à liberação dos recursos da operação financeira, condicionada a captação à prévia aprovação pela Aneel.\n\n  ',
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
                                    href: 'art13_par1-10',
                                    id: 'art1_cpt_alt1_art13_par1-10',
                                    rotulo: '§ 1º-J.',
                                    p: [
                                      {
                                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                        content: [
                                          '\n    O encargo de que trata o inciso XVII do caput terá recolhimento específico nas faturas de energia elétrica até a amortização das operações financeiras.\n\n  ',
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
                                    href: 'art13_par1-11',
                                    id: 'art1_cpt_alt1_art13_par1-11',
                                    rotulo: '§ 1º-K.',
                                    p: [
                                      {
                                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                        content: [
                                          '\n    Os custos administrativos e financeiros e os encargos tributários incorridos nas operações financeiras previstas no § 1º-H serão integralmente custeados pelo encargo de que trata o inciso XVII do caput.\n\n  ',
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
                                    href: 'art13_par1-12',
                                    id: 'art1_cpt_alt1_art13_par1-12',
                                    rotulo: '§ 1º-L.',
                                    p: [
                                      {
                                        TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                        content: [
                                          '\n    Caso ocorra captação em valor superior aos custos referidos no § 1º-I, a distribuidora deverá ressarcir o consumidor proporcionalmente aos custos e aos encargos tributários relativos ao valor excedente, conforme apuração pela Aneel.\n\n  ',
                                        ],
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
                                    id: 'art1_cpt_alt1_art13_omi2',
                                    fechaAspas: 's',
                                    notaAlteracao: 'NR',
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
                          content: [
                            '\n    Os consumidores do ambiente de contratação regulada, de que trata a ',
                            {
                              name: {
                                namespaceURI: 'http://www.lexml.gov.br/1.0',
                                localPart: 'span',
                                prefix: '',
                                key: '{http://www.lexml.gov.br/1.0}span',
                                string: '{http://www.lexml.gov.br/1.0}span',
                              },
                              value: {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                href: 'urn:lex:br:federal:lei:2004-03-15;10848',
                                content: ['Lei nº 10.848, de 15 de março de 2004'],
                              },
                            },
                            ', que exercerem as opções previstas no ',
                            {
                              name: {
                                namespaceURI: 'http://www.lexml.gov.br/1.0',
                                localPart: 'span',
                                prefix: '',
                                key: '{http://www.lexml.gov.br/1.0}span',
                                string: '{http://www.lexml.gov.br/1.0}span',
                              },
                              value: {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                href: 'urn:lex:br:federal:lei:1996-12-26;9427!art26_par5',
                                content: ['§ 5º do art. 26 da Lei nº 9.427, de 26 de dezembro de 1996'],
                              },
                            },
                            ', e nos ',
                            {
                              name: {
                                namespaceURI: 'http://www.lexml.gov.br/1.0',
                                localPart: 'span',
                                prefix: '',
                                key: '{http://www.lexml.gov.br/1.0}span',
                                string: '{http://www.lexml.gov.br/1.0}span',
                              },
                              value: {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                href: 'urn:lex:br:federal:lei:1995-07-07;9074!art15',
                                content: ['art. 15'],
                              },
                            },
                            ' e ',
                            {
                              name: {
                                namespaceURI: 'http://www.lexml.gov.br/1.0',
                                localPart: 'span',
                                prefix: '',
                                key: '{http://www.lexml.gov.br/1.0}span',
                                string: '{http://www.lexml.gov.br/1.0}span',
                              },
                              value: {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                href: 'urn:lex:br:federal:lei:1995-07-07;9074!art16',
                                content: ['art. 16 da Lei nº 9.074, de 7 de julho de 1995'],
                              },
                            },
                            ', a partir da data de publicação desta Medida Provisória, deverão pagar, por meio de encargo tarifário cobrado na proporção do consumo de energia elétrica, os custos remanescentes das operações financeiras de que trata o ',
                            {
                              name: {
                                namespaceURI: 'http://www.lexml.gov.br/1.0',
                                localPart: 'span',
                                prefix: '',
                                key: '{http://www.lexml.gov.br/1.0}span',
                                string: '{http://www.lexml.gov.br/1.0}span',
                              },
                              value: {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                href: 'urn:lex:br:federal:lei:2002;10438!art13_cpt_inc17',
                                content: ['inciso XVII do caput do art. 13 da Lei nº 10.438, de 2002'],
                              },
                            },
                            '.\n\n  ',
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
                      id: 'art2_par1',
                      rotulo: '§ 1º',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: ['\n    O encargo de que trata o caput poderá ser movimentado pela Câmara de Comercialização de Energia Elétrica.\n\n  '],
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
                      id: 'art2_par2',
                      rotulo: '§ 2º',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: [
                            '\n    Os valores relativos à administração do encargo de que trata o caput, incluídos os custos administrativos e financeiros e os tributos, deverão ser repassados integralmente à Conta de Desenvolvimento Energético - CDE.\n\n  ',
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
                            '\n    O Comitê de Monitoramento do Setor Elétrico - CMSE, de que trata o ',
                            {
                              name: {
                                namespaceURI: 'http://www.lexml.gov.br/1.0',
                                localPart: 'span',
                                prefix: '',
                                key: '{http://www.lexml.gov.br/1.0}span',
                                string: '{http://www.lexml.gov.br/1.0}span',
                              },
                              value: {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                href: 'urn:lex:br:federal:lei:2004;10848!art14',
                                content: ['art. 14 da Lei nº 10.848, de 2004'],
                              },
                            },
                            ', fica autorizado a estabelecer bandeira tarifária extraordinária para a cobertura de custos excepcionais decorrentes de situação de escassez hídrica.\n\n  ',
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
                      id: 'art3_par1',
                      rotulo: '§ 1º',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: ['\n    O estabelecimento da bandeira tarifária extraordinária de que trata o caput será transitório e deverá ser justificado.\n\n  '],
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
                      id: 'art3_par2',
                      rotulo: '§ 2º',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: [
                            '\n    A bandeira tarifária extraordinária de que trata o caput será aplicada aos consumidores finais atendidos pelos agentes de distribuição mediante cobrança na fatura de energia elétrica.\n\n  ',
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
                      id: 'art3_par3',
                      rotulo: '§ 3º',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: [
                            '\n    A bandeira tarifária extraordinária de que trata o caput não se aplica aos consumidores inscritos na Tarifa Social de Energia Elétrica - TSEE, que permanecerão na sistemática das bandeiras tarifárias, conforme regulação da Agência Nacional de Energia Elétrica - Aneel.\n\n  ',
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
                          content: ['\n    Esta Medida Provisória entra em vigor na data de sua publicação.\n\n  '],
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
