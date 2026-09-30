# Mapa do Editor de Proposições

Visão de ponta a ponta do editor de proposições: o que falta implementar e o que ainda depende de especificação. Cobre todos os componentes, não só o `lexml-eta`.

## 1. Componentes e responsabilidades

| Componente | Responsabilidade | Consome |
|---|---|---|
| `lexml-eta` | Componente de edição do documento articulado (estrutura, texto, remissões, revisão, formulários de metadados) e conversão de/para LexML | — |
| `eta-backend-services` | Geração do PDF da proposição e recuperação dos dados do PDF | — |
| LexEdit | Aplicação/editor usado no **Senado Federal**. Liga os componentes e provê as funções externas à edição | `lexml-eta`, `eta-backend-services` |
| Infoleg Editor | Aplicação/editor usado na **Câmara dos Deputados**. Liga os componentes e provê as funções externas à edição | `lexml-eta`, `eta-backend-services` |

### Formato da proposição

A proposição é salva como um **PDF/A** com os metadados embutidos no arquivo anexo `documento-articulado.xml`.

## 2. Legenda

- **Prioridade:** Essencial | Desejável
- **Situação:** Implementado | Parcial | A implementar (especificado) | Depende de especificação
- **Responsável:** `lexml-eta` | `eta-backend-services` | LexEdit | Infoleg Editor

## 3. Mapa de funcionalidades

### A. Edição do documento (`lexml-eta`)

| Funcionalidade | Prioridade | Situação | Referência |
|---|---|---|---|
| | | | |

### B. Metadados e formulários (`lexml-eta`)

| Funcionalidade | Prioridade | Situação | Referência |
|---|---|---|---|
| | | | |

### C. Formato e persistência do documento (`lexml-eta`)

| Funcionalidade | Prioridade | Situação | Referência |
|---|---|---|---|
| | | | |

### D. Geração e leitura do PDF (`eta-backend-services`)

| Funcionalidade | Prioridade | Situação | Referência |
|---|---|---|---|
| | | | |

### E. Funcionalidades da aplicação (LexEdit e Infoleg Editor)

Mesmo quando duplicadas, cada aplicação tem sua própria situação.

| Funcionalidade | Prioridade | LexEdit | Infoleg Editor | Referência |
|---|---|---|---|---|
| Abrir a proposição (PDF) de um repositório | | | | |
| Salvar a proposição (PDF) em um repositório | | | | |
| Nomear / renomear a proposição no repositório | | | | |
| Excluir a proposição do repositório | | | | |
| Enviar a proposição a terceiros | | | | |
| Enviar a proposição a outra aplicação | | | | |

### F. Transversais

| Funcionalidade | Prioridade | Responsável | Situação | Referência |
|---|---|---|---|---|
| | | | | |

## 4. Especificidades por casa legislativa

Regras próprias de cada casa, independentes do componente que as implementa.

### Senado Federal

| Assunto | Regra / especificidade | Afeta |
|---|---|---|
| | | |

### Câmara dos Deputados

| Assunto | Regra / especificidade | Afeta |
|---|---|---|
| | | |

## 5. Pendências de especificação

| # | Pergunta | Área | Casa | Quem decide | O que bloqueia |
|---|---|---|---|---|---|
| 1 | Existem regras para o local no fecho do documento? | B | | | |
| 2 | Tem sentido a configuração de destino do projeto? Talvez apenas para substitutivos. | B | | | |
| 3 | Quais são os tipos de autoria? | B | | | |

## 6. Decisões tomadas

| Data | Decisão | Contexto |
|---|---|---|
| | | |
