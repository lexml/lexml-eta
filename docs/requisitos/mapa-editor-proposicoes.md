# Mapa do Editor de Proposições

Visão de ponta a ponta do editor de proposições: o que falta implementar e o que ainda depende de especificação. Cobre todos os componentes, não só o `lexml-eta`.

Fora do escopo: o editor de pareceres (ver `AGENTS.md`).

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

As prioridades e situações desta versão são uma proposta inicial, derivada dos requisitos de referência, das specs em `openspec/` e de uma leitura do código; devem ser validadas.

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
| Revisão de texto e da articulação (marcar, aceitar, rejeitar) | Essencial | Parcial | `aceitaRevisao.ts`, `moduloRevisao.ts` |
| Notas de rodapé na justificação | Desejável | Implementado | `moduloNotaRodape.ts` |
| Paginação da articulação em documentos grandes | Desejável | Implementado | `openspec/specs/paginacao-articulacao/` |
| Desfazer e refazer | Essencial | Implementado | `undo.ts`, `redo.ts` |

### B. Metadados e formulários (`lexml-eta`)

| Funcionalidade | Prioridade | Situação | Referência |
|---|---|---|---|
| Identificação: tipo, epígrafe, ementa e preâmbulo | Essencial | Implementado | `issues.md` #987 |
| Opções de impressão | Essencial | Implementado | `02-opcoes-de-impressao.md`, issue #988 |
| Local e data do fecho | Essencial | Implementado | `03-fecho-local-e-data.md`, issue #989 |
| Autoria por parlamentares (com assinaturas) | Essencial | Implementado | `04-assinaturas.md`, issue #990 |
| Autoria por comissão (`ColegiadoAutor`) | Desejável | Depende de especificação (ainda não se sabe se será necessária) | `04-assinaturas.md` |
| Destino da proposição (substitutivos) | Desejável | Depende de especificação | Pendência 2 |
| Substitutivo e demais metadados do LexEdit | Desejável | A implementar (especificado) | `13-outros-metadados-do-lexedit.md`, issue #997 |
| Anexos (apenas anexados, não estruturados) | Desejável | A implementar (especificado) — ainda sem issue | `05-anexos.md` |
| Justificação com conteúdo rico | Essencial | Parcial (editor existe; persistência no item C) | `06-justificacao-e-conteudo-rico.md` |
| Comentários | Desejável | A implementar (especificado) — ainda sem issue | `08-comentarios.md` |
| Registro de usuários (autores de revisões e comentários) | Desejável | A implementar (especificado) — ainda sem issue | `12-registro-usuarios.md` |

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

### D. Geração e leitura do PDF (`eta-backend-services`)

| Funcionalidade | Prioridade | Situação | Referência |
|---|---|---|---|
| Gerar o PDF/A da proposição com `documento-articulado.xml` anexo | Essencial | Parcial (o serviço gera PDF de emenda e de parecer; falta confirmar a proposição e o PDF/A) | `eta-backend-services/README.md` |
| Recuperar os dados (`documento-articulado.xml`) a partir do PDF | Essencial | Parcial (o serviço recupera o JSON de emenda e de parecer; idem) | `eta-backend-services/README.md` |
| Converter LexML XML em jsonix e vice-versa | Essencial | Implementado | `jsonix-lexml` |

### E. Funcionalidades da aplicação (LexEdit e Infoleg Editor)

Mesmo quando duplicadas, cada aplicação tem sua própria situação. O repositório de documentos já existe nos editores e não é escopo do `lexml-eta`.

| Funcionalidade | Prioridade | LexEdit | Infoleg Editor | Referência |
|---|---|---|---|---|
| Abrir a proposição (PDF) de um repositório | Essencial | Depende de especificação | Depende de especificação | |
| Salvar a proposição (PDF) em um repositório | Essencial | Depende de especificação | Depende de especificação | |
| Nomear / renomear a proposição no repositório | Desejável | Depende de especificação | Depende de especificação | |
| Excluir a proposição do repositório | Desejável | Depende de especificação | Depende de especificação | |
| Enviar a proposição a terceiros | Desejável | Depende de especificação | Depende de especificação | |
| Enviar a proposição a outra aplicação | Desejável | Depende de especificação | Depende de especificação | |

### F. Transversais

| Funcionalidade | Prioridade | Responsável | Situação | Referência |
|---|---|---|---|---|
| Exportar o texto completo em DOCX, LexML e PDF/A-3 com LexML anexado | Desejável | LexEdit, Infoleg Editor, `eta-backend-services` | Depende de especificação | Requisitos gerais (João Lima) |
| Tamanho de fonte configurável | Desejável | `lexml-eta` | Implementado | `02-opcoes-de-impressao.md` |
| Uso em dispositivos móveis e nos navegadores Chrome, Firefox, Edge e Safari | Essencial | Todos | Depende de especificação | TAP (restrições) |

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

## 5. Pendências de especificação

| # | Pergunta | Área | Casa | Quem decide | O que bloqueia |
|---|---|---|---|---|---|
| 1 | Existem regras para o local no fecho do documento? | B | | | |
| 2 | Tem sentido a configuração de destino do projeto? Talvez apenas para substitutivos. | B | | | |
| 3 | Quais são os tipos de autoria? | B | | | |
| 4 | Será necessária a autoria por comissão (`ColegiadoAutor`)? A especificação existe, mas não há issue. | B, C | | | Autoria por comissão (edição e persistência) |
| 5 | Como tratar a técnica legislativa penal (Pena, Penalidade, Medida Administrativa, Infração), hoje sem tipo no modelo? | A | | | Técnica legislativa penal (essencial) |
| 6 | Quais funcionalidades de abrir, salvar, nomear, excluir e enviar a proposição cada aplicação já oferece? | E | | | |
| 7 | Como serão gerados e lidos o PDF/A da proposição e o `documento-articulado.xml` anexo? Verificar o estado em `eta-backend-services`. | D | | | |
| 8 | Quais regras específicas da Câmara dos Deputados precisam ser levantadas? | Todas | CD | | |

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

## 7. Fora do escopo

Requisitos de referência que foram avaliados e deliberadamente não serão implementados.

| Funcionalidade | Motivo | Referência |
|---|---|---|
| Recategorizar caput de artigo como parágrafo de outro artigo (com tratamento dos demais parágrafos) | Decisão de escopo | Requisitos formais (João Lima) |
| Recategorizar agrupadores (subir ou descer um nível da hierarquia) | Decisão de escopo | Requisitos formais (João Lima) |
| Visão sumária da hierarquia (árvore, com indicação de notas e comentários) | Decisão de escopo | Requisitos formais (João Lima) |
| Gestão de modelos de texto com questionário associado | Decisão de escopo | Requisitos gerais (João Lima) |
| Geração assistida do bloco de alteração a partir do texto da norma | O texto da norma virá do SIGEN | Requisitos gerais e formais (João Lima) |
| Editor de pareceres | Fora do escopo do mapa | `AGENTS.md` |
