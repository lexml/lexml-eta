# Proposal

## Why

A issue #1017 ajusta o esquema de metadados do LexEdit (`lexedit:Metadado`) antes que os grupos restantes sejam implementados: a flag `substitutivo` passa a ser desnecessária, e o arquivo precisa registrar o destino da proposição (colegiado apreciador) e a situação dos dispositivos de alteração na norma vigente (existentes × novos), hoje perdidos ao salvar e reabrir.

## What Changes

- **Remover** o atributo `substitutivo` de `lexedit:Metadado` (`schemas/lexedit.xsd`, especificação 13, exemplos XML/JSON, fixtures, `plano-xsd-lexedit.md`, `issues.md`). A propriedade `Proposicao.substitutivo` e o parâmetro `substitutivo` do componente permanecem: continuam validando `sigla`, `numero` e `ano`; só deixam de existir no formato salvo.
- **Prever** o atributo opcional `urnDocumentoReferenciado` (`xsd:string`) em `lexedit:Metadado`, apenas no esquema, na especificação e nos exemplos. O editor **não o preenche nem o lê** nesta change; isso é objeto de outra issue.
- **Novo** elemento `lexedit:SituacaoNaNormaVigente`, com `refIdsDispositivosExistentes` e `refIdsDispositivosNovos` (ids separados por espaço, ambos opcionais), cobrindo apenas dispositivos de bloco de alteração de norma. Salvar grava o elemento a partir de `existeNaNormaAlterada`; abrir reaplica o valor aos dispositivos.
- **Novo** elemento `lexedit:ColegiadoApreciador`, com `siglaCasaLegislativa` (`SF`/`CD`/`CN`), `tipoColegiado` (`Plenário`/`Comissão`) e `siglaComissao` opcional. Salvar grava o destino atual; abrir preenche o formulário de destino.
- **Remover** o tipo de colegiado "Plenário via Comissão" do editor: tipo `ColegiadoApreciador.tipoColegiado`, opção do formulário de destino (`destino.component.ts`), `docs/api-componente-lexml-eta.md` e o exemplo do cenário "Local derivado após mudança de destino". **BREAKING** para hosts que enviem `tipoColegiado: 'Plenário via Comissão'` em `Proposicao.colegiadoApreciador`: o valor deixa de ser reconhecido e cai no padrão (`Plenário`).
- Atualizar a regra do destino ao abrir (o destino passa a ser salvo), mantendo a regra de que o local do fecho lido do arquivo só vale enquanto o destino não for alterado.

## Capabilities

### New Capabilities
<!-- Nenhuma: os comportamentos entram em capabilities existentes. -->

### Modified Capabilities
- `metadados-lexedit`: formato de `lexedit:Metadado` sem `substitutivo`, com o atributo opcional `urnDocumentoReferenciado` (não preenchido) e os novos elementos `SituacaoNaNormaVigente` e `ColegiadoApreciador`, inclusive na ida e volta pelo conversor.
- `abrir-documento-articulado`: ao abrir, aplicar `existeNaNormaAlterada` aos dispositivos de alteração e preencher o formulário de destino a partir do `ColegiadoApreciador`.
- `salvar-documento-articulado`: o cenário "Local derivado após mudança de destino" deixa de usar "Plenário via Comissão" como exemplo.

## Impact

- `schemas/lexedit.xsd`, `docs/extensao-formato-lexml/` (especificação 13 para a situação na norma vigente, nova especificação `14-colegiado-apreciador.md`, exemplos, `plano-xsd-lexedit.md`, `issues.md`), `scripts/fixtures-lexedit/`.
- `src/model/lexml/documento/documentoArticulado.ts` (`MetadadoLexEdit`, `DadosLexEdit`), `conversor/buildJsonixFromProjetoNorma.ts`, `conversor/buildProjetoNormaFromJsonix.ts`.
- `src/components/lexml-eta.component.ts` (coleta e aplicação do destino), `lexml-eta-proposicao.component.ts` e a abertura da articulação (`abreArticulacao.ts`/`loadArticulacao.ts`) para reaplicar `existeNaNormaAlterada`.
- Compatibilidade: arquivos antigos sem os novos grupos continuam abrindo como hoje; um arquivo com `substitutivo` (nunca gravado pelo editor) é lido ignorando o atributo.
