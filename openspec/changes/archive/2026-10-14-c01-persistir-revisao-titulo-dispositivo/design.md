# Design

## Context

Ver proposal.md (Why). Estado atual, verificado no código e por reprodução:

- Em modo de revisão, mudar o título gera uma `RevisaoElemento` de modificação com a operação `alterado`. O merge com a `develop` já faz `isMesmoTextoETitulo` valer na reconciliação das operações, então uma alteração só de título não é descartada na sessão.
- Ao salvar, `montaRevisaoDeDispositivo` (`revisaoArticulacao.ts`) grava o conteúdo anterior como um `p` solto, só com `elementoAntesRevisao.conteudo.texto`. O título anterior não é gravado.
- Ao abrir, `lerRevisoesArticulacao` lê só `lida.p` (`textoAnterior`) e `reconstroiRevisoes` monta `antes` com esse texto; `antes.tituloDispositivo` sai igual ao do dispositivo atual. Resultado: descrição "Texto do dispositivo foi alterado" e rejeição sem efeito.
- O esquema `lexedit.xsd` define `RevisaoArticulacao` com um `xsd:choice` de um único filho: `lexml:p` ou um dispositivo (`Artigo`, `Paragrafo`, `Inciso`, `Alinea`, `Item` etc.). `DispositivoType` aceita `TituloDispositivo` (0..1) e `Rotulo` e `id` opcionais. A exclusão já usa um dispositivo como filho.
- O título só existe em Artigo, Parágrafo, Inciso, Alínea e Item (spec `titulo-dispositivo`), todos `DispositivoType`.
- Um spike descartável com o `jsonix-lexml` 2.0.0 real e `lexedit.xsd` como entrada validou cinco formas de wrapper, incluindo a ausência de `id`, a ausência de `TituloDispositivo` e título com conteúdo misto (itálico e subscrito); o `tojson` devolve cada uma na propriedade `inciso` ou `artigo` da revisão.

## Goals / Non-Goals

**Goals:**
- Gravar e ler o estado anterior (texto e título) de uma revisão `alterado` com uma regra única, sem mudar o esquema.
- Aceitar na leitura o `p` solto, por tolerância, sem voltar a gravá-lo.
- Descrição da marca e rejeição iguais na sessão e no documento reaberto.

**Non-Goals:**
- Heurística para reconstituir o título em arquivos de desenvolvimento gerados antes desta change (a informação não existe; não há arquivos em produção).
- Alterar `lexedit.xsd`, `lexml-simples.xsd` ou a gramática do atributo `revisao`.
- Revisão de título para agrupadores, caput ou omissis, que não têm título.

## Decisions

**D1. Estado anterior sempre como dispositivo, sem mudar o esquema.**
O filho de `RevisaoArticulacao` em uma revisão `alterado` é sempre um dispositivo do mesmo tipo do dispositivo revisado, sem `id`, com o texto anterior (em `p`, ou no `Caput` quando é artigo) e com o `TituloDispositivo` anterior quando havia título. A mesma regra vale para `alterado` isolado e combinado com `movido`, `transformado` ou `alteracaoRotulo`.

Alternativas descartadas: (a) atributo novo `tituloAnterior` em `RevisaoArticulacao`, que exigiria alterar o XSD, o mapeamento do conversor e coordenar versões, e não carrega formatação (itálico, subscrito) sem escapes; (b) descartar a revisão de título ao salvar com aviso, que mantém a perda silenciosa de dado; (c) híbrido, com `p` solto quando o título não mudou e wrapper quando mudou, que obriga o leitor a conhecer duas formas e uma convenção implícita (`p` solto significa "título inalterado"). Como o formato ainda não foi publicado e nenhum outro sistema lê ou grava o `p` solto, o custo de migrar agora é o menor possível.

**D2. Sem título no filho significa que não havia título.**
O wrapper descreve o estado anterior completo: com `TituloDispositivo`, aquele era o título; sem ele, não havia título. Não há caso "sem informação" na escrita. Na leitura, um `p` solto (forma abreviada não gravada mais) é tolerado e lido como título anterior igual ao atual, o que mantém fixtures e arquivos de teste feitos à mão funcionando.

**D3. Condição de escrita.**
O wrapper é gravado em toda revisão cuja operação inclui `alterado`, sem depender de o título ter mudado. A operação continua `alterado`; o tipo do wrapper é o do dispositivo revisado (o tipo original de uma transformação já está em `transformado;<tipo>`).

**D4. Montagem do wrapper à mão, não via `buildJsonixDispositivo`.**
Só o título e o texto anterior são necessários, sem rótulo, `id`, filhos ou remissões. O objeto é `{ TYPE_NAME: DispositivoType, tituloDispositivo?, p | lXcontainersOmissis: [Caput] }` com a propriedade nomeada pelo tipo em minúsculas, como a exclusão já faz. O título usa `buildJsonixContentFromHtml`, o mesmo do texto anterior, preservando as formatações permitidas.

**D5. Leitura.**
`lerRevisoesArticulacao` passa a reconhecer, em revisões não excluídas, um filho de dispositivo (propriedade entre `NOMES_DISPOSITIVO_NA_REVISAO`) e extrair dele `textoAnterior` (do `p` ou, em artigo, do `Caput`) e `tituloAnterior`, distinguindo "título ausente" de "filho sem informação de título" (o `p` solto tolerado): um campo opcional com três estados (não informado, ausente, valor). `reconstroiRevisoes` aplica o título ao `antes`, e a descrição da marca (`buildDescricaoRevisaoDeModificacao`) já compara título e texto.

**D6. Rejeição.**
`restauraTextoETitulo` (já existente) restaura `antes.tituloDispositivo`; com o `antes` correto, a rejeição de uma revisão reaberta passa a ter o mesmo efeito da sessão. Não há mudança no reducer.

**D7. Verificação.**
Unitário de ida e volta (salvar, reabrir, rejeitar) para adicionar, editar, remover e título com formatação; integração com o conversor real e `lexedit.xsd` como entrada; E2E com captura do blob de salvar (precedente: CT-L-06 em `grupo-l-caput-undo.cy.ts`) e reabertura pelo `#fileUpload`.

## Risks / Trade-offs

- [Arquivos de desenvolvimento gerados antes da change perdem a informação de título] → Documentado como fora do escopo; não há arquivos em produção, e o `p` solto continua legível.
- [A mudança toca toda revisão `alterado`, não só as de título] → Testes que esperam o `p` solto são ajustados e as fixtures de `demo/doc/` são regeneradas por `criarDocumentoArticulado`; a leitura tolerante evita quebra enquanto isso.
- [Leitores externos (por exemplo o `lexeditweb`) que venham a esperar um `p` filho direto na revisão `alterado`] → Nenhum sistema lê ou grava esse formato hoje; comunicar a convenção a quem mantém a especificação e documentá-la em `11-revisao-da-hierarquia.md`.
- [Título vazio (`''`) não é gravado na articulação] → Um título anterior vazio é tratado como ausência de título no wrapper; o reabrir devolve "sem título", equivalente para o usuário.
- [O CLI sai com código 0 mesmo quando a conversão falha] → O teste de integração já verifica a existência do arquivo de saída e usa `lexedit.xsd` como entrada; os casos de título entram nele.
- [`Artigo` guarda o texto no `Caput`] → O wrapper do artigo usa `Caput`, como na articulação; o teste de integração cobre artigo e inciso.
