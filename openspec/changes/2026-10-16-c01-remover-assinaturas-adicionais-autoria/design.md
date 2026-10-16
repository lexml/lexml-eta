## Context

Ver proposal.md. Os campos de quantidade de assinaturas adicionais existem em dois lugares: a classe de domínio `Autoria` (`proposicao.ts`) e o `AutoriaComponent`, que os exibe como dois `sl-input type="number"` e grava a cada `@input` em `this._autoria`. Nenhum outro código de produção os lê: o montador de `lexedit:Autoria`/`AssinaturaTexto` já os ignora, e o leitor os devolve em 0 por construção (`new Autoria()`). Só um teste e dois fixtures de teste os citam.

## Goals / Non-Goals

**Goals:**
- Remover os campos da interface e do modelo, sem alterar o que é salvo ou aberto.

**Non-Goals:**
- Mexer na opção "Imprimir partido e UF" ou em qualquer outro campo da autoria.
- Reescrever os arquivos de planejamento já arquivados (`openspec/changes/archive/`), que registram o histórico.

## Decisions

### 1. Remoção direta, sem período de compatibilidade

Os campos saem de `Autoria` de uma vez. Dados antigos que ainda os tragam (ex.: `Proposicao` persistida pelo host) são tolerados: o setter de `autoria` espalha o objeto recebido (`{ ...value }`), então a propriedade extra apenas acompanha o objeto em memória sem ser lida nem exibida. Não se escreve código de limpeza.
- **Alternativa considerada:** marcar como `@deprecated` por uma versão. Descartada: o valor nunca teve efeito em arquivo nem em impressão, então não há comportamento a preservar.

### 2. CSS

`.assinaturas-adicionais` continua sendo usada pelo bloco do checkbox "Imprimir partido e UF". As regras `.assinaturas-adicionais .autoria-input` (alvo dos dois inputs removidos) devem ser removidas se nenhum outro elemento da autoria usar essa combinação; o `.autoria-input` do campo Cargo não está dentro de `.assinaturas-adicionais`. Renomear a classe fica fora do escopo.

### 3. Fixtures

`test/assets/altera_norma_trava_editor.{ts,json}` perdem as duas propriedades, para o objeto continuar compatível com o tipo `Autoria` (propriedade excedente em literal tipado falharia na compilação).

## Risks / Trade-offs

- **[Risco] Consumidor externo tipado** (host Angular/Java) que atribui esses campos a `Autoria` deixa de compilar/serializar. → Registrar como **BREAKING** na proposta e confirmar com o host antes de publicar.
- **[Risco] Sobra de código morto** (seletor CSS, import, tratador). → Verificar com `grep` no fim e rodar `npm run lint`.
