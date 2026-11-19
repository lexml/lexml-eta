# Design

## Context

Ver `proposal.md`. O contexto do documento foi criado para a importação (`montaContextoImportacaoArquivo`, `ContextoImportacaoArquivo`, arquivados na c02) e é montado por `montaContextoImportacaoArquivo(this.dados, montaUrnNovaProposicao(...))`. A Tela 2b carrega a lista em `carregarDocumentos`, que guarda a chave `sigla|numero|ano` em `materiaCarregada` e retorna cedo se a chave não mudou e o estado não é de erro. `entrarTela2b` só chama `carregarDocumentos` quando a matéria é "mesma". `onEspecie` e os demais tratadores da Tela 1 não limpam a Tela 2b. A Tela 2b só existe na CD, em substitutivo ou subemenda substitutiva, então `documentoReferenciado` sempre existe ali.

## Goals / Non-Goals

**Goals:**
- Um único tipo de contexto, para os dois callbacks e as duas URLs.
- A lista da Tela 2b sempre corresponde à matéria e ao contexto atuais.
- Sem **BREAKING** para quem usa `onListarDocumentos`, e sem alias para o nome renomeado.

**Non-Goals:**
- Levar o contexto ao `onObterTextoDocumento` ou à `urlTextoDocumento`: o `id` é único e vem da lista já filtrada pela espécie.
- Filtrar a lista no componente por espécie: o host decide o que devolver.
- Mudar o contrato do documento (`DocumentoMateria`).

## Decisions

**Renomear para `ContextoDocumento`, sem alias.** O contexto descreve o novo documento escolhido na Tela 1, não a importação. Renomeiam-se também `ReferenciaImportacaoArquivo` → `ReferenciaDocumento`, `montaContextoImportacaoArquivo` → `montaContextoDocumento` (arquivo `contextoDocumento.ts`) e `montaUrlImportacao` → `montaUrlContexto`. O custo é baixo porque nenhum host consumiu a c02; um alias manteria dois nomes para a mesma forma. Alternativa descartada: reaproveitar o nome da importação, que engana no `onListarDocumentos`.

**`documentoReferenciado` é sempre o da Tela 1.** A `consulta` indica de onde listar; `documentoReferenciado` indica o que o novo documento referencia. Coincidem só em "Nesta mesma matéria". A doc e o cenário do spec dão o exemplo de "Em outra matéria". `documentoReferenciado` continua opcional no tipo (PEC não tem referência), o que obriga o host a tratar `undefined` mesmo na listagem; é o custo de um tipo único.

**`montaUrlContexto` generalizada.** A substituição dos placeholders do contexto (com `encodeURIComponent` e vazio para ausente) é compartilhada. Na listagem, aplica-se depois de `montaUrlProposicao`, que trata `{sigla}`, `{numero}` e `{ano}`; os nomes não colidem (`{siglaReferenciada}` é do contexto). A URL de texto não usa o contexto.

**Chave do cache inclui o contexto.** A chave passa a ser `sigla|numero|ano` mais o contexto serializado (`JSON.stringify` do objeto, cujas chaves têm ordem estável). Qualquer mudança que o host possa observar (espécie, URN, sigla, documento referenciado) refaz a lista; mudar só o ano do substitutivo na CD também a refaz, o que é barato e preserva a regra simples. Alternativa descartada: chave só com a espécie, que deixaria o host servir lista velha se ele usar a URN ou o documento referenciado.

**Entrada na Tela 2b sempre tenta carregar.** `entrarTela2b` chama `carregarDocumentos` em qualquer modo de matéria. Se a chave atual difere da carregada, a lista e a seleção são descartadas antes (inclusive em "Em outra matéria" já verificada, cuja lista também depende do contexto). Com chave igual, `carregarDocumentos` retorna cedo e preserva a lista e a seleção. A resposta de uma carga antiga já é descartada pelo contador `cargaDocumentos`, que cada nova carga incrementa; como a nova carga passa a existir quando o contexto muda, a corrida da carga em andamento deixa de existir.

**Callback com contexto obrigatório no tipo.** `(consulta, contexto: ContextoDocumento) => ...`, como em `onImportarArquivo`: callback que declara menos parâmetros continua atribuível, e o contexto sempre é enviado. O objeto é congelado.

**Demo filtra por espécie.** O mock de `/demo-api/materias/.../documentos` aceita `?especie=` na query (a demo passa `{especie}` na `urlDocumentosMateria`): na subemenda substitutiva, omite os documentos de `sigla` `PL` (texto original e apensados). Exercita o contrato sem tornar o componente dependente da regra.

## Risks / Trade-offs

- [Renomear o que a c02 acabou de entregar] → nenhum host consumiu; novo `.tgz` só depois desta change.
- [Chave com o contexto serializado refaz a lista por mudanças irrelevantes ao host (ex.: ano do substitutivo)] → uma chamada extra; aceitável.
- [Host da URL sem os placeholders continua devolvendo a mesma lista para as duas espécies] → aviso na doc; o `lexeditweb-editor` não usa a Tela 2b (só na CD).
- [`documentoReferenciado` opcional no tipo] → documentado como sempre presente na listagem.
