export const EXEMPLO_CC = {
  Articulacao: {
    Parte: [
      {
        '@id': 'prt1',
        Rotulo: 'PARTE I',
        NomeAgrupador: 'DA PARTE GERAL',
        Livro: [
          {
            '@id': 'prt1_liv1',
            Rotulo: 'LIVRO I',
            NomeAgrupador: 'DAS PESSOAS',
            Titulo: [
              {
                '@id': 'prt1_liv1_tit1',
                Rotulo: 'TÍTULO I',
                NomeAgrupador: 'DAS PESSOAS NATURAIS',
                Capitulo: [
                  {
                    '@id': 'prt1_liv1_tit1_cap1',
                    Rotulo: 'CAPÍTULO I',
                    NomeAgrupador: 'DA PERSONALIDADE E DA CAPACIDADE',
                    Artigo: [
                      {
                        '@id': 'art1',
                        Rotulo: 'Art. 1º',
                        Caput: {
                          '@id': 'art1_cpt',
                          p: 'Toda pessoa é capaz de direitos e deveres na ordem civil.',
                        },
                      },
                      {
                        '@id': 'art2',
                        Rotulo: 'Art. 2º',
                        Caput: {
                          '@id': 'art2_cpt',
                          p: 'A personalidade civil da pessoa começa do nascimento com vida; mas a lei põe a salvo, desde a concepção, os direitos do nascituro.',
                        },
                      },
                      {
                        '@id': 'art3',
                        Rotulo: 'Art. 3º',
                        Caput: {
                          '@id': 'art3_cpt',
                          p: 'São absolutamente incapazes de exercer pessoalmente os atos da vida civil:',
                          Inciso: [
                            {
                              '@id': 'art3_cpt_inc1',
                              Rotulo: 'I –',
                              p: 'os menores de dezesseis anos;',
                            },
                            {
                              '@id': 'art3_cpt_inc2',
                              Rotulo: 'II –',
                              p: 'os que, por enfermidade ou deficiência mental, não tiverem o necessário discernimento para a prática desses atos;',
                            },
                            {
                              '@id': 'art3_cpt_inc3',
                              Rotulo: 'III –',
                              p: 'os que, mesmo por causa transitória, não puderem exprimir sua vontade.',
                            },
                          ],
                        },
                      },
                      {
                        '@id': 'art4',
                        Rotulo: 'Art. 4º',
                        Caput: {
                          '@id': 'art4_cpt',
                          p: 'São incapazes, relativamente a certos atos, ou à maneira de os exercer:',
                          Inciso: [
                            {
                              '@id': 'art4_cpt_inc1',
                              Rotulo: 'I –',
                              p: 'os maiores de dezesseis e menores de dezoito anos;',
                            },
                            {
                              '@id': 'art4_cpt_inc2',
                              Rotulo: 'II –',
                              p: 'os ébrios habituais, os viciados em tóxicos, e os que, por deficiência mental, tenham o discernimento reduzido;',
                            },
                            {
                              '@id': 'art4_cpt_inc3',
                              Rotulo: 'III –',
                              p: 'os excepcionais, sem desenvolvimento mental completo;',
                            },
                            {
                              '@id': 'art4_cpt_inc4',
                              Rotulo: 'IV –',
                              p: 'os pródigos.',
                            },
                          ],
                        },
                        Paragrafo: {
                          '@id': 'art4_par1u',
                          Rotulo: 'Parágrafo único.',
                          p: 'A capacidade dos índios será regulada por legislação especial.',
                        },
                      },
                      {
                        '@id': 'art5',
                        Rotulo: 'Art. 5º',
                        Caput: {
                          '@id': 'art5_cpt',
                          p: 'A menoridade cessa aos dezoito anos completos, quando a pessoa fica habilitada à prática de todos os atos da vida civil.',
                        },
                        Paragrafo: {
                          '@id': 'art5_par1u',
                          Rotulo: 'Parágrafo único.',
                          p: 'Cessará, para os menores, a incapacidade:',
                          Inciso: [
                            {
                              '@id': 'art5_par1u_inc1',
                              Rotulo: 'I –',
                              p:
                                'pela concessão dos pais, ou de um deles na falta do outro, mediante instrumento público, independentemente de homologação judicial, ou por sentença do juiz, ouvido o tutor, se o menor tiver dezesseis anos completos;',
                            },
                            {
                              '@id': 'art5_par1u_inc2',
                              Rotulo: 'II –',
                              p: 'pelo casamento;',
                            },
                            {
                              '@id': 'art5_par1u_inc3',
                              Rotulo: 'III –',
                              p: 'pelo exercício de emprego público efetivo;',
                            },
                            {
                              '@id': 'art5_par1u_inc4',
                              Rotulo: 'IV –',
                              p: 'pela colação de grau em curso de ensino superior;',
                            },
                            {
                              '@id': 'art5_par1u_inc5',
                              Rotulo: 'V –',
                              p:
                                'pelo estabelecimento civil ou comercial, ou pela existência de relação de emprego, desde que, em função deles, o menor com dezesseis anos completos tenha economia própria.',
                            },
                          ],
                        },
                      },
                      {
                        '@id': 'art6',
                        Rotulo: 'Art. 6º',
                        Caput: {
                          '@id': 'art6_cpt',
                          p:
                            'A existência da pessoa natural termina com a morte; presume-se esta, quanto aos ausentes, nos casos em que a lei autoriza a abertura de sucessão definitiva.',
                        },
                      },
                      {
                        '@id': 'art7',
                        Rotulo: 'Art. 7º',
                        Caput: {
                          '@id': 'art7_cpt',
                          p: 'Pode ser declarada a morte presumida, sem decretação de ausência:',
                          Inciso: [
                            {
                              '@id': 'art7_cpt_inc1',
                              Rotulo: 'I –',
                              p: 'se for extremamente provável a morte de quem estava em perigo de vida;',
                            },
                            {
                              '@id': 'art7_cpt_inc2',
                              Rotulo: 'II –',
                              p: 'se alguém, desaparecido em campanha ou feito prisioneiro, não for encontrado até dois anos após o término da guerra.',
                            },
                          ],
                        },
                        Paragrafo: {
                          '@id': 'art7_par1u',
                          Rotulo: 'Parágrafo único.',
                          p:
                            'A declaração da morte presumida, nesses casos, somente poderá ser requerida depois de esgotadas as buscas e averiguações, devendo a sentença fixar a data provável do falecimento.',
                        },
                      },
                      {
                        '@id': 'art8',
                        Rotulo: 'Art. 8º',
                        Caput: {
                          '@id': 'art8_cpt',
                          p:
                            'Se dois ou mais indivíduos falecerem na mesma ocasião, não se podendo averiguar se algum dos comorientes precedeu aos outros, presumir-se-ão simultaneamente mortos.',
                        },
                      },
                      {
                        '@id': 'art9',
                        Rotulo: 'Art. 9º',
                        Caput: {
                          '@id': 'art9_cpt',
                          p: 'Serão registrados em registro público:',
                          Inciso: [
                            {
                              '@id': 'art9_cpt_inc1',
                              Rotulo: 'I –',
                              p: 'os nascimentos, casamentos e óbitos;',
                            },
                            {
                              '@id': 'art9_cpt_inc2',
                              Rotulo: 'II –',
                              p: 'a emancipação por outorga dos pais ou por sentença do juiz;',
                            },
                            {
                              '@id': 'art9_cpt_inc3',
                              Rotulo: 'III –',
                              p: 'a interdição por incapacidade absoluta ou relativa;',
                            },
                            {
                              '@id': 'art9_cpt_inc4',
                              Rotulo: 'IV –',
                              p: 'a sentença declaratória de ausência e de morte presumida.',
                            },
                          ],
                        },
                      },
                      {
                        '@id': 'art10',
                        Rotulo: 'Art. 10.',
                        Caput: {
                          '@id': 'art10_cpt',
                          p: 'Far-se-á averbação em registro público:',
                          Inciso: [
                            {
                              '@id': 'art10_cpt_inc1',
                              Rotulo: 'I –',
                              p: 'das sentenças que decretarem a nulidade ou anulação do casamento, o divórcio, a separação judicial e o restabelecimento da sociedade conjugal;',
                            },
                            {
                              '@id': 'art10_cpt_inc2',
                              Rotulo: 'II –',
                              p: 'dos atos judiciais ou extrajudiciais que declararem ou reconhecerem a filiação;',
                            },
                            {
                              '@id': 'art10_cpt_inc3',
                              Rotulo: 'III –',
                              p: 'dos atos judiciais ou extrajudiciais de adoção.',
                            },
                          ],
                        },
                      },
                    ],
                  },
                  {
                    '@id': 'prt1_liv1_tit1_cap2',
                    Rotulo: 'CAPÍTULO II',
                    NomeAgrupador: 'DOS DIREITOS DA PERSONALIDADE',
                    Artigo: [
                      {
                        '@id': 'art11',
                        Rotulo: 'Art. 11.',
                        Caput: {
                          '@id': 'art11_cpt',
                          p:
                            'Com exceção dos casos previstos em lei, os direitos da personalidade são intransmissíveis e irrenunciáveis, não podendo o seu exercício sofrer limitação voluntária.',
                        },
                      },
                      {
                        '@id': 'art12',
                        Rotulo: 'Art. 12.',
                        Caput: {
                          '@id': 'art12_cpt',
                          p:
                            'Pode-se exigir que cesse a ameaça, ou a lesão, a direito da personalidade, e reclamar perdas e danos, sem prejuízo de outras sanções previstas em lei.',
                        },
                        Paragrafo: {
                          '@id': 'art12_par1u',
                          Rotulo: 'Parágrafo único.',
                          p:
                            'Em se tratando de morto, terá legitimação para requerer a medida prevista neste artigo o cônjuge sobrevivente, ou qualquer parente em linha reta, ou colateral até o quarto grau.',
                        },
                      },
                      {
                        '@id': 'art13',
                        Rotulo: 'Art. 13.',
                        Caput: {
                          '@id': 'art13_cpt',
                          p:
                            'Salvo por exigência médica, é defeso o ato de disposição do próprio corpo, quando importar diminuição permanente da integridade física, ou contrariar os bons costumes.',
                        },
                        Paragrafo: {
                          '@id': 'art13_par1u',
                          Rotulo: 'Parágrafo único.',
                          p: 'O ato previsto neste artigo será admitido para fins de transplante, na forma estabelecida em lei especial.',
                        },
                      },
                      {
                        '@id': 'art14',
                        Rotulo: 'Art. 14.',
                        Caput: {
                          '@id': 'art14_cpt',
                          p: 'É válida, com objetivo científico, ou altruístico, a disposição gratuita do próprio corpo, no todo ou em parte, para depois da morte.',
                        },
                        Paragrafo: {
                          '@id': 'art14_par1u',
                          Rotulo: 'Parágrafo único.',
                          p: 'O ato de disposição pode ser livremente revogado a qualquer tempo.',
                        },
                      },
                      {
                        '@id': 'art15',
                        Rotulo: 'Art. 15.',
                        Caput: {
                          '@id': 'art15_cpt',
                          p: 'Ninguém pode ser constrangido a submeter-se, com risco de vida, a tratamento médico ou a intervenção cirúrgica.',
                        },
                      },
                      {
                        '@id': 'art16',
                        Rotulo: 'Art. 16.',
                        Caput: {
                          '@id': 'art16_cpt',
                          p: 'Toda pessoa tem direito ao nome, nele compreendidos o prenome e o sobrenome.',
                        },
                      },
                      {
                        '@id': 'art17',
                        Rotulo: 'Art. 17.',
                        Caput: {
                          '@id': 'art17_cpt',
                          p:
                            'O nome da pessoa não pode ser empregado por outrem em publicações ou representações que a exponham ao desprezo público, ainda quando não haja intenção difamatória.',
                        },
                      },
                      {
                        '@id': 'art18',
                        Rotulo: 'Art. 18.',
                        Caput: {
                          '@id': 'art18_cpt',
                          p: 'Sem autorização, não se pode usar o nome alheio em propaganda comercial.',
                        },
                      },
                      {
                        '@id': 'art19',
                        Rotulo: 'Art. 19.',
                        Caput: {
                          '@id': 'art19_cpt',
                          p: 'O pseudônimo adotado para atividades lícitas goza da proteção que se dá ao nome.',
                        },
                      },
                      {
                        '@id': 'art20',
                        Rotulo: 'Art. 20.',
                        Caput: {
                          '@id': 'art20_cpt',
                          p:
                            'Salvo se autorizadas, ou se necessárias à administração da justiça ou à manutenção da ordem pública, a divulgação de escritos, a transmissão da palavra, ou a publicação, a exposição ou a utilização da imagem de uma pessoa poderão ser proibidas, a seu requerimento e sem prejuízo da indenização que couber, se lhe atingirem a honra, a boa fama ou a respeitabilidade, ou se se destinarem a fins comerciais.',
                        },
                        Paragrafo: {
                          '@id': 'art20_par1u',
                          Rotulo: 'Parágrafo único.',
                          p: 'Em se tratando de morto ou de ausente, são partes legítimas para requerer essa proteção o cônjuge, os ascendentes ou os descendentes.',
                        },
                      },
                      {
                        '@id': 'art21',
                        Rotulo: 'Art. 21.',
                        Caput: {
                          '@id': 'art21_cpt',
                          p:
                            'A vida privada da pessoa natural é inviolável, e o juiz, a requerimento do interessado, adotará as providências necessárias para impedir ou fazer cessar ato contrário a esta norma.',
                        },
                      },
                    ],
                  },
                  {
                    '@id': 'prt1_liv1_tit1_cap3',
                    Rotulo: 'CAPÍTULO III',
                    NomeAgrupador: 'DA AUSÊNCIA',
                    Secao: [
                      {
                        '@id': 'prt1_liv1_tit1_cap3_sec1',
                        Rotulo: 'Seção I',
                        NomeAgrupador: 'Da Curadoria dos Bens do Ausente',
                        Artigo: [
                          {
                            '@id': 'art22',
                            Rotulo: 'Art. 22.',
                            Caput: {
                              '@id': 'art22_cpt',
                              p:
                                'Desaparecendo uma pessoa do seu domicílio sem dela haver notícia, se não houver deixado representante ou procurador a quem caiba administrar-lhe os bens, o juiz, a requerimento de qualquer interessado ou do Ministério Público, declarará a ausência, e nomear-lhe-á curador.',
                            },
                          },
                          {
                            '@id': 'art23',
                            Rotulo: 'Art. 23.',
                            Caput: {
                              '@id': 'art23_cpt',
                              p:
                                'Também se declarará a ausência, e se nomeará curador, quando o ausente deixar mandatário que não queira ou não possa exercer ou continuar o mandato, ou se os seus poderes forem insuficientes.',
                            },
                          },
                          {
                            '@id': 'art24',
                            Rotulo: 'Art. 24.',
                            Caput: {
                              '@id': 'art24_cpt',
                              p:
                                'O juiz, que nomear o curador, fixar-lhe-á os poderes e obrigações, conforme as circunstâncias, observando, no que for aplicável, o disposto a respeito dos tutores e curadores.',
                            },
                          },
                          {
                            '@id': 'art25',
                            Rotulo: 'Art. 25.',
                            Caput: {
                              '@id': 'art25_cpt',
                              p:
                                'O cônjuge do ausente, sempre que não esteja separado judicialmente, ou de fato por mais de dois anos antes da declaração da ausência, será o seu legítimo curador.',
                            },
                            Paragrafo: [
                              {
                                '@id': 'art25_par1',
                                Rotulo: '§ 1º',
                                p:
                                  'Em falta do cônjuge, a curadoria dos bens do ausente incumbe aos pais ou aos descendentes, nesta ordem, não havendo impedimento que os iniba de exercer o cargo.',
                              },
                              {
                                '@id': 'art25_par2',
                                Rotulo: '§ 2º',
                                p: 'Entre os descendentes, os mais próximos precedem os mais remotos.',
                              },
                              {
                                '@id': 'art25_par3',
                                Rotulo: '§ 3º',
                                p: 'Na falta das pessoas mencionadas, compete ao juiz a escolha do curador.',
                              },
                            ],
                          },
                        ],
                      },
                      {
                        '@id': 'prt1_liv1_tit1_cap3_sec2',
                        Rotulo: 'Seção II',
                        NomeAgrupador: 'Da Sucessão Provisória',
                        Artigo: [
                          {
                            '@id': 'art26',
                            Rotulo: 'Art. 26.',
                            Caput: {
                              '@id': 'art26_cpt',
                              p:
                                'Decorrido um ano da arrecadação dos bens do ausente, ou, se ele deixou representante ou procurador, em se passando três anos, poderão os interessados requerer que se declare a ausência e se abra provisoriamente a sucessão.',
                            },
                          },
                          {
                            '@id': 'art27',
                            Rotulo: 'Art. 27.',
                            Caput: {
                              '@id': 'art27_cpt',
                              p: 'Para o efeito previsto no artigo anterior, somente se consideram interessados:',
                              Inciso: [
                                {
                                  '@id': 'art27_cpt_inc1',
                                  Rotulo: 'I –',
                                  p: 'o cônjuge não separado judicialmente;',
                                },
                                {
                                  '@id': 'art27_cpt_inc2',
                                  Rotulo: 'II –',
                                  p: 'os herdeiros presumidos, legítimos ou testamentários;',
                                },
                                {
                                  '@id': 'art27_cpt_inc3',
                                  Rotulo: 'III –',
                                  p: 'os que tiverem sobre os bens do ausente direito dependente de sua morte;',
                                },
                                {
                                  '@id': 'art27_cpt_inc4',
                                  Rotulo: 'IV –',
                                  p: 'os credores de obrigações vencidas e não pagas.',
                                },
                              ],
                            },
                          },
                          {
                            '@id': 'art28',
                            Rotulo: 'Art. 28.',
                            Caput: {
                              '@id': 'art28_cpt',
                              p:
                                'A sentença que determinar a abertura da sucessão provisória só produzirá efeito cento e oitenta dias depois de publicada pela imprensa; mas, logo que passe em julgado, proceder-se-á à abertura do testamento, se houver, e ao inventário e partilha dos bens, como se o ausente fosse falecido.',
                            },
                            Paragrafo: [
                              {
                                '@id': 'art28_par1',
                                Rotulo: '§ 1º',
                                p:
                                  'Findo o prazo a que se refere o art. 26, e não havendo interessados na sucessão provisória, cumpre ao Ministério Público requerê-la ao juízo competente.',
                              },
                              {
                                '@id': 'art28_par2',
                                Rotulo: '§ 2º',
                                p:
                                  'Não comparecendo herdeiro ou interessado para requerer o inventário até trinta dias depois de passar em julgado a sentença que mandar abrir a sucessão provisória, proceder-se-á à arrecadação dos bens do ausente pela forma estabelecida nos arts. 1.819 a 1.823.',
                              },
                            ],
                          },
                          {
                            '@id': 'art29',
                            Rotulo: 'Art. 29.',
                            Caput: {
                              '@id': 'art29_cpt',
                              p:
                                'Antes da partilha, o juiz, quando julgar conveniente, ordenará a conversão dos bens móveis, sujeitos a deterioração ou a extravio, em imóveis ou em títulos garantidos pela União.',
                            },
                          },
                          {
                            '@id': 'art30',
                            Rotulo: 'Art. 30.',
                            Caput: {
                              '@id': 'art30_cpt',
                              p:
                                'Os herdeiros, para se imitirem na posse dos bens do ausente, darão garantias da restituição deles, mediante penhores ou hipotecas equivalentes aos quinhões respectivos.',
                            },
                            Paragrafo: [
                              {
                                '@id': 'art30_par1',
                                Rotulo: '§ 1º',
                                p:
                                  'Aquele que tiver direito à posse provisória, mas não puder prestar a garantia exigida neste artigo, será excluído, mantendo-se os bens que lhe deviam caber sob a administração do curador, ou de outro herdeiro designado pelo juiz, e que preste essa garantia.',
                              },
                              {
                                '@id': 'art30_par2',
                                Rotulo: '§ 2º',
                                p:
                                  'Os ascendentes, os descendentes e o cônjuge, uma vez provada a sua qualidade de herdeiros, poderão, independentemente de garantia, entrar na posse dos bens do ausente.',
                              },
                            ],
                          },
                          {
                            '@id': 'art31',
                            Rotulo: 'Art. 31.',
                            Caput: {
                              '@id': 'art31_cpt',
                              p: 'Os imóveis do ausente só se poderão alienar, não sendo por desapropriação, ou hipotecar, quando o ordene o juiz, para lhes evitar a ruína.',
                            },
                          },
                          {
                            '@id': 'art32',
                            Rotulo: 'Art. 32.',
                            Caput: {
                              '@id': 'art32_cpt',
                              p:
                                'Empossados nos bens, os sucessores provisórios ficarão representando ativa e passivamente o ausente, de modo que contra eles correrão as ações pendentes e as que de futuro àquele forem movidas.',
                            },
                          },
                          {
                            '@id': 'art33',
                            Rotulo: 'Art. 33.',
                            Caput: {
                              '@id': 'art33_cpt',
                              p:
                                'O descendente, ascendente ou cônjuge que for sucessor provisório do ausente, fará seus todos os frutos e rendimentos dos bens que a este couberem; os outros sucessores, porém, deverão capitalizar metade desses frutos e rendimentos, segundo o disposto no art. 29, de acordo com o representante do Ministério Público, e prestar anualmente contas ao juiz competente.',
                            },
                            Paragrafo: {
                              '@id': 'art33_par1u',
                              Rotulo: 'Parágrafo único.',
                              p:
                                'Se o ausente aparecer, e ficar provado que a ausência foi voluntária e injustificada, perderá ele, em favor do sucessor, sua parte nos frutos e rendimentos.',
                            },
                          },
                          {
                            '@id': 'art34',
                            Rotulo: 'Art. 34.',
                            Caput: {
                              '@id': 'art34_cpt',
                              p:
                                'O excluído, segundo o art. 30, da posse provisória poderá, justificando falta de meios, requerer lhe seja entregue metade dos rendimentos do quinhão que lhe tocaria.',
                            },
                          },
                          {
                            '@id': 'art35',
                            Rotulo: 'Art. 35.',
                            Caput: {
                              '@id': 'art35_cpt',
                              p:
                                'Se durante a posse provisória se provar a época exata do falecimento do ausente, considerar-se-á, nessa data, aberta a sucessão em favor dos herdeiros, que o eram àquele tempo.',
                            },
                          },
                          {
                            '@id': 'art36',
                            Rotulo: 'Art. 36.',
                            Caput: {
                              '@id': 'art36_cpt',
                              p:
                                'Se o ausente aparecer, ou se lhe provar a existência, depois de estabelecida a posse provisória, cessarão para logo as vantagens dos sucessores nela imitidos, ficando, todavia, obrigados a tomar as medidas assecuratórias precisas, até a entrega dos bens a seu dono.',
                            },
                          },
                        ],
                      },
                      {
                        '@id': 'prt1_liv1_tit1_cap3_sec3',
                        Rotulo: 'Seção III',
                        NomeAgrupador: 'Da Sucessão Definitiva',
                        Artigo: [
                          {
                            '@id': 'art37',
                            Rotulo: 'Art. 37.',
                            Caput: {
                              '@id': 'art37_cpt',
                              p:
                                'Dez anos depois de passada em julgado a sentença que concede a abertura da sucessão provisória, poderão os interessados requerer a sucessão definitiva e o levantamento das cauções prestadas.',
                            },
                          },
                          {
                            '@id': 'art38',
                            Rotulo: 'Art. 38.',
                            Caput: {
                              '@id': 'art38_cpt',
                              p:
                                'Pode-se requerer a sucessão definitiva, também, provando-se que o ausente conta oitenta anos de idade, e que de cinco datam as últimas notícias dele.',
                            },
                          },
                          {
                            '@id': 'art39',
                            Rotulo: 'Art. 39.',
                            Caput: {
                              '@id': 'art39_cpt',
                              p:
                                'Regressando o ausente nos dez anos seguintes à abertura da sucessão definitiva, ou algum de seus descendentes ou ascendentes, aquele ou estes haverão só os bens existentes no estado em que se acharem, os sub-rogados em seu lugar, ou o preço que os herdeiros e demais interessados houverem recebido pelos bens alienados depois daquele tempo.',
                            },
                            Paragrafo: {
                              '@id': 'art39_par1u',
                              Rotulo: 'Parágrafo único.',
                              p:
                                'Se, nos dez anos a que se refere este artigo, o ausente não regressar, e nenhum interessado promover a sucessão definitiva, os bens arrecadados passarão ao domínio do Município ou do Distrito Federal, se localizados nas respectivas circunscrições, incorporando-se ao domínio da União, quando situados em território federal.',
                            },
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                '@id': 'prt1_liv1_tit2',
                Rotulo: 'TÍTULO II',
                NomeAgrupador: 'DAS PESSOAS JURÍDICAS',
                Capitulo: [
                  {
                    '@id': 'prt1_liv1_tit2_cap1',
                    Rotulo: 'CAPÍTULO I',
                    NomeAgrupador: 'DISPOSIÇÕES GERAIS',
                    Artigo: [
                      {
                        '@id': 'art40',
                        Rotulo: 'Art. 40.',
                        Caput: {
                          '@id': 'art40_cpt',
                          p: 'As pessoas jurídicas são de direito público, interno ou externo, e de direito privado.',
                        },
                      },
                      {
                        '@id': 'art41',
                        Rotulo: 'Art. 41.',
                        Caput: {
                          '@id': 'art41_cpt',
                          p: 'São pessoas jurídicas de direito público interno:',
                          Inciso: [
                            {
                              '@id': 'art41_cpt_inc1',
                              Rotulo: 'I –',
                              p: 'a União;',
                            },
                            {
                              '@id': 'art41_cpt_inc2',
                              Rotulo: 'II –',
                              p: 'os Estados, o Distrito Federal e os Territórios;',
                            },
                            {
                              '@id': 'art41_cpt_inc3',
                              Rotulo: 'III –',
                              p: 'os Municípios;',
                            },
                            {
                              '@id': 'art41_cpt_inc4',
                              Rotulo: 'IV –',
                              p: 'as autarquias;',
                            },
                            {
                              '@id': 'art41_cpt_inc5',
                              Rotulo: 'V –',
                              p: 'as demais entidades de caráter público criadas por lei.',
                            },
                          ],
                        },
                        Paragrafo: {
                          '@id': 'art41_par1u',
                          Rotulo: 'Parágrafo único.',
                          p:
                            'Salvo disposição em contrário, as pessoas jurídicas de direito público, a que se tenha dado estrutura de direito privado, regem-se, no que couber, quanto ao seu funcionamento, pelas normas deste Código.',
                        },
                      },
                      {
                        '@id': 'art42',
                        Rotulo: 'Art. 42.',
                        Caput: {
                          '@id': 'art42_cpt',
                          p: 'São pessoas jurídicas de direito público externo os Estados estrangeiros e todas as pessoas que forem regidas pelo direito internacional público.',
                        },
                      },
                      {
                        '@id': 'art43',
                        Rotulo: 'Art. 43.',
                        Caput: {
                          '@id': 'art43_cpt',
                          p:
                            'As pessoas jurídicas de direito público interno são civilmente responsáveis por atos dos seus agentes que nessa qualidade causem danos a terceiros, ressalvado direito regressivo contra os causadores do dano, se houver, por parte destes, culpa ou dolo.',
                        },
                      },
                      {
                        '@id': 'art44',
                        Rotulo: 'Art. 44.',
                        Caput: {
                          '@id': 'art44_cpt',
                          p: 'São pessoas jurídicas de direito privado:',
                          Inciso: [
                            {
                              '@id': 'art44_cpt_inc1',
                              Rotulo: 'I –',
                              p: 'as associações;',
                            },
                            {
                              '@id': 'art44_cpt_inc2',
                              Rotulo: 'II –',
                              p: 'as sociedades;',
                            },
                            {
                              '@id': 'art44_cpt_inc3',
                              Rotulo: 'III –',
                              p: 'as fundações.',
                            },
                          ],
                        },
                        Paragrafo: {
                          '@id': 'art44_par1u',
                          Rotulo: 'Parágrafo único.',
                          p: 'As disposições concernentes às associações aplicam-se, subsidiariamente, às sociedades que são objeto do Livro II da Parte Especial deste Código.',
                        },
                      },
                      {
                        '@id': 'art45',
                        Rotulo: 'Art. 45.',
                        Caput: {
                          '@id': 'art45_cpt',
                          p:
                            'Começa a existência legal das pessoas jurídicas de direito privado com a inscrição do ato constitutivo no respectivo registro, precedida, quando necessário, de autorização ou aprovação do Poder Executivo, averbando-se no registro todas as alterações por que passar o ato constitutivo.',
                        },
                        Paragrafo: {
                          '@id': 'art45_par1u',
                          Rotulo: 'Parágrafo único.',
                          p:
                            'Decai em três anos o direito de anular a constituição das pessoas jurídicas de direito privado, por defeito do ato respectivo, contado o prazo da publicação de sua inscrição no registro.',
                        },
                      },
                      {
                        '@id': 'art46',
                        Rotulo: 'Art. 46.',
                        Caput: {
                          '@id': 'art46_cpt',
                          p: 'O registro declarará:',
                          Inciso: [
                            {
                              '@id': 'art46_cpt_inc1',
                              Rotulo: 'I –',
                              p: 'a denominação, os fins, a sede, o tempo de duração e o fundo social, quando houver;',
                            },
                            {
                              '@id': 'art46_cpt_inc2',
                              Rotulo: 'II –',
                              p: 'o nome e a individualização dos fundadores ou instituidores, e dos diretores;',
                            },
                            {
                              '@id': 'art46_cpt_inc3',
                              Rotulo: 'III –',
                              p: 'o modo por que se administra e representa, ativa e passivamente, judicial e extrajudicialmente;',
                            },
                            {
                              '@id': 'art46_cpt_inc4',
                              Rotulo: 'IV –',
                              p: 'se o ato constitutivo é reformável no tocante à administração, e de que modo;',
                            },
                            {
                              '@id': 'art46_cpt_inc5',
                              Rotulo: 'V –',
                              p: 'se os membros respondem, ou não, subsidiariamente, pelas obrigações sociais;',
                            },
                            {
                              '@id': 'art46_cpt_inc6',
                              Rotulo: 'VI –',
                              p: 'as condições de extinção da pessoa jurídica e o destino do seu patrimônio, nesse caso.',
                            },
                          ],
                        },
                      },
                      {
                        '@id': 'art47',
                        Rotulo: 'Art. 47.',
                        Caput: {
                          '@id': 'art47_cpt',
                          p: 'Obrigam a pessoa jurídica os atos dos administradores, exercidos nos limites de seus poderes definidos no ato constitutivo.',
                        },
                      },
                      {
                        '@id': 'art48',
                        Rotulo: 'Art. 48.',
                        Caput: {
                          '@id': 'art48_cpt',
                          p:
                            'Se a pessoa jurídica tiver administração coletiva, as decisões se tomarão pela maioria de votos dos presentes, salvo se o ato constitutivo dispuser de modo diverso.',
                        },
                        Paragrafo: {
                          '@id': 'art48_par1u',
                          Rotulo: 'Parágrafo único.',
                          p:
                            'Decai em três anos o direito de anular as decisões a que se refere este artigo, quando violarem a lei ou estatuto, ou forem eivadas de erro, dolo, simulação ou fraude.',
                        },
                      },
                      {
                        '@id': 'art49',
                        Rotulo: 'Art. 49.',
                        Caput: {
                          '@id': 'art49_cpt',
                          p: 'Se a administração da pessoa jurídica vier a faltar, o juiz, a requerimento de qualquer interessado, nomear-lhe-á administrador provisório.',
                        },
                      },
                      {
                        '@id': 'art50',
                        Rotulo: 'Art. 50.',
                        Caput: {
                          '@id': 'art50_cpt',
                          p:
                            'Em caso de abuso da personalidade jurídica, caracterizado pelo desvio de finalidade, ou pela confusão patrimonial, pode o juiz decidir, a requerimento da parte, ou do Ministério Público quando lhe couber intervir no processo, que os efeitos de certas e determinadas relações de obrigações sejam estendidos aos bens particulares dos administradores ou sócios da pessoa jurídica.',
                        },
                      },
                      {
                        '@id': 'art51',
                        Rotulo: 'Art. 51.',
                        Caput: {
                          '@id': 'art51_cpt',
                          p:
                            'Nos casos de dissolução da pessoa jurídica ou cassada a autorização para seu funcionamento, ela subsistirá para os fins de liquidação, até que esta se conclua.',
                        },
                        Paragrafo: [
                          {
                            '@id': 'art51_par1',
                            Rotulo: '§ 1º',
                            p: 'Far-se-á, no registro onde a pessoa jurídica estiver inscrita, a averbação de sua dissolução.',
                          },
                          {
                            '@id': 'art51_par2',
                            Rotulo: '§ 2º',
                            p: 'As disposições para a liquidação das sociedades aplicam-se, no que couber, às demais pessoas jurídicas de direito privado.',
                          },
                          {
                            '@id': 'art51_par3',
                            Rotulo: '§ 3º',
                            p: 'Encerrada a liquidação, promover-se-á o cancelamento da inscrição da pessoa jurídica.',
                          },
                        ],
                      },
                      {
                        '@id': 'art52',
                        Rotulo: 'Art. 52.',
                        Caput: {
                          '@id': 'art52_cpt',
                          p: 'Aplica-se às pessoas jurídicas, no que couber, a proteção dos direitos da personalidade.',
                        },
                      },
                    ],
                  },
                  {
                    '@id': 'prt1_liv1_tit2_cap2',
                    Rotulo: 'CAPÍTULO II',
                    NomeAgrupador: 'DAS ASSOCIAÇÕES',
                    Artigo: [
                      {
                        '@id': 'art53',
                        Rotulo: 'Art. 53.',
                        Caput: {
                          '@id': 'art53_cpt',
                          p: 'Constituem-se as associações pela união de pessoas que se organizem para fins não econômicos.',
                        },
                        Paragrafo: {
                          '@id': 'art53_par1u',
                          Rotulo: 'Parágrafo único.',
                          p: 'Não há, entre os associados, direitos e obrigações recíprocos.',
                        },
                      },
                      {
                        '@id': 'art54',
                        Rotulo: 'Art. 54.',
                        Caput: {
                          '@id': 'art54_cpt',
                          p: 'Sob pena de nulidade, o estatuto das associações conterá:',
                          Inciso: [
                            {
                              '@id': 'art54_cpt_inc1',
                              Rotulo: 'I –',
                              p: 'a denominação, os fins e a sede da associação;',
                            },
                            {
                              '@id': 'art54_cpt_inc2',
                              Rotulo: 'II –',
                              p: 'os requisitos para a admissão, demissão e exclusão dos associados;',
                            },
                            {
                              '@id': 'art54_cpt_inc3',
                              Rotulo: 'III –',
                              p: 'os direitos e deveres dos associados;',
                            },
                            {
                              '@id': 'art54_cpt_inc4',
                              Rotulo: 'IV –',
                              p: 'as fontes de recursos para sua manutenção;',
                            },
                            {
                              '@id': 'art54_cpt_inc5',
                              Rotulo: 'V –',
                              p: 'o modo de constituição e funcionamento dos órgãos deliberativos e administrativos;',
                            },
                            {
                              '@id': 'art54_cpt_inc6',
                              Rotulo: 'VI –',
                              p: 'as condições para a alteração das disposições estatutárias e para a dissolução.',
                            },
                          ],
                        },
                      },
                      {
                        '@id': 'art55',
                        Rotulo: 'Art. 55.',
                        Caput: {
                          '@id': 'art55_cpt',
                          p: 'Os associados devem ter iguais direitos, mas o estatuto poderá instituir categorias com vantagens especiais.',
                        },
                      },
                      {
                        '@id': 'art56',
                        Rotulo: 'Art. 56.',
                        Caput: {
                          '@id': 'art56_cpt',
                          p: 'A qualidade de associado é intransmissível, se o estatuto não dispuser o contrário.',
                        },
                        Paragrafo: {
                          '@id': 'art56_par1u',
                          Rotulo: 'Parágrafo único.',
                          p:
                            'Se o associado for titular de quota ou fração ideal do patrimônio da associação, a transferência daquela não importará, de per si, na atribuição da qualidade de associado ao adquirente ou ao herdeiro, salvo disposição diversa do estatuto.',
                        },
                      },
                      {
                        '@id': 'art57',
                        Rotulo: 'Art. 57.',
                        Caput: {
                          '@id': 'art57_cpt',
                          p:
                            'A exclusão do associado só é admissível havendo justa causa, obedecido o disposto no estatuto; sendo este omisso, poderá também ocorrer se for reconhecida a existência de motivos graves, em deliberação fundamentada, pela maioria absoluta dos presentes à assembléia geral especialmente convocada para esse fim.',
                        },
                        Paragrafo: {
                          '@id': 'art57_par1u',
                          Rotulo: 'Parágrafo único.',
                          p: 'Da decisão do órgão que, de conformidade com o estatuto, decretar a exclusão, caberá sempre recurso à assembléia geral.',
                        },
                      },
                      {
                        '@id': 'art58',
                        Rotulo: 'Art. 58.',
                        Caput: {
                          '@id': 'art58_cpt',
                          p:
                            'Nenhum associado poderá ser impedido de exercer direito ou função que lhe tenha sido legitimamente conferido, a não ser nos casos e pela forma previstos na lei ou no estatuto.',
                        },
                      },
                      {
                        '@id': 'art59',
                        Rotulo: 'Art. 59.',
                        Caput: {
                          '@id': 'art59_cpt',
                          p: 'Compete privativamente à assembléia geral:',
                          Inciso: [
                            {
                              '@id': 'art59_cpt_inc1',
                              Rotulo: 'I –',
                              p: 'eleger os administradores;',
                            },
                            {
                              '@id': 'art59_cpt_inc2',
                              Rotulo: 'II –',
                              p: 'destituir os administradores;',
                            },
                            {
                              '@id': 'art59_cpt_inc3',
                              Rotulo: 'III –',
                              p: 'aprovar as contas;',
                            },
                            {
                              '@id': 'art59_cpt_inc4',
                              Rotulo: 'IV –',
                              p: 'alterar o estatuto.',
                            },
                          ],
                        },
                        Paragrafo: {
                          '@id': 'art59_par1u',
                          Rotulo: 'Parágrafo único.',
                          p:
                            'Para as deliberações a que se referem os incisos II e IV é exigido o voto concorde de dois terços dos presentes à assembléia especialmente convocada para esse fim, não podendo ela deliberar, em primeira convocação, sem a maioria absoluta dos associados, ou com menos de um terço nas convocações seguintes.',
                        },
                      },
                      {
                        '@id': 'art60',
                        Rotulo: 'Art. 60.',
                        Caput: {
                          '@id': 'art60_cpt',
                          p: 'A convocação da assembléia geral far-se-á na forma do estatuto, garantido a um quinto dos associados o direito de promovê-la.',
                        },
                      },
                      {
                        '@id': 'art61',
                        Rotulo: 'Art. 61.',
                        Caput: {
                          '@id': 'art61_cpt',
                          p:
                            'Dissolvida a associação, o remanescente do seu patrimônio líquido, depois de deduzidas, se for o caso, as quotas ou frações ideais referidas no parágrafo único do art. 56, será destinado à entidade de fins não econômicos designada no estatuto, ou, omisso este, por deliberação dos associados, à instituição municipal, estadual ou federal, de fins idênticos ou semelhantes.',
                        },
                        Paragrafo: [
                          {
                            '@id': 'art61_par1',
                            Rotulo: '§ 1º',
                            p:
                              'Por cláusula do estatuto ou, no seu silêncio, por deliberação dos associados, podem estes, antes da destinação do remanescente referida neste artigo, receber em restituição, atualizado o respectivo valor, as contribuições que tiverem prestado ao patrimônio da associação.',
                          },
                          {
                            '@id': 'art61_par2',
                            Rotulo: '§ 2º',
                            p:
                              'Não existindo no Município, no Estado, no Distrito Federal ou no Território, em que a associação tiver sede, instituição nas condições indicadas neste artigo, o que remanescer do seu patrimônio se devolverá à Fazenda do Estado, do Distrito Federal ou da União.',
                          },
                        ],
                      },
                    ],
                  },
                  {
                    '@id': 'prt1_liv1_tit2_cap3',
                    Rotulo: 'CAPÍTULO III',
                    NomeAgrupador: 'DAS FUNDAÇÕES',
                    Artigo: [
                      {
                        '@id': 'art62',
                        Rotulo: 'Art. 62.',
                        Caput: {
                          '@id': 'art62_cpt',
                          p:
                            'Para criar uma fundação, o seu instituidor fará, por escritura pública ou testamento, dotação especial de bens livres, especificando o fim a que se destina, e declarando, se quiser, a maneira de administrá-la.',
                        },
                        Paragrafo: {
                          '@id': 'art62_par1u',
                          Rotulo: 'Parágrafo único.',
                          p: 'A fundação somente poderá constituir-se para fins religiosos, morais, culturais ou de assistência.',
                        },
                      },
                      {
                        '@id': 'art63',
                        Rotulo: 'Art. 63.',
                        Caput: {
                          '@id': 'art63_cpt',
                          p:
                            'Quando insuficientes para constituir a fundação, os bens a ela destinados serão, se de outro modo não dispuser o instituidor, incorporados em outra fundação que se proponha a fim igual ou semelhante.',
                        },
                      },
                      {
                        '@id': 'art64',
                        Rotulo: 'Art. 64.',
                        Caput: {
                          '@id': 'art64_cpt',
                          p:
                            'Constituída a fundação por negócio jurídico entre vivos, o instituidor é obrigado a transferir-lhe a propriedade, ou outro direito real, sobre os bens dotados, e, se não o fizer, serão registrados, em nome dela, por mandado judicial.',
                        },
                      },
                      {
                        '@id': 'art65',
                        Rotulo: 'Art. 65.',
                        Caput: {
                          '@id': 'art65_cpt',
                          p:
                            'Aqueles a quem o instituidor cometer a aplicação do patrimônio, em tendo ciência do encargo, formularão logo, de acordo com as suas bases (art. 62), o estatuto da fundação projetada, submetendo-o, em seguida, à aprovação da autoridade competente, com recurso ao juiz.',
                        },
                        Paragrafo: {
                          '@id': 'art65_par1u',
                          Rotulo: 'Parágrafo único.',
                          p:
                            'Se o estatuto não for elaborado no prazo assinado pelo instituidor, ou, não havendo prazo, em cento e oitenta dias, a incumbência caberá ao Ministério Público.',
                        },
                      },
                      {
                        '@id': 'art66',
                        Rotulo: 'Art. 66.',
                        Caput: {
                          '@id': 'art66_cpt',
                          p: 'Velará pelas fundações o Ministério Público do Estado onde situadas.',
                        },
                        Paragrafo: [
                          {
                            '@id': 'art66_par1',
                            Rotulo: '§ 1º',
                            p: 'Se funcionarem no Distrito Federal, ou em Território, caberá o encargo ao Ministério Público Federal.',
                          },
                          {
                            '@id': 'art66_par2',
                            Rotulo: '§ 2º',
                            p: 'Se estenderem a atividade por mais de um Estado, caberá o encargo, em cada um deles, ao respectivo Ministério Público.',
                          },
                        ],
                      },
                      {
                        '@id': 'art67',
                        Rotulo: 'Art. 67.',
                        Caput: {
                          '@id': 'art67_cpt',
                          p: 'Para que se possa alterar o estatuto da fundação é mister que a reforma:',
                          Inciso: [
                            {
                              '@id': 'art67_cpt_inc1',
                              Rotulo: 'I –',
                              p: 'seja deliberada por dois terços dos competentes para gerir e representar a fundação;',
                            },
                            {
                              '@id': 'art67_cpt_inc2',
                              Rotulo: 'II –',
                              p: 'não contrarie ou desvirtue o fim desta;',
                            },
                            {
                              '@id': 'art67_cpt_inc3',
                              Rotulo: 'III –',
                              p: 'seja aprovada pelo órgão do Ministério Público, e, caso este a denegue, poderá o juiz supri-la, a requerimento do interessado.',
                            },
                          ],
                        },
                      },
                      {
                        '@id': 'art68',
                        Rotulo: 'Art. 68.',
                        Caput: {
                          '@id': 'art68_cpt',
                          p:
                            'Quando a alteração não houver sido aprovada por votação unânime, os administradores da fundação, ao submeterem o estatuto ao órgão do Ministério Público, requererão que se dê ciência à minoria vencida para impugná-la, se quiser, em dez dias.',
                        },
                      },
                      {
                        '@id': 'art69',
                        Rotulo: 'Art. 69.',
                        Caput: {
                          '@id': 'art69_cpt',
                          p:
                            'Tornando-se ilícita, impossível ou inútil a finalidade a que visa a fundação, ou vencido o prazo de sua existência, o órgão do Ministério Público, ou qualquer interessado, lhe promoverá a extinção, incorporando-se o seu patrimônio, salvo disposição em contrário no ato constitutivo, ou no estatuto, em outra fundação, designada pelo juiz, que se proponha a fim igual ou semelhante.',
                        },
                      },
                    ],
                  },
                ],
              },
              {
                '@id': 'prt1_liv1_tit3',
                Rotulo: 'TÍTULO III',
                NomeAgrupador: 'Do Domicílio',
                Artigo: [
                  {
                    '@id': 'art70',
                    Rotulo: 'Art. 70.',
                    Caput: {
                      '@id': 'art70_cpt',
                      p: 'O domicílio da pessoa natural é o lugar onde ela estabelece a sua residência com ânimo definitivo.',
                    },
                  },
                  {
                    '@id': 'art71',
                    Rotulo: 'Art. 71.',
                    Caput: {
                      '@id': 'art71_cpt',
                      p: 'Se, porém, a pessoa natural tiver diversas residências, onde, alternadamente, viva, considerar-se-á domicílio seu qualquer delas.',
                    },
                  },
                  {
                    '@id': 'art72',
                    Rotulo: 'Art. 72.',
                    Caput: {
                      '@id': 'art72_cpt',
                      p: 'É também domicílio da pessoa natural, quanto às relações concernentes à profissão, o lugar onde esta é exercida.',
                    },
                    Paragrafo: {
                      '@id': 'art72_par1u',
                      Rotulo: 'Parágrafo único.',
                      p: 'Se a pessoa exercitar profissão em lugares diversos, cada um deles constituirá domicílio para as relações que lhe corresponderem.',
                    },
                  },
                  {
                    '@id': 'art73',
                    Rotulo: 'Art. 73.',
                    Caput: {
                      '@id': 'art73_cpt',
                      p: 'Ter-se-á por domicílio da pessoa natural, que não tenha residência habitual, o lugar onde for encontrada.',
                    },
                  },
                  {
                    '@id': 'art74',
                    Rotulo: 'Art. 74.',
                    Caput: {
                      '@id': 'art74_cpt',
                      p: 'Muda-se o domicílio, transferindo a residência, com a intenção manifesta de o mudar.',
                    },
                    Paragrafo: {
                      '@id': 'art74_par1u',
                      Rotulo: 'Parágrafo único.',
                      p:
                        'A prova da intenção resultará do que declarar a pessoa às municipalidades dos lugares, que deixa, e para onde vai, ou, se tais declarações não fizer, da própria mudança, com as circunstâncias que a acompanharem.',
                    },
                  },
                  {
                    '@id': 'art75',
                    Rotulo: 'Art. 75.',
                    Caput: {
                      '@id': 'art75_cpt',
                      p: 'Quanto às pessoas jurídicas, o domicílio é:',
                      Inciso: [
                        {
                          '@id': 'art75_cpt_inc1',
                          Rotulo: 'I –',
                          p: 'da União, o Distrito Federal;',
                        },
                        {
                          '@id': 'art75_cpt_inc2',
                          Rotulo: 'II –',
                          p: 'dos Estados e Territórios, as respectivas capitais;',
                        },
                        {
                          '@id': 'art75_cpt_inc3',
                          Rotulo: 'III –',
                          p: 'do Município, o lugar onde funcione a administração municipal;',
                        },
                        {
                          '@id': 'art75_cpt_inc4',
                          Rotulo: 'IV –',
                          p:
                            'das demais pessoas jurídicas, o lugar onde funcionarem as respectivas diretorias e administrações, ou onde elegerem domicílio especial no seu estatuto ou atos constitutivos.',
                        },
                      ],
                    },
                    Paragrafo: [
                      {
                        '@id': 'art75_par1',
                        Rotulo: '§ 1º',
                        p: 'Tendo a pessoa jurídica diversos estabelecimentos em lugares diferentes, cada um deles será considerado domicílio para os atos nele praticados.',
                      },
                      {
                        '@id': 'art75_par2',
                        Rotulo: '§ 2º',
                        p:
                          'Se a administração, ou diretoria, tiver a sede no estrangeiro, haver-se-á por domicílio da pessoa jurídica, no tocante às obrigações contraídas por cada uma das suas agências, o lugar do estabelecimento, sito no Brasil, a que ela corresponder.',
                      },
                    ],
                  },
                  {
                    '@id': 'art76',
                    Rotulo: 'Art. 76.',
                    Caput: {
                      '@id': 'art76_cpt',
                      p: 'Têm domicílio necessário o incapaz, o servidor público, o militar, o marítimo e o preso.',
                    },
                    Paragrafo: {
                      '@id': 'art76_par1u',
                      Rotulo: 'Parágrafo único.',
                      p:
                        'O domicílio do incapaz é o do seu representante ou assistente; o do servidor público, o lugar em que exercer permanentemente suas funções; o do militar, onde servir, e, sendo da Marinha ou da Aeronáutica, a sede do comando a que se encontrar imediatamente subordinado; o do marítimo, onde o navio estiver matriculado; e o do preso, o lugar em que cumprir a sentença.',
                    },
                  },
                  {
                    '@id': 'art77',
                    Rotulo: 'Art. 77.',
                    Caput: {
                      '@id': 'art77_cpt',
                      p:
                        'O agente diplomático do Brasil, que, citado no estrangeiro, alegar extraterritorialidade sem designar onde tem, no país, o seu domicílio, poderá ser demandado no Distrito Federal ou no último ponto do território brasileiro onde o teve.',
                    },
                  },
                  {
                    '@id': 'art78',
                    Rotulo: 'Art. 78.',
                    Caput: {
                      '@id': 'art78_cpt',
                      p: 'Nos contratos escritos, poderão os contratantes especificar domicílio onde se exercitem e cumpram os direitos e obrigações deles resultantes.',
                    },
                  },
                ],
              },
            ],
          },
          {
            '@id': 'prt1_liv2',
            Rotulo: 'LIVRO II',
            NomeAgrupador: 'DOS BENS',
            Titulo: {
              '@id': 'prt1_liv2_tit1u',
              Rotulo: 'TÍTULO ÚNICO',
              NomeAgrupador: 'Das Diferentes Classes de Bens',
              Capitulo: [
                {
                  '@id': 'prt1_liv2_tit1u_cap1',
                  Rotulo: 'CAPÍTULO I',
                  NomeAgrupador: 'Dos Bens Considerados em Si Mesmos',
                  Secao: [
                    {
                      '@id': 'prt1_liv2_tit1u_cap1_sec1',
                      Rotulo: 'Seção I',
                      NomeAgrupador: 'Dos Bens Imóveis',
                      Artigo: [
                        {
                          '@id': 'art79',
                          Rotulo: 'Art. 79.',
                          Caput: {
                            '@id': 'art79_cpt',
                            p: 'São bens imóveis o solo e tudo quanto se lhe incorporar natural ou artificialmente.',
                          },
                        },
                        {
                          '@id': 'art80',
                          Rotulo: 'Art. 80.',
                          Caput: {
                            '@id': 'art80_cpt',
                            p: 'Consideram-se imóveis para os efeitos legais:',
                            Inciso: [
                              {
                                '@id': 'art80_cpt_inc1',
                                Rotulo: 'I –',
                                p: 'os direitos reais sobre imóveis e as ações que os asseguram;',
                              },
                              {
                                '@id': 'art80_cpt_inc2',
                                Rotulo: 'II –',
                                p: 'o direito à sucessão aberta.',
                              },
                            ],
                          },
                        },
                        {
                          '@id': 'art81',
                          Rotulo: 'Art. 81.',
                          Caput: {
                            '@id': 'art81_cpt',
                            p: 'Não perdem o caráter de imóveis:',
                            Inciso: [
                              {
                                '@id': 'art81_cpt_inc1',
                                Rotulo: 'I –',
                                p: 'as edificações que, separadas do solo, mas conservando a sua unidade, forem removidas para outro local;',
                              },
                              {
                                '@id': 'art81_cpt_inc2',
                                Rotulo: 'II –',
                                p: 'os materiais provisoriamente separados de um prédio, para nele se reempregarem.',
                              },
                            ],
                          },
                        },
                      ],
                    },
                    {
                      '@id': 'prt1_liv2_tit1u_cap1_sec2',
                      Rotulo: 'Seção II',
                      NomeAgrupador: 'Dos Bens Móveis',
                      Artigo: [
                        {
                          '@id': 'art82',
                          Rotulo: 'Art. 82.',
                          Caput: {
                            '@id': 'art82_cpt',
                            p:
                              'São móveis os bens suscetíveis de movimento próprio, ou de remoção por força alheia, sem alteração da substância ou da destinação econômico-social.',
                          },
                        },
                        {
                          '@id': 'art83',
                          Rotulo: 'Art. 83.',
                          Caput: {
                            '@id': 'art83_cpt',
                            p: 'Consideram-se móveis para os efeitos legais:',
                            Inciso: [
                              {
                                '@id': 'art83_cpt_inc1',
                                Rotulo: 'I –',
                                p: 'as energias que tenham valor econômico;',
                              },
                              {
                                '@id': 'art83_cpt_inc2',
                                Rotulo: 'II –',
                                p: 'os direitos reais sobre objetos móveis e as ações correspondentes;',
                              },
                              {
                                '@id': 'art83_cpt_inc3',
                                Rotulo: 'III –',
                                p: 'os direitos pessoais de caráter patrimonial e respectivas ações.',
                              },
                            ],
                          },
                        },
                        {
                          '@id': 'art84',
                          Rotulo: 'Art. 84.',
                          Caput: {
                            '@id': 'art84_cpt',
                            p:
                              'Os materiais destinados a alguma construção, enquanto não forem empregados, conservam sua qualidade de móveis; readquirem essa qualidade os provenientes da demolição de algum prédio.',
                          },
                        },
                      ],
                    },
                    {
                      '@id': 'prt1_liv2_tit1u_cap1_sec3',
                      Rotulo: 'Seção III',
                      NomeAgrupador: 'Dos Bens Fungíveis e Consumíveis',
                      Artigo: [
                        {
                          '@id': 'art85',
                          Rotulo: 'Art. 85.',
                          Caput: {
                            '@id': 'art85_cpt',
                            p: 'São fungíveis os móveis que podem substituir-se por outros da mesma espécie, qualidade e quantidade.',
                          },
                        },
                        {
                          '@id': 'art86',
                          Rotulo: 'Art. 86.',
                          Caput: {
                            '@id': 'art86_cpt',
                            p:
                              'São consumíveis os bens móveis cujo uso importa destruição imediata da própria substância, sendo também considerados tais os destinados à alienação.',
                          },
                        },
                      ],
                    },
                    {
                      '@id': 'prt1_liv2_tit1u_cap1_sec4',
                      Rotulo: 'Seção IV',
                      NomeAgrupador: 'Dos Bens Divisíveis',
                      Artigo: [
                        {
                          '@id': 'art87',
                          Rotulo: 'Art. 87.',
                          Caput: {
                            '@id': 'art87_cpt',
                            p:
                              'Bens divisíveis são os que se podem fracionar sem alteração na sua substância, diminuição considerável de valor, ou prejuízo do uso a que se destinam.',
                          },
                        },
                        {
                          '@id': 'art88',
                          Rotulo: 'Art. 88.',
                          Caput: {
                            '@id': 'art88_cpt',
                            p: 'Os bens naturalmente divisíveis podem tornar-se indivisíveis por determinação da lei ou por vontade das partes.',
                          },
                        },
                      ],
                    },
                    {
                      '@id': 'prt1_liv2_tit1u_cap1_sec5',
                      Rotulo: 'Seção V',
                      NomeAgrupador: 'Dos Bens Singulares e Coletivos',
                      Artigo: [
                        {
                          '@id': 'art89',
                          Rotulo: 'Art. 89.',
                          Caput: {
                            '@id': 'art89_cpt',
                            p: 'São singulares os bens que, embora reunidos, se consideram de per si, independentemente dos demais.',
                          },
                        },
                        {
                          '@id': 'art90',
                          Rotulo: 'Art. 90.',
                          Caput: {
                            '@id': 'art90_cpt',
                            p: 'Constitui universalidade de fato a pluralidade de bens singulares que, pertinentes à mesma pessoa, tenham destinação unitária.',
                          },
                          Paragrafo: {
                            '@id': 'art90_par1u',
                            Rotulo: 'Parágrafo único.',
                            p: 'Os bens que formam essa universalidade podem ser objeto de relações jurídicas próprias.',
                          },
                        },
                        {
                          '@id': 'art91',
                          Rotulo: 'Art. 91.',
                          Caput: {
                            '@id': 'art91_cpt',
                            p: 'Constitui universalidade de direito o complexo de relações jurídicas, de uma pessoa, dotadas de valor econômico.',
                          },
                        },
                      ],
                    },
                  ],
                },
                {
                  '@id': 'prt1_liv2_tit1u_cap2',
                  Rotulo: 'CAPÍTULO II',
                  NomeAgrupador: 'Dos Bens Reciprocamente Considerados',
                  Artigo: [
                    {
                      '@id': 'art92',
                      Rotulo: 'Art. 92.',
                      Caput: {
                        '@id': 'art92_cpt',
                        p: 'Principal é o bem que existe sobre si, abstrata ou concretamente; acessório, aquele cuja existência supõe a do principal.',
                      },
                    },
                    {
                      '@id': 'art93',
                      Rotulo: 'Art. 93.',
                      Caput: {
                        '@id': 'art93_cpt',
                        p: 'São pertenças os bens que, não constituindo partes integrantes, se destinam, de modo duradouro, ao uso, ao serviço ou ao aformoseamento de outro.',
                      },
                    },
                    {
                      '@id': 'art94',
                      Rotulo: 'Art. 94.',
                      Caput: {
                        '@id': 'art94_cpt',
                        p:
                          'Os negócios jurídicos que dizem respeito ao bem principal não abrangem as pertenças, salvo se o contrário resultar da lei, da manifestação de vontade, ou das circunstâncias do caso.',
                      },
                    },
                    {
                      '@id': 'art95',
                      Rotulo: 'Art. 95.',
                      Caput: {
                        '@id': 'art95_cpt',
                        p: 'Apesar de ainda não separados do bem principal, os frutos e produtos podem ser objeto de negócio jurídico.',
                      },
                    },
                    {
                      '@id': 'art96',
                      Rotulo: 'Art. 96.',
                      Caput: {
                        '@id': 'art96_cpt',
                        p: 'As benfeitorias podem ser voluptuárias, úteis ou necessárias.',
                      },
                      Paragrafo: [
                        {
                          '@id': 'art96_par1',
                          Rotulo: '§ 1º',
                          p: 'São voluptuárias as de mero deleite ou recreio, que não aumentam o uso habitual do bem, ainda que o tornem mais agradável ou sejam de elevado valor.',
                        },
                        {
                          '@id': 'art96_par2',
                          Rotulo: '§ 2º',
                          p: 'São úteis as que aumentam ou facilitam o uso do bem.',
                        },
                        {
                          '@id': 'art96_par3',
                          Rotulo: '§ 3º',
                          p: 'São necessárias as que têm por fim conservar o bem ou evitar que se deteriore.',
                        },
                      ],
                    },
                    {
                      '@id': 'art97',
                      Rotulo: 'Art. 97.',
                      Caput: {
                        '@id': 'art97_cpt',
                        p: 'Não se consideram benfeitorias os melhoramentos ou acréscimos sobrevindos ao bem sem a intervenção do proprietário, possuidor ou detentor.',
                      },
                    },
                  ],
                },
                {
                  '@id': 'prt1_liv2_tit1u_cap3',
                  Rotulo: 'CAPÍTULO III',
                  NomeAgrupador: 'Dos Bens Públicos',
                  Artigo: [
                    {
                      '@id': 'art98',
                      Rotulo: 'Art. 98.',
                      Caput: {
                        '@id': 'art98_cpt',
                        p:
                          'São públicos os bens do domínio nacional pertencentes às pessoas jurídicas de direito público interno; todos os outros são particulares, seja qual for a pessoa a que pertencerem.',
                      },
                    },
                    {
                      '@id': 'art99',
                      Rotulo: 'Art. 99.',
                      Caput: {
                        '@id': 'art99_cpt',
                        p: 'São bens públicos:',
                        Inciso: [
                          {
                            '@id': 'art99_cpt_inc1',
                            Rotulo: 'I –',
                            p: 'os de uso comum do povo, tais como rios, mares, estradas, ruas e praças;',
                          },
                          {
                            '@id': 'art99_cpt_inc2',
                            Rotulo: 'II –',
                            p:
                              'os de uso especial, tais como edifícios ou terrenos destinados a serviço ou estabelecimento da administração federal, estadual, territorial ou municipal, inclusive os de suas autarquias;',
                          },
                          {
                            '@id': 'art99_cpt_inc3',
                            Rotulo: 'III –',
                            p:
                              'os dominicais, que constituem o patrimônio das pessoas jurídicas de direito público, como objeto de direito pessoal, ou real, de cada uma dessas entidades.',
                          },
                        ],
                      },
                      Paragrafo: {
                        '@id': 'art99_par1u',
                        Rotulo: 'Parágrafo único.',
                        p:
                          'Não dispondo a lei em contrário, consideram-se dominicais os bens pertencentes às pessoas jurídicas de direito público a que se tenha dado estrutura de direito privado.',
                      },
                    },
                    {
                      '@id': 'art100',
                      Rotulo: 'Art. 100.',
                      Caput: {
                        '@id': 'art100_cpt',
                        p: 'Os bens públicos de uso comum do povo e os de uso especial são inalienáveis, enquanto conservarem a sua qualificação, na forma que a lei determinar.',
                      },
                    },
                    {
                      '@id': 'art101',
                      Rotulo: 'Art. 101.',
                      Caput: {
                        '@id': 'art101_cpt',
                        p: 'Os bens públicos dominicais podem ser alienados, observadas as exigências da lei.',
                      },
                    },
                    {
                      '@id': 'art102',
                      Rotulo: 'Art. 102.',
                      Caput: {
                        '@id': 'art102_cpt',
                        p: 'Os bens públicos não estão sujeitos a usucapião.',
                      },
                    },
                    {
                      '@id': 'art103',
                      Rotulo: 'Art. 103.',
                      Caput: {
                        '@id': 'art103_cpt',
                        p: 'O uso comum dos bens públicos pode ser gratuito ou retribuído, conforme for estabelecido legalmente pela entidade a cuja administração pertencerem.',
                      },
                    },
                  ],
                },
              ],
            },
          },
          {
            '@id': 'prt1_liv3',
            Rotulo: 'LIVRO III',
            NomeAgrupador: 'Dos Fatos Jurídicos',
            Titulo: [
              {
                '@id': 'prt1_liv3_tit1',
                Rotulo: 'TÍTULO I',
                NomeAgrupador: 'Do Negócio Jurídico',
                Capitulo: [
                  {
                    '@id': 'prt1_liv3_tit1_cap1',
                    Rotulo: 'CAPÍTULO I',
                    NomeAgrupador: 'Disposições Gerais',
                    Artigo: [
                      {
                        '@id': 'art104',
                        Rotulo: 'Art. 104.',
                        Caput: {
                          '@id': 'art104_cpt',
                          p: 'A validade do negócio jurídico requer:',
                          Inciso: [
                            {
                              '@id': 'art104_cpt_inc1',
                              Rotulo: 'I –',
                              p: 'agente capaz;',
                            },
                            {
                              '@id': 'art104_cpt_inc2',
                              Rotulo: 'II –',
                              p: 'objeto lícito, possível, determinado ou determinável;',
                            },
                            {
                              '@id': 'art104_cpt_inc3',
                              Rotulo: 'III –',
                              p: 'forma prescrita ou não defesa em lei.',
                            },
                          ],
                        },
                      },
                      {
                        '@id': 'art105',
                        Rotulo: 'Art. 105.',
                        Caput: {
                          '@id': 'art105_cpt',
                          p:
                            'A incapacidade relativa de uma das partes não pode ser invocada pela outra em benefício próprio, nem aproveita aos co-interessados capazes, salvo se, neste caso, for indivisível o objeto do direito ou da obrigação comum.',
                        },
                      },
                      {
                        '@id': 'art106',
                        Rotulo: 'Art. 106.',
                        Caput: {
                          '@id': 'art106_cpt',
                          p:
                            'A impossibilidade inicial do objeto não invalida o negócio jurídico se for relativa, ou se cessar antes de realizada a condição a que ele estiver subordinado.',
                        },
                      },
                      {
                        '@id': 'art107',
                        Rotulo: 'Art. 107.',
                        Caput: {
                          '@id': 'art107_cpt',
                          p: 'A validade da declaração de vontade não dependerá de forma especial, senão quando a lei expressamente a exigir.',
                        },
                      },
                      {
                        '@id': 'art108',
                        Rotulo: 'Art. 108.',
                        Caput: {
                          '@id': 'art108_cpt',
                          p:
                            'Não dispondo a lei em contrário, a escritura pública é essencial à validade dos negócios jurídicos que visem à constituição, transferência, modificação ou renúncia de direitos reais sobre imóveis de valor superior a trinta vezes o maior salário mínimo vigente no País.',
                        },
                      },
                      {
                        '@id': 'art109',
                        Rotulo: 'Art. 109.',
                        Caput: {
                          '@id': 'art109_cpt',
                          p: 'No negócio jurídico celebrado com a cláusula de não valer sem instrumento público, este é da substância do ato.',
                        },
                      },
                      {
                        '@id': 'art110',
                        Rotulo: 'Art. 110.',
                        Caput: {
                          '@id': 'art110_cpt',
                          p:
                            'A manifestação de vontade subsiste ainda que o seu autor haja feito a reserva mental de não querer o que manifestou, salvo se dela o destinatário tinha conhecimento.',
                        },
                      },
                      {
                        '@id': 'art111',
                        Rotulo: 'Art. 111.',
                        Caput: {
                          '@id': 'art111_cpt',
                          p: 'O silêncio importa anuência, quando as circunstâncias ou os usos o autorizarem, e não for necessária a declaração de vontade expressa.',
                        },
                      },
                      {
                        '@id': 'art112',
                        Rotulo: 'Art. 112.',
                        Caput: {
                          '@id': 'art112_cpt',
                          p: 'Nas declarações de vontade se atenderá mais à intenção nelas consubstanciada do que ao sentido literal da linguagem.',
                        },
                      },
                      {
                        '@id': 'art113',
                        Rotulo: 'Art. 113.',
                        Caput: {
                          '@id': 'art113_cpt',
                          p: 'Os negócios jurídicos devem ser interpretados conforme a boa-fé e os usos do lugar de sua celebração.',
                        },
                      },
                      {
                        '@id': 'art114',
                        Rotulo: 'Art. 114.',
                        Caput: {
                          '@id': 'art114_cpt',
                          p: 'Os negócios jurídicos benéficos e a renúncia interpretam-se estritamente.',
                        },
                      },
                    ],
                  },
                  {
                    '@id': 'prt1_liv3_tit1_cap2',
                    Rotulo: 'CAPÍTULO II',
                    NomeAgrupador: 'Da Representação',
                    Artigo: [
                      {
                        '@id': 'art115',
                        Rotulo: 'Art. 115.',
                        Caput: {
                          '@id': 'art115_cpt',
                          p: 'Os poderes de representação conferem-se por lei ou pelo interessado.',
                        },
                      },
                      {
                        '@id': 'art116',
                        Rotulo: 'Art. 116.',
                        Caput: {
                          '@id': 'art116_cpt',
                          p: 'A manifestação de vontade pelo representante, nos limites de seus poderes, produz efeitos em relação ao representado.',
                        },
                      },
                      {
                        '@id': 'art117',
                        Rotulo: 'Art. 117.',
                        Caput: {
                          '@id': 'art117_cpt',
                          p:
                            'Salvo se o permitir a lei ou o representado, é anulável o negócio jurídico que o representante, no seu interesse ou por conta de outrem, celebrar consigo mesmo.',
                        },
                        Paragrafo: {
                          '@id': 'art117_par1u',
                          Rotulo: 'Parágrafo único.',
                          p: 'Para esse efeito, tem-se como celebrado pelo representante o negócio realizado por aquele em quem os poderes houverem sido subestabelecidos.',
                        },
                      },
                      {
                        '@id': 'art118',
                        Rotulo: 'Art. 118.',
                        Caput: {
                          '@id': 'art118_cpt',
                          p:
                            'O representante é obrigado a provar às pessoas, com quem tratar em nome do representado, a sua qualidade e a extensão de seus poderes, sob pena de, não o fazendo, responder pelos atos que a estes excederem.',
                        },
                      },
                      {
                        '@id': 'art119',
                        Rotulo: 'Art. 119.',
                        Caput: {
                          '@id': 'art119_cpt',
                          p:
                            'É anulável o negócio concluído pelo representante em conflito de interesses com o representado, se tal fato era ou devia ser do conhecimento de quem com aquele tratou.',
                        },
                        Paragrafo: {
                          '@id': 'art119_par1u',
                          Rotulo: 'Parágrafo único.',
                          p:
                            'É de cento e oitenta dias, a contar da conclusão do negócio ou da cessação da incapacidade, o prazo de decadência para pleitear-se a anulação prevista neste artigo.',
                        },
                      },
                      {
                        '@id': 'art120',
                        Rotulo: 'Art. 120.',
                        Caput: {
                          '@id': 'art120_cpt',
                          p:
                            'Os requisitos e os efeitos da representação legal são os estabelecidos nas normas respectivas; os da representação voluntária são os da Parte Especial deste Código.',
                        },
                      },
                    ],
                  },
                  {
                    '@id': 'prt1_liv3_tit1_cap3',
                    Rotulo: 'CAPÍTULO III',
                    NomeAgrupador: 'Da Condição, do Termo e do Encargo',
                    Artigo: [
                      {
                        '@id': 'art121',
                        Rotulo: 'Art. 121.',
                        Caput: {
                          '@id': 'art121_cpt',
                          p:
                            'Considera-se condição a cláusula que, derivando exclusivamente da vontade das partes, subordina o efeito do negócio jurídico a evento futuro e incerto.',
                        },
                      },
                      {
                        '@id': 'art122',
                        Rotulo: 'Art. 122.',
                        Caput: {
                          '@id': 'art122_cpt',
                          p:
                            'São lícitas, em geral, todas as condições não contrárias à lei, à ordem pública ou aos bons costumes; entre as condições defesas se incluem as que privarem de todo efeito o negócio jurídico, ou o sujeitarem ao puro arbítrio de uma das partes.',
                        },
                      },
                      {
                        '@id': 'art123',
                        Rotulo: 'Art. 123.',
                        Caput: {
                          '@id': 'art123_cpt',
                          p: 'Invalidam os negócios jurídicos que lhes são subordinados:',
                          Inciso: [
                            {
                              '@id': 'art123_cpt_inc1',
                              Rotulo: 'I –',
                              p: 'as condições física ou juridicamente impossíveis, quando suspensivas;',
                            },
                            {
                              '@id': 'art123_cpt_inc2',
                              Rotulo: 'II –',
                              p: 'as condições ilícitas, ou de fazer coisa ilícita;',
                            },
                            {
                              '@id': 'art123_cpt_inc3',
                              Rotulo: 'III –',
                              p: 'as condições incompreensíveis ou contraditórias.',
                            },
                          ],
                        },
                      },
                      {
                        '@id': 'art124',
                        Rotulo: 'Art. 124.',
                        Caput: {
                          '@id': 'art124_cpt',
                          p: 'Têm-se por inexistentes as condições impossíveis, quando resolutivas, e as de não fazer coisa impossível.',
                        },
                      },
                      {
                        '@id': 'art125',
                        Rotulo: 'Art. 125.',
                        Caput: {
                          '@id': 'art125_cpt',
                          p:
                            'Subordinando-se a eficácia do negócio jurídico à condição suspensiva, enquanto esta se não verificar, não se terá adquirido o direito, a que ele visa.',
                        },
                      },
                      {
                        '@id': 'art126',
                        Rotulo: 'Art. 126.',
                        Caput: {
                          '@id': 'art126_cpt',
                          p:
                            'Se alguém dispuser de uma coisa sob condição suspensiva, e, pendente esta, fizer quanto àquela novas disposições, estas não terão valor, realizada a condição, se com ela forem incompatíveis.',
                        },
                      },
                      {
                        '@id': 'art127',
                        Rotulo: 'Art. 127.',
                        Caput: {
                          '@id': 'art127_cpt',
                          p:
                            'Se for resolutiva a condição, enquanto esta se não realizar, vigorará o negócio jurídico, podendo exercer-se desde a conclusão deste o direito por ele estabelecido.',
                        },
                      },
                      {
                        '@id': 'art128',
                        Rotulo: 'Art. 128.',
                        Caput: {
                          '@id': 'art128_cpt',
                          p:
                            'Sobrevindo a condição resolutiva, extingue-se, para todos os efeitos, o direito a que ela se opõe; mas, se aposta a um negócio de execução continuada ou periódica, a sua realização, salvo disposição em contrário, não tem eficácia quanto aos atos já praticados, desde que compatíveis com a natureza da condição pendente e conforme aos ditames de boa-fé.',
                        },
                      },
                      {
                        '@id': 'art129',
                        Rotulo: 'Art. 129.',
                        Caput: {
                          '@id': 'art129_cpt',
                          p:
                            'Reputa-se verificada, quanto aos efeitos jurídicos, a condição cujo implemento for maliciosamente obstado pela parte a quem desfavorecer, considerando-se, ao contrário, não verificada a condição maliciosamente levada a efeito por aquele a quem aproveita o seu implemento.',
                        },
                      },
                      {
                        '@id': 'art130',
                        Rotulo: 'Art. 130.',
                        Caput: {
                          '@id': 'art130_cpt',
                          p: 'Ao titular do direito eventual, nos casos de condição suspensiva ou resolutiva, é permitido praticar os atos destinados a conservá-lo.',
                        },
                      },
                      {
                        '@id': 'art131',
                        Rotulo: 'Art. 131.',
                        Caput: {
                          '@id': 'art131_cpt',
                          p: 'O termo inicial suspende o exercício, mas não a aquisição do direito.',
                        },
                      },
                      {
                        '@id': 'art132',
                        Rotulo: 'Art. 132.',
                        Caput: {
                          '@id': 'art132_cpt',
                          p: 'Salvo disposição legal ou convencional em contrário, computam-se os prazos, excluído o dia do começo, e incluído o do vencimento.',
                        },
                        Paragrafo: [
                          {
                            '@id': 'art132_par1',
                            Rotulo: '§ 1º',
                            p: 'Se o dia do vencimento cair em feriado, considerar-se-á prorrogado o prazo até o seguinte dia útil.',
                          },
                          {
                            '@id': 'art132_par2',
                            Rotulo: '§ 2º',
                            p: 'Meado considera-se, em qualquer mês, o seu décimo quinto dia.',
                          },
                          {
                            '@id': 'art132_par3',
                            Rotulo: '§ 3º',
                            p: 'Os prazos de meses e anos expiram no dia de igual número do de início, ou no imediato, se faltar exata correspondência.',
                          },
                          {
                            '@id': 'art132_par4',
                            Rotulo: '§ 4º',
                            p: 'Os prazos fixados por hora contar-se-ão de minuto a minuto.',
                          },
                        ],
                      },
                      {
                        '@id': 'art133',
                        Rotulo: 'Art. 133.',
                        Caput: {
                          '@id': 'art133_cpt',
                          p:
                            'Nos testamentos, presume-se o prazo em favor do herdeiro, e, nos contratos, em proveito do devedor, salvo, quanto a esses, se do teor do instrumento, ou das circunstâncias, resultar que se estabeleceu a benefício do credor, ou de ambos os contratantes.',
                        },
                      },
                      {
                        '@id': 'art134',
                        Rotulo: 'Art. 134.',
                        Caput: {
                          '@id': 'art134_cpt',
                          p:
                            'Os negócios jurídicos entre vivos, sem prazo, são exeqüíveis desde logo, salvo se a execução tiver de ser feita em lugar diverso ou depender de tempo.',
                        },
                      },
                      {
                        '@id': 'art135',
                        Rotulo: 'Art. 135.',
                        Caput: {
                          '@id': 'art135_cpt',
                          p: 'Ao termo inicial e final aplicam-se, no que couber, as disposições relativas à condição suspensiva e resolutiva.',
                        },
                      },
                      {
                        '@id': 'art136',
                        Rotulo: 'Art. 136.',
                        Caput: {
                          '@id': 'art136_cpt',
                          p:
                            'O encargo não suspende a aquisição nem o exercício do direito, salvo quando expressamente imposto no negócio jurídico, pelo disponente, como condição suspensiva.',
                        },
                      },
                      {
                        '@id': 'art137',
                        Rotulo: 'Art. 137.',
                        Caput: {
                          '@id': 'art137_cpt',
                          p:
                            'Considera-se não escrito o encargo ilícito ou impossível, salvo se constituir o motivo determinante da liberalidade, caso em que se invalida o negócio jurídico.',
                        },
                      },
                    ],
                  },
                  {
                    '@id': 'prt1_liv3_tit1_cap4',
                    Rotulo: 'CAPÍTULO IV',
                    NomeAgrupador: 'Dos Defeitos do Negócio Jurídico',
                    Secao: [
                      {
                        '@id': 'prt1_liv3_tit1_cap4_sec1',
                        Rotulo: 'Seção I',
                        NomeAgrupador: 'Do Erro ou Ignorância',
                        Artigo: [
                          {
                            '@id': 'art138',
                            Rotulo: 'Art. 138.',
                            Caput: {
                              '@id': 'art138_cpt',
                              p:
                                'São anuláveis os negócios jurídicos, quando as declarações de vontade emanarem de erro substancial que poderia ser percebido por pessoa de diligência normal, em face das circunstâncias do negócio.',
                            },
                          },
                          {
                            '@id': 'art139',
                            Rotulo: 'Art. 139.',
                            Caput: {
                              '@id': 'art139_cpt',
                              p: 'O erro é substancial quando:',
                              Inciso: [
                                {
                                  '@id': 'art139_cpt_inc1',
                                  Rotulo: 'I –',
                                  p: 'interessa à natureza do negócio, ao objeto principal da declaração, ou a alguma das qualidades a ele essenciais;',
                                },
                                {
                                  '@id': 'art139_cpt_inc2',
                                  Rotulo: 'II –',
                                  p:
                                    'concerne à identidade ou à qualidade essencial da pessoa a quem se refira a declaração de vontade, desde que tenha influído nesta de modo relevante;',
                                },
                                {
                                  '@id': 'art139_cpt_inc3',
                                  Rotulo: 'III –',
                                  p: 'sendo de direito e não implicando recusa à aplicação da lei, for o motivo único ou principal do negócio jurídico.',
                                },
                              ],
                            },
                          },
                          {
                            '@id': 'art140',
                            Rotulo: 'Art. 140.',
                            Caput: {
                              '@id': 'art140_cpt',
                              p: 'O falso motivo só vicia a declaração de vontade quando expresso como razão determinante.',
                            },
                          },
                          {
                            '@id': 'art141',
                            Rotulo: 'Art. 141.',
                            Caput: {
                              '@id': 'art141_cpt',
                              p: 'A transmissão errônea da vontade por meios interpostos é anulável nos mesmos casos em que o é a declaração direta.',
                            },
                          },
                          {
                            '@id': 'art142',
                            Rotulo: 'Art. 142.',
                            Caput: {
                              '@id': 'art142_cpt',
                              p:
                                'O erro de indicação da pessoa ou da coisa, a que se referir a declaração de vontade, não viciará o negócio quando, por seu contexto e pelas circunstâncias, se puder identificar a coisa ou pessoa cogitada.',
                            },
                          },
                          {
                            '@id': 'art143',
                            Rotulo: 'Art. 143.',
                            Caput: {
                              '@id': 'art143_cpt',
                              p: 'O erro de cálculo apenas autoriza a retificação da declaração de vontade.',
                            },
                          },
                          {
                            '@id': 'art144',
                            Rotulo: 'Art. 144.',
                            Caput: {
                              '@id': 'art144_cpt',
                              p:
                                'O erro não prejudica a validade do negócio jurídico quando a pessoa, a quem a manifestação de vontade se dirige, se oferecer para executá-la na conformidade da vontade real do manifestante.',
                            },
                          },
                        ],
                      },
                      {
                        '@id': 'prt1_liv3_tit1_cap4_sec2',
                        Rotulo: 'Seção II',
                        NomeAgrupador: 'Do Dolo',
                        Artigo: [
                          {
                            '@id': 'art145',
                            Rotulo: 'Art. 145.',
                            Caput: {
                              '@id': 'art145_cpt',
                              p: 'São os negócios jurídicos anuláveis por dolo, quando este for a sua causa.',
                            },
                          },
                          {
                            '@id': 'art146',
                            Rotulo: 'Art. 146.',
                            Caput: {
                              '@id': 'art146_cpt',
                              p:
                                'O dolo acidental só obriga à satisfação das perdas e danos, e é acidental quando, a seu despeito, o negócio seria realizado, embora por outro modo.',
                            },
                          },
                          {
                            '@id': 'art147',
                            Rotulo: 'Art. 147.',
                            Caput: {
                              '@id': 'art147_cpt',
                              p:
                                'Nos negócios jurídicos bilaterais, o silêncio intencional de uma das partes a respeito de fato ou qualidade que a outra parte haja ignorado, constitui omissão dolosa, provando-se que sem ela o negócio não se teria celebrado.',
                            },
                          },
                          {
                            '@id': 'art148',
                            Rotulo: 'Art. 148.',
                            Caput: {
                              '@id': 'art148_cpt',
                              p:
                                'Pode também ser anulado o negócio jurídico por dolo de terceiro, se a parte a quem aproveite dele tivesse ou devesse ter conhecimento; em caso contrário, ainda que subsista o negócio jurídico, o terceiro responderá por todas as perdas e danos da parte a quem ludibriou.',
                            },
                          },
                          {
                            '@id': 'art149',
                            Rotulo: 'Art. 149.',
                            Caput: {
                              '@id': 'art149_cpt',
                              p:
                                'O dolo do representante legal de uma das partes só obriga o representado a responder civilmente até a importância do proveito que teve; se, porém, o dolo for do representante convencional, o representado responderá solidariamente com ele por perdas e danos.',
                            },
                          },
                          {
                            '@id': 'art150',
                            Rotulo: 'Art. 150.',
                            Caput: {
                              '@id': 'art150_cpt',
                              p: 'Se ambas as partes procederem com dolo, nenhuma pode alegá-lo para anular o negócio, ou reclamar indenização.',
                            },
                          },
                        ],
                      },
                      {
                        '@id': 'prt1_liv3_tit1_cap4_sec3',
                        Rotulo: 'Seção III',
                        NomeAgrupador: 'Da Coação',
                        Artigo: [
                          {
                            '@id': 'art151',
                            Rotulo: 'Art. 151.',
                            Caput: {
                              '@id': 'art151_cpt',
                              p:
                                'A coação, para viciar a declaração da vontade, há de ser tal que incuta ao paciente fundado temor de dano iminente e considerável à sua pessoa, à sua família, ou aos seus bens.',
                            },
                            Paragrafo: {
                              '@id': 'art151_par1u',
                              Rotulo: 'Parágrafo único.',
                              p: 'Se disser respeito a pessoa não pertencente à família do paciente, o juiz, com base nas circunstâncias, decidirá se houve coação.',
                            },
                          },
                          {
                            '@id': 'art152',
                            Rotulo: 'Art. 152.',
                            Caput: {
                              '@id': 'art152_cpt',
                              p:
                                'No apreciar a coação, ter-se-ão em conta o sexo, a idade, a condição, a saúde, o temperamento do paciente e todas as demais circunstâncias que possam influir na gravidade dela.',
                            },
                          },
                          {
                            '@id': 'art153',
                            Rotulo: 'Art. 153.',
                            Caput: {
                              '@id': 'art153_cpt',
                              p: 'Não se considera coação a ameaça do exercício normal de um direito, nem o simples temor reverencial.',
                            },
                          },
                          {
                            '@id': 'art154',
                            Rotulo: 'Art. 154.',
                            Caput: {
                              '@id': 'art154_cpt',
                              p:
                                'Vicia o negócio jurídico a coação exercida por terceiro, se dela tivesse ou devesse ter conhecimento a parte a que aproveite, e esta responderá solidariamente com aquele por perdas e danos.',
                            },
                          },
                          {
                            '@id': 'art155',
                            Rotulo: 'Art. 155.',
                            Caput: {
                              '@id': 'art155_cpt',
                              p:
                                'Subsistirá o negócio jurídico, se a coação decorrer de terceiro, sem que a parte a que aproveite dela tivesse ou devesse ter conhecimento; mas o autor da coação responderá por todas as perdas e danos que houver causado ao coacto.',
                            },
                          },
                        ],
                      },
                      {
                        '@id': 'prt1_liv3_tit1_cap4_sec4',
                        Rotulo: 'Seção IV',
                        NomeAgrupador: 'Do Estado de Perigo',
                        Artigo: {
                          '@id': 'art156',
                          Rotulo: 'Art. 156.',
                          Caput: {
                            '@id': 'art156_cpt',
                            p:
                              'Configura-se o estado de perigo quando alguém, premido da necessidade de salvar-se, ou a pessoa de sua família, de grave dano conhecido pela outra parte, assume obrigação excessivamente onerosa.',
                          },
                          Paragrafo: {
                            '@id': 'art156_par1u',
                            Rotulo: 'Parágrafo único.',
                            p: 'Tratando-se de pessoa não pertencente à família do declarante, o juiz decidirá segundo as circunstâncias.',
                          },
                        },
                      },
                      {
                        '@id': 'prt1_liv3_tit1_cap4_sec5',
                        Rotulo: 'Seção V',
                        NomeAgrupador: 'Da Lesão',
                        Artigo: {
                          '@id': 'art157',
                          Rotulo: 'Art. 157.',
                          Caput: {
                            '@id': 'art157_cpt',
                            p:
                              'Ocorre a lesão quando uma pessoa, sob premente necessidade, ou por inexperiência, se obriga a prestação manifestamente desproporcional ao valor da prestação oposta.',
                          },
                          Paragrafo: [
                            {
                              '@id': 'art157_par1',
                              Rotulo: '§ 1º',
                              p: 'Aprecia-se a desproporção das prestações segundo os valores vigentes ao tempo em que foi celebrado o negócio jurídico.',
                            },
                            {
                              '@id': 'art157_par2',
                              Rotulo: '§ 2º',
                              p: 'Não se decretará a anulação do negócio, se for oferecido suplemento suficiente, ou se a parte favorecida concordar com a redução do proveito.',
                            },
                          ],
                        },
                      },
                      {
                        '@id': 'prt1_liv3_tit1_cap4_sec6',
                        Rotulo: 'Seção VI',
                        NomeAgrupador: 'Da Fraude Contra Credores',
                        Artigo: [
                          {
                            '@id': 'art158',
                            Rotulo: 'Art. 158.',
                            Caput: {
                              '@id': 'art158_cpt',
                              p:
                                'Os negócios de transmissão gratuita de bens ou remissão de dívida, se os praticar o devedor já insolvente, ou por eles reduzido à insolvência, ainda quando o ignore, poderão ser anulados pelos credores quirografários, como lesivos dos seus direitos.',
                            },
                            Paragrafo: [
                              {
                                '@id': 'art158_par1',
                                Rotulo: '§ 1º',
                                p: 'Igual direito assiste aos credores cuja garantia se tornar insuficiente.',
                              },
                              {
                                '@id': 'art158_par2',
                                Rotulo: '§ 2º',
                                p: 'Só os credores que já o eram ao tempo daqueles atos podem pleitear a anulação deles.',
                              },
                            ],
                          },
                          {
                            '@id': 'art159',
                            Rotulo: 'Art. 159.',
                            Caput: {
                              '@id': 'art159_cpt',
                              p:
                                'Serão igualmente anuláveis os contratos onerosos do devedor insolvente, quando a insolvência for notória, ou houver motivo para ser conhecida do outro contratante.',
                            },
                          },
                          {
                            '@id': 'art160',
                            Rotulo: 'Art. 160.',
                            Caput: {
                              '@id': 'art160_cpt',
                              p:
                                'Se o adquirente dos bens do devedor insolvente ainda não tiver pago o preço e este for, aproximadamente, o corrente, desobrigar-se-á depositando-o em juízo, com a citação de todos os interessados.',
                            },
                            Paragrafo: {
                              '@id': 'art160_par1u',
                              Rotulo: 'Parágrafo único.',
                              p: 'Se inferior, o adquirente, para conservar os bens, poderá depositar o preço que lhes corresponda ao valor real.',
                            },
                          },
                          {
                            '@id': 'art161',
                            Rotulo: 'Art. 161.',
                            Caput: {
                              '@id': 'art161_cpt',
                              p:
                                'A ação, nos casos dos arts. 158 e 159, poderá ser intentada contra o devedor insolvente, a pessoa que com ele celebrou a estipulação considerada fraudulenta, ou terceiros adquirentes que hajam procedido de má-fé.',
                            },
                          },
                          {
                            '@id': 'art162',
                            Rotulo: 'Art. 162.',
                            Caput: {
                              '@id': 'art162_cpt',
                              p:
                                'O credor quirografário, que receber do devedor insolvente o pagamento da dívida ainda não vencida, ficará obrigado a repor, em proveito do acervo sobre que se tenha de efetuar o concurso de credores, aquilo que recebeu.',
                            },
                          },
                          {
                            '@id': 'art163',
                            Rotulo: 'Art. 163.',
                            Caput: {
                              '@id': 'art163_cpt',
                              p: 'Presumem-se fraudatórias dos direitos dos outros credores as garantias de dívidas que o devedor insolvente tiver dado a algum credor.',
                            },
                          },
                          {
                            '@id': 'art164',
                            Rotulo: 'Art. 164.',
                            Caput: {
                              '@id': 'art164_cpt',
                              p:
                                'Presumem-se, porém, de boa-fé e valem os negócios ordinários indispensáveis à manutenção de estabelecimento mercantil, rural, ou industrial, ou à subsistência do devedor e de sua família.',
                            },
                          },
                          {
                            '@id': 'art165',
                            Rotulo: 'Art. 165.',
                            Caput: {
                              '@id': 'art165_cpt',
                              p: 'Anulados os negócios fraudulentos, a vantagem resultante reverterá em proveito do acervo sobre que se tenha de efetuar o concurso de credores.',
                            },
                            Paragrafo: {
                              '@id': 'art165_par1u',
                              Rotulo: 'Parágrafo único.',
                              p:
                                'Se esses negócios tinham por único objeto atribuir direitos preferenciais, mediante hipoteca, penhor ou anticrese, sua invalidade importará somente na anulação da preferência ajustada.',
                            },
                          },
                        ],
                      },
                    ],
                  },
                  {
                    '@id': 'prt1_liv3_tit1_cap5',
                    Rotulo: 'CAPÍTULO V',
                    NomeAgrupador: 'Da Invalidade do Negócio Jurídico',
                    Artigo: [
                      {
                        '@id': 'art166',
                        Rotulo: 'Art. 166.',
                        Caput: {
                          '@id': 'art166_cpt',
                          p: 'É nulo o negócio jurídico quando:',
                          Inciso: [
                            {
                              '@id': 'art166_cpt_inc1',
                              Rotulo: 'I –',
                              p: 'celebrado por pessoa absolutamente incapaz;',
                            },
                            {
                              '@id': 'art166_cpt_inc2',
                              Rotulo: 'II –',
                              p: 'for ilícito, impossível ou indeterminável o seu objeto;',
                            },
                            {
                              '@id': 'art166_cpt_inc3',
                              Rotulo: 'III –',
                              p: 'o motivo determinante, comum a ambas as partes, for ilícito;',
                            },
                            {
                              '@id': 'art166_cpt_inc4',
                              Rotulo: 'IV –',
                              p: 'não revestir a forma prescrita em lei;',
                            },
                            {
                              '@id': 'art166_cpt_inc5',
                              Rotulo: 'V –',
                              p: 'for preterida alguma solenidade que a lei considere essencial para a sua validade;',
                            },
                            {
                              '@id': 'art166_cpt_inc6',
                              Rotulo: 'VI –',
                              p: 'tiver por objetivo fraudar lei imperativa;',
                            },
                            {
                              '@id': 'art166_cpt_inc7',
                              Rotulo: 'VII –',
                              p: 'a lei taxativamente o declarar nulo, ou proibir-lhe a prática, sem cominar sanção.',
                            },
                          ],
                        },
                      },
                      {
                        '@id': 'art167',
                        Rotulo: 'Art. 167.',
                        Caput: {
                          '@id': 'art167_cpt',
                          p: 'É nulo o negócio jurídico simulado, mas subsistirá o que se dissimulou, se válido for na substância e na forma.',
                        },
                        Paragrafo: [
                          {
                            '@id': 'art167_par1',
                            Rotulo: '§ 1º',
                            p: 'Haverá simulação nos negócios jurídicos quando:',
                            Inciso: [
                              {
                                '@id': 'art167_par1_inc1',
                                Rotulo: 'I –',
                                p: 'aparentarem conferir ou transmitir direitos a pessoas diversas daquelas às quais realmente se conferem, ou transmitem;',
                              },
                              {
                                '@id': 'art167_par1_inc2',
                                Rotulo: 'II –',
                                p: 'contiverem declaração, confissão, condição ou cláusula não verdadeira;',
                              },
                              {
                                '@id': 'art167_par1_inc3',
                                Rotulo: 'III –',
                                p: 'os instrumentos particulares forem antedatados, ou pós-datados.',
                              },
                            ],
                          },
                          {
                            '@id': 'art167_par2',
                            Rotulo: '§ 2º',
                            p: 'Ressalvam-se os direitos de terceiros de boa-fé em face dos contraentes do negócio jurídico simulado.',
                          },
                        ],
                      },
                      {
                        '@id': 'art168',
                        Rotulo: 'Art. 168.',
                        Caput: {
                          '@id': 'art168_cpt',
                          p: 'As nulidades dos artigos antecedentes podem ser alegadas por qualquer interessado, ou pelo Ministério Público, quando lhe couber intervir.',
                        },
                        Paragrafo: {
                          '@id': 'art168_par1u',
                          Rotulo: 'Parágrafo único.',
                          p:
                            'As nulidades devem ser pronunciadas pelo juiz, quando conhecer do negócio jurídico ou dos seus efeitos e as encontrar provadas, não lhe sendo permitido supri-las, ainda que a requerimento das partes.',
                        },
                      },
                      {
                        '@id': 'art169',
                        Rotulo: 'Art. 169.',
                        Caput: {
                          '@id': 'art169_cpt',
                          p: 'O negócio jurídico nulo não é suscetível de confirmação, nem convalesce pelo decurso do tempo.',
                        },
                      },
                      {
                        '@id': 'art170',
                        Rotulo: 'Art. 170.',
                        Caput: {
                          '@id': 'art170_cpt',
                          p:
                            'Se, porém, o negócio jurídico nulo contiver os requisitos de outro, subsistirá este quando o fim a que visavam as partes permitir supor que o teriam querido, se houvessem previsto a nulidade.',
                        },
                      },
                      {
                        '@id': 'art171',
                        Rotulo: 'Art. 171.',
                        Caput: {
                          '@id': 'art171_cpt',
                          p: 'Além dos casos expressamente declarados na lei, é anulável o negócio jurídico:',
                          Inciso: [
                            {
                              '@id': 'art171_cpt_inc1',
                              Rotulo: 'I –',
                              p: 'por incapacidade relativa do agente;',
                            },
                            {
                              '@id': 'art171_cpt_inc2',
                              Rotulo: 'II –',
                              p: 'por vício resultante de erro, dolo, coação, estado de perigo, lesão ou fraude contra credores.',
                            },
                          ],
                        },
                      },
                      {
                        '@id': 'art172',
                        Rotulo: 'Art. 172.',
                        Caput: {
                          '@id': 'art172_cpt',
                          p: 'O negócio anulável pode ser confirmado pelas partes, salvo direito de terceiro.',
                        },
                      },
                      {
                        '@id': 'art173',
                        Rotulo: 'Art. 173.',
                        Caput: {
                          '@id': 'art173_cpt',
                          p: 'O ato de confirmação deve conter a substância do negócio celebrado e a vontade expressa de mantê-lo.',
                        },
                      },
                      {
                        '@id': 'art174',
                        Rotulo: 'Art. 174.',
                        Caput: {
                          '@id': 'art174_cpt',
                          p: 'É escusada a confirmação expressa, quando o negócio já foi cumprido em parte pelo devedor, ciente do vício que o inquinava.',
                        },
                      },
                      {
                        '@id': 'art175',
                        Rotulo: 'Art. 175.',
                        Caput: {
                          '@id': 'art175_cpt',
                          p:
                            'A confirmação expressa, ou a execução voluntária de negócio anulável, nos termos dos arts. 172 a 174, importa a extinção de todas as ações, ou exceções, de que contra ele dispusesse o devedor.',
                        },
                      },
                      {
                        '@id': 'art176',
                        Rotulo: 'Art. 176.',
                        Caput: {
                          '@id': 'art176_cpt',
                          p: 'Quando a anulabilidade do ato resultar da falta de autorização de terceiro, será validado se este a der posteriormente.',
                        },
                      },
                      {
                        '@id': 'art177',
                        Rotulo: 'Art. 177.',
                        Caput: {
                          '@id': 'art177_cpt',
                          p:
                            'A anulabilidade não tem efeito antes de julgada por sentença, nem se pronuncia de ofício; só os interessados a podem alegar, e aproveita exclusivamente aos que a alegarem, salvo o caso de solidariedade ou indivisibilidade.',
                        },
                      },
                      {
                        '@id': 'art178',
                        Rotulo: 'Art. 178.',
                        Caput: {
                          '@id': 'art178_cpt',
                          p: 'É de quatro anos o prazo de decadência para pleitear-se a anulação do negócio jurídico, contado:',
                          Inciso: [
                            {
                              '@id': 'art178_cpt_inc1',
                              Rotulo: 'I –',
                              p: 'no caso de coação, do dia em que ela cessar;',
                            },
                            {
                              '@id': 'art178_cpt_inc2',
                              Rotulo: 'II –',
                              p: 'no de erro, dolo, fraude contra credores, estado de perigo ou lesão, do dia em que se realizou o negócio jurídico;',
                            },
                            {
                              '@id': 'art178_cpt_inc3',
                              Rotulo: 'III –',
                              p: 'no de atos de incapazes, do dia em que cessar a incapacidade.',
                            },
                          ],
                        },
                      },
                      {
                        '@id': 'art179',
                        Rotulo: 'Art. 179.',
                        Caput: {
                          '@id': 'art179_cpt',
                          p:
                            'Quando a lei dispuser que determinado ato é anulável, sem estabelecer prazo para pleitear-se a anulação, será este de dois anos, a contar da data da conclusão do ato.',
                        },
                      },
                      {
                        '@id': 'art180',
                        Rotulo: 'Art. 180.',
                        Caput: {
                          '@id': 'art180_cpt',
                          p:
                            'O menor, entre dezesseis e dezoito anos, não pode, para eximir-se de uma obrigação, invocar a sua idade se dolosamente a ocultou quando inquirido pela outra parte, ou se, no ato de obrigar-se, declarou-se maior.',
                        },
                      },
                      {
                        '@id': 'art181',
                        Rotulo: 'Art. 181.',
                        Caput: {
                          '@id': 'art181_cpt',
                          p: 'Ninguém pode reclamar o que, por uma obrigação anulada, pagou a um incapaz, se não provar que reverteu em proveito dele a importância paga.',
                        },
                      },
                      {
                        '@id': 'art182',
                        Rotulo: 'Art. 182.',
                        Caput: {
                          '@id': 'art182_cpt',
                          p:
                            'Anulado o negócio jurídico, restituir-se-ão as partes ao estado em que antes dele se achavam, e, não sendo possível restituí-las, serão indenizadas com o equivalente.',
                        },
                      },
                      {
                        '@id': 'art183',
                        Rotulo: 'Art. 183.',
                        Caput: {
                          '@id': 'art183_cpt',
                          p: 'A invalidade do instrumento não induz a do negócio jurídico sempre que este puder provar-se por outro meio.',
                        },
                      },
                      {
                        '@id': 'art184',
                        Rotulo: 'Art. 184.',
                        Caput: {
                          '@id': 'art184_cpt',
                          p:
                            'Respeitada a intenção das partes, a invalidade parcial de um negócio jurídico não o prejudicará na parte válida, se esta for separável; a invalidade da obrigação principal implica a das obrigações acessórias, mas a destas não induz a da obrigação principal.',
                        },
                      },
                    ],
                  },
                ],
              },
              {
                '@id': 'prt1_liv3_tit2',
                Rotulo: 'TÍTULO II',
                NomeAgrupador: 'Dos Atos Jurídicos Lícitos',
                Artigo: {
                  '@id': 'art185',
                  Rotulo: 'Art. 185.',
                  Caput: {
                    '@id': 'art185_cpt',
                    p: 'Aos atos jurídicos lícitos, que não sejam negócios jurídicos, aplicam-se, no que couber, as disposições do Título anterior.',
                  },
                },
              },
              {
                '@id': 'prt1_liv3_tit3',
                Rotulo: 'TÍTULO III',
                NomeAgrupador: 'Dos Atos Ilícitos',
                Artigo: [
                  {
                    '@id': 'art186',
                    Rotulo: 'Art. 186.',
                    Caput: {
                      '@id': 'art186_cpt',
                      p:
                        'Aquele que, por ação ou omissão voluntária, negligência ou imprudência, violar direito e causar dano a outrem, ainda que exclusivamente moral, comete ato ilícito.',
                    },
                  },
                  {
                    '@id': 'art187',
                    Rotulo: 'Art. 187.',
                    Caput: {
                      '@id': 'art187_cpt',
                      p:
                        'Também comete ato ilícito o titular de um direito que, ao exercê-lo, excede manifestamente os limites impostos pelo seu fim econômico ou social, pela boa-fé ou pelos bons costumes.',
                    },
                  },
                  {
                    '@id': 'art188',
                    Rotulo: 'Art. 188.',
                    Caput: {
                      '@id': 'art188_cpt',
                      p: 'Não constituem atos ilícitos:',
                      Inciso: [
                        {
                          '@id': 'art188_cpt_inc1',
                          Rotulo: 'I –',
                          p: 'os praticados em legítima defesa ou no exercício regular de um direito reconhecido;',
                        },
                        {
                          '@id': 'art188_cpt_inc2',
                          Rotulo: 'II –',
                          p: 'a deterioração ou destruição da coisa alheia, ou a lesão a pessoa, a fim de remover perigo iminente.',
                        },
                      ],
                    },
                    Paragrafo: {
                      '@id': 'art188_par1u',
                      Rotulo: 'Parágrafo único.',
                      p:
                        'No caso do inciso II, o ato será legítimo somente quando as circunstâncias o tornarem absolutamente necessário, não excedendo os limites do indispensável para a remoção do perigo.',
                    },
                  },
                ],
              },
              {
                '@id': 'prt1_liv3_tit4',
                Rotulo: 'TÍTULO IV',
                NomeAgrupador: 'Da Prescrição e da Decadência',
                Capitulo: [
                  {
                    '@id': 'prt1_liv3_tit4_cap1',
                    Rotulo: 'CAPÍTULO I',
                    NomeAgrupador: 'Da Prescrição',
                    Secao: [
                      {
                        '@id': 'prt1_liv3_tit4_cap1_sec1',
                        Rotulo: 'Seção I',
                        NomeAgrupador: 'Disposições Gerais',
                        Artigo: [
                          {
                            '@id': 'art189',
                            Rotulo: 'Art. 189.',
                            Caput: {
                              '@id': 'art189_cpt',
                              p: 'Violado o direito, nasce para o titular a pretensão, a qual se extingue, pela prescrição, nos prazos a que aludem os arts. 205 e 206.',
                            },
                          },
                          {
                            '@id': 'art190',
                            Rotulo: 'Art. 190.',
                            Caput: {
                              '@id': 'art190_cpt',
                              p: 'A exceção prescreve no mesmo prazo em que a pretensão.',
                            },
                          },
                          {
                            '@id': 'art191',
                            Rotulo: 'Art. 191.',
                            Caput: {
                              '@id': 'art191_cpt',
                              p:
                                'A renúncia da prescrição pode ser expressa ou tácita, e só valerá, sendo feita, sem prejuízo de terceiro, depois que a prescrição se consumar; tácita é a renúncia quando se presume de fatos do interessado, incompatíveis com a prescrição.',
                            },
                          },
                          {
                            '@id': 'art192',
                            Rotulo: 'Art. 192.',
                            Caput: {
                              '@id': 'art192_cpt',
                              p: 'Os prazos de prescrição não podem ser alterados por acordo das partes.',
                            },
                          },
                          {
                            '@id': 'art193',
                            Rotulo: 'Art. 193.',
                            Caput: {
                              '@id': 'art193_cpt',
                              p: 'A prescrição pode ser alegada em qualquer grau de jurisdição, pela parte a quem aproveita.',
                            },
                          },
                          {
                            '@id': 'art194',
                            Rotulo: 'Art. 194.',
                            Caput: {
                              '@id': 'art194_cpt',
                              p: 'O juiz não pode suprir, de ofício, a alegação de prescrição, salvo se favorecer a absolutamente incapaz.',
                            },
                          },
                          {
                            '@id': 'art195',
                            Rotulo: 'Art. 195.',
                            Caput: {
                              '@id': 'art195_cpt',
                              p:
                                'Os relativamente incapazes e as pessoas jurídicas têm ação contra os seus assistentes ou representantes legais, que derem causa à prescrição, ou não a alegarem oportunamente.',
                            },
                          },
                          {
                            '@id': 'art196',
                            Rotulo: 'Art. 196.',
                            Caput: {
                              '@id': 'art196_cpt',
                              p: 'A prescrição iniciada contra uma pessoa continua a correr contra o seu sucessor.',
                            },
                          },
                        ],
                      },
                      {
                        '@id': 'prt1_liv3_tit4_cap1_sec2',
                        Rotulo: 'Seção II',
                        NomeAgrupador: 'Das Causas que Impedem ou Suspendem a Prescrição',
                        Artigo: [
                          {
                            '@id': 'art197',
                            Rotulo: 'Art. 197.',
                            Caput: {
                              '@id': 'art197_cpt',
                              p: 'Não corre a prescrição:',
                              Inciso: [
                                {
                                  '@id': 'art197_cpt_inc1',
                                  Rotulo: 'I –',
                                  p: 'entre os cônjuges, na constância da sociedade conjugal;',
                                },
                                {
                                  '@id': 'art197_cpt_inc2',
                                  Rotulo: 'II –',
                                  p: 'entre ascendentes e descendentes, durante o poder familiar;',
                                },
                                {
                                  '@id': 'art197_cpt_inc3',
                                  Rotulo: 'III –',
                                  p: 'entre tutelados ou curatelados e seus tutores ou curadores, durante a tutela ou curatela.',
                                },
                              ],
                            },
                          },
                          {
                            '@id': 'art198',
                            Rotulo: 'Art. 198.',
                            Caput: {
                              '@id': 'art198_cpt',
                              p: 'Também não corre a prescrição:',
                              Inciso: [
                                {
                                  '@id': 'art198_cpt_inc1',
                                  Rotulo: 'I –',
                                  p: 'contra os incapazes de que trata o art. 3º;',
                                },
                                {
                                  '@id': 'art198_cpt_inc2',
                                  Rotulo: 'II –',
                                  p: 'contra os ausentes do País em serviço público da União, dos Estados ou dos Municípios;',
                                },
                                {
                                  '@id': 'art198_cpt_inc3',
                                  Rotulo: 'III –',
                                  p: 'contra os que se acharem servindo nas Forças Armadas, em tempo de guerra.',
                                },
                              ],
                            },
                          },
                          {
                            '@id': 'art199',
                            Rotulo: 'Art. 199.',
                            Caput: {
                              '@id': 'art199_cpt',
                              p: 'Não corre igualmente a prescrição:',
                              Inciso: [
                                {
                                  '@id': 'art199_cpt_inc1',
                                  Rotulo: 'I –',
                                  p: 'pendendo condição suspensiva;',
                                },
                                {
                                  '@id': 'art199_cpt_inc2',
                                  Rotulo: 'II –',
                                  p: 'não estando vencido o prazo;',
                                },
                                {
                                  '@id': 'art199_cpt_inc3',
                                  Rotulo: 'III –',
                                  p: 'pendendo ação de evicção.',
                                },
                              ],
                            },
                          },
                          {
                            '@id': 'art200',
                            Rotulo: 'Art. 200.',
                            Caput: {
                              '@id': 'art200_cpt',
                              p: 'Quando a ação se originar de fato que deva ser apurado no juízo criminal, não correrá a prescrição antes da respectiva sentença definitiva.',
                            },
                          },
                          {
                            '@id': 'art201',
                            Rotulo: 'Art. 201.',
                            Caput: {
                              '@id': 'art201_cpt',
                              p: 'Suspensa a prescrição em favor de um dos credores solidários, só aproveitam os outros se a obrigação for indivisível.',
                            },
                          },
                        ],
                      },
                      {
                        '@id': 'prt1_liv3_tit4_cap1_sec3',
                        Rotulo: 'Seção III',
                        NomeAgrupador: 'Das Causas que Interrompem a Prescrição',
                        Artigo: [
                          {
                            '@id': 'art202',
                            Rotulo: 'Art. 202.',
                            Caput: {
                              '@id': 'art202_cpt',
                              p: 'A interrupção da prescrição, que somente poderá ocorrer uma vez, dar-se-á:',
                              Inciso: [
                                {
                                  '@id': 'art202_cpt_inc1',
                                  Rotulo: 'I –',
                                  p: 'por despacho do juiz, mesmo incompetente, que ordenar a citação, se o interessado a promover no prazo e na forma da lei processual;',
                                },
                                {
                                  '@id': 'art202_cpt_inc2',
                                  Rotulo: 'II –',
                                  p: 'por protesto, nas condições do inciso antecedente;',
                                },
                                {
                                  '@id': 'art202_cpt_inc3',
                                  Rotulo: 'III –',
                                  p: 'por protesto cambial;',
                                },
                                {
                                  '@id': 'art202_cpt_inc4',
                                  Rotulo: 'IV –',
                                  p: 'pela apresentação do título de crédito em juízo de inventário ou em concurso de credores;',
                                },
                                {
                                  '@id': 'art202_cpt_inc5',
                                  Rotulo: 'V –',
                                  p: 'por qualquer ato judicial que constitua em mora o devedor;',
                                },
                                {
                                  '@id': 'art202_cpt_inc6',
                                  Rotulo: 'VI –',
                                  p: 'por qualquer ato inequívoco, ainda que extrajudicial, que importe reconhecimento do direito pelo devedor.',
                                },
                              ],
                            },
                            Paragrafo: {
                              '@id': 'art202_par1u',
                              Rotulo: 'Parágrafo único.',
                              p: 'A prescrição interrompida recomeça a correr da data do ato que a interrompeu, ou do último ato do processo para a interromper.',
                            },
                          },
                          {
                            '@id': 'art203',
                            Rotulo: 'Art. 203.',
                            Caput: {
                              '@id': 'art203_cpt',
                              p: 'A prescrição pode ser interrompida por qualquer interessado.',
                            },
                          },
                          {
                            '@id': 'art204',
                            Rotulo: 'Art. 204.',
                            Caput: {
                              '@id': 'art204_cpt',
                              p:
                                'A interrupção da prescrição por um credor não aproveita aos outros; semelhantemente, a interrupção operada contra o co-devedor, ou seu herdeiro, não prejudica aos demais coobrigados.',
                            },
                            Paragrafo: [
                              {
                                '@id': 'art204_par1',
                                Rotulo: '§ 1º',
                                p:
                                  'A interrupção por um dos credores solidários aproveita aos outros; assim como a interrupção efetuada contra o devedor solidário envolve os demais e seus herdeiros.',
                              },
                              {
                                '@id': 'art204_par2',
                                Rotulo: '§ 2º',
                                p:
                                  'A interrupção operada contra um dos herdeiros do devedor solidário não prejudica os outros herdeiros ou devedores, senão quando se trate de obrigações e direitos indivisíveis.',
                              },
                              {
                                '@id': 'art204_par3',
                                Rotulo: '§ 3º',
                                p: 'A interrupção produzida contra o principal devedor prejudica o fiador.',
                              },
                            ],
                          },
                        ],
                      },
                      {
                        '@id': 'prt1_liv3_tit4_cap1_sec4',
                        Rotulo: 'Seção IV',
                        NomeAgrupador: 'Dos Prazos da Prescrição',
                        Artigo: [
                          {
                            '@id': 'art205',
                            Rotulo: 'Art. 205.',
                            Caput: {
                              '@id': 'art205_cpt',
                              p: 'A prescrição ocorre em dez anos, quando a lei não lhe haja fixado prazo menor.',
                            },
                          },
                          {
                            '@id': 'art206',
                            Rotulo: 'Art. 206.',
                            Caput: {
                              '@id': 'art206_cpt',
                              p: 'Prescreve:',
                            },
                            Paragrafo: [
                              {
                                '@id': 'art206_par1',
                                Rotulo: '§ 1º',
                                p: 'Em um ano:',
                                Inciso: [
                                  {
                                    '@id': 'art206_par1_inc1',
                                    Rotulo: 'I –',
                                    p:
                                      'a pretensão dos hospedeiros ou fornecedores de víveres destinados a consumo no próprio estabelecimento, para o pagamento da hospedagem ou dos alimentos;',
                                  },
                                  {
                                    '@id': 'art206_par1_inc2',
                                    Rotulo: 'II –',
                                    p: 'a pretensão do segurado contra o segurador, ou a deste contra aquele, contado o prazo:',
                                    Aliiea: [
                                      {
                                        '@id': 'art206_par1_inc2_ali1',
                                        Rotulo: 'a)',
                                        p:
                                          'para o segurado, no caso de seguro de responsabilidade civil, da data em que é citado para responder à ação de indenização proposta pelo terceiro prejudicado, ou da data que a este indeniza, com a anuência do segurador;',
                                      },
                                      {
                                        '@id': 'art206_par1_inc2_ali2',
                                        Rotulo: 'b)',
                                        p: 'quanto aos demais seguros, da ciência do fato gerador da pretensão;',
                                      },
                                    ],
                                  },
                                  {
                                    '@id': 'art206_par1_inc3',
                                    Rotulo: 'III –',
                                    p:
                                      'a pretensão dos tabeliães, auxiliares da justiça, serventuários judiciais, árbitros e peritos, pela percepção de emolumentos, custas e honorários;',
                                  },
                                  {
                                    '@id': 'art206_par1_inc4',
                                    Rotulo: 'IV –',
                                    p:
                                      'a pretensão contra os peritos, pela avaliação dos bens que entraram para a formação do capital de sociedade anônima, contado da publicação da ata da assembléia que aprovar o laudo;',
                                  },
                                  {
                                    '@id': 'art206_par1_inc5',
                                    Rotulo: 'V –',
                                    p:
                                      'a pretensão dos credores não pagos contra os sócios ou acionistas e os liquidantes, contado o prazo da publicação da ata de encerramento da liquidação da sociedade.',
                                  },
                                ],
                              },
                              {
                                '@id': 'art206_par2',
                                Rotulo: '§ 2º',
                                p: 'Em dois anos, a pretensão para haver prestações alimentares, a partir da data em que se vencerem.',
                              },
                              {
                                '@id': 'art206_par3',
                                Rotulo: '§ 3º',
                                p: 'Em três anos:',
                                Inciso: [
                                  {
                                    '@id': 'art206_par3_inc1',
                                    Rotulo: 'I –',
                                    p: 'a pretensão relativa a aluguéis de prédios urbanos ou rústicos;',
                                  },
                                  {
                                    '@id': 'art206_par3_inc2',
                                    Rotulo: 'II –',
                                    p: 'a pretensão para receber prestações vencidas de rendas temporárias ou vitalícias;',
                                  },
                                  {
                                    '@id': 'art206_par3_inc3',
                                    Rotulo: 'III –',
                                    p:
                                      'a pretensão para haver juros, dividendos ou quaisquer prestações acessórias, pagáveis, em períodos não maiores de um ano, com capitalização ou sem ela;',
                                  },
                                  {
                                    '@id': 'art206_par3_inc4',
                                    Rotulo: 'IV –',
                                    p: 'a pretensão de ressarcimento de enriquecimento sem causa;',
                                  },
                                  {
                                    '@id': 'art206_par3_inc5',
                                    Rotulo: 'V –',
                                    p: 'a pretensão de reparação civil;',
                                  },
                                  {
                                    '@id': 'art206_par3_inc6',
                                    Rotulo: 'VI –',
                                    p: 'a pretensão de restituição dos lucros ou dividendos recebidos de má-fé, correndo o prazo da data em que foi deliberada a distribuição;',
                                  },
                                  {
                                    '@id': 'art206_par3_inc7',
                                    Rotulo: 'VII –',
                                    p: 'a pretensão contra as pessoas em seguida indicadas por violação da lei ou do estatuto, contado o prazo:',
                                    Alinea: [
                                      {
                                        '@id': 'art206_par3_inc7_ali1',
                                        Rotulo: 'a)',
                                        p: 'para os fundadores, da publicação dos atos constitutivos da sociedade anônima;',
                                      },
                                      {
                                        '@id': 'art206_par3_inc7_ali2',
                                        Rotulo: 'b)',
                                        p:
                                          'para os administradores, ou fiscais, da apresentação, aos sócios, do balanço referente ao exercício em que a violação tenha sido praticada, ou da reunião ou assembléia geral que dela deva tomar conhecimento;',
                                      },
                                      {
                                        '@id': 'art206_par3_inc7_ali3',
                                        Rotulo: 'c)',
                                        p: 'para os liquidantes, da primeira assembléia semestral posterior à violação;',
                                      },
                                    ],
                                  },
                                  {
                                    '@id': 'art206_par3_inc8',
                                    Rotulo: 'VIII –',
                                    p: 'a pretensão para haver o pagamento de título de crédito, a contar do vencimento, ressalvadas as disposições de lei especial;',
                                  },
                                  {
                                    '@id': 'art206_par3_inc9',
                                    Rotulo: 'IX –',
                                    p: 'a pretensão do beneficiário contra o segurador, e a do terceiro prejudicado, no caso de seguro de responsabilidade civil obrigatório.',
                                  },
                                ],
                              },
                              {
                                '@id': 'art206_par4',
                                Rotulo: '§ 4º',
                                p: 'Em quatro anos, a pretensão relativa à tutela, a contar da data da aprovação das contas.',
                              },
                              {
                                '@id': 'art206_par5',
                                Rotulo: '§ 5º',
                                p: 'Em cinco anos:',
                                Inciso: [
                                  {
                                    '@id': 'art206_par5_inc1',
                                    Rotulo: 'I –',
                                    p: 'a pretensão de cobrança de dívidas líquidas constantes de instrumento público ou particular;',
                                  },
                                  {
                                    '@id': 'art206_par5_inc2',
                                    Rotulo: 'II –',
                                    p:
                                      'a pretensão dos profissionais liberais em geral, procuradores judiciais, curadores e professores pelos seus honorários, contado o prazo da conclusão dos serviços, da cessação dos respectivos contratos ou mandato;',
                                  },
                                  {
                                    '@id': 'art206_par5_inc3',
                                    Rotulo: 'III –',
                                    p: 'a pretensão do vencedor para haver do vencido o que despendeu em juízo.',
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    '@id': 'prt1_liv3_tit4_cap2',
                    Rotulo: 'CAPÍTULO II',
                    NomeAgrupador: 'Da Decadência',
                    Artigo: [
                      {
                        '@id': 'art207',
                        Rotulo: 'Art. 207.',
                        Caput: {
                          '@id': 'art207_cpt',
                          p: 'Salvo disposição legal em contrário, não se aplicam à decadência as normas que impedem, suspendem ou interrompem a prescrição.',
                        },
                      },
                      {
                        '@id': 'art208',
                        Rotulo: 'Art. 208.',
                        Caput: {
                          '@id': 'art208_cpt',
                          p: 'Aplica-se à decadência o disposto nos arts. 195 e 198, inciso I.',
                        },
                      },
                      {
                        '@id': 'art209',
                        Rotulo: 'Art. 209.',
                        Caput: {
                          '@id': 'art209_cpt',
                          p: 'É nula a renúncia à decadência fixada em lei.',
                        },
                      },
                      {
                        '@id': 'art210',
                        Rotulo: 'Art. 210.',
                        Caput: {
                          '@id': 'art210_cpt',
                          p: 'Deve o juiz, de ofício, conhecer da decadência, quando estabelecida por lei.',
                        },
                      },
                      {
                        '@id': 'art211',
                        Rotulo: 'Art. 211.',
                        Caput: {
                          '@id': 'art211_cpt',
                          p: 'Se a decadência for convencional, a parte a quem aproveita pode alegá-la em qualquer grau de jurisdição, mas o juiz não pode suprir a alegação.',
                        },
                      },
                    ],
                  },
                ],
              },
              {
                '@id': 'prt1_liv3_tit5',
                Rotulo: 'TÍTULO V',
                NomeAgrupador: 'Da Prova',
                Artigo: [
                  {
                    '@id': 'art212',
                    Rotulo: 'Art. 212.',
                    Caput: {
                      '@id': 'art212_cpt',
                      p: 'Salvo o negócio a que se impõe forma especial, o fato jurídico pode ser provado mediante:',
                      Inciso: [
                        {
                          '@id': 'art212_cpt_inc1',
                          Rotulo: 'I –',
                          p: 'confissão;',
                        },
                        {
                          '@id': 'art212_cpt_inc2',
                          Rotulo: 'II –',
                          p: 'documento;',
                        },
                        {
                          '@id': 'art212_cpt_inc3',
                          Rotulo: 'III –',
                          p: 'testemunha;',
                        },
                        {
                          '@id': 'art212_cpt_inc4',
                          Rotulo: 'IV –',
                          p: 'presunção;',
                        },
                        {
                          '@id': 'art212_cpt_inc5',
                          Rotulo: 'V –',
                          p: 'perícia.',
                        },
                      ],
                    },
                  },
                  {
                    '@id': 'art213',
                    Rotulo: 'Art. 213.',
                    Caput: {
                      '@id': 'art213_cpt',
                      p: 'Não tem eficácia a confissão se provém de quem não é capaz de dispor do direito a que se referem os fatos confessados.',
                    },
                    Paragrafo: {
                      '@id': 'art213_par1u',
                      Rotulo: 'Parágrafo único.',
                      p: 'Se feita a confissão por um representante, somente é eficaz nos limites em que este pode vincular o representado.',
                    },
                  },
                  {
                    '@id': 'art214',
                    Rotulo: 'Art. 214.',
                    Caput: {
                      '@id': 'art214_cpt',
                      p: 'A confissão é irrevogável, mas pode ser anulada se decorreu de erro de fato ou de coação.',
                    },
                  },
                  {
                    '@id': 'art215',
                    Rotulo: 'Art. 215.',
                    Caput: {
                      '@id': 'art215_cpt',
                      p: 'A escritura pública, lavrada em notas de tabelião, é documento dotado de fé pública, fazendo prova plena.',
                    },
                    Paragrafo: [
                      {
                        '@id': 'art215_par1',
                        Rotulo: '§ 1º',
                        p: 'Salvo quando exigidos por lei outros requisitos, a escritura pública deve conter:',
                        Inciso: [
                          {
                            '@id': 'art215_par1_inc1',
                            Rotulo: 'I –',
                            p: 'data e local de sua realização;',
                          },
                          {
                            '@id': 'art215_par1_inc2',
                            Rotulo: 'II –',
                            p:
                              'reconhecimento da identidade e capacidade das partes e de quantos hajam comparecido ao ato, por si, como representantes, intervenientes ou testemunhas;',
                          },
                          {
                            '@id': 'art215_par1_inc3',
                            Rotulo: 'III –',
                            p:
                              'nome, nacionalidade, estado civil, profissão, domicílio e residência das partes e demais comparecentes, com a indicação, quando necessário, do regime de bens do casamento, nome do outro cônjuge e filiação;',
                          },
                          {
                            '@id': 'art215_par1_inc4',
                            Rotulo: 'IV –',
                            p: 'manifestação clara da vontade das partes e dos intervenientes;',
                          },
                          {
                            '@id': 'art215_par1_inc5',
                            Rotulo: 'V –',
                            p: 'referência ao cumprimento das exigências legais e fiscais inerentes à legitimidade do ato;',
                          },
                          {
                            '@id': 'art215_par1_inc6',
                            Rotulo: 'VI –',
                            p: 'declaração de ter sido lida na presença das partes e demais comparecentes, ou de que todos a leram;',
                          },
                          {
                            '@id': 'art215_par1_inc7',
                            Rotulo: 'VII –',
                            p: 'assinatura das partes e dos demais comparecentes, bem como a do tabelião ou seu substituto legal, encerrando o ato.',
                          },
                        ],
                      },
                      {
                        '@id': 'art215_par2',
                        Rotulo: '§ 2º',
                        p: 'Se algum comparecente não puder ou não souber escrever, outra pessoa capaz assinará por ele, a seu rogo.',
                      },
                      {
                        '@id': 'art215_par3',
                        Rotulo: '§ 3º',
                        p: 'A escritura será redigida na língua nacional.',
                      },
                      {
                        '@id': 'art215_par4',
                        Rotulo: '§ 4º',
                        p:
                          'Se qualquer dos comparecentes não souber a língua nacional e o tabelião não entender o idioma em que se expressa, deverá comparecer tradutor público para servir de intérprete, ou, não o havendo na localidade, outra pessoa capaz que, a juízo do tabelião, tenha idoneidade e conhecimento bastantes.',
                      },
                      {
                        '@id': 'art215_par5',
                        Rotulo: '§ 5º',
                        p:
                          'Se algum dos comparecentes não for conhecido do tabelião, nem puder identificar-se por documento, deverão participar do ato pelo menos duas testemunhas que o conheçam e atestem sua identidade.',
                      },
                    ],
                  },
                  {
                    '@id': 'art216',
                    Rotulo: 'Art. 216.',
                    Caput: {
                      '@id': 'art216_cpt',
                      p:
                        'Farão a mesma prova que os originais as certidões textuais de qualquer peça judicial, do protocolo das audiências, ou de outro qualquer livro a cargo do escrivão, sendo extraídas por ele, ou sob a sua vigilância, e por ele subscritas, assim como os traslados de autos, quando por outro escrivão consertados.',
                    },
                  },
                  {
                    '@id': 'art217',
                    Rotulo: 'Art. 217.',
                    Caput: {
                      '@id': 'art217_cpt',
                      p:
                        'Terão a mesma força probante os traslados e as certidões, extraídos por tabelião ou oficial de registro, de instrumentos ou documentos lançados em suas notas.',
                    },
                  },
                  {
                    '@id': 'art218',
                    Rotulo: 'Art. 218.',
                    Caput: {
                      '@id': 'art218_cpt',
                      p: 'Os traslados e as certidões considerar-se-ão instrumentos públicos, se os originais se houverem produzido em juízo como prova de algum ato.',
                    },
                  },
                  {
                    '@id': 'art219',
                    Rotulo: 'Art. 219.',
                    Caput: {
                      '@id': 'art219_cpt',
                      p: 'As declarações constantes de documentos assinados presumem-se verdadeiras em relação aos signatários.',
                    },
                    Paragrafo: {
                      '@id': 'art219_par1u',
                      Rotulo: 'Parágrafo único.',
                      p:
                        'Não tendo relação direta, porém, com as disposições principais ou com a legitimidade das partes, as declarações enunciativas não eximem os interessados em sua veracidade do ônus de prová-las.',
                    },
                  },
                  {
                    '@id': 'art220',
                    Rotulo: 'Art. 220.',
                    Caput: {
                      '@id': 'art220_cpt',
                      p:
                        'A anuência ou a autorização de outrem, necessária à validade de um ato, provar-se-á do mesmo modo que este, e constará, sempre que se possa, do próprio instrumento.',
                    },
                  },
                  {
                    '@id': 'art221',
                    Rotulo: 'Art. 221.',
                    Caput: {
                      '@id': 'art221_cpt',
                      p:
                        'O instrumento particular, feito e assinado, ou somente assinado por quem esteja na livre disposição e administração de seus bens, prova as obrigações convencionais de qualquer valor; mas os seus efeitos, bem como os da cessão, não se operam, a respeito de terceiros, antes de registrado no registro público.',
                    },
                    Paragrafo: {
                      '@id': 'art221_par1u',
                      Rotulo: 'Parágrafo único.',
                      p: 'A prova do instrumento particular pode suprir-se pelas outras de caráter legal.',
                    },
                  },
                  {
                    '@id': 'art222',
                    Rotulo: 'Art. 222.',
                    Caput: {
                      '@id': 'art222_cpt',
                      p: 'O telegrama, quando lhe for contestada a autenticidade, faz prova mediante conferência com o original assinado.',
                    },
                  },
                  {
                    '@id': 'art223',
                    Rotulo: 'Art. 223.',
                    Caput: {
                      '@id': 'art223_cpt',
                      p:
                        'A cópia fotográfica de documento, conferida por tabelião de notas, valerá como prova de declaração da vontade, mas, impugnada sua autenticidade, deverá ser exibido o original.',
                    },
                    Paragrafo: {
                      '@id': 'art223_par1u',
                      Rotulo: 'Parágrafo único.',
                      p:
                        'A prova não supre a ausência do título de crédito, ou do original, nos casos em que a lei ou as circunstâncias condicionarem o exercício do direito à sua exibição.',
                    },
                  },
                  {
                    '@id': 'art224',
                    Rotulo: 'Art. 224.',
                    Caput: {
                      '@id': 'art224_cpt',
                      p: 'Os documentos redigidos em língua estrangeira serão traduzidos para o português para ter efeitos legais no País.',
                    },
                  },
                  {
                    '@id': 'art225',
                    Rotulo: 'Art. 225.',
                    Caput: {
                      '@id': 'art225_cpt',
                      p:
                        'As reproduções fotográficas, cinematográficas, os registros fonográficos e, em geral, quaisquer outras reproduções mecânicas ou eletrônicas de fatos ou de coisas fazem prova plena destes, se a parte, contra quem forem exibidos, não lhes impugnar a exatidão.',
                    },
                  },
                  {
                    '@id': 'art226',
                    Rotulo: 'Art. 226.',
                    Caput: {
                      '@id': 'art226_cpt',
                      p:
                        'Os livros e fichas dos empresários e sociedades provam contra as pessoas a que pertencem, e, em seu favor, quando, escriturados sem vício extrínseco ou intrínseco, forem confirmados por outros subsídios.',
                    },
                    Paragrafo: {
                      '@id': 'art226_par1u',
                      Rotulo: 'Parágrafo único.',
                      p:
                        'A prova resultante dos livros e fichas não é bastante nos casos em que a lei exige escritura pública, ou escrito particular revestido de requisitos especiais, e pode ser ilidida pela comprovação da falsidade ou inexatidão dos lançamentos.',
                    },
                  },
                  {
                    '@id': 'art227',
                    Rotulo: 'Art. 227.',
                    Caput: {
                      '@id': 'art227_cpt',
                      p:
                        'Salvo os casos expressos, a prova exclusivamente testemunhal só se admite nos negócios jurídicos cujo valor não ultrapasse o décuplo do maior salário mínimo vigente no País ao tempo em que foram celebrados.',
                    },
                    Paragrafo: {
                      '@id': 'art227_par1u',
                      Rotulo: 'Parágrafo único.',
                      p: 'Qualquer que seja o valor do negócio jurídico, a prova testemunhal é admissível como subsidiária ou complementar da prova por escrito.',
                    },
                  },
                  {
                    '@id': 'art228',
                    Rotulo: 'Art. 228.',
                    Caput: {
                      '@id': 'art228_cpt',
                      p: 'Não podem ser admitidos como testemunhas:',
                      Inciso: [
                        {
                          '@id': 'art228_cpt_inc1',
                          Rotulo: 'I –',
                          p: 'os menores de dezesseis anos;',
                        },
                        {
                          '@id': 'art228_cpt_inc2',
                          Rotulo: 'II –',
                          p: 'aqueles que, por enfermidade ou retardamento mental, não tiverem discernimento para a prática dos atos da vida civil;',
                        },
                        {
                          '@id': 'art228_cpt_inc3',
                          Rotulo: 'III –',
                          p: 'os cegos e surdos, quando a ciência do fato que se quer provar dependa dos sentidos que lhes faltam;',
                        },
                        {
                          '@id': 'art228_cpt_inc4',
                          Rotulo: 'IV –',
                          p: 'o interessado no litígio, o amigo íntimo ou o inimigo capital das partes;',
                        },
                        {
                          '@id': 'art228_cpt_inc5',
                          Rotulo: 'V –',
                          p: 'os cônjuges, os ascendentes, os descendentes e os colaterais, até o terceiro grau de alguma das partes, por consangüinidade, ou afinidade.',
                        },
                      ],
                    },
                    Paragrafo: {
                      '@id': 'art228_par1u',
                      Rotulo: 'Parágrafo único.',
                      p: 'Para a prova de fatos que só elas conheçam, pode o juiz admitir o depoimento das pessoas a que se refere este artigo.',
                    },
                  },
                  {
                    '@id': 'art229',
                    Rotulo: 'Art. 229.',
                    Caput: {
                      '@id': 'art229_cpt',
                      p: 'Ninguém pode ser obrigado a depor sobre fato:',
                      Inciso: [
                        {
                          '@id': 'art229_cpt_inc1',
                          Rotulo: 'I –',
                          p: 'a cujo respeito, por estado ou profissão, deva guardar segredo;',
                        },
                        {
                          '@id': 'art229_cpt_inc2',
                          Rotulo: 'II –',
                          p: 'a que não possa responder sem desonra própria, de seu cônjuge, parente em grau sucessível, ou amigo íntimo;',
                        },
                        {
                          '@id': 'art229_cpt_inc3',
                          Rotulo: 'III –',
                          p: 'que o exponha, ou às pessoas referidas no inciso antecedente, a perigo de vida, de demanda, ou de dano patrimonial imediato.',
                        },
                      ],
                    },
                  },
                  {
                    '@id': 'art230',
                    Rotulo: 'Art. 230.',
                    Caput: {
                      '@id': 'art230_cpt',
                      p: 'As presunções, que não as legais, não se admitem nos casos em que a lei exclui a prova testemunhal.',
                    },
                  },
                  {
                    '@id': 'art231',
                    Rotulo: 'Art. 231.',
                    Caput: {
                      '@id': 'art231_cpt',
                      p: 'Aquele que se nega a submeter-se a exame médico necessário não poderá aproveitar-se de sua recusa.',
                    },
                  },
                  {
                    '@id': 'art232',
                    Rotulo: 'Art. 232.',
                    Caput: {
                      '@id': 'art232_cpt',
                      p: 'A recusa à perícia médica ordenada pelo juiz poderá suprir a prova que se pretendia obter com o exame.',
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
};
