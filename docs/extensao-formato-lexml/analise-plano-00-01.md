# Análise e plano — documento-articulado.json — especificações 00 e 01

Documento reconstituído em 15/09/2026 a partir da análise realizada durante a atividade, das decisões confirmadas pelo solicitante e da implementação entregue. Este texto recupera o conteúdo e o contexto do relatório perdido; não é uma cópia literal do arquivo anterior.

## 1. Atividade e objetivo

**Título:** Salvar e abrir identificação, epígrafe, ementa, preâmbulo e articulação.

Estabelecer, exclusivamente no lexml-eta, a infraestrutura de leitura e escrita de documento-articulado.json na representação Jsonix do LexML. O arquivo deve guardar os cinco grupos solicitados e permitir recuperar o documento no editor, inclusive quando a proposição ainda não possui número ou ano conhecidos.

Também deve ser demonstrado que o JSON produzido pode ser convertido em XML pelo conversor Jsonix, validado contra o esquema LexML e convertido novamente em JSON.

A implementação foi autorizada após a análise e o planejamento. O backend, a geração de PDF e as demais especificações ficaram para atividades posteriores.

## 2. Significado dos elementos

| Elemento | Finalidade | Exemplo ilustrativo |
| --- | --- | --- |
| Identificação | Identificar o documento por meio de sua URN | urn:lex:br:senado.federal:projeto.lei:2026;123 |
| Epígrafe | Apresentar o título formal do documento | PROJETO DE LEI Nº 123, DE 2026 |
| Ementa | Apresentar resumidamente o assunto | Dispõe sobre a criação de bibliotecas públicas. |
| Preâmbulo | Introduzir o texto normativo | O Congresso Nacional decreta: |
| Articulação | Representar o texto e sua hierarquia | Artigos, parágrafos, incisos, alíneas e agrupadores |

LexML é o padrão de representação do documento legislativo. JSON é o formato textual do arquivo. A representação Jsonix organiza esse JSON conforme o mapeamento utilizado pelo conversor entre JSON e XML.

O modelo interno de edição ProjetoNorma e o arquivo de intercâmbio DocumentoArticulado são contratos distintos. O modelo do editor contém relações e referências úteis à edição; o arquivo deve conter a estrutura serializável do documento LexML.

## 3. Base documental e limite do trabalho

- [00 — Especificação geral](00-especificacao-esquema-lexedit.md): utilizar os elementos existentes do LexML, sem modificar o esquema para acomodar necessidades do editor.
- [01 — Identificação provisória e URN](01-identificacao-provisoria-e-urn.md): representar campos ainda desconhecidos com os valores provisórios estabelecidos.
- [Índice de atividades](issues.md): contexto das entregas posteriores.

A atividade explicitamente solicitada inclui identificação, epígrafe, ementa, preâmbulo e articulação. A especificação 00 estabelece diretrizes gerais, mas isso não significa implementar todos os grupos que ela referencia.

A versão consultada na reconstituição também explicita que o editor pode abrir LexML sem metadados próprios do LexEdit. A estrutura desta entrega não exige MetadadoProprietario.

### Incluído

- Contrato do arquivo documento-articulado.json.
- Identificação existente ou provisória.
- Leitura e escrita dos cinco grupos solicitados.
- Preservação do conteúdo e da formatação já representável no fluxo implementado.
- Diálogos de salvar e abrir, com alternativas para navegadores sem os seletores nativos.
- APIs reutilizáveis e adaptação da demonstração.
- Verificações estruturais na abertura e validação local com conversor real e XSD.

### Fora do escopo

- Implementação das especificações 02 a 13.
- Persistência de autoria, assinaturas, anexos, justificação, comentários e metadados de revisão.
- Integração nova com lexeditweb ou eta-backend-services.
- Conversão para XML como serviço de produção.
- Geração de PDF e inclusão do XML no PDF.
- Novas telas específicas para editar epígrafe e preâmbulo.
- Migração automática dos arquivos antigos salvos pela demonstração.

## 4. Decisão confirmada sobre a URN

O solicitante confirmou a utilização da ordem temporal antes do número e a correção do exemplo invertido na especificação 01.

No caso geral considerado nesta atividade, o descritor usa data ou ano, seguido do número:

~~~text
:data-ou-ano;número
~~~

Exemplos:

| Situação | Identificação |
| --- | --- |
| Data completa conhecida | urn:lex:br:federal:medida.provisoria:2019-11-11;905 |
| Ano e número conhecidos | urn:lex:br:senado.federal:projeto.lei:2026;123 |
| Ano conhecido e número desconhecido | urn:lex:br:senado.federal:projeto.lei:2026;999999 |
| Ano desconhecido e número conhecido | urn:lex:br:senado.federal:projeto.lei:9999;123 |
| Ambos desconhecidos | urn:lex:br:senado.federal:projeto.lei:9999;999999 |

A existência de URNs com data completa não justifica o exemplo invertido :999999;9999. A especificação 01 define ano 9999 e número 999999, nos respectivos campos.

A identificação recebida deve ser preservada integralmente, incluindo autoridade, data e eventual evento. Os valores provisórios são usados apenas quando os dados necessários à criação da identificação ainda são desconhecidos.

A URN provisória não registra oficialmente uma proposição nem atribui número definitivo. Também não deve ser confundida com o texto de apresentação da epígrafe.

Referência de formato: [LexML URN, seção 10.1](https://projeto.lexml.gov.br/documentacao/Parte-2-LexML-URN.pdf).

## 5. Situação encontrada no ETA antes da implementação

A demonstração já possuía comandos Salvar e Abrir, mas salvava o objeto Proposicao, com o documento LexML dentro de uma propriedade projetoNorma.

Isso significa que o arquivo anterior era uma serialização de um objeto da aplicação. A atividade estabeleceu um contrato de intercâmbio cuja raiz é o próprio documento Jsonix LexML.

Foram identificados os seguintes pontos de atenção:

| Situação anterior | Ajuste necessário |
| --- | --- |
| Arquivo com invólucro Proposicao | Produzir a raiz Jsonix LexML diretamente |
| Inicialização com número 1 e ano corrente | Usar os valores provisórios nos campos desconhecidos |
| Reconstrução da identidade a partir de dados parciais | Preservar a URN completa quando recebida |
| Leitura apenas do primeiro conteúdo da epígrafe | Recuperar todo o conteúdo suportado |
| Leitura apenas do primeiro parágrafo do preâmbulo | Recuperar todos os parágrafos |
| Diferença entre strings e objetos nos campos da parte inicial | Compatibilizar o modelo e os conversores |
| Cópias superficiais e reutilização do documento padrão | Separar os objetos de cada documento |
| Descarte de texto composto somente por espaços entre marcações | Preservar a separação das palavras na conversão |
| Normalização tipográfica do leitor legado | Oferecer preservação literal no novo caminho de abertura |
| Edição ainda pendente na interface | Sincronizar antes de obter o documento para salvar |

O formato emitido também precisava respeitar o ramo ProjetoNorma/Norma previsto no XSD utilizado. A denominação Norma nesse ramo é uma questão estrutural do esquema, não uma indicação de aprovação da proposição.

## 6. Referências nos projetos relacionados

A análise inicial consultou lexml-emenda, lexeditweb e eta-backend-services para compreender a infraestrutura já utilizada no ecossistema.

O fluxo de emenda existente oferece referências sobre coleta de dados, serialização e preparação do documento final. Entretanto, sua representação específica de Emenda e o arquivo emenda.xml não correspondem ao contrato LexML desta atividade.

O reaproveitamento adequado para esta entrega foi concentrado no modelo e nos conversores já existentes no ETA, acrescidos de uma camada dedicada ao arquivo de intercâmbio.

A análise desses outros projetos não autorizou nem resultou em alterações neles.

Referências históricas dos checkouts observados durante a análise inicial:

| Projeto | Commit observado |
| --- | --- |
| lexml-eta | a61bafc3 |
| lexml-emenda | 5b698bb9 |
| lexeditweb | efee66ab9 |
| eta-backend-services | 79c58f2 |

Essas referências identificam os checkouts locais examinados, sem afirmar equivalência com versões implantadas.

## 7. Formato e arquitetura adotados

O arquivo contém a raiz name/value do Jsonix. Dentro dela:

~~~text
LexML
├── Metadado
│   └── Identificacao
│       └── URN
└── ProjetoNorma
    └── Norma
        ├── ParteInicial
        │   ├── Epigrafe
        │   ├── Ementa
        │   └── Preambulo
        └── Articulacao
~~~

O novo contrato não exige metadados próprios do LexEdit e não acrescenta elementos ao XSD LexML.

A implementação foi dividida em responsabilidades:

| Responsabilidade | Local |
| --- | --- |
| Contrato, leitura, validação estrutural e serialização | [documentoArticulado.ts](../../src/model/lexml/documento/documentoArticulado.ts) |
| Seletores e operações de arquivo no navegador | [arquivoDocumentoArticulado.ts](../../src/util/arquivoDocumentoArticulado.ts) |
| Conversão do modelo do editor para Jsonix | [buildJsonixFromProjetoNorma.ts](../../src/model/lexml/documento/conversor/buildJsonixFromProjetoNorma.ts) |
| Conversão de Jsonix para o modelo do editor | [buildProjetoNormaFromJsonix.ts](../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix.ts) |
| Identificação e valores provisórios | [urnUtil.ts](../../src/model/lexml/documento/urnUtil.ts) |
| APIs públicas do componente | [lexml-eta.component.ts](../../src/components/lexml-eta.component.ts) |
| Obtenção do estado atualizado e carregamento | [lexml-eta-proposicao.component.ts](../../src/components/lexml-eta-proposicao.component.ts) |
| Uso na demonstração | [demoview.ts](../../demo/components/demoview.ts) |
| Exportação das APIs para consumidores | [src/index.ts](../../src/index.ts) |

### Fluxo atual

~~~text
Estado do editor → sincronização da edição pendente → Jsonix → arquivo JSON
Arquivo JSON → leitura e verificação → conversão para o modelo → editor
~~~

A API getDocumentoArticulado() produz o objeto de intercâmbio. A API abrirDocumentoArticulado() aceita um objeto Jsonix ou texto JSON e verifica sua interpretação antes de iniciar a substituição do documento.

Os utilitários de arquivo usam os seletores nativos quando disponíveis. Como alternativa, o salvamento usa download e a abertura usa um input HTML de arquivo.

O cancelamento retorna false no salvamento e undefined na abertura. Erros são propagados para tratamento pela aplicação consumidora; a demonstração apresenta a mensagem ao usuário.

O novo leitor não aceita o invólucro Proposicao antigo. A API getProposicao() foi mantida para as integrações existentes.

### Fluxo futuro

A aplicação consumidora poderá encaminhar a representação Jsonix ao processo que gerar o XML e preparar o PDF. O ponto exato dessa conversão, inclusive sua eventual implementação no eta-backend-services, pertence à integração posterior.

Nenhum backend é necessário para salvar e abrir o JSON nesta entrega.

## 8. Plano que orientou a implementação

| Etapa | Trabalho | Resultado verificável |
| --- | --- | --- |
| 1. Fixar contrato | Delimitar os cinco grupos, definir a raiz Jsonix e corrigir o exemplo da URN | Formato de intercâmbio definido |
| 2. Tratar identificação | Adotar valores provisórios por campo e preservar a URN recebida | Identificações definitivas e provisórias mantidas |
| 3. Ajustar conversores | Corrigir leitura da parte inicial, múltiplos parágrafos, strings e espaços entre marcações | Conteúdo suportado recuperado após salvar e abrir |
| 4. Expor APIs | Criar importação e exportação dedicadas, com cópias independentes e sincronização da edição | Operações reutilizáveis pelo consumidor |
| 5. Integrar arquivos | Adicionar seletores, cancelamento e tratamento de erros; adaptar a demonstração | Ciclo manual de salvar e abrir funcionando |
| 6. Comprovar compatibilidade | Converter com Jsonix real, validar XSD e comparar o retorno | Evidências reproduzíveis do contrato |
| 7. Revisar a entrega | Verificar compilação, tipos públicos, estilo e regressões | Alterações prontas para integração |

As etapas foram executadas. Os ajustes de suporte incluíram uma proteção no callback de foco para evitar acesso a uma instância do editor já desmontada.

## 9. Critérios de aceitação e evidências

| Critério | Evidência obtida |
| --- | --- |
| Nome e contrato do arquivo | documento-articulado.json com raiz LexML |
| Escopo da persistência | Identificação, parte inicial e articulação, sem os grupos das atividades posteriores |
| Identificação provisória | Casos com ano ou número desconhecidos e com ambos desconhecidos |
| Identificação definitiva | Preservação de autoridade, data e evento nos casos cobertos |
| Parte inicial | Conteúdo misto, caracteres literais e múltiplos parágrafos do preâmbulo |
| Articulação | Dispositivos, hierarquia e alterações de normas nos exemplos exercitados |
| Edição pendente | Sincronização antes da exportação |
| Independência | Documentos novos não reutilizam o objeto anterior nem modificam o modelo padrão |
| Entrada inválida | Rejeição de JSON malformado, raiz incorreta e estruturas incompatíveis |
| Cancelamento | Operação encerrada normalmente |
| Compatibilidade XML | Conversão Jsonix → XML → Jsonix e validação do XML pelo XSD |
| Verificação negativa | XML sem identificação obrigatória rejeitado pelo esquema |

Durante a entrega foram executados com sucesso:

- Compilação TypeScript.
- Geração dos tipos públicos da biblioteca.
- 408 testes dos conversores, utilitários e componentes afetados.
- Quatro testes de integração com o conversor real e o XSD.
- Verificação de formatação e lint, sem erros; permaneceram nove avisos preexistentes de tipos de retorno.

Esses números são o registro das execuções realizadas durante a implementação. A reconstituição deste relatório não executou novamente a suíte.

Os testes da integração usam os [esquemas locais e sua referência de versão](../../test/schemas/lexml/README.md), fixados na revisão 3f570910f6034d09e1bfb657b7e15ef2c6717012 do projeto jsonix-lexml.

## 10. Como repetir as verificações

Na raiz do lexml-eta:

~~~powershell
npm run test:documento-articulado
~~~

Para a integração XML, utilizar Java 11 ou superior no PATH, Chromium do Playwright e o executável jsonix-lexml indicado na documentação dos esquemas:

~~~powershell
$env:JSONIX_LEXML_CLI = 'C:\ferramentas\jsonix-lexml-win.exe'
npm run test:documento-articulado:xml
~~~

O caminho do executável deve ser ajustado ao ambiente local.

Para teste manual:

1. Executar npm start e abrir a demonstração no caminho /demo.
2. Selecionar Nova articulação e clicar em Ok.
3. Editar ementa e dispositivos.
4. Salvar documento-articulado.json.
5. Recarregar a página e abrir o arquivo salvo.
6. Conferir conteúdo, estrutura e identificação.
7. Repetir com um documento existente para verificar a preservação da URN recebida.

## 11. Limites da validação e observações posteriores

A abertura no navegador faz uma verificação estrutural do contrato e utiliza o conversor do ETA para interpretar o documento. Não implementa integralmente o XSD.

A validação completa pelo esquema ocorre nos testes locais. O clique em Salvar não gera XML nem executa Java.

O XSD utiliza anyURI na identificação; por isso, sua aprovação não demonstra sozinha a regra específica de ano e número provisórios. Essa regra é verificada separadamente.

A análise de um arquivo gerado manualmente a partir da MPV 905 confirmou a preservação da URN com data completa e das edições de teste na ementa e no primeiro artigo. O XML passou na validação e a reconversão preservou o conteúdo do arquivo enviado.

Na comparação com o exemplo de origem foram observadas normalização de espaços, conversão de aspas retas em curvas pelo leitor legado e uma diferença na marcação de link do título do Capítulo V. O solicitante informou que as aspas curvas eram esperadas e decidiu manter o comportamento do capítulo, considerando-o preexistente.

O relatório não trata esse comportamento do capítulo como correção incluída nesta entrega. O ciclo JSON/XML deve ser distinguido da leitura inicial dos exemplos antigos: um arquivo pode ser preservado na reconversão e ainda diferir da representação de origem usada antes de sua primeira gravação.

## 12. Estado final da entrega

A primeira atividade foi considerada concluída no escopo aprovado, exclusivamente no lexml-eta. A infraestrutura de persistência está disponível para ser ampliada pelas atividades posteriores.

A entrega foi organizada nos seguintes commits:

| Commit | Título |
| --- | --- |
| 4f530a85 | fix(editor): evitar acesso ao editor após desmontagem |
| 05c4392c | feat(documento): adicionar persistência do documento articulado em Jsonix |
| 2833facd | feat(demo): usar documento articulado nos comandos salvar e abrir |
| 8a1c3945 | test(documento): validar conversão Jsonix e esquema LexML |

Este relatório reconstituído foi criado depois desses commits e não integra automaticamente nenhum deles.
