# Mapa do Editor de Proposições

Visão de ponta a ponta do editor de proposições: o que falta implementar e o que ainda depende de especificação. Cobre todos os componentes, não só o `lexml-eta`.

Fora do escopo: o editor de pareceres (ver `AGENTS.md`).

## Índice

1. [Componentes e responsabilidades](#1-componentes-e-responsabilidades)
2. [Legenda](#2-legenda)
3. [Mapa de funcionalidades](#3-mapa-de-funcionalidades)
   - [A. Edição do documento](#a-edição-do-documento-lexml-eta)
   - [B. Metadados e formulários](#b-metadados-e-formulários-lexml-eta)
   - [C. Formato e persistência do documento](#c-formato-e-persistência-do-documento-lexml-eta)
   - [D. Geração e leitura do PDF](#d-geração-e-leitura-do-pdf-eta-backend-services)
   - [E. Funcionalidades da aplicação LexEdit](#e-funcionalidades-da-aplicação-lexedit)
   - [F. Funcionalidades da aplicação Infoleg Editor](#f-funcionalidades-da-aplicação-infoleg-editor)
   - [G. Transversais](#g-transversais)
4. [Especificidades por casa legislativa](#4-especificidades-por-casa-legislativa)
5. [Pendências de especificação](#5-pendências-de-especificação)
6. [Decisões tomadas](#6-decisões-tomadas)
7. [Fora do escopo](#7-fora-do-escopo)

## 1. Componentes e responsabilidades

| Componente | Responsabilidade | Consome |
|---|---|---|
| `lexml-eta` | Componente de edição do documento articulado (estrutura, texto, remissões, revisão, formulários de metadados) e conversão de/para LexML | — |
| `eta-backend-services` | Geração do PDF da proposição e recuperação dos dados do PDF | — |
| LexEdit | Aplicação/editor usado no **Senado Federal**. Liga os componentes e provê as funções externas à edição | `lexml-eta`, `eta-backend-services` |
| Infoleg Editor | Aplicação/editor usado na **Câmara dos Deputados**. Liga os componentes e provê as funções externas à edição | `lexml-eta`, `eta-backend-services` |

### Formato da proposição

A proposição é salva como um **PDF/A** com os metadados embutidos no arquivo anexo `documento-articulado.xml`.

[↑ Voltar ao índice](#índice)

## 2. Legenda

- **Prioridade:** Essencial | Desejável
- **Situação:** Implementado | Parcial | A implementar (especificado) | Depende de especificação
- **Responsável:** `lexml-eta` | `eta-backend-services` | LexEdit | Infoleg Editor

As prioridades e situações desta versão são uma proposta inicial, derivada dos requisitos de referência, das specs em `openspec/` e de uma leitura do código; devem ser validadas.

[↑ Voltar ao índice](#índice)

## 3. Mapa de funcionalidades

### A. Edição do documento (`lexml-eta`)

| Funcionalidade | Prioridade | Situação | Referência |
|---|---|---|---|
| Estrutura hierárquica (artigo, caput, parágrafo, inciso, alínea, item) com rótulos e renumeração automáticos | Essencial | Implementado | Requisitos formais (João Lima) |
| Inclusão de agrupadores de artigos (Parte a Subseção) conforme o contexto | Essencial | Implementado | `adicionarAgrupadorArtigoDialog.ts` |
| Recategorizar dispositivos (parágrafo em artigo, enumeradores de nível) | Essencial | Implementado | `transformaTipoElemento.ts`, `modificaTipoElementoWithTab.ts` |
| Mover dispositivos para destinos compatíveis | Essencial | Implementado | `moveElementoAcima.ts`, `moveElementoAbaixo.ts` |
| Blocos de alteração com omissis e nota (NR/AC) | Essencial | Implementado | `blocoAlteracaoAction.ts`, `atualizaNotaAlteracao.ts` |
| Técnica legislativa penal (Pena, Penalidade, Medida Administrativa, Infração) | Essencial | Depende de especificação | Requisitos formais (João Lima); não há tipo no modelo |
| Título de dispositivo (`TituloDispositivo`): adicionar, remover e editar | Essencial | Parcial (só apresenta o título; a edição está especificada) | Issue #1010, `eta-blot-titulo-dispositivo.ts` |
| Validação das regras de técnica legislativa (LC 95/1998) e dos rótulos | Essencial | Implementado | `src/model/lexml/regras/`, `validaArticulacao.ts` |
| Remissões internas (detecção, atualização na renumeração, invalidação) | Essencial | Implementado | `openspec/specs/remissao-interna/` |
| Remissões externas (criação manual e detecção automática pelo lexml-linker) | Desejável | Implementado | `openspec/specs/remissao-externa/`, `docs/planos/PLANO_INTEGRACAO_LEXML_LINKER_WASM.md` |
| Colar texto articulado com apoio do parser | Essencial | Implementado | `colarTextoArticuladoDialog.ts`, `colarUtil.ts` |
| Importar documento articulado (DOCX ou TXT) | Essencial | Depende de especificação | Requisitos gerais (João Lima) |
| Revisão do texto da justificação (marcar, aceitar, rejeitar) | Essencial | Implementado | `moduloRevisao.ts` |
| Revisão da articulação (marcar, aceitar, rejeitar) | Essencial | Parcial | `aceitaRevisao.ts` |
| Notas de rodapé na justificação | Desejável | Implementado | `moduloNotaRodape.ts` |
| Paginação da articulação em documentos grandes | Desejável | Implementado | `openspec/specs/paginacao-articulacao/` |
| Desfazer e refazer | Essencial | Implementado | `undo.ts`, `redo.ts` |
| Modo de anexo de parecer | Essencial | Implementado | |
| Alterar tipo da proposição (ex.: PL para PLP, MPV para PLV, PL para substitutivo ao PL) | Desejável | Depende de especificação | |

[↑ Voltar ao índice](#índice)

### B. Metadados e formulários (`lexml-eta`)

| Funcionalidade | Prioridade | Situação | Referência |
|---|---|---|---|
| Identificação: tipo, epígrafe, ementa e preâmbulo | Essencial | Implementado | `issues.md` #987 |
| Opções de impressão (inclui o tamanho de fonte configurável) | Essencial | Implementado | `02-opcoes-de-impressao.md`, issue #988 |
| Local e data do fecho | Essencial | Implementado | `03-fecho-local-e-data.md`, issue #989 |
| Autoria por parlamentares (com assinaturas) | Essencial | Implementado | `04-assinaturas.md`, issue #990 |
| Autoria por comissão (`ColegiadoAutor`) | Desejável | Depende de especificação (ainda não se sabe se será necessária) | `04-assinaturas.md` |
| Destino da proposição (substitutivos) | Desejável | Depende de especificação | Pendência 2 |
| Substitutivo e demais metadados do LexEdit | Desejável | A implementar (especificado) | `13-outros-metadados-do-lexedit.md`, issue #997 |
| Gestão de anexos | Desejável | A implementar (especificado) — ainda sem issue | `05-anexos.md` |
| Justificação com conteúdo rico | Essencial | Implementado (a persistência está no item C) | `06-justificacao-e-conteudo-rico.md` |
| Comentários | Desejável | A implementar (especificado) — ainda sem issue | `08-comentarios.md` |
| Registro de usuários (autores de revisões e comentários) | Desejável | A implementar (especificado) — ainda sem issue | `12-registro-usuarios.md` |

[↑ Voltar ao índice](#índice)

### C. Formato e persistência do documento (`lexml-eta`)

| Funcionalidade | Prioridade | Situação | Referência |
|---|---|---|---|
| Salvar e abrir identificação, epígrafe, ementa, preâmbulo, articulação e URN provisória | Essencial | Implementado | Issue #987 |
| Salvar e abrir opções de impressão | Essencial | Implementado | Issue #988 |
| Salvar e abrir local e data do fecho (com `LocalDataFecho`) | Essencial | Implementado | Issue #989 |
| Salvar e abrir autoria de parlamentares (com `AssinaturaTexto`) | Essencial | Implementado | Issue #990 |
| Salvar e abrir remissões internas inválidas | Essencial | Implementado | Issue #995 |
| Salvar e abrir a justificação (compatibilidade Quill e LexML) | Essencial | A implementar (especificado) | Issue #991 |
| Salvar pendências de protocolamento | Essencial | Parcial (só a estrutura; falta a pendência da justificação) | Issue #992 |
| Salvar e abrir notas de rodapé | Desejável | A implementar (especificado) | Issue #993 |
| Salvar e abrir revisões textuais e usuários | Desejável | A implementar (especificado) | Issue #994 |
| Salvar e abrir revisões da hierarquia | Desejável | A implementar (especificado) | Issue #996 |
| Salvar e abrir os demais metadados do LexEdit | Desejável | A implementar (especificado) | Issue #997 |
| Salvar e abrir anexos | Desejável | A implementar (especificado) — ainda sem issue | `05-anexos.md` |
| Salvar e abrir comentários | Desejável | A implementar (especificado) — ainda sem issue | `08-comentarios.md` |
| Salvar e abrir autoria por comissão | Desejável | Depende de especificação (ainda não se sabe se será necessária) | `04-assinaturas.md` |
| Validar a estrutura e converter para LexML (XML) | Essencial | Implementado | `test:documento-articulado:xml`, `schemas/lexedit.xsd` |

[↑ Voltar ao índice](#índice)

### D. Geração e leitura do PDF (`eta-backend-services`)

| Funcionalidade | Prioridade | Situação | Referência |
|---|---|---|---|
| Gerar o PDF/A da proposição com `documento-articulado.xml` anexo | Essencial | Parcial (o serviço gera PDF de emenda e de parecer; falta confirmar a proposição e o PDF/A) | `eta-backend-services/README.md` |
| Recuperar os dados (`documento-articulado.xml`) a partir do PDF | Essencial | Parcial (o serviço recupera o JSON de emenda e de parecer; idem) | `eta-backend-services/README.md` |
| Converter LexML XML em jsonix e vice-versa | Essencial | Implementado | `jsonix-lexml` |

[↑ Voltar ao índice](#índice)

### E. Funcionalidades da aplicação LexEdit

O repositório de documentos já existe no editor e não é escopo do `lexml-eta`.

| Funcionalidade | Prioridade | Situação | Referência |
|---|---|---|---|
| Abrir a proposição (PDF) de um repositório | Essencial | A implementar (especificado) | |
| Salvar a proposição (PDF) em um repositório | Essencial | A implementar (especificado) | |
| Nomear / renomear a proposição no repositório | Essencial | A implementar (especificado) | |
| Excluir a proposição do repositório | Essencial | A implementar (especificado) | |
| Enviar cópia para outro usuário do Senado | Essencial | A implementar (especificado) | |
| Salvar proposição no SEDOL | Essencial | A implementar (especificado) | |
| Abrir proposição do SEDOL | Essencial | A implementar (especificado) | |
| Visualizar proposição salva | Essencial | A implementar (especificado) | |
| Visualizar proposição em edição | Essencial | A implementar (especificado) | |
| Criar nova proposição | Essencial | A implementar (especificado) | |
| Salvar e recuperar rascunho de proposição | Essencial | A implementar (especificado) | |
| Baixar PDF de proposição | Essencial | A implementar (especificado) | |
| Importar arquivo de proposição | Essencial | A implementar (especificado) | |

[↑ Voltar ao índice](#índice)

### F. Funcionalidades da aplicação Infoleg Editor

O repositório de documentos já existe no editor e não é escopo do `lexml-eta`.

| Funcionalidade | Prioridade | Situação | Referência |
|---|---|---|---|
| Abrir a proposição (PDF) de um repositório | Essencial | Depende de especificação | |
| Salvar a proposição (PDF) em um repositório | Essencial | Depende de especificação | |
| Nomear / renomear a proposição no repositório | Desejável | Depende de especificação | |
| Excluir a proposição do repositório | Desejável | Depende de especificação | |
| Visualizar proposição salva | Essencial | Depende de especificação | |
| Visualizar proposição em edição | Essencial | Depende de especificação | |
| Criar nova proposição | Essencial | Depende de especificação | |
| Salvar e recuperar rascunho de proposição | Desejável | Depende de especificação | |
| Baixar PDF de proposição | Essencial | Depende de especificação | |
| Importar arquivo de proposição | Desejável | Depende de especificação | |

[↑ Voltar ao índice](#índice)

### G. Transversais

| Funcionalidade | Prioridade | Responsável | Situação | Referência |
|---|---|---|---|---|
| Uso em dispositivos móveis e nos navegadores Chrome, Firefox, Edge e Safari | Essencial | Todos | Depende de especificação | TAP (restrições) |

[↑ Voltar ao índice](#índice)

## 4. Especificidades por casa legislativa

Regras próprias de cada casa, independentes do componente que as implementa.

### Senado Federal

| Assunto | Regra / especificidade | Afeta |
|---|---|---|
| Tratamento do parlamentar | Senador / Senadora | `lexml-eta` (assinaturas) |

### Câmara dos Deputados

| Assunto | Regra / especificidade | Afeta |
|---|---|---|
| Tratamento do parlamentar | Deputado / Deputada | `lexml-eta` (assinaturas) |
| Demais regras | A levantar em momento posterior | — |

[↑ Voltar ao índice](#índice)

## 5. Pendências de especificação

| # | Pergunta | Área | Casa | Quem decide | O que bloqueia |
|---|---|---|---|---|---|
| 1 | Existem regras para o local no fecho do documento? | B | | | |
| 2 | Tem sentido a configuração de destino do projeto? Talvez apenas para substitutivos. | B | | | |
| 3 | Quais são os tipos de autoria? Inclui definir se será permitida assinatura não identificada. | B | | | |
| 4 | Será necessária a autoria por comissão (`ColegiadoAutor`)? A especificação existe, mas não há issue. | B, C | | | Autoria por comissão (edição e persistência) |
| 5 | Como tratar a técnica legislativa penal (Pena, Penalidade, Medida Administrativa, Infração), hoje sem tipo no modelo? | A | | | Técnica legislativa penal (essencial) |
| 6 | Quais funcionalidades de abrir, salvar, nomear, excluir e enviar a proposição cada aplicação já oferece? | E, F | | | |
| 7 | Como serão gerados e lidos o PDF/A da proposição e o `documento-articulado.xml` anexo? Verificar o estado em `eta-backend-services`. | D | | | |
| 8 | Quais regras específicas da Câmara dos Deputados precisam ser levantadas? | Todas | CD | | |
| 9 | Quais tipos de proposição permitem substitutivo? | B | | | Destino da proposição (nº 2) e metadado de substitutivo (#997) |
| 10 | Será necessário configurar a ordem padrão de escrita dos dispositivos nas remissões internas? | A | | | |

[↑ Voltar ao índice](#índice)

## 6. Decisões tomadas

| Data | Decisão | Contexto |
|---|---|---|
| 2026-09-30 | O editor de pareceres está fora do escopo deste mapa | TAP do LexEdit Pareceres; só se aproveita o que diz respeito ao editor de proposições |
| 2026-09-30 | Anexos não serão estruturados, apenas anexados | TAP lista a estruturação de anexos como não-escopo |
| 2026-09-30 | O repositório de documentos já existe nos editores; o `lexml-eta` não o cria nem o mantém | TAP lista a criação de repositórios como não-escopo |
| 2026-09-30 | Recategorizar caput de artigo como parágrafo de outro artigo está fora do escopo | Ver seção 7 |
| 2026-09-30 | Visão sumária da hierarquia (árvore) está fora do escopo | Ver seção 7 |
| 2026-09-30 | Gestão de modelos de texto com questionário associado está fora do escopo | Ver seção 7 |
| 2026-09-30 | Geração assistida do bloco de alteração está fora do escopo; o texto da norma virá do SIGEN | Ver seção 7 |
| 2026-10-06 | A técnica legislativa penal (Pena, Penalidade, Medida Administrativa, Infração) é essencial | Pendência 5 continua aberta: falta especificar como modelá-la |
| 2026-10-06 | O título de dispositivo é essencial | A edição está especificada na issue #1010 |
| 2026-10-06 | Recategorizar agrupadores (subir ou descer um nível da hierarquia) está fora do escopo | Ver seção 7 |
| 2026-10-06 | Importar documento articulado é essencial e aceita DOCX ou TXT (não PDF) | Os requisitos gerais (João Lima) citavam DOCX e PDF |
| 2026-10-07 | Exportar o texto completo em DOCX e em LexML está fora do escopo; o padrão de arquivo do editor é o PDF/A-3 com LexML anexado | Ver seção 7 |

[↑ Voltar ao índice](#índice)

## 7. Fora do escopo

Requisitos de referência que foram avaliados e deliberadamente não serão implementados.

| Funcionalidade | Motivo | Referência |
|---|---|---|
| Recategorizar caput de artigo como parágrafo de outro artigo (com tratamento dos demais parágrafos) | Decisão de escopo | Requisitos formais (João Lima) |
| Recategorizar agrupadores (subir ou descer um nível da hierarquia) | Decisão de escopo | Requisitos formais (João Lima) |
| Visão sumária da hierarquia (árvore, com indicação de notas e comentários) | Decisão de escopo | Requisitos formais (João Lima) |
| Gestão de modelos de texto com questionário associado | Decisão de escopo | Requisitos gerais (João Lima) |
| Exportar o texto completo em DOCX | Decisão de escopo | Requisitos gerais (João Lima) |
| Exportar o texto completo em LexML | Decisão de escopo | Requisitos gerais (João Lima) |
| Geração assistida do bloco de alteração a partir do texto da norma | O texto da norma virá do SIGEN | Requisitos gerais e formais (João Lima) |
| Edição de normas | Decisão de escopo | |
| Editor de pareceres | Fora do escopo do mapa | `AGENTS.md` |

[↑ Voltar ao índice](#índice)
