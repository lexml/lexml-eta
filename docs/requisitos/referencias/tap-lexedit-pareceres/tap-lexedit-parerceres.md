# TERMO DE ABERTURA DO PROJETO – TAP (PARCIAL)

## Justificativa do projeto

O LexEdit é um editor de textos legislativos que tem como principais características:

1. a padronização dos textos;
2. o respeito à técnica legislativa formal;
3. a produção de textos em formato estruturado;
4. o suporte aos padrões que compõem o LexML;
5. a geração de documentos adequados para arquivamento eletrônico baseados no padrão PDF-A;
6. a estruturação da informação de modo a permitir integração com outros sistemas de informação; e
7. a utilização de interface mais adequada a cada tipo de documento suportado.

O LexEdit foi desenvolvido inicialmente em 2007, mas implantado apenas em 2012, quando foi finalizado e incorporado ao LexML. Além de contemplar emendas legislativas, o editor chegou a suportar requerimentos e recursos, ambos em plataforma cliente-servidor. Os principais usuários do LexEdit à época eram os Gabinetes Parlamentares e as Lideranças.

Em 2017, foi implementado a primeira versão do LexEditWeb, que se propunha a migrar o módulo de Requerimentos e Recursos para a plataforma Web utilizando-se das ideias e tecnologias desenvolvidas no LexEdit. O sistema oferece interface baseada na Web, e atende à Consultoria Legislativa por meio da integração com o Sac (Sistema de acompanhamento das consultorias). Posteriormente, os ofícios também foram contemplados nessa nova versão. O LexEditWeb encontra-se integrado ao Sac e ao Sedol (Sistema de protocolo legislativo), e, ao contrário de seu predecessor, foi efetivamente adotado pela Secretaria-Geral da Mesa por meio da IN 11/2018, e utilizado por gabinetes e Consultoria Legislativa.

Em continuidade aos avanços promovidos pelo LexEditWeb, destaca-se o desenvolvimento do LexEdit Emendas, resultado de uma cooperação inédita entre o Senado Federal e a Câmara dos Deputados, que passaram a atuar em parceria na especificação, implementação e manutenção dessa nova funcionalidade. O objetivo foi criar uma ferramenta única e padronizada para a elaboração de emendas a proposições legislativas, atendendo às exigências regimentais e às normas de técnica legislativa previstas na Lei Complementar nº 95/1998.

A utilização conjunta do LexEdit Emendas pelos dois ramos do Legislativo Federal foi regulamentada pelo Ato Conjunto nº 1/2022 e consolidada IN 18/2023, que determinou sua adoção obrigatória em etapas. A partir de 6 de novembro de 2023, os órgãos da Secretaria-Geral da Mesa passaram a aceitar exclusivamente as emendas a Medidas Provisórias elaboradas na nova plataforma. A obrigatoriedade foi então ampliada, estendendo-se a todas as emendas apresentadas no âmbito do Senado e do Congresso Nacional a partir do início do ano de 2024.

Hoje, ao fazer um balanço dessas ferramentas, pode-se constatar que elas foram bem-sucedidas, pois se mostraram viáveis tecnicamente e importantes para o processo legislativo, comprovando o amadurecimento do Prodasen para desenvolver ferramentas de software que atuem na modernização do processo de autoria legislativa.

Mas a conclusão mais importante é que o sucesso de tal iniciativa depende fundamentalmente do compromisso das áreas do Senado Federal para seu uso efetivo, pois a adoção do LexEdit só foi possível a partir do momento que a Secretaria-Geral da Mesa decidiu por sua obrigatoriedade.

E aqui chega-se à razão primeira para a continuidade deste projeto de autoria legislativa: aproveitar o bom momento do LexEdit para ampliar o suporte aos demais tipos de documento legislativo.

Diante das diferentes alternativas de produtos para estruturação de informações do processo legislativo, opta-se por eleger o editor de pareceres como o próximo módulo do LexEdit, porque elaboração de minutas de pareceres a proposições é uma das atividades mais complexas do processo legislativo. Além de envolver o conhecimento de Direito Constitucional e de Regimento Interno, depende também da experiência técnica no tema que está sendo tratado pela proposta de inovação legislativa. O uso do Editor de pareceres na produção da minuta de parecer trará ganhos de produtividade, pela automatização de atividades repetitivas e do tratamento de aspectos formais do documento.

## Benefícios esperados

1. possibilitar que os pareceres legislativos sejam elaborados com apoio de editor especializado imprimirá maior qualidade ao texto produzido, garantindo aderência às normas e padrões legislativos e legais;
2. padronização da estrutura e formatação do texto, das ementas e texto do voto;
3. identificação clara e recuperação de documentos componentes do voto, tais como emendas, emendas substitutivas globais, projetos autônomos, requerimentos etc. Esses documentos que compõem o voto poderão então ser disponibilizados para outras soluções e continuação do processo legislativo, por exemplo, a publicação de quadros de emendas, disponibilização do substitutivo global para emendamento no LexEdit e apresentação de projetos autônomos e requerimentos.
4. permitir a edição estruturada de emendas e requerimentos do parecer diretamente no LexEdit, além de viabilizar a importação de textos produzidos em outros ambientes, possibilitando a padronização, integridade e facilidade de integração desses documentos ao fluxo legislativo.
5. possibilitar a validação da estrutura e conversão para o formato LexML de substitutivos globais e projetos autônomos propostos.

## Objetivos específicos do projeto
1. Implementar uma plataforma tecnológica que possa suportar a redação de pareceres legislativos integrada ao LexEdit;
2. Especificar formato de documento para atender às necessidades específicas da edição de pareceres legislativos;
3. Gerar ementa padronizada a partir de dados da matéria e autoria do parecer obtidos do Legis ou outro sistema de informação;
4. Registrar e apresentar no documento dados do relator e presidente da comissão;
5. Permitir a edição não estruturada de textos das seções “Relatório”, “Análise” e “Voto”;
6. Permitir a gestão de componentes do parecer (documentos agregados como anexos, emendas, emendas substitutivas globais, requerimentos, projetos autônomos, dentre outros);
7. Geração do documento do parecer em PDF-A com possibilidade de extração dos arquivos dos componentes;
8. Permitir a importação de textos nos formatos PDF, DOCX, LexEdit Emendas e LexEdit Madoc (requerimentos) para composição do parecer na seção “Voto” e anexos.
9. Implementar componente integrado de edição de proposição para a elaboração de substitutivos e projetos autônomos com:
    1. Estruturação com renumeração de dispositivos
    2. Integração com o parser para importação e validação da versão inicial.
    3. Gestão de remissões internas (renumeração de referências dentro do texto)
10. Integrar com o LexEdit para edição de emendas e requerimentos na seção “Voto”.
11. Eleger um conjunto de possibilidades de decisões de Comissão para estruturação da seção “Voto”, por exemplo, não aprovação, aprovação nos termos de emendas apresentadas, aprovação nos termos de uma emenda substitutiva global;
12. Estruturar a seção “Voto”, mantendo a opção de edição não estruturada dessa seção para casos não selecionados para implementação ou não previstos;

## Restrições
1. Uso de ferramentas abertas e de softwares que não acarretem custo para o desenvolvimento e a distribuição do produto;
2. Uso dos produtos em interface Web;
3. Suporte às versões mais recentes do Chrome, Firefox, Edge e Safari;
4. Uso dos produtos em dispositivos móveis.

## Não Escopo
1. Estruturação de anexos de proposições;
2. Edição colaborativa no estilo Word/Google Docs em que mais de um usuário alteram o texto simultaneamente;
3. Tratamento de tabelas, fórmulas matemáticas e imagens na articulação das proposições;
4. Integração da solução em outros produtos legislativos;
5. Implementação de assinatura eletrônica;
6. Criar ou manter repositórios de documentos.
