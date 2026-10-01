# Paginação de Articulação - Documentação Técnica

**Sistema de Divisão de Documentos Legislativos em Múltiplas Páginas**

---

## Metadados

| Item | Detalhes |
|------|----------|
| **Versão** | 1.0.0 |
| **Status** | ✅ Implementado |
| **Equipe** | LexML-ETA Development Team |
| **Última Atualização** | 24 março 2026 |

---

## 🎓 Como Usar Esta Documentação

**Para diferentes perfis:**

| Perfil | Recomendação | Seções Principais |
|--------|--------------|-------------------|
| **Novo desenvolvedor** | Entender o sistema rapidamente | [Visão Geral](#1-visão-geral) → [Arquitetura](#2-arquitetura-do-sistema) → [Arquivos](#arquivos-da-implementação) |
| **Mantenedor** | Modificar comportamento existente | [Fluxos de Dados](#3-fluxos-de-dados) → [Casos de Borda](#4-casos-de-borda) → [APIs](#5-referência-de-apis) |
| **Debugger** | Resolver problemas | [Casos de Borda](#4-casos-de-borda) → [Limitações](#6-limitações-e-problemas-conhecidos) |
| **Arquiteto** | Decisões técnicas e trade-offs | [Arquitetura](#2-arquitetura-do-sistema) → [Algoritmo de Paginação](#algoritmo-de-paginação) |

---

## 📋 Navegação Rápida

| Seção | Descrição |
|-------|-----------|
| [🎯 Visão Geral](#1-visão-geral) | O que é, casos de uso, conceitos-chave |
| [🏗️ Arquitetura](#2-arquitetura-do-sistema) | Componentes, modelo de dados, state Redux |
| [📊 Fluxos de Dados](#3-fluxos-de-dados) | Inicialização, navegação, atualizações com diagramas |
| [⚠️ Casos de Borda](#4-casos-de-borda) | Situações especiais e como são tratadas |
| [📚 APIs](#5-referência-de-apis) | Interfaces, tipos, métodos públicos |
| [🔒 Limitações](#6-limitações-e-problemas-conhecidos) | Restrições e problemas conhecidos |
| [📦 Arquivos](#arquivos-da-implementação) | Lista completa de arquivos |

---

## 📦 Arquivos da Implementação

### Arquivos Principais

| Arquivo | Linhas | Descrição |
|---------|--------|-----------|
| **Modelo de Dados** | | |
| `src/model/paginacao/paginacao.ts` | ~20 | Interfaces `ConfiguracaoPaginacao`, `PaginaArticulacao`, `RangeArtigos` |
| **Utilitários** | | |
| `src/redux/elemento/util/paginacaoUtil.ts` | ~220 | Lógica core de paginação: `configurarPaginacao`, `paginarArticulacao`, `findPaginaByIdDispositivo`, etc. |
| **Reducers Redux** | | |
| `src/redux/elemento/reducer/loadArticulacao.ts` | ~30 | Inicialização da paginação no carregamento do documento |
| `src/redux/elemento/reducer/selecionaPaginaArticulacao.ts` | ~20 | Seleção de página pelo usuário |
| `src/redux/elemento/reducer/atualizaPaginacao.ts` | ~185 | Atualização incremental da paginação após mudanças |
| **Actions Redux** | | |
| `src/model/lexml/acao/selecionarPaginaArticulacaoAction.ts` | ~10 | Action creator para seleção de página |
| **Componentes UI** | | |
| `src/components/editor/editor.component.ts` | ~50 | Seletor de página (dropdown), handlers de navegação |

### Índice de Arquivos por Funcionalidade

| Funcionalidade | Arquivo Principal | Linhas Chave |
|----------------|-------------------|--------------|
| **Inicialização** | `loadArticulacao.ts` | 26 |
| **Cálculo de Páginas** | `paginacaoUtil.ts` | 21-113 |
| **Seleção de Página** | `selecionaPaginaArticulacao.ts` | 4-21 |
| **Atualização Incremental** | `atualizaPaginacao.ts` | 31-185 |
| **UI Dropdown** | `editor.component.ts` | 749-801 |
| **Busca de Página** | `paginacaoUtil.ts` | 175-204 |

---

## 1. Visão Geral

### 1.1 O que é Paginação de Articulação?

A **Paginação de Articulação** é uma funcionalidade que divide documentos legislativos grandes em múltiplas páginas virtuais para manter a performance e usabilidade do editor. Quando uma proposição contém muitos dispositivos (artigos, parágrafos, incisos, etc.), o editor exibe apenas uma "página" por vez, permitindo navegação entre elas.

**⚠️ Distinção Importante:** A paginação **NÃO** é um simples "passar dispositivos para a próxima página". Em vez disso:
- A paginação é **calculada no carregamento** do documento com base em ranges de artigos
- Páginas são **recriadas dinamicamente** quando dispositivos são adicionados/removidos
- Cada página mantém sua própria lista de dispositivos
- A navegação between páginas **recarrega o editor** com os dispositivos da página selecionada

### 1.2 Casos de Uso

| Cenário | Descrição | Resultado |
|---------|-----------|-----------|
| **Documento Grande** | Proposição com 500 artigos (~3000 dispositivos) | Sistema divide em 3 páginas (ex: arts. 1-160, 161-320, 321-500) |
| **Navegação** | Usuário seleciona "Pág. 2 (arts. 161 a 320)" | Editor recarrega mostrando apenas dispositivos desse range |
| **Adição de Dispositivo** | Novo artigo adicionado na página 1 | Paginação atualizada incrementalmente |
| **Movimento entre Páginas** | Artigo movido da página 1 para página 2 | Ambas as páginas são atualizadas |
| **Modo de Revisão** | Dispositivo excluído mas visível em revisão | Dispositivo mantido na paginação para navegação |
| **Configuração Customizada** | Usuário define ranges específicos | Sistema usa ranges em vez de limite automático |

### 1.3 Conceitos-Chave

#### MAX_DISPOSITIVOS_PAGINA

```typescript
const MAX_DISPOSITIVOS_PAGINA = 1250;
```

Limite padrão de dispositivos por página. Inclui **todos** os dispositivos da hierarquia (artigo + caput + parágrafos + incisos + alíneas + itens).

#### Range de Artigos

```typescript
interface RangeArtigos {
  numInicial: number;  // Ex: 1
  numFinal: number;    // Ex: 160
}
```

Define quais artigos pertencem a uma página. O sistema sempre quebra em **fronteiras de artigos** - nunca no meio de um artigo (entre artigo e filhos).

#### PaginaArticulacao

```typescript
interface PaginaArticulacao {
  descricao: string;              // "Pág. 1 (arts. 1 a 160)"
  rangeArtigos: RangeArtigos;     // {numInicial: 1, numFinal: 160}
  dispositivos: Dispositivo[];    // Array com todos os dispositivos
  ids: string[];                  // LexmlIds para busca rápida
}
```

Representa uma página individual com sua descrição, range e lista completa de dispositivos.

#### Estado de Paginação (Redux)

```typescript
interface Paginacao {
  paginasArticulacao?: PaginaArticulacao[];  // Todas as páginas
  paginaSelecionada?: PaginaArticulacao;      // Página atual
}
```

Armazenado em `state.ui.paginacao`. Gerencia qual página está ativa e a lista completa.

---

## 2. Arquitetura do Sistema

### 2.1 Visão Geral dos Componentes

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          LexML-ETA Application                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                       Redux Store (State)                            │   │
│  │  ┌──────────────────────────────────────────────────────────────┐   │   │
│  │  │  ui.paginacao                                                 │   │   │
│  │  │  ├── paginasArticulacao: PaginaArticulacao[]                 │   │   │
│  │  │  └── paginaSelecionada: PaginaArticulacao                    │   │   │
│  │  └──────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    ▲                                        │
│                                    │ dispatch                               │
│  ┌────────────────────────────────┴────────────────────────────────────┐   │
│  │                        Reducers                                      │   │
│  │  ┌──────────────────┐  ┌──────────────────────┐  ┌───────────────┐  │   │
│  │  │ loadArticulacao  │  │ selecionaPagina...   │  │ atualiza...   │  │   │
│  │  │ (inicialização)  │  │ (navegação usuário)  │  │ (incremental) │  │   │
│  │  └──────────────────┘  └──────────────────────┘  └───────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    ▲                                        │
│                                    │ usa                                    │
│  ┌────────────────────────────────┴────────────────────────────────────┐   │
│  │                 paginacaoUtil.ts (Core Logic)                        │   │
│  │  ┌───────────────────────────────────────────────────────────────┐  │   │
│  │  │  configurarPaginacao()      - Entry point                     │  │   │
│  │  │  paginarArticulacao()       - Cálculo automático por limite   │  │   │
│  │  │  paginarArticulacaoBy...()  - Cálculo por ranges customizados  │  │   │
│  │  │  findPaginaByIdDispositivo() - Busca página por dispositivo    │  │   │
│  │  └───────────────────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    ▲                                        │
│                                    │ usa                                    │
│  ┌────────────────────────────────┴────────────────────────────────────┐   │
│  │                   editor.component.ts (UI)                           │   │
│  │  ┌───────────────────────────────────────────────────────────────┐  │   │
│  │  │  configurarSeletorPaginacao()  - Cria dropdown de páginas     │  │   │
│  │  │  onPaginaArticulacaoSelecionada() - Handler de seleção        │  │   │
│  │  │  carregarPaginaArticulacao()    - Recarrega editor             │  │   │
│  │  └───────────────────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Modelo de Dados

#### ConfiguracaoPaginacao

```typescript
export interface ConfiguracaoPaginacao {
  maxItensPorPagina?: number;    // Limite customizado (default: 1250)
  rangeArtigos?: RangeArtigos[]; // Ranges explícitos (sobrepõe limite)
}
```

Fornecido via `LexmlEtaParametrosEdicao.configuracaoPaginacao` na inicialização.

#### PaginaArticulacao

```typescript
export interface PaginaArticulacao {
  descricao: string;              // Label para UI: "Pág. 1 (arts. 1 a 160)"
  rangeArtigos: RangeArtigos;     // Range de artigos desta página
  dispositivos: Dispositivo[];    // Lista completa (inclui pais, filhos)
  ids: string[];                  // LexmlIds para busca O(1)
}
```

**Estrutura de dispositivos:**
- Primeira página: inclui ementa (se existir) + agrupadores pai + artigos do range
- Páginas subsequentes: inclui agrupadores entre artigos + artigos do range

---

## 3. Fluxos de Dados

### 3.1 Fluxo de Inicialização

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                        INICIALIZAÇÃO DA PAGINAÇÃO                                │
└──────────────────────────────────────────────────────────────────────────────────┘

[Usuario abre emenda]
           │
           ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ LexmlEtaComponent.inicializarEdicao(params)                                     │
│ └─ params.configuracaoPaginacao = { maxItensPorPagina: 1000, ... }             │
└──────────────────────────────────────────────────────────────────────────────────┘
           │
           ▼ dispatch(LOAD_ARTICULACAO)
┌──────────────────────────────────────────────────────────────────────────────────┐
│ loadArticulacaoReducer(state, action)                                           │
│ └─ articulacao = action.articulacao                                             │
│ └─ params = action.params                                                       │
└──────────────────────────────────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ configurarPaginacao(articulacao, params.configuracaoPaginacao)                   │
│ └─ paginacaoUtil.ts (linha 21)                                                 │
└──────────────────────────────────────────────────────────────────────────────────┘
           │
           ├── Se config.rangeArtigos existe ──► paginarArticulacaoByNumerosArtigos()
           │                                      (usando ranges explícitos)
           │
           └── Senão ────────────────────────► paginarArticulacao()
                                                 (calculando automaticamente)
           │
           ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ paginarArticulacao(articulacao, maxItensPorPagina)                               │
│ └─ paginacaoUtil.ts (linha 89)                                                  │
│                                                                                  │
│ 1. getDispositivoAndFilhosAsLista(articulacao)                                  │
│    └─ Retorna TODOS dispositivos em lista plana                                 │
│                                                                                  │
│ 2. Calcula numPaginas = ceil(total / maxItensPorPagina)                         │
│                                                                                  │
│ 3. Para cada página:                                                            │
│    └─ getArtigoFinal(artigoInicial, maxItens, dispositivos)                     │
│       └─ Encontra último artigo que "cabe" na página                            │
│       └─ Sempre quebra em fronteira de artigo (não separa pai de filho)         │
│                                                                                  │
│ 4. Para cada range calculado:                                                    │
│    └─ paginarArticulacaoByNumerosArtigos()                                      │
│       └─ Extrai dispositivos do range                                           │
│       └─ Adiciona pais do primeiro artigo (apenas página 1)                     │
│       └─ Adiciona dispositivos entre artigos (páginas 2+)                       │
│                                                                                  │
│ 5. buildPaginaArticulacao() para cada página                                    │
│    └─ Cria descrição ("Pág. 1 (arts. 1 a 160)")                                │
│    └─ Extrai ids para busca rápida                                              │
└──────────────────────────────────────────────────────────────────────────────────┘
           │
           ▼ Retorna Paginacao
┌──────────────────────────────────────────────────────────────────────────────────┐
│ {                                                                                │
│   paginasArticulacao: PaginaArticulacao[],    // Todas as páginas               │
│   paginaSelecionada: paginasArticulacao[0]   // Primeira página                 │
│ }                                                                                │
└──────────────────────────────────────────────────────────────────────────────────┘
           │
           ▼ armazenado em state.ui.paginacao
┌──────────────────────────────────────────────────────────────────────────────────┐
│ Redux State atualizado com Paginacao                                             │
└──────────────────────────────────────────────────────────────────────────────────┘
           │
           ▼ emit StateType.DocumentoCarregado
┌──────────────────────────────────────────────────────────────────────────────────┐
│ editor.component.stateChanged()                                                 │
│ └─ processarStateEvents()                                                       │
│    └─ case StateType.DocumentoCarregado:                                        │
│       ├─ configurarSeletorPaginacao()  ──► Cria dropdown UI                     │
│       └─ carregarArticulacao()        ──► Renderiza página 1                    │
└──────────────────────────────────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ Usuário vê documento com seletor de página (se houver múltiplas páginas)        │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Fluxo de Navegação (Seleção de Página)

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                         NAVEGAÇÃO ENTRE PÁGINAS                                  │
└──────────────────────────────────────────────────────────────────────────────────┘

[Usuário clica no dropdown e seleciona "Pág. 2"]
           │
           ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ editor.component.onPaginaArticulacaoSelecionada(numPagina)                       │
│ └─ numPagina = 2                                                                │
└──────────────────────────────────────────────────────────────────────────────────┘
           │
           ▼ dispatch(SELECIONAR_PAGINA_ARTICULACAO, { numPagina: 2 })
┌──────────────────────────────────────────────────────────────────────────────────┐
│ selecionaPaginaArticulacaoReducer(state, action)                                 │
│ └─ paginaSelecionada = state.ui.paginacao.paginasArticulacao[numPagina - 1]     │
│ └─ Emite StateType.PaginaArticulacaoSelecionada                                 │
│    └─ elementos = getElementosDaArticulacaoEElementosExcluidosEmModoDeRevisao() │
│       └─ Inclui dispositivos excluídos em revisão                               │
└──────────────────────────────────────────────────────────────────────────────────┘
           │
           ▼ Redux atualizado
┌──────────────────────────────────────────────────────────────────────────────────┐
│ editor.component.stateChanged()                                                 │
│ └─ processarStateEvents()                                                       │
│    └─ case StateType.PaginaArticulacaoSelecionada:                              │
│       ├─ carregarPaginaArticulacao(elementos, paginacao)                        │
│       │  └─ quill.setText('')                  Limpa editor                     │
│       │  └─ carregarArticulacao(elementos)    Renderiza nova página             │
│       │  └─ Marca primeira linha da página   Highlights página atual            │
│       │                                                                          │
│       └─ atualizarSeletorPaginacao(paginacao)                                   │
│          └─ select.selectedIndex = indexPaginaSelecionada                       │
└──────────────────────────────────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ Usuário vê dispositivos da Página 2                                             │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 3.3 Fluxo de Atualização Incremental

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                    ATUALIZAÇÃO INCREMENTAL DA PAGINAÇÃO                          │
└──────────────────────────────────────────────────────────────────────────────────┘

[Usuário adiciona novo dispositivo]
           │
           ▼ dispatch(ADICIONAR_ELEMENTO)
┌──────────────────────────────────────────────────────────────────────────────────┐
│ adicionaElementoReducer(state, action)                                           │
│ └─ Adiciona dispositivo à articulacao                                           │
│ └─ Emite StateType.ElementoIncluido                                             │
└──────────────────────────────────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ elementoReducer (root reducer)                                                   │
│ └─ Chama atualizaPaginacao(state, action)                                       │
└──────────────────────────────────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ atualizaPaginacaoReducer(state, action)                                          │
│ └─ paginacaoUtil.ts (linha 31)                                                  │
│                                                                                  │
│ 1. Verifica se há paginação (paginasArticulacao existe)                         │
│ 2. Verifica se ação deve ser ignorada (SELECIONAR_PAGINA_ARTICULACAO)           │
│ 3. Caso especial: página única                                                  │
│    └─ Atualiza dispositivos da única página com getDispositivoAndFilhosAsLista  │
│                                                                                  │
│ 4. Para cada evento em state.ui.events:                                         │
│    ├─ StateType.ElementoIncluido:                                               │
│    │  └─ incluiDispositivosNaPaginacao(state, elementos, action)               │
│    │     └─ Determina página de destino:                                        │
│    │        ├─ Se ação é ADICIONAR_ELEMENTO: usa action.atual                   │
│    │        ├─ Se ação é MOVER_ELEMENTO_ABAIXO: usa dispositivo anterior        │
│    │        ├─ Se ação é MOVER_ELEMENTO_ACIMA: usa dispositivo posterior        │
│    │        └─ Caso contrário: busca dispositivo anterior                      │
│    │     └─ Se movimento: remove da página de origem                           │
│    │     └─ Insere na posição correta na página de destino                     │
│    │                                                                          │
│    └─ StateType.ElementoRemovido:                                              │
│       └─ removeDispositivosDaPaginacao(state, elementos)                      │
│          └─ Remove dispositivos de TODAS as páginas                            │
│                                                                                  │
│ 5. atualizaIdsDasPaginas(paginasArticulacao)                                    │
│    └─ Reconstrói array ids[] para cada página                                  │
│                                                                                  │
│ 6. adicionaIdsDeDispositivosRemovidosEmModoDeRevisao(state)                     │
│    └─ Adiciona ids de dispositivos excluídos (para navegação em revisão)       │
│                                                                                  │
│ 7. Se ação é MOVER_ELEMENTO/UNDO/REDO:                                          │
│    └─ adicionaEventosDeMudancaDePaginaSeNecessario(state)                      │
│       └─ Se dispositivo mudou de página:                                       │
│          ├─ Atualiza paginaSelecionada                                          │
│          └─ Emite eventos: PaginaArticulacaoSelecionada, ElementoSelecionado,  │
│                          ElementoMarcado                                        │
└──────────────────────────────────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ Redux State atualizado com paginação modificada                                  │
│ └─ Se necessário: usuário é levado automaticamente para nova página             │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Casos de Borda

### 4.1 Documento Vazio (Emenda Onde Couber)

**Situação:** Usuário abre emenda para "emendar onde couber" (sem articulação prévia).

**Tratamento:** `buildPaginaArticulacaoVazia()` (linha 55)

```typescript
const buildPaginaArticulacaoVazia = (): PaginaArticulacao => {
  return {
    descricao: `Página única`,
    rangeArtigos: { numInicial: 0, numFinal: 0 },
    dispositivos: [],
    ids: [],
  };
};
```

**Resultado:** Página única com descrição "Página única", sem dispositivos. Conforme dispositivos são adicionados, a paginação é atualizada.

---

### 4.2 Página Única (Sem Paginação)

**Situação:** Documento tem menos dispositivos que `MAX_DISPOSITIVOS_PAGINA`.

**Tratamento:** `configurarSeletorPaginacao()` (linha 754)

```typescript
if (paginasArticulacao.length <= 1) {
  return;  // Não cria seletor UI
}
```

**Resultado:**
- Seletor de página NÃO é exibido
- Todos os dispositivos ficam na única página
- `isPaginaUnica(state)` retorna `true`

---

### 4.3 Inserção no Início de uma Página

**Situação:** Novo dispositivo inserido antes do primeiro dispositivo de uma página.

**Tratamento:** `incluiDispositivosNaPaginacao()` (linha 137)

```typescript
if (indexAtual === 0 && (action.posicao === 'antes' || action.novo?.posicao === 'antes')) {
  definirArticulacaoComoElementoAnteriorDoPrimeiroDispositivoInserido = true;
}
```

```typescript
if (definirArticulacaoComoElementoAnteriorDoPrimeiroDispositivoInserido) {
  elementos[0].elementoAnteriorNaSequenciaDeLeitura = createElemento(state.articulacao, false, false);
}
```

**Resultado:** Elemento anterior é definido como a própria Articulação (root), garantindo ordenação correta.

---

### 4.4 Movimento Entre Páginas

**Situação:** Usuário move um dispositivo da página 1 para a página 2 via `MOVER_ELEMENTO_ACIMA` ou `MOVER_ELEMENTO_ABAIXO`.

**Tratamento:** `incluiDispositivosNaPaginacao()` (linhas 140-149, 157-163)

```typescript
// Determina página de destino
if (action?.type === MOVER_ELEMENTO_ABAIXO) {
  const dAnterior = getDispositivoAnteriorNaSequenciaDeLeitura(novos[0], d => !isCaput(d))!;
  paginaDestino = findPaginaByUuidDispositivo(state.ui.paginacao, dAnterior.uuid!)!;
}

// Remove da página de origem
if ([MOVER_ELEMENTO_ABAIXO, MOVER_ELEMENTO_ACIMA].includes(action?.type)) {
  const paginaOrigem = findPaginaByUuidDispositivo(state.ui.paginacao, novo.uuid!);
  if (paginaOrigem) {
    paginaOrigem.dispositivos = paginaOrigem.dispositivos.filter(d => d.uuid !== novo.uuid);
  }
}
```

**Resultado:**
- Dispositivo é removido da página de origem
- Dispositivo é inserido na página de destino
- `adicionaEventosDeMudancaDePaginaSeNecessario()` detecta mudança e leva usuário para nova página

---

### 4.5 Modo de Revisão com Dispositivos Excluídos

**Situação:** Usuário está em modo de revisão e há dispositivos marcados como excluídos.

**Tratamento:** `insereElementosExcluidosEmModoDeRevisaoNaLista()` (linha 206)

```typescript
export const insereElementosExcluidosEmModoDeRevisaoNaLista = (
  elementos: Elemento[],
  elementosExcluidosEmModoDeRevisao: Elemento[]
): void => {
  elementosExcluidosEmModoDeRevisao.forEach(eExc => {
    const indexElementoAnterior = elementos.findIndex(
      ea => ea.uuid === eExc.elementoAnteriorNaSequenciaDeLeitura?.uuid
    );
    indexElementoAnterior > -1 && elementos.splice(indexElementoAnterior + 1, 0, eExc);
  });
};
```

**E na paginação:** `adicionaIdsDeDispositivosRemovidosEmModoDeRevisao()` (linha 70)

```typescript
const adicionaIdsDeDispositivosRemovidosEmModoDeRevisao = (state: any): void => {
  const dispositivosRemovidosEmModoDeRevisao = stateAux.revisoes?.filter(
    r => isRevisaoElemento(r) && isRevisaoDeExclusao(r as RevisaoElemento)
  ) as RevisaoElemento[];

  dispositivosRemovidosEmModoDeRevisao.forEach(revisao => {
    // Adiciona id à paginação para que dispositivo possa ser encontrado
    paginaDestino!.ids.splice(indexElementoAnterior + 1, 0, revisao.elementoAntesRevisao!.lexmlId!);
  });
};
```

**Resultado:**
- Dispositivos excluídos são incluídos na lista de elementos para renderização
- Seus ids são adicionados à paginação para permitir navegação
- Usuário pode ver e navegar para dispositivos excluídos em modo de revisão

---

### 4.6 Dispositivo Anterior Inserido Simultaneamente

**Situação:** Durante uma operação de adição em lote, o "dispositivo anterior" de um novo dispositivo pode ser outro dos dispositivos sendo inseridos (não está na paginação ainda).

**Tratamento:** `findPaginaDoDispositivoAnterior()` (linha 191)

```typescript
export const findPaginaDoDispositivoAnterior = (
  paginacao: Paginacao,
  dispositivo: Dispositivo
): PaginaArticulacao | undefined => {
  let pagina: PaginaArticulacao | undefined = undefined;
  let dRef: Dispositivo | undefined = dispositivo;

  // Loop para encontrar dispositivo anterior que ESTEJA em alguma página
  while (!pagina && dRef) {
    dRef = getDispositivoAnteriorNaSequenciaDeLeitura(dRef, d => !isCaput(d))!;
    dRef && (pagina = findPaginaByUuidDispositivo(paginacao, dRef.uuid!));
  }

  return pagina;
};
```

**Resultado:** Sistema busca recursivamente até encontrar um dispositivo anterior que já esteja em alguma página, ignorando dispositivos que acabaram de ser inseridos.

---

### 4.7 Dispositivos Entre Páginas (Agrupadores)

**Situação:** Entre o último artigo da página 1 e o primeiro artigo da página 2, pode haver agrupadores (Livro, Título, Capítulo, Seção) que devem ser incluídos.

**Tratamento:** `getDispositivosEntreUltimoArtigoAnteriorEPrimeiroArtigoDaPagina()` (linha 161)

```typescript
const getDispositivosEntreUltimoArtigoAnteriorEPrimeiroArtigoDaPagina = (
  dispositivos: Dispositivo[],
  indexArtInicial: number
): Dispositivo[] => {
  const artigoAnterior = getDispositivoAnteriorNaSequenciaDeLeitura(
    dispositivos[indexArtInicial],
    d => isArtigo(d)
  );
  if (!artigoAnterior) {
    return [];
  }
  const indexUltimoFilhoArtigoAnterior = dispositivos.indexOf(
    getUltimoFilho(artigoAnterior)
  );
  const dispositivosEntreArtigos = dispositivos.slice(
    indexUltimoFilhoArtigoAnterior + 1,
    indexArtInicial
  );
  return dispositivosEntreArtigos;
};
```

**Resultado:** Agrupadores entre artigos de páginas diferentes são incluídos na página seguinte para manter contexto.

---

### 4.8 Remoção de Dispositivo

**Situação:** Usuário remove um dispositivo.

**Tratamento:** `removeDispositivosDaPaginacao()` (linha 180)

```typescript
const removeDispositivosDaPaginacao = (state: State, elementos: Elemento[] = []): void => {
  const uuids = elementos.filter(e => !e.revisao).map(e => e.uuid!);
  state.ui?.paginacao?.paginasArticulacao?.forEach(pagina => {
    pagina.dispositivos = pagina.dispositivos.filter(d => !uuids.includes(d.uuid!));
  });
};
```

**Resultado:** Dispositivo é removido de TODAS as páginas (não apenas da página onde estava). Como cada dispositivo só está em uma página, isso efetivamente o remove da paginação.

---

### 4.9 Configuração com Ranges Explícitos

**Situação:** Usuário fornece `rangeArtigos` em vez de `maxItensPorPagina`.

**Tratamento:** `paginarArticulacaoByNumerosArtigos()` (linha 115)

```typescript
export const paginarArticulacaoByNumerosArtigos = (
  articulacao: Articulacao,
  rangeArtigos: RangeArtigos[]
): Dispositivo[][] => {
  const dispositivos = getDispositivoAndFilhosAsLista(articulacao);
  const result: Dispositivo[][] = [];

  for (const range of rangeArtigos) {
    const artInicial = range.numInicial;
    const artFinal = range.numFinal;

    const idArtInicial = 'art' + artInicial;
    const idArtFinal = 'art' + artFinal;

    const indexArtInicial = dispositivos.findIndex(d => d.id === idArtInicial);
    const indexArtFinal = dispositivos.indexOf(
      getUltimoFilho(dispositivos.find(d => d.id === idArtFinal)!)
    );

    const dispositivosPagina = dispositivos.slice(indexArtInicial, indexArtFinal + 1);

    if (!result.length) {
      dispositivosPagina.unshift(...getPaisDoPrimeiroArtigo(dispositivosPagina[0]));
      if (hasEmenta(articulacao)) {
        dispositivosPagina.unshift(articulacao.projetoNorma!.ementa!);
      }
    } else {
      dispositivosPagina.unshift(
        ...getDispositivosEntreUltimoArtigoAnteriorEPrimeiroArtigoDaPagina(
          dispositivos,
          indexArtInicial
        )
      );
    }

    result.push(dispositivosPagina);
  }

  return result;
};
```

**Resultado:** Páginas são criadas exatamente conforme ranges definidos, ignorando limite de dispositivos.

---

## 5. Referência de APIs

### 5.1 Interfaces TypeScript

#### ConfiguracaoPaginacao

```typescript
export interface ConfiguracaoPaginacao {
  maxItensPorPagina?: number;    // Default: 1250
  rangeArtigos?: RangeArtigos[]; // Se fornecido, sobrepõe maxItensPorPagina
}
```

#### RangeArtigos

```typescript
export interface RangeArtigos {
  numInicial: number;
  numFinal: number;
}
```

#### PaginaArticulacao

```typescript
export interface PaginaArticulacao {
  descricao: string;              // Ex: "Pág. 1 (arts. 1 a 160)"
  rangeArtigos: RangeArtigos;     // {numInicial: 1, numFinal: 160}
  dispositivos: Dispositivo[];    // Lista completa de dispositivos
  ids: string[];                  // LexmlIds para busca rápida
}
```

#### Paginacao (Redux State)

```typescript
export interface Paginacao {
  paginasArticulacao?: PaginaArticulacao[];
  paginaSelecionada?: PaginaArticulacao;
}
```

### 5.2 Funções Principais

#### configurarPaginacao

```typescript
export const configurarPaginacao = (
  articulacao: Articulacao,
  config?: ConfiguracaoPaginacao
): Paginacao
```

**Entrada:** Articulacao completa, configuração opcional

**Saída:** Objeto Paginacao com páginas calculadas e primeira página selecionada

**Usado em:** `loadArticulacaoReducer`

---

#### paginarArticulacao

```typescript
export const paginarArticulacao = (
  articulacao: Articulacao,
  maxItensPorPagina = MAX_DISPOSITIVOS_PAGINA
): Dispositivo[][]
```

**Entrada:** Articulacao, limite máximo de dispositivos

**Saída:** Array de arrays, onde cada sub-array é uma página

**Algoritmo:**
1. Calcula número de páginas necessário
2. Para cada página, encontra artigo final que "cabe"
3. Chama `paginarArticulacaoByNumerosArtigos()` com ranges calculados

---

#### paginarArticulacaoByNumerosArtigos

```typescript
export const paginarArticulacaoByNumerosArtigos = (
  articulacao: Articulacao,
  rangeArtigos: RangeArtigos[]
): Dispositivo[][]
```

**Entrada:** Articulacao, ranges de artigos

**Saída:** Array de arrays, onde cada sub-array é uma página

**Algoritmo:**
1. Para cada range, encontra index inicial e final
2. Extrai dispositivos com `slice()`
3. Primeira página: adiciona pais e ementa
4. Páginas subsequentes: adiciona dispositivos entre artigos

---

#### findPaginaByIdDispositivo

```typescript
export const findPaginaByIdDispositivo = (
  paginacao: Paginacao,
  id: string
): PaginaArticulacao | undefined
```

**Entrada:** Paginacao, lexmlId de dispositivo

**Saída:** Página que contém o dispositivo, ou undefined

**Complexidade:** O(n) onde n = número de páginas (geralmente pequeno)

---

#### findPaginaByUuidDispositivo

```typescript
export const findPaginaByUuidDispositivo = (
  paginacao: Paginacao,
  uuid: number
): PaginaArticulacao | undefined
```

**Entrada:** Paginacao, uuid de dispositivo

**Saída:** Página que contém o dispositivo, ou undefined

**Nota:** Busca por `uuid` em vez de `id` - uuid é permanente, id pode mudar na renumeração

---

#### isPaginaUnica / hasMultiplasPaginas

```typescript
export const isPaginaUnica = (state: any): boolean
export const hasMultiplasPaginas = (state: any): boolean
```

**Entrada:** Redux state

**Saída:** Boolean indicando se há página única ou múltiplas páginas

**Usado em:** Lógica de renderização de UI

---

### 5.3 Actions Redux

#### SELECIONAR_PAGINA_ARTICULACAO

```typescript
export const SELECIONAR_PAGINA_ARTICULACAO = 'SELECIONAR_PAGINA_ARTICULACAO';

export const selecionarPaginaArticulacaoAction = (numPagina: number) => ({
  type: SELECIONAR_PAGINA_ARTICULACAO,
  numPagina,
});
```

**Payload:** `numPagina` (1-based index)

**Efeito:** Atualiza `paginaSelecionada` no state, emite `StateType.PaginaArticulacaoSelecionada`

---

### 5.4 StateTypes Emitidos

| StateType | Quando é Emitido | Payload |
|-----------|------------------|---------|
| `DocumentoCarregado` | Documento é carregado inicialmente | `elementos: Elemento[]`, `ui.paginacao: Paginacao` |
| `PaginaArticulacaoSelecionada` | Usuário seleciona página ou mudança automática | `elementos: Elemento[]` (inclui excluídos em revisão) |

---

## 6. Limitações e Problemas Conhecidos

### 6.1 Limitações Atuais

1. **TODO: Garantir consistência** (linha 64-65 em `atualizaPaginacao.ts`)
   ```typescript
   // TODO: garantir que todo dispositivo na articulação esteja em alguma página
   // TODO: garantir que todo dispositivo removido em modo de revisão esteja em alguma página
   ```
   Há casos extremos onde dispositivos podem ficar "órfãos" da paginação.

2. **Algoritmo de busca de página anterior** (linha 191-204)
   O loop em `findPaginaDoDispositivoAnterior()` pode ser ineficiente em documentos muito grandes com muitos dispositivos consecutivos sendo inseridos.

3. **Cálculo de limite não é preciso** (linha 89-112)
   `getArtigoFinal()` usa heurística para encontrar página que "cabe" no limite, mas como inclui filhos, o número final de dispositivos pode variar significativamente de `MAX_DISPOSITIVOS_PAGINA`.

### 6.2 Problemas Conhecidos

1. **Dispositivos podem ficar em página "errada" durante operações complexas**
   Em operações de movimentação múltipla ou undo/redo complexo, dispositivos podem temporariamente ficar na página incorreta até a próxima atualização de paginação.

2. **Paginação não recalcula ranges após mudanças drásticas**
   Se um documento com 1000 artigos é reduzido para 100 artigos, a paginação mantém a estrutura original (várias páginas vazias) em vez de recalcular ranges.

3. **Navegação automática pode ser confusa**
   Quando um dispositivo é movido para outra página, o usuário é levado automaticamente para a nova página. Isso pode ser confuso se o usuário não esperava ser redirecionado.

---

## Conclusão

A paginação de articulação é uma feature robusta que permite editar documentos legislativos grandes dividindo-os em páginas baseadas em ranges de artigos. A arquitetura usa Redux para gerenciar estado e atualiza incrementais para manter performance.

**Princípios-chave:**
- Páginas são calculadas no carregamento e atualizadas incrementalmente
- Sempre quebra em fronteiras de artigo (nunca separa pais de filhos)
- Suporta configuração customizada por ranges ou limite de dispositivos
- Integra com modo de revisão para incluir dispositivos excluídos

**Para manutenção:**
- Lógica core está em `paginacaoUtil.ts`
- Reducer principal é `atualizaPaginacao.ts`
- UI está em `editor.component.ts` (seletor e handlers)

**Casos de borda documentados:** Todos os cenários especiais identificados estão na seção [Casos de Borda](#4-casos-de-borda).