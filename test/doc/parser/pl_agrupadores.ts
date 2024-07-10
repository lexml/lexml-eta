export const PLC_AGRUPADORES = {
  name: {
    namespaceURI: "http://www.lexml.gov.br/1.0",
    localPart: "LexML",
    prefix: "",
    key: "{http://www.lexml.gov.br/1.0}LexML",
    string: "{http://www.lexml.gov.br/1.0}LexML"
  },
  value: {
    TYPE_NAME: "br_gov_lexml__1.LexML",
    metadado: {
      TYPE_NAME: "br_gov_lexml__1.Metadado",
      identificacao: {
        TYPE_NAME: "br_gov_lexml__1.Identificacao",
        urn: "urn:lex:br:senado.federal:projeto.lei;pl:2024;999@data.evento;leitura;2024-07-10t12.42"
      }
    },
    projetoNorma: {
      TYPE_NAME: "br_gov_lexml__1.ProjetoNorma",
      norma: {
        TYPE_NAME: "br_gov_lexml__1.HierarchicalStructure",
        parteInicial: {
          TYPE_NAME: "br_gov_lexml__1.ParteInicial",
          epigrafe: {
            TYPE_NAME: "br_gov_lexml__1.GenInline",
            id: "epigrafe",
            content: [
              "PROJETO DE LEI Nº 999, DE 2024 "
            ]
          },
          ementa: {
            TYPE_NAME: "br_gov_lexml__1.GenInline",
            id: "ementa",
            content: [
              "Ementa."
            ]
          },
          preambulo: {
            TYPE_NAME: "br_gov_lexml__1.TextoType",
            id: "preambulo",
            p: [
              {
                TYPE_NAME: "br_gov_lexml__1.GenInline",
                content: [
                  "\n    O CONGRESSO NACIONAL decreta:"
                ]
              }
            ]
          }
        },
        articulacao: {
          TYPE_NAME: "br_gov_lexml__1.Articulacao",
          lXhier: [
            {
              name: {
                namespaceURI: "http://www.lexml.gov.br/1.0",
                localPart: "Titulo",
                prefix: "",
                key: "{http://www.lexml.gov.br/1.0}Titulo",
                string: "{http://www.lexml.gov.br/1.0}Titulo"
              },
              value: {
                TYPE_NAME: "br_gov_lexml__1.Hierarchy",
                id: "tit1",
                rotulo: "TÍTULO I",
                nomeAgrupador: {
                  TYPE_NAME: "br_gov_lexml__1.GenInline",
                  content: [
                    "\n    Tit 1\n"
                  ]
                },
                lXhier: [
                  {
                    name: {
                      namespaceURI: "http://www.lexml.gov.br/1.0",
                      localPart: "Capitulo",
                      prefix: "",
                      key: "{http://www.lexml.gov.br/1.0}Capitulo",
                      string: "{http://www.lexml.gov.br/1.0}Capitulo"
                    },
                    value: {
                      TYPE_NAME: "br_gov_lexml__1.Hierarchy",
                      id: "tit1_cap1",
                      rotulo: "CAPÍTULO I",
                      nomeAgrupador: {
                        TYPE_NAME: "br_gov_lexml__1.GenInline",
                        content: [
                          "\n    Cap 1\n"
                        ]
                      },
                      lXhier: [
                        {
                          name: {
                            namespaceURI: "http://www.lexml.gov.br/1.0",
                            localPart: "Artigo",
                            prefix: "",
                            key: "{http://www.lexml.gov.br/1.0}Artigo",
                            string: "{http://www.lexml.gov.br/1.0}Artigo"
                          },
                          value: {
                            TYPE_NAME: "br_gov_lexml__1.DispositivoType",
                            id: "art1",
                            rotulo: "Art. 1º",
                            lXcontainersOmissis: [
                              {
                                name: {
                                  namespaceURI: "http://www.lexml.gov.br/1.0",
                                  localPart: "Caput",
                                  prefix: "",
                                  key: "{http://www.lexml.gov.br/1.0}Caput",
                                  string: "{http://www.lexml.gov.br/1.0}Caput"
                                },
                                value: {
                                  TYPE_NAME: "br_gov_lexml__1.DispositivoType",
                                  id: "art1_cpt",
                                  p: [
                                    {
                                      TYPE_NAME: "br_gov_lexml__1.GenInline",
                                      content: [
                                        "\n    Nononono.\n"
                                      ]
                                    }
                                  ]
                                }
                              }
                            ]
                          }
                        },
                        {
                          name: {
                            namespaceURI: "http://www.lexml.gov.br/1.0",
                            localPart: "Secao",
                            prefix: "",
                            key: "{http://www.lexml.gov.br/1.0}Secao",
                            string: "{http://www.lexml.gov.br/1.0}Secao"
                          },
                          value: {
                            TYPE_NAME: "br_gov_lexml__1.Hierarchy",
                            id: "tit1_cap1_sec1",
                            rotulo: "Seção I",
                            nomeAgrupador: {
                              TYPE_NAME: "br_gov_lexml__1.GenInline",
                              content: [
                                "\n    Sec 1\n"
                              ]
                            },
                            lXhier: [
                              {
                                name: {
                                  namespaceURI: "http://www.lexml.gov.br/1.0",
                                  localPart: "Artigo",
                                  prefix: "",
                                  key: "{http://www.lexml.gov.br/1.0}Artigo",
                                  string: "{http://www.lexml.gov.br/1.0}Artigo"
                                },
                                value: {
                                  TYPE_NAME: "br_gov_lexml__1.DispositivoType",
                                  id: "art2",
                                  rotulo: "Art. 2º",
                                  lXcontainersOmissis: [
                                    {
                                      name: {
                                        namespaceURI: "http://www.lexml.gov.br/1.0",
                                        localPart: "Caput",
                                        prefix: "",
                                        key: "{http://www.lexml.gov.br/1.0}Caput",
                                        string: "{http://www.lexml.gov.br/1.0}Caput"
                                      },
                                      value: {
                                        TYPE_NAME: "br_gov_lexml__1.DispositivoType",
                                        id: "art2_cpt",
                                        p: [
                                          {
                                            TYPE_NAME: "br_gov_lexml__1.GenInline",
                                            content: [
                                              "\n    Nononono.\n"
                                            ]
                                          }
                                        ]
                                      }
                                    }
                                  ]
                                }
                              }
                            ]
                          }
                        },
                        {
                          name: {
                            namespaceURI: "http://www.lexml.gov.br/1.0",
                            localPart: "Secao",
                            prefix: "",
                            key: "{http://www.lexml.gov.br/1.0}Secao",
                            string: "{http://www.lexml.gov.br/1.0}Secao"
                          },
                          value: {
                            TYPE_NAME: "br_gov_lexml__1.Hierarchy",
                            id: "tit1_cap1_sec2",
                            rotulo: "Seção II",
                            nomeAgrupador: {
                              TYPE_NAME: "br_gov_lexml__1.GenInline",
                              content: [
                                "\n    Sec 2\n"
                              ]
                            },
                            lXhier: [
                              {
                                name: {
                                  namespaceURI: "http://www.lexml.gov.br/1.0",
                                  localPart: "Artigo",
                                  prefix: "",
                                  key: "{http://www.lexml.gov.br/1.0}Artigo",
                                  string: "{http://www.lexml.gov.br/1.0}Artigo"
                                },
                                value: {
                                  TYPE_NAME: "br_gov_lexml__1.DispositivoType",
                                  id: "art3",
                                  rotulo: "Art. 3º",
                                  lXcontainersOmissis: [
                                    {
                                      name: {
                                        namespaceURI: "http://www.lexml.gov.br/1.0",
                                        localPart: "Caput",
                                        prefix: "",
                                        key: "{http://www.lexml.gov.br/1.0}Caput",
                                        string: "{http://www.lexml.gov.br/1.0}Caput"
                                      },
                                      value: {
                                        TYPE_NAME: "br_gov_lexml__1.DispositivoType",
                                        id: "art3_cpt",
                                        p: [
                                          {
                                            TYPE_NAME: "br_gov_lexml__1.GenInline",
                                            content: [
                                              "\n    Nononono.\n"
                                            ]
                                          }
                                        ]
                                      }
                                    }
                                  ]
                                }
                              }
                            ]
                          }
                        }
                      ]
                    }
                  }
                ]
              }
            }
          ]
        }
      }
    }
  }
};
