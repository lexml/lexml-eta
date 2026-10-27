# Tasks

## 1. Metadados do LexEdit: modo de anexo de parecer e documento referenciado

- [x] 1.1 Acrescentar `anexoParecer` e `urnDocumentoReferenciado` a `DadosLexEdit` e gravá-los em `montaMetadadoLexEdit` (`anexoParecer` sempre; a URN só com valor); verificar com testes unitários do montador, inclusive o caso sem referência.
- [x] 1.2 Ler os dois atributos em `lerMetadadoLexEdit` com leitor tolerante (ausente ou inválido assume `false` e sem referência); verificar com testes unitários de atributo ausente, inválido e válido.
- [x] 1.3 Cobrir a ida e volta pelo CLI real (`documentoArticulado.integration.ts`, validação com `schemas/lexedit.xsd`) e verificar com `npm run test:documento-articulado:xml`.
- [x] 1.4 Atualizar `docs/extensao-formato-lexml/13-outros-metadados-do-lexedit.md` (remover "o LexEdit ainda não o preenche nem o lê") e verificar relendo o documento contra a spec delta.

## 2. Autoridades, casa e tipo "não suportado"

- [x] 2.1 Acrescentar a `sigla` da casa às autoridades do vocabulário (`senado.federal`→`SF`, `camara.deputados`→`CD`, `congresso.nacional`→`CN`) e derivar dela a casa responsável e o predicado de tipo "não suportado" (tipo fora de `proposicoes()` de autoridade com casa); verificar com testes unitários de cada autoridade, de `federal`, de autoridade desconhecida, de norma e de proposição inativa.
- [x] 2.2 Restringir a criação às proposições suportadas (`proposicoes()` da visão da casa, sem filtrar inativos) e manter a recusa da casa oposta ao abrir; verificar com testes unitários do vocabulário e de `verificarUrnDaCasaDoEditor` (MPV e norma rejeitadas na criação, MPV aceita na abertura).
- [x] 2.3 Montar a pendência "Este tipo de documento não é completamente suportado pelo editor." no salvamento, recalculada pela URN; verificar com teste unitário e com a integração do 1.3.

## 3. Configuração da sessão

- [x] 3.1 Mover `usuario`, `configuracaoPaginacao`, `autoriaPadrao` e `opcoesImpressaoPadrao` para `LexmlEtaConfig` e remover `anexoParecer` dela; verificar que o projeto compila e que os testes de configuração passam.
- [x] 3.2 Aplicar a autoria padrão e as opções de impressão padrão somente em `novaProposicao`; verificar com testes de componente dos três cenários (padrão, informado vence, não se aplica ao abrir).

## 4. Reset e estado neutro

- [x] 4.1 Inventariar o que sobrevive de um documento para o outro no componente e no `rootStore` (revisões, remissões, alertas, histórico, mensagens críticas, anexos, outros metadados) e registrar o resultado no `design.md`; verificar com a lista conferida contra o estado após abrir dois documentos em sequência.
- [x] 4.2 Implementar o reset completo preservando a configuração da sessão; verificar com teste de reducer/componente que abre dois documentos e compara o estado.
- [x] 4.3 Implementar o estado neutro no `render()` (abas e divisor desabilitados, mensagem centralizada) e `fecharDocumento()`; verificar com teste de componente do estado neutro, da saída do neutro e do retorno.

## 5. Métodos novos e remoção do antigo

- [ ] 5.1 Implementar `novaProposicao(dados)` com validação dos obrigatórios e da autoridade antes de qualquer atribuição, e o aproveitamento só de articulação e ementa do modelo; verificar com testes de componente dos cenários da spec `interface-lexml-eta`.
- [ ] 5.2 Reescrever `abrirDocumentoArticulado` para aplicar `anexoParecer` e `urnDocumentoReferenciado` do arquivo e tratar o tipo "não suportado" (sem destino e autoria, erro na aba de avisos, salvar permitido); verificar com testes de componente e com a spec `abrir-documento-articulado`.
- [ ] 5.3 Tornar `inicializarEdicao` privado e remover `LexmlEtaParametrosEdicao` onde não for mais usado; verificar com a compilação e a suíte `npm test`.
- [ ] 5.4 Atualizar demos, `README`/guias e o texto da spec `anexos-proposicao` que citam a inicialização antiga; verificar buscando ocorrências de `inicializarEdicao` e `lexmlEtaConfig.anexoParecer` fora do código interno.

## 6. E2E (Cypress)

- [ ] 6.1 Avaliar a viabilidade à luz de `docs/guia-cypress.md` e escrever specs de: estado neutro, nova proposição e abertura de documento; verificar com `npm run cy:run:local` nos specs novos.
- [ ] 6.2 Escrever o spec de abertura de documento de tipo "não suportado" com fixture gerada por `criarDocumentoArticulado` (sem formulário de destino e autoria, erro na aba de avisos); verificar com `npm run cy:run:local`. Se o salvamento real não for viável em E2E, registrar a decisão e cobrir a pendência pela integração do 1.3.

## 7. Verificação final e coordenação

- [ ] 7.1 Rodar `npm run lint`, `npm test` e a integração com o CLI real; verificar saída sem falhas.
- [ ] 7.2 Redigir a nota de migração para o `lexeditweb-editor` (métodos novos, itens movidos para `lexmlEtaConfig`, `anexoParecer` no arquivo, recusa de MPV na criação) e verificar que cobre cada item **BREAKING** da proposta.
