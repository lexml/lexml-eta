# Proposal

## Why

O componente `<lexml-nova-proposicao>` obtém comissões, verificação de proposição e texto estruturado por `fetch` em URLs configuradas, e a importação de arquivo ainda é simulada. Um host que já tem cliente HTTP autenticado (axios, interceptadores, tokens) não consegue reaproveitá-lo: precisa expor endpoints no formato exato esperado pelo componente. Delegar essas quatro origens a callbacks opcionais deixa o host decidir como obter os dados e permite plugar o parser real da importação sem mudar o componente.

## What Changes

- `ConfigNovaProposicao` ganha quatro callbacks opcionais: `onObterComissoes`, `onVerificarProposicao`, `onObterTexto` e `onImportarArquivo`.
- Quando o callback existe, o componente o usa no lugar da origem correspondente; quando não existe, o comportamento atual permanece (`fetch` na URL e, na importação, o erro de parser simulado).
- Os callbacks devolvem resultados de domínio, não respostas HTTP: `undefined` indica "inexistente" (verificação) ou "indisponível" (texto); promise rejeitada equivale à falha de comunicação e cai nos mesmos estados de erro de hoje.
- A obrigatoriedade das três URLs passa a ser por origem: cada uma exige o callback **ou** a URL. A URL sem callback continua sendo erro de configuração que nomeia o item ausente.
- `onImportarArquivo` substitui o simulador de parser: com ele, o `texto` devolvido vai no resultado e os `erros` levam à Tela 3. Sem ele, o erro simulado continua.
- O contrato de `onImportarArquivo` é `{ texto?, erros }`; não há campo de avisos de conversão (a Tela 3 só trata falha e não há onde exibi-los num sucesso).
- Os tipos dos callbacks e de seus argumentos e resultados são exportados por `src/index.ts`.
- A documentação da API (seção 11) e `docs/requisitos/componente-nova-proposicao.md` (seção 9) passam a descrever os callbacks.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `nova-proposicao`: os requisitos "Configuração e resultado do componente", "Verificação de proposição e de medida provisória" e "Importação de arquivo" passam a prever o callback como alternativa à URL em cada origem, e a importação deixa de ser exclusivamente simulada; quatro requisitos novos descrevem os callbacks e o contrato de cada um. Os requisitos "Destino do documento" e "Texto inicial da edição" não mudam de texto: o callback substitui a origem de dados que eles citam, conforme "Callbacks opcionais para as origens de dados".

## Impact

- Código: `src/components/nova-proposicao/urlsNovaProposicao.ts` (tipo e validação), `nova-proposicao.component.ts` (`buscarComissoes`, `consultar`, `buscarTexto`, `converterArquivoImportado` e a mensagem de erro de comunicação da importação) e `src/index.ts` (exports de tipos).
- API pública: acréscimo compatível, sem remoção. Um host que só informa URLs continua funcionando.
- Testes: componente (`test/componente/nova-proposicao/`), validação de configuração (`modulosNovaProposicao.test.ts`) e E2E (avaliado em `tasks.md`).
- Documentação: `docs/api-componente-lexml-eta.md`, `docs/requisitos/componente-nova-proposicao.md`.
- Coordenação com o host (`lexeditweb-editor`): nada é exigido; o uso dos callbacks é opcional.
