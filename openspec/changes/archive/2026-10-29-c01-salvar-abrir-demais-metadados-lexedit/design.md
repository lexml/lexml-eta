## Context

`lexedit:Metadado` declara cinco atributos gerais (`schemas/lexedit.xsd`): `dataUltimaModificacao` (`xsd:dateTime`), `aplicacao`, `versaoAplicacao`, `urnDocumentoReferenciado` (`xsd:string`) e `anexoParecer` (`xsd:boolean`), todos opcionais. Os dois últimos já são gravados: `montaMetadadoLexEdit` os escreve a partir de `DadosLexEdit`, e só quando há dados, porque o conversor também é chamado sem eles pelos testes e pelo modelo. `lerMetadadoLexEdit` os lê de forma tolerante, e `abrirDocumentoArticulado` os aplica depois de `inicializarEdicao`.

`Proposicao.dataUltimaModificacao` tem nome parecido, mas é o valor do campo "Data" do fecho (invariante w do `CLAUDE.md`), e não uma data de modificação. Ele não serve de fonte nem de destino deste atributo.

Os testes de ida e volta comparam o documento inteiro em três níveis:
- **modelo:** `criarDocumentoArticulado(reaberto, …, dados)` contra o salvo;
- **integração:** o `MetadadoProprietario` depois de `toxml`/`tojson` pelo CLI real, validado com `lexedit.xsd`;
- **componente:** `getDocumentoArticulado()` duas vezes, antes e depois de reabrir.

`formatDateTime`/`formatDateTimeToIso` (`util/date-util.ts`) já produzem o `xsd:dateTime` com fuso local das revisões.

## Goals / Non-Goals

**Goals:**
- Gravar `dataUltimaModificacao` com o instante de cada salvamento feito pelo editor.
- Ler o atributo de forma tolerante e expô-lo ao host numa propriedade somente leitura.
- Validar o atributo na ida e volta pelo CLI `jsonix-lexml` e pelo `lexedit.xsd`.

**Non-Goals:**
- `substitutivo` (retirado do esquema na #1017; ver proposal).
- Preencher `aplicacao` e `versaoAplicacao`, que ficam para outra issue.
- Rastrear a última edição (o instante gravado é o do salvamento).
- Exibir a data na interface do editor.

## Decisions

**D1. A data nasce no componente e chega ao montador por `DadosLexEdit`.** `getDocumentoArticulado` (`lexml-eta.component.ts`) passa `dataUltimaModificacao` com o instante atual, e `montaMetadadoLexEdit` grava o valor recebido, como faz com `anexoParecer`. Sem o campo (conversor chamado sem os dados do editor), o atributo é omitido. O leitor devolve o valor lido no mesmo campo de `DadosLexEdit`, então `criarDocumentoArticulado(reaberto, …, dados)` regrava a data do arquivo.
- Com isso, os testes de modelo e de integração seguem comparando o documento inteiro sem mexer no relógio.
- *Alternativa:* gerar a data dentro de `montaMetadadoLexEdit`. O conversor deixaria de ser determinístico e cerca de vinte comparações de ida e volta quebrariam.

**D2. Formato.** `formatDateTimeToIso(formatDateTime(new Date()))`: ISO 8601 com precisão de segundos e o fuso local da máquina, igual à data das revisões (`RevisaoArticulacao`/`RevisaoTextual`). Um só formato de data e hora no arquivo.

**D3. Leitura tolerante.**
- `lerMetadadoLexEdit` aceita o atributo quando ele tem a forma de um `xsd:dateTime` (data, `T`, hora, frações opcionais e fuso opcional) e `Date.parse` o reconhece.
- O valor é guardado **como gravado**, sem reformatar, para que a propriedade mostre exatamente o que está no arquivo e para não alterar o documento na ida e volta.
- Ausente, vazio ou inválido vira `undefined`, sem afetar os outros grupos.
- `aplicacao` e `versaoAplicacao` não são lidos nem declarados em `MetadadoLexEdit`.

**D4. Propriedade pública `dataUltimaModificacaoDocumento`.**
- É um getter somente leitura de `LexmlEtaComponent`, sobre um campo privado. Não usa `@property`, porque não participa da renderização.
- O sufixo `Documento` evita a confusão com `Proposicao.dataUltimaModificacao` (o campo "Data" do fecho), que o host já recebe em `getProposicao()`.
- O campo é preenchido em `abrirDocumentoArticulado`, depois de `inicializarEdicao`, como os demais metadados lidos.
- É zerado em `descartarDocumentoAtual`, o que cobre `novaProposicao`, `abrirDocumentoArticulado` e `fecharDocumento` (spec `interface-lexml-eta`: todo método que inicia ou encerra um documento descarta o estado anterior).
- `getDocumentoArticulado` não altera o campo. Obter o documento é uma consulta, e o host pode descartar o resultado sem persistir. Quem precisa da data gravada a lê no documento devolvido.

**D5. Instante de cada salvamento, sem reaproveitar o lido.** Salvar sempre grava o instante atual, mesmo sem alterações no documento (decisão do usuário). Isso troca a fidelidade ao nome ("última modificação") pela simplicidade: rastrear edições exigiria observar articulação, justificação e todos os formulários.

**D6. Relógio nos testes de componente.** Os testes que salvam duas vezes e comparam os arquivos usam `sinon.useFakeTimers({ now, toFake: ['Date'] })`.
- Só `Date` é falsificado, então os `setTimeout` do Lit, do Quill e do Shoelace continuam reais.
- O relógio é restaurado no `afterEach`.
- *Alternativa:* retirar `dataUltimaModificacao` antes de cada comparação. Espalharia exclusões em vários testes e esconderia regressões no próprio atributo.

**D7. E2E.**
- **Fixture:** `demo/doc/teste_data_ultima_modificacao.json`, gerado por `getDocumentoArticulado()` com o componente real, não à mão.
- **Spec Cypress:** abre o fixture pela UI e confere que a propriedade tem o valor do arquivo. Depois, chama `getDocumentoArticulado()` e confere que o documento traz um instante posterior, com fuso, e que a propriedade não mudou.
- Não há download, como nos demais specs de abertura.

## Risks / Trade-offs

- **[Risco] O CLI pode normalizar o `xsd:dateTime` no `tojson`** (por exemplo, trocar o fuso por `Z`). Isso quebraria a igualdade da ida e volta. → Mitigação: a integração compara o `MetadadoProprietario` inteiro depois do CLI real. Se houver normalização, a leitura continua tolerante e a decisão de normalizar ao gravar volta ao usuário. As datas das revisões, que usam o mesmo formato, já passam na ida e volta.
- **[Risco] O host pode confundir `dataUltimaModificacaoDocumento` com `Proposicao.dataUltimaModificacao`.** → Mitigação: nomes diferentes, e as duas documentadas lado a lado em `docs/api-componente-lexml-eta.md`.
- **[Trade-off] Salvar sem alterar muda o arquivo.** Dois salvamentos seguidos geram arquivos diferentes no atributo. Isso fica explícito no requisito de ida e volta.
- **[Risco] Fuso da máquina nos testes.** → Mitigação: os testes calculam o valor esperado com as mesmas funções de `date-util.ts` ou conferem o formato, sem fixar um fuso.
