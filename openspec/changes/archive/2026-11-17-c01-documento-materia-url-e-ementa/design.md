# Design

## Context

A Tela 2b (arquivada em `2026-11-16-c01-nova-proposicao-cd-lista-documentos`) mostra, por documento, título, identificação, autor, data e um ícone que abre `urlInteiroTeor` (obrigatório). `renderDocumento` cria o link só quando `urlInteiroTeorSegura` devolve um endereço `http(s)` ou relativo, e o filtro (`documentosMateria.ts`) compara o título e a linha de detalhe. Ver proposal.md - Why.

## Goals / Non-Goals

**Goals:**
- Renomear e tornar opcional o endereço do documento, acrescentar `ementa` e `tooltipDocumento`.
- Manter filtro, seleção e segurança do link como estão.

**Non-Goals:**
- Mudar o contrato dos dois serviços (`onListarDocumentos`/`onObterTextoDocumento`) ou a obrigatoriedade na `CD`.
- Mostrar a ementa na faixa "Fonte selecionada" ou na Tela 2.
- Renomear o requisito "Apresentação e filtro dos documentos da lista", que hoje só trata da apresentação (pendência de nome, fora desta change).

## Decisions

1. **Renomear sem alias**: `urlInteiroTeor` deixa de existir, e não há compatibilidade com o nome antigo. O host ainda não consome o contrato (a branch não foi mergeada), então o custo é só interno. Alternativa descartada: aceitar os dois nomes, que deixaria o contrato ambíguo.
2. **Ementa em até 2 linhas**: CSS `line-clamp` (2) em `.np-doc-ementa`, com o atributo `title` trazendo o texto completo. O texto vem como texto puro (binding do Lit), sem HTML.
3. **Filtro**: `textoPesquisavel` passa a incluir a `ementa`. A linha de detalhe (`linhaDetalheDocumento`) não muda, porque a ementa tem linha própria.
4. **Tooltip**: o texto é `tooltipDocumento` quando preenchido (não vazio após `trim`), senão "Abrir o documento em outra aba". O mesmo valor alimenta `title` e `aria-label`. A constante do texto padrão fica em `documentosMateria.ts`, junto com uma função pura `tooltipDoDocumento(doc)`.
5. **Função auxiliar**: `urlInteiroTeorSegura` vira `urlDocumentoSegura` e aceita `undefined`. Ela é interna e não faz parte da API pública (a allowlist de tipos de `validate-package.mjs` não muda, porque `DocumentoMateria` já está nela).
6. **Mock da demo**: os 6 documentos ganham `urlDocumento` e ementas de exemplo; um fica sem `ementa`, um sem `urlDocumento` e um com `tooltipDocumento`, para exercitar os opcionais no E2E.

## Risks / Trade-offs

- [Host que já implemente o serviço com `urlInteiroTeor` quebra silenciosamente: o ícone some] → avisar o Infoleg Editor antes do merge; a doc da API registra o nome novo.
- [Ementas muito longas aumentam a altura da lista] → limite de 2 linhas e rolagem já existente.
- [Texto do tooltip vindo do host pode ser longo ou vazio] → vazio cai no padrão; o tamanho é responsabilidade do host.
