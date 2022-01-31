export const TESTE_SIMPLES = {
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
        urn: 'urn:lex:br:federal:medida.provisoria:2019-11-11;905',
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
            content: ['EPIGRAFE'],
          },
          ementa: {
            TYPE_NAME: 'br_gov_lexml__1.GenInline',
            id: 'ementa',
            content: ['EMENTA'],
          },
          preambulo: {
            TYPE_NAME: 'br_gov_lexml__1.TextoType',
            id: 'preambulo',
            p: [
              {
                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                content: ['PREAMBULO'],
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
                            '\n Fica instituído o Contrato de Trabalho Verde e Amarelo, modalidade de contratação destinada à criação de novos postos de trabalho para as pessoas entre dezoito e vinte e nove anos de idade, para fins de registro do primeiro emprego em Carteira de Trabalho e Previdência Social.\n\n ',
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
                      id: 'art1_par1u',
                      rotulo: 'Parágrafo único.',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: ['\n Para fins da caracterização como primeiro emprego, não serão considerados os seguintes vínculos laborais:\n\n '],
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
                            id: 'art1_par1u_inc1',
                            rotulo: 'I –',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: ['\n menor aprendiz;\n\n '],
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
                            id: 'art1_par1u_inc2',
                            rotulo: 'II –',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: ['\n contrato de experiência;\n\n '],
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
                            id: 'art1_par1u_inc3',
                            rotulo: 'III –',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: ['\n trabalho intermitente; e\n\n '],
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
                            id: 'art1_par1u_inc4',
                            rotulo: 'IV –',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: ['\n trabalho avulso.\n\n '],
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
                            '\n A contratação de trabalhadores na modalidade Contrato de Trabalho Verde e Amarelo será realizada exclusivamente para novos postos de trabalho e terá como referência a média do total de empregados registrados na folha de pagamentos entre 1º de janeiro e 31 de outubro de 2019.\n\n ',
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
                          content: [
                            '\n A contratação total de trabalhadores na modalidade Contrato de Trabalho Verde e Amarelo fica limitada a vinte por cento do total de empregados da empresa, levando-se em consideração a folha de pagamentos do mês corrente de apuração.\n\n ',
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
                      id: 'art2_par2',
                      rotulo: '§ 2º',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: [
                            '\n As empresas com até dez empregados, inclusive aquelas constituídas após 1º de janeiro de 2020, ficam autorizadas a contratar dois empregados na modalidade Contrato de Trabalho Verde e Amarelo e, na hipótese de o quantitativo de dez empregados ser superado, será aplicado o disposto no § 1º.\n\n ',
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
                      id: 'art2_par3',
                      rotulo: '§ 3º',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: [
                            '\n Para verificação do quantitativo máximo de contratações de que trata o § 1º, deverá ser computado como unidade a fração igual ou superior a cinco décimos e desprezada a fração inferior a esse valor.\n\n ',
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
                      id: 'art2_par4',
                      rotulo: '§ 4º',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: [
                            '\n O trabalhador contratado por outras formas de contrato de trabalho, uma vez dispensado, não poderá ser recontratado pelo mesmo empregador, na modalidade Contrato de Trabalho Verde e Amarelo, pelo prazo de cento e oitenta dias, contado da data de dispensa, ressalvado o disposto no parágrafo único do art. 1º.\n\n ',
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
                      id: 'art2_par5',
                      rotulo: '§ 5º',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: [
                            '\n Fica assegurado às empresas que, em outubro de 2019, apurarem quantitativo de empregados inferior em, no mínimo, trinta por cento em relação ao total de empregados registrados em outubro de 2018, o direito de contratar na modalidade Contrato de Trabalho Verde e Amarelo, observado o limite previsto no § 1º e independentemente do disposto no caput.\n\n ',
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
                            '\n Poderão ser contratados na modalidade Contrato de Trabalho Verde e Amarelo, os trabalhadores com salário-base mensal de até um salário-mínimo e meio nacional.\n\n ',
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
                      id: 'art3_par1u',
                      rotulo: 'Parágrafo único.',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: [
                            '\n É garantida a manutenção do contrato na modalidade Contrato de Trabalho Verde e Amarelo quando houver aumento salarial, após doze meses de contratação, limitada a isenção das parcelas especificadas no art. 9º ao teto fixado no caput deste artigo.\n\n ',
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
                tituloDispositivo: {
                  TYPE_NAME: 'br_gov_lexml__1.GenInline',
                  content: ['Manutenção dos direitos dos empregados'],
                },
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
                            '\n Os direitos previstos na Constituição são garantidos aos trabalhadores contratados na modalidade Contrato de Trabalho Verde e Amarelo.\n\n ',
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
                      id: 'art4_par1u',
                      rotulo: 'Parágrafo único.',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: [
                            '\n Os trabalhadores a que se refere o caput gozarão dos direitos previstos no ',
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
                                href: 'urn:lex:br:federal:decreto.lei:1943-05-01;5452',
                                content: ['Decreto-Lei nº 5.452, de 1º de maio de 1943'],
                              },
                            },
                            ' - Consolidação das Leis do Trabalho, e nas convenções e nos acordos coletivos da categoria a que pertença naquilo que não for contrário ao disposto nesta Medida Provisória.\n\n ',
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
                tituloDispositivo: {
                  TYPE_NAME: 'br_gov_lexml__1.GenInline',
                  content: ['Prazo de contratação'],
                },
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
                          content: ['\n O Contrato de Trabalho Verde e Amarelo será celebrado por prazo determinado, por até vinte e quatro meses, a critério do empregador.\n\n '],
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
                      id: 'art5_par1',
                      rotulo: '§ 1º',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: [
                            '\n O Contrato de Trabalho Verde e Amarelo poderá ser utilizado para qualquer tipo de atividade, transitória ou permanente, e para substituição transitória de pessoal permanente.\n\n ',
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
                      id: 'art5_par2',
                      rotulo: '§ 2º',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: [
                            '\n O disposto no ',
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
                                href: 'urn:lex:br:federal:decreto.lei:1943-05-01;5452!art451',
                                content: ['art. 451 da Consolidação das Leis do Trabalho'],
                              },
                            },
                            ', aprovada pelo ',
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
                                href: 'urn:lex:br:federal:decreto.lei:1943;5452',
                                content: ['Decreto-Lei nº 5.452, de 1943'],
                              },
                            },
                            ', não se aplica ao Contrato de Trabalho Verde e Amarelo.\n\n ',
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
                      id: 'art5_par3',
                      rotulo: '§ 3º',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: [
                            '\n O Contrato de Trabalho Verde e Amarelo será convertido automaticamente em contrato por prazo indeterminado quando ultrapassado o prazo estipulado no caput, passando a incidir as regras do contrato por prazo indeterminado previsto no ',
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
                                href: 'urn:lex:br:federal:decreto.lei:1943;5452',
                                content: ['Decreto-Lei nº 5.452, de 1943'],
                              },
                            },
                            ' - Consolidação das Leis do Trabalho, a partir da data da conversão, e ficando afastadas as disposições previstas nesta Medida Provisória.\n\n ',
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
                tituloDispositivo: {
                  TYPE_NAME: 'br_gov_lexml__1.GenInline',
                  content: ['Pagamentos antecipados ao empregado'],
                },
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
                          content: [
                            '\n Ao final de cada mês, ou de outro período de trabalho, caso acordado entre as partes, desde que inferior a um mês, o empregado receberá o pagamento imediato das seguintes parcelas:\n\n ',
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
                            id: 'art6_cpt_inc1',
                            rotulo: 'I –',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: ['\n remuneração;\n\n '],
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
                            id: 'art6_cpt_inc2',
                            rotulo: 'II –',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: ['\n décimo terceiro salário proporcional; e\n\n '],
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
                            id: 'art6_cpt_inc3',
                            rotulo: 'III –',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: ['\n férias proporcionais com acréscimo de um terço.\n\n '],
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
                      id: 'art6_par1',
                      rotulo: '§ 1º',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: [
                            '\n A indenização sobre o saldo do Fundo de Garantia do Tempo de Serviço - FGTS, prevista no ',
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
                                href: 'urn:lex:br:federal:lei:1990-05-11;8036!art18',
                                content: ['art. 18 da Lei nº 8.036, de 11 de maio de 1990'],
                              },
                            },
                            ', poderá ser paga, por acordo entre empregado e empregador, de forma antecipada, mensalmente, ou em outro período de trabalho acordado entre as partes, desde que inferior a um mês, juntamente com as parcelas a que se refere o caput.\n\n ',
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
                      id: 'art6_par2',
                      rotulo: '§ 2º',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: [
                            '\n A indenização de que trata o §1º será paga sempre por metade, sendo o seu pagamento irrevogável, independentemente do motivo de demissão do empregado, mesmo que por justa causa, nos termos do disposto no ',
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
                                href: 'urn:lex:br:federal:decreto.lei:1943-05-01;5452!art482',
                                content: ['art. 482 da Consolidação das Leis do Trabalho'],
                              },
                            },
                            ', aprovada pelo ',
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
                                href: 'urn:lex:br:federal:decreto.lei:1943;5452',
                                content: ['Decreto-Lei nº 5.452, de 1943'],
                              },
                            },
                            '.\n\n ',
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
                            '\n No Contrato de Trabalho Verde e Amarelo, a alíquota mensal relativa à contribuição devida para o FGTS de que trata o ',
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
                                href: 'urn:lex:br:federal:lei:1990;8036!art15',
                                content: ['art. 15 da Lei nº 8.036, de 1990'],
                              },
                            },
                            ', será de dois por cento, independentemente do valor da remuneração.\n\n ',
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
                id: 'art8',
                tituloDispositivo: {
                  TYPE_NAME: 'br_gov_lexml__1.GenInline',
                  content: ['Jornada de trabalho'],
                },
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
                            '\n A duração da jornada diária de trabalho no âmbito do Contrato de Trabalho Verde e Amarelo poderá ser acrescida de horas extras, em número não excedente de duas, desde que estabelecido por acordo individual, convenção coletiva ou acordo coletivo de trabalho.\n\n ',
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
                      id: 'art8_par1',
                      rotulo: '§ 1º',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: ['\n A remuneração da hora extra será, no mínimo, cinquenta por cento superior à remuneração da hora normal.\n\n '],
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
                      id: 'art8_par2',
                      rotulo: '§ 2º',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: [
                            '\n É permitida a adoção de regime de compensação de jornada por meio de acordo individual, tácito ou escrito, para a compensação no mesmo mês.\n\n ',
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
                      id: 'art8_par3',
                      rotulo: '§ 3º',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: ['\n O banco de horas poderá ser pactuado por acordo individual escrito, desde que a compensação ocorra no período máximo de seis meses.\n\n '],
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
                      id: 'art8_par4',
                      rotulo: '§ 4º',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: [
                            '\n Na hipótese de rescisão do Contrato de Trabalho Verde e Amarelo sem que tenha havido a compensação integral da jornada extraordinária, o trabalhador terá direito ao pagamento das horas extras não compensadas, calculadas sobre o valor da remuneração a que faça jus na data da rescisão.\n\n ',
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
                id: 'art9',
                tituloDispositivo: {
                  TYPE_NAME: 'br_gov_lexml__1.GenInline',
                  content: ['Benefícios econômicos e de capacitação instituídos pelo Contrato de Trabalho Verdade e Amarelo'],
                },
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
                            '\n Ficam as empresas isentas das seguintes parcelas incidentes sobre a folha de pagamentos dos contratados na modalidade Contrato de Trabalho Verde e Amarelo:\n\n ',
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
                            id: 'art9_cpt_inc1',
                            rotulo: 'I –',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  '\n contribuição previdenciária prevista no ',
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
                                      href: 'urn:lex:br:federal:lei:1991-07-24;8212!art22_cpt_inc1',
                                      content: ['inciso I do caput do art. 22 da Lei nº 8.212, de 24 de julho de 1991'],
                                    },
                                  },
                                  ';\n\n ',
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
                            id: 'art9_cpt_inc2',
                            rotulo: 'II –',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  '\n salário-educação previsto no ',
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
                                      href: 'urn:lex:br:federal:decreto:1982-03-22;87043!art3_cpt_inc1',
                                      content: ['inciso I do caput do art. 3º do Decreto nº 87.043, de 22 de março de 1982'],
                                    },
                                  },
                                  '; e\n\n ',
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
                            id: 'art9_cpt_inc3',
                            rotulo: 'III –',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: ['\n contribuição social destinada ao:\n\n '],
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
                                  id: 'art9_cpt_inc3_ali1',
                                  rotulo: 'a)',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: [
                                        '\n Serviço Social da Indústria - Sesi, de que trata o ',
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
                                            href: 'urn:lex:br:federal:decreto.lei:1946-06-25;9403!art3',
                                            content: ['art. 3º do Decreto-Lei nº 9.403, de 25 de junho de 1946'],
                                          },
                                        },
                                        ';\n\n ',
                                      ],
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
                                  id: 'art9_cpt_inc3_ali2',
                                  rotulo: 'b)',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: [
                                        '\n Serviço Social do Comércio - Sesc, de que trata o ',
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
                                            href: 'urn:lex:br:federal:decreto.lei:1946-09-13;9853!art3',
                                            content: ['art. 3º do Decreto-Lei nº 9.853, de 13 de setembro de 1946'],
                                          },
                                        },
                                        ';\n\n ',
                                      ],
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
                                  id: 'art9_cpt_inc3_ali3',
                                  rotulo: 'c)',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: [
                                        '\n Serviço Social do Transporte - Sest, de que trata o ',
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
                                            href: 'urn:lex:br:federal:lei:1993-09-14;8706!art7',
                                            content: ['art. 7º da Lei nº 8.706, de 14 de setembro de 1993'],
                                          },
                                        },
                                        ';\n\n ',
                                      ],
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
                                  id: 'art9_cpt_inc3_ali4',
                                  rotulo: 'd)',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: [
                                        '\n Serviço Nacional de Aprendizagem Industrial - Senai, de que trata o ',
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
                                            href: 'urn:lex:br:federal:decreto.lei:1942-01-22;4048!art4',
                                            content: ['art. 4º do Decreto-Lei nº 4.048, de 22 de janeiro de 1942'],
                                          },
                                        },
                                        ';\n\n ',
                                      ],
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
                                  id: 'art9_cpt_inc3_ali5',
                                  rotulo: 'e)',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: [
                                        '\n Serviço Nacional de Aprendizagem Comercial - Senac, de que trata o ',
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
                                            href: 'urn:lex:br:federal:decreto.lei:1946-01-10;8621!art4',
                                            content: ['art. 4º do Decreto-Lei nº 8.621, de 10 de janeiro de 1946'],
                                          },
                                        },
                                        ';\n\n ',
                                      ],
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
                                  id: 'art9_cpt_inc3_ali6',
                                  rotulo: 'f)',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: [
                                        '\n Serviço Nacional de Aprendizagem do Transporte - Senat, de que trata o ',
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
                                            href: 'urn:lex:br:federal:lei:1993;8706!art7',
                                            content: ['art. 7º da Lei nº 8.706, de 1993'],
                                          },
                                        },
                                        ';\n\n ',
                                      ],
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
                                  id: 'art9_cpt_inc3_ali7',
                                  rotulo: 'g)',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: [
                                        '\n Serviço Brasileiro de Apoio às Micro e Pequenas Empresas - Sebrae, de que trata o ',
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
                                            href: 'urn:lex:br:federal:lei:1990-04-12;8029!art8_par3',
                                            content: ['§ 3º do art. 8º da Lei nº 8.029, de 12 de abril de 1990'],
                                          },
                                        },
                                        ';\n\n ',
                                      ],
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
                                  id: 'art9_cpt_inc3_ali8',
                                  rotulo: 'h)',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: [
                                        '\n Instituto Nacional de Colonização e Reforma Agrária - Incra, de que trata o ',
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
                                            href: 'urn:lex:br:federal:decreto.lei:1970-12-31;1146!art1',
                                            content: ['art. 1º do Decreto-Lei nº 1.146, de 31 de dezembro de 1970'],
                                          },
                                        },
                                        ';\n\n ',
                                      ],
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
                                  id: 'art9_cpt_inc3_ali9',
                                  rotulo: 'i)',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: [
                                        '\n Serviço Nacional de Aprendizagem Rural - Senar, de que trata o ',
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
                                            href: 'urn:lex:br:federal:lei:1991-12-23;8315!art3',
                                            content: ['art. 3º da Lei nº 8.315, de 23 de dezembro de 1991'],
                                          },
                                        },
                                        '; e\n\n ',
                                      ],
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
                                  id: 'art9_cpt_inc3_ali10',
                                  rotulo: 'j)',
                                  p: [
                                    {
                                      TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                      content: [
                                        '\n Serviço Nacional de Aprendizagem do Cooperativismo - Sescoop, de que trata o ',
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
                                            href: 'urn:lex:br:federal:medida.provisoria:2001-08-24;2168-40!art10',
                                            content: ['art. 10 da Medida Provisória nº 2.168-40, de 24 de agosto de 2001'],
                                          },
                                        },
                                        '.\n\n ',
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
                id: 'art10',
                tituloDispositivo: {
                  TYPE_NAME: 'br_gov_lexml__1.GenInline',
                  content: ['Rescisão contratual'],
                },
                rotulo: 'Art. 10.',
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
                      id: 'art10_cpt',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: [
                            '\n Na hipótese de extinção do Contrato de Trabalho Verde e Amarelo, serão devidos os seguintes haveres rescisórios, calculados com base na média mensal dos valores recebidos pelo empregado no curso do respectivo contrato de trabalho:\n\n ',
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
                            id: 'art10_cpt_inc1',
                            rotulo: 'I –',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: [
                                  '\n a indenização sobre o saldo do FGTS, prevista no ',
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
                                      href: 'urn:lex:br:federal:lei:1990;8036!art18_par1',
                                      content: ['§ 1º do art. 18 da Lei nº 8.036, de 1990'],
                                    },
                                  },
                                  ', caso não tenha sido acordada a sua antecipação, nos termos do disposto nos § 1º e § 2ºdo art. 6º; e\n\n ',
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
                            id: 'art10_cpt_inc2',
                            rotulo: 'II –',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: ['\n as demais verbas trabalhistas que lhe forem devidas.\n\n '],
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
                id: 'art11',
                rotulo: 'Art. 11.',
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
                      id: 'art11_cpt',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: [
                            '\n Não se aplica ao Contrato de Trabalho Verde e Amarelo a indenização prevista no ',
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
                                href: 'urn:lex:br:federal:decreto.lei:1943-05-01;5452!art479',
                                content: ['art. 479 da Consolidação das Leis do Trabalho'],
                              },
                            },
                            ', aprovada pelo ',
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
                                href: 'urn:lex:br:federal:decreto.lei:1943;5452',
                                content: ['Decreto-Lei nº 5.452, de 1943'],
                              },
                            },
                            ', hipótese em que se aplica a cláusula assecuratória do direito recíproco de rescisão prevista no art. 481 da referida Consolidação.\n\n ',
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
                id: 'art12',
                rotulo: 'Art. 12.',
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
                      id: 'art12_cpt',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: [
                            '\n Os contratados na modalidade de Contrato de Trabalho Verde e Amarelo poderão ingressar no Programa Seguro-Desemprego, desde que preenchidos os requisitos legais e respeitadas as condicionantes previstas no ',
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
                                href: 'urn:lex:br:federal:lei:1990-01-11;7998!art3',
                                content: ['art. 3º da Lei nº 7.998, de 11 de janeiro de 1990'],
                              },
                            },
                            '.\n\n ',
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
                id: 'art13',
                tituloDispositivo: {
                  TYPE_NAME: 'br_gov_lexml__1.GenInline',
                  content: ['Prioridade em ações de qualificação profissional'],
                },
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
                      id: 'art13_cpt',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: [
                            '\n Os trabalhadores contratados na modalidade Contrato de Trabalho Verde e Amarelo receberão prioritariamente ações de qualificação profissional, conforme disposto em ato do Ministério da Economia.\n\n ',
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
                id: 'art14',
                tituloDispositivo: {
                  TYPE_NAME: 'br_gov_lexml__1.GenInline',
                  content: ['Quitação de obrigações para reduzir litígios'],
                },
                rotulo: 'Art. 14.',
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
                      id: 'art14_cpt',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: [
                            '\n Para fins do disposto nesta Medida Provisória, é facultado ao empregador comprovar, perante a Justiça do Trabalho, acordo extrajudicial de reconhecimento de cumprimento das suas obrigações trabalhistas para com o trabalhador, nos termos do disposto no ',
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
                                href: 'urn:lex:br:federal:decreto.lei:1943-05-01;5452!art855-2',
                                content: ['art. 855-B da Consolidação das Leis do Trabalho'],
                              },
                            },
                            ', aprovada pelo ',
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
                                href: 'urn:lex:br:federal:decreto.lei:1943;5452',
                                content: ['Decreto-Lei nº 5.452, de 1943'],
                              },
                            },
                            '.\n\n ',
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
                id: 'art15',
                tituloDispositivo: {
                  TYPE_NAME: 'br_gov_lexml__1.GenInline',
                  content: ['Seguro por exposição a perigo previsto em lei'],
                },
                rotulo: 'Art. 15.',
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
                      id: 'art15_cpt',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: [
                            '\n O empregador poderá contratar, nos termos do disposto em ato do Poder Executivo federal, e mediante acordo individual escrito com o trabalhador, seguro privado de acidentes pessoais para empregados que vierem a sofrer o infortúnio, no exercício de suas atividades, em face da exposição ao perigo previsto em lei.\n\n ',
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
                      id: 'art15_par1',
                      rotulo: '§ 1º',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: ['\n O seguro a que se refere o caput terá cobertura para as seguintes hipóteses:\n\n '],
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
                            id: 'art15_par1_inc1',
                            rotulo: 'I –',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: ['\n morte acidental;\n\n '],
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
                            id: 'art15_par1_inc2',
                            rotulo: 'II –',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: ['\n danos corporais;\n\n '],
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
                            id: 'art15_par1_inc3',
                            rotulo: 'III –',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: ['\n danos estéticos; e\n\n '],
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
                            id: 'art15_par1_inc4',
                            rotulo: 'IV –',
                            p: [
                              {
                                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                                content: ['\n danos morais.\n\n '],
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
                      id: 'art15_par2',
                      rotulo: '§ 2º',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: ['\n A contratação de que trata o caput não excluirá a indenização a que o empregador está obrigado quando incorrer em dolo ou culpa.\n\n '],
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
                      id: 'art15_par3',
                      rotulo: '§ 3º',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: [
                            '\n Caso o empregador opte pela contratação do seguro de que trata o caput, permanecerá obrigado ao pagamento de adicional de periculosidade de cinco por cento sobre o salário-base do trabalhador.\n\n ',
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
                      id: 'art15_par4',
                      rotulo: '§ 4º',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: [
                            '\n O adicional de periculosidade somente será devido quando houver exposição permanente do trabalhador, caracterizada pelo efetivo trabalho em condição de periculosidade por, no mínimo, cinquenta por cento de sua jornada normal de trabalho.\n\n ',
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
                id: 'art16',
                tituloDispositivo: {
                  TYPE_NAME: 'br_gov_lexml__1.GenInline',
                  content: ['Prazo para contratação pela modalidade de Contrato de Trabalho Verde e Amarelo'],
                },
                rotulo: 'Art. 16.',
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
                      id: 'art16_cpt',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: [
                            '\n Fica permitida a contratação de trabalhadores pela modalidade de Contrato de Trabalho Verde e Amarelo no período de 1º de janeiro de 2020 a 31 de dezembro de 2022.\n\n ',
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
                      id: 'art16_par1',
                      rotulo: '§ 1º',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: [
                            '\n Fica assegurado o prazo de contratação de até vinte e quatro meses, nos termos do disposto no art. 5º, ainda que o termo final do contrato seja posterior a 31 de dezembro de 2022.\n\n ',
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
                      id: 'art16_par2',
                      rotulo: '§ 2º',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: [
                            '\n Havendo infração aos limites estabelecidos no art. 2º, o contrato de trabalho na modalidade Contrato de Trabalho Verde e Amarelo será transformado automaticamente em contrato de trabalho por prazo indeterminado.\n\n ',
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
                      id: 'art16_par3',
                      rotulo: '§ 3º',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: [
                            '\n As infrações ao disposto neste Capítulo serão punidas com a multa prevista no ',
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
                                href: 'urn:lex:br:federal:decreto.lei:1943-05-01;5452!art634-1_cpt_inc2',
                                content: ['inciso II do caput do art. 634-A da Consolidação das Leis do Trabalho'],
                              },
                            },
                            ', aprovada pelo ',
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
                                href: 'urn:lex:br:federal:decreto.lei:1943;5452',
                                content: ['Decreto-Lei nº 5.452, de 1943'],
                              },
                            },
                            '.\n\n ',
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
                id: 'art17',
                rotulo: 'Art. 17.',
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
                      id: 'art17_cpt',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: ['\n É vedada a contratação, sob a modalidade de que trata esta Medida Provisória, de trabalhadores submetidos a legislação especial.\n\n '],
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
                id: 'art18',
                rotulo: 'Art. 18.',
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
                      id: 'art18_cpt',
                      p: [
                        {
                          TYPE_NAME: 'br_gov_lexml__1.GenInline',
                          content: [
                            '\n Compete ao Ministério da Economia coordenar, executar, monitorar, avaliar e editar normas complementares relativas ao Contrato de Trabalho Verde e Amarelo.\n\n ',
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
    },
  },
};
