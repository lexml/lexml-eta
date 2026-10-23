# Proposal

## Why

Cada aplicação hospedeira do editor tem dados próprios que precisam acompanhar o documento (ex.: um título a imprimir antes da epígrafe) e que não cabem em nenhum grupo tipado do `lexedit:Metadado`. Hoje cada dado novo exige alterar o esquema, o conversor `jsonix-lexml` e o editor. Um grupo genérico de pares chave/valor permite a cada host registrar o que precisa, sem nova alteração de esquema (issue lexml/lexml-eta#1033).

## What Changes

- `schemas/lexedit.xsd`: novo grupo opcional `OutrosMetadados` em `Metadado`, com um ou mais `OutroMetadado` (atributo obrigatório `chave`, conteúdo texto), e unicidade da `chave` dentro do grupo.
- Modelo: `DadosLexEdit.outrosMetadados` (`Record<string, string>`) e o espelho em `MetadadoLexEdit`, no formato do conversor.
- Gravação (montador puro) e leitura (leitor tolerante) do grupo, no mesmo padrão dos demais grupos do `lexedit`.
- Componente `LexmlEtaComponent`: nova `@property` pública `outrosMetadados`, preenchida ao abrir um arquivo e gravada ao salvar, inclusive no anexo de parecer.
- Documentação: especificação do grupo em `docs/extensao-formato-lexml/` e atualização do exemplo completo.
- Valores estruturados (ex.: JSON) ficam a cargo do host, que os grava como texto no valor de uma chave (ex.: `jsonDadosComissao`).
- Fora do escopo: uso desses dados na impressão do PDF e qualquer mudança no `eta-backend-services`.
- Dependência externa: o `lexedit.xsd` novo precisa ser copiado para o projeto `jsonix-lexml`, que deve gerar uma nova versão; a integração com o conversor real só passa com essa versão.

## Capabilities

### New Capabilities

### Modified Capabilities
- `metadados-lexedit`: novos requisitos para o grupo `OutrosMetadados` (formato, gravação, leitura tolerante, unicidade das chaves, anexo de parecer, ida e volta pelo conversor e API pública).

## Impact

- `schemas/lexedit.xsd`, `docs/extensao-formato-lexml/`.
- `src/model/lexml/documento/documentoArticulado.ts`, `conversor/buildJsonixFromProjetoNorma.ts`, `conversor/buildProjetoNormaFromJsonix.ts`.
- `src/components/lexml-eta.component.ts` (coleta ao salvar e aplicação ao abrir) e a documentação da API (`docs/api-componente-lexml-eta.md`).
- Testes unitários, integração com o conversor real (`documentoArticulado.integration.ts`) e E2E.
- Hosts: sem impacto enquanto não usarem a propriedade; arquivos existentes continuam abrindo e o grupo é omitido quando vazio.
