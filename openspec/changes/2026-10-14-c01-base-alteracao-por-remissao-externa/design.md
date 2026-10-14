## Context

Ver `proposal.md` (Why). Estado atual relevante:

- A norma alterada (`alteracoes.base`) só é definida pelo diálogo "Corrigir agora" (`informarNormaDialog` → `atualizaReferenciaElemento`) e pelo assistente de alteração. Nada a deriva das remissões externas.
- O registro `state.remissoesExternas` é **derivado do HTML** do dispositivo: reconstruído ao abrir (`inicializaRemissoesExternasAoAbrir`, que lê `data-urn`; um `span href="urn:lex:…"` do arquivo já vira esse formato em `buildProjetoNormaFromJsonix`) e recomputado em undo/redo. O `sourceUuid` das entradas é o uuid do **Artigo** (o caput não é visitado; `Artigo.texto` delega para `caput.texto`).
- A criação ao vivo é assíncrona: blur → `coordenarDeteccaoExterna` (WASM) → `adicionarRemissaoExternaAction`. Nesse instante o link ainda **não** foi renderizado no Quill nem sincronizado em `dispositivo.texto`.
- O validador (`validaDispositivo`) é puro: recebe só o dispositivo, sem acesso ao estado Redux.
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
O reducer de `ADICIONAR_REMISSAO_EXTERNA` (que já recebe `sourceUuid`) passa a: localizar o artigo; se tem bloco de alteração, `base` vazio e o registro tem exatamente uma entrada para esse `sourceUuid`, define `base`, revalida o artigo (`ElementoValidado`) e registra o passo no histórico (`buildPast`/`buildUpdateEvent`, como `atualizaReferenciaElemento`). Cobre remissão automática e manual no mesmo ponto.
Alternativas: (a) preencher na criação do bloco — a remissão ainda não existe; (b) derivar o `base` na validação, sem gravar — `base` é dado persistido, não pode ser só derivado; (c) preencher só no salvar — o alerta ficaria visível sem motivo até lá.
Por que o registro e não o texto: neste instante o texto ainda não contém o link.

**D2. Validação do aviso lê o texto (`data-urn`), não o registro.**
O validador conta os `data-urn` no HTML do caput do artigo e compara a URN (string exata) com `base`. Fica puro, funciona igual ao abrir, em undo/redo e com o registro dessincronizado, e coincide com o que é serializado. Assimetria consciente com D1: o preenchimento usa o registro (momento de criação); o aviso usa o texto (estado estável). A janela entre os dois é coberta por teste.

**D3. Contagem literal de remissões.**
"Exatamente uma" conta ocorrências, não normas distintas: duas citações da mesma norma não preenchem o `base`. Regra simples e previsível, igual ao que o usuário especificou. Alternativa (contar normas distintas) preencheria mais casos, mas amplia a automação além do acordado; pode ser revisitada se o uso real mostrar muito atrito.

**D4. Aviso é WARNING permanente com autofix.**
Nova entrada em `AutoFix` (mensagem com as duas normas) e novo `case` em `autoFixElemento` que define `base` = norma da remissão, entra no histórico e revalida. Sem dispensa pelo usuário. O WARNING não bloqueia salvar (validação de aviso, não de erro).

**D5. Abertura é somente leitura.**
Nenhum reducer de abertura altera o `base`. Um documento aberto com `base` vazio e uma remissão mantém o ERROR "informar a norma", que o usuário resolve pelo diálogo ou pelo próprio fluxo de edição.

**D6. "Corrigir agora" (informar norma) deixa de reescrever links existentes.**
`atualizaReferenciaElemento` usa uma regex que, com `base` vazio, casa **qualquer** `<a href>` — inclusive o `<a class="lexml-remissao-externa" href="#" data-urn>` — e o troca por um link comum, perdendo atributos e deixando o registro órfão. Passa a: definir só o `base` quando o artigo já tem remissão externa; mexer no texto apenas para gerar a frase (artigo sem texto) ou inserir a citação quando não há nenhuma referência. A regex deixa de casar links com `data-urn`/classe de remissão.

**D7. `formataNumero` aceita sufixo composto.**
O número com hífen (ex.: `2158-35`) tem a parte inicial formatada com separador de milhar e o sufixo preservado (`2.158-35`); entrada não numérica retorna o próprio texto, nunca `NaN`.

## Risks / Trade-offs

- [Registro com entradas órfãs faz D1 contar errado] → o bug de D6 era a principal fonte de órfãs e é corrigido junto; teste de unidade cobre registro com órfã.
- [Abertura exibir ou não o aviso depende de a abertura revalidar o artigo] → a task de validação confere o caminho `load`/`getElementos` e, se preciso, inclui a mensagem no mesmo ponto que já injeta mensagens extras ao carregar.
- [Janela entre D1 (registro) e D2 (texto)] → o aviso só aparece quando o texto é sincronizado; aceitável, pois o preenchimento só ocorre com `base` vazio, caso em que o aviso não se aplica.
- [WARNING permanente incomoda em textos legítimos que citam outra norma] → decisão de produto; o autofix de um clique reduz o custo.
- [Corpus de medição é enviesado para documentos oficiais bem formados] → não prova ausência total de falsos positivos, mas o aviso existe justamente para divergências reais.
