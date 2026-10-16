## Context

Ver `proposal.md` (Why). Estado atual relevante:

- A norma alterada (`alteracoes.base`) só é definida pelo diálogo "Corrigir agora" (`informarNormaDialog` → `atualizaReferenciaElemento`) e pelo assistente de alteração. Nada a deriva das remissões externas.
- O registro `state.remissoesExternas` é **derivado do HTML** do dispositivo: reconstruído ao abrir (`inicializaRemissoesExternasAoAbrir`, que lê `data-urn`; um `span href="urn:lex:…"` do arquivo já vira esse formato em `buildProjetoNormaFromJsonix`) e recomputado em undo/redo. O `sourceUuid` das entradas é o uuid do **Artigo** (o caput não é visitado; `Artigo.texto` delega para `caput.texto`).
- A criação ao vivo é assíncrona: blur → `coordenarDeteccaoExterna` (WASM) → `adicionarRemissaoExternaAction`. Nesse instante o link ainda **não** foi renderizado no Quill nem sincronizado em `dispositivo.texto`.
- O validador (`validaDispositivo`) é puro: recebe só o dispositivo, sem acesso ao estado Redux.
- **Ao vivo, o texto do estado (`dispositivo.texto`) não contém o `<a data-urn>`**: o link é desenhado de forma silenciosa no Quill e só é injetado no texto ao salvar (`injetarLinksRemissaoExternaNoTexto`). Só documentos abertos de arquivo têm o link no texto. Undo/redo reconstrói o registro a partir do texto (`inicializaRemissoesExternasAoAbrir`), então remissões criadas ao vivo e ainda não sincronizadas desaparecem do registro e da tela ao desfazer e são recriadas pela detecção ao sair da linha.
- O padrão atual de mensagens derivadas do registro (`MENSAGEM_REMISSAO_INVALIDA`) está repetido em 8 pontos (reducers e editor) e já tem lacunas (undo/redo, `validaElemento`, `validaArticulacao`, `solicitaNorma`). `selecionaElemento` refaz o painel de mensagens a cada clique na linha, de modo que qualquer mensagem não reaplicada ali some.
- As mensagens são desenhadas em dois pontos do editor: `atualizarQuill` e `atualizarMensagemQuill`, ambos via `EtaQuillUtil.criarContainerMensagens`.
- Medição no corpus real (`test/assets` + `demo/doc`): em 96 artigos de alteração, 94 têm uma única remissão e **todas** iguais ao `base` por comparação de string; 2 têm várias. A ida e volta "URN → texto gerado pelo editor → linker" devolveu a URN idêntica em 90 de 91 bases (a exceção é o bug do `NaN`).

## Goals / Non-Goals

**Goals:**
- Preencher o `base` pela remissão única, sem sobrescrever escolha existente.
- Tornar a divergência `base` × remissão visível e corrigível em um clique, inclusive ao abrir.
- Remover a destruição da remissão no "Corrigir agora" e o `NaN`.

**Non-Goals:**
- Não normalizar/equivaler URNs de formas diferentes (a medição não mostrou necessidade).
- Não alterar o `base` ao abrir documentos.
- Não tratar normas diferentes citadas em 2+ remissões (nenhuma automação, por decisão de produto).
- Numeração da cabeça de alteração (change `2026-10-14-c02-numerar-cabeca-de-alteracao`).

## Decisions

**D1. Preenchimento reage à criação da remissão, no reducer, lendo o registro.**
O reducer de `ADICIONAR_REMISSAO_EXTERNA` (que já recebe `sourceUuid`) passa a: localizar o artigo; se tem bloco de alteração, `base` vazio e o registro tem exatamente uma entrada para esse `sourceUuid`, define `base`, revalida o artigo (`ElementoValidado`) e registra o passo no histórico (`buildPast`/`buildUpdateEvent`, como `atualizaReferenciaElemento`). Cobre remissão automática e manual no mesmo ponto. Na contagem, a remissão do lote e as entradas cujo link está no texto contam; entrada órfã (link apagado) não conta. Como ao vivo o texto não tem o link, a regra de órfã passa a ser a do projeto (a mesma do desenho do link e da injeção ao salvar): a entrada só vale se o `textoRef` está no texto do artigo, ou se o `data-ref-id` está no texto.
Alternativas: (a) preencher na criação do bloco — a remissão ainda não existe; (b) derivar o `base` na validação, sem gravar — `base` é dado persistido, não pode ser só derivado; (c) preencher só no salvar — o alerta ficaria visível sem motivo até lá.
Por que o registro e não o texto: neste instante o texto ainda não contém o link.

**D2. O aviso é calculado num ponto único da camada da tela, não no validador nem nos reducers.**
Descartadas: (a) ler `data-urn` no texto do estado (ao vivo o texto não tem o link, ver Context); (b) copiar o link para o texto do estado (muda o contrato do texto, o que entra no histórico e a renumeração); (c) acrescentar a mensagem em cada reducer, como a remissão inválida (8 pontos, com lacunas; `selecionaElemento` faria o aviso sumir a cada clique).
Adotada: o editor aplica o aviso nos dois pontos em que desenha mensagens (`atualizarQuill` e `atualizarMensagemQuill`), por meio de um único método. Para um elemento com `norma` (o `base`), ele reúne as URNs citadas pelo artigo e, se houver exatamente uma e diferente do `base`, acrescenta o WARNING a uma **cópia** do elemento (os elementos dos eventos fazem parte do estado e do histórico; nunca são mutados). Toda mudança de mensagem passa por esses pontos: desfazer e refazer, seleção de linha, edição e criação de linha.
As URNs citadas vêm dos links `a.lexml-remissao-externa[data-urn]` da linha no DOM (fonte da verdade da tela) complementadas pelas entradas do registro cujo `data-ref-id` não tem link no DOM e cujo `textoRef` está no texto (remissão ainda não desenhada). Entradas sem link e sem `textoRef` no texto são órfãs e não contam.
A regra é uma função pura do modelo (`avaliarNormaAlteradaDivergente`), testável sem DOM; o editor só reúne as entradas. A ligação com o DOM é coberta por E2E.

**D3. Contagem literal de remissões.**
"Exatamente uma" conta ocorrências, não normas distintas: duas citações da mesma norma não preenchem o `base`. Regra simples e previsível, igual ao que o usuário especificou. Alternativa (contar normas distintas) preencheria mais casos, mas amplia a automação além do acordado; pode ser revisitada se o uso real mostrar muito atrito.

**D4. Aviso é WARNING permanente com autofix.**
Nova entrada em `AutoFix` e novo `case` em `autoFixElemento`. A mensagem leva a URN alvo em `detalhe` (a descrição varia com as normas, então o `case` é escolhido por `detalhe.autoFix`). Como a mensagem não existe em `dispositivo.mensagens`, o caso precisa ser tratado **antes** da guarda `hasFix` do reducer, que só olha as mensagens do modelo; do contrário "Corrigir agora" não faria nada. O reducer confere que a URN existe no registro para o artigo (o texto do estado não serve de fonte), define `base`, entra no histórico e revalida. Sem dispensa pelo usuário. O WARNING não bloqueia salvar: só mensagens CRITICAL entram nas pendências (`atualizaMensagemCritical`).

**D5. Abertura é somente leitura.**
Nenhum reducer de abertura altera o `base`. Um documento aberto com `base` vazio e uma remissão mantém o ERROR "informar a norma", que o usuário resolve pelo diálogo ou pelo próprio fluxo de edição.

**D6. "Corrigir agora" (informar norma) deixa de reescrever links existentes.**
`atualizaReferenciaElemento` usa uma regex que, com `base` vazio, casa **qualquer** `<a href>` — inclusive o `<a class="lexml-remissao-externa" href="#" data-urn>` — e o troca por um link comum, perdendo atributos e deixando o registro órfão. Passa a: definir só o `base` quando o artigo já tem remissão externa; mexer no texto apenas para gerar a frase (artigo sem texto) ou inserir a citação quando não há nenhuma referência. A regex deixa de casar links com `data-urn`/classe de remissão.

**D7. `formataNumero` aceita sufixo composto.**
O número com hífen (ex.: `2158-35`) tem a parte inicial formatada com separador de milhar e o sufixo preservado (`2.158-35`); entrada não numérica retorna o próprio texto, nunca `NaN`.

**D8. Revalidação do artigo quando o registro muda.**
O desenho do link e a remoção do registro não geram evento de validação. Para o aviso acompanhar: (a) `ADICIONAR_REMISSAO_EXTERNA` e `REMOVER_REMISSAO_EXTERNA` emitem `ElementoValidado` do artigo de origem quando ele tem bloco de alteração com `base`; (b) após `renderizarRemissoesExternasDoState` o editor dispara a validação do artigo; (c) na abertura, o editor aplica o aviso quando o DOM existe, no mesmo ponto em que `ativarRemissoesInternas` já faz isso para a remissão inválida.

## Risks / Trade-offs

- [Registro com entradas órfãs faz D1 contar errado] → o bug de D6 era a principal fonte de órfãs e é corrigido junto; teste de unidade cobre registro com órfã.
- [Abertura exibir ou não o aviso depende de a abertura revalidar o artigo] → a task de validação confere o caminho `load`/`getElementos` e, se preciso, inclui a mensagem no mesmo ponto que já injeta mensagens extras ao carregar.
- [Lógica do aviso fica numa camada de tela grande, com pouca cobertura unitária] → a regra é pura e testada; o E2E cobre a ligação com o DOM.
- [Mensagem fora de `dispositivo.mensagens` não serve a quem lê só o modelo] → só a tela precisa dela; WARNING não bloqueia salvar nem entra em pendências.
- [Mutar o elemento do evento sujaria estado e histórico] → o editor trabalha sobre cópia.
- [Undo/redo reconstrói o registro a partir do texto e apaga remissões ao vivo não sincronizadas] → comportamento preexistente, fora do escopo, confirmado por E2E (após desfazer, o registro fica vazio e o aviso some junto com a remissão). Por isso a spec não promete que o aviso sobreviva a desfazer em outro dispositivo; o desfazer do próprio "Corrigir agora" restaura o `base`. Registrar para tratamento posterior.
- [Remissão manual sem `textoRef`] → coberta pelo link no DOM, que tem prioridade sobre o registro.
- [Contagem mista (uma remissão já desenhada e outra ainda não) durante alguns milissegundos] → o aviso se corrige na revalidação posterior ao desenho (D8b).
- [WARNING permanente incomoda em textos legítimos que citam outra norma] → decisão de produto; o autofix de um clique reduz o custo.
- [Corpus de medição é enviesado para documentos oficiais bem formados] → não prova ausência total de falsos positivos, mas o aviso existe justamente para divergências reais.
