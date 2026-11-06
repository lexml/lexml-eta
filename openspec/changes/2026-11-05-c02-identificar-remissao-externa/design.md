# Design

## Context

A detecção automática de remissão externa é disparada em dois pontos de `EditorComponent`: `detectarRemissoesAoSairDaLinha` (saída de linha e rede de segurança de `getProjetoAtualizado()`) e `adicionarElemento` (Enter). Os dois chamam `coordenarDeteccaoExterna`, que usa `lexmlLinkerClient.detectarRemissoesExternas`. O cliente cria o worker sob demanda, na primeira chamada.

O editor recebe a configuração por `.lexmlEtaConfig` do `<lexml-eta>` (`lexml-eta.component.ts` → `articulacao`/editor). O diálogo de remissão (`remissaoDialog.ts`) e a colagem de link não usam o lexml-linker.

## Goals / Non-Goals

**Goals:**
- Um único ponto de decisão, que impeça também a criação do worker.
- Padrão `true`, sem mudança para quem não informa o campo.

**Non-Goals:**
- Qualquer mudança além de desligar a detecção automática.

## Decisions

### 1. Campo `identificarRemissaoExterna = true` em `LexmlEtaConfig`

O campo fica junto dos outros da sessão, com inicializador `true` na classe. Como o hospedeiro pode atribuir um objeto literal, o editor testa `=== false`. Assim, um campo ausente conta como ligado.

*Alternativa:* um atributo do elemento `<lexml-eta>`. Descartada: os demais ajustes de sessão ficam em `lexmlEtaConfig`, e o hospedeiro já monta esse objeto.

### 2. Decisão no início de `coordenarDeteccaoExterna`

A primeira linha do método passa a ser `if (this.lexmlEtaConfig?.identificarRemissaoExterna === false) return;`. Esse é o ponto por onde passam a saída de linha e o Enter, e o worker é criado só na primeira chamada ao cliente, então ele nunca chega a existir.

Com `true` ou sem o campo, o código segue exatamente o caminho de hoje. `detectarRemissoesAoSairDaLinha` e `adicionarElemento` não mudam, inclusive a parte interna (`adicionarRemissaoInternaAction`) e o registro em `uuidsJaDetectadosExternamente`.

A configuração é lida a cada chamada. Se o hospedeiro trocar a configuração no meio da sessão, o novo valor vale a partir da próxima detecção.

### 3. Testes

- **Unitário** (`deteccaoRemissaoBlur.test.ts`, que já substitui `lexmlLinkerClient.detectarRemissoesExternas`): com `false`, o cliente não é chamado na saída de linha nem no Enter, e a remissão interna continua sendo despachada; sem o campo, o cliente é chamado. O editor desse arquivo é criado sem construtor, então a configuração entra por `Object.defineProperty` na instância, sem passar pelo setter do Lit.
- **E2E** (Cypress, `cypress/e2e/remissao-externa/`): no demo, alterar o campo no objeto de configuração já existente do `<lexml-eta>` antes de `novaProposicao`, digitar a citação completa, sair da linha e conferir que `win.Worker` não foi chamado (espião no `onBeforeLoad` do `cy.visit`) e que não há `a.lexml-remissao-externa`. Só a ausência do link não basta, porque passaria antes de a detecção assíncrona responder. As suítes atuais (padrão `true`) cobrem o caso ligado.

## Risks / Trade-offs

- [Outros pontos que um dia usem o lexml-linker] → hoje só a detecção usa. Um uso novo deve respeitar o mesmo campo; isso fica registrado no comentário do campo.
