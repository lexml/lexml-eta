# Plano — Criação do XSD auxiliar do LexEdit

## Objetivo

Criar `lexedit.xsd`, um esquema auxiliar (mencionado como pendência em [00-especificacao-esquema-lexedit.md](00-especificacao-esquema-lexedit.md), linha 15) que formaliza estruturalmente tudo que os arquivos `01` a `13` desta pasta hoje descrevem apenas em prosa e exemplos XML. O XSD cobre o namespace `http://www.lexml.gov.br/lexedit/1.0` — os elementos e atributos que o LexEdit registra dentro do ponto de extensão `MetadadoProprietario`/`lexedit:Metadado`.

**Não altera nada no esquema LexML oficial** (premissa central do documento `00`): o XSD novo é um artefato adicional, próprio deste projeto, que cobre apenas a "ilha" de conteúdo que o LexEdit ocupa.

**Uso principal: guiar a implementação da conversão jsonix** (`buildJsonixFromProjetoNorma.ts`/`buildProjetoNormaFromJsonix.ts`) — o XSD serve primeiro como contrato de referência para quem for implementar cada issue de `issues.md`, não como um validador rígido. Por isso o schema evita reforçar regras que o XSD expressa mal ou que não agregam nesse uso (condicionais cruzadas entre atributo e filho, gramáticas via regex): nesses casos, prefere-se um tipo simples e deixar a regra fina para o código. A validação offline dos exemplos da especificação (ver "Critério de aceite") continua sendo um uso secundário, útil para pegar erro de digitação/estrutura nos próprios exemplos.

## Decisões já tomadas (confirmadas com o usuário)

| Decisão | Escolha |
| --- | --- |
| Localização do plano | `docs/extensao-formato-lexml/`, ao lado dos arquivos `00`-`13` que ele formaliza |
| Localização do XSD | `schemas/lexedit.xsd` — pasta única e "flat" na raiz do repositório, reunindo todos os XSDs (o novo e os já vendorizados do LexML: `lexml-simples.xsd`, `math.xsd`, `xlink.xsd`, `xml.xsd`) sem subpastas, acessível ao código de teste mas fora de `test/` |
| Faseamento | XSD completo para os 13 grupos de uma vez, mesmo os ainda não implementados no salvar/abrir (trava o contrato antes de cada issue futura de `issues.md`) |
| Finalidade | Principalmente guiar a implementação da conversão jsonix (contrato de referência para `issues.md`); a validação offline/CI dos exemplos da especificação também é um uso direto do mesmo `lexedit.xsd` (facilitado por ele já estar em `schemas/`, junto dos demais XSDs usados pelos testes) — **não** integra a infraestrutura de validação em runtime do editor (`src/util/lexml-schema-validator/`, botão "Validar XSD" do demo) |
| Harness de validação | ~~Script Node com `xmllint-wasm`~~ — **correção**: `src/util/lexml-schema-validator/` (mencionado no `CLAUDE.md` como já existente) não está presente nesta branch (`develop`); `xmllint-wasm` não é dependência do projeto aqui. Reaproveitar `scripts/ValidarDocumentoLexml.java` (já existente, genérico — recebe XSD e XML como argumentos, não depende do CLI `jsonix-lexml`/`JSONIX_LEXML_CLI`) chamado via script Node/npm, exigindo só Java — já testado manualmente contra `lexedit.xsd` nesta sessão (ver "Critério de aceite") |
| Tipo de `idUsuario`/`refIdUsuario` | ~~`xsd:ID`/`xsd:IDREF`~~ — **decisão revertida**: voltou a ser `xsd:string` simples (sem checagem automática de referência pendurada), consistente com o restante do schema. A convenção `sf_fulano`/`sf_sicrana` (trocada de `sf:fulano`/`sf:sicrana` só por causa do `xsd:ID`) **também foi revertida** de volta para `sf:fulano`/`sf:sicrana` em todos os arquivos `08`, `09`, `11`, `12`, em `documento-articulado-exemplo.xml` e nas fixtures de `scripts/fixtures-lexedit/` — sem `xsd:ID`/`xsd:NCName` em jogo, não há mais razão para evitar o dois-pontos |
| Referência a elementos do namespace LexML (conteúdo embutido em `RevisaoArticulacao`, `Comentario`, etc.) | `xs:import namespace="http://www.lexml.gov.br/1.0" schemaLocation="lexml-simples.xsd"` — sem cópia própria; referencia direto a vendorização já existente em `schemas/` (que por sua vez importa `math.xsd`/`xlink.xsd`/`xml.xsd` da mesma pasta por caminho relativo), agora irmã de `lexedit.xsd`, todos no mesmo nível — os elementos são referenciados de verdade (`ref="Artigo"`, `ref="p"` etc.), não um `xsd:any` genérico |
| Conteúdo embutido em `lexedit:RevisaoArticulacao` | `xsd:choice` referenciando os grupos `LXhier` (Parte/Livro/Título/Subtítulo/Capítulo/Seção/Subseção/Artigo/Omissis/AgrupamentoHierárquico) e `LXcontainers` (Caput/Parágrafo/Inciso/Alínea/Item/DispositivoGenérico) de `lexml-simples.xsd`, mais `ref="p"` — cobre tanto a exclusão de um dispositivo em qualquer nível da hierarquia quanto a preservação de um `<p>` de texto original numa alteração |
| Conteúdo embutido em `lexedit:Comentario` | `ref="p"` (grupo `lexml-simples.xsd`) |
| `lexedit:Autoria` × `@tipo` | `xsd:choice` simples entre `lexedit:Parlamentares` e `lexedit:ColegiadoAutor`, ambos sem amarrar ao valor de `@tipo` — sem validação cruzada estrutural, consistente com o uso principal do XSD (guiar a conversão, não validar regras de negócio) |
| Atributo `revisao` (`lexedit:RevisaoArticulacao`) | `xsd:string` simples, sem `xsd:pattern` para a gramática (`adicionado`, `movido;<n>`, etc.) — a gramática fica documentada em prosa em `11-revisao-da-hierarquia.md`, não reforçada pelo XSD |
| Enumeração `sexo` | `xsd:enumeration`: `M`, `F` |
| Enumeração `lexedit:Autoria/@tipo` | `xsd:enumeration`: `Parlamentar`, `Comissão` |
| Enumeração `siglaCasaLegislativa` | `xsd:enumeration`: `SF`, `CD`, `CN` |
| Tipo de `lexedit:Anexo/@tipo` | `xsd:string` (sem enumeração fechada) |
| Tipo de `lexedit:Metadado/@data` (fecho) | `xsd:date` |

## Panorama do que precisa ser modelado

Levantamento feito lendo os 13 arquivos de especificação. Coluna "Status" indica se o grupo já está implementado no salvar/abrir (`src/model/lexml/documento/documentoArticulado.ts` hoje tem `local`, `data`, `opcoesImpressao`, `remissoesInternasInvalidas` e `pendencias`).

| Grupo (arquivo) | Elemento(s)/atributo(s) principais | Status no código |
| --- | --- | --- |
| `00` | `lexedit:Metadado` (elemento-raiz do namespace) | — |
| `01` | URN provisória (`Identificacao/@URN`, já no namespace LexML, fora do escopo do XSD lexedit) | Implementado |
| `02` | `lexedit:OpcoesImpressao` (todos os atributos opcionais) | **Implementado** |
| `03` | `lexedit:Metadado/@local`, `@data` | **Implementado** (+ `ParteFinal/LocalDataFecho` no LexML) |
| `04` | `lexedit:Autoria` > `lexedit:Parlamentares`/`lexedit:Parlamentar` ou `lexedit:ColegiadoAutor` | Não implementado |
| `05` | `lexedit:Anexos` > `lexedit:Anexo` | Não implementado |
| `06` | `Justificacao`/`PartePrincipal` (namespace LexML, fora do escopo do XSD lexedit) | Parcial (verificar) |
| `07` | `NotaDeRodape` (namespace LexML, fora do escopo do XSD lexedit) | Não implementado |
| `08` | `lexedit:Comentarios` > `lexedit:SequenciaComentario` > `lexedit:Comentario` | Não implementado |
| `09` | `lexedit:RevisoesTextuais` > `lexedit:RevisaoTextual` (+ `ins`/`del` do LexML) | Não implementado |
| `10` | `lexedit:RemissoesInternasInvalidas` (+ `Remissao` do LexML) | **Implementado** |
| `11` | `lexedit:RevisoesArticulacao` > `lexedit:RevisaoArticulacao` | Não implementado |
| `12` | `lexedit:Usuarios` > `lexedit:Usuario` | Não implementado |
| `13` | `lexedit:Metadado/@dataUltimaModificacao`, `@aplicacao`, `@versaoAplicacao`, `@substitutivo`, `@anexoParecer`; `lexedit:Pendencias` > `lexedit:Pendencia` | Parcial (`Pendencias` implementado) |

O XSD cobre todos os grupos acima, incluindo os ainda não implementados em código — os elementos/atributos do namespace LexML citados como dependência (`Justificacao`, `NotaDeRodape`, `ins`/`del`, `Remissao`, dispositivos da articulação) já pertencem ao esquema LexML oficial e não são redefinidos aqui.

## Estrutura de arquivos proposta

```
schemas/
  lexedit.xsd                       # o esquema novo — importa lexml-simples.xsd
  lexml-simples.xsd                 # movido de test/schemas/lexml/ — única cópia vendorizada
  math.xsd / xlink.xsd / xml.xsd    # movidos junto — dependências de lexml-simples.xsd
  README.md                         # idem
docs/extensao-formato-lexml/
  plano-xsd-lexedit.md               # este plano
scripts/
  ValidarDocumentoLexml.java         # já existente — reaproveitado, genérico (XSD + XML por args)
  validar-exemplos-lexedit.mjs       # harness Node — chama o script Java acima por fixture
  fixtures-lexedit/                  # um XML autocontido por grupo (02 a 13), raiz lexedit:Metadado
```

`schemas/` já foi criada nesta sessão, "flat" (sem subpasta `lexml/`): `test/schemas/lexml/` (com `lexml-simples.xsd`, `math.xsd`, `xlink.xsd`, `xml.xsd`, `README.md`) foi movida direto para `schemas/` via `git mv`, e a referência em `web-test-runner.documento-articulado.config.mjs` (usada por `scripts/ValidarDocumentoLexml.java`) já foi atualizada para o novo caminho. `schemas/lexedit.xsd` já foi escrito e validado nesta sessão (ver "Critério de aceite").

No `package.json`, o script `verify:xsd-lexedit` já foi adicionado, seguindo o padrão de `verify:wasm-br` já existente (`verify:xsd-vendorizado`, citado numa versão anterior deste plano, não existe neste projeto — engano herdado de uma nota do `CLAUDE.md` referente a outra branch).

## Etapas de execução

1. **Fixtures por grupo escritas à mão** em `scripts/fixtures-lexedit/*.xml` (uma por arquivo `02`-`13`, exceto `06`/`07`, que são elementos LexML nativos fora do namespace lexedit) — não por extração automática dos blocos ` ```xml ` do Markdown: vários exemplos são fragmentos ilustrativos incompletos (ex.: `refIdUsuario` sem o `lexedit:Usuarios` correspondente no mesmo trecho), então a extração automática geraria falsos negativos de IDREF pendurado. Cada fixture traz um comentário apontando o arquivo de origem; `11-revisao-da-hierarquia.xml` reúne todos os exemplos de operação do arquivo num só documento (só pode haver um `lexedit:RevisoesArticulacao` por `lexedit:Metadado`). ✅ Feito nesta sessão.
2. **`lexedit.xsd` escrito** (`schemas/lexedit.xsd`) — todos os grupos `00`→`13`, aplicando as decisões da tabela acima. ✅ Feito nesta sessão.
3. **Harness escrito** (`scripts/validar-exemplos-lexedit.mjs`): roda todo `.xml` de `scripts/fixtures-lexedit/` contra `schemas/lexedit.xsd` via `java scripts/ValidarDocumentoLexml.java`, e também extrai e valida o fragmento `lexedit:Metadado` de `documento-articulado-exemplo.xml` (reinjetando o `xmlns` do LexML, perdido ao separar o fragmento do `<LexML>` ancestral). Reporta OK/FAIL por arquivo e sai com código 1 se algo falhar. ✅ Feito nesta sessão, exposto como `npm run verify:xsd-lexedit`.
4. **Rodar e corrigir**: ✅ Feito — as 12 fixtures (11 arquivos + o fragmento de `documento-articulado-exemplo.xml`) validam. O harness foi testado também no caminho de falha (quebrando um tipo de propósito) para confirmar que detecta e reporta erro corretamente.
5. **Atualizar `00-especificacao-esquema-lexedit.md`**: ✅ Feito — linha que tratava o esquema auxiliar como pendência futura agora referencia `schemas/lexedit.xsd` como existente.
6. **Considerar (fora do escopo inicial, registrar como próximo passo)**: uma vez que o XSD esteja estável, avaliar com o usuário se compensa integrá-lo a um validador em runtime no editor — decisão já adiada nesta rodada.

## Critério de aceite

- `lexedit.xsd` existe e é um XSD válido — **verificado**: `java` compilando o schema sozinho (`SchemaFactory.newSchema`) sem erros.
- Todas as 12 fixtures (`scripts/fixtures-lexedit/*.xml`, mais o fragmento `lexedit:Metadado` extraído de `documento-articulado-exemplo.xml`) validam com sucesso via `npm run verify:xsd-lexedit` — **verificado**.
- O schema rejeita corretamente entrada inválida — **verificado** com dois casos negativos: valor fora da enumeração de `sexo` (`cvc-enumeration-valid`) e um `tamanhoFonte` não numérico (`cvc-datatype-valid.1.2.1`), este último via o próprio harness (confirma que ele detecta falha e sai com código 1, não só sucesso). O terceiro caso testado originalmente (`refIdUsuario` sem `lexedit:Usuario` correspondente, via `cvc-id.1`) não se aplica mais: `idUsuario`/`refIdUsuario` deixaram de ser `xsd:ID`/`xsd:IDREF` (ver tabela de decisões).

## Riscos conhecidos

- ~~O CLI real `jsonix-lexml` descarta o conteúdo de `MetadadoProprietario` (dentro do `xsd:any`) ao converter para XML.~~ **Resolvido no `jsonix-lexml` 2.0.0** (revisão `9c02a3d`), que inclui os mapeamentos gerados deste `lexedit.xsd`. O editor passou a gravar o conteúdo no formato do conversor (`any[{ name: lexedit:Metadado, value }]`, change `2026-09-23-c01-migrar-metadado-lexedit-formato-cli`). Agora o XSD também é exercitado contra a saída do CLI real: a suíte de integração (`npm run test:documento-articulado:xml`) valida com `lexedit.xsd` como entrada o XML gerado pelo CLI.
- Boa parte dos grupos ainda não tem implementação em código (tabela acima) — o XSD, ao cobrir tudo de uma vez, corre o risco de fixar um contrato que precise mudar quando a implementação de fato acontecer. Mitigação: tratar o XSD como uma primeira versão, revisável a cada issue de `issues.md` que for implementada.
