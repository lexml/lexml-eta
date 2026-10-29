## Context

As marcas de revisão de texto da justificação são `InsBlot`/`DelBlot` (`moduloRevisao.ts`). O valor do formato é `usuario|date|id-revisao`, refletido nos atributos `usuario` (só o nome), `date` (`AAAA-MM-DD HH:mm:00 `, horário local, com um espaço no fim) e `id-revisao` (UUID). Uma mesma revisão pode gerar vários elementos com o mesmo `id-revisao`:
- quando atravessa formatações;
- na substituição, em que o `del` e o `ins` da mesma ação compartilham o id.

Aceitar ou rejeitar pela dica age sobre o grupo `tag + id-revisao`, e o contador conta os grupos.

No LexML, `ins`/`del` são `genInline`, com `id` do tipo `xsd:ID`, único no documento. `RevisaoTextual` (`lexedit.xsd`) tem `refIdRevisao`, `refIdUsuario` e `data` (`xsd:dateTime`), todos obrigatórios.

Hoje `montaJustificacao` remove os `del` e `criaInline` reduz `ins`/`del` ao texto (exceção temporária da #991). `Usuarios` só é gravado com revisões da hierarquia (`montaMetadadoLexEdit`). `setContent` já chama `atualizaStatusElementosRevisao` (contador, botões, `RevisaoJustificativa`), mas não o alerta global de revisão, que só `updateTexto` avalia.

## Goals / Non-Goals

**Goals:**
- Ida e volta exata das marcas, com o agrupamento, o autor (identificador, nome e sigla) e a data.
- Um único lugar que define o `id` de cada marca, usado tanto na `Justificacao` quanto em `RevisoesTextuais`.

**Non-Goals:**
- Revisões de texto fora da justificação: o texto livre do anexo de parecer não é gravado, e o texto da nota de rodapé não tem revisão.
- Alerta ou pendência de revisão de texto na aba Avisos, além do alerta global de revisão que já existe.
- Mudar o comportamento de aceitar e rejeitar.

## Decisions

**D1. `id` por elemento: `_rt<id-revisao>_<n>`.** `n` é a posição, a partir de 1, do elemento entre os de mesmo `id-revisao`, na ordem do documento, contando `ins` e `del` juntos. Assim o id é único mesmo na substituição (`del` e `ins` com o mesmo `id-revisao`). Há um `RevisaoTextual` por elemento, porque `refIdRevisao` aponta para um único `id`.
- Ao abrir, `id-revisao` é o id sem o prefixo `_rt` e sem o sufixo `_<n>`, o que recompõe o grupo.
- Um id `_rt…` sem sufixo, como o exemplo da especificação 09, usa o resto como `id-revisao`.
- Marca sem `id-revisao`, ou com caracteres que não cabem num `NCName`, recebe um UUID novo ao salvar e forma um grupo sozinha.

*Alternativas:*
- **Ids sequenciais (`_rt1`…) com o agrupamento reconstruído por autor e data:** junta revisões distintas feitas no mesmo minuto.
- **Um `RevisaoTextual` por grupo:** os demais elementos do grupo ficariam com `id` sem referência, e o esquema não tem como listar vários ids num `RevisaoTextual`.

**D2. Uma só varredura do HTML gera a justificação e as revisões.** `montaJustificacao` passa a devolver também as revisões de texto encontradas (`id`, autor e data) na mesma passada que monta o `content`. Hoje `buildJsonixFromProjetoNorma` já chama `montaJustificacao`; a partir desse resultado, `montaMetadadoLexEdit` grava `RevisoesTextuais`, os usuários e a pendência. *Alternativa:* uma segunda função que recalcule os ids. Ela pode divergir da primeira, a mesma lição das assinaturas e da autoria (CLAUDE.md, item 13).

**D3. Identificador e sigla do usuário na própria marca.** O valor do formato ganha dois campos no fim: `usuario|date|id-revisao|id-usuario|sigla-usuario`, refletidos nos atributos `id-usuario` e `sigla-usuario`.
- O módulo recebe o `Usuario` do estado, e não só o nome, nos dois pontos que hoje passam o nome (`editor-texto-rico.component.ts`).
- Marca sem `id-usuario` (recebida do host antes desta change) usa o nome como identificador, como `getIdUsuario` faz nas revisões da hierarquia.
- Gravar a sigla na marca dispensa guardar os usuários lidos do arquivo. A marca reaberta e salva de novo devolve o mesmo registro.

*Alternativa:* deduzir o id pelo nome do usuário atual. A marca de outro usuário perde o id ao salvar de novo.

**D4. Data.** Ao salvar, o `date` da marca, sem o espaço final, passa por `formatDateTimeToIso`. Data inválida vira o instante do salvamento, como nas revisões da hierarquia. Ao abrir, `parseIsoToDateTime` devolve o horário local no formato que a dica já exibe.

**D5. Usuários.** `montaMetadadoLexEdit` grava `Usuarios` com a união, por `idUsuario`, dos usuários das revisões da hierarquia (`dados.revisoes.usuarios`) e dos autores das marcas, nessa ordem. Basta haver uma das duas fontes para gravar o grupo. Na leitura, `lerUsuarios` já existe e é reaproveitado.

**D6. Pendência no montador.** "Resolver marcas de revisão de texto." é acrescentada quando a varredura da D2 encontra alguma marca. Fica depois da de remissões inválidas e antes da de revisões da hierarquia, na ordem da especificação 13. No anexo de parecer a justificação não chega ao montador, então a pendência não existe.

**D7. Marca só com o cursor.** O Quill pode deixar um `ins`/`del` que só contém o caractere de cursor (`﻿`), que `getRevisoes` já ignora. A varredura trata essa marca como texto comum: grava o conteúdo sem `ins`/`del`, sem `RevisaoTextual` e sem pendência.

**D8. Leitura.**
- `lerMetadadoLexEdit` passa a ler `RevisoesTextuais` com os usuários, num mapa `refIdRevisao → {usuario, data}`.
- `lerJustificacao(documento, revisoesTextuais)` recria `ins`/`del` com os atributos do editor (`usuario`, `date`, `id-revisao`, `id-usuario`, `sigla-usuario`), que o `clipboard.convert` do `setContent` reconhece pelos `formats` dos blots.
- Usuário não registrado tem o `refIdUsuario` como id e nome, como nas revisões da hierarquia.
- `ins`/`del` sem `RevisaoTextual` vira marca do usuário "Anônimo", com a data e hora da abertura (decisão do usuário). O `id-revisao` sai do `id` quando ele tem o prefixo `_rt`, para que os trechos da mesma revisão continuem sendo aceitos ou rejeitados juntos; sem esse prefixo, ou sem `id`, a marca recebe um UUID novo.
- Os atributos do editor são aplicados num passo final de `lerJustificacao`, como a numeração das notas de rodapé; `ins`/`del` dentro do texto de uma nota ficam só com o conteúdo, como ao salvar.

**D9. Estado do editor depois de abrir.** `setContent` já atualiza contador, botões e `RevisaoJustificativa`. `abrirDocumentoArticulado` passa a chamar também `alertaGlobalRevisao()` depois do `setContent`, como já faz com `buildAlertaJustificativa()` (invariante aj, CLAUDE.md). O alerta é avaliado depois das limpezas de `inicializarEdicao`.

**D10. Testes E2E.**
- **Fixture:** `demo/doc/teste_revisao_texto.json`, gerado pelo `getDocumentoArticulado()` real com o Quill real, como os fixtures da #991 e da #993. Tem uma inclusão, uma substituição e uma exclusão que atravessa um negrito com uma nota de rodapé.
- **Spec Cypress:** abre o fixture, confere as marcas, o autor no atributo `usuario`, o contador e o alerta, aceita todas e confere que `getDocumentoArticulado()` não tem `ins`/`del` nem a pendência.
- **Dica de revisão:** passar o mouse sobre a marca para abrir a dica é frágil no Cypress (`docs/guia-cypress.md`). Por isso o agrupamento ao rejeitar uma revisão pela dica fica no teste de componente com o Quill real, que chama `revisar` com os elementos do grupo como faz a dica.

## Risks / Trade-offs

- **[Risco] O HTML entregue ao host ganha `id-usuario` e `sigla-usuario` nas marcas novas.** → Mitigação: os dois são atributos a mais, e o host trata o HTML como texto. A coordenação com o `lexeditweb-editor` fica registrada no TODO.
- **[Risco] `optimize` de `InlineRevisionBaseFormat` copia só `date` e `usuario` para o vizinho antes de reformatar.** → Mitigação: o `format` seguinte reaplica o valor completo, já com os campos novos. Um teste de componente funde duas marcas vizinhas e confere os atributos.
- **[Risco] Um `id-revisao` lido de fora pode colidir com outro id do documento.** → Mitigação: o prefixo `_rt` não é usado por nenhum outro id gravado pelo editor (dispositivos, `_tabela<n>`, `_ri…`, `_<base>-exc<n>`). O XSD da integração confere a unicidade.
- **[Trade-off] Um `RevisaoTextual` por elemento repete autor e data dentro do grupo.** É o que o esquema permite sem lista de ids.
- **[Achado do E2E, corrigido] O contador da justificação voltava a `0` depois de abrir.** O `lexml-eta-switch-revisao` reescrevia o badge a cada evento Redux com a contagem de revisões da articulação, também nos editores de texto rico. Ao abrir, o `adicionarAlerta` do alerta global (`setTimeout(0)`) desfazia a contagem gravada por `setContent`; ao vivo, qualquer clique na articulação fazia o mesmo. O teste de componente lia o badge antes do `setTimeout`. → Correção: a propriedade `contaRevisoesArticulacao` do switch, ligada só no editor da articulação. Nos editores de texto rico, o badge fica só a cargo de `atualizaStatusElementosRevisao`, que conta pelo Quill.

## Migration Plan

Não há migração.
- Arquivos salvos antes desta change não têm marcas, porque eram descartadas, e abrem como hoje.
- Marcas recebidas do host sem `id-usuario` continuam funcionando, com o nome como identificador.
