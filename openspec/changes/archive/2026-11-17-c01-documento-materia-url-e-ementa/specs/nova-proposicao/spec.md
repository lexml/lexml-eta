# Spec Delta

## MODIFIED Requirements

### Requirement: Apresentação e filtro dos documentos da lista
Cada documento da lista SHALL mostrar o título, a ementa (quando houver), a identificação (`sigla número/ano`, e `siglaComissao` quando houver), o autor com o papel e o tratamento "Dep." e a data de apresentação em DD/MM/AAAA, além de um ícone, quando houver `urlDocumento`, que a abre em outra aba sem selecionar o documento. A ementa SHALL aparecer abaixo do título, limitada a 2 linhas, com o texto completo ao passar o mouse. O ícone SHALL ter o tooltip `tooltipDocumento`, ou "Abrir o documento em outra aba" quando ele estiver ausente ou vazio, e o mesmo texto no `aria-label`. O tratamento "Dep." SHALL ser fixo, independentemente de `indSexoAutor`.

#### Scenario: Linha do documento
- **WHEN** o host devolve um documento com `papelAutor` "Relatora", `nomeAutor` "Fulana", `siglaComissao` "CCJC" e `dataApresentacao` "2025-08-12"
- **THEN** a linha mostra "Relatora: Dep. Fulana" e "12/08/2025"

#### Scenario: Ementa exibida
- **WHEN** o host devolve um documento com `ementa`
- **THEN** a ementa aparece abaixo do título, limitada a 2 linhas, e o texto completo é exibido ao passar o mouse

#### Scenario: Documento sem ementa
- **WHEN** o documento não traz `ementa`
- **THEN** a linha não exibe espaço nem rótulo de ementa

#### Scenario: Inteiro teor
- **WHEN** o usuário aciona o ícone de um documento com `urlDocumento`
- **THEN** `urlDocumento` é aberta em outra aba e a seleção não muda

#### Scenario: Documento sem endereço
- **WHEN** o documento não traz `urlDocumento`
- **THEN** a linha não exibe o ícone

#### Scenario: Tooltip padrão do ícone
- **WHEN** o documento tem `urlDocumento` e não traz `tooltipDocumento`, ou o traz vazio
- **THEN** o tooltip e o `aria-label` do ícone são "Abrir o documento em outra aba"

#### Scenario: Tooltip do host
- **WHEN** o documento tem `urlDocumento` e `tooltipDocumento` "Parecer na íntegra (PDF)"
- **THEN** o tooltip e o `aria-label` do ícone são "Parecer na íntegra (PDF)"

### Requirement: Filtro dos documentos da lista
O campo de filtro SHALL ser textual e genérico, executado no componente sobre todos os dados exibidos de cada documento (inclusive a data e a ementa), sem diferenciar maiúsculas, minúsculas e acentos.

#### Scenario: Filtro por texto
- **WHEN** o usuário digita um trecho do título, do autor, da comissão ou da data exibida
- **THEN** a lista mostra só os documentos que o contêm

#### Scenario: Filtro pela ementa
- **WHEN** o usuário digita um trecho da ementa de um documento
- **THEN** a lista mostra só os documentos cuja ementa o contém

### Requirement: Objeto documento da Tela 2b
Cada documento devolvido pelo host SHALL ter `id` (único), `titulo`, `sigla`, `numero`, `ano` (inteiro, opcional), `textoEstruturadoDisponivel` (verdadeiro quando ausente), `nomeAutor` (sem tratamento), `papelAutor` (já flexionado), `indSexoAutor`, `dataApresentacao` (AAAA-MM-DD) e `siglaComissao` (opcional). Os campos `urlDocumento`, `ementa` e `tooltipDocumento` SHALL ser opcionais, e `urlDocumento` SHALL ser `http(s)` ou relativa para virar link.

#### Scenario: Disponibilidade ausente
- **WHEN** o documento não traz `textoEstruturadoDisponivel`
- **THEN** o texto estruturado é considerado disponível

#### Scenario: Campos opcionais ausentes
- **WHEN** o documento não traz `urlDocumento`, `ementa` nem `tooltipDocumento`
- **THEN** a linha é exibida normalmente, sem ícone e sem ementa

#### Scenario: Endereço que não é http(s)
- **WHEN** `urlDocumento` não é `http(s)` nem relativa
- **THEN** a linha não exibe o ícone
